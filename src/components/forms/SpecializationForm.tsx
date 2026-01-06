import React, {useState, useEffect} from 'react';
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
import type {SpecializationFormData, Specialization} from '../../types';

interface SpecializationFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: SpecializationFormData) => void;
    specialization?: Specialization | null;
    mode: 'create' | 'edit';
}

export const SpecializationForm: React.FC<SpecializationFormProps> = ({
                                                                          open,
                                                                          onClose,
                                                                          onSubmit,
                                                                          specialization,
                                                                          mode,
                                                                      }) => {
    const [formData, setFormData] = useState<SpecializationFormData>({
        title: '',
        description: '',
    });

    useEffect(() => {
        if (specialization) {
            setFormData({
                title: specialization.title,
                description: specialization.description || '',
            });
        } else {
            setFormData({
                title: '',
                description: '',
            });
        }
    }, [specialization, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleChange = (field: keyof SpecializationFormData, value: string) => {
        setFormData((prev) => ({...prev, [field]: value}));
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'create' ? 'Create New Specialization' : 'Edit Specialization'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Specialization Name *</Label>
                        <Input
                            id="name"
                            value={formData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            placeholder="e.g., Cardiology, Neurology"
                            required
                            autoFocus
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            placeholder="Brief description of this medical specialization..."
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            {mode === 'create' ? 'Create Specialization' : 'Update Specialization'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
