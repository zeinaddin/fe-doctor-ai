import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, HeartPulse, Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { useAuth } from '../../contexts/AuthContext';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login({ email, password });

      if (!user.is_admin) {
        setError(t('auth.accessDenied.admin'));
        setLoading(false);
        return;
      }

      navigate('/admin/dashboard');
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        t('auth.invalidCredentials');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background theme-admin">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-medical-pattern opacity-50" />
      <div className="fixed inset-0 bg-gradient-to-br from-violet-50/80 via-transparent to-purple-50/50" />

      {/* Header */}
      <header className="relative z-10 p-6 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-xl healthcare-gradient flex items-center justify-center shadow-sm">
            <HeartPulse className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-gradient">{t('brand.name')}</span>
        </Link>
        <LanguageSwitcher />
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex items-center justify-center px-6 py-12 min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 mb-4 shadow-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gradient-admin">{t('auth.admin.title')}</h1>
              <p className="text-muted-foreground mt-2">
                {t('auth.admin.subtitle')}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600 animate-fade-in">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">{t('common.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('placeholders.adminEmail')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  autoComplete="email"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('common.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t('placeholders.password')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="h-11"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('common.signingIn')}
                  </>
                ) : (
                  <>
                    {t('common.signIn')}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-muted-foreground">
                  {t('common.otherPortals')}
                </span>
              </div>
            </div>

            {/* Portal links */}
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" size="sm" asChild className="h-10">
                <Link to="/patient/login">{t('portal.patient')}</Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="h-10">
                <Link to="/doctor/login">{t('portal.doctor')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
