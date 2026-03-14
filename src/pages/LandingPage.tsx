import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Bot,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  FileText,
  Heart,
  HeartPulse,
  Lock,
  MessageCircle,
  Shield,
  Sparkles,
  Star,
  Stethoscope,
  Users,
  Zap,
  Activity,
  Smartphone,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { cn } from '@/lib/utils';
import heroImage from '/assets/hero-doctor.png';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

// Hero Section Component
const HeroSection: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
  const { t } = useTranslation();

  return (
    <section className="relative pt-28 pb-20 lg:pb-32 px-6 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[image:var(--hero-gradient)] opacity-[0.03] rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent opacity-[0.04] rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
      <div className="absolute inset-0 bg-medical-pattern opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 text-primary text-sm font-medium mb-6 border border-primary/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            {t('landing.hero.badge', 'Now accepting new patients')}
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] xl:text-6xl font-bold text-foreground leading-[1.1] mb-6 tracking-tight">
            {t('landing.hero.title')},{' '}
            <span className="hero-text-gradient">{t('landing.hero.titleHighlight', 'Simplified')}</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mb-8 leading-relaxed">
            {t('landing.hero.subtitle')}
          </p>

          {/* Single CTA */}
          <Button
            variant="hero"
            size="lg"
            className="gap-2 text-base px-8 h-14 rounded-xl shadow-lg shadow-primary/20"
            onClick={onGetStarted}
          >
            {t('landing.hero.cta')} <ArrowRight className="w-5 h-5" />
          </Button>

          {/* Trust indicators */}
          <div className="mt-10 flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-cyan-500 border-[3px] border-background flex items-center justify-center text-xs font-bold text-white shadow-md"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-0.5 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  <strong className="text-foreground">50,000+</strong> {t('landing.hero.patients', 'happy patients')}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Hero Image with floating cards */}
        <motion.div
          className="relative flex justify-center lg:justify-end"
          initial="hidden"
          animate="visible"
          variants={scaleIn}
          transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
        >
          {/* Glow effect behind image */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-cyan-400/10 to-transparent rounded-full blur-3xl scale-90" />

          {/* Floating appointment card */}
          <motion.div
            className="absolute top-4 right-0 lg:right-8 bg-white rounded-2xl shadow-xl p-4 border border-gray-100 z-20 max-w-[180px]"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center shadow-lg shadow-primary/25">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {t('landing.hero.floatingCard1Title', 'Next Appointment')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('landing.hero.floatingCard1Sub', 'Dr. Smith — 2:30 PM')}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Floating health score card */}
          <motion.div
            className="absolute bottom-20 left-0 lg:left-8 bg-white rounded-2xl shadow-xl p-4 border border-gray-100 z-20"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {t('landing.hero.floatingCard2Title', 'Health Score')}
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="w-[96%] h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full" />
                  </div>
                  <span className="text-xs font-medium text-emerald-600">96%</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* AI Assistant card */}
          <motion.div
            className="absolute top-1/2 -left-4 lg:left-0 bg-white rounded-2xl shadow-xl p-4 border border-gray-100 z-20"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {t('landing.hero.floatingCard3Title', 'AI Assistant')}
                </p>
                <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {t('landing.hero.floatingCard3Sub', 'Online')}
                </p>
              </div>
            </div>
          </motion.div>

          <img
            src={heroImage}
            alt="Doctor using digital healthcare platform"
            className="relative z-10 w-full max-w-lg drop-shadow-2xl"
          />
        </motion.div>
      </div>
    </section>
  );
};

