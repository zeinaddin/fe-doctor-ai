import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Bot,
  Calendar,
  ChevronRight,
  Clock,
  Droplets,
  Dumbbell,
  FileText,
  Heart,
  Moon,
  Search,
  Sparkles,
  Stethoscope,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '../../contexts/AuthContext';
import { getUserNames } from '../../types';
import { cn } from '@/lib/utils';
import { bookingService } from '../../services/bookingService';
import { emrService } from '../../services/emrService';
import { chatService } from '../../services/chatService';
import type { Booking, EMR, ChatSession } from '../../types';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Stat card with gradient
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  trend?: string;
  gradient: string;
  iconBg: string;
  onClick?: () => void;
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  gradient,
  iconBg,
  onClick,
}: StatCardProps) => (
  <motion.div variants={itemVariants}>
    <Card
      className={cn(
        'group relative overflow-hidden border-0 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-all duration-300 cursor-pointer',
        onClick && 'hover:-translate-y-1'
      )}
      onClick={onClick}
    >
      {/* Gradient overlay on hover */}
      <div
        className={cn(
          'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300',
          gradient
        )}
      />

      <CardContent className="relative p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {description && (
              <p className="text-xs text-gray-400">{description}</p>
            )}
            {trend && (
              <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                <TrendingUp className="h-3.5 w-3.5" />
                {trend}
              </div>
            )}
          </div>
          <div
            className={cn(
              'p-3 rounded-2xl transition-transform duration-300 group-hover:scale-110',
              iconBg
            )}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>

        {onClick && (
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
            <ArrowUpRight className="h-5 w-5 text-gray-400" />
          </div>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

// Quick action card
interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ElementType;
  onClick: () => void;
  gradient?: string;
  featured?: boolean;
}

const QuickAction = ({
  title,
  description,
  icon: Icon,
  onClick,
  gradient,
  featured,
}: QuickActionProps) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={cn(
      'flex items-center gap-4 p-4 rounded-2xl border text-left w-full transition-all duration-200',
      featured
        ? 'bg-gradient-to-r from-teal-500 to-cyan-500 border-0 text-white shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30'
        : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-md'
    )}
  >
    <div
      className={cn(
        'p-3 rounded-xl',
        featured
          ? 'bg-white/20'
          : gradient || 'bg-gray-100'
      )}
    >
      <Icon className={cn('h-5 w-5', featured ? 'text-white' : 'text-gray-600')} />
    </div>
    <div className="flex-1 min-w-0">
      <p className={cn('font-semibold', featured ? 'text-white' : 'text-gray-900')}>
        {title}
      </p>
      <p className={cn('text-sm mt-0.5', featured ? 'text-white/80' : 'text-gray-500')}>
        {description}
      </p>
    </div>
    <ChevronRight className={cn('h-5 w-5', featured ? 'text-white/60' : 'text-gray-400')} />
  </motion.button>
);

