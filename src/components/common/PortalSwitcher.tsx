import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield, Stethoscope, User, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole, getUserAccessibleRoles } from '../../types';

interface PortalConfig {
    role: UserRole;
    path: string;
    icon: React.ReactNode;
    labelKey: string;
    colorClass: string;
}

const portalConfigs: PortalConfig[] = [
    {
        role: UserRole.ADMIN,
        path: '/admin/dashboard',
        icon: <Shield className="h-4 w-4" />,
        labelKey: 'portal.admin',
        colorClass: 'text-violet-600',
    },
    {
        role: UserRole.DOCTOR,
        path: '/doctor/dashboard',
        icon: <Stethoscope className="h-4 w-4" />,
        labelKey: 'portal.doctor',
        colorClass: 'text-teal-600',
    },
    {
        role: UserRole.PATIENT,
        path: '/patient/dashboard',
        icon: <User className="h-4 w-4" />,
        labelKey: 'portal.patient',
        colorClass: 'text-sky-600',
    },
];

export const PortalSwitcher: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    if (!user) return null;

    const accessibleRoles = getUserAccessibleRoles(user);

    // Only show switcher if user has access to multiple portals
    if (accessibleRoles.length <= 1) return null;

    const accessiblePortals = portalConfigs.filter(config =>
        accessibleRoles.includes(config.role)
    );

    // Determine current portal based on URL path
    const currentPortal = accessiblePortals.find(config =>
        location.pathname.startsWith(config.path.replace('/dashboard', ''))
    ) || accessiblePortals[0];

    const handlePortalChange = (portal: PortalConfig) => {
        if (portal.role !== currentPortal.role) {
            navigate(portal.path);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <span className={currentPortal.colorClass}>
                        {currentPortal.icon}
                    </span>
                    <span className="hidden sm:inline">{t(currentPortal.labelKey)}</span>
                    <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>{t('portalSwitcher.switchPortal')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {accessiblePortals.map((portal) => (
                    <DropdownMenuItem
                        key={portal.role}
                        onClick={() => handlePortalChange(portal)}
                        className={`gap-2 cursor-pointer ${
                            portal.role === currentPortal.role ? 'bg-accent' : ''
                        }`}
                    >
                        <span className={portal.colorClass}>{portal.icon}</span>
                        <span>{t(portal.labelKey)}</span>
                        {portal.role === currentPortal.role && (
                            <span className="ml-auto text-xs text-muted-foreground">
                                {t('portalSwitcher.current')}
                            </span>
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
