export enum View {
  HOME = 'home', // 👈 لێرەدا زیادکرا بۆ دیزاینە نوێیەکە
  CHAT = 'chat',
  EXPLORE = 'explore',
  ART = 'art',
  TRANSLATE = 'translate',
  PERSONALITIES = 'personalities',
  SOCIAL_HOOK = 'social_hook',
  KURDISH_FLASHCARD = 'kurdish_flashcard',
  DOCUMENT_SUMMARIZER = 'document_summarizer',
  WEB_SUMMARIZER = 'web_summarizer',
  KURDISH_GRAMMAR = 'kurdish_grammar',
  USER_FEEDBACK = 'user_feedback'
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  image?: string;
  timestamp: Date;
}