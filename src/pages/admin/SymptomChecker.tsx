import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Brain, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { aiService } from '../../services/aiService';
import type { SymptomCheckResponse } from '../../types';

const commonSymptoms = [
  'Fever', 'Headache', 'Cough', 'Sore throat', 'Fatigue', 'Nausea',
  'Vomiting', 'Diarrhea', 'Abdominal pain', 'Chest pain', 'Shortness of breath',
  'Dizziness', 'Joint pain', 'Muscle pain', 'Rash', 'Runny nose', 'Congestion',
];

export const SymptomChecker: React.FC = () => {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [result, setResult] = useState<SymptomCheckResponse | null>(null);

  const mutation = useMutation({
    mutationFn: aiService.checkSymptoms,
    onSuccess: (data) => setResult(data),
  });

  const handleCheck = () => {
    if (selectedSymptoms.length === 0) return;
    mutation.mutate({
      symptoms: selectedSymptoms,
      age: age ? parseInt(age) : undefined,
      gender: gender || undefined,
    });
  };

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]
    );
  };

  const getUrgencyIcon = (level?: string) => {
    switch (level) {
      case 'LOW': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'MEDIUM': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'HIGH':
      case 'EMERGENCY': return <AlertCircle className="h-5 w-5 text-red-500" />;
      default: return null;
    }
  };

  const getUrgencyBadge = (level?: string) => {
    switch (level) {
      case 'LOW': return 'success';
      case 'MEDIUM': return 'warning';
      case 'HIGH':
      case 'EMERGENCY': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Symptom Checker</h1>
        <p className="text-muted-foreground mt-1">Analyze symptoms and recommend specialists</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Enter Symptoms</CardTitle>
            <CardDescription>Select symptoms and provide patient details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-3 block">Select Symptoms</label>
              <div className="flex flex-wrap gap-2">
                {commonSymptoms.map((symptom) => (
                  <Badge
                    key={symptom}
                    variant={selectedSymptoms.includes(symptom) ? 'default' : 'outline'}
                    className="cursor-pointer hover:bg-primary/80"
                    onClick={() => toggleSymptom(symptom)}
                  >
                    {symptom}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Age (optional)</label>
                <Input
                  type="number"
                  placeholder="Enter age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Gender (optional)</label>
                <Input
                  placeholder="Male/Female"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                />
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleCheck}
              disabled={selectedSymptoms.length === 0 || mutation.isPending}
            >
              <Brain className="mr-2 h-5 w-5" />
              {mutation.isPending ? 'Analyzing...' : 'Analyze Symptoms'}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle>Analysis Result</CardTitle>
            <CardDescription>AI-powered diagnosis and recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            {mutation.isPending && (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}

            {mutation.isError && (
              <div className="text-center py-12 text-muted-foreground">
                Failed to analyze symptoms. Please try again.
              </div>
            )}

            {result && !mutation.isPending && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="text-sm text-muted-foreground mb-1">Recommended Specialty</div>
                  <div className="text-2xl font-bold text-primary">
                    {result.predictedSpecialty.replace(/_/g, ' ')}
                  </div>
                  {result.confidence !== undefined && (
                    <div className="text-sm text-muted-foreground mt-2">
                      Confidence: {(result.confidence * 100).toFixed(1)}%
                    </div>
                  )}
                </div>

                {result.urgencyLevel && (
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      {getUrgencyIcon(result.urgencyLevel)}
                      <span className="text-sm font-medium">Urgency Level</span>
                    </div>
                    <Badge variant={getUrgencyBadge(result.urgencyLevel) as any}>
                      {result.urgencyLevel}
                    </Badge>
                  </div>
                )}

                {result.recommendations && result.recommendations.length > 0 && (
                  <div className="p-4 rounded-lg border">
                    <div className="text-sm font-medium mb-3">Suggested Questions for Doctor</div>
                    <ul className="space-y-2">
                      {result.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex gap-2">
                          <span className="text-primary">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {!result && !mutation.isPending && !mutation.isError && (
              <div className="text-center py-12 text-muted-foreground">
                <Brain className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Select symptoms and click analyze to see results</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
