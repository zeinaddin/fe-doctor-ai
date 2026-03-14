import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  HeartPulse,
  Loader2,
  User,
  Mail,
  Lock,
  CheckCircle2,
  Sparkles,
  Shield,
  Clock,
  Phone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { authService } from '../../services/authService';

const TOTAL_STEPS = 3;

// Step indicator component
const StepIndicator = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div key={index} className="flex items-center">
          <motion.div
            className={`h-2.5 rounded-full transition-all duration-300 ${
              index < currentStep
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 w-8'
                : index === currentStep
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 w-8'
                : 'bg-gray-200 w-2.5'
            }`}
            initial={{ scale: 0.8 }}
            animate={{ scale: index === currentStep ? 1.1 : 1 }}
            transition={{ duration: 0.2 }}
          />
        </div>
      ))}
    </div>
  );
};

// Feature badge component
const FeatureBadge = ({ icon: Icon, text }: { icon: React.ElementType; text: string }) => (
  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-xs font-medium">
    <Icon className="h-3.5 w-3.5" />
    <span>{text}</span>
  </div>
);

// Animation variants
const pageVariants = {
  initial: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      x: { type: 'spring' as const, stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 },
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -100 : 100,
    opacity: 0,
    transition: {
      x: { type: 'spring' as const, stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 },
    },
  }),
};

