
import React, { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { OperationPanel } from './components/OperationPanel';
import { CanvasArea } from './components/CanvasArea';
import { DesignAgent } from './components/DesignAgent';
import { HomePage } from './components/HomePage';
import { AuthPage } from './components/AuthPage';
import { TutorialsPage } from './components/TutorialsPage';
import { LicenseModal } from './components/LicenseModal';
import { useAppStore } from './store';
import { authService } from './services/authService';
import { isSupabaseConfigured } from './services/supabaseClient';
import { KeyRound, ExternalLink, Loader2, Play } from 'lucide-react';

function App() {
  const {
    apiKeyMissing,
    setApiKeyMissing,
    activeWorkflow,
    theme,
    isAuthenticated,
    isAuthLoading,
    globalApiKey,
    setGlobalApiKey,
    setUser,
    setIsAuthLoading,
    logout
  } = useAppStore();

  const [hasCheckedKey, setHasCheckedKey] = useState(false);
  const [manualKey, setManualKey] = useState('');

  // 监听 Supabase Auth 状态变化
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      // 开发模式：跳过 Supabase 认证监听
      setIsAuthLoading(false);
      return;
    }

    // 检查初始会话
    const initAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          setUser(user);
        }
      } catch (e) {
        console.error('[Auth] Init error:', e);
      } finally {
        setIsAuthLoading(false);
      }
    };

    initAuth();

    // 监听认证状态变化（包括 OAuth 回调）
    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      if (user) {
        setUser(user);
      } else {
        logout();
      }
      setIsAuthLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setIsAuthLoading, logout]);

  useEffect(() => {
    // 只有在登录后才检查 Key
    if (isAuthenticated) {
      const checkKey = async () => {
        // 1. 优先检查 Store 中的 Key (用户手动输入)
        if (globalApiKey) {
            setHasCheckedKey(true);
            setApiKeyMissing(false);
            return;
        }

        // 2. 检查环境变量 (Vercel Prod)
        if (process.env.API_KEY) {
            setHasCheckedKey(true);
            setApiKeyMissing(false);
            return;
        }

        // 3. 检查 AI Studio 环境 (Google IDX/AI Studio)
        const aistudio = (window as any).aistudio;
        if (aistudio) {
          try {
             const has = await aistudio.hasSelectedApiKey();
             if (!has) {
                setApiKeyMissing(true);
             } else {
                setApiKeyMissing(false);
             }
          } catch (e) {
             console.warn("AI Studio check failed, falling back to manual");
             setApiKeyMissing(true);
          }
        } else {
             // 既没有 Env 也没有 AI Studio，必须手动输入
             setApiKeyMissing(true);
        }
        setHasCheckedKey(true);
      };
      checkKey();
    }
  }, [setApiKeyMissing, isAuthenticated, globalApiKey]);

  // Sync theme with document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleSelectKey = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio) {
      await aistudio.openSelectKey();
      setApiKeyMissing(false);
    } else {
      // Fallback for non-AI Studio environment
      if (manualKey.trim().length > 10) {
          setGlobalApiKey(manualKey.trim());
          setApiKeyMissing(false);
      } else {
          alert("请输入有效的 Gemini API Key");
      }
    }
  };

  // 0. Auth Loading State
  if (isAuthLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white text-indigo-600 gap-2">
        <Loader2 className="animate-spin" size={24} />
        <span className="text-lg font-medium">加载中...</span>
      </div>
    );
  }

  // 1. Auth Check (First Priority)
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  // 2. Initializing Check (For Key)
  if (!hasCheckedKey) {
     return (
        <div className="h-screen w-screen flex items-center justify-center bg-white text-indigo-600 gap-2">
            <Loader2 className="animate-spin" />
            <span>Initializing Application...</span>
        </div>
     );
  }

  // 3. API Key Missing Check
  if (apiKeyMissing) {
    const isAiStudio = !!(window as any).aistudio;

    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50 p-4 font-sans text-gray-900">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600">
             <KeyRound size={32} />
          </div>
          <h1 className="text-2xl font-bold mb-3">连接 Google Cloud</h1>
          <p className="text-gray-600 mb-6 leading-relaxed text-sm">
            本应用使用 <strong>Gemini 3 Pro</strong> 等高级生成式 AI 模型。
            <br/>
            {isAiStudio ? "请选择一个已关联 Billing (计费) 的 Google Cloud 项目。" : "请输入您的 Gemini API Key 以继续。"}
          </p>

          {!isAiStudio && (
              <div className="mb-4 text-left">
                  <label className="text-xs font-bold text-gray-500 mb-1 block">API Key</label>
                  <input
                    type="password"
                    value={manualKey}
                    onChange={(e) => setManualKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
              </div>
          )}

          <button
            onClick={handleSelectKey}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 mb-6 flex items-center justify-center gap-2"
          >
            {isAiStudio ? '选择 Key' : '开始使用'} <Play size={16} fill="currentColor"/>
          </button>

          <div className="flex items-center justify-center gap-1 text-xs text-gray-400 hover:text-indigo-600 transition-colors">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1"
            >
              获取 Gemini API Key
              <ExternalLink size={10} />
            </a>
          </div>
        </div>
      </div>
    );
  }

  // --- ROUTING LOGIC ---

  // If workflow is 'home', show the Landing Page
  if (activeWorkflow === 'home') {
    return (
      <>
        <HomePage />
        <LicenseModal />
      </>
    );
  }

  // Tutorials Page
  if (activeWorkflow === 'tutorials') {
    return (
      <>
        <TutorialsPage />
        <LicenseModal />
      </>
    );
  }

  // Otherwise, show the Editor Interface
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-studio-950 text-gray-900 dark:text-gray-100 font-sans relative transition-colors duration-300">
      {/* 区域一：侧边栏 */}
      <Sidebar />

      {/* 区域二：操作面板 */}
      <OperationPanel />

      {/* 区域三：智能画布 */}
      <CanvasArea />

      {/* 区域四：AI 设计助理 (悬浮) */}
      <DesignAgent />

      {/* 授权码弹窗 (全局) */}
      <LicenseModal />
    </div>
  );
}

export default App;