// Trust Bar Component
const TrustBar: React.FC = () => {
  const { t } = useTranslation();

  const trustItems = [
    { icon: Shield, text: t('landing.trust.hipaa') },
    { icon: Lock, text: t('landing.trust.secure') },
    { icon: Clock, text: t('landing.trust.support') },
    { icon: Award, text: t('landing.trust.verified', 'Verified Doctors') },
  ];

  return (
    <motion.section
      className="py-8 border-y border-gray-100 bg-white"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeIn}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
          {trustItems.map((item, index) => (
            <div key={index} className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center">
                <item.icon className="h-4 w-4 text-primary" />
              </div>
              <span className="font-medium">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

// Stats Section Component
const StatsSection: React.FC = () => {
  const { t } = useTranslation();

  const stats = [
    { value: '50K+', label: t('stats.patientsServed'), icon: Users },
    { value: '500+', label: t('stats.verifiedDoctors'), icon: Stethoscope },
    { value: '50+', label: t('stats.specializations'), icon: Award },
    { value: '4.9', label: t('stats.patientRating'), icon: Star, suffix: '/5' },
  ];

  return (
    <motion.section
      className="py-20 bg-gradient-to-b from-gray-50/80 to-white"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={staggerContainer}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="relative text-center p-6 rounded-2xl bg-white border border-gray-100 shadow-sm"
              variants={fadeInUp}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                {stat.value}
                {stat.suffix && <span className="text-muted-foreground text-xl">{stat.suffix}</span>}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

// Benefits Section (replaces Portals)
const BenefitsSection: React.FC = () => {
  const { t } = useTranslation();

  const benefits = [
    {
      icon: Clock,
      title: t('landing.benefits.time.title', 'Save Time'),
      description: t('landing.benefits.time.desc', 'Book appointments in seconds, not hours. No more waiting on hold.'),
    },
    {
      icon: Shield,
      title: t('landing.benefits.secure.title', 'Secure & Private'),
      description: t('landing.benefits.secure.desc', 'Your health data is protected with bank-level encryption.'),
    },
    {
      icon: Smartphone,
      title: t('landing.benefits.access.title', 'Access Anywhere'),
      description: t('landing.benefits.access.desc', 'View records and manage appointments from any device.'),
    },
    {
      icon: Bot,
      title: t('landing.benefits.ai.title', 'AI-Powered'),
      description: t('landing.benefits.ai.desc', 'Get instant health insights and symptom analysis 24/7.'),
    },
  ];

  return (
    <section className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 text-primary text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            {t('landing.benefits.badge', 'Why Choose Us')}
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {t('landing.benefits.title', 'Healthcare That Works For You')}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('landing.benefits.subtitle', 'Experience the difference with our patient-first approach')}
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              className="group relative p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300"
              variants={fadeInUp}
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-cyan-500/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <benefit.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// Features Section Component
const FeaturesSection: React.FC = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: Bot,
      title: t('landing.features.ai.title'),
      description: t('landing.features.ai.description'),
      gradient: 'from-violet-500 to-purple-600',
      bgLight: 'bg-violet-50',
    },
    {
      icon: Calendar,
      title: t('landing.features.booking.title'),
      description: t('landing.features.booking.description'),
      gradient: 'from-sky-500 to-blue-600',
      bgLight: 'bg-sky-50',
    },
    {
      icon: FileText,
      title: t('landing.features.records.title'),
      description: t('landing.features.records.description'),
      gradient: 'from-teal-500 to-emerald-600',
      bgLight: 'bg-teal-50',
    },
    {
      icon: Shield,
      title: t('landing.features.secure.title'),
      description: t('landing.features.secure.description'),
      gradient: 'from-emerald-500 to-green-600',
      bgLight: 'bg-emerald-50',
    },
    {
      icon: MessageCircle,
      title: t('landing.features.telemedicine.title'),
      description: t('landing.features.telemedicine.description'),
      gradient: 'from-blue-500 to-indigo-600',
      bgLight: 'bg-blue-50',
    },
    {
      icon: Users,
      title: t('landing.features.verifiedProfessionals.title'),
      description: t('landing.features.verifiedProfessionals.description'),
      gradient: 'from-amber-500 to-orange-600',
      bgLight: 'bg-amber-50',
    },
  ];

  return (
    <section id="features" className="py-20 md:py-28 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 text-primary text-sm font-medium mb-4">
            <Zap className="h-4 w-4" />
            {t('landing.features.badge', 'Powerful Features')}
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {t('landing.features.title')}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('landing.features.subtitle')}
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="group relative p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
              variants={fadeInUp}
            >
              {/* Hover gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative z-10">
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br shadow-lg',
                    feature.gradient
                  )}
                >
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// How It Works Section
const HowItWorksSection: React.FC = () => {
  const { t } = useTranslation();

  const steps = [
    {
      step: '1',
      title: t('landing.howItWorks.step1Title', 'Create Account'),
      description: t('landing.howItWorks.step1Desc', 'Sign up in minutes. No credit card required.'),
      icon: Users,
    },
    {
      step: '2',
      title: t('landing.howItWorks.step2Title', 'Find Your Doctor'),
      description: t('landing.howItWorks.step2Desc', 'Browse specialists or use AI to get recommendations.'),
      icon: Stethoscope,
    },
    {
      step: '3',
      title: t('landing.howItWorks.step3Title', 'Book Appointment'),
      description: t('landing.howItWorks.step3Desc', 'Choose a time slot that works for you.'),
      icon: Calendar,
    },
    {
      step: '4',
      title: t('landing.howItWorks.step4Title', 'Get Care'),
      description: t('landing.howItWorks.step4Desc', 'Visit in-person or connect via video call.'),
      icon: Heart,
    },
  ];

  return (
    <section className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 text-primary text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            {t('landing.howItWorks.badge', 'Simple Process')}
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {t('landing.howItWorks.title', 'How It Works')}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('landing.howItWorks.subtitle', 'Get started in just 4 simple steps')}
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
        >
          {steps.map((step, index) => (
            <motion.div key={index} className="relative" variants={fadeInUp}>
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-14 left-[60%] w-full h-[2px]">
                  <div className="w-full h-full bg-gradient-to-r from-primary/40 to-primary/10" />
                </div>
              )}

              <div className="text-center">
                <div className="relative inline-flex mb-6">
                  <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-primary/5 to-cyan-500/5 flex items-center justify-center border border-primary/10">
                    <step.icon className="h-12 w-12 text-primary" />
                  </div>
                  <div className="absolute -top-3 -right-3 w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-primary/30">
                    {step.step}
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-[200px] mx-auto">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// Testimonials Section
const TestimonialsSection: React.FC = () => {
  const { t } = useTranslation();

  const testimonials = [
    {
      quote: t('landing.testimonials.quote1'),
      author: t('landing.testimonials.author1', 'Sarah Johnson'),
      role: t('landing.testimonials.role1', 'Patient'),
      rating: 5,
      avatar: 'SJ',
    },
    {
      quote: t('landing.testimonials.quote2'),
      author: t('landing.testimonials.author2', 'Dr. Michael Chen'),
      role: t('landing.testimonials.role2', 'Cardiologist'),
      rating: 5,
      avatar: 'MC',
    },
    {
      quote: t('landing.testimonials.quote3'),
      author: t('landing.testimonials.author3', 'Emily Rodriguez'),
      role: t('landing.testimonials.role3', 'Patient'),
      rating: 5,
      avatar: 'ER',
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 text-primary text-sm font-medium mb-4">
            <Star className="h-4 w-4" />
            {t('landing.testimonials.badge', 'Testimonials')}
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {t('landing.testimonials.title', 'Loved by Thousands')}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('landing.testimonials.subtitle', 'See what our users have to say')}
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="relative p-6 rounded-2xl bg-white border border-gray-100 shadow-sm"
              variants={fadeInUp}
            >
              {/* Quote mark */}
              <div className="absolute -top-3 left-6 text-6xl text-primary/10 font-serif leading-none">
                "
              </div>

              <div className="flex items-center gap-1 mb-4 text-amber-400">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-foreground mb-6 leading-relaxed relative z-10">{testimonial.quote}</p>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold text-sm">{testimonial.author}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// FAQ Section
const FAQSection: React.FC = () => {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: t('landing.faq.q1', 'How do I book an appointment?'),
      answer: t(
        'landing.faq.a1',
        'Simply create an account, search for a doctor by specialty or name, select an available time slot, and confirm your booking. You\'ll receive a confirmation email instantly.'
      ),
    },
    {
      question: t('landing.faq.q2', 'Is my health data secure?'),
      answer: t(
        'landing.faq.a2',
        'Absolutely. We use bank-level 256-bit encryption and are fully HIPAA compliant. Your data is never shared without your explicit consent.'
      ),
    },
    {
      question: t('landing.faq.q3', 'How does the AI assistant work?'),
      answer: t(
        'landing.faq.a3',
        'Our AI assistant analyzes your symptoms and provides preliminary guidance. It can recommend specialists, answer health questions, and help you prepare for appointments. It\'s available 24/7.'
      ),
    },
    {
      question: t('landing.faq.q4', 'Can I access my medical records?'),
      answer: t(
        'landing.faq.a4',
        'Yes! All your medical records, prescriptions, and visit history are securely stored and accessible from your dashboard anytime, anywhere.'
      ),
    },
  ];

  return (
    <section className="py-20 md:py-28">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div
          className="text-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 text-primary text-sm font-medium mb-4">
            <MessageCircle className="h-4 w-4" />
            {t('landing.faq.badge', 'FAQ')}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('landing.faq.title', 'Frequently Asked Questions')}
          </h2>
          <p className="text-muted-foreground text-lg">
            {t('landing.faq.subtitle', 'Everything you need to know')}
          </p>
        </motion.div>

        <motion.div
          className="space-y-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className="rounded-2xl border border-gray-200 bg-white overflow-hidden"
              variants={fadeInUp}
            >
              <button
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-medium pr-4">{faq.question}</span>
                <ChevronDown
                  className={cn(
                    'h-5 w-5 text-muted-foreground transition-transform duration-200 flex-shrink-0',
                    openIndex === index && 'rotate-180'
                  )}
                />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-5 pb-5 text-muted-foreground leading-relaxed">{faq.answer}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// CTA Section
const CTASection: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
  const { t } = useTranslation();

  return (
    <section className="py-20 md:py-28 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          className="relative rounded-3xl overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={scaleIn}
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-cyan-600 to-cyan-500" />

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10 p-8 md:p-12 lg:p-16 text-center text-white">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              {t('landing.cta.title')}
            </h2>
            <p className="text-white/80 text-lg max-w-2xl mx-auto mb-8">
              {t('landing.cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={onGetStarted}
                className="w-full sm:w-auto h-14 px-10 bg-white text-primary hover:bg-white/90 rounded-xl font-semibold text-base shadow-xl shadow-black/10"
              >
                {t('landing.cta.button')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-white/70 text-sm">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                <span>{t('landing.cta.noCreditCard', 'No credit card required')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                <span>{t('landing.cta.freeForever', 'Free to get started')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                <span>{t('landing.cta.cancelAnytime', 'Cancel anytime')}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Footer Component
const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="py-12 border-t border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center shadow-lg shadow-primary/20">
                <HeartPulse className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-2xl hero-text-gradient">{t('brand.name')}</span>
            </div>
            <p className="text-muted-foreground mb-6 max-w-sm">{t('brand.tagline')}</p>
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-primary/5 text-primary border border-primary/10">
                <Shield className="h-3.5 w-3.5" />
                {t('landing.trust.hipaa')}
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-primary/5 text-primary border border-primary/10">
                <Lock className="h-3.5 w-3.5" />
                {t('landing.trust.secure')}
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t('landing.footer.forPatients')}</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link to="/register" className="hover:text-foreground transition-colors">
                  {t('common.signUp')}
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-foreground transition-colors">
                  {t('common.signIn')}
                </Link>
              </li>
              <li>
                <a href="#features" className="hover:text-foreground transition-colors">
                  {t('landing.features.title')}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t('landing.footer.legal')}</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  {t('landing.footer.privacyPolicy')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  {t('landing.footer.termsOfService')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  {t('landing.trust.hipaa')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            {t('landing.footer.copyright', { year: new Date().getFullYear() })}
          </p>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </footer>
  );
};

// Navigation Component
const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-100' : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center shadow-md shadow-primary/20">
              <HeartPulse className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold hero-text-gradient">{t('brand.name')}</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              {t('landing.features.title')}
            </a>
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              {t('landing.footer.forProviders', 'For Providers')}
            </a>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher className="hidden sm:flex" />
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')} className="font-medium">
              {t('common.signIn')}
            </Button>
            <Button
              variant="hero"
              size="sm"
              className="rounded-xl font-medium"
              onClick={() => navigate('/register')}
            >
              {t('landing.hero.cta')}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Main Landing Page Component
export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection onGetStarted={handleGetStarted} />
      <TrustBar />
      <StatsSection />
      <BenefitsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection onGetStarted={handleGetStarted} />
      <Footer />
    </div>
  );
};
