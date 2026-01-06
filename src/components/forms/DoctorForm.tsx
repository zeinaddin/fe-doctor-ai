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
import {type DoctorFormData, type User} from '../../types';
import {userService} from '../../services/userService';
import {specializationService} from '../../services/specializationService';

interface DoctorFormProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    doctor?: any;
    mode: 'create' | 'edit';
}

export const DoctorForm: React.FC<DoctorFormProps> = ({
                                                          open,
                                                          onClose,
                                                          onSuccess,
                                                          doctor,
                                                          mode,
                                                      }) => {
    const [formData, setFormData] = useState<DoctorFormData>({
        specialization_id: doctor?.specialization_id || '',
        license_number: doctor?.licenseNumber || '',
        experience_years: doctor?.experience_years || 0,
        bio: doctor?.bio || '',
        status: doctor?.status || '',
    });

    const [selectedUserId, setSelectedUserId] = useState<number>(doctor?.userId || 0);

    // Fetch users for dropdown (only non-doctor users)
    const {data: usersData = []} = useQuery<User[]>({
        queryKey: ['users'],
        queryFn: () => userService.getUsers(0, 100),
        enabled: mode === 'create',
    });

    // Fetch specializations from API
    const {data: specializations = [], isLoading: isLoadingSpecializations} = useQuery({
        queryKey: ['specializations'],
        queryFn: () => specializationService.getSpecializations(),
    });

    useEffect(() => {
        if (doctor) {
            setFormData({
                specialization_id: doctor.specialty,
                license_number: doctor.licenseNumber,
                experience_years: doctor.yearsOfExperience,
                bio: doctor.bio || '',
                status: doctor.status,
            });
            setSelectedUserId(doctor.userId);
        }
    }, [doctor]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSuccess();
        onClose();
    };

    const handleChange = (field: keyof DoctorFormData, value: any) => {
        setFormData((prev) => ({...prev, [field]: value}));
    };

    const availableUsers = usersData.filter((user: User) => !user.is_doctor);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'create' ? 'Register New Doctor' : 'Edit Doctor'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === 'create' && (
                        <div className="space-y-2">
                            <Label htmlFor="userId">Select User</Label>
                            <select
                                id="userId"
                                value={selectedUserId}
                                onChange={(e) => setSelectedUserId(Number(e.target.value))}
                                className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                required
                            >
                                <option value="">Select a user...</option>
                                {availableUsers.map((user: User) => (
                                    <option key={user.id} value={user.id}>
                                        {user.full_name} ({user.email})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="specialty">Specialty</Label>
                        <select
                            id="specialty"
                            value={formData.specialization_id}
                            onChange={(e) => handleChange('specialization_id', e.target.value)}
                            className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            required
                            disabled={isLoadingSpecializations}
                        >
                            <option value="">
                                {isLoadingSpecializations ? 'Loading specializations...' : 'Select a specialty...'}
                            </option>
                            {specializations.map((spec) => (
                                <option key={spec.id} value={spec.title}>
                                    {spec.title}
                                </option>
                            ))}
                        </select>
                        {specializations.length === 0 && !isLoadingSpecializations && (
                            <p className="text-xs text-muted-foreground">
                                No specializations available. Please add specializations first.
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="licenseNumber">License Number</Label>
                        <Input
                            id="licenseNumber"
                            value={formData.license_number}
                            onChange={(e) => handleChange('license_number', e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                        <Input
                            id="yearsOfExperience"
                            type="number"
                            min="0"
                            value={formData.experience_years}
                            onChange={(e) => handleChange('experience_years', Number(e.target.value))}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bio">Bio (Optional)</Label>
                        <textarea
                            id="bio"
                            value={formData.bio}
                            onChange={(e) => handleChange('bio', e.target.value)}
                            className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            placeholder="Brief professional bio..."
                        />
                    </div>


                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            {mode === 'create' ? 'Register Doctor' : 'Update Doctor'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
