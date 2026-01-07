import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {Activity, ArrowRight, HeartPulse, Loader2} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { authService } from '../../services/authService';

export const PatientRegister: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    if (formData.password.length < 6) {
      setError(t('auth.passwordTooShort'));
      return;
    }

    setLoading(true);

    try {
      await authService.register({
        email: formData.email,
        password: formData.password,
        full_name: `${formData.firstName} ${formData.lastName}`,
        phone: formData.phone,
        role: 'PATIENT',
      });

      navigate('/patient/login', {
        state: { message: t('auth.registrationSuccess') },
      });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        t('auth.registrationFailed');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background theme-patient">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-medical-pattern opacity-50" />
      <div className="fixed inset-0 bg-gradient-to-br from-sky-50/80 via-transparent to-blue-50/50" />

      {/* Header */}
      <header className="relative z-10 p-6 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-xl healthcare-gradient flex items-center justify-center shadow-sm">
            <HeartPulse className="h-5 w-5 text-white bg-gradient-to-br"/>
          </div>
          <span className="font-bold text-gradient">{t('brand.name')}</span>
        </Link>
        <LanguageSwitcher />
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="flex justify-center">
                <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
                  <Activity className="h-6 w-6 text-primary-foreground"/>
                </div>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">{t('auth.welcomeBack')}</h1>
              <p className="text-muted-foreground">{t('auth.signInToContinue')}</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600 animate-fade-in">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t('common.firstName')}</Label>
                  <Input
                    id="firstName"
                    placeholder={t('placeholders.firstName')}
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    required
                    autoFocus
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{t('common.lastName')}</Label>
                  <Input
                    id="lastName"
                    placeholder={t('placeholders.lastName')}
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t('common.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('placeholders.email')}
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                  autoComplete="email"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t('common.phone')}</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder={t('placeholders.phone')}
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('common.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t('auth.createPassword')}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  required
                  autoComplete="new-password"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('common.confirmPassword')}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder={t('auth.confirmYourPassword')}
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  required
                  autoComplete="new-password"
                  className="h-11"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('common.creatingAccount')}
                  </>
                ) : (
                  <>
                    {t('auth.patient.createAccount')}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Sign in link */}
            <p className="text-center text-sm text-muted-foreground mt-6">
              {t('auth.hasAccount')}{' '}
              <Link
                to="/patient/login"
                className="font-medium text-sky-600 hover:text-sky-700 transition-colors"
              >
                {t('common.signIn')}
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
