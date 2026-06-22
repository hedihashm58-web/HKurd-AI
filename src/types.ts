export enum View {
  CHAT = 'CHAT',
  EXPLORE = 'EXPLORE',
  ART = 'ART',
  VIDEO = 'VIDEO',
  MATH = 'MATH',
  TRANSLATE = 'TRANSLATE',
  VOICE = 'VOICE',
  HEALTH = 'HEALTH',
  PERSONALITIES = 'PERSONALITIES',
  RESTAURANT_DASHBOARD = 'RESTAURANT_DASHBOARD' // 👈 لێرەدا بە پیتی گەورە زیادکرا تا وەک ستایلی خۆت بێت
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  image?: string;
  timestamp: Date;
}