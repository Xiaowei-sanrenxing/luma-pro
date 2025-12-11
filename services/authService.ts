import { supabase } from './supabaseClient';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

// 将 Supabase User 转换为应用 User
const mapSupabaseUser = (user: SupabaseUser): AuthUser => ({
  id: user.id,
  email: user.email || '',
  name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
  avatar: user.user_metadata?.avatar_url
});

export const authService = {
  // 邮箱注册
  async signUp(email: string, password: string, name?: string): Promise<AuthUser> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: name || email.split('@')[0] }
      }
    });

    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('注册失败，请稍后重试');

    return mapSupabaseUser(data.user);
  },

  // 邮箱登录
  async signIn(email: string, password: string): Promise<AuthUser> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('邮箱或密码错误');
      }
      throw new Error(error.message);
    }
    if (!data.user) throw new Error('登录失败，请稍后重试');

    return mapSupabaseUser(data.user);
  },

  // OAuth 登录 (Google/GitHub)
  async signInWithOAuth(provider: 'google' | 'github'): Promise<void> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}`
      }
    });

    if (error) throw new Error(error.message);
  },

  // 登出
  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  },

  // 获取当前用户
  async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return mapSupabaseUser(user);
  },

  // 获取当前 Session
  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  // 监听 Auth 状态变化
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        callback(mapSupabaseUser(session.user));
      } else {
        callback(null);
      }
    });
  }
};
