import React, {useState, useEffect} from 'react';
import {useQuery} from '@tanstack/react-query';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {doctorService} from '../../services/doctorService';
import type {BookingFormData, Doctor} from '../../types';

interface BookingFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: BookingFormData) => void;
    booking?: any;
    mode: 'create' | 'edit';
}

function toDatetimeLocalValue(input?: string) {
    if (!input) return '';
    const d = new Date(input);
    if (Number.isNaN(d.getTime())) return '';

    const pad = (n: number) => String(n).padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function toIsoStringFromDatetimeLocal(value: string) {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? value : d.toISOString();
}

export const BookingForm: React.FC<BookingFormProps> = ({
                                                            open,
                                                            onClose,
                                                            onSubmit,
                                                            booking,
                                                            mode,
                                                        }) => {
    const [formData, setFormData] = useState<BookingFormData>({
        doctor_id: 0,
        date_time: '',
        notes: '',
    });

    const {data: doctorsData = []} = useQuery<Doctor[]>({
        queryKey: ['doctors'],
        queryFn: () => doctorService.getDoctors(0, 100),
        enabled: open && mode === 'create',
    });

    useEffect(() => {
        if (booking && open) {
            setFormData({
                doctor_id: booking.doctor_id ?? booking.doctorId ?? 0,
                date_time: toDatetimeLocalValue(booking.date_time ?? booking.appointmentDate ?? booking.dateTime),
                notes: booking.notes ?? '',
            });
            return;
        }

        if (open) {
            setFormData({
                doctor_id: 0,
                date_time: '',
                notes: '',
            });
        }
    }, [booking, open]);

    const handleChange = <K extends keyof BookingFormData>(field: K, value: BookingFormData[K]) => {
        setFormData((prev) => ({...prev, [field]: value}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (mode === 'create') {
            if (!formData.doctor_id || formData.doctor_id <= 0) {
                alert('Please select a doctor');
                return;
            }
        }

        if (!formData.date_time) {
            alert('Please select appointment date & time');
            return;
        }

        onSubmit({
            ...formData,
            date_time: toIsoStringFromDatetimeLocal(formData.date_time),
        });
    };

    const doctorsList: Doctor[] = doctorsData;

    return (
        <Dialog
            open={open}
            onOpenChange={(isOpen) => {
                if (!isOpen) onClose();
            }}
        >
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{mode === 'create' ? 'Create New Booking' : 'Edit Booking'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === 'create' && (
                        <div className="space-y-2">
                            <Label htmlFor="doctorId">Doctor</Label>
                            <select
                                id="doctorId"
                                value={formData.doctor_id || 0}
                                onChange={(e) => handleChange('doctor_id', Number(e.target.value))}
                                className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                required
                            >
                                <option value={0}>Select a doctor...</option>
                                {doctorsList.map((doctor) => (
                                    <option key={doctor.id} value={doctor.id}>
                                        Dr. {doctor.full_name} - {doctor.specialization_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="datetime">Appointment Date & Time</Label>
                        <Input
                            id="datetime"
                            type="datetime-local"
                            value={formData.date_time}
                            onChange={(e) => handleChange('date_time', e.target.value)}
                            required
                            min={toDatetimeLocalValue(new Date().toISOString())}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <textarea
                            id="notes"
                            value={formData.notes || ''}
                            onChange={(e) => handleChange('notes', e.target.value)}
                            className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            placeholder="Describe your symptoms or any additional information..."
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            {mode === 'create' ? 'Create Booking' : 'Update Booking'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
