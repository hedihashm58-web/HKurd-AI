import os
import json
import base64
import random
import smtplib
import requests
from email.mime.text import MIMEText
from email.header import Header
from datetime import datetime, timedelta
from io import BytesIO
try:
    import edge_tts  # type: ignore
except ImportError:
    edge_tts = None
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from google import genai
from google.genai import types
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore, auth as firebase_auth, messaging

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
    os.getenv("GOOGLE_API_KEY_10"),
    os.getenv("VITE_GOOGLE_API_KEY"),
    os.getenv("VITE_GEMINI_API_KEY"),
    os.getenv("GEMINI_API_KEY")
]
API_KEYS = [key for key in API_KEYS if key]
if not API_KEYS:
    API_KEYS = ["DEMO_KEY"]

# ٢. دەستپێکردنی فایربەیس
db = None
firebase_secret = os.getenv("FIREBASE_CONFIG")
if firebase_secret:
    try:
        firebase_info = json.loads(firebase_secret)
        cred = credentials.Certificate(firebase_info)
        firebase_admin.initialize_app(cred)
        db = firestore.client()
    except Exception as e:
        pass
else:
    pass

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

ADMIN_EMAIL = "hedihashm58@gmail.com"

SUBSCRIPTION_PLANS = {
    "1_month": {"days": 30, "amount": 5000, "image_limit": 3, "description": "KurdAI Pro - 1 Month Subscription"},
    "3_months": {"days": 90, "amount": 12000, "image_limit": 5, "description": "KurdAI Pro - 3 Months Subscription"},
    "6_months": {"days": 180, "amount": 25000, "image_limit": 7, "description": "KurdAI Pro - 6 Months Subscription"},
    "1_year": {"days": 365, "amount": 50000, "image_limit": 10, "description": "KurdAI Pro - 1 Year Subscription"}
}

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_EMAIL = os.getenv("SMTP_EMAIL")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

# 👑 سیستەمی دژە سپام (Rate Limiting)
user_request_timestamps = {}

def check_rate_limit(email: str):
    if email and email.lower().strip() == ADMIN_EMAIL.lower().strip():
        return
    
    current_time = datetime.utcnow()
    if email not in user_request_timestamps:
        user_request_timestamps[email] = []
        
    user_request_timestamps[email] = [t for t in user_request_timestamps[email] if current_time - t < timedelta(minutes=1)]
    
    if len(user_request_timestamps[email]) >= 2:
        raise HTTPException(status_code=429, detail="⚠️ تکایە کەمێک لەسەرخۆ بە! ناتوانیت لە خولەکێکدا زیاتر لە ٢ نامە بنێریت.")
        
    user_request_timestamps[email].append(current_time)

# 👑 فۆنکشنی پشکنینی ئایپی (IP Geolocation)
def check_ip_geolocation(fastapi_request: Request):
    client_ip = fastapi_request.headers.get("x-forwarded-for")
    if client_ip:
        client_ip = client_ip.split(",")[0].strip()
    else:
        client_ip = fastapi_request.client.host

    if client_ip in ["127.0.0.1", "localhost", "::1"]:
        return

    try:
        response = requests.get(f"http://ip-api.com/json/{client_ip}", timeout=3).json()
        if response.get("status") == "success":
            country_code = response.get("countryCode")
            if country_code != "IQ":
                raise HTTPException(
                    status_code=403, 
                    detail="⚠️ ببوورە، بەکارهێنانی وەشانی خۆڕایی تەنها بۆ ناوخۆی کوردستان و عێراق ڕێگەپێدراوە! بۆ بەکارهێنان لە دەرەوەی وڵات، پێویستە ببیتە ئەندامی Premium."
                )
    except requests.RequestException:
        pass

def validate_content(text: str):
    if not text:
        return
    text_lower = text.lower()
    for word in FORBIDDEN_WORDS:
        if word in text_lower:
            raise HTTPException(status_code=400, detail="داواکارییەکەت ڕەتکرایەوە! دەقەکەت وشەی نەشیاوی تێدایە.")

def check_one_time_and_premium_limits(email: str, service_type: str, fastapi_request: Optional[Request] = None):
    if email and email.lower().strip() == ADMIN_EMAIL.lower().strip():
        return {"isPremium": True, "activePlan": "yearly"}

    user_ref = db.collection('users').document(email)
    user_doc = user_ref.get()

    is_user_premium = False
    if user_doc.exists:
        data = user_doc.to_dict()
        is_user_premium = data.get("isPremium", False)

    if not is_user_premium and fastapi_request:
        check_ip_geolocation(fastapi_request)

    if not user_doc.exists:
        return {"isPremium": False, "isEmailVerified": True}

    data = user_doc.to_dict()
    # 👑 چاککردنی خەتای دێڕی ١٥٤: گۆڕینی ناوی گۆڕاوەکە بۆ ناوی ڕاستی خۆی
    if is_user_premium:
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

def check_user_limit(email: str, limit_type: str, fastapi_request: Optional[Request] = None):
    if email and email.lower().strip() == ADMIN_EMAIL.lower().strip():
        return {"isPremium": True, "activePlan": "yearly", "flashcardCount": 0}

    if not email or email == "guest_user" or email == "translator_service":
        if limit_type == "image" or limit_type == "flashcard":
            raise HTTPException(status_code=403, detail="ئەم خزمەتگوزارییە پێویستی بە ئەکاونتی فەرمی هەیە!")
        return

    today_str = datetime.utcnow().strftime('%Y-%m-%d')
    user_ref = db.collection('users').document(email)
    user_doc = user_ref.get()

    is_user_premium = False
    if user_doc.exists:
        is_user_premium = user_doc.to_dict().get("isPremium", False)

    if not is_user_premium and fastapi_request:
        check_ip_geolocation(fastapi_request)

    if not user_doc.exists:
        user_data = {
            "isPremium": False,
            "isEmailVerified": True,
            "premiumUntil": "",
            "activePlan": "",
            "chatCount": 1 if limit_type == "chat" else 0,
            "imageCount": 0,
            "flashcardCount": 1 if limit_type == "flashcard" else 0,
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
        return user_data

    data = user_doc.to_dict()
    
    is_premium = data.get("isPremium", False)
    if is_premium:
        premium_until_str = data.get("premiumUntil", "")
        if premium_until_str and today_str > premium_until_str:
            user_ref.update({"isPremium": False, "premiumUntil": "", "activePlan": ""})
            is_premium = False
            data["isPremium"] = False
            data["activePlan"] = ""

    if data.get("lastResetDate") != today_str:
        data["chatCount"] = 0
        data["imageCount"] = 0
        data["flashcardCount"] = 0
        data["lastResetDate"] = today_str
        user_ref.update(data)

    if limit_type == "chat":
        # Chat is completely free and unlimited for all users (rate limited to 2 messages/min)
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
                detail=f"⚠️ لێمیتی وێنەی ئەمڕۆت تەواو بوو! پلانی تۆ ڕۆژانە {max_images_allowed} وێنە دروست بکەیت."
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

class KidsAIRequest(BaseModel):
    prompt: str
    email: str
    mode: Optional[str] = None

class NamesRequest(BaseModel):
    gender: str
    email: str

class NotificationRequest(BaseModel):
    title: str
    body: str
    tokens: List[str]

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

class GetOrCreateCodeRequest(BaseModel):
    email: str

class DocumentSummarizerRequest(BaseModel):
    content: Optional[str] = None
    pdfBase64: Optional[str] = None
    email: str

def send_otp_email(target_email: str, code: str):
    if not SMTP_EMAIL or not SMTP_PASSWORD:
        print("⚠️ زانیارییەکانی SMTP پێناسە نەکراون!")
        return False
    try:
        msg = MIMEText(
            f"<html><body style='direction: rtl; text-align: center;'><h2>KurdAI Pro</h2><p>کۆدی چالاککردن: <b>{code}</b></p></body></html>", "html", "utf-8"
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

def send_login_code_email(target_email: str, code: str):
    if not SMTP_EMAIL or not SMTP_PASSWORD:
        print("⚠️ زانیارییەکانی SMTP پێناسە نەکراون!")
        return False
    try:
        html_content = f"""
        <html>
        <body style="direction: rtl; text-align: center; font-family: sans-serif; background-color: #f8fafc; padding: 20px;">
            <div style="max-width: 500px; margin: auto; background: white; padding: 30px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border-top: 4px solid #eab308;">
                <h2 style="color: #1e1b4b; margin-bottom: 5px;">KurdAI Pro</h2>
                <p style="color: #64748b; font-size: 13px;">کۆدی چوونەژوورەوەی تایبەتی تۆ بۆ هەمیشە</p>
                <div style="background-color: #fef08a; padding: 15px; border-radius: 12px; font-size: 26px; font-weight: bold; color: #854d0e; letter-spacing: 4px; margin: 20px 0;">
                    {code}
                </div>
                <p style="color: #334155; font-size: 13px; line-height: 1.6;">
                    تکایە ئەم کۆدە بپارێزە! لە کاتی گەڕانەوە یان سڕینەوەی داتای بەرنامەکەدا، دەتوانیت لە ڕێگەی ئەم کۆدەوە بێیتە ژوورەوە و سەرجەم زانیارییەکانت بگەڕێنیتەوە.
                </p>
                <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
                <p style="color: #94a3b8; font-size: 11px;">تیمی KurdAI Pro</p>
            </div>
        </body>
        </html>
        """
        msg = MIMEText(html_content, "html", "utf-8")
        msg['Subject'] = Header("کۆدی چوونەژوورەوەی تایبەتی تۆ - KurdAI Pro", "utf-8")
        msg['From'] = SMTP_EMAIL
        msg['To'] = target_email

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            server.sendmail(SMTP_EMAIL, target_email, msg.as_string())
        return True
    except Exception as e:
        print(f"❌ Error sending login code email: {str(e)}")
        return False


# 👑 فۆنکشنی جێگیری فۆڵبەک بۆ بەشە جەیسۆنییەکان (چاککردنی کێشەی نەبوونی پێناسە)
def generate_content_with_fallback(model_name: str, text_prompt: str, base64_image: Optional[str] = None, mime_type: Optional[str] = "image/jpeg", enable_search: bool = False):
    last_error = None
    contents_payload = [text_prompt]
    if base64_image:
        try:
            if "," in base64_image:
                base64_image = base64_image.split(",", 1)[1]
            image_bytes = base64.b64decode(base64_image)
            image_part = types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
            contents_payload.append(image_part)
        except Exception:
            pass

    config = None
    if enable_search:
        config = types.GenerateContentConfig(
            tools=[types.Tool(google_search=types.GoogleSearch())]
        )

    for key in API_KEYS:
        try:
            temp_client = genai.Client(api_key=key)
            response = temp_client.models.generate_content(model=model_name, contents=contents_payload, config=config)
            return response.text
        except Exception as e:
            last_error = e
            continue
    raise HTTPException(status_code=429, detail=f"تەواوی کلیلەکان لێمیتیان تەواو بووە! {str(last_error)}")

# 👑 لۆجیکی ناردنی وەڵامەکان بە شێوازی ستریم پیت بە پیت
def generate_stream_fallback(model_name: str, text_prompt: str, base64_image: Optional[str] = None, mime_type: Optional[str] = "image/jpeg"):
    contents_payload = [text_prompt]
    if base64_image:
        try:
            if "," in base64_image:
                base64_image = base64_image.split(",", 1)[1]
            image_bytes = base64.b64decode(base64_image)
            image_part = types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
            contents_payload.append(image_part)
        except Exception:
            pass

    for key in API_KEYS:
        try:
            temp_client = genai.Client(api_key=key)
            response_stream = temp_client.models.generate_content_stream(model=model_name, contents=contents_payload)
            for chunk in response_stream:
                if chunk.text:
                    yield chunk.text
            return
        except Exception:
            continue
    yield "⚠️ تەواوی کلیلەکانی API لێمیتیان تەواو بووە یان خەتایەک ڕوویدا."

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
            "isEmailVerified": True,
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

@app.post("/api/auth/get-or-create-code")
async def get_or_create_code_endpoint(request: GetOrCreateCodeRequest):
    email_clean = request.email.lower().strip()
    if not email_clean:
        raise HTTPException(status_code=400, detail="ئیمەیڵ پێویستە")
    
    # Check users collection
    user_ref = db.collection('users').document(email_clean)
    user_doc = user_ref.get()
    
    if user_doc.exists:
        user_data = user_doc.to_dict()
        login_code = user_data.get("loginCode")
        if login_code:
            return {"loginCode": login_code}
    
    # Generate a unique 6-digit code
    for _ in range(10):
        code = str(random.randint(100000, 999999))
        code_ref = db.collection('login_codes').document(code)
        if not code_ref.get().exists:
            # Save mapping code -> email
            db.collection('login_codes').document(code).set({
                "email": email_clean,
                "createdAt": firestore.SERVER_TIMESTAMP
            })
            
            # Update user doc
            if user_doc.exists:
                user_ref.update({
                    "loginCode": code,
                    "landingSeen": False
                })
            else:
                user_ref.set({
                    "email": email_clean,
                    "isPremium": False,
                    "isEmailVerified": True,
                    "premiumUntil": "",
                    "activePlan": "",
                    "chatCount": 0,
                    "imageCount": 0,
                    "flashcardCount": 0,
                    "lastResetDate": datetime.utcnow().strftime('%Y-%m-%d'),
                    "loginCode": code,
                    "landingSeen": False,
                    "socialHookUsed": 0,
                    "flashcardUsed": 0,
                    "pdfUsed": 0,
                    "grammarUsed": 0,
                    "webUsed": 0,
                    "pdfCountThisMonth": 0,
                    "webCountThisMonth": 0,
                    "socialCountThisMonth": 0
                })
            
            # Create Firebase Auth user in background so they can sign in with it later
            try:
                firebase_auth.create_user(
                    email=f"code_{code}@kurdai.pro",
                    password=f"kurdai_pass_{code}"
                )
            except Exception as e:
                print(f"Auth user creation error: {e}")
                
            # Send the login code to user's email
            send_login_code_email(email_clean, code)
                
            return {"loginCode": code}
            
    raise HTTPException(status_code=500, detail="کێشەیەک لە دروستکردنی کۆددا ڕوویدا.")

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

# 👑 ڕاوتی چاتی لایڤ ستریم پیت بە پیت
@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest, fastapi_req: Request):
    check_rate_limit(request.email)
    validate_content(request.message)
    raw_message = request.message.strip()
    email_clean = request.email.lower().strip()
    
    if raw_message.startswith("http://") or raw_message.startswith("https://") or "بەستەر:" in raw_message:
        user_data = check_one_time_and_premium_limits(request.email, "web_summarizer", fastapi_req)
        
        if user_data.get("isPremium", False):
            plan_id = user_data.get("activePlan", "")
            if plan_id == "1_month" and email_clean != ADMIN_EMAIL:
                web_monthly_count = user_data.get("webCountThisMonth", 0)
                if web_monthly_count >= 15:
                    raise HTTPException(
                        status_code=403, 
                        detail="⚠️ لێمیتی ١٥ وێب کورتکەرەوەی ئەم مانگەت تەواو بوو! بۆ بەکارهێنانی بێ سنوور، پلانەکەت بەرزbکەرەوە."
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
        
        response_text = generate_content_with_fallback('gemini-2.5-flash', enhanced_prompt, request.image, request.mimeType, enable_search=True)
        return {"response": response_text}

    else:
        check_user_limit(request.email, "chat", fastapi_req)
        
        if not request.image:
            try:
                import hashlib
                message_hash = hashlib.sha256(raw_message.encode('utf-8')).hexdigest()
                cache_ref = db.collection('chat_cache').document(message_hash)
                cache_doc = cache_ref.get()
                if cache_doc.exists:
                    return {"response": cache_doc.to_dict().get("response")}
            except Exception:
                pass

        system_context = (
            "تۆ مۆدێلی نیشتمانی KurdAI Pro یت بۆ خزمەتی گەلی کوردستان. ساڵی ئێستا بە تەواوی ٢٠٢٦ە. "
            "ئێستا وەرزی هاوینی ٢٠٢٦ە و مۆندیالی ٢٠٢٦ دوێنێ (١٩ی تەممووزی ٢٠٢٦) کۆتایی هات و تێیدا هەڵبژاردەی ئیسپانیا نازناوەکەی بەدەستهێنا و بوو بە پاڵەوانی مۆندیال! "
            "یاسای زمانەوانی: بە زمانی کوردیی سۆرانیی زۆر ڕەوان، شیرین، گەرموگوڕ و دۆستانە وەڵام بدەرەوە. "
            "وەڵامەکانت با یەکجار زیرەک، یارمەتیدەر، سەرنجڕاکێش و دۆستانە بن بەبێ هیچ خەتا و وشکییەکی ڕۆبۆتی. "
            "تکایە بە هیچ شێوەیەک ئیمۆجی لە ناوەڕاستی نووسینەکەدا بەکارمەهێنە، تەنها لە کۆتایی پەیامەکەدا یەک یان دوو ئیمۆجی گونجاو دابنێ."
        )

        is_real_creator = (email_clean == ADMIN_EMAIL)
        if is_real_creator:
            enhanced_prompt = (
                f"{system_context}\n"
                "بەکارهێنەر خۆیەتی (کاک هێدی) دروستکەری زیرەکی تۆ. بەوپەڕی ڕێزەوە کورت و پوخت وەڵامی بدەرەوە:\n\n"
                f"{request.message}"
            )
        else:
            enhanced_prompt = (
                f"{system_context}\n"
                f"پرسیاری بەکارهێنەر:\n\n"
                f"{request.message}"
            )
        
        response_text = generate_content_with_fallback('gemini-2.5-flash', enhanced_prompt, request.image, request.mimeType, enable_search=True)
        return {"response": response_text}

@app.post("/api/kids-ai")
async def kids_ai_endpoint(request: KidsAIRequest, fastapi_req: Request):
    check_rate_limit(request.email)
    validate_content(request.prompt)
    check_user_limit(request.email, "chat", fastapi_req)
    
    kids_prompt = (
        "تۆ مامۆستایەکی دڵسۆز و چیرۆکخوێنێکی منداڵانی لە KurdAI Pro. ساڵی ئێستا 2026ە. "
        "ئەم پرسیار یان داواکارییەی خوارەوە بە شێوازێکی یەکجار سادە، فێرکاری، شیرین، و پڕ لە خۆشەویستی بە زمانی کوردی سۆرانی بۆ منداڵان ڕوون بکەرەوە. "
        "دوور بکەوە لە وشەی قورس و فەرمی، هاوشێوەی چیرۆک و یاری بابەتەکان باس بکە و ئیمۆجی زۆر بەکاربهێنە. "
        f"داواکاری منداڵەکە:\n{request.prompt.strip()}"
    )
    
    response_text = generate_content_with_fallback('gemini-2.5-flash', kids_prompt)
    return {"response": response_text}

# 👑 چاککردنی خەتای دێڕی ٥٧٩: گۆڕینی فۆڵبەک بۆ مێتۆدی فەرمی جەیستۆن بۆ پاراستنی فۆرمات
@app.post("/api/kurdish-names")
async def kurdish_names_endpoint(request: NamesRequest, fastapi_req: Request):
    check_rate_limit(request.email)
    check_user_limit(request.email, "chat", fastapi_req)
    
    gender_type = "کچ" if request.gender == "girl" else "کوڕ"
    
    names_prompt = (
        f"تۆ پسپۆڕی فەرهەنگ و زمانەوانی کوردیتی. تکایە لیستێک لە ٨ ناوی زۆر ناوازە، ڕەسەن و جوانی منداڵانی ({gender_type}) بە زمانی کوردی بنووسە. "
        "گرنگە بۆ هەر ناوێک، ماناکەی بە کوردی سۆرانییەکی زۆر ڕەوان و کورت ڕوون بکەیتەوە. "
        "تکایە وەڵامەکەت تەنها و تەنها بە فۆرماتی JSON پێشکەش بکە بەم شێوازەی خوارەوە بەبێ هیچ دەقێکی زیادە:\n"
        "[\n"
        '  {"name": "ناوەکە", "meaning": "ماناکەی"},\n'
        '  {"name": "ناوەکە", "meaning": "ماناکەی"}\n'
        "]"
    )
    
    response_text = generate_content_with_fallback(
        model_name='gemini-2.5-flash',
        text_prompt=names_prompt
    )
    
    if "```json" in response_text:
        response_text = response_text.split("```json")[-1].split("```")[0].strip()
    elif "```" in response_text:
        response_text = response_text.split("```")[-1].split("```")[0].strip()
        
    try:
        parsed_json = json.loads(response_text.strip())
        return {"names": parsed_json}
    except Exception:
        raise HTTPException(status_code=500, detail="خەتا لە فۆرماتی داتای ناوەکان!")

@app.post("/api/send-notification")
async def send_notification_endpoint(request: NotificationRequest):
    try:
        notif_data = {
            "title": request.title.strip(),
            "body": request.body.strip(),
            "createdAt": firestore.SERVER_TIMESTAMP
        }
        db.collection('global_notifications').add(notif_data)
        
        # Send actual FCM notifications if tokens are present
        if request.tokens:
            try:
                message = messaging.MulticastMessage(
                    notification=messaging.Notification(
                        title=request.title.strip(),
                        body=request.body.strip(),
                    ),
                    tokens=request.tokens,
                )
                messaging.send_each_for_multicast(message)
            except Exception as e:
                print(f"FCM Multicast error: {e}")
                
        return {"status": "success", "message": "نۆتیفیکەیشن بە سەرکەوتوویی بڵاوکرایەوە!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خەتا لە بڵاوکردنەوەی نۆتیفیکەیشن: {str(e)}")

# 👑 چاککردنی خەتای دێڕی ٦٢٣: گۆڕینی فۆڵبەک بۆ مێتۆدی فەرمی جەیستۆن بۆ پاراستنی فۆرمات
@app.post("/api/kurdish-grammar")
async def kurdish_grammar_endpoint(request: GrammarRequest, fastapi_req: Request):
    check_rate_limit(request.email)
    validate_content(request.text)
    check_one_time_and_premium_limits(request.email, "kurdish_grammar", fastapi_req)
    
    grammar_prompt = (
        "تۆ پسپۆڕی سەرەکی زمان و ڕێنووسی کوردی (سۆرانی) یت. تکایە ئەم دەقەی خوارەوە بە وردی بپشکنە و تەواوی خەتاکانی ڕێنووس, خاڵبەندی, جیاکردنەوەی پیتەکانی وەک (ڕ, ڵ), پاشگرەکان و خەتاکانی زمانەوانی ڕاست بکەرەوە. "
        "{\n"
        '  "corrected": "لێرەدا تەنها دەقە ڕاستکراوەکە بنووسە",\n'
        '  "explanation": "لێرەدا بە کورتی زانیاری بنووسە"\n'
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
        return {"status": "success", "message": "📥 تێبینییەکەت بە سەرکەوتوویی تۆمارکرا!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خەتا لە تۆمارکردنی تێبینی: {str(e)}")

@app.post("/api/social-hook")
async def social_hook_endpoint(request: SocialHookRequest, fastapi_req: Request):
    check_rate_limit(request.email)
    validate_content(request.idea)
    user_data = check_one_time_and_premium_limits(request.email, "social_hook", fastapi_req)
    
    if user_data.get("isPremium", False):
        plan_id = user_data.get("activePlan", "")
        email_clean = request.email.lower().strip()
        if plan_id == "1_month" and email_clean != ADMIN_EMAIL:
            social_monthly_count = user_data.get("socialCountThisMonth", 0)
            if social_monthly_count >= 15:
                raise HTTPException(status_code=403, detail="⚠️ لێمیتی ١٥ دەقی ڕیکلامی ئەم مانگەت تەواو بوو!")
            db.collection('users').document(email_clean).update({"socialCountThisMonth": social_monthly_count + 1})

    hook_prompt = (
        "تۆ پسپۆڕی سەرەکی مارکێتینگ و نووسینی دەقی ڕیکلامیت بە زمانی کوردی. "
        f"بیرۆکەی پۆستەکە:\n{request.idea.strip()}"
    )
    
    response_text = generate_content_with_fallback('gemini-2.5-flash', hook_prompt)
    return {"response": response_text}

@app.post("/api/kurdish-flashcard")
async def kurdish_flashcard_endpoint(request: FlashcardRequest, fastapi_req: Request):
    user_data = check_user_limit(request.email, "chat", fastapi_req)
    email_clean = request.email.lower().strip()
    
    is_premium = user_data.get("isPremium", False)
    plan_id = user_data.get("activePlan", "")
    current_count = user_data.get("flashcardCount", 0)

    if not is_premium and email_clean != ADMIN_EMAIL:
        if current_count >= 1:
            raise HTTPException(status_code=403, detail="LIMIT_EXCEEDED_FLASHCARD_DAILY")
        db.collection('users').document(email_clean).update({"flashcardCount": current_count + 1})

    elif is_premium and plan_id == "1_month" and email_clean != ADMIN_EMAIL:
        if current_count >= 3:
            raise HTTPException(status_code=403, detail="LIMIT_EXCEEDED_FLASHCARD_PREMIUM_DAILY")
        db.collection('users').document(email_clean).update({"flashcardCount": current_count + 1})

    flashcard_prompt = (
        "تۆ پسپۆڕی فەرهەنگ و زمانەوانی کوردیتی وشەیەکی بەنرخ بە فۆرماتی JSON بنووسە:\n"
        "{\n"
        '  "word": "وشەکە",\n'
        '  "english": "English meaning",\n'
        '  "arabic": "الرادع بالعربي",\n'
        '  "dialects": "زاراوەکانی تر",\n'
        '  "example": "ڕستەی نموونەیی"\n'
        "}\n"
    )
    
    response_text = generate_content_with_fallback(
        model_name='gemini-2.5-flash',
        text_prompt=flashcard_prompt
    )
    return {"response": response_text}

@app.post("/api/summarize-document")
async def summarize_document_endpoint(request: DocumentSummarizerRequest, fastapi_req: Request):
    check_rate_limit(request.email)
    user_data = check_one_time_and_premium_limits(request.email, "pdf_summarizer", fastapi_req)
    
    if user_data.get("isPremium", False):
        plan_id = user_data.get("activePlan", "")
        email_clean = request.email.lower().strip()
        
        if plan_id == "1_month" and email_clean != ADMIN_EMAIL:
            pdf_monthly_count = user_data.get("pdfCountThisMonth", 0)
            if pdf_monthly_count >= 15:
                raise HTTPException(status_code=403, detail="⚠️ لێمیتی فایلی ئەم مانگەت تەواو بوو!")
            db.collection('users').document(email_clean).update({"pdfCountThisMonth": pdf_monthly_count + 1})

    doc_prompt = "تۆ پسپۆڕی باڵای شیکاریی بەڵگەنامەکانیت کورتەکەی بە زمانی کوردی سۆرانی پاراو پێشکەش بکە."
    
    if request.pdfBase64:
        try:
            pdf_bytes = base64.b64decode(request.pdfBase64)
            if not pdf_bytes or b"%PDF" not in pdf_bytes[:1024]:
                return {"response": "❌ فایلەکە فۆرماتی فەرمی PDF نییە."}

            pdf_part = types.Part.from_bytes(data=pdf_bytes, mime_type="application/pdf")
            contents_payload = [doc_prompt, pdf_part]
            
            for key in API_KEYS:
                try:
                    temp_client = genai.Client(api_key=key)
                    response = temp_client.models.generate_content(model='gemini-2.5-flash', contents=contents_payload)
                    return {"response": response.text}
                except Exception:
                    continue
            raise HTTPException(status_code=429, detail="تەواوی کلیلەکان لێمیتیان تەواو بووە.")
        except Exception:
            return {"response": "❌ خەتا لە خوێندنەوەی بەڵگەنامەکە!"}
            
    elif request.content:
        validate_content(request.content)
        full_prompt = f"{doc_prompt}\n\nدەقی فایلەکە:\n{request.content.strip()}"
        response_text = generate_content_with_fallback('gemini-2.5-flash', full_prompt)
        return {"response": response_text}

# 👑 چاککردنی خەتای دێڕی ٦٩٧: گۆڕینی فۆڵبەک بۆ مێتۆدی فەرمی جەیستۆن بۆ پاراستنی فۆرمات
@app.post("/api/art-studio")
async def art_studio_endpoint(request: ArtRequest, fastapi_req: Request):
    validate_content(request.prompt)
    check_user_limit(request.email, "image", fastapi_req)
    
    system_instruction = "تۆ ئەندازیارێکی پسپۆڕی داهێنانی وێنەی پڕۆمپی Midjourney دابڕێژە بە ئینگلیزی: "
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

        return {"status": "success", "message": "پلانەکە بە سەرکەوتوویی چالاککرا!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خەتا لە کاراکردنی پریمیم: {str(e)}")

class TTSRequest(BaseModel):
    text: str

@app.post("/api/tts")
async def generate_kurdish_tts_audio(request: TTSRequest):
    if not request.text or not request.text.strip():
        raise HTTPException(status_code=400, detail="Text is required")
    if not edge_tts:
        raise HTTPException(status_code=500, detail="edge-tts library is not installed")
    try:
        raw = request.text.strip()[:1500]
        # ڕێکخستنی پیتە کوردییەکان بۆ ئەوەی دەنگە دەمارییەکە بە تەواوی کوردی و بێ زاراوەی عەرەبی بیخوێنێتەوە
        mapped = (
            raw.replace("ڵ", "ل")
               .replace("ڕ", "ر")
               .replace("ڤ", "و")
               .replace("ۆ", "و")
               .replace("ێ", "ی")
               .replace("KurdAI Pro", "کورد ئەی ئای پرۆ")
               .replace("KurdAI", "کورد ئەی ئای")
        )
        # بەکارهێنانی دەنگی دەماریی مۆدێرنی پیاو بە تەڵەفوزی نەرمی ئاریایی/کوردی
        communicate = edge_tts.Communicate(mapped, "fa-IR-FaridNeural", rate="-3%", pitch="-2Hz")
        audio_data = bytearray()
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_data.extend(chunk["data"])
        
        return StreamingResponse(BytesIO(audio_data), media_type="audio/mpeg")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خەتا لە دروستکردنی دەنگ: {str(e)}")

@app.get("/")
def read_root():
    return {"status": f"KurdAI Pro API Running with {len(API_KEYS)} Active API Keys"}