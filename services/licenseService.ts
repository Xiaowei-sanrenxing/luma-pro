import { supabase } from './supabaseClient';
import type { LicenseType, UserLicense } from '../types';

export const licenseService = {
  // 检查用户授权状态
  async checkLicense(userId: string): Promise<UserLicense> {
    try {
      const { data, error } = await supabase.rpc('check_user_license', {
        p_user_id: userId
      });

      if (error) {
        console.error('[License] Check error:', error);
        return { hasValidLicense: false };
      }

      return {
        hasValidLicense: data?.has_valid_license || false,
        licenseType: data?.license_type as LicenseType | undefined,
        expiresAt: data?.expires_at || null,
        isPermanent: data?.is_permanent || false
      };
    } catch (e) {
      console.error('[License] Check exception:', e);
      return { hasValidLicense: false };
    }
  },

  // 激活授权码
  async activateLicense(code: string, userId: string): Promise<{
    licenseType: LicenseType;
    expiresAt: string | null;
  }> {
    const { data, error } = await supabase.rpc('activate_license_code', {
      p_code: code.toUpperCase().trim(),
      p_user_id: userId
    });

    if (error) {
      console.error('[License] Activate error:', error);
      throw new Error('激活失败，请稍后重试');
    }

    if (!data?.success) {
      const errorMessages: Record<string, string> = {
        'INVALID_CODE': '授权码不存在，请检查输入',
        'ALREADY_ACTIVATED': '该授权码已被使用'
      };
      throw new Error(errorMessages[data?.error] || data?.message || '激活失败');
    }

    return {
      licenseType: data.license_type,
      expiresAt: data.expires_at
    };
  },

  // 获取用户授权历史
  async getLicenseHistory(userId: string) {
    const { data, error } = await supabase
      .from('user_licenses')
      .select(`
        id,
        license_type,
        activated_at,
        expires_at,
        is_active,
        license_codes (code)
      `)
      .eq('user_id', userId)
      .order('activated_at', { ascending: false });

    if (error) {
      console.error('[License] History error:', error);
      return [];
    }

    return data || [];
  },

  // 格式化授权类型显示
  formatLicenseType(type: LicenseType): string {
    const labels: Record<LicenseType, string> = {
      trial: '3天试用',
      annual: '年度会员',
      permanent: '永久会员'
    };
    return labels[type] || type;
  },

  // 格式化过期时间显示
  formatExpiresAt(expiresAt: string | null, isPermanent?: boolean): string {
    if (isPermanent || !expiresAt) return '永久有效';

    const date = new Date(expiresAt);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0) return '已过期';
    if (days === 0) return '今天到期';
    if (days === 1) return '明天到期';
    if (days <= 7) return `${days}天后到期`;

    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} 到期`;
  }
};
