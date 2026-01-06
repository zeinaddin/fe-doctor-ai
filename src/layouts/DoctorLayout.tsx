import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  CalendarClock,
  ChevronRight,
  FileText,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Menu,
  Stethoscope,
  Users,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { useAuth } from '../contexts/AuthContext';
import { getUserNames } from '../types';
import { cn } from '@/lib/utils';

export const DoctorLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { title: t('nav.dashboard'), icon: LayoutDashboard, href: '/doctor/dashboard' },
    { title: t('nav.weeklySchedule'), icon: Calendar, href: '/doctor/schedule' },
    { title: t('nav.appointments'), icon: CalendarClock, href: '/doctor/appointments' },
    { title: t('nav.patients'), icon: Users, href: '/doctor/patients' },
    { title: t('nav.medicalRecords'), icon: FileText, href: '/doctor/emr' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const { firstName, lastName } = user ? getUserNames(user) : { firstName: '', lastName: '' };

  return (
    <div className="min-h-screen bg-background theme-doctor">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-medical-pattern opacity-30 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-br from-teal-50/50 via-transparent to-cyan-50/30 pointer-events-none" />

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white/95 backdrop-blur-xl border-b border-gray-200/60 z-50 flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg healthcare-gradient flex items-center justify-center shadow-sm">
            <HeartPulse className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-gradient">{t('brand.name')}</span>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher variant="dropdown" />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-64 bg-white/95 backdrop-blur-xl border-r border-gray-200/60 transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-14 flex items-center justify-between px-4 border-b border-gray-200/60">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg healthcare-gradient flex items-center justify-center shadow-sm">
                <HeartPulse className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-gradient">{t('brand.name')}</span>
            </Link>
            <LanguageSwitcher variant="dropdown" className="hidden lg:flex" />
          </div>

          {/* Doctor badge */}
          <div className="px-4 py-3 border-b border-gray-200/60">
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-teal-50 text-teal-700 text-xs font-medium">
              <Stethoscope className="h-3.5 w-3.5" />
              {t('portal.doctor')}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Button
                  key={item.href}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 h-10 px-3 font-normal transition-all duration-200",
                    isActive
                      ? "bg-teal-50 text-teal-700 hover:bg-teal-100 font-medium"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  )}
                  onClick={() => {
                    navigate(item.href);
                    setSidebarOpen(false);
                  }}
                >
                  <item.icon className={cn("h-4 w-4", isActive && "text-teal-600")} />
                  {item.title}
                  {isActive && (
                    <ChevronRight className="h-4 w-4 ml-auto text-teal-600" />
                  )}
                </Button>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-3 border-t border-gray-200/60">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 mb-2">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-teal-100 text-teal-700 text-sm font-medium">
                  {firstName[0]}{lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">Dr. {user?.full_name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 h-9 text-gray-600 hover:text-gray-900"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              {t('common.signOut')}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen relative z-10">
        <div className="p-4 pt-18 lg:p-6 lg:pt-6">
          <Outlet />
        </div>
      </main>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};
