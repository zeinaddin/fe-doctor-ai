import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NavItem {
  title: string;
  icon: React.ElementType;
  href: string;
  badge?: string | number;
}

interface MobileBottomNavProps {
  items: NavItem[];
  accentColor?: string;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  items,
  accentColor = 'teal'
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const colorClasses = {
    teal: {
      active: 'text-teal-600',
      bg: 'bg-teal-500',
      gradient: 'from-teal-500 to-cyan-500',
    },
    violet: {
      active: 'text-violet-600',
      bg: 'bg-violet-500',
      gradient: 'from-violet-500 to-purple-500',
    },
    blue: {
      active: 'text-blue-600',
      bg: 'bg-blue-500',
      gradient: 'from-blue-500 to-indigo-500',
    },
  };

  const colors = colorClasses[accentColor as keyof typeof colorClasses] || colorClasses.teal;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe">
      {/* Blur backdrop */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border-t border-gray-200/50" />

      <div className="relative flex items-center justify-around px-2 py-2">
        {items.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href ||
            (item.href !== '/' && location.pathname.startsWith(item.href));

          return (
            <motion.button
              key={item.href}
              onClick={() => navigate(item.href)}
              whileTap={{ scale: 0.9 }}
              className={cn(
                'relative flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-all duration-200',
                isActive ? colors.active : 'text-gray-400'
              )}
            >
              {/* Active background */}
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className={cn(
                    'absolute inset-1 rounded-2xl bg-gradient-to-br opacity-10',
                    colors.gradient
                  )}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              {/* Icon container */}
              <div className="relative">
                <Icon className={cn(
                  'h-6 w-6 transition-transform duration-200',
                  isActive && 'scale-110'
                )} />

                {/* Badge */}
                {item.badge && (
                  <span className={cn(
                    'absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center',
                    'text-[10px] font-bold text-white rounded-full px-1',
                    colors.bg
                  )}>
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span className={cn(
                'text-[10px] font-medium mt-1 transition-all duration-200',
                isActive ? 'opacity-100' : 'opacity-70'
              )}>
                {item.title}
              </span>

              {/* Active dot indicator */}
              {isActive && (
                <motion.div
                  layoutId="bottomNavDot"
                  className={cn('absolute -bottom-0.5 w-1 h-1 rounded-full', colors.bg)}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};
