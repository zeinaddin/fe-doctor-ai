import React from 'react';
import {useQuery} from '@tanstack/react-query';
import {useTranslation} from 'react-i18next';
import {Calendar, Clock, CheckCircle, Users, Star, Clock3} from 'lucide-react';
import {format} from 'date-fns';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {useAuth} from '../../contexts/AuthContext';
import {doctorService} from '../../services/doctorService';
import {bookingService} from '../../services/bookingService.ts';
import type {DoctorDashboardStats, Booking} from '../../types';
import {getUserNames} from '../../types';

const StatCard = ({title, value, icon: Icon, description}: {
    title: string;
    value: number | string;
    icon: any;
    description?: string
}) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground"/>
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        </CardContent>
    </Card>
);

export const DoctorDashboard: React.FC = () => {
    const {user} = useAuth();
    const {t} = useTranslation();
    const doctorId = user?.id || 1;

    const {data: stats, isLoading: statsLoading} = useQuery<DoctorDashboardStats>({
        queryKey: ['doctorStats', doctorId],
        queryFn: () => doctorService.getDoctorStats(),
        refetchInterval: 30000,
    });

    const {data: todayBookings, isLoading: bookingsLoading} = useQuery<Booking[]>({
        queryKey: ['todayBookings', doctorId],
        queryFn: () => bookingService.getDoctorBookings(doctorId, format(new Date(), 'yyyy-MM-dd')),
        refetchInterval: 60000,
    });

    if (statsLoading || bookingsLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    {t('doctorDashboard.welcome', {name: user ? getUserNames(user).firstName : ''})}
                </h1>
                <p className="text-muted-foreground mt-1">{t('doctorDashboard.subtitle')}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title={t('doctorDashboard.todayAppointments')}
                    value={stats?.todayAppointments || 0}
                    icon={Calendar}
                    description={t('doctorDashboard.scheduledForToday')}
                />
                <StatCard
                    title={t('doctorDashboard.upcoming')}
                    value={stats?.upcomingAppointments || 0}
                    icon={Clock}
                    description={t('doctorDashboard.futureAppointments')}
                />
                <StatCard
                    title={t('doctorDashboard.completed')}
                    value={stats?.completedAppointments || 0}
                    icon={CheckCircle}
                    description={t('doctorDashboard.allTime')}
                />
                <StatCard
                    title={t('doctorDashboard.totalPatients')}
                    value={stats?.totalPatients || 0}
                    icon={Users}
                    description={t('doctorDashboard.underYourCare')}
                />
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>{t('doctorDashboard.todaySchedule')}</CardTitle>
                        <CardDescription>{t('doctorDashboard.appointmentsFor', {date: format(new Date(), 'MMMM dd, yyyy')})}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {todayBookings && todayBookings.length > 0 ? (
                            <div className="space-y-4">
                                {todayBookings.map((booking) => (
                                    <div
                                        key={booking.id}
                                        className="flex items-start gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                                    >
                                        <div
                                            className="flex items-center justify-center w-16 h-16 rounded-lg bg-primary/10 shrink-0">
                                            <div className="text-center">
                                                <div
                                                    className="text-sm font-semibold text-primary">{booking.date_time}</div>
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-medium">
                                                    {booking.patient_name}
                                                </p>
                                                <Badge
                                                    variant={booking.status === 'confirmed' ? 'success' : 'secondary'}
                                                    className="text-xs">
                                                    {booking.status}
                                                </Badge>
                                            </div>
                                            {booking.symptoms && (
                                                <p className="text-sm text-muted-foreground line-clamp-2">{booking.symptoms}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <Clock3 className="h-12 w-12 mx-auto mb-3 opacity-20"/>
                                <p>{t('doctorDashboard.noAppointmentsToday')}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Star className="h-5 w-5 text-yellow-500"/>
                                {t('doctorDashboard.yourRating')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold">{stats?.rating ? stats.rating.toFixed(1) : t('common.na')}</div>
                            <p className="text-sm text-muted-foreground mt-2">{t('doctorDashboard.basedOnFeedback')}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>{t('doctorDashboard.quickActions')}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            {t('doctorDashboard.sidebarInstructions')}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
