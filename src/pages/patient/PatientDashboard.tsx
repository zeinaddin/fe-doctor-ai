import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Activity,
  ArrowRight,
  Bot,
  Calendar,
  FileText,
  Search,
  Stethoscope,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { getUserNames } from '../../types';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  trend?: string;
  onClick?: () => void;
}

const StatCard = ({ title, value, icon: Icon, description, trend, onClick }: StatCardProps) => (
  <Card
    className={cn(
      "group relative overflow-hidden transition-all duration-300",
      onClick && "cursor-pointer hover:border-primary/30 hover:shadow-glow-sm"
    )}
    onClick={onClick}
  >
    <CardContent className="p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 text-xs text-primary">
              <TrendingUp className="h-3 w-3" />
              {trend}
            </div>
          )}
        </div>
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {onClick && (
        <ArrowRight className="absolute bottom-4 right-4 h-4 w-4 text-muted-foreground/0 group-hover:text-muted-foreground transition-all" />
      )}
    </CardContent>
  </Card>
);

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ElementType;
  onClick: () => void;
  primary?: boolean;
}

const QuickAction = ({ title, description, icon: Icon, onClick, primary }: QuickActionProps) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 text-left w-full",
      primary
        ? "bg-primary/10 border-primary/20 hover:bg-primary/15 hover:border-primary/30"
        : "border-border/50 hover:bg-secondary hover:border-border"
    )}
  >
    <div className={cn(
      "p-2 rounded-lg",
      primary ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
    )}>
      <Icon className="h-5 w-5" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-medium">{title}</p>
      <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
    </div>
    <ArrowRight className="h-4 w-4 text-muted-foreground mt-1" />
  </button>
);

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { firstName } = user ? getUserNames(user) : { firstName: '' };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t('patientDashboard.welcomeBack', { name: firstName })}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t('patientDashboard.subtitle')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('patientDashboard.upcomingAppointments')}
          value={0}
          icon={Calendar}
          description={t('patientDashboard.scheduledVisits')}
          onClick={() => navigate('/patient/appointments')}
        />
        <StatCard
          title={t('patientDashboard.medicalRecords')}
          value={0}
          icon={FileText}
          description={t('patientDashboard.healthDocuments')}
          onClick={() => navigate('/patient/records')}
        />
        <StatCard
          title={t('patientDashboard.findDoctors')}
          value={t('common.search')}
          icon={Search}
          description={t('patientDashboard.browseSpecialists')}
          onClick={() => navigate('/patient/find-doctors')}
        />
        <StatCard
          title={t('patientDashboard.healthStatus')}
          value={t('patientDashboard.good')}
          icon={Activity}
          description={t('patientDashboard.overallWellness')}
          trend={t('patientDashboard.thisMonth')}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">{t('patientDashboard.quickActions')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <QuickAction
              title={t('patientDashboard.aiHealthConsultation')}
              description={t('patientDashboard.getInstantHealthInsights')}
              icon={Bot}
              onClick={() => navigate('/patient/ai-consultation')}
              primary
            />
            <QuickAction
              title={t('patientDashboard.findADoctor')}
              description={t('patientDashboard.searchAndBookSpecialists')}
              icon={Stethoscope}
              onClick={() => navigate('/patient/find-doctors')}
            />
            <QuickAction
              title={t('patientDashboard.viewAppointments')}
              description={t('patientDashboard.checkUpcomingVisits')}
              icon={Calendar}
              onClick={() => navigate('/patient/appointments')}
            />
            <QuickAction
              title={t('patientDashboard.medicalRecords')}
              description={t('patientDashboard.accessHealthHistory')}
              icon={FileText}
              onClick={() => navigate('/patient/records')}
            />
          </CardContent>
        </Card>

        {/* Health Tips */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">{t('patientDashboard.healthInsights')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <p className="text-sm font-medium text-primary">{t('patientDashboard.stayHydrated')}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('patientDashboard.stayHydratedTip')}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <p className="text-sm font-medium text-emerald-500">{t('patientDashboard.regularExercise')}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('patientDashboard.regularExerciseTip')}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/10">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-violet-500" />
                <p className="text-sm font-medium text-violet-500">{t('patientDashboard.qualitySleep')}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('patientDashboard.qualitySleepTip')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CTA Banner */}
      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/20">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{t('patientDashboard.tryAiAssistant')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('patientDashboard.getInstantSymptomAnalysis')}
                </p>
              </div>
            </div>
            <Button onClick={() => navigate('/patient/ai-consultation')}>
              {t('patientDashboard.startConsultation')}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
