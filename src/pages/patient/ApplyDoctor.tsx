import React, {useState} from 'react';
import {useMutation, useQuery} from '@tanstack/react-query';
import {Stethoscope, CheckCircle, XCircle, Clock, AlertCircle} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Separator} from '@/components/ui/separator';
import {type DoctorFormData} from '@/types';
import {doctorService} from '@/services/doctorService.ts';
import {specializationService} from '@/services/specializationService.ts';

export const ApplyDoctor: React.FC = () => {
    const [formData, setFormData] = useState<DoctorFormData>({
        specialization_id: 0,
        license_number: '',
        experience_years: 0,
        bio: '',
        status: "pending"
    });

    // Check current doctor status
    const {data: doctorStatus, isLoading: statusLoading} = useQuery({
        queryKey: ['doctorStatus'],
        queryFn: () => doctorService.getDoctorStatus(),
    });

    // Fetch specializations from API
    const {data: specializations = [], isLoading: isLoadingSpecializations} = useQuery({
        queryKey: ['specializations'],
        queryFn: () => specializationService.getSpecializations(),
    });

    const applyMutation = useMutation({
        mutationFn: (data: DoctorFormData) => doctorService.registerDoctor(data),
        onSuccess: () => {
            alert('Your application has been submitted successfully! An admin will review it shortly.');
            window.location.reload();
        },
        onError: (error: any) => {
            alert(error.response?.data?.detail || 'Failed to submit application. Please try again.');
        },
    });

    const withdrawMutation = useMutation({
        mutationFn: () => doctorService.withdrawDoctorApplication(),
        onSuccess: () => {
            alert('Your application has been withdrawn.');
            window.location.reload();
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        applyMutation.mutate(formData);
    };

    const handleChange = (field: keyof DoctorFormData, value: any) => {
        setFormData((prev) => ({...prev, [field]: value}));
    };

    if (statusLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (doctorStatus?.status === 'approved') {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Doctor Status</h1>
                    <p className="text-muted-foreground mt-1">You are registered as a doctor</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="h-6 w-6 text-green-600"/>
                            Application Approved
                        </CardTitle>
                        <CardDescription>
                            Your doctor application has been approved. You can now manage your schedule and patients.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-muted-foreground">Status</p>
                                <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // If application is pending
    if (doctorStatus?.status === 'pending') {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Doctor Application</h1>
                    <p className="text-muted-foreground mt-1">Your application is under review</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-6 w-6 text-yellow-600"/>
                            Application Pending
                        </CardTitle>
                        <CardDescription>
                            Your application is being reviewed by an administrator. You will be notified once a decision
                            has been made.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="destructive" onClick={() => withdrawMutation.mutate()}>
                            <XCircle className="h-4 w-4 mr-2"/>
                            Withdraw Application
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Application form
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Apply to be a Doctor</h1>
                <p className="text-muted-foreground mt-1">
                    Submit your credentials to become a healthcare provider on our platform
                </p>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5"/>
                    <div>
                        <p className="text-sm text-blue-800 font-medium">Application Requirements</p>
                        <p className="text-sm text-blue-700 mt-1">
                            Please ensure all information is accurate. Your application will be reviewed by an
                            administrator before approval.
                        </p>
                    </div>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Stethoscope className="h-5 w-5"/>
                        Doctor Application Form
                    </CardTitle>
                    <CardDescription>
                        Fill in your professional credentials and qualifications
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="specialty">Medical Specialty *</Label>
                            <select
                                id="specialty"
                                value={formData.specialization_id || 0}
                                onChange={(e) => handleChange('specialization_id', Number(e.target.value))}
                                className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                required
                                disabled={isLoadingSpecializations}
                            >
                                <option value={0} disabled>
                                    {isLoadingSpecializations ? 'Loading specializations...' : 'Select a specialty...'}
                                </option>

                                {specializations.map((spec) => (
                                    <option key={spec.id} value={spec.id}>
                                        {spec.title}
                                    </option>
                                ))}
                            </select>
                            {specializations.length === 0 && !isLoadingSpecializations && (
                                <p className="text-xs text-destructive">
                                    No specializations available. Please contact an administrator.
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="licenseNumber">Medical License Number *</Label>
                            <Input
                                id="licenseNumber"
                                value={formData.license_number}
                                onChange={(e) => handleChange('license_number', e.target.value)}
                                placeholder="e.g., MD123456"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="yearsOfExperience">Years of Experience *</Label>
                            <Input
                                id="yearsOfExperience"
                                type="number"
                                min="0"
                                max="70"
                                value={formData.experience_years}
                                onChange={(e) => handleChange('experience_years', Number(e.target.value))}
                                required
                            />
                        </div>


                        <div className="space-y-2">
                            <Label htmlFor="bio">Professional Bio (Optional)</Label>
                            <textarea
                                id="bio"
                                value={formData.bio}
                                onChange={(e) => handleChange('bio', e.target.value)}
                                className="w-full min-h-[120px] px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                placeholder="Tell patients about yourself, your approach to healthcare, and areas of expertise..."
                            />
                            <p className="text-xs text-muted-foreground">
                                This will be visible to patients when they search for doctors
                            </p>
                        </div>

                        <Separator/>

                        <div className="flex gap-3">
                            <Button type="submit" disabled={applyMutation.isPending} className="flex-1">
                                {applyMutation.isPending ? 'Submitting...' : 'Submit Application'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};
