import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HeartPulse,
  Loader2,
  Mail,
  Lock,
  ArrowRight,
  Shield,
  Users,
  Sparkles,
  CheckCircle2,
  Stethoscope,
  Calendar,
  Bot,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { useAuth } from '../contexts/AuthContext';
import { getDefaultPortalPath } from '../types';

// Feature card component for left side
const FeatureCard = ({
  icon: Icon,
  title,
  description,
  delay,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="flex items-start gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm"
  >
    <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
      <Icon className="h-5 w-5 text-white" />
    </div>
    <div>
      <h3 className="font-semibold text-white">{title}</h3>
      <p className="text-sm text-white/70 mt-0.5">{description}</p>
    </div>
  </motion.div>
);

// Trust badge component
const TrustBadge = ({ icon: Icon, text }: { icon: React.ElementType; text: string }) => (
  <div className="flex items-center gap-2 text-white/80 text-sm">
    <Icon className="h-4 w-4" />
    <span>{text}</span>
  </div>
);

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check for success message from registration
  const successMessage = location.state?.message;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login({ email, password });
      navigate(getDefaultPortalPath(user));
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
    <div className="min-h-screen flex">
      {/* Left Side - Branding & Features (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-teal-500 to-cyan-500" />

        {/* Pattern Overlay */}
        <div className="absolute inset-0 bg-medical-pattern opacity-10" />

        {/* Decorative Elements */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-400/10 rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          {/* Logo */}
          <Link to="/" className="inline-flex items-center gap-2.5 group w-fit">
            <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <HeartPulse className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl">{t('brand.name')}</span>
          </Link>

          {/* Main Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl xl:text-5xl font-bold leading-tight"
              >
                {t('login.hero.title')}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg text-white/80 max-w-md"
              >
                {t('login.hero.subtitle')}
              </motion.p>
            </div>

            {/* Feature Cards */}
            <div className="space-y-3">
              <FeatureCard
                icon={Stethoscope}
                title={t('login.features.doctors.title')}
                description={t('login.features.doctors.desc')}
                delay={0.3}
              />
              <FeatureCard
                icon={Calendar}
                title={t('login.features.appointments.title')}
                description={t('login.features.appointments.desc')}
                delay={0.4}
              />
              <FeatureCard
                icon={Bot}
                title={t('login.features.ai.title')}
                description={t('login.features.ai.desc')}
                delay={0.5}
              />
            </div>
          </div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap gap-6"
          >
            <TrustBadge icon={Shield} text={t('login.trust.secure')} />
            <TrustBadge icon={Users} text={t('login.trust.patients')} />
            <TrustBadge icon={Sparkles} text={t('login.trust.ai')} />
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-white">
        {/* Mobile Header */}
        <header className="lg:hidden p-4 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="h-9 w-9 rounded-xl healthcare-gradient flex items-center justify-center shadow-sm">
              <HeartPulse className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-gradient">{t('brand.name')}</span>
          </Link>
          <LanguageSwitcher />
        </header>

        {/* Desktop Language Switcher */}
        <div className="hidden lg:flex justify-end p-6">
          <LanguageSwitcher />
        </div>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
          <div className="w-full max-w-md">
            {/* Welcome Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 shadow-lg shadow-teal-500/25 mx-auto mb-4">
                <HeartPulse className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{t('login.title')}</h1>
              <p className="text-muted-foreground mt-1">{t('login.subtitle')}</p>
            </motion.div>

            {/* Form Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 sm:p-8"
            >
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Success Message */}
                <AnimatePresence>
                  {successMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-3 rounded-lg bg-green-50 border border-green-100 text-sm text-green-600 flex items-center gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                      {successMessage}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    {t('common.email')}
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder={t('placeholders.email')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                      autoComplete="email"
                      className="h-12 text-base pl-10 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium">
                      {t('common.password')}
                    </Label>
                    <Link
                      to="/forgot-password"
                      className="text-xs text-teal-600 hover:text-teal-700 transition-colors"
                    >
                      {t('login.forgotPassword')}
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder={t('login.passwordPlaceholder')}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="h-12 text-base pl-10 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg shadow-teal-500/25 text-base"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      {t('common.signingIn')}
                    </>
                  ) : (
                    <>
                      {t('common.signIn')}
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </>
                  )}
                </Button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">
                      {t('login.newHere')}
                    </span>
                  </div>
                </div>

                {/* Register Link */}
                <Link to="/register" className="block">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 border-gray-200 hover:bg-gray-50 text-base"
                  >
                    {t('login.createAccount')}
                  </Button>
                </Link>
              </form>
            </motion.div>

            {/* Footer */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center text-xs text-muted-foreground mt-8"
            >
              {t('login.secureNote')}
            </motion.p>
          </div>
        </main>
      </div>
    </div>
  );
};
