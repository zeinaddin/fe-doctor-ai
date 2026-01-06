import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  const { firstName } = user ? getUserNames(user) : { firstName: '' };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {firstName}
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your health and appointments from your personal dashboard.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Upcoming Appointments"
          value={0}
          icon={Calendar}
          description="Scheduled visits"
          onClick={() => navigate('/patient/appointments')}
        />
        <StatCard
          title="Medical Records"
          value={0}
          icon={FileText}
          description="Health documents"
          onClick={() => navigate('/patient/records')}
        />
        <StatCard
          title="Find Doctors"
          value="Search"
          icon={Search}
          description="Browse specialists"
          onClick={() => navigate('/patient/find-doctors')}
        />
        <StatCard
          title="Health Status"
          value="Good"
          icon={Activity}
          description="Overall wellness"
          trend="+12% this month"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <QuickAction
              title="AI Health Consultation"
              description="Get instant health insights powered by AI"
              icon={Bot}
              onClick={() => navigate('/patient/ai-consultation')}
              primary
            />
            <QuickAction
              title="Find a Doctor"
              description="Search and book with verified specialists"
              icon={Stethoscope}
              onClick={() => navigate('/patient/find-doctors')}
            />
            <QuickAction
              title="View Appointments"
              description="Check your upcoming and past visits"
              icon={Calendar}
              onClick={() => navigate('/patient/appointments')}
            />
            <QuickAction
              title="Medical Records"
              description="Access your complete health history"
              icon={FileText}
              onClick={() => navigate('/patient/records')}
            />
          </CardContent>
        </Card>

        {/* Health Tips */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Health Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <p className="text-sm font-medium text-primary">Stay Hydrated</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Drink at least 8 glasses of water daily for optimal health.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <p className="text-sm font-medium text-emerald-500">Regular Exercise</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Aim for 30 minutes of physical activity each day.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/10">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-violet-500" />
                <p className="text-sm font-medium text-violet-500">Quality Sleep</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Get 7-9 hours of quality sleep for recovery.
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
                <p className="font-semibold">Try our AI Health Assistant</p>
                <p className="text-sm text-muted-foreground">
                  Get instant symptom analysis and personalized recommendations.
                </p>
              </div>
            </div>
            <Button onClick={() => navigate('/patient/ai-consultation')}>
              Start Consultation
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
