import { useCallback, useEffect } from 'react';
import { useAppStore } from '../store';
import { licenseService } from '../services/licenseService';
import { isSupabaseConfigured } from '../services/supabaseClient';

export const useLicense = () => {
  const {
    user,
    userLicense,
    isLicenseLoading,
    showLicenseModal,
    setUserLicense,
    setIsLicenseLoading,
    setShowLicenseModal,
  } = useAppStore();

  // 检查用户授权状态
  const checkLicense = useCallback(async (): Promise<boolean> => {
    // 如果 Supabase 未配置，跳过授权检查（开发模式）
    if (!isSupabaseConfigured()) {
      console.log('[License] Supabase not configured, skipping license check');
      setUserLicense({ hasValidLicense: true, isPermanent: true });
      return true;
    }

    if (!user) {
      setUserLicense(null);
      return false;
    }

    setIsLicenseLoading(true);
    try {
      const license = await licenseService.checkLicense(user.id);
      setUserLicense(license);
      return license.hasValidLicense;
    } catch (e) {
      console.error('[License] Check failed:', e);
      setUserLicense({ hasValidLicense: false });
      return false;
    } finally {
      setIsLicenseLoading(false);
    }
  }, [user, setUserLicense, setIsLicenseLoading]);

  // 用户登录后自动检查授权
  useEffect(() => {
    if (user && userLicense === null && isSupabaseConfigured()) {
      checkLicense();
    }
  }, [user, userLicense, checkLicense]);

  // 检查过期状态（本地快速检查）
  const isLicenseExpired = useCallback((): boolean => {
    if (!userLicense) return true;
    if (!userLicense.hasValidLicense) return true;
    if (userLicense.isPermanent || !userLicense.expiresAt) return false;

    return new Date(userLicense.expiresAt) < new Date();
  }, [userLicense]);

  // 执行需要授权的操作
  const requireLicense = useCallback(async <T,>(
    callback: () => T | Promise<T>
  ): Promise<T | null> => {
    // 如果 Supabase 未配置，直接执行（开发模式）
    if (!isSupabaseConfigured()) {
      return await callback();
    }

    if (!user) {
      console.warn('[License] User not logged in');
      return null;
    }

    // 快速路径：本地缓存有效
    if (userLicense?.hasValidLicense && !isLicenseExpired()) {
      return await callback();
    }

    // 服务端重新验证
    const isValid = await checkLicense();
    if (isValid) {
      return await callback();
    }

    // 无有效授权，弹出激活框
    setShowLicenseModal(true);
    return null;
  }, [user, userLicense, isLicenseExpired, checkLicense, setShowLicenseModal]);

  // 获取授权状态显示文本
  const getLicenseStatusText = useCallback((): string => {
    if (!userLicense || !userLicense.hasValidLicense) {
      return '未授权';
    }

    const typeText = licenseService.formatLicenseType(userLicense.licenseType!);
    const expiresText = licenseService.formatExpiresAt(
      userLicense.expiresAt || null,
      userLicense.isPermanent
    );

    return `${typeText} · ${expiresText}`;
  }, [userLicense]);

  return {
    // 状态
    userLicense,
    isLicenseLoading,
    showLicenseModal,
    hasValidLicense: userLicense?.hasValidLicense || false,
    isPermanent: userLicense?.isPermanent || false,

    // 方法
    checkLicense,
    requireLicense,
    isLicenseExpired,
    getLicenseStatusText,

    // 弹窗控制
    openLicenseModal: () => setShowLicenseModal(true),
    closeLicenseModal: () => setShowLicenseModal(false),
  };
};
