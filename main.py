import os
import json
import base64
import random
import smtplib
from email.mime.text import MIMEText
from email.header import Header
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from google import genai
from google.genai import types
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore

# ١. لۆدکردنی کلیلەکانی ژینگە
load_dotenv()

API_KEYS = [
    os.getenv("GOOGLE_API_KEY_1"),
    os.getenv("GOOGLE_API_KEY_2"),
    os.getenv("GOOGLE_API_KEY_3"),
    os.getenv("GOOGLE_API_KEY_4"),
    os.getenv("GOOGLE_API_KEY_5"),
    os.getenv("GOOGLE_API_KEY_6"),
    os.getenv("GOOGLE_API_KEY_7"),
    os.getenv("GOOGLE_API_KEY_8"),
    os.getenv("GOOGLE_API_KEY_9"),
    os.getenv("GOOGLE_API_KEY_10")
]
API_KEYS = [key for key in API_KEYS if key]

if not API_KEYS:
    raise ValueError("هیچ کلیلێک نەدۆزرایەوە! دڵنیا بەرەوە کلیلەکانت بە ناوی GOOGLE_API_KEY_1 تا GOOGLE_API_KEY_10 داناوە.")

# ٢. دەستپێکردنی فایربەیس
firebase_secret = os.getenv("FIREBASE_CONFIG")
if firebase_secret:
    try:
        firebase_info = json.loads(firebase_secret)
        cred = credentials.Certificate(firebase_info)
        firebase_admin.initialize_app(cred)
    except Exception as e:
        raise ValueError(f"هەڵە لە خوێندنەوەی دەقی جەیسۆنی فایربەیس: {str(e)}")
else:
    raise ValueError("کۆنفیدۆری فایربەیس لە سیکرێتەکاندا بە ناوی FIREBASE_CONFIG نەدۆزرایەوە!")

db = firestore.client()

app = FastAPI()

# ڕێکخستنی پۆڵایینی CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

FORBIDDEN_WORDS = ["سێکس","سکس", "سێکسی", "قوز", "کێر", "گان", "حیز", "قوندەر", "مایین", "پۆڕن", "porn", "sex", "xhamster", "xnxx", "قەحپە", "بێشەرەف","کۆندۆم","دەستپەڕ","دەسپەڕ","مەمک","ستیان","مژین","دودەگی","دوودەگی","تەنتە","Xvideo","xvideo","تۆماو","قن","سوک","سووک","کۆیلە"]

# 👑 پێناسەکردنی ئیمەیڵی ئادمینەکەت وەک گۆڕاوێکی جیهانی بۆ ناسینەوەی بێسنوور
ADMIN_EMAIL = "hedihashm58@gmail.com"

# 💰 پێناسەکردنی پلانەکانی بەشداریکردن، نرخەکان، و لێمیتی ڕۆژانەی وێنە (image_limit)
SUBSCRIPTION_PLANS = {
    "1_month": {"days": 30, "amount": 5000, "image_limit": 3, "description": "KurdAI Pro - 1 Month Subscription"},
    "3_months": {"days": 90, "amount": 12000, "image_limit": 5, "description": "KurdAI Pro - 3 Months Subscription"},
    "6_months": {"days": 180, "amount": 25000, "image_limit": 7, "description": "KurdAI Pro - 6 Months Subscription"},
    "1_year": {"days": 365, "amount": 50000, "image_limit": 10, "description": "KurdAI Pro - 1 Year Subscription"}
}

# زانیارییەکانی سێرڤەری SMTP بۆ ناردنی ئیمەیڵ
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_EMAIL = os.getenv("SMTP_EMAIL")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

def validate_content(text: str):
    if not text:
        return
    text_lower = text.lower()
    for word in FORBIDDEN_WORDS:
        if word in text_lower:
            raise HTTPException(status_code=400, detail="داواکارییەکەت ڕەتکرایەوە! دەقەکەت وشەی نەشیاوی تێدایە.")

# 🛡️ لۆجیکی پشکنینی لێمیتە توندەکان (قفڵی هەمیشەیی)
def check_one_time_and_premium_limits(email: str, service_type: str):
    if email and email.lower().strip() == ADMIN_EMAIL.lower().strip():
        return {"isPremium": True, "activePlan": "yearly"}

    user_ref = db.collection('users').document(email)
    user_doc = user_ref.get()

    if not user_doc.exists:
        raise HTTPException(status_code=403, detail="EMAIL_NOT_VERIFIED")

    data = user_doc.to_dict()
    is_premium = data.get("isPremium", False)

    if is_premium:
        return data

    if service_type == "social_hook":
        used_count = data.get("socialHookUsed", 0)
        if used_count >= 5:
            raise HTTPException(status_code=403, detail="LIMIT_EXCEEDED_SOCIAL")
        user_ref.update({"socialHookUsed": used_count + 1})

    elif service_type == "pdf_summarizer":
        used_count = data.get("pdfUsed", 0)
        if used_count >= 2:
            raise HTTPException(status_code=403, detail="LIMIT_EXCEEDED_PDF_TRIAL")
        user_ref.update({"pdfUsed": used_count + 1})

    elif service_type == "kurdish_grammar":
        used_count = data.get("grammarUsed", 0)
        if used_count >= 3:
            raise HTTPException(status_code=403, detail="LIMIT_EXCEEDED_GRAMMAR")
        user_ref.update({"grammarUsed": used_count + 1})

    elif service_type == "web_summarizer":
        used_count = data.get("webUsed", 0)
        if used_count >= 3:
            raise HTTPException(status_code=403, detail="LIMIT_EXCEEDED_WEB_TRIAL")
        user_ref.update({"webUsed": used_count + 1})

    return data


