import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  CalendarClock,
  CheckCircle,
  ChevronRight,
  Clock,
  Clock3,
  FileText,
  Star,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '../../contexts/AuthContext';
import { doctorService } from '../../services/doctorService';
import { bookingService } from '../../services/bookingService.ts';
import type { DoctorDashboardStats, Booking } from '../../types';
import { getUserNames } from '../../types';
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
        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 border-0 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30'
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

// Appointment card
const AppointmentCard = ({ booking }: { booking: Booking }) => {
  const formattedTime = booking.date_time ? format(new Date(booking.date_time), 'HH:mm') : '';

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-white hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 shrink-0">
        <span className="text-lg font-bold text-emerald-600">{formattedTime}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-semibold text-gray-900 truncate">
            {booking.patient_name || 'Patient'}
          </p>
          <Badge
            variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
            className={cn(
              'text-xs',
              booking.status === 'confirmed' && 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
            )}
          >
            {booking.status}
          </Badge>
        </div>
        {booking.symptoms && (
          <p className="text-sm text-gray-500 line-clamp-1">{booking.symptoms}</p>
        )}
      </div>
      <ChevronRight className="h-5 w-5 text-gray-300" />
    </motion.div>
  );
};

// Loading skeleton
const LoadingSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-64" />
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-32 bg-gray-200 rounded-2xl" />
      ))}
    </div>
  </div>
);

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const doctorId = user?.id || 1;
  const { firstName, lastName } = user ? getUserNames(user) : { firstName: '', lastName: '' };

  const { data: stats, isLoading: statsLoading } = useQuery<DoctorDashboardStats>({
    queryKey: ['doctorStats', doctorId],
    queryFn: () => doctorService.getDoctorStats(),
    refetchInterval: 30000,
  });

  const { data: todayBookings, isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ['todayBookings'],
    queryFn: () => bookingService.getTodayBookings(),
    refetchInterval: 60000,
  });

  if (statsLoading || bookingsLoading) {
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
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14 ring-4 ring-white shadow-xl">
            <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-lg font-bold">
              {firstName[0]}
              {lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t('doctorDashboard.welcome', { name: firstName })}
            </h1>
            <p className="text-gray-500 mt-0.5">{t('doctorDashboard.subtitle')}</p>
          </div>
        </div>

        <Button
          onClick={() => navigate('/doctor/appointments')}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25 gap-2"
        >
          <CalendarClock className="h-4 w-4" />
          {t('nav.appointments')}
        </Button>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('doctorDashboard.todayAppointments')}
          value={stats?.todayAppointments || 0}
          icon={Calendar}
          description={t('doctorDashboard.scheduledForToday')}
          gradient="bg-gradient-to-br from-emerald-500/5 to-emerald-500/10"
          iconBg="bg-gradient-to-br from-emerald-500 to-emerald-600"
          onClick={() => navigate('/doctor/appointments')}
        />
        <StatCard
          title={t('doctorDashboard.upcoming')}
          value={stats?.upcomingAppointments || 0}
          icon={Clock}
          description={t('doctorDashboard.futureAppointments')}
          gradient="bg-gradient-to-br from-blue-500/5 to-blue-500/10"
          iconBg="bg-gradient-to-br from-blue-500 to-blue-600"
          onClick={() => navigate('/doctor/appointments')}
        />
        <StatCard
          title={t('doctorDashboard.completed')}
          value={stats?.completedAppointments || 0}
          icon={CheckCircle}
          description={t('doctorDashboard.allTime')}
          gradient="bg-gradient-to-br from-violet-500/5 to-violet-500/10"
          iconBg="bg-gradient-to-br from-violet-500 to-violet-600"
        />
        <StatCard
          title={t('doctorDashboard.totalPatients')}
          value={stats?.totalPatients || 0}
          icon={Users}
          description={t('doctorDashboard.underYourCare')}
          gradient="bg-gradient-to-br from-amber-500/5 to-amber-500/10"
          iconBg="bg-gradient-to-br from-amber-500 to-orange-500"
          onClick={() => navigate('/doctor/patients')}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Today's Schedule - 3 columns */}
        <motion.div variants={itemVariants} className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{t('doctorDashboard.todaySchedule')}</h2>
              <p className="text-sm text-gray-500">{t('doctorDashboard.appointmentsFor', { date: format(new Date(), 'MMMM dd, yyyy') })}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/doctor/appointments')}
              className="gap-1"
            >
              {t('common.viewAll') || 'View All'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {todayBookings && todayBookings.length > 0 ? (
            <div className="space-y-3">
              {todayBookings.slice(0, 5).map((booking) => (
                <AppointmentCard key={booking.id} booking={booking} />
              ))}
            </div>
          ) : (
            <Card className="border-0 shadow-lg shadow-gray-200/50">
              <CardContent className="py-12">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <Clock3 className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{t('doctorDashboard.noAppointmentsToday')}</h3>
                  <p className="text-sm text-gray-500 mb-4">{t('doctorDashboard.noAppointmentsDesc') || 'Your schedule is clear for today'}</p>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/doctor/schedule')}
                    className="gap-2"
                  >
                    <Calendar className="h-4 w-4" />
                    {t('sidebar.manageSchedule') || 'Manage Schedule'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Right Column - 2 columns */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-4">
          {/* Rating Card */}
          <Card className="border-0 shadow-lg shadow-gray-200/50 overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-amber-100">
                  <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                </div>
                <h3 className="font-semibold text-gray-900">{t('doctorDashboard.yourRating')}</h3>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-gray-900">
                  {stats?.rating ? stats.rating.toFixed(1) : t('common.na')}
                </span>
                <span className="text-gray-500 mb-1">/ 5.0</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">{t('doctorDashboard.basedOnFeedback')}</p>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">{t('doctorDashboard.quickActions')}</h3>
            <QuickAction
              title={t('nav.weeklySchedule')}
              description={t('doctorDashboard.manageAvailability') || 'Set your availability'}
              icon={Calendar}
              onClick={() => navigate('/doctor/schedule')}
              featured
            />
            <QuickAction
              title={t('nav.patients')}
              description={t('doctorDashboard.viewPatientList') || 'View your patient list'}
              icon={Users}
              onClick={() => navigate('/doctor/patients')}
              gradient="bg-blue-100"
            />
            <QuickAction
              title={t('nav.medicalRecords')}
              description={t('doctorDashboard.accessEMR') || 'Access medical records'}
              icon={FileText}
              onClick={() => navigate('/doctor/emr')}
              gradient="bg-violet-100"
            />
          </div>

          {/* Activity Summary */}
          <Card className="border-0 shadow-lg shadow-gray-200/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{t('dashboard.activitySummary')}</h3>
                <span className="text-xs text-gray-500">{t('dashboard.thisWeek')}</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm text-gray-600">{t('doctorDashboard.todayAppointments')}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{stats?.todayAppointments || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-600">{t('doctorDashboard.upcoming')}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{stats?.upcomingAppointments || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-violet-500" />
                    <span className="text-sm text-gray-600">{t('doctorDashboard.completed')}</span>
                  </div>
                  <span className="font-semibold text-violet-600">{stats?.completedAppointments || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* CTA Banner */}
      <motion.div variants={itemVariants}>
        <Card className="relative overflow-hidden border-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTQgMHYyaDJ2LTJoLTJ6bTAgNHYyaDJ2LTJoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl" />

          <CardContent className="relative p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {t('doctorDashboard.emrTitle') || 'Electronic Medical Records'}
                  </h3>
                  <p className="text-gray-400 text-sm max-w-md">
                    {t('doctorDashboard.emrDescription') || 'Access and manage your patients medical records securely'}
                  </p>
                </div>
              </div>
              <Button
                size="lg"
                onClick={() => navigate('/doctor/emr')}
                className="bg-white text-gray-900 hover:bg-gray-100 shadow-xl gap-2 font-semibold"
              >
                {t('doctorDashboard.accessRecords') || 'Access Records'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};
