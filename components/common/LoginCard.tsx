"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { API_ENDPOINTS } from '@/lib/api/config';
import { http } from '@/lib/api/http';
import { Eye, EyeOff, Lock, User } from 'lucide-react';

type FormType = 'login' | 'register';

export default function LoginCard() {
  const [formType, setFormType] = useState<FormType>('login');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    let result;
    if (formType === 'login') {
      result = await http.post(API_ENDPOINTS.auth.login, {
        username: formData.username,
        password: formData.password,
      });
    } else {
      result = await http.post(API_ENDPOINTS.auth.register, {
        username: formData.username,
        password: formData.password,
      });
    }

    if (result.success) {
      // 登录成功后保存用户信息并跳转
      if (formType === 'login') {
        // 后端返回结构: { status_code, message, success, data: { token, username, avatar_path, updated_time, created_time } }
        const innerData = (result.data as any)?.data;
        const token = innerData?.token;
        const username = innerData?.username || formData.username;
        const avatarPath = innerData?.avatar_path;
        const updatedTime = innerData?.updated_time;
        const createdTime = innerData?.created_time;

        if (token) {
          localStorage.setItem('auth_token', token);
          localStorage.setItem('username', username);
        }
        if (avatarPath) {
          localStorage.setItem('avatar_filename', avatarPath);
        } else {
          localStorage.removeItem('avatar_filename');
        }
        if (updatedTime) {
          localStorage.setItem('updated_time', updatedTime);
        }
        if (createdTime) {
          localStorage.setItem('created_time', createdTime);
        }
        // 跳转到仪表盘
        window.location.href = '/dashboard';
      } else {
        // 注册成功，切换到登录
        setSuccess('注册成功！请登录');
        setTimeout(() => {
          setFormType('login');
          setFormData({ username: formData.username, password: '' });
          setSuccess('');
        }, 2000);
      }
    } else {
      setError(result.error || `${formType === 'login' ? '登录' : '注册'}失败`);
    }
    
    setLoading(false);
  };

  const handleInputChange = (field: 'username' | 'password', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <div className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center size-14 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 mb-4">
            <Lock className="size-7 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">
            {formType === 'login' ? '欢迎登录' : '用户注册'}
          </h2>
          <p className="text-muted-foreground mt-2">
            {formType === 'login' ? '请输入您的账号信息' : '创建您的账号'}
          </p>
        </div>

        {/* Tab Switch */}
        <div className="flex bg-muted/50 rounded-lg p-1 mb-6">
          <button
            onClick={() => setFormType('login')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              formType === 'login'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            登录
          </button>
          <button
            onClick={() => setFormType('register')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              formType === 'register'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            注册
          </button>
        </div>

        {/* Form */}
        <AnimatePresence mode="wait">
          <motion.form
            key={formType}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Username */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">用户名</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="请输入用户名"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder={formType === 'login' ? '请输入密码' : '请设置密码（至少6位）'}
                  className="w-full pl-10 pr-12 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="text-destructive text-sm"
              >
                {error}
              </motion.p>
            )}

            {/* Success message */}
            {success && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="text-green-500 text-sm"
              >
                {success}
              </motion.p>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              className="w-full h-12 text-base"
              disabled={loading}
            >
              {loading ? (formType === 'login' ? '登录中...' : '注册中...') : (formType === 'login' ? '登录' : '注册')}
            </Button>
          </motion.form>
        </AnimatePresence>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            {formType === 'login' ? '没有账号？' : '已有账号？'}{' '}
            <button
              onClick={() => setFormType(formType === 'login' ? 'register' : 'login')}
              className="text-primary hover:underline"
            >
              {formType === 'login' ? '立即注册' : '立即登录'}
            </button>
          </p>
        </div>
      </div>
    </motion.div>
  );
}