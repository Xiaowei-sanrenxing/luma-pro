
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
import { licenseService } from './services/licenseService';
import { isSupabaseConfigured } from './services/supabaseClient';
import { KeyRound, ExternalLink, Loader2, Play, Lock } from 'lucide-react';

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
    logout,
    userLicense,
    setUserLicense,
    showLicenseModal,
    setShowLicenseModal
  } = useAppStore();

  const [hasCheckedKey, setHasCheckedKey] = useState(false);
  const [manualKey, setManualKey] = useState('');
  const [isCheckingLicense, setIsCheckingLicense] = useState(false);

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
  // Check License when User is Authenticated
  useEffect(() => {
    if (isAuthenticated && useAppStore.getState().user) {
      const checkLicense = async () => {
        setIsCheckingLicense(true);
        try {
          const user = useAppStore.getState().user;
          if (!user) return;
          const license = await licenseService.checkLicense(user.id);
          setUserLicense(license);
          // If invalid, force show modal
          if (!license.hasValidLicense) {
            setShowLicenseModal(true);
          }
        } finally {
          setIsCheckingLicense(false);
        }
      };
      checkLicense();
    }
  }, [isAuthenticated, setUserLicense, setShowLicenseModal]);

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

  // 3. License Check (New Priority: Block if no license)
  // Check if we have checked license at least once (userLicense is not null) or is checking
  const hasLicenseCheckCompleted = userLicense !== null;

  if (isAuthenticated && !isCheckingLicense && hasLicenseCheckCompleted && userLicense && !userLicense.hasValidLicense) {
    if (!showLicenseModal) {
      // If modal is closed but verify failed, show a blocking screen with button
      return (
        <div className="h-screen w-screen bg-studio-50 dark:bg-studio-950 flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-studio-900 rounded-2xl shadow-xl p-8 text-center border border-studio-200 dark:border-studio-800">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600 dark:text-red-400">
              <Lock size={32} />
            </div>
            <h1 className="text-2xl font-bold mb-3 text-studio-900 dark:text-white">需要授权</h1>
            <p className="text-studio-500 dark:text-studio-400 mb-8">
              您的账户尚未激活或授权已过期。请输入授权码以继续使用 Luma Pro。
            </p>
            <button
              onClick={() => setShowLicenseModal(true)}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors"
            >
              输入授权码
            </button>
            <button
              onClick={logout}
              className="mt-4 text-sm text-studio-400 hover:text-studio-600 dark:hover:text-studio-300 transition-colors"
            >
              退出登录
            </button>
          </div>
          {/* Still render modal in case it's toggled */}
          <LicenseModal />
        </div>
      );
    }
    // If showLicenseModal is true, we fall through to render the main app but with modal on top?
    // No, we should probably just render the modal on a blank background to be safe.
    // But LicenseModal has `fixed inset-0`, so rendering it here is fine.
    return (
      <div className="h-screen w-screen bg-studio-50 dark:bg-studio-950">
        <LicenseModal />
      </div>
    );
  }

  // 4. API Key Check (Non-blocking, just state update)
  // We removed the blocking UI for apiKeyMissing. 
  // The state apiKeyMissing is still updated by the useEffect above, 
  // so we can use it in OperationPanel to show a warning.

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
