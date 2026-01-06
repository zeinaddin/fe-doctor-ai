import React from 'react';
import {Clock, Plus, Edit2, Trash2} from 'lucide-react';
import {Card, CardContent} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import type {Schedule} from '@/types';

interface WeeklyScheduleCalendarProps {
    schedules: Schedule[];
    onCreateSchedule: (dayOfWeek: number) => void;
    onEditSchedule: (schedule: Schedule) => void;
    onDeleteSchedule: (schedule: Schedule) => void;
}

const DAYS = [
    {index: 0, name: 'Monday', short: 'Mon'},
    {index: 1, name: 'Tuesday', short: 'Tue'},
    {index: 2, name: 'Wednesday', short: 'Wed'},
    {index: 3, name: 'Thursday', short: 'Thu'},
    {index: 4, name: 'Friday', short: 'Fri'},
    {index: 5, name: 'Saturday', short: 'Sat'},
    {index: 6, name: 'Sunday', short: 'Sun'},
];

const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
};

const calculateDuration = (startTime: string, endTime: string): string => {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);

    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    const durationMinutes = endTotalMinutes - startTotalMinutes;

    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    if (hours > 0 && minutes > 0) {
        return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
        return `${hours}h`;
    } else {
        return `${minutes}m`;
    }
};

export const WeeklyScheduleCalendar: React.FC<WeeklyScheduleCalendarProps> = ({
                                                                                  schedules,
                                                                                  onCreateSchedule,
                                                                                  onEditSchedule,
                                                                                  onDeleteSchedule,
                                                                              }) => {
    const getScheduleForDay = (dayIndex: number): Schedule | undefined => {
        return schedules.find(s => s.day_of_week === dayIndex);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {DAYS.map((day) => {
                const schedule = getScheduleForDay(day.index);
                const hasSchedule = !!schedule;

                return (
                    <Card
                        key={day.index}
                        className={`transition-all hover:shadow-md ${
                            hasSchedule
                                ? schedule.is_active
                                    ? 'border-primary/50 bg-primary/5'
                                    : 'border-muted bg-muted/30'
                                : 'border-dashed'
                        }`}
                    >
                        <CardContent className="p-4">
                            {/* Day Header */}
                            <div className="mb-3 pb-3 border-b">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="font-semibold text-sm">{day.name}</h3>
                                    {schedule && !schedule.is_active && (
                                        <Badge variant="secondary" className="text-xs">
                                            Inactive
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">{day.short}</p>
                            </div>

                            {/* Schedule Content */}
                            {hasSchedule && schedule ? (
                                <div className="space-y-3">
                                    {/* Time Display */}
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Clock className="h-3.5 w-3.5 text-muted-foreground"/>
                                            <span className="font-medium">
                                                {formatTime(schedule.start_time)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm ml-5">
                                            <span className="text-muted-foreground">to</span>
                                            <span className="font-medium">
                                                {formatTime(schedule.end_time)}
                                            </span>
                                        </div>
                                        <div className="ml-5 pt-1">
                                            <Badge variant="outline" className="text-xs">
                                                {calculateDuration(schedule.start_time, schedule.end_time)}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Slot Duration */}
                                    <div className="pt-2 border-t">
                                        <p className="text-xs text-muted-foreground mb-1">Slot Duration</p>
                                        <p className="text-sm font-medium">{schedule.slot_duration_minutes} min</p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-1 pt-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="flex-1 h-8"
                                            onClick={() => onEditSchedule(schedule)}
                                        >
                                            <Edit2 className="h-3 w-3 mr-1"/>
                                            Edit
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => onDeleteSchedule(schedule)}
                                        >
                                            <Trash2 className="h-3 w-3"/>
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                /* Empty State */
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <div className="mb-3 opacity-20">
                                        <Clock className="h-8 w-8 text-muted-foreground"/>
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-3">
                                        No availability set
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => onCreateSchedule(day.index)}
                                    >
                                        <Plus className="h-3 w-3 mr-1"/>
                                        Add
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
};