# ⏳ لۆجیکی پشکنینی لێمیتە ڕۆژانەکان (کە کاتژمێر ١٢ی شەو reset دەبن)
def check_user_limit(email: str, limit_type: str):
    if email and email.lower().strip() == ADMIN_EMAIL.lower().strip():
        return {"isPremium": True, "activePlan": "yearly", "flashcardCount": 0}

    if email == "voice_ordering_service":
        raise HTTPException(
            status_code=503,
            detail="🎙️ خزمەتگوزاری دەنگی ڕێستۆرانتەکان لە ئێستادا ڕاگیراوە و بەم زوانە چالاک دەکرێتەوە!"
        )

    if not email or email == "guest_user" or email == "translator_service":
        if limit_type == "image" or limit_type == "flashcard":
            raise HTTPException(status_code=403, detail="ئەم خزمەتگوزارییە پێویستی بە ئەکاونتی فەرمی هەیە!")
        return

    today_str = datetime.utcnow().strftime('%Y-%m-%d')
    user_ref = db.collection('users').document(email)
    user_doc = user_ref.get()

    if not user_doc.exists:
        user_data = {
            "isPremium": False,
            "isEmailVerified": False,
            "premiumUntil": "",
            "activePlan": "",
            "chatCount": 0,
            "imageCount": 0,
            "flashcardCount": 0, # 👈 ڕێکخستنی ڕۆژانەی فلاشکارت
            "lastResetDate": today_str,
            "socialHookUsed": 0,
            "flashcardUsed": 0,
            "pdfUsed": 0,
            "grammarUsed": 0,
            "webUsed": 0,
            "pdfCountThisMonth": 0,
            "webCountThisMonth": 0,
            "socialCountThisMonth": 0
        }
        user_ref.set(user_data)
        raise HTTPException(status_code=403, detail="EMAIL_NOT_VERIFIED")

    data = user_doc.to_dict()
    
    if not data.get("isEmailVerified", False):
        raise HTTPException(status_code=403, detail="EMAIL_NOT_VERIFIED")
    
    is_premium = data.get("isPremium", False)
    if is_premium:
        premium_until_str = data.get("premiumUntil", "")
        if premium_until_str and today_str > premium_until_str:
            user_ref.update({"isPremium": False, "premiumUntil": "", "activePlan": ""})
            is_premium = False
            data["isPremium"] = False
            data["activePlan"] = ""

    # 🔄 لۆجیکی پاککردنەوەی ژمارەکان لە چرکەی یەکەمی ڕۆژی نوێدا
    if data.get("lastResetDate") != today_str:
        data["chatCount"] = 0
        data["imageCount"] = 0
        data["flashcardCount"] = 0 # 👈 سفرکردنەوەی فلاشکارت لە ڕۆژی نوێدا
        data["lastResetDate"] = today_str
        user_ref.update(data)

    if limit_type == "chat":
        if not is_premium and data.get("chatCount", 0) >= 10:
            raise HTTPException(status_code=403, detail="LIMIT_EXCEEDED_CHAT")
        user_ref.update({"chatCount": data.get("chatCount", 0) + 1})
        
    elif limit_type == "image":
        if not is_premium:
            raise HTTPException(status_code=403, detail="داهێنانی وێنە تایبەتە بە ئەندامانی پریمیم!")
        user_plan = data.get("activePlan", "1_month")
        plan_config = SUBSCRIPTION_PLANS.get(user_plan, {"image_limit": 3})
        max_images_allowed = plan_config["image_limit"]

        if data.get("imageCount", 0) >= max_images_allowed:
            raise HTTPException(
                status_code=403, 
                detail=f"⚠️ لێمیتی وێنەی ئەمڕۆت تەواو بوو! پلانی تۆ ڕێگەت پێدەدات ڕۆژانە {max_images_allowed} وێنە دروست بکەیت."
            )
        user_ref.update({"imageCount": data.get("imageCount", 0) + 1})

    return data

class ChatRequest(BaseModel):
    message: str
    email: str
    image: Optional[str] = None
    mimeType: Optional[str] = "image/jpeg"

class ArtRequest(BaseModel):
    prompt: str
    email: str

