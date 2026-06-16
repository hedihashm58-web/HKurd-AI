import React, { useState } from 'react';
import { auth, googleProvider } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup 
} from 'firebase/auth';

interface LoginProps {
  onLoginSuccess: (userEmail: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // فەنکشنی لۆگین بە ئیمەیڵ و پاسۆرد
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isSignUp) {
        // دروستکردنی هەژماری نوێ
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        onLoginSuccess(userCredential.user.email || '');
      } else {
        // چوونەژوورەوە بە هەژماری پێشوو
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        onLoginSuccess(userCredential.user.email || '');
      }
    } catch (err: any) {
      console.error(err);
      // گۆڕینی نامەی هەڵەکانی فایەربەیس بۆ کوردی
      if (err.code === 'auth/email-already-in-use') setError('ئەم ئیمەیڵە پێشتر بەکارهاتووە');
      else if (err.code === 'auth/invalid-credential') setError('ئیمەیڵ یان وشەی تێپەڕ هەڵەیە');
      else if (err.code === 'auth/weak-password') setError('وشەی تێپەڕ دەبێت لانی کەم ٦ پیت/ژمارە بێت');
      else setError('هەڵەیەک ڕوویدا، تکایە دووبارە هەوڵ بدەرەوە');
    } finally {
      setIsLoading(false);
    }
  };

  // فەنکشنی لۆگین بە گووگڵ
  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      onLoginSuccess(result.user.email || '');
    } catch (err: any) {
      console.error(err);
      setError('نەتوانرا لە ڕێگەی گووگڵەوە لۆگین بکرێت');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[#020617] text-slate-200 px-4 relative overflow-hidden touch-manipulation" dir="rtl">
      {/* ڕووناکی پاشبنەما */}
      <div className="absolute w-[500px] h-[500px] bg-indigo-500/10 blur-[150px] rounded-full -top-40 -right-40 pointer-events-none"></div>
      <div className="absolute w-[500px] h-[500px] bg-emerald-500/5 blur-[150px] rounded-full -bottom-40 -left-40 pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900/60 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl backdrop-blur-xl z-10 animate-in fade-in zoom-in-95 duration-500">
        
        {/* سەردێڕ */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-3xl mx-auto mb-4 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
            ☀️
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">
            KurdAI <span className="text-yellow-500 italic text-sm ml-1">PRO</span>
          </h2>
          <p className="text-slate-400 text-xs mt-2 font-medium">
            {isSignUp ? 'دروستکردنی هەژماری نوێ بۆ چوونە ناو پلاتفۆرم' : 'بۆ بەکارهێنانی خزمەتگوزارییەکان لۆگین بکە'}
          </p>
        </div>

        {/* پیشاندانی هەڵەکان (ئەگەر هەبێت) */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold text-center">
            {error}
          </div>
        )}

        {/* فۆڕم */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2 mr-2">ئیمەیڵەکەت</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-700 rounded-2xl px-4 py-3.5 text-white focus:outline-none focus:border-indigo-500 transition-all text-left"
              placeholder="name@example.com"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2 mr-2">وشەی تێپەڕ (Password)</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-700 rounded-2xl px-4 py-3.5 text-white focus:outline-none focus:border-indigo-500 transition-all text-left"
              placeholder="••••••••"
              required
              disabled={isLoading}
              minLength={6}
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-600/20 mt-2 active:scale-[0.98] flex justify-center items-center"
          >
            {isLoading ? 'چاوەڕێ بە...' : (isSignUp ? 'تۆمارکردنی هەژمار' : 'چوونەژوورەوە')}
          </button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
          <span className="relative bg-[#0d1117] px-3 text-xs text-slate-500 font-bold">یان</span>
        </div>

        {/* دوگمەی گووگڵ */}
        <button 
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full py-3.5 bg-slate-800/50 border border-slate-700 hover:bg-slate-800 active:bg-slate-750 disabled:opacity-50 text-slate-200 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          بەردەوامبە لەگەڵ Google
        </button>

        <div className="text-center mt-6">
          <button 
            type="button"
            onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-bold transition-colors"
          >
            {isSignUp ? 'پێشتر هەژمارت دروستکردووە؟ چوونەژوورەوە' : 'هێشتا هەژمارت نییە؟ دروستکردنی هەژمار'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Login;