import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  CalendarClock,
  ChevronRight,
  FileText,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Users,
  Bell,
  Settings,
  Stethoscope,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { PortalSwitcher } from '@/components/common/PortalSwitcher';
import { MobileBottomNav } from '@/components/mobile';
import { useAuth } from '../contexts/AuthContext';
import { getUserNames } from '../types';
import { cn } from '@/lib/utils';

// Nav item component with animation
const NavItem = ({
  item,
  isActive,
  onClick,
}: {
  item: { title: string; icon: React.ElementType; href: string; badge?: string };
  isActive: boolean;
  onClick: () => void;
}) => {
  const Icon = item.icon;

  return (
    <motion.button
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative group',
        isActive
          ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-700'
          : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900'
      )}
    >
      {/* Active indicator */}
      {isActive && (
        <motion.div
          layoutId="doctorActiveIndicator"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}

      <div
        className={cn(
          'p-2 rounded-lg transition-all duration-200',
          isActive
            ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25'
            : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-700'
        )}
      >
        <Icon className="h-4 w-4" />
      </div>

      <span className="flex-1 text-left">{item.title}</span>

      {item.badge && (
        <span className="px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">
          {item.badge}
        </span>
      )}

      {isActive && <ChevronRight className="h-4 w-4 text-emerald-500" />}
    </motion.button>
  );
};

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
    { title: t('nav.medicalRecords'), icon: FileText, href: '/doctor/emr', badge: 'EMR' },
  ];

  // Mobile bottom nav items
  const mobileNavItems = [
    { title: t('nav.home') || 'Home', icon: LayoutDashboard, href: '/doctor/dashboard' },
    { title: t('nav.schedule') || 'Schedule', icon: Calendar, href: '/doctor/schedule' },
    { title: t('nav.appointments') || 'Appts', icon: CalendarClock, href: '/doctor/appointments' },
    { title: t('nav.patients') || 'Patients', icon: Users, href: '/doctor/patients' },
    { title: t('nav.emr') || 'EMR', icon: FileText, href: '/doctor/emr' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const { firstName, lastName } = user ? getUserNames(user) : { firstName: '', lastName: '' };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50/50 via-transparent to-transparent pointer-events-none" />

      {/* Mobile header - Doctor style */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 pt-safe">
        <div className="bg-white/90 backdrop-blur-xl border-b border-gray-100">
          <div className="flex items-center justify-between h-14 px-4">
            {/* Doctor Avatar & Title */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-3"
            >
              <Avatar className="h-10 w-10 ring-2 ring-white shadow-lg">
                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white font-semibold text-sm">
                  {firstName[0]}{lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="text-xs text-gray-500">{t('portal.doctor') || 'Doctor Portal'}</p>
                <p className="text-sm font-semibold text-gray-900">Dr. {firstName}</p>
              </div>
            </motion.button>

            {/* Right Actions */}
            <div className="flex items-center gap-1">
              <LanguageSwitcher variant="dropdown" />
              <motion.div whileTap={{ scale: 0.9 }}>
                <Button variant="ghost" size="icon" className="relative w-10 h-10 rounded-full">
                  <Bell className="h-5 w-5 text-gray-600" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-screen w-72 bg-white border-r border-gray-200/50 transition-transform duration-300 ease-out shadow-xl shadow-gray-200/50 lg:shadow-none',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Brand */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-gray-100">
            <Link to="/" className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <HeartPulse className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  {t('brand.name')}
                </span>
                <p className="text-[10px] text-gray-400 -mt-0.5">{t('portal.doctor')}</p>
              </div>
            </Link>
          </div>

          {/* Portal Switcher */}
          <div className="px-4 py-3 border-b border-gray-100">
            <PortalSwitcher />
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
            <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Practice
            </p>
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavItem
                  key={item.href}
                  item={item}
                  isActive={isActive}
                  onClick={() => {
                    navigate(item.href);
                    setSidebarOpen(false);
                  }}
                />
              );
            })}
          </nav>

          {/* Doctor Status Card */}
          <div className="px-4 py-3">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-4 text-white">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Stethoscope className="h-5 w-5" />
                  <span className="font-semibold">{t('sidebar.practiceStatus') || 'Practice Status'}</span>
                </div>
                <p className="text-xs text-white/80 mb-3">{t('sidebar.practiceStatusDesc') || 'You are available for appointments'}</p>
                <Button
                  size="sm"
                  className="w-full bg-white text-emerald-600 hover:bg-white/90 font-medium shadow-lg"
                  onClick={() => navigate('/doctor/schedule')}
                >
                  {t('sidebar.manageSchedule') || 'Manage Schedule'}
                </Button>
              </div>
            </div>
          </div>

          {/* User Section */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group">
              <Avatar className="h-10 w-10 ring-2 ring-white shadow-md">
                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white font-medium">
                  {firstName[0]}
                  {lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">Dr. {user?.full_name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Settings className="h-4 w-4 text-gray-400" />
              </Button>
            </div>

            <div className="flex gap-2 mt-3">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 justify-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                {t('common.signOut')}
              </Button>
              <LanguageSwitcher variant="dropdown" className="hidden lg:flex" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-72 min-h-screen">
        {/* Desktop header */}
        <header className="hidden lg:flex h-16 items-center justify-between px-6 border-b border-gray-100 bg-white/50 backdrop-blur-sm sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-gray-900">
              {navItems.find((item) => item.href === location.pathname)?.title || t('nav.dashboard')}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-gray-500" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
            </Button>
            <div className="h-8 w-px bg-gray-200" />
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-xs font-medium">
                  {firstName[0]}
                  {lastName[0]}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-700">Dr. {firstName}</span>
            </div>
          </div>
        </header>

        {/* Page content - extra padding for mobile bottom nav */}
        <div className="p-4 pt-20 pb-24 lg:p-6 lg:pt-6 lg:pb-6">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav items={mobileNavItems} accentColor="teal" />

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
