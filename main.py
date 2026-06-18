import os
import sqlite3
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from difflib import SequenceMatcher

app = FastAPI(title="KurdAI Pro Chat Brain")

# 🔓 ڕێگەدان بە بەستنەوەی فرۆنتێند بە باکێندەکەوە
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔑 ڕێکخستنی کلیلی Google AI Studio - لێرەدا کلیلی خۆت جێگیر بکە
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "YOUR_GEMINI_API_KEY_HERE")
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

# 🗄️ دروستکردنی داتابەیسی مێشکی چات (kurdai_chat_brain.db)
def init_chat_db():
    conn = sqlite3.connect('kurdai_chat_brain.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS chat_memory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question TEXT UNIQUE,
            answer TEXT
        )
    ''')
    
    # 📥 پاشەکەوتکردنی چەند وەڵامێکی سەرەتایی بۆ چات بۆ ئەوەی کلیلەکە سەرف نەکەن
    initial_qa = [
        ("سڵاو", "سڵاو لە تۆش! بەخێربێیت بۆ چاتی KurdAI Pro. چۆن دەتوانم یارمەتیت بدەم؟"),
        ("چۆنیت", "باشم سوپاس، تۆ چۆنیت؟ هیوادارم تەندروست باش بیت."),
        ("سوپاس", "شایەنی نییە، هەمیشە لێرەم بۆ یارمەتیدانی تۆ!"),
        ("تۆ کێیت", "من زیرەکی دەستکردی KurdAI Pro م، پەرەم پێدراوە بۆ وەڵامدانەوەی پرسیارەکانت بە زمانی کوردی.")
    ]
    
    for q, a in initial_qa:
        cursor.execute("INSERT OR IGNORE INTO chat_memory (question, answer) VALUES (?, ?)", (q, a))
        
    conn.commit()
    conn.close()

init_chat_db()

class ChatRequest(BaseModel):
    message: str

# 🔍 فەنکشن بۆ دۆزینەوەی ڕێژەی هاوشێوەیی واتایی نێوان پرسیارەکان
def get_similarity_ratio(str1, str2):
    return SequenceMatcher(None, str1.strip().lower(), str2.strip().lower()).ratio()

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    user_message = request.message.strip()
    
    if not user_message:
        raise HTTPException(status_code=400, detail="نامەکە ناتوانێت بەتاڵ بێت")

    conn = sqlite3.connect('kurdai_chat_brain.db')
    cursor = conn.cursor()
    
    # 🧠 قۆناغی ١ و ٢: پشکنینی داتابەیسی ناوخۆیی بۆ دۆزینەوەی وەڵامی هاوشێوە
    cursor.execute("SELECT question, answer FROM chat_memory")
    saved_chats = cursor.fetchall()
    
    best_match_answer = None
    highest_ratio = 0.0
    
    for saved_q, saved_a in saved_chats:
        ratio = get_similarity_ratio(user_message, saved_q)
        if ratio > highest_ratio:
            highest_ratio = ratio
            best_match_answer = saved_a
            
    # ⚡ ئەگەر پرسیارەکە زیاتر لە ٨٥٪ هاوشێوە بوو، بەبێ بەکارهێنانی API وەڵام دەداتەوە
    if highest_ratio >= 0.85 and best_match_answer:
        conn.close()
        return {"answer": best_match_answer, "source": "local_database"}

    # 🤖 قۆناغی ٣: ئەگەر پرسیارەکە تەواو نوێ بوو، دەنێردرێت بۆ Gemini و فێری دەکات
    try:
        system_instruction = f"تۆ زیرەکی دەستکردی KurdAI Proیت. وەک کەسێکی زۆر لێهاتوو، بە زمانێکی کوردیی زۆر پاراو، شیرین و پوخت وەڵامی ئەم کورتە نامەیە بدەرەوە:\n{user_message}"
        response = model.generate_content(system_instruction)
        ai_response = response.text.strip()
        
        # 💾 خەزنکردنی پرسیار و وەڵامە نوێیەکە بۆ داهاتوو (مێشکەکە خۆی فێر دەکات)
        cursor.execute("INSERT OR IGNORE INTO chat_memory (question, answer) VALUES (?, ?)", (user_message, ai_response))
        conn.commit()
        conn.close()
        
        return {"answer": ai_response, "source": "gemini_api"}
        
    except Exception as e:
        conn.close()
        return {"answer": "ببورە، لە ئێستادا کێشەیەک لە پەیوەندی بە مێشکی سەرەکییەوە هەیە.", "source": "error"}