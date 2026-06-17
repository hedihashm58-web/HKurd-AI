export enum View {
  CHAT = 'CHAT',
  EXPLORE = 'EXPLORE',
  ART = 'ART',
  VIDEO = 'VIDEO',
  MATH = 'MATH',
  TRANSLATE = 'TRANSLATE',
  VOICE = 'VOICE',
  HEALTH = 'HEALTH',
  PERSONALITIES = 'PERSONALITIES' 
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  image?: string;
  timestamp: Date;
}