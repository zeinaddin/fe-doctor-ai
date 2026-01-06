import React, {useState, useEffect} from 'react';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Switch} from '@/components/ui/switch';
import type {Schedule, ScheduleFormData} from '@/types';

interface ScheduleFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: ScheduleFormData) => Promise<void>;
    schedule?: Schedule | null;
    dayOfWeek?: number;
    mode: 'create' | 'edit';
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const ScheduleForm: React.FC<ScheduleFormProps> = ({
                                                              open,
                                                              onClose,
                                                              onSubmit,
                                                              schedule,
                                                              dayOfWeek,
                                                              mode,
                                                          }) => {
    const [formData, setFormData] = useState<ScheduleFormData>({
        day_of_week: dayOfWeek ?? schedule?.day_of_week ?? 0,
        start_time: schedule?.start_time || '09:00',
        end_time: schedule?.end_time || '17:00',
        slot_duration_minutes: schedule?.slot_duration_minutes || 30,
        is_active: schedule?.is_active ?? true,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (schedule) {
            setFormData({
                day_of_week: schedule.day_of_week,
                start_time: schedule.start_time.substring(0, 5),
                end_time: schedule.end_time.substring(0, 5),
                slot_duration_minutes: schedule.slot_duration_minutes,
                is_active: schedule.is_active,
            });
        } else if (dayOfWeek !== undefined) {
            setFormData(prev => ({
                ...prev,
                day_of_week: dayOfWeek,
                start_time: '09:00',
                end_time: '17:00',
                slot_duration_minutes: 30,
                is_active: true,
            }));
        }
    }, [schedule, dayOfWeek]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!formData.start_time || !formData.end_time) {
            setError('Please fill in all required fields');
            return;
        }

        const [startHour, startMin] = formData.start_time.split(':').map(Number);
        const [endHour, endMin] = formData.end_time.split(':').map(Number);

        if (startHour * 60 + startMin >= endHour * 60 + endMin) {
            setError('Start time must be before end time');
            return;
        }

        if (formData.slot_duration_minutes < 10 || formData.slot_duration_minutes > 120) {
            setError('Slot duration must be between 10 and 120 minutes');
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(formData);
            onClose();
        } catch (err: any) {
            setError(err?.response?.data?.detail || 'Failed to save schedule');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (field: keyof ScheduleFormData, value: any) => {
        setFormData(prev => ({...prev, [field]: value}));
        setError(null);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'create' ? 'Add' : 'Edit'} Availability Schedule
                    </DialogTitle>
                    <DialogDescription>
                        {mode === 'create'
                            ? `Set your availability for ${DAYS[formData.day_of_week]}`
                            : `Update your ${DAYS[formData.day_of_week]} schedule`}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Day of Week (read-only display) */}
                    <div className="space-y-2">
                        <Label>Day of Week</Label>
                        <Input
                            value={DAYS[formData.day_of_week]}
                            disabled
                            className="bg-muted"
                        />
                    </div>

                    {/* Start Time */}
                    <div className="space-y-2">
                        <Label htmlFor="start_time">
                            Start Time <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="start_time"
                            type="time"
                            value={formData.start_time}
                            onChange={(e) => handleChange('start_time', e.target.value)}
                            required
                        />
                    </div>

                    {/* End Time */}
                    <div className="space-y-2">
                        <Label htmlFor="end_time">
                            End Time <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="end_time"
                            type="time"
                            value={formData.end_time}
                            onChange={(e) => handleChange('end_time', e.target.value)}
                            required
                        />
                    </div>

                    {/* Slot Duration */}
                    <div className="space-y-2">
                        <Label htmlFor="slot_duration_minutes">
                            Appointment Slot Duration (minutes) <span className="text-destructive">*</span>
                        </Label>
                        <div className="flex gap-2 items-center">
                            <Input
                                id="slot_duration_minutes"
                                type="number"
                                min="10"
                                max="120"
                                step="5"
                                value={formData.slot_duration_minutes}
                                onChange={(e) => handleChange('slot_duration_minutes', parseInt(e.target.value))}
                                required
                                className="flex-1"
                            />
                            <span className="text-sm text-muted-foreground">minutes</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Recommended: 15, 30, 45, or 60 minutes
                        </p>
                    </div>

                    {/* Active Status */}
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="space-y-0.5">
                            <Label htmlFor="is_active" className="cursor-pointer">
                                Active Schedule
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                {formData.is_active
                                    ? 'Patients can book appointments during this time'
                                    : 'This schedule is currently disabled'}
                            </p>
                        </div>
                        <Switch
                            id="is_active"
                            checked={formData.is_active}
                            onCheckedChange={(checked) => handleChange('is_active', checked)}
                        />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div
                            className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                            {error}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1"
                        >
                            {isSubmitting
                                ? mode === 'create'
                                    ? 'Creating...'
                                    : 'Updating...'
                                : mode === 'create'
                                    ? 'Create Schedule'
                                    : 'Update Schedule'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
