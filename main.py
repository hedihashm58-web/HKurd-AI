import os
import sqlite3
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from google.genai import types
from difflib import SequenceMatcher

app = FastAPI(title="KurdAI Pro Chat Brain")

# 🔓 ڕێگەدان بە پەیوەندی
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "YOUR_GEMINI_API_KEY_HERE")
client = genai.Client(api_key=GEMINI_API_KEY)

# 🛑 لیستی وشە قەدەغەکراوەکان (دەتوانیت ئارەزووی خۆت وشەی تری بۆ زیاد بکەیت)
BAD_WORDS = [
    "سێکسی", "قوز", "کێر", "گاندن", "حیز", "سۆزانی", "قەحپە", 
    "porn", "sex", "fuck", "bitch", "shit"
]

def contains_bad_words(text: str) -> bool:
    text_lower = text.lower()
    for word in BAD_WORDS:
        if word in text_lower:
            return True
    return False

def init_chat_db():
    with sqlite3.connect('kurdai_chat_brain.db') as conn:
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS chat_memory (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                question TEXT UNIQUE,
                answer TEXT
            )
        ''')
        conn.commit()

init_chat_db()

class ChatRequest(BaseModel):
    message: str

def get_similarity_ratio(str1, str2):
    return SequenceMatcher(None, str1.strip().lower(), str2.strip().lower()).ratio()

SYSTEM_PROMPT = """تۆ زیرەکی دەستکردی 'KurdAI Pro'یت.
یاساکانی وەڵامدانەوەت:
١. بە کوردییەکی (سۆرانی) ڕەوان و ڕاستەوخۆ وەڵام بدەرەوە.
٢. زۆر پوخت بە: تەنها وەڵامی داواکارییەکە بدەرەوە بێ پێشەکی و ڕوونکردنەوەی بێزارکەر و درێژ.
٣. کۆدنووسین: ئەگەر داوای کۆد کرا، *تەنها* کۆدەکە لەناو بلۆکی کۆد (Markdown) بنووسە. بە هیچ شێوەیەک دێڕ بە دێڕ شیکردنەوە مەنووسە خوار کۆدەکە، تەنها کۆدەکە بدە بە بەکارهێنەر."""

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    user_message = request.message.strip()
    
    if not user_message:
        raise HTTPException(status_code=400, detail="نامەکە ناتوانێت بەتاڵ بێت")

    def stream_generator():
        # 🛑 قۆناغی سفر: پشکنینی سانسۆر پێش هەموو شتێک
        if contains_bad_words(user_message):
            yield "ببورە، داواکارییەکەت وشەی نەشیاو یان قەدەغەکراوی تێدایە. من وەک KurdAI Pro ڕێگەپێدراو نیم وەڵامی ئەم جۆرە پرسیارانە بدەمەوە. 🚫"
            return

        # ١. پشکنینی ناوخۆیی داتابەیس
        with sqlite3.connect('kurdai_chat_brain.db') as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT question, answer FROM chat_memory")
            saved_chats = cursor.fetchall()
            
            best_match_answer = None
            highest_ratio = 0.0
            
            for saved_q, saved_a in saved_chats:
                ratio = get_similarity_ratio(user_message, saved_q)
                if ratio > highest_ratio:
                    highest_ratio = ratio
                    best_match_answer = saved_a
                    
            if highest_ratio >= 0.95 and best_match_answer:
                # ئەگەر لە داتابەیس هەبوو، وشە بە وشە دەینێرێت
                words = best_match_answer.split(' ')
                for word in words:
                    yield word + ' '
                return

        # ٢. پەیوەندی بە مێشکی سەرەکییەوە بە شێوازی Stream
        try:
            config = types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                temperature=0.4, 
            )
            
            try:
                response_stream = client.models.generate_content_stream(
                    model='gemini-2.5-flash',
                    contents=user_message,
                    config=config
                )
            except Exception as flash_error:
                print(f"Fallback: {flash_error}")
                response_stream = client.models.generate_content_stream(
                    model='gemini-2.5-pro',
                    contents=user_message,
                    config=config
                )
            
            full_text = ""
            for chunk in response_stream:
                if chunk.text:
                    full_text += chunk.text
                    yield chunk.text 
                    
            # ٣. خەزنکردن دوای تەواوبوونی ستریمەکە
            if len(full_text) < 800 and "```" not in full_text:
                with sqlite3.connect('kurdai_chat_brain.db') as conn:
                    cursor = conn.cursor()
                    cursor.execute("INSERT OR IGNORE INTO chat_memory (question, answer) VALUES (?, ?)", (user_message, full_text))
                    conn.commit()
                    
        except Exception as e:
            error_msg = str(e)
            if "429" in error_msg or "Quota" in error_msg:
                yield "ببورە، لە ئێستادا لۆدێکی زۆر لەسەر سێرڤەرە یان سنوور تەواو بووە. تکایە کەمێکی تر تاقی بکەرەوە."
            else:
                yield f"کێشەیەک لە سێرڤەر ڕوویدا: {error_msg}"

    return StreamingResponse(stream_generator(), media_type="text/plain")