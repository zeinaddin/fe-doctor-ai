import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';
import { Button } from './button';
import { languages, type LanguageCode } from '@/i18n';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'buttons';
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'buttons',
  className,
}) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language as LanguageCode;
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLanguageChange = (langCode: LanguageCode) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (variant === 'dropdown') {
    return (
      <div ref={dropdownRef} className={cn('relative', className)}>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-gray-600 hover:text-gray-900"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">
            {languages.find((l) => l.code === currentLang)?.nativeName || 'English'}
          </span>
          <ChevronDown className={cn("h-3 w-3 transition-transform", isOpen && "rotate-180")} />
        </Button>
        <div className={cn(
          "absolute right-0 top-full mt-1 py-1 bg-white rounded-lg shadow-lg border border-gray-200 min-w-[120px] z-50 transition-all duration-200",
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        )}>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={cn(
                'w-full px-3 py-2 text-left text-sm transition-colors',
                currentLang === lang.code
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              )}
            >
              {lang.nativeName}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-1 p-1 bg-gray-100 rounded-lg', className)}>
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleLanguageChange(lang.code)}
          className={cn(
            'px-2.5 py-1.5 text-xs font-medium rounded-md transition-all duration-200',
            currentLang === lang.code
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          {lang.code.toUpperCase()}
        </button>
      ))}
    </div>
  );
};
