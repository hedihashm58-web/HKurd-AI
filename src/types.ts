
export enum View {
  CHAT = 'CHAT',
  ART = 'ART',
  VIDEO = 'VIDEO',
  MATH = 'MATH',
  TRANSLATE = 'TRANSLATE',
  VOICE = 'VOICE',
  HEALTH = 'HEALTH',
  EXPLORE = 'EXPLORE'
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  image?: string;
  timestamp: Date;
}
