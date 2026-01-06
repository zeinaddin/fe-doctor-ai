import React, {useState} from 'react';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight, Ban} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Card} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {Label} from '@/components/ui/label';
import {doctorService} from '@/services/doctorService.ts';
import {type Doctor, DoctorStatus} from '@/types';

export const DoctorRequests: React.FC = () => {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [selectedFilter, setSelectedFilter] = useState<typeof DoctorStatus[keyof typeof DoctorStatus] | 'ALL'>('ALL');

    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    const filters = selectedFilter === 'ALL' ? {} : {status: selectedFilter};

    // API returns array directly, not paginated
    const {data: doctors = [], isLoading} = useQuery<Doctor[]>({
        queryKey: ['doctors', page, pageSize, filters],
        queryFn: () => doctorService.getDoctors((page - 1) * pageSize, pageSize, filters),
        refetchInterval: 30000,
    });

    const approveMutation = useMutation({
        mutationFn: (doctorId: number) =>
            doctorService.updateDoctorStatus(doctorId, {status: DoctorStatus.APPROVED}),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['doctors']});
        },
    });

    const rejectMutation = useMutation({
        mutationFn: ({doctorId, reason}: { doctorId: number; reason?: string }) =>
            doctorService.updateDoctorStatus(doctorId, {
                status: DoctorStatus.REJECTED,
                rejection_reason: reason,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['doctors']});
            setRejectDialogOpen(false);
            setRejectionReason('');
            setSelectedDoctorId(null);
        },
    });

    const suspendMutation = useMutation({
        mutationFn: (doctorId: number) =>
            doctorService.updateDoctorStatus(doctorId, {status: DoctorStatus.SUSPENDED}),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['doctors']});
        },
    });

    const handleApprove = async (doctorId: number) => {
        if (window.confirm('Are you sure you want to approve this doctor application?')) {
            try {
                await approveMutation.mutateAsync(doctorId);
            } catch (error) {
                console.error('Failed to approve doctor:', error);
                alert('Failed to approve doctor. Please try again.');
            }
        }
    };

    const handleRejectClick = (doctorId: number) => {
        setSelectedDoctorId(doctorId);
        setRejectDialogOpen(true);
    };

    const handleRejectSubmit = async () => {
        if (!selectedDoctorId) return;

        try {
            await rejectMutation.mutateAsync({
                doctorId: selectedDoctorId,
                reason: rejectionReason.trim() || undefined,
            });
        } catch (error) {
            console.error('Failed to reject doctor:', error);
            alert('Failed to reject doctor. Please try again.');
        }
    };

    const handleSuspend = async (doctorId: number) => {
        if (window.confirm('Are you sure you want to suspend this doctor?')) {
            try {
                await suspendMutation.mutateAsync(doctorId);
            } catch (error) {
                console.error('Failed to suspend doctor:', error);
                alert('Failed to suspend doctor. Please try again.');
            }
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case DoctorStatus.PENDING:
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    <Clock className="h-3 w-3 mr-1"/>
                    Pending
                </Badge>;
            case DoctorStatus.APPROVED:
                return <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1"/>
                    Approved
                </Badge>;
            case DoctorStatus.REJECTED:
                return <Badge variant="secondary" className="bg-red-100 text-red-800">
                    <XCircle className="h-3 w-3 mr-1"/>
                    Rejected
                </Badge>;
            case DoctorStatus.SUSPENDED:
                return <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                    <Ban className="h-3 w-3 mr-1"/>
                    Suspended
                </Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };


    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Doctor Management</h1>
                    <p className="text-muted-foreground mt-1">Review and manage doctor applications and status</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
                <Button
                    variant={selectedFilter === 'ALL' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                        setSelectedFilter('ALL');
                        setPage(1);
                    }}
                >
                    All
                </Button>
                <Button
                    variant={selectedFilter === DoctorStatus.PENDING ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                        setSelectedFilter(DoctorStatus.PENDING);
                        setPage(1);
                    }}
                >
                    <Clock className="h-4 w-4 mr-1"/>
                    Pending
                </Button>
                <Button
                    variant={selectedFilter === DoctorStatus.APPROVED ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                        setSelectedFilter(DoctorStatus.APPROVED);
                        setPage(1);
                    }}
                >
                    <CheckCircle className="h-4 w-4 mr-1"/>
                    Approved
                </Button>
                <Button
                    variant={selectedFilter === DoctorStatus.REJECTED ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                        setSelectedFilter(DoctorStatus.REJECTED);
                        setPage(1);
                    }}
                >
                    <XCircle className="h-4 w-4 mr-1"/>
                    Rejected
                </Button>
                <Button
                    variant={selectedFilter === DoctorStatus.SUSPENDED ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                        setSelectedFilter(DoctorStatus.SUSPENDED);
                        setPage(1);
                    }}
                >
                    <Ban className="h-4 w-4 mr-1"/>
                    Suspended
                </Button>
            </div>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Applicant</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Specialty</TableHead>
                            <TableHead>License</TableHead>
                            <TableHead>Experience</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8">
                                    <div className="flex justify-center">
                                        <div
                                            className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : doctors.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-12">
                                    <Clock className="h-12 w-12 mx-auto mb-3 opacity-20 text-muted-foreground"/>
                                    <p className="text-muted-foreground font-medium">No doctors found</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {selectedFilter === 'ALL'
                                            ? 'No doctor applications yet'
                                            : `No ${selectedFilter} doctors`}
                                    </p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            doctors.map((doctor: Doctor) => (
                                <TableRow key={doctor.id}>
                                    <TableCell className="font-mono text-sm">{doctor.id}</TableCell>
                                    <TableCell className="font-medium">
                                        {doctor.full_name || '—'}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {doctor.email || '—'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">
                                            {doctor.specialization_name || 'Not specified'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground font-mono text-sm">
                                        {doctor.license_number}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {doctor.experience_years} years
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(doctor.status || '')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {doctor.status === DoctorStatus.PENDING && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                        title="Approve application"
                                                        onClick={() => handleApprove(doctor.id)}
                                                        disabled={approveMutation.isPending}
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-1"/>
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        title="Reject application"
                                                        onClick={() => handleRejectClick(doctor.id)}
                                                        disabled={rejectMutation.isPending}
                                                    >
                                                        <XCircle className="h-4 w-4 mr-1"/>
                                                        Reject
                                                    </Button>
                                                </>
                                            )}
                                            {doctor.status === DoctorStatus.APPROVED && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                                                    title="Suspend doctor"
                                                    onClick={() => handleSuspend(doctor.id)}
                                                    disabled={suspendMutation.isPending}
                                                >
                                                    <Ban className="h-4 w-4 mr-1"/>
                                                    Suspend
                                                </Button>
                                            )}
                                            {(doctor.status === DoctorStatus.REJECTED || doctor.status === DoctorStatus.SUSPENDED) && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                    title="Approve doctor"
                                                    onClick={() => handleApprove(doctor.id)}
                                                    disabled={approveMutation.isPending}
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-1"/>
                                                    Approve
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>

            {/* Pagination */}
            {(doctors.length > 0 || page > 1) && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Page {page} - Showing {doctors.length} results
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1"/>
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => p + 1)}
                            disabled={doctors.length < pageSize}
                        >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1"/>
                        </Button>
                    </div>
                </div>
            )}

            {/* Info Notice */}
            {doctors.length > 0 && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <p className="text-sm text-blue-800">
                        <strong>Note:</strong> Approving an application will grant the user doctor privileges and make
                        them available for appointments. You can suspend approved doctors if needed.
                    </p>
                </div>
            )}

            {/* Rejection Dialog */}
            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Reject Doctor Application</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Please provide a reason for rejecting this application. This will help the applicant
                            understand why their application was not approved.
                        </p>

                        <div className="space-y-2">
                            <Label htmlFor="rejection-reason">Rejection Reason (Optional)</Label>
                            <textarea
                                id="rejection-reason"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                placeholder="e.g., Incomplete documentation provided, Invalid license number, etc."
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setRejectDialogOpen(false);
                                setRejectionReason('');
                                setSelectedDoctorId(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleRejectSubmit}
                            disabled={rejectMutation.isPending}
                        >
                            {rejectMutation.isPending ? 'Rejecting...' : 'Reject Application'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
