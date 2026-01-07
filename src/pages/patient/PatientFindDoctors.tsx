import React, {useState} from 'react';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {useTranslation} from 'react-i18next';
import {Search, Stethoscope, Star, Calendar} from 'lucide-react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {Avatar, AvatarFallback} from '@/components/ui/avatar';
import {Dialog, DialogContent, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {doctorService} from '@/services/doctorService.ts';
import {bookingService} from '@/services/bookingService.ts';
import {specializationService} from '@/services/specializationService.ts';
import type {Doctor} from '@/types';
import {useAuth} from '../../contexts/AuthContext';

export const PatientFindDoctors: React.FC = () => {
    const {user} = useAuth();
    const queryClient = useQueryClient();
    const {t} = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState<string>('ALL');
    const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [bookingDateTime, setBookingDateTime] = useState('');
    const [bookingNotes, setBookingNotes] = useState('');

    // API returns array directly
    const {data: doctors = [], isLoading} = useQuery<Doctor[]>({
        queryKey: ['doctors', 'available'],
        queryFn: () => doctorService.getDoctors(0, 100, { status: 'approved' }),
    });

    // Fetch specializations from API
    const {data: specializations = []} = useQuery({
        queryKey: ['specializations'],
        queryFn: () => specializationService.getSpecializations(),
    });

    const bookingMutation = useMutation({
        mutationFn: (bookingData: { date_time: string; doctor_id: number; notes?: string }) =>
            bookingService.createBooking(bookingData),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['patientAppointments']});
            setBookingDialogOpen(false);
            setBookingDateTime('');
            setBookingNotes('');
            setSelectedDoctor(null);
            alert(t('patientFindDoctors.bookingSuccess'));
        },
        onError: (error) => {
            alert(t('patientFindDoctors.bookingFailed'));
            console.error('Booking error:', error);
        },
    });

    const handleBookAppointment = (doctor: Doctor) => {
        setSelectedDoctor(doctor);
        setBookingDialogOpen(true);
    };

    const handleSubmitBooking = () => {
        if (!selectedDoctor || !bookingDateTime || !user) {
            alert(t('patientFindDoctors.fillAllFields'));
            return;
        }

        bookingMutation.mutate({
            date_time: bookingDateTime,
            doctor_id: selectedDoctor.id,
            notes: bookingNotes || undefined,
        });
    };

    const filteredDoctors = doctors.filter(doctor => {
        const matchesSearch = doctor.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doctor.specialization_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doctor.bio?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesSpecialty = selectedSpecialty === 'ALL' || doctor.specialization_name === selectedSpecialty;

        return matchesSearch && matchesSpecialty;
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t('patientFindDoctors.title')}</h1>
                <p className="text-muted-foreground mt-1">{t('patientFindDoctors.subtitle')}</p>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                    <Input
                        placeholder={t('placeholders.searchByName')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <select
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="w-full md:w-64 h-10 px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    <option value="ALL">{t('patientFindDoctors.allSpecialties')}</option>
                    {specializations.map((spec) => (
                        <option key={spec.id} value={spec.title}>
                            {spec.title}
                        </option>
                    ))}
                </select>
            </div>

            {/* Results Count */}
            <div className="text-sm text-muted-foreground">
                {t('patientFindDoctors.foundDoctors', {count: filteredDoctors.length})}
            </div>

            {/* Doctors Grid */}
            {filteredDoctors.length === 0 ? (
                <Card>
                    <CardContent className="py-12">
                        <div className="text-center">
                            <Stethoscope className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20"/>
                            <h3 className="text-lg font-semibold mb-2">{t('patientFindDoctors.noDoctorsFound')}</h3>
                            <p className="text-muted-foreground">
                                {searchQuery || selectedSpecialty !== 'ALL'
                                    ? t('patientFindDoctors.tryAdjustingFilters')
                                    : t('patientFindDoctors.noAvailableDoctors')}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredDoctors.map((doctor) => (
                        <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-start gap-4">
                                    <Avatar className="h-16 w-16">
                                        <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                                            {doctor.full_name?.split(' ').map(n => n[0]).join('') || 'D'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <CardTitle className="text-lg mb-1">
                                            Dr. {doctor.full_name || 'Doctor'}
                                        </CardTitle>
                                        <Badge variant="outline" className="mb-2">
                                            {doctor.specialization_name || 'Specialist'}
                                        </Badge>
                                        {doctor.rating && (
                                            <div className="flex items-center gap-1">
                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400"/>
                                                <span className="text-sm font-medium">{doctor.rating.toFixed(1)}</span>
                                                <span className="text-xs text-muted-foreground ml-1">rating</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Experience */}
                                <div className="flex items-center gap-2 text-sm">
                                    <Stethoscope className="h-4 w-4 text-muted-foreground"/>
                                    <span>{t('patientFindDoctors.yearsExperience', {years: doctor.experience_years})}</span>
                                </div>

                                {/* Bio */}
                                {doctor.bio && (
                                    <div>
                                        <p className="text-sm font-medium mb-1">{t('patientFindDoctors.about')}</p>
                                        <p className="text-sm text-muted-foreground line-clamp-3">{doctor.bio}</p>
                                    </div>
                                )}

                                {/* License */}
                                <div className="pt-3 border-t">
                                    <p className="text-xs text-muted-foreground">
                                        {t('patientFindDoctors.license')}: {doctor.license_number}
                                    </p>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <Button
                                        className="flex-1"
                                        onClick={() => handleBookAppointment(doctor)}
                                        disabled={doctor.status !== 'approved'}
                                    >
                                        <Calendar className="mr-2 h-4 w-4"/>
                                        {t('patientFindDoctors.bookAppointmentBtn')}
                                    </Button>
                                    <Button variant="outline" size="icon">
                                        <Search className="h-4 w-4"/>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Info Banner */}
            {filteredDoctors.length > 0 && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <p className="text-sm text-blue-800">
                        {t('patientFindDoctors.verifiedNote')}
                    </p>
                </div>
            )}

            {/* Booking Dialog */}
            <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{t('patientAppointments.bookAppointment')}</DialogTitle>
                    </DialogHeader>
                    {selectedDoctor && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted">
                                <Avatar className="h-12 w-12">
                                    <AvatarFallback className="bg-primary text-primary-foreground">
                                        {selectedDoctor.full_name?.split(' ').map(n => n[0]).join('') || 'D'}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">Dr. {selectedDoctor.full_name}</p>
                                    <p className="text-sm text-muted-foreground">{selectedDoctor.specialization_name}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="datetime">{t('patientFindDoctors.appointmentDateTime')}</Label>
                                <Input
                                    id="datetime"
                                    type="datetime-local"
                                    value={bookingDateTime}
                                    onChange={(e) => setBookingDateTime(e.target.value)}
                                    min={new Date().toISOString().slice(0, 16)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">{t('patientFindDoctors.notesOptional')}</Label>
                                <Textarea
                                    id="notes"
                                    placeholder={t('placeholders.anySymptoms')}
                                    value={bookingNotes}
                                    onChange={(e) => setBookingNotes(e.target.value)}
                                    rows={3}
                                />
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setBookingDialogOpen(false)}
                                    disabled={bookingMutation.isPending}
                                >
                                    {t('common.cancel')}
                                </Button>
                                <Button
                                    className="flex-1"
                                    onClick={handleSubmitBooking}
                                    disabled={bookingMutation.isPending || !bookingDateTime}
                                >
                                    {bookingMutation.isPending ? t('patientFindDoctors.booking') : t('patientFindDoctors.confirmBooking')}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};
