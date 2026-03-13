import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  FileText,
  Shield,
  Stethoscope,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { statsService } from '@/services/statsService.ts';
import type { AdminDashboardStats } from '@/types';
import { cn } from '@/lib/utils';

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
            <p className="text-3xl font-bold text-gray-900">{typeof value === 'number' ? value.toLocaleString() : value}</p>
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
        ? 'bg-gradient-to-r from-violet-500 to-purple-500 border-0 text-white shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30'
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

// Loading skeleton
const LoadingSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-64" />
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-32 bg-gray-200 rounded-2xl" />
      ))}
    </div>
    <div className="grid gap-4 sm:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-28 bg-gray-200 rounded-2xl" />
      ))}
    </div>
  </div>
);

export const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: stats, isLoading } = useQuery<AdminDashboardStats>({
    queryKey: ['adminStats'],
    queryFn: () => statsService.getAdminStats(),
    refetchInterval: 30000,
  });

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-8"
    >
      {/* Welcome Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('adminDashboard.title')}
          </h1>
          <p className="text-gray-500 mt-1">{t('adminDashboard.subtitle')}</p>
        </div>

        <Button
          onClick={() => navigate('/admin/symptom-checker')}
          className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white shadow-lg shadow-violet-500/25 gap-2"
        >
          <Activity className="h-4 w-4" />
          {t('nav.symptomChecker')}
        </Button>
      </motion.div>

      {/* Main Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('adminDashboard.totalUsers')}
          value={stats?.totalUsers || 0}
          icon={Users}
          description={t('adminDashboard.activeUsers')}
          gradient="bg-gradient-to-br from-blue-500/5 to-blue-500/10"
          iconBg="bg-gradient-to-br from-blue-500 to-blue-600"
          onClick={() => navigate('/admin/users')}
        />
        <StatCard
          title={t('adminDashboard.totalDoctors')}
          value={stats?.totalDoctors || 0}
          icon={Stethoscope}
          description={t('adminDashboard.availablePractitioners')}
          gradient="bg-gradient-to-br from-emerald-500/5 to-emerald-500/10"
          iconBg="bg-gradient-to-br from-emerald-500 to-emerald-600"
          onClick={() => navigate('/admin/doctors')}
        />
        <StatCard
          title={t('adminDashboard.todayAppointments')}
          value={stats?.todayBookings || 0}
          icon={Calendar}
          description={t('adminDashboard.scheduledForToday')}
          gradient="bg-gradient-to-br from-amber-500/5 to-amber-500/10"
          iconBg="bg-gradient-to-br from-amber-500 to-orange-500"
          onClick={() => navigate('/admin/bookings')}
        />
        <StatCard
          title={t('adminDashboard.totalBookings')}
          value={stats?.totalBookings || 0}
          icon={Calendar}
          description={t('adminDashboard.allTimeAppointments')}
          gradient="bg-gradient-to-br from-violet-500/5 to-violet-500/10"
          iconBg="bg-gradient-to-br from-violet-500 to-purple-500"
          onClick={() => navigate('/admin/bookings')}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title={t('adminDashboard.pendingBookings')}
          value={stats?.pendingBookings || 0}
          icon={Clock}
          gradient="bg-gradient-to-br from-yellow-500/5 to-yellow-500/10"
          iconBg="bg-gradient-to-br from-yellow-500 to-yellow-600"
          onClick={() => navigate('/admin/bookings')}
        />
        <StatCard
          title={t('adminDashboard.completed')}
          value={stats?.completedBookings || 0}
          icon={CheckCircle}
          gradient="bg-gradient-to-br from-green-500/5 to-green-500/10"
          iconBg="bg-gradient-to-br from-green-500 to-green-600"
        />
        <StatCard
          title={t('adminDashboard.medicalRecords')}
          value={stats?.totalEMRs || 0}
          icon={FileText}
          gradient="bg-gradient-to-br from-rose-500/5 to-rose-500/10"
          iconBg="bg-gradient-to-br from-rose-500 to-rose-600"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Quick Actions - 3 columns */}
        <motion.div variants={itemVariants} className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">{t('adminDashboard.quickActions')}</h2>
          </div>

          <div className="space-y-3">
            <QuickAction
              title={t('nav.symptomChecker')}
              description={t('adminSymptomChecker.subtitle')}
              icon={Activity}
              onClick={() => navigate('/admin/symptom-checker')}
              featured
            />
            <QuickAction
              title={t('nav.doctorRequests')}
              description={t('adminDoctorRequests.subtitle')}
              icon={Shield}
              onClick={() => navigate('/admin/doctor-requests')}
              gradient="bg-violet-100"
            />
            <QuickAction
              title={t('nav.users')}
              description={t('adminUsers.subtitle')}
              icon={Users}
              onClick={() => navigate('/admin/users')}
              gradient="bg-blue-100"
            />
            <QuickAction
              title={t('nav.specializations')}
              description={t('adminSpecializations.subtitle')}
              icon={BookOpen}
              onClick={() => navigate('/admin/specializations')}
              gradient="bg-emerald-100"
            />
          </div>
        </motion.div>

        {/* System Overview - 2 columns */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">{t('dashboard.activitySummary')}</h2>

          {/* Activity Summary Card */}
          <Card className="border-0 shadow-lg shadow-gray-200/50 overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{t('adminDashboard.systemOverview') || 'System Overview'}</h3>
                <span className="text-xs text-gray-500">{t('dashboard.thisWeek')}</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-600">{t('adminDashboard.totalUsers')}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{stats?.totalUsers || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm text-gray-600">{t('adminDashboard.totalDoctors')}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{stats?.totalDoctors || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <span className="text-sm text-gray-600">{t('adminDashboard.pendingBookings')}</span>
                  </div>
                  <span className="font-semibold text-amber-600">{stats?.pendingBookings || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-600">{t('adminDashboard.completed')}</span>
                  </div>
                  <span className="font-semibold text-green-600">{stats?.completedBookings || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Doctor Requests Alert */}
          <Card className="border-0 shadow-lg shadow-gray-200/50 overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-100">
                  <Shield className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{t('adminDoctorRequests.title')}</h3>
                  <p className="text-sm text-gray-500 mt-1">{t('adminDashboard.reviewPendingApplications') || 'Review and manage doctor applications'}</p>
                  <Button
                    variant="link"
                    className="h-auto p-0 mt-2 text-amber-600 hover:text-amber-700"
                    onClick={() => navigate('/admin/doctor-requests')}
                  >
                    {t('common.viewDetails')}
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
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
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl" />

          <CardContent className="relative p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 shadow-lg shadow-violet-500/30">
                  <Activity className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {t('adminSymptomChecker.title')}
                  </h3>
                  <p className="text-gray-400 text-sm max-w-md">
                    {t('adminSymptomChecker.subtitle')}
                  </p>
                </div>
              </div>
              <Button
                size="lg"
                onClick={() => navigate('/admin/symptom-checker')}
                className="bg-white text-gray-900 hover:bg-gray-100 shadow-xl gap-2 font-semibold"
              >
                {t('adminSymptomChecker.analyzeSymptoms')}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};