// Health tip card
interface HealthTipProps {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

const HealthTip = ({ title, description, icon: Icon, color, bgColor }: HealthTipProps) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className={cn(
      'p-4 rounded-2xl border transition-all duration-200 cursor-pointer',
      bgColor
    )}
  >
    <div className="flex items-start gap-3">
      <div className={cn('p-2 rounded-xl', color)}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <div>
        <p className="font-semibold text-gray-900 text-sm">{title}</p>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{description}</p>
      </div>
    </div>
  </motion.div>
);

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { firstName, lastName } = user ? getUserNames(user) : { firstName: '', lastName: '' };

  // Fetch patient appointments
  const { data: appointments = [] } = useQuery<Booking[]>({
    queryKey: ['myAppointments'],
    queryFn: () => bookingService.getMyBookings(),
  });

  // Fetch patient medical records
  const { data: medicalRecords = [] } = useQuery<EMR[]>({
    queryKey: ['myMedicalRecords'],
    queryFn: () => emrService.getMyPatientEMRs(0, 100),
  });

  // Fetch patient chat sessions (consultations)
  const { data: chatSessions = [] } = useQuery<ChatSession[]>({
    queryKey: ['myChatSessions'],
    queryFn: () => chatService.getMySessions(0, 100),
  });

  // Calculate stats
  const upcomingAppointments = appointments.filter(
    (apt) => ['scheduled', 'confirmed'].includes(apt.status) && new Date(apt.date_time) >= new Date()
  ).length;

  const totalRecords = medicalRecords.length;

  // This week's stats
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const weeklyConsultations = chatSessions.filter(
    (session) => new Date(session.created_at) >= oneWeekAgo
  ).length;

  const weeklyAppointments = appointments.filter(
    (apt) => new Date(apt.date_time) >= oneWeekAgo
  ).length;

  // Get current time for greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? t('dashboard.greetings.morning') : hour < 18 ? t('dashboard.greetings.afternoon') : t('dashboard.greetings.evening');

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-8"
    >
      {/* Welcome Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14 ring-4 ring-white shadow-xl">
            <AvatarFallback className="bg-gradient-to-br from-teal-500 to-cyan-500 text-white text-lg font-bold">
              {firstName[0]}
              {lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-gray-500 text-sm">{greeting}</p>
            <h1 className="text-2xl font-bold text-gray-900">
              {t('patientDashboard.welcomeBack', { name: firstName })}
            </h1>
          </div>
        </div>

        <Button
          onClick={() => navigate('/patient/ai-consultation')}
          className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg shadow-teal-500/25 gap-2"
        >
          <Sparkles className="h-4 w-4" />
          {t('dashboard.askAi')}
        </Button>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('patientDashboard.upcomingAppointments')}
          value={upcomingAppointments}
          icon={Calendar}
          description={t('patientDashboard.scheduledVisits')}
          gradient="bg-gradient-to-br from-blue-500/5 to-blue-500/10"
          iconBg="bg-gradient-to-br from-blue-500 to-blue-600"
          onClick={() => navigate('/patient/appointments')}
        />
        <StatCard
          title={t('patientDashboard.medicalRecords')}
          value={totalRecords}
          icon={FileText}
          description={t('patientDashboard.healthDocuments')}
          gradient="bg-gradient-to-br from-violet-500/5 to-violet-500/10"
          iconBg="bg-gradient-to-br from-violet-500 to-violet-600"
          onClick={() => navigate('/patient/records')}
        />
        <StatCard
          title={t('patientDashboard.findDoctors')}
          value={t('dashboard.explore')}
          icon={Search}
          description={t('patientDashboard.browseSpecialists')}
          gradient="bg-gradient-to-br from-amber-500/5 to-amber-500/10"
          iconBg="bg-gradient-to-br from-amber-500 to-orange-500"
          onClick={() => navigate('/patient/find-doctors')}
        />
        <StatCard
          title={t('patientDashboard.healthStatus')}
          value={t('patientDashboard.good')}
          icon={Heart}
          description={t('patientDashboard.overallWellness')}
          trend={t('patientDashboard.thisMonth')}
          gradient="bg-gradient-to-br from-emerald-500/5 to-emerald-500/10"
          iconBg="bg-gradient-to-br from-emerald-500 to-emerald-600"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Quick Actions - 3 columns */}
        <motion.div variants={itemVariants} className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">{t('patientDashboard.quickActions')}</h2>
          </div>

          <div className="space-y-3">
            <QuickAction
              title={t('patientDashboard.aiHealthConsultation')}
              description={t('patientDashboard.getInstantHealthInsights')}
              icon={Bot}
              onClick={() => navigate('/patient/ai-consultation')}
              featured
            />
            <QuickAction
              title={t('patientDashboard.findADoctor')}
              description={t('patientDashboard.searchAndBookSpecialists')}
              icon={Stethoscope}
              onClick={() => navigate('/patient/find-doctors')}
              gradient="bg-teal-100"
            />
            <QuickAction
              title={t('patientDashboard.viewAppointments')}
              description={t('patientDashboard.checkUpcomingVisits')}
              icon={Calendar}
              onClick={() => navigate('/patient/appointments')}
              gradient="bg-blue-100"
            />
            <QuickAction
              title={t('patientDashboard.medicalRecords')}
              description={t('patientDashboard.accessHealthHistory')}
              icon={FileText}
              onClick={() => navigate('/patient/records')}
              gradient="bg-violet-100"
            />
          </div>
        </motion.div>

        {/* Health Tips - 2 columns */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">{t('patientDashboard.healthInsights')}</h2>

          <div className="space-y-3">
            <HealthTip
              title={t('patientDashboard.stayHydrated')}
              description={t('patientDashboard.stayHydratedTip')}
              icon={Droplets}
              color="bg-sky-500"
              bgColor="bg-sky-50 border-sky-100 hover:border-sky-200"
            />
            <HealthTip
              title={t('patientDashboard.regularExercise')}
              description={t('patientDashboard.regularExerciseTip')}
              icon={Dumbbell}
              color="bg-emerald-500"
              bgColor="bg-emerald-50 border-emerald-100 hover:border-emerald-200"
            />
            <HealthTip
              title={t('patientDashboard.qualitySleep')}
              description={t('patientDashboard.qualitySleepTip')}
              icon={Moon}
              color="bg-violet-500"
              bgColor="bg-violet-50 border-violet-100 hover:border-violet-200"
            />
          </div>

          {/* Activity Summary */}
          <Card className="border-0 shadow-lg shadow-gray-200/50 overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{t('dashboard.activitySummary')}</h3>
                <span className="text-xs text-gray-500">{t('dashboard.thisWeek')}</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <span className="text-sm text-gray-600">{t('dashboard.consultations')}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{weeklyConsultations}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-600">{t('dashboard.appointments')}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{weeklyAppointments}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm text-gray-600">{t('dashboard.healthScore')}</span>
                  </div>
                  <span className="font-semibold text-emerald-600">96/100</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* CTA Banner */}
      <motion.div variants={itemVariants}>
        <Card className="relative overflow-hidden border-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
          {/* Decorative elements */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTQgMHYyaDJ2LTJoLTJ6bTAgNHYyaDJ2LTJoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-violet-500/20 to-purple-500/20 rounded-full blur-3xl" />

          <CardContent className="relative p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 shadow-lg shadow-teal-500/30">
                  <Bot className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {t('patientDashboard.tryAiAssistant')}
                  </h3>
                  <p className="text-gray-400 text-sm max-w-md">
                    {t('patientDashboard.getInstantSymptomAnalysis')}
                  </p>
                </div>
              </div>
              <Button
                size="lg"
                onClick={() => navigate('/patient/ai-consultation')}
                className="bg-white text-gray-900 hover:bg-gray-100 shadow-xl gap-2 font-semibold"
              >
                {t('patientDashboard.startConsultation')}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};