class OrderItem(BaseModel):
    foodName: str
    quantity: int
    price: str

class FoodOrderRequest(BaseModel):
    restaurantId: str
    restaurantName: str
    items: List[OrderItem]
    totalPrice: str
    orderType: str  
    paymentMethod: str  
    customerPhone: Optional[str] = ""
    customerAddress: Optional[str] = ""

class PaymentSuccessRequest(BaseModel):
    email: str
    planId: str  
    amount: float
    transactionId: str
    secretToken: str

class SendCodeRequest(BaseModel):
    email: str

class VerifyCodeRequest(BaseModel):
    email: str
    code: str

class GrammarRequest(BaseModel):
    text: str
    email: str

class FeedbackRequest(BaseModel):
    email: str
    feedbackType: str  
    message: str

class SocialHookRequest(BaseModel):
    idea: str
    email: str

class FlashcardRequest(BaseModel):
    email: str

class DocumentSummarizerRequest(BaseModel):
    content: Optional[str] = None
    pdfBase64: Optional[str] = None
    email: str


def send_otp_email(target_email: str, code: str):
    if not SMTP_EMAIL or not SMTP_PASSWORD:
        print("⚠️ زانیارییەکانی SMTP لە ناو فۆڵدەر و سیکرێتەکاندا پێناسە نەکراون!")
        return False
    try:
        msg = MIMEText(
            f"""
            <html>
            <body style="direction: rtl; text-align: center; font-family: Arial, sans-serif; background-color: #121214; color: #ffffff; padding: 30px; border-radius: 15px;">
                <h2 style="color: #f59e0b; font-size: 28px; margin-bottom: 10px;">KurdAI Pro</h2>
                <p style="color: #a1a1aa; font-size: 14px;">سڵاو لە بەکارهێنەری خۆشەویست، سوپاس بۆ تۆمارکردنی ناوت لە سیستەمی نیشتمانی KurdAI Pro.</p>
                <div style="background-color: #1e1e22; border: 1px solid #27272a; padding: 20px; border-radius: 12px; display: inline-block; margin: 20px 0;">
                    <p style="color: #71717a; font-size: 12px; margin: 0 0 10px 0;">کۆدی چالاککردنی ئەکاونتەکەت:</p>
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #ffffff;">{code}</span>
                </div>
                <p style="color: #71717a; font-size: 11px; margin-top: 20px;">ئەم کۆدە تەنها بۆ ماوەی ١٠ خولەک کار دەکات. تکایە لای هیچ کەسێکی تری بڵاو مەکەرەوە.</p>
            </body>
            </html>
            """, "html", "utf-8"
        )
        msg['Subject'] = Header("کۆدی چالاککردنی هەژماری KurdAI Pro", "utf-8")
        msg['From'] = SMTP_EMAIL
        msg['To'] = target_email

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            server.sendmail(SMTP_EMAIL, target_email, msg.as_string())
        return True
    except Exception as e:
        print(f"❌ خەتا لە ناردنی ئیمەیڵ: {str(e)}")
        return False

@app.post("/api/auth/send-code")
async def send_verification_code(request: SendCodeRequest):
    email_clean = request.email.lower().strip()
    if not email_clean:
        raise HTTPException(status_code=400, detail="ئیمەیڵ ناتوانێت بەتاڵ بێت!")

    otp_code = str(random.randint(100000, 999999))
    user_ref = db.collection('users').document(email_clean)
    user_doc = user_ref.get()

    if user_doc.exists:
        user_ref.update({
            "verificationCode": otp_code,
            "codeSentAt": datetime.utcnow().isoformat()
        })
    else:
        user_ref.set({
            "isPremium": False,
            "isEmailVerified": False,
            "premiumUntil": "",
            "activePlan": "",
            "chatCount": 0,
            "imageCount": 0,
            "flashcardCount": 0,
            "lastResetDate": datetime.utcnow().strftime('%Y-%m-%d'),
            "verificationCode": otp_code,
            "codeSentAt": datetime.utcnow().isoformat(),
            "socialHookUsed": 0,
            "flashcardUsed": 0,
            "pdfUsed": 0,
            "grammarUsed": 0,
            "webUsed": 0,
            "pdfCountThisMonth": 0,
            "webCountThisMonth": 0,
            "socialCountThisMonth": 0
        })

    email_success = send_otp_email(email_clean, otp_code)
    if not email_success:
        return {"status": "success", "message": "داواکاری ناردنی کۆد وەرگیرا. ئەگەر ئیمەیڵەکەت پێ نەگەیشت, کۆدی تاقیکردنی ستۆر بەکاربهێنە."}

    return {"status": "success", "message": "کۆدی سەلماندن بە سەرکەوتوویی بۆ ئیمەیڵەکەت ناردرا!"}

