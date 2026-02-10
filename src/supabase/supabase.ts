import { createClient } from '@supabase/supabase-js'

// 使用环境变量，如果没有配置则使用默认值
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://aafssknttedpznxoiorb.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhZnNza250dGVkcHpueG9pb3JiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3NjUxODAsImV4cCI6MjA2NDM0MTE4MH0.1HZJlcJF2qEc2vUkaoqlo42yF801TPAcdq3ngSgkuJ4'

const DEFAULT_TIMEOUT_MS = 30000;

function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit, timeoutMs: number = DEFAULT_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const mergedInit: RequestInit = {
    ...init,
    signal: init?.signal ?? controller.signal,
    // 尝试在页面隐藏/卸载时也发送完成请求
    keepalive: init?.keepalive ?? true
  };
  return fetch(input, mergedInit).finally(() => clearTimeout(timer));
}

// Supabase 客户端：启用会话持久化以保持登录状态，但数据库操作仍使用 anon 角色
const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    fetch: (input: RequestInfo | URL, init?: RequestInit) => fetchWithTimeout(input, init)
  },
  auth: {
    autoRefreshToken: false,  // 禁用自动刷新
    persistSession: true,     // 启用会话持久化，保持登录状态
    detectSessionInUrl: false // 不从 URL 检测会话
  }
})

export default supabase;
