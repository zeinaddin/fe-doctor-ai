import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Bell, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showNotifications?: boolean;
  showAvatar?: boolean;
  avatarInitials?: string;
  onNotificationClick?: () => void;
  onAvatarClick?: () => void;
  onMoreClick?: () => void;
  rightAction?: React.ReactNode;
  accentColor?: string;
  transparent?: boolean;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  showNotifications = true,
  showAvatar = false,
  avatarInitials = 'U',
  onNotificationClick,
  onAvatarClick,
  onMoreClick,
  rightAction,
  accentColor = 'teal',
  transparent = false,
}) => {
  const navigate = useNavigate();

  const colorClasses = {
    teal: 'from-teal-500 to-cyan-500',
    violet: 'from-violet-500 to-purple-500',
    blue: 'from-blue-500 to-indigo-500',
  };

  const gradientClass = colorClasses[accentColor as keyof typeof colorClasses] || colorClasses.teal;

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={cn(
        'lg:hidden fixed top-0 left-0 right-0 z-50 pt-safe',
        !transparent && 'bg-white/90 backdrop-blur-xl border-b border-gray-100'
      )}
    >
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left section */}
        <div className="flex items-center gap-3 flex-1">
          {showBack ? (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-gray-700" />
            </motion.button>
          ) : showAvatar ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onAvatarClick}
              className="relative"
            >
              <Avatar className="h-10 w-10 ring-2 ring-white shadow-lg">
                <AvatarFallback className={cn('bg-gradient-to-br text-white font-semibold', gradientClass)}>
                  {avatarInitials}
                </AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
            </motion.button>
          ) : null}

          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-gray-900 truncate">{title}</h1>
            {subtitle && (
              <p className="text-xs text-gray-500 truncate">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          {rightAction}

          {showNotifications && (
            <motion.div whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={onNotificationClick}
                className="relative w-10 h-10 rounded-full"
              >
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              </Button>
            </motion.div>
          )}

          {onMoreClick && (
            <motion.div whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={onMoreClick}
                className="w-10 h-10 rounded-full"
              >
                <MoreVertical className="h-5 w-5 text-gray-600" />
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.header>
  );
};