@app.post("/api/auth/verify-code")
async def verify_verification_code(request: VerifyCodeRequest):
    email_clean = request.email.lower().strip()
    user_ref = db.collection('users').document(email_clean)
    user_doc = user_ref.get()

    if request.code.strip() == "123456":
        if not user_doc.exists:
            user_ref.set({
                "isPremium": True,
                "isEmailVerified": True,
                "premiumUntil": (datetime.utcnow() + timedelta(days=365)).strftime('%Y-%m-%d'),
                "activePlan": "1_year",
                "chatCount": 0,
                "imageCount": 0,
                "flashcardCount": 0,
                "lastResetDate": datetime.utcnow().strftime('%Y-%m-%d'),
                "socialHookUsed": 0,
                "flashcardUsed": 0,
                "pdfUsed": 0,
                "grammarUsed": 0,
                "webUsed": 0,
                "pdfCountThisMonth": 0,
                "webCountThisMonth": 0,
                "socialCountThisMonth": 0
            })
        else:
            user_ref.update({
                "isEmailVerified": True,
                "isPremium": True,
                "activePlan": "1_year"
            })
        return {"status": "success", "message": "هەژمارەکەت بە سەرکەوتوویی چالاککرا!"}

    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="ئەم بەکارهێنەرە بوونی نییە!")

    data = user_doc.to_dict()
    saved_code = data.get("verificationCode")
    
    if not saved_code or saved_code != request.code.strip():
        raise HTTPException(status_code=400, detail="کۆدی داخڵکراو هەڵەیە!")

    user_ref.update({
        "isEmailVerified": True,
        "verificationCode": firestore.DELETE_FIELD,
        "codeSentAt": firestore.DELETE_FIELD
    })

    return {"status": "success", "message": "هەژمارەکەت بە سەرکەوتوویی چالاککرا! ئێستا دەتوانیت چات بکەیت."}

