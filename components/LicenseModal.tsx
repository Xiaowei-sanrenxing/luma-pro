import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, Loader2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { useAppStore } from '../store';
import { licenseService } from '../services/licenseService';

export const LicenseModal: React.FC = () => {
  const { user, showLicenseModal, setShowLicenseModal, setUserLicense } = useAppStore();
  const [code, setCode] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // 自动格式化授权码: LUMA-XXXX-XXXX-XXXX
  const formatCode = (value: string) => {
    const cleaned = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    const parts: string[] = [];

    // 前4位是 LUMA
    if (cleaned.startsWith('LUMA')) {
      parts.push('LUMA');
      const rest = cleaned.slice(4);
      if (rest.length > 0) parts.push(rest.slice(0, 4));
      if (rest.length > 4) parts.push(rest.slice(4, 8));
      if (rest.length > 8) parts.push(rest.slice(8, 12));
    } else {
      // 如果用户没输入 LUMA 前缀
      if (cleaned.length > 0) parts.push(cleaned.slice(0, 4));
      if (cleaned.length > 4) parts.push(cleaned.slice(4, 8));
      if (cleaned.length > 8) parts.push(cleaned.slice(8, 12));
      if (cleaned.length > 12) parts.push(cleaned.slice(12, 16));
    }

    return parts.join('-');
  };

  const handleActivate = async () => {
    if (!user || !code.trim()) return;

    setIsActivating(true);
    setError(null);

    try {
      const result = await licenseService.activateLicense(code.trim(), user.id);
      setSuccess(true);

      // 更新授权状态
      setUserLicense({
        hasValidLicense: true,
        licenseType: result.licenseType,
        expiresAt: result.expiresAt,
        isPermanent: !result.expiresAt
      });

      // 延迟关闭
      setTimeout(() => {
        setShowLicenseModal(false);
        setSuccess(false);
        setCode('');
      }, 1500);
    } catch (e: any) {
      setError(e.message || '激活失败');
    } finally {
      setIsActivating(false);
    }
  };

  const handleClose = () => {
    if (!isActivating) {
      setShowLicenseModal(false);
      setCode('');
      setError(null);
    }
  };

  if (!showLicenseModal) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white dark:bg-studio-900 rounded-2xl shadow-2xl w-full max-w-md p-6 m-4 border border-studio-100 dark:border-studio-800"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                <Key size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-studio-900 dark:text-white">激活授权</h2>
                <p className="text-xs text-studio-500 dark:text-studio-400">输入授权码解锁 AI 功能</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isActivating}
              className="p-2 text-studio-400 hover:text-studio-900 dark:hover:text-white rounded-lg hover:bg-studio-100 dark:hover:bg-studio-800 transition-all disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>

          {/* Info Banner */}
          <div className="mb-5 p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl flex items-start gap-3">
            <Sparkles size={18} className="text-indigo-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">
              授权码可解锁 AI 图片生成、智能换脸、背景替换等高级功能。授权码仅限一个账户使用。
            </p>
          </div>

          {/* Input */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-studio-600 dark:text-studio-300 mb-2">授权码</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(formatCode(e.target.value))}
                placeholder="LUMA-XXXX-XXXX-XXXX"
                maxLength={19}
                className="w-full p-4 text-center text-lg font-mono tracking-widest bg-studio-50 dark:bg-studio-800 border-2 border-studio-200 dark:border-studio-700 rounded-xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all uppercase placeholder:text-studio-300 dark:placeholder:text-studio-600"
                disabled={isActivating || success}
                autoFocus
              />
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm"
                >
                  <AlertCircle size={16} className="flex-shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Message */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl text-emerald-600 dark:text-emerald-400 text-sm"
                >
                  <CheckCircle2 size={16} className="flex-shrink-0" />
                  激活成功！AI 功能已解锁
                </motion.div>
              )}
            </AnimatePresence>

            {/* Activate Button */}
            <button
              onClick={handleActivate}
              disabled={!code.trim() || code.length < 10 || isActivating || success}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 active:scale-[0.98]"
            >
              {isActivating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  激活中...
                </>
              ) : success ? (
                <>
                  <CheckCircle2 size={18} />
                  已激活
                </>
              ) : (
                '立即激活'
              )}
            </button>
          </div>

          {/* Footer */}
          <p className="mt-5 text-center text-xs text-studio-400 dark:text-studio-500">
            授权码可从官方渠道获取 · 一码仅限一个账户使用
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