export const PatientRegister: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
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
    setError('');
  };

  const validateStep = () => {
    switch (currentStep) {
      case 0:
        if (!formData.firstName.trim() || !formData.lastName.trim()) {
          setError(t('register.errors.nameRequired'));
          return false;
        }
        break;
      case 1:
        if (!formData.email.trim()) {
          setError(t('register.errors.emailRequired'));
          return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          setError(t('register.errors.emailInvalid'));
          return false;
        }
        break;
      case 2:
        if (!formData.password) {
          setError(t('register.errors.passwordRequired'));
          return false;
        }
        if (formData.password.length < 8) {
          setError(t('register.errors.passwordTooShort'));
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError(t('auth.passwordMismatch'));
          return false;
        }
        break;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setDirection(1);
      setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS - 1));
    }
  };

  const prevStep = () => {
    setDirection(-1);
    setError('');
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep()) return;

    setLoading(true);
    setError('');

    try {
      await authService.register({
        email: formData.email,
        password: formData.password,
        full_name: `${formData.firstName} ${formData.lastName}`,
        phone: formData.phone || undefined,
        role: 'PATIENT',
      });

      navigate('/login', {
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentStep < TOTAL_STEPS - 1) {
      e.preventDefault();
      nextStep();
    }
  };

  // Step content components
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            key="step-0"
            custom={direction}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-6"
          >
            {/* Step Header */}
            <div className="text-center space-y-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 shadow-lg shadow-teal-500/25 mx-auto"
              >
                <User className="h-8 w-8 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900">{t('register.step1.title')}</h2>
              <p className="text-muted-foreground">{t('register.step1.subtitle')}</p>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium">
                  {t('common.firstName')}
                </Label>
                <Input
                  id="firstName"
                  placeholder={t('placeholders.firstName')}
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  onKeyDown={handleKeyDown}
                  required
                  autoFocus
                  className="h-12 text-base bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium">
                  {t('common.lastName')}
                </Label>
                <Input
                  id="lastName"
                  placeholder={t('placeholders.lastName')}
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  onKeyDown={handleKeyDown}
                  required
                  className="h-12 text-base bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                />
              </div>
            </div>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            key="step-1"
            custom={direction}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-6"
          >
            {/* Step Header */}
            <div className="text-center space-y-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 shadow-lg shadow-teal-500/25 mx-auto"
              >
                <Mail className="h-8 w-8 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900">{t('register.step2.title')}</h2>
              <p className="text-muted-foreground">{t('register.step2.subtitle')}</p>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
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
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    onKeyDown={handleKeyDown}
                    required
                    autoComplete="email"
                    autoFocus
                    className="h-12 text-base pl-10 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  {t('common.phone')} <span className="text-muted-foreground font-normal">({t('common.optional')})</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder={t('placeholders.phone')}
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="h-12 text-base pl-10 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step-2"
            custom={direction}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-6"
          >
            {/* Step Header */}
            <div className="text-center space-y-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 shadow-lg shadow-teal-500/25 mx-auto"
              >
                <Lock className="h-8 w-8 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900">{t('register.step3.title')}</h2>
              <p className="text-muted-foreground">{t('register.step3.subtitle')}</p>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  {t('common.password')}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder={t('register.step3.passwordPlaceholder')}
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    onKeyDown={handleKeyDown}
                    required
                    autoComplete="new-password"
                    autoFocus
                    className="h-12 text-base pl-10 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                  />
                </div>
                <p className="text-xs text-muted-foreground">{t('register.step3.passwordHint')}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  {t('common.confirmPassword')}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder={t('register.step3.confirmPlaceholder')}
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    required
                    autoComplete="new-password"
                    className="h-12 text-base pl-10 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Password match indicator */}
            {formData.password && formData.confirmPassword && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-2 text-sm ${
                  formData.password === formData.confirmPassword
                    ? 'text-green-600'
                    : 'text-red-500'
                }`}
              >
                {formData.password === formData.confirmPassword ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{t('register.step3.passwordsMatch')}</span>
                  </>
                ) : (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-current" />
                    <span>{t('register.step3.passwordsNoMatch')}</span>
                  </>
                )}
              </motion.div>
            )}
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex theme-patient">
      {/* Left Side - Branding & Features (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-teal-500 to-cyan-500" />

        {/* Pattern Overlay */}
        <div className="absolute inset-0 bg-medical-pattern opacity-10" />

        {/* Decorative Elements */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl" />

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
                transition={{ delay: 0.2 }}
                className="text-4xl xl:text-5xl font-bold leading-tight"
              >
                {t('register.hero.title')}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg text-white/80 max-w-md"
              >
                {t('register.hero.subtitle')}
              </motion.p>
            </div>

            {/* Feature Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-3"
            >
              <FeatureBadge icon={Shield} text={t('register.features.secure')} />
              <FeatureBadge icon={Clock} text={t('register.features.fast')} />
              <FeatureBadge icon={Sparkles} text={t('register.features.ai')} />
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-3 gap-6 pt-4"
            >
              <div>
                <div className="text-3xl font-bold">50K+</div>
                <div className="text-sm text-white/70">{t('register.stats.patients')}</div>
              </div>
              <div>
                <div className="text-3xl font-bold">500+</div>
                <div className="text-sm text-white/70">{t('register.stats.doctors')}</div>
              </div>
              <div>
                <div className="text-3xl font-bold">4.9</div>
                <div className="text-sm text-white/70">{t('register.stats.rating')}</div>
              </div>
            </motion.div>
          </div>

          {/* Footer */}
          <div className="text-sm text-white/60">
            {t('register.hero.trusted')}
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
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
            {/* Step Indicator */}
            <div className="mb-8">
              <StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />
              <p className="text-center text-sm text-muted-foreground mt-3">
                {t('register.stepIndicator', { current: currentStep + 1, total: TOTAL_STEPS })}
              </p>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 sm:p-8">
              <form onSubmit={handleSubmit}>
                {/* Error Message */}
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mb-6 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Step Content */}
                <AnimatePresence mode="wait" custom={direction}>
                  {renderStepContent()}
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex gap-3 mt-8">
                  {currentStep > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      className="h-12 px-6"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      {t('common.back')}
                    </Button>
                  )}

                  {currentStep < TOTAL_STEPS - 1 ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="flex-1 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg shadow-teal-500/25"
                    >
                      {t('common.next')}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg shadow-teal-500/25"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          {t('common.creatingAccount')}
                        </>
                      ) : (
                        <>
                          {t('register.createAccount')}
                          <CheckCircle2 className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </form>

              {/* Sign in link */}
              <p className="text-center text-sm text-muted-foreground mt-6">
                {t('auth.hasAccount')}{' '}
                <Link
                  to="/login"
                  className="font-medium text-teal-600 hover:text-teal-700 transition-colors"
                >
                  {t('common.signIn')}
                </Link>
              </p>
            </div>

            {/* Terms */}
            <p className="text-center text-xs text-muted-foreground mt-6 px-4">
              {t('register.terms.text')}{' '}
              <Link to="/terms" className="underline hover:text-foreground">
                {t('register.terms.termsLink')}
              </Link>{' '}
              {t('register.terms.and')}{' '}
              <Link to="/privacy" className="underline hover:text-foreground">
                {t('register.terms.privacyLink')}
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};