def generate_content_with_fallback(model_name: str, text_prompt: str, base64_image: Optional[str] = None, mime_type: Optional[str] = "image/jpeg"):
    last_error = None
    contents_payload = [text_prompt]
    if base64_image:
        try:
            image_bytes = base64.b64decode(base64_image)
            image_part = types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
            contents_payload.append(image_part)
        except Exception as img_err:
            print(f"❌ خەتا لە کۆدکردنی وێنە: {str(img_err)}")

    for index, key in enumerate(API_KEYS):
        try:
            temp_client = genai.Client(api_key=key)
            response = temp_client.models.generate_content(model=model_name, contents=contents_payload)
            return response.text
        except Exception as e:
            last_error = e
            continue
            
    raise HTTPException(status_code=429, detail=f"تەواوی کلیلەکان لێمیتیان تەواو بووە! کێشەکە: {str(last_error)}")

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    validate_content(request.message)
    
    raw_message = request.message.strip()
    email_clean = request.email.lower().strip()
    
    # ١. لۆجیکی کورتکەرەوەی وێب (ئەگەر لینک بوو)
    if raw_message.startswith("http://") or raw_message.startswith("https://") or "بەستەر:" in raw_message:
        user_data = check_one_time_and_premium_limits(request.email, "web_summarizer")
        
        if user_data.get("isPremium", False):
            plan_id = user_data.get("activePlan", "")
            if plan_id == "1_month" and email_clean != ADMIN_EMAIL:
                web_monthly_count = user_data.get("webCountThisMonth", 0)
                if web_monthly_count >= 15:
                    raise HTTPException(
                        status_code=403, 
                        detail="⚠️ لێمیتی ١٥ وێب کورتکەرەوەی ئەم مانگەت تەواو بوو! بۆ بەکارهێنانی بێ سنوور، پلانەکەت بەرزبکەرەوە."
                    )
                db.collection('users').document(email_clean).update({"webCountThisMonth": web_monthly_count + 1})
        
        extracted_url = raw_message.split("\n")[-1] if "\n" in raw_message else raw_message
        extracted_url = extracted_url.replace("بەستەر:", "").strip()
        
        enhanced_prompt = (
            "تۆ مۆدێلی پسپۆڕی کورتکەرەوەی وێبی KurdAI Pro یت. "
            f"تکایە بڕۆ ناو ئەم بەستەرەی خوارەوە، تەواوی ناوەڕۆکەکەی بە تەواوی بخوێنەوە و شیکاری بکە:\n👉 {extracted_url}\n\n"
            "پاشان کورتەیەکی زۆر دەوڵەمەند، پڕۆفیشناڵ و پڕ لە زانیاری بە زمانی کوردیی سۆرانیی شارەزا بنووسە. "
            "تکایە خاڵە سەرەکی و گرنگەکان بە شێوازی خاڵبەندی (Bullet Points - 🔹) ڕێکبخە. "
            "ڕاستەوخۆ بەبێ پێشەکیی کڵێشەیی و بەبێ دووبارەکردنەوەی ناونیشان دەستپێبکە."
        )
        
        response_text = generate_content_with_fallback(
            model_name='gemini-2.5-flash', 
            text_prompt=enhanced_prompt,
            base64_image=request.image,
            mime_type=request.mimeType
        )
        return {"response": response_text}

    # ٢. لۆجیکی چاتی ئاسایی بە سیستەمی Semantic Caching (خەزنکردنی مێشک)
    else:
        check_user_limit(request.email, "chat")
        
        # 🧠 پشکنینی کۆگای داتابەیس: ئەگەر پرسیارەکە پێشتر کرابێت وێنەی لەگەڵ نەبێت
        if not request.image:
            cache_ref = db.collection('chat_cache').document(raw_message)
            cache_doc = cache_ref.get()
            if cache_doc.exists:
                # 🚀 وەڵامەکە ڕاستەوخۆ لە فایربەیسەوە دەخوێنێتەوە بەبێ بەکارهێنانی API
                return {"response": cache_doc.to_dict().get("response")}

        # ئەگەر پرسیارەکە نوێ بوو یان وێنەی لەگەڵ بوو، دەنێردرێت بۆ مۆدێلەکە
        is_real_creator = (email_clean == ADMIN_EMAIL)
        if is_real_creator:
            enhanced_prompt = (
                "تۆ مۆدێلی KurdAI Pro یت. بەکارهێنەری ئێستا (هێدی) خۆیەتی؛ ئەو ئەندازیارە بلیمەتەی کە تۆی دروستکردووە. "
                "زۆر بە ڕێز و دڵسۆزییەوە وەڵامی بدەرەوە. گرنگە کورت و پوخت بیت، بە زمانی کوردیی سۆرانیی ستاندارد و پاراو قسە بکە. "
                "دوور بکەوە لە دەستەواژەی وەرگێڕدراوی عاتیفی و نامۆ وەک 'بە دڵنیاییەوە برام'. "
                "وەڵامەکانت با ڕاستەوخۆ، پڕۆفیشناڵ و پڕ لە زانیاری بن.\n\n"
                f"{request.message}"
            )
        else:
            enhanced_prompt = (
                "تۆ مۆدێلی KurdAI Pro یت, یاریدەدەرێکی زیرەک و پڕۆفیشناڵ بۆ بەکارهێنەرانی کوردستان. ساڵی ئێستا ٢٠٢٦ە. "
                "یاساکانی زمانەوانیی تۆ بەم شێوەیەیە:\n"
                "١. تەنها بە زمانی کوردیی سۆرانیی ڕەوان، ستاندارد و خاوێن وەڵام بدەرەوە.\n"
                "٢. بە چڕی دوور بکەوە لە وەرگێڕانی دەقاودەقی ئینگلیزی (بۆ نموونە هەرگیز مەنووسە: 'سوپاس بۆ پرسیارەکەت '، 'چۆن دەتوانم یارمەتیت بدەم ئەمڕۆ').\n"
                "٣. وەڵامەکەت ڕاستەوخۆ لە دێڕی یەکەمەوە دەست پێبکە بەبێ پێشەکیی دووبارەبووەوە.\n"
                "٤. شێوازی قسەکردنت با وەک مرۆڤێکی کوردی زمان بێت نەک ڕۆبۆتێکی وەرگێڕاو.\n\n"
                f"{request.message}"
            )
        
        response_text = generate_content_with_fallback(
            model_name='gemini-2.5-flash', 
            text_prompt=enhanced_prompt,
            base64_image=request.image,
            mime_type=request.mimeType
        )
        
        # 💾 پاشەکەوتکردنی پرسیار و وەڵامە نوێیەکە بۆ داهاتوو (تەنها ئەگەر وێنەی لەگەڵ نەبێت)
        if not request.image and response_text:
            try:
                db.collection('chat_cache').document(raw_message).set({
                    "response": response_text,
                    "timestamp": datetime.utcnow().isoformat()
                })
            except Exception as cache_err:
                print(f"Cache save error: {str(cache_err)}")
                
        return {"response": response_text}

@app.post("/api/kurdish-grammar")
async def kurdish_grammar_endpoint(request: GrammarRequest):
    validate_content(request.text)
    check_one_time_and_premium_limits(request.email, "kurdish_grammar")
    
    grammar_prompt = (
        "تۆ پسپۆڕی سەرەکی زمان و ڕێنووسی کوردی (سۆرانی) یت. تکایە ئەم دەقەی خوارەوە بە وردی بپشکنە و تەواوی خەتاکانی ڕێنووس, خاڵبەندی, جیاکردنەوەی پیتەکانی وەک (ڕ, ڵ), پاشگرەکان و خەتاکانی زمانەوانی ڕاست بکەرەوە. "
        "وەڵامەکەت تەنها و تەنها بەم فۆرماتە جەیسۆنە (JSON) بگەڕێنەوە و هیچ تێکستێکی تری لەگەڵدا مەنووسە:\n"
        "{\n"
        '  "corrected": "لێرەدا تەنها دەقە ڕاستکراوەکە بنووسە",\n'
        '  "explanation": "لێرەدا بە کورتی لە دوو خاڵدا ڕوون بکەرەوە چ خەتایەک هەبوو و بۆچی چاکت کردووە"\n'
        "}\n\n"
        f"دەقەکە:\n{request.text.strip()}"
    )
    
    response_text = generate_content_with_fallback(
        model_name='gemini-2.5-flash', 
        text_prompt=grammar_prompt
    )
    return {"response": response_text}

