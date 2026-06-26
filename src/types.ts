export enum View {
  CHAT = 'chat',
  EXPLORE = 'explore',
  ART = 'art',
  VIDEO = 'video',
  MATH = 'math',
  TRANSLATE = 'translate',
  VOICE = 'voice',
  HEALTH = 'health',
  PERSONALITIES = 'personalities',
  RESTAURANT_DASHBOARD = 'restaurant_dashboard',
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