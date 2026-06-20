import os
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv
import time
from collections import defaultdict

# ١. لۆدکردنی کلیلەکان لە ژینگەی هۆستەکەدا
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY لە ناو Environment Variables نەدۆزرایەوە!")

# ٢. کۆنفhandlingی سیستەمی فەرمی ژیریی دەستکردی گوگل
genai.configure(api_key=GOOGLE_API_KEY)

app = FastAPI()

# ٣. ڕێگەپێدانی CORS بۆ ئەوەی فرۆنتێندەکەت (React) بێ کێشە پەیوەندی بکات
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🛑 ٤. لیستی وشە نەشیاو و قەدەغەکراوەکان بۆ پاراستنی کلیلەکەت
FORBIDDEN_WORDS = [
    "سکس", "سێکسی", "قوز", "کێر", "گان", "حیز", "قوندەر", "مایین","گاندەر","سوارتبم","سواریبم","سواری بم"
    "پۆڕن", "porn", "sex", "xhamster", "xnxx", "قەحپە", "بێشەرەف","Xvideo","xvideo","سووک","سوک","ماین","سایتە شینەکە"
]

# فەنکشنی پشکنینی وشە نەشیاوەکان
def validate_content(text: str):
    text_lower = text.lower()
    for word in FORBIDDEN_WORDS:
        if word in text_lower:
            raise HTTPException(
                status_code=400, 
                detail="داواکارییەکەت ڕەتکرایەوە! دەقەکەت وشەی نەشیاو یان قەدەغەکراوی تێدایە کە لەگەڵ بەهاکانی KurdAI Pro ناگونجێت."
            )

# ⏳ ٥. سیستەمی سنووردارکردنی خێرایی (Rate Limiter) - تەنها ٣ پرسیار لە خولەکێکدا
user_requests = defaultdict(list)

def check_rate_limit(client_ip: str):
    current_time = time.time()
    # پاککردنەوەی داواکارییە کۆنەکان (زیاتر لە ٦٠ چرکە)
    user_requests[client_ip] = [t for t in user_requests[client_ip] if current_time - t < 60]
    
    if len(user_requests[client_ip]) >= 3:
        raise HTTPException(
            status_code=429, 
            detail="زۆر خێرا پرسیار دەکەیت! تکایە کەمێک چاوەڕوان بە (یاسای ٣ پرسیار لە خولەکێکدا بۆ پاراستنی سێرڤەر)."
        )
    
    user_requests[client_ip].append(current_time)

# 📦 ٦. مۆدێلەکانی پێناسەکردنی داتا (Pydantic Models)
class ChatRequest(BaseModel):
    message: str
    history: list = []

class ArtRequest(BaseModel):
    prompt: str

# 💬 ٧. ئیندپۆینتی چاتکردنی ئاسایی (Gemini 2.5 Flash)
@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    # پشکنینی وشە نەشیاوەکان
    validate_content(request.message)
    
    try:
        # بەکارهێنانی مۆدێلی فلاش بۆ خێرایی و کەمی تێچوو
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(request.message)
        return {"response": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 🎨 ٨. ئیندپۆینتی خزمەتگوزاری داهێنان و وێنە (Gemini 2.5 Pro)
@app.post("/api/art-studio")
async def art_studio_endpoint(request: ArtRequest):
    # پشکنینی وشە نەشیاوەکان لە ناو وەسفی وێنەکەدا
    validate_content(request.prompt)
    
    try:
        # بەکارهێنانی مۆدێلی بەهێزی پڕۆ بۆ شیکاری قووڵ و داڕشتنی پڕۆمپت
        model = genai.GenerativeModel("gemini-2.5-pro")
        
        system_instruction = (
            "تۆ ئەندازیارێکی پسپۆڕی داهێنانی وێنە و گرافیکیت. "
            "ئەم پڕۆمپتەی خوارەوە بە جوانترین شێواز شیکار بکە و پڕۆمپتێکی پڕۆفیشناڵی ئینگلیزی "
            "بۆ دروستکردنی وێنە (Image Generation Prompt) دابڕێژە: "
        )
        
        full_prompt = f"{system_instruction}\n{request.prompt}"
        response = model.generate_content(full_prompt)
        
        return {"art_response": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 🌐 ٩. پشکنینی ڕەنی سێرڤەر
@app.get("/")
def read_root():
    return {"status": "KurdAI Pro API Running Successfully with Flash & Pro Models"}