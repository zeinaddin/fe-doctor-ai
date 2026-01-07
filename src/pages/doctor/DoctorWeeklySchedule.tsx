import React, {useState} from 'react';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {useTranslation} from 'react-i18next';
import {Calendar, Info, RefreshCw} from 'lucide-react';
import {Card, CardContent} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {WeeklyScheduleCalendar} from '@/components/schedule/WeeklyScheduleCalendar';
import {ScheduleForm} from '@/components/forms/ScheduleForm';
import {scheduleService} from '@/services/scheduleService';
import type {Schedule, ScheduleFormData} from '@/types';

export const DoctorWeeklySchedule: React.FC = () => {
    const queryClient = useQueryClient();
    const {t} = useTranslation();
    const [formOpen, setFormOpen] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
    const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<number | undefined>(undefined);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

    const {data: schedules = [], isLoading, error, refetch} = useQuery<Schedule[]>({
        queryKey: ['mySchedules'],
        queryFn: () => scheduleService.getMySchedules(),
        refetchInterval: 60000,
    });

    const createMutation = useMutation({
        mutationFn: (data: ScheduleFormData) => scheduleService.createSchedule(data),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['mySchedules']});
            setFormOpen(false);
            setSelectedSchedule(null);
            setSelectedDayOfWeek(undefined);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({id, data}: { id: number; data: Partial<ScheduleFormData> }) =>
            scheduleService.updateSchedule(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['mySchedules']});
            setFormOpen(false);
            setSelectedSchedule(null);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => scheduleService.deleteSchedule(id),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['mySchedules']});
        },
    });

    const handleCreateSchedule = (dayOfWeek: number) => {
        setFormMode('create');
        setSelectedSchedule(null);
        setSelectedDayOfWeek(dayOfWeek);
        setFormOpen(true);
    };

    const handleEditSchedule = (schedule: Schedule) => {
        setFormMode('edit');
        setSelectedSchedule(schedule);
        setSelectedDayOfWeek(undefined);
        setFormOpen(true);
    };

    const handleDeleteSchedule = async (schedule: Schedule) => {
        if (window.confirm(t('doctorSchedule.confirmDelete', {day: getDayName(schedule.day_of_week)}))) {
            try {
                await deleteMutation.mutateAsync(schedule.id);
            } catch (error) {
                console.error('Failed to delete schedule:', error);
                alert(t('doctorSchedule.failedToDelete'));
            }
        }
    };

    const handleFormSubmit = async (data: ScheduleFormData) => {
        if (formMode === 'create') {
            await createMutation.mutateAsync(data);
        } else if (selectedSchedule) {
            await updateMutation.mutateAsync({
                id: selectedSchedule.id,
                data,
            });
        }
    };

    const getDayName = (dayIndex: number): string => {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        return days[dayIndex] || 'Unknown';
    };

    const activeScheduleCount = schedules.filter(s => s.is_active).length;
    const totalScheduleCount = schedules.length;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-4">
                <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                    {t('doctorSchedule.failedToLoad')}
                </div>
                <Button onClick={() => refetch()} variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4"/>
                    {t('common.retry')}
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('doctorSchedule.title')}</h1>
                    <p className="text-muted-foreground mt-1">
                        {t('doctorSchedule.subtitle')}
                    </p>
                </div>
                <Button onClick={() => refetch()} variant="outline" size="sm">
                    <RefreshCw className="mr-2 h-4 w-4"/>
                    {t('common.refresh')}
                </Button>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Calendar className="h-6 w-6 text-primary"/>
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{totalScheduleCount}</p>
                                <p className="text-sm text-muted-foreground">{t('doctorSchedule.daysConfigured')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                <Calendar className="h-6 w-6 text-green-600"/>
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{activeScheduleCount}</p>
                                <p className="text-sm text-muted-foreground">{t('doctorSchedule.activeDays')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <Calendar className="h-6 w-6 text-blue-600"/>
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{7 - totalScheduleCount}</p>
                                <p className="text-sm text-muted-foreground">{t('doctorSchedule.daysRemaining')}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Alert>
                <Info className="h-4 w-4"/>
                <AlertDescription>
                    {t('doctorSchedule.instructions')}
                </AlertDescription>
            </Alert>

            <WeeklyScheduleCalendar
                schedules={schedules}
                onCreateSchedule={handleCreateSchedule}
                onEditSchedule={handleEditSchedule}
                onDeleteSchedule={handleDeleteSchedule}
            />

            <ScheduleForm
                open={formOpen}
                onClose={() => {
                    setFormOpen(false);
                    setSelectedSchedule(null);
                    setSelectedDayOfWeek(undefined);
                }}
                onSubmit={handleFormSubmit}
                schedule={selectedSchedule}
                dayOfWeek={selectedDayOfWeek}
                mode={formMode}
            />
        </div>
    );
};