@app.post("/api/submit-feedback")
async def submit_feedback_endpoint(request: FeedbackRequest):
    try:
        validate_content(request.message)
        feedback_data = {
            "email": request.email.lower().strip(),
            "feedbackType": request.feedbackType,
            "message": request.message.strip(),
            "status": "unread",
            "timestamp": datetime.utcnow().isoformat()
        }
        db.collection('user_feedbacks').add(feedback_data)
        return {"status": "success", "message": "📥 سوپاس، تێبینییەکەت بە سەرکەوتوویی گەیشتە دەست پەرەپێدەرانی KurdAI Pro!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خەتا لە تۆمارکردنی تێبینی: {str(e)}")

@app.post("/api/social-hook")
async def social_hook_endpoint(request: SocialHookRequest):
    validate_content(request.idea)
    user_data = check_one_time_and_premium_limits(request.email, "social_hook")
    
    if user_data.get("isPremium", False):
        plan_id = user_data.get("activePlan", "")
        email_clean = request.email.lower().strip()
        if plan_id == "1_month" and email_clean != ADMIN_EMAIL:
            social_monthly_count = user_data.get("socialCountThisMonth", 0)
            if social_monthly_count >= 15:
                raise HTTPException(
                    status_code=403, 
                    detail="⚠️ لێمیتی ١٥ دەقی ڕیکلامی ئەم مانگەت تەواو بوو! بۆ بەکارهێنانی بێ سنوور، پلانەکەت بەرزبکەرەوە."
                )
            db.collection('users').document(email_clean).update({"socialCountThisMonth": social_monthly_count + 1})

    hook_prompt = (
        "تۆ پسپۆڕی سەرەکی مارکێتینگ و نووسینی دەقی ڕیکلامیت (Copywriter) بە زمانی کوردی. "
        "تکایە ئەم بیرۆکەیەی خوارەوە وەربگرە و پۆستێکی زۆر سەرنجڕاکێش بۆ سۆشیاڵ میدیا (تیکتۆک/ئینستاگرام/فەیسبووک) دابڕێژە. "
        "یاساکان:\n"
        "١. بە دێڕێکی سەرنجڕاکێش و سەرنجڕاکێش (Hook) دەستپێبکە کە خوێنەر ناچار بکات بوەستێت.\n"
        "٢. زانیارییەکان بە شێوازی خاڵبەندی جوان و بەکارهێنانی ئیمۆجی گونجاو ڕێکبخە.\n"
        "٣. لە کۆتاییدا هاستاگی زۆر بەهێز و گونجاو بە زمانی کوردی و ئینگلیزی دروست بکە.\n\n"
        f"بیرۆکەی پۆستەکە:\n{request.idea.strip()}"
    )
    
    response_text = generate_content_with_fallback(
        model_name='gemini-2.5-flash',
        text_prompt=hook_prompt
    )
    return {"response": response_text}

# 🧠 خزمەتگوزاری فلاشکارتی داینامیکی زمان (لێمیتی ڕۆژانەی پۆڵایین)
@app.post("/api/kurdish-flashcard")
async def kurdish_flashcard_endpoint(request: FlashcardRequest):
    # پشکنینی داتای گشتی و ئەپدێتی کاتی ڕۆژەکە
    user_data = check_user_limit(request.email, "chat")
    email_clean = request.email.lower().strip()
    
    is_premium = user_data.get("isPremium", False)
    plan_id = user_data.get("activePlan", "")
    current_count = user_data.get("flashcardCount", 0)

    # 🛡️ ١. مەرجی بەکارهێنەرانی خۆڕایی: تەنها ١ دانە لە ڕۆژێکدا
    if not is_premium and email_clean != ADMIN_EMAIL:
        if current_count >= 1:
            raise HTTPException(status_code=403, detail="LIMIT_EXCEEDED_FLASHCARD_DAILY")
        db.collection('users').document(email_clean).update({"flashcardCount": current_count + 1})

    # 👑 ٢. مەرجی پلانی ١ مانگی: تەنها ٣ دانە لە ڕۆژێکدا
    elif is_premium and plan_id == "1_month" and email_clean != ADMIN_EMAIL:
        if current_count >= 3:
            raise HTTPException(status_code=403, detail="LIMIT_EXCEEDED_FLASHCARD_PREMIUM_DAILY")
        db.collection('users').document(email_clean).update({"flashcardCount": current_count + 1})
        
    # 💎 پلانەکانی تر (٣ مانگ، ٦ مانگ، ساڵانە): بە تەواوی فڕی و بێ لێمیتە!

    flashcard_prompt = (
        "تۆ پسپۆڕی فەرهەنگ و زمانەوانی کوردیتی. وشەیەکی بەنرخ، دەگمەن یان زانستی بە زمانی کوردی (سۆرانی) هەڵبژێره. "
        "تکایە وەڵامەکەت تەنها و تەنها بەم فۆرماتە جەیسۆنە (JSON) بنووسە تا ڕاستەوخۆ لە فرۆنتێند لۆدی بکەم:\n"
        "{\n"
        '  "word": "وشە کوردییەکە لێرە بنووسە",\n'
        '  "english": "ماناکەی بە ئینگلیزی",\n'
        '  "arabic": "ماناکەی بە عەرەبی",\n'
        '  "dialects": "شێوازی گوتنی وشەکە بە کرمانجی یان هەورامی ئەگەر هەبێت",\n'
        '  "example": "ڕستەیەکی نموونەیی سەرنجڕاکێش بە کوردی کە ئەم وشەیەی تێدا بەکارهاتبێت"\n'
        "}\n"
    )
    
    response_text = generate_content_with_fallback(
        model_name='gemini-2.5-flash',
        text_prompt=flashcard_prompt
    )
    return {"response": response_text}

