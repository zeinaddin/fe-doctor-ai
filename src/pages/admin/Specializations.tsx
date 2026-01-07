import React, {useState} from 'react';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {useTranslation} from 'react-i18next';
import {Plus, Search, Edit, Trash2, Users} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Card} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {SpecializationForm} from '@/components/forms/SpecializationForm';
import {specializationService} from '@/services/specializationService.ts';
import type {Specialization, SpecializationFormData} from '@/types';

export const Specializations: React.FC = () => {
    const {t} = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const queryClient = useQueryClient();

    const [openForm, setOpenForm] = useState(false);
    const [selectedSpecialization, setSelectedSpecialization] = useState<Specialization | null>(null);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

    const {data: specializations = [], isLoading} = useQuery<Specialization[]>({
        queryKey: ['specializations'],
        queryFn: () => specializationService.getSpecializations(),
    });

    const createMutation = useMutation({
        mutationFn: (data: SpecializationFormData) => specializationService.createSpecialization(data),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['specializations']});
            setOpenForm(false);
            setSelectedSpecialization(null);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({id, data}: { id: number; data: Partial<SpecializationFormData> }) =>
            specializationService.updateSpecialization(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['specializations']});
            setOpenForm(false);
            setSelectedSpecialization(null);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => specializationService.deleteSpecialization(id),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['specializations']});
        },
    });

    const handleCreate = () => {
        setFormMode('create');
        setSelectedSpecialization(null);
        setOpenForm(true);
    };

    const handleEdit = (specialization: Specialization) => {
        setFormMode('edit');
        setSelectedSpecialization(specialization);
        setOpenForm(true);
    };

    const handleDelete = async (id: number, name: string) => {
        if (window.confirm(t('adminSpecializations.confirmDelete', {name}))) {
            try {
                await deleteMutation.mutateAsync(id);
            } catch (error) {
                console.error('Failed to delete specialization:', error);
                alert(t('adminSpecializations.deleteFailed'));
            }
        }
    };

    const handleFormSubmit = async (formData: SpecializationFormData) => {
        try {
            if (formMode === 'create') {
                await createMutation.mutateAsync(formData);
            } else if (selectedSpecialization) {
                await updateMutation.mutateAsync({id: selectedSpecialization.id, data: formData});
            }
        } catch (error) {
            console.error('Failed to save specialization:', error);
            alert(t('adminSpecializations.saveFailed'));
        }
    };

    const filteredSpecializations = specializations.filter(spec =>
        spec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (spec.description && spec.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('adminSpecializations.title')}</h1>
                    <p className="text-muted-foreground mt-1">{t('adminSpecializations.subtitle')}</p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4"/>
                    {t('adminSpecializations.addSpecialization')}
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                    <Input
                        placeholder={t('placeholders.searchSpecializations')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <div className="text-sm text-muted-foreground">
                    {filteredSpecializations.length} {t('adminSpecializations.specializationsCount')}
                </div>
            </div>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('common.id')}</TableHead>
                            <TableHead>{t('common.name')}</TableHead>
                            <TableHead>{t('common.description')}</TableHead>
                            <TableHead>{t('adminSpecializations.doctorsCount')}</TableHead>
                            <TableHead>{t('common.created')}</TableHead>
                            <TableHead className="text-right">{t('common.actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    <div className="flex justify-center">
                                        <div
                                            className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredSpecializations.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    {t('adminSpecializations.noSpecializations')}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredSpecializations.map((specialization) => (
                                <TableRow key={specialization.id}>
                                    <TableCell className="font-mono text-sm">{specialization.id}</TableCell>
                                    <TableCell className="font-medium">{specialization.title}</TableCell>
                                    <TableCell className="text-muted-foreground max-w-md truncate">
                                        {specialization.description || '—'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="gap-1">
                                            <Users className="h-3 w-3"/>
                                            {specialization.doctors_count || 0}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {specialization.created_at
                                            ? new Date(specialization.created_at).toLocaleDateString()
                                            : '—'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                title="Edit specialization"
                                                onClick={() => handleEdit(specialization)}
                                            >
                                                <Edit className="h-4 w-4"/>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                title="Delete specialization"
                                                onClick={() => handleDelete(specialization.id, specialization.title)}
                                                disabled={deleteMutation.isPending || (specialization.doctors_count ? specialization.doctors_count > 0 : false)}
                                            >
                                                <Trash2 className="h-4 w-4"/>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>

            {filteredSpecializations.length > 0 && filteredSpecializations.some(s => s.doctors_count && s.doctors_count > 0) && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm text-amber-800">
                        {t('adminSpecializations.cannotDelete')}
                    </p>
                </div>
            )}

            <SpecializationForm
                open={openForm}
                onClose={() => {
                    setOpenForm(false);
                    setSelectedSpecialization(null);
                }}
                onSubmit={handleFormSubmit}
                specialization={selectedSpecialization}
                mode={formMode}
            />
        </div>
    );
};
