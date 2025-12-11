import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Aperture, Mail, Lock, User, ArrowRight, Github, Chrome, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useAppStore } from '../store';
import { authService } from '../services/authService';
import { isSupabaseConfigured } from '../services/supabaseClient';

export const AuthPage: React.FC = () => {
  const { login } = useAppStore();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // 检查 Supabase 是否配置
    if (!isSupabaseConfigured()) {
      // 开发模式：模拟登录
      setTimeout(() => {
        setIsLoading(false);
        login({
          id: 'dev-user-' + Date.now(),
          name: isLogin ? 'Dev User' : name,
          email: email,
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&q=80'
        });
      }, 800);
      return;
    }

    try {
      let user;
      if (isLogin) {
        user = await authService.signIn(email, password);
      } else {
        user = await authService.signUp(email, password, name);
      }
      login(user);
    } catch (err: any) {
      setError(err.message || '操作失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    if (!isSupabaseConfigured()) {
      setError('OAuth 登录需要配置 Supabase');
      return;
    }

    setError(null);
    try {
      await authService.signInWithOAuth(provider);
    } catch (err: any) {
      setError(err.message || 'OAuth 登录失败');
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white dark:bg-studio-950 transition-colors duration-500">

      {/* Left: Brand Visual Area */}
      <div className="hidden lg:flex w-[55%] relative overflow-hidden bg-studio-900 items-center justify-center p-12">
          {/* Animated Background */}
          <div className="absolute inset-0">
              <div className="absolute top-[-20%] left-[-20%] w-[800px] h-[800px] bg-indigo-500/20 rounded-full blur-[120px] animate-pulse" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[100px]" />
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light" />
          </div>

          <div className="relative z-10 max-w-lg text-white">
              <div className="mb-8 inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-xs font-medium text-white/80">
                  <SparklesIcon className="w-3 h-3 text-yellow-300" />
                  <span>AI Powered Visual Engine</span>
              </div>
              <h1 className="text-6xl font-bold tracking-tight mb-6 leading-tight">
                  让创意<br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">触手可及</span>
              </h1>
              <p className="text-lg text-white/60 leading-relaxed mb-10">
                  LUMA 是专为现代电商打造的 AI 视觉生产力工具。
                  一键生成模特、场景与营销素材，释放品牌潜能。
              </p>

              {/* Testimonial Card */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-6 rounded-2xl">
                  <p className="text-sm font-medium italic text-white/90 mb-4">"LUMA 彻底改变了我们的上新流程，图片制作效率提升了 10 倍以上。"</p>
                  <div className="flex items-center gap-3">
                      <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&q=80" className="w-10 h-10 rounded-full border-2 border-white/20" alt="User" />
                      <div>
                          <div className="text-sm font-bold text-white">Sarah Chen</div>
                          <div className="text-xs text-white/50">Brand Director, SHEIN</div>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* Right: Auth Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 relative">
          <div className="w-full max-w-md space-y-8">
              {/* Header */}
              <div className="text-center">
                  <div className="inline-flex items-center gap-2 mb-6">
                      <div className="w-10 h-10 bg-studio-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                          <Aperture size={22} strokeWidth={2} />
                      </div>
                      <span className="text-2xl font-bold text-studio-900 tracking-tight">LUMA</span>
                  </div>
                  <h2 className="text-2xl font-bold text-studio-900 tracking-tight mb-2">
                      {isLogin ? '欢迎回来' : '创建新账户'}
                  </h2>
                  <p className="text-sm text-studio-500">
                      {isLogin ? '登录以继续您的创作之旅' : '免费注册，开启 AI 视觉创作'}
                  </p>
              </div>

              {/* Social Login */}
              <div className="grid grid-cols-2 gap-4">
                  <SocialButton icon={Chrome} label="Google" onClick={() => handleOAuthLogin('google')} />
                  <SocialButton icon={Github} label="GitHub" onClick={() => handleOAuthLogin('github')} />
              </div>

              <div className="relative">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-studio-200"></div></div>
                  <div className="relative flex justify-center text-xs"><span className="bg-white px-2 text-studio-400">或者使用邮箱</span></div>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm"
                  >
                    <AlertCircle size={16} className="flex-shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                  <AnimatePresence mode="popLayout">
                      {!isLogin && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                              <InputGroup icon={User} type="text" placeholder="您的姓名" value={name} onChange={setName} />
                          </motion.div>
                      )}
                  </AnimatePresence>

                  <InputGroup icon={Mail} type="email" placeholder="电子邮箱" value={email} onChange={setEmail} />

                  <div className="relative">
                      <InputGroup
                        icon={Lock}
                        type={showPassword ? "text" : "password"}
                        placeholder="密码"
                        value={password}
                        onChange={setPassword}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3.5 text-studio-400 hover:text-studio-600 transition-colors"
                      >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                  </div>

                  {isLogin && (
                      <div className="flex items-center justify-between text-xs">
                          <label className="flex items-center gap-2 cursor-pointer text-studio-600">
                              <input type="checkbox" className="rounded border-studio-300 text-studio-900 focus:ring-studio-900" />
                              <span>记住我</span>
                          </label>
                          <a href="#" className="font-medium text-studio-900 hover:underline">忘记密码?</a>
                      </div>
                  )}

                  <button
                    disabled={isLoading}
                    className="w-full py-3 bg-studio-900 text-white rounded-xl font-bold text-sm shadow-xl shadow-studio-900/20 hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                      {isLoading ? <Loader2 className="animate-spin" size={18} /> : (isLogin ? '立即登录' : '创建账户')}
                      {!isLoading && <ArrowRight size={16} />}
                  </button>
              </form>

              {/* Switcher */}
              <p className="text-center text-sm text-studio-500">
                  {isLogin ? "还没有账号? " : "已有账号? "}
                  <button onClick={() => { setIsLogin(!isLogin); setError(null); }} className="font-bold text-studio-900 hover:underline transition-all">
                      {isLogin ? "立即注册" : "直接登录"}
                  </button>
              </p>
          </div>

          <div className="absolute bottom-6 text-[10px] text-studio-400 flex gap-4">
              <a href="#" className="hover:text-studio-900">隐私政策</a>
              <a href="#" className="hover:text-studio-900">服务条款</a>
          </div>
      </div>
    </div>
  );
};

const SocialButton = ({ icon: Icon, label, onClick }: { icon: any, label: string, onClick?: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center gap-2 py-2.5 border border-studio-200 rounded-xl hover:bg-studio-50 hover:border-studio-300 transition-all group"
    >
        <Icon size={18} className="text-studio-600 group-hover:text-studio-900" />
        <span className="text-sm font-medium text-studio-600 group-hover:text-studio-900">{label}</span>
    </button>
);

const InputGroup = ({ icon: Icon, type, placeholder, value, onChange }: any) => (
    <div className="relative group">
        <div className="absolute left-3 top-3.5 text-studio-400 group-focus-within:text-studio-900 transition-colors">
            <Icon size={18} />
        </div>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-studio-50 border border-studio-200 text-studio-900 text-sm rounded-xl py-3 pl-10 pr-4 outline-none focus:bg-white focus:border-studio-900 focus:ring-4 focus:ring-studio-900/5 transition-all placeholder:text-studio-400"
        />
    </div>
);

const SparklesIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
);