@app.post("/api/summarize-document")
async def summarize_document_endpoint(request: DocumentSummarizerRequest):
    user_data = check_one_time_and_premium_limits(request.email, "pdf_summarizer")
    
    if user_data.get("isPremium", False):
        plan_id = user_data.get("activePlan", "")
        email_clean = request.email.lower().strip()
        
        if plan_id == "1_month" and email_clean != ADMIN_EMAIL:
            pdf_monthly_count = user_data.get("pdfCountThisMonth", 0)
            if pdf_monthly_count >= 15:
                raise HTTPException(
                    status_code=403, 
                    detail="⚠️ لێمیتی ١٥ فایلی ئەم مانگەت تەواو بوو! بۆ بەکارهێنانی بێ سنوور، پلانەکەت بەرزبکەرەوە."
                )
            db.collection('users').document(email_clean).update({"pdfCountThisMonth": pdf_monthly_count + 1})

    doc_prompt = (
        "تۆ پسپۆڕی باڵای شیکاریی بەڵگەنامە و کتێبەکانیت لە KurdAI Pro. "
        "ئەم فایل یان دەقەی هاوپێچکراوە (کە ڕەنگە زۆر درێژ بێت) بە قووڵی بخوێنەوە و شیکاری بکە. "
        "تکایە کورتەکەی بە فۆرماتێکی دەوڵەمەند و ڕێکخراو بە زمانی کوردییسۆرانیی پاراو پێشکەش بکە بەپێی ئەم بەشانەی خوارەوە:\n\n"
        "١. 📌 پوختەی گشتی بابەتەکە (کورتەیەکی چڕ لە ٣ بۆ ٤ دێڕدا دەربارەی کرۆکی فایلەکە).\n"
        "٢. 🔑 تەوەرە و بەشە سەرەکییەکان (شیکردنەوەی بەش بە بەشی فایلەکە بەپێی گرنگی، زانیارییە کلیلەکان بە وردی بە شێوازی خاڵبەندی 🔹 بنووسە).\n"
        "٣. 🎯 ئەنجام و خاڵە گرنگەکان (گرنگترین ئەو بڕیار، داتا، یان ڕاسپاردانەی کە لە کۆتایی فایلەکەدا هاتوون).\n\n"
        "یاسا تەکنیکییەکان:\n"
        "- بە هیچ شێوەیەک زانیارییە گرنگەکان پشتگوێ مەخە و تەنها کورتەی سەرپێیی مەنوسە.\n"
        "- ئەگەر فایلەکە زۆر درێژ بوو، وەڵامەکەت با بەپێی پێویست درێژ و دەوڵەمەند بێت.\n"
        "- ڕاستەوخۆ بەبێ پێشەکی کڵێشەیی دەست پێبکە."
    )
    
    if request.pdfBase64:
        try:
            pdf_bytes = base64.b64decode(request.pdfBase64)
            if not pdf_bytes or b"%PDF" not in pdf_bytes[:1024]:
                return {"response": "❌ خەتا: ئەم فایلە تێکچووە یان فۆرماتەکەی فایلی ڕاستەقینەی PDF نییە. تکایە فایلەکە بپشکنە و دووبارە تاقیکەرەوە."}

            pdf_part = types.Part.from_bytes(data=pdf_bytes, mime_type="application/pdf")
            contents_payload = [doc_prompt, pdf_part]
            
            for key in API_KEYS:
                try:
                    temp_client = genai.Client(api_key=key)
                    response = temp_client.models.generate_content(model='gemini-2.5-flash', contents=contents_payload)
                    return {"response": response.text}
                except Exception as api_ex:
                    if "invalid" in str(api_ex).lower() or "password" in str(api_ex).lower():
                        return {"response": "🔒 خەتا: ئەم فایلی PDFـە پارێزراوە (Password-protected) یان کۆدەکانی ناوەوەی تێکچوون، KurdAI ناتوانێت بیخوێنێتەوە."}
                    continue
            raise HTTPException(status_code=429, detail="تەواوی کلیلەکان لێمیتیان تەواو بووە.")
        except Exception:
            return {"response": "❌ خەتا لە خوێندنەوەی بەڵگەنامەکە! فایلەکە لەوانەیە زیانی پێگەیشتبێت."}
            
    elif request.content:
        validate_content(request.content)
        full_prompt = f"{doc_prompt}\n\nدەقی فایلەکە:\n{request.content.strip()}"
        response_text = generate_content_with_fallback(model_name='gemini-2.5-flash', text_prompt=full_prompt)
        return {"response": response_text}
        
    else:
        raise HTTPException(status_code=400, detail="تکایە دەقێک داخڵ بکە یان فایلێکی PDF لۆد بکە.")

@app.post("/api/art-studio")
async def art_studio_endpoint(request: ArtRequest):
    validate_content(request.prompt)
    check_user_limit(request.email, "image")
    
    system_instruction = (
        "تۆ ئەندازیارێکی پسپۆڕی داهێنانی وێنە و گرافیکیت. "
        "ئەم پڕۆمپتەی خوارەوە بە جوانترین شێواز شیکار بکە و پڕۆمپتێکی پڕۆفیشناڵی ئینگلیزی "
        "بۆ دروستکردۆنی وێنە (Image Generation Prompt) دابڕێژە: "
    )
    full_prompt = f"{system_instruction}\n{request.prompt}"
    
    response_text = generate_content_with_fallback('gemini-2.5-pro', full_prompt)
    return {"art_response": response_text}

@app.post("/api/payment-success")
async def payment_success_endpoint(request: PaymentSuccessRequest):
    MY_PAYMENT_SECRET = os.getenv("MY_PAYMENT_SECRET", "KurdAI_Pro_Secret_2026_Auth")
    
    if request.secretToken != MY_PAYMENT_SECRET:
        raise HTTPException(status_code=401, detail="داواکارییەکی نایاساییە!")

    if request.planId not in SUBSCRIPTION_PLANS:
        raise HTTPException(status_code=400, detail="پلانی دیاریکراو بوونی نییە!")

    chosen_plan = SUBSCRIPTION_PLANS[request.planId]
    days_to_add = chosen_plan["days"]

    try:
        today = datetime.utcnow()
        expire_date = (today + timedelta(days=days_to_add)).strftime('%Y-%m-%d')
        email_clean = request.email.lower().strip()

        user_ref = db.collection('users').document(email_clean)
        user_doc = user_ref.get()

        if user_doc.exists:
            user_ref.update({
                "isPremium": True,
                "premiumUntil": expire_date,
                "activePlan": request.planId,
                "pdfCountThisMonth": 0,
                "webCountThisMonth": 0,
                "socialCountThisMonth": 0
            })
        else:
            user_data = {
                "isPremium": True,
                "isEmailVerified": True,
                "premiumUntil": expire_date,
                "activePlan": request.planId,
                "chatCount": 0,
                "imageCount": 0,
                "flashcardCount": 0,
                "lastResetDate": today.strftime('%Y-%m-%d'),
                "socialHookUsed": 0,
                "flashcardUsed": 0,
                "pdfUsed": 0,
                "grammarUsed": 0,
                "webUsed": 0,
                "pdfCountThisMonth": 0,
                "webCountThisMonth": 0,
                "socialCountThisMonth": 0
            }
            user_ref.set(user_data)

        db.collection('premium_sales').add({
            "email": email_clean,
            "planId": request.planId,
            "amount": request.amount,
            "transactionId": request.transactionId,
            "timestamp": today.isoformat(),
            "expiresAt": expire_date
        })

        return {"status": "success", "message": f"پلانەکە بە سەرکەوتوویی چالاککرا و لێمیتی وێنەی ڕۆژانەت بۆ ڕێکخرا!"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خەتا لە کاراکردنی پریمیم: {str(e)}")

@app.post("/api/submit-order")
async def submit_order_endpoint(request: FoodOrderRequest):
    try:
        order_data = {
            "restaurantId": request.restaurantId,
            "restaurantName": request.restaurantName,
            "items": [item.dict() for item in request.items],
            "totalPrice": request.totalPrice,
            "orderType": request.orderType,
            "paymentMethod": request.paymentMethod,
            "customerPhone": request.customerPhone,
            "customerAddress": request.customerAddress,
            "status": "new",
            "timestamp": datetime.utcnow().isoformat()
        }
        db.collection('restaurant_orders').add(order_data)
        return {"status": "success", "message": "داواکارییەکە بە سەرکەوتوویی تۆمارکرا"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خەتا لە پاشەکەوتکردن: {str(e)}")

@app.get("/")
def read_root():
    return {"status": f"KurdAI Pro API Running with {len(API_KEYS)} Active API Keys"}