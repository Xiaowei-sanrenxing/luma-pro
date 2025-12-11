import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import {
  Eye, EyeOff, Check, AlertCircle, Loader2,
  Globe, Key, Server, Trash2, RefreshCw, Info
} from 'lucide-react';

export const SettingsPanel: React.FC = () => {
  const {
    apiEndpoint, setApiEndpoint,
    globalApiKey, setGlobalApiKey,
    customApiKey, setCustomApiKey
  } = useAppStore();

  // Gemini API 状态
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [localGeminiKey, setLocalGeminiKey] = useState(globalApiKey || '');
  const [isTestingGemini, setIsTestingGemini] = useState(false);
  const [geminiTestResult, setGeminiTestResult] = useState<'success' | 'error' | null>(null);

  // 通用 API 状态
  const [showCustomKey, setShowCustomKey] = useState(false);
  const [localCustomEndpoint, setLocalCustomEndpoint] = useState(apiEndpoint || '');
  const [localCustomKey, setLocalCustomKey] = useState(customApiKey || '');
  const [isTestingCustom, setIsTestingCustom] = useState(false);
  const [customTestResult, setCustomTestResult] = useState<'success' | 'error' | null>(null);

  const [hasChanges, setHasChanges] = useState(false);

  // 同步本地状态
  useEffect(() => {
    setLocalGeminiKey(globalApiKey || '');
    setLocalCustomEndpoint(apiEndpoint || '');
    setLocalCustomKey(customApiKey || '');
  }, [globalApiKey, apiEndpoint, customApiKey]);

  // 检测变更
  useEffect(() => {
    const geminiKeyChanged = localGeminiKey !== (globalApiKey || '');
    const endpointChanged = localCustomEndpoint !== (apiEndpoint || '');
    const customKeyChanged = localCustomKey !== (customApiKey || '');
    setHasChanges(geminiKeyChanged || endpointChanged || customKeyChanged);
    setGeminiTestResult(null);
    setCustomTestResult(null);
  }, [localGeminiKey, localCustomEndpoint, localCustomKey, globalApiKey, apiEndpoint, customApiKey]);

  // 保存配置
  const handleSave = () => {
    setGlobalApiKey(localGeminiKey);
    setApiEndpoint(localCustomEndpoint);
    setCustomApiKey(localCustomKey);
    setHasChanges(false);
  };

  // 测试 Gemini 连接
  const handleTestGemini = async () => {
    if (!localGeminiKey) {
      setGeminiTestResult('error');
      return;
    }

    setIsTestingGemini(true);
    setGeminiTestResult(null);

    try {
      const testUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${localGeminiKey}`;
      const response = await fetch(testUrl, { method: 'GET' });
      setGeminiTestResult(response.ok ? 'success' : 'error');
    } catch (e) {
      setGeminiTestResult('error');
    } finally {
      setIsTestingGemini(false);
    }
  };

  // 测试通用 API 连接
  const handleTestCustom = async () => {
    if (!localCustomEndpoint || !localCustomKey) {
      setCustomTestResult('error');
      return;
    }

    setIsTestingCustom(true);
    setCustomTestResult(null);

    try {
      const testUrl = `${localCustomEndpoint}/models`;
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localCustomKey}`,
          'Content-Type': 'application/json'
        }
      });
      setCustomTestResult(response.ok ? 'success' : 'error');
    } catch (e) {
      setCustomTestResult('error');
    } finally {
      setIsTestingCustom(false);
    }
  };

  // 清除所有配置
  const handleClearAll = () => {
    setLocalGeminiKey('');
    setLocalCustomEndpoint('');
    setLocalCustomKey('');
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-500">

      {/* ========== Gemini API 配置 ========== */}
      <div className="space-y-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-studio-900 dark:text-white flex items-center gap-2">
            <Key size={16} className="text-blue-600 dark:text-blue-400" />
            Gemini API 配置
          </h3>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
            localGeminiKey
              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
          }`}>
            {localGeminiKey ? '已配置' : '未配置'}
          </span>
        </div>

        {/* Gemini API Key 输入框 */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-studio-600 dark:text-studio-300">
            Gemini API Key
          </label>
          <div className="relative">
            <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-studio-400" />
            <input
              type={showGeminiKey ? 'text' : 'password'}
              value={localGeminiKey}
              onChange={(e) => setLocalGeminiKey(e.target.value)}
              placeholder="输入 Gemini API Key (AIza...)"
              className="w-full p-3 pl-9 pr-20 rounded-lg border border-studio-200 dark:border-studio-600 bg-white dark:bg-studio-800 text-sm text-studio-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-mono"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                onClick={() => setShowGeminiKey(!showGeminiKey)}
                className="p-1.5 text-studio-400 hover:text-studio-900 dark:hover:text-white transition-colors rounded hover:bg-studio-100 dark:hover:bg-studio-700"
                title={showGeminiKey ? '隐藏' : '显示'}
              >
                {showGeminiKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              {localGeminiKey && (
                <button
                  onClick={() => setLocalGeminiKey('')}
                  className="p-1.5 text-studio-400 hover:text-red-500 transition-colors rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                  title="清除"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
          <p className="text-[11px] text-studio-500 dark:text-studio-400 flex items-center gap-1">
            <Info size={10} />
            从 <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Google AI Studio</a> 免费获取
          </p>
        </div>

        {/* Gemini 连接状态 */}
        <div className="flex items-center gap-2 p-3 rounded-lg border border-studio-200 dark:border-studio-600 bg-white dark:bg-studio-800">
          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
            geminiTestResult === 'success' ? 'bg-emerald-500 animate-pulse' :
            geminiTestResult === 'error' ? 'bg-red-500' :
            localGeminiKey ? 'bg-amber-500' : 'bg-studio-300 dark:bg-studio-600'
          }`} />
          <span className="flex-1 text-xs text-studio-600 dark:text-studio-300">
            {geminiTestResult === 'success' ? '✓ 连接成功！' :
             geminiTestResult === 'error' ? '✗ 连接失败，请检查 Key' :
             localGeminiKey ? '待测试...' : '请输入 API Key'}
          </span>
          <button
            onClick={handleTestGemini}
            disabled={!localGeminiKey || isTestingGemini}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {isTestingGemini ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
            测试
          </button>
        </div>
      </div>

      {/* ========== 通用 API 配置 ========== */}
      <div className="space-y-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-studio-900 dark:text-white flex items-center gap-2">
            <Server size={16} className="text-purple-600 dark:text-purple-400" />
            通用 API 配置
          </h3>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
            localCustomEndpoint && localCustomKey
              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
              : 'bg-studio-100 dark:bg-studio-700 text-studio-500 dark:text-studio-400'
          }`}>
            {localCustomEndpoint && localCustomKey ? '已配置' : '可选'}
          </span>
        </div>

        <p className="text-[11px] text-studio-500 dark:text-studio-400">
          适用于 OpenAI 兼容接口、自建代理或第三方 API 网关
        </p>

        {/* API URL 输入框 */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-studio-600 dark:text-studio-300">
            API URL
          </label>
          <div className="relative">
            <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-studio-400" />
            <input
              type="text"
              value={localCustomEndpoint}
              onChange={(e) => setLocalCustomEndpoint(e.target.value)}
              placeholder="https://api.openai.com/v1"
              className="w-full p-3 pl-9 rounded-lg border border-studio-200 dark:border-studio-600 bg-white dark:bg-studio-800 text-sm text-studio-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all font-mono"
            />
          </div>
        </div>

        {/* API Key 输入框 */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-studio-600 dark:text-studio-300">
            API Key
          </label>
          <div className="relative">
            <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-studio-400" />
            <input
              type={showCustomKey ? 'text' : 'password'}
              value={localCustomKey}
              onChange={(e) => setLocalCustomKey(e.target.value)}
              placeholder="输入 API Key (sk-...)"
              className="w-full p-3 pl-9 pr-20 rounded-lg border border-studio-200 dark:border-studio-600 bg-white dark:bg-studio-800 text-sm text-studio-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all font-mono"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                onClick={() => setShowCustomKey(!showCustomKey)}
                className="p-1.5 text-studio-400 hover:text-studio-900 dark:hover:text-white transition-colors rounded hover:bg-studio-100 dark:hover:bg-studio-700"
                title={showCustomKey ? '隐藏' : '显示'}
              >
                {showCustomKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              {localCustomKey && (
                <button
                  onClick={() => setLocalCustomKey('')}
                  className="p-1.5 text-studio-400 hover:text-red-500 transition-colors rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                  title="清除"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 通用 API 连接状态 */}
        <div className="flex items-center gap-2 p-3 rounded-lg border border-studio-200 dark:border-studio-600 bg-white dark:bg-studio-800">
          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
            customTestResult === 'success' ? 'bg-emerald-500 animate-pulse' :
            customTestResult === 'error' ? 'bg-red-500' :
            (localCustomEndpoint && localCustomKey) ? 'bg-amber-500' : 'bg-studio-300 dark:bg-studio-600'
          }`} />
          <span className="flex-1 text-xs text-studio-600 dark:text-studio-300">
            {customTestResult === 'success' ? '✓ 连接成功！' :
             customTestResult === 'error' ? '✗ 连接失败，请检查配置' :
             (localCustomEndpoint && localCustomKey) ? '待测试...' : '请填写 URL 和 Key'}
          </span>
          <button
            onClick={handleTestCustom}
            disabled={!localCustomEndpoint || !localCustomKey || isTestingCustom}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {isTestingCustom ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
            测试
          </button>
        </div>
      </div>

      {/* ========== 操作按钮 ========== */}
      <div className="flex gap-3 pt-4 border-t border-studio-100 dark:border-studio-800">
        <button
          onClick={handleClearAll}
          className="flex-1 py-2.5 px-4 bg-studio-100 dark:bg-studio-800 text-studio-700 dark:text-studio-300 text-xs font-semibold rounded-lg hover:bg-studio-200 dark:hover:bg-studio-700 transition-colors flex items-center justify-center gap-2"
        >
          <Trash2 size={14} />
          清除配置
        </button>
        <button
          onClick={handleSave}
          disabled={!hasChanges}
          className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2
            ${hasChanges
              ? 'bg-studio-900 dark:bg-white text-white dark:text-studio-900 hover:bg-black dark:hover:bg-studio-200 shadow-lg shadow-studio-900/20'
              : 'bg-studio-200 dark:bg-studio-700 text-studio-400 dark:text-studio-500 cursor-not-allowed'}`}
        >
          <Check size={14} />
          {hasChanges ? '保存配置' : '已保存'}
        </button>
      </div>

      {/* ========== 使用说明 ========== */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-lg p-3 text-xs text-amber-800 dark:text-amber-300 space-y-1">
        <p className="font-bold flex items-center gap-1">
          <AlertCircle size={12} />
          使用说明
        </p>
        <ul className="list-disc list-inside space-y-0.5 text-[11px] opacity-90">
          <li><b>Gemini API</b>：使用 Google 官方 Gemini 服务</li>
          <li><b>通用 API</b>：支持 OpenAI 兼容格式的第三方服务</li>
          <li>所有配置安全存储在浏览器本地，不会上传服务器</li>
        </ul>
      </div>
    </div>
  );
};
