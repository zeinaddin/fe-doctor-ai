import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  Bot,
  Calendar,
  Clock,
  FileText,
  Heart,
  HeartPulse,
  Lock,
  Phone,
  Shield,
  Stethoscope,
  UserCircle,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { cn } from '@/lib/utils';

// Portal Card Component
const PortalCard = ({
  title,
  description,
  icon: Icon,
  href,
  gradient,
  textGradient,
  cta,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  gradient: string;
  textGradient: string;
  cta: string;
}) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(href)}
      className={cn(
        "group relative p-6 rounded-2xl border border-gray-200 bg-white text-left transition-all duration-300",
        "hover:border-gray-300 hover:shadow-lg hover:-translate-y-1"
      )}
    >
      <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center mb-4", gradient)}>
        <Icon className="h-7 w-7 text-white" />
      </div>
      <h3 className={cn("text-xl font-semibold mb-2", textGradient)}>{title}</h3>
      <p className="text-muted-foreground text-sm mb-4">{description}</p>
      <div className="flex items-center text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
        {cta}
        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </button>
  );
};

// Feature Card Component
const FeatureCard = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) => (
  <div className="flex gap-4">
    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center">
      <Icon className="h-5 w-5 text-teal-600" />
    </div>
    <div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </div>
);

// Stat Component
const Stat = ({ value, label }: { value: string; label: string }) => (
  <div className="text-center">
    <div className="text-3xl font-bold text-gradient">{value}</div>
    <div className="text-sm text-muted-foreground mt-1">{label}</div>
  </div>
);

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass-strong">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl healthcare-gradient flex items-center justify-center shadow-md">
                <HeartPulse className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-gradient">{t('brand.name')}</span>
                <span className="hidden sm:inline text-xl font-light text-muted-foreground ml-1">{t('brand.health')}</span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <a href="#portals" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('landing.portals.title')}
              </a>
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('landing.features.title')}
              </a>
            </div>

            <div className="flex items-center gap-3">
              <LanguageSwitcher className="hidden sm:flex" />
              <Button variant="ghost" size="sm" onClick={() => navigate('/patient/login')}>
                {t('common.signIn')}
              </Button>
              <Button size="sm" onClick={() => navigate('/patient/register')}>
                {t('landing.hero.cta')}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-medical-pattern" />
        <div className="absolute inset-0 bg-gradient-to-b from-teal-50/50 via-transparent to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 md:pt-24 md:pb-32">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-sm font-medium mb-8 animate-fade-in-down">
              <Heart className="h-4 w-4" />
              {t('brand.tagline')}
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 animate-fade-in-up">
              {t('landing.hero.title')}{' '}
              <span className="text-gradient">{t('landing.hero.titleHighlight')}</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground mb-10 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              {t('landing.hero.subtitle')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <Button size="lg" onClick={() => navigate('/patient/register')} className="w-full sm:w-auto h-12 px-8">
                {t('landing.hero.cta')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/patient/login')} className="w-full sm:w-auto h-12 px-8">
                {t('common.signIn')}
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '400ms' }}>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-teal-600" />
                <span>{t('landing.trust.hipaa')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-teal-600" />
                <span>{t('landing.trust.secure')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-teal-600" />
                <span>{t('landing.trust.support')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <Stat value="10,000+" label={t('stats.patientsServed')} />
            <Stat value="500+" label={t('stats.verifiedDoctors')} />
            <Stat value="50+" label={t('stats.specializations')} />
            <Stat value="4.9/5" label={t('stats.patientRating')} />
          </div>
        </div>
      </section>

      {/* Portal Selection Section */}
      <section id="portals" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('landing.portals.title')}</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t('landing.portals.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <PortalCard
              title={t('landing.portals.patient.title')}
              description={t('landing.portals.patient.description')}
              icon={UserCircle}
              href="/patient/login"
              gradient="bg-gradient-to-br from-sky-500 to-blue-600"
              textGradient="text-gradient-patient"
              cta={t('landing.portals.patient.cta')}
            />
            <PortalCard
              title={t('landing.portals.doctor.title')}
              description={t('landing.portals.doctor.description')}
              icon={Stethoscope}
              href="/doctor/login"
              gradient="bg-gradient-to-br from-teal-500 to-cyan-600"
              textGradient="text-gradient-doctor"
              cta={t('landing.portals.doctor.cta')}
            />
            <PortalCard
              title={t('landing.portals.admin.title')}
              description={t('landing.portals.admin.description')}
              icon={Shield}
              href="/admin/login"
              gradient="bg-gradient-to-br from-violet-500 to-purple-600"
              textGradient="text-gradient-admin"
              cta={t('landing.portals.admin.cta')}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-28 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {t('landing.hero.title')}<br />
                <span className="text-gradient">{t('landing.hero.titleHighlight')}</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-10">
                {t('landing.features.subtitle')}
              </p>

              <div className="space-y-6">
                <FeatureCard
                  icon={Bot}
                  title={t('landing.features.ai.title')}
                  description={t('landing.features.ai.description')}
                />
                <FeatureCard
                  icon={Calendar}
                  title={t('landing.features.booking.title')}
                  description={t('landing.features.booking.description')}
                />
                <FeatureCard
                  icon={FileText}
                  title={t('landing.features.records.title')}
                  description={t('landing.features.records.description')}
                />
                <FeatureCard
                  icon={Phone}
                  title={t('landing.features.secure.title')}
                  description={t('landing.features.secure.description')}
                />
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-teal-500/10 via-cyan-500/5 to-sky-500/10 p-8 border border-teal-100">
                <div className="h-full rounded-2xl bg-white shadow-xl border border-gray-100 p-8 flex flex-col items-center justify-center">
                  <div className="w-24 h-24 rounded-2xl healthcare-gradient flex items-center justify-center mb-6 shadow-lg">
                    <HeartPulse className="h-12 w-12 text-white" />
                  </div>
                  <div className="text-5xl font-bold text-gradient mb-3">{t('brand.name')}</div>
                  <p className="text-muted-foreground text-center">
                    {t('brand.tagline')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About/Trust Section */}
      <section id="about" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('landing.features.title')}
            </h2>
            <p className="text-muted-foreground text-lg">
              {t('landing.features.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: t('landing.features.booking.title'),
                description: t('landing.features.booking.description'),
              },
              {
                icon: Lock,
                title: t('landing.features.secure.title'),
                description: t('landing.features.secure.description'),
              },
              {
                icon: Clock,
                title: t('landing.trust.support'),
                description: t('landing.features.records.description'),
              },
            ].map((item, index) => (
              <div key={index} className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm text-center">
                <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-6 w-6 text-teal-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl healthcare-gradient p-8 md:p-12 lg:p-16 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('landing.cta.title')}
            </h2>
            <p className="text-white/80 text-lg max-w-2xl mx-auto mb-8">
              {t('landing.cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                variant="secondary"
                onClick={() => navigate('/patient/register')}
                className="w-full sm:w-auto h-12 px-8 bg-white text-teal-700 hover:bg-white/90"
              >
                {t('landing.cta.button')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/doctor/login')}
                className="w-full sm:w-auto h-12 px-8 border-white/30 text-white hover:bg-white/10"
              >
                {t('landing.portals.doctor.cta')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg healthcare-gradient flex items-center justify-center">
                  <HeartPulse className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-gradient">{t('brand.name')}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('brand.tagline')}
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{t('landing.portals.patient.title')}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/patient/register" className="hover:text-foreground transition-colors">{t('common.signUp')}</Link></li>
                <li><Link to="/patient/login" className="hover:text-foreground transition-colors">{t('common.signIn')}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{t('landing.portals.doctor.title')}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/doctor/login" className="hover:text-foreground transition-colors">{t('portal.doctor')}</Link></li>
                <li><Link to="/admin/login" className="hover:text-foreground transition-colors">{t('portal.admin')}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{t('landing.footer.legal')}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">{t('landing.footer.privacyPolicy')}</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">{t('landing.footer.termsOfService')}</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">{t('landing.trust.hipaa')}</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              {t('landing.footer.copyright', { year: new Date().getFullYear() })}
            </p>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-teal-600" />
                  {t('landing.trust.hipaa')}
                </span>
                <span className="flex items-center gap-1.5">
                  <Lock className="h-4 w-4 text-teal-600" />
                  {t('landing.trust.secure')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
