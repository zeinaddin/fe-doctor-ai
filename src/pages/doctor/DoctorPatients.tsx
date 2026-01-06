import React, {useMemo, useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {Search, Eye, Users as UsersIcon} from 'lucide-react';
import {format} from 'date-fns';
import {Card} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Button} from '@/components/ui/button';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {useAuth} from '../../contexts/AuthContext';
import {bookingService} from '@/services/bookingService';
import type {Appointment} from '@/types';

export const DoctorPatients: React.FC = () => {
    const {user} = useAuth();
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [page, setPage] = useState(0);
    const [rowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    const {data: appointments = [], isLoading, error} = useQuery<Appointment[]>({
        queryKey: ['doctorPatients', 'byDate', selectedDate],
        enabled: !!user,
        queryFn: () => bookingService.getMyDoctorBookings(selectedDate),
    });

    const uniquePatients = useMemo(() => {
        const patientMap = new Map<number, any>();

        appointments.forEach((appointment) => {
            if (!appointment.patient_id) return;

            const patientId = appointment.patient_id;
            const visitDate = appointment.date_time;

            if (!patientMap.has(patientId)) {
                patientMap.set(patientId, {
                    id: patientId,
                    full_name: appointment.patient_name || 'Unknown',
                    email: appointment.patient_email || 'N/A',
                    phone: appointment.patient_phone || 'N/A',
                    lastVisit: visitDate,
                    totalVisits: 1,
                });
            } else {
                const existing = patientMap.get(patientId);
                existing.totalVisits += 1;
                if (new Date(visitDate) > new Date(existing.lastVisit)) {
                    existing.lastVisit = visitDate;
                }
            }
        });

        return Array.from(patientMap.values());
    }, [appointments]);

    const filteredPatients = useMemo(() => {
        if (!searchTerm) return uniquePatients;

        const term = searchTerm.toLowerCase();
        return uniquePatients.filter((p) =>
            (p.full_name || '').toLowerCase().includes(term) ||
            (p.email || '').toLowerCase().includes(term)
        );
    }, [uniquePatients, searchTerm]);

    const visiblePatients = useMemo(() => {
        const start = page * rowsPerPage;
        return filteredPatients.slice(start, start + rowsPerPage);
    }, [filteredPatients, page, rowsPerPage]);

    const totalPages = Math.ceil(filteredPatients.length / rowsPerPage);

    const handleChangePage = (newPage: number) => {
        setPage(newPage);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                Failed to load patients. Please try again later.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Patients</h1>
                    <p className="text-muted-foreground mt-1">View and manage your patient list</p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="date-filter">Filter by Date</Label>
                    <Input
                        id="date-filter"
                        type="date"
                        value={selectedDate}
                        onChange={(e) => {
                            setSelectedDate(e.target.value);
                            setPage(0);
                        }}
                        className="w-auto"
                    />
                </div>
            </div>

            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                <Input
                    placeholder="Search patients by name or email..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setPage(0);
                    }}
                    className="pl-9"
                />
            </div>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Last Visit</TableHead>
                            <TableHead>Total Visits</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {visiblePatients.length > 0 ? (
                            visiblePatients.map((patient: any) => (
                                <TableRow key={patient.id}>
                                    <TableCell className="font-mono text-sm">{patient.id}</TableCell>
                                    <TableCell className="font-medium">{patient.full_name}</TableCell>
                                    <TableCell className="text-muted-foreground">{patient.email}</TableCell>
                                    <TableCell className="text-muted-foreground">{patient.phone || 'N/A'}</TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {patient.lastVisit ? format(new Date(patient.lastVisit), 'MMM dd, yyyy') : 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{patient.totalVisits}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" title="View patient details">
                                            <Eye className="h-4 w-4"/>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-12">
                                    <UsersIcon className="h-12 w-12 mx-auto mb-3 opacity-20 text-muted-foreground"/>
                                    <p className="text-muted-foreground">No patients found</p>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>

            {filteredPatients.length > 0 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Showing {page * rowsPerPage + 1} to {Math.min((page + 1) * rowsPerPage, filteredPatients.length)} of{' '}
                        {filteredPatients.length} patients
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleChangePage(page - 1)}
                            disabled={page === 0}
                        >
                            Previous
                        </Button>
                        <span className="text-sm">
              Page {page + 1} of {totalPages}
            </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleChangePage(page + 1)}
                            disabled={page >= totalPages - 1}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};
