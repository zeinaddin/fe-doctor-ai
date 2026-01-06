import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, Send, Loader2, Check, Bot, User, ArrowLeft, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '../../contexts/AuthContext';
import { aiConsultationService } from '../../services/aiConsultationService';
import type { ChatMessage, ConsultationAnalysis } from '../../types';

export const AIConsultation: React.FC = () => {
  useAuth();
  const queryClient = useQueryClient();
  const [selectedConsultation, setSelectedConsultation] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [showStartForm, setShowStartForm] = useState(false);
  const [initialSymptoms, setInitialSymptoms] = useState('');
  const [analysis, setAnalysis] = useState<ConsultationAnalysis | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: consultations = [], isLoading } = useQuery({
    queryKey: ['aiConsultations'],
    queryFn: () => aiConsultationService.getMyConsultations(0, 100),
  });

  const startConsultationMutation = useMutation({
    mutationFn: (symptoms: string) =>
      aiConsultationService.startConsultation({ symptoms_text: symptoms }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['aiConsultations'] });
      setSelectedConsultation(data.id);
      setShowStartForm(false);
      setInitialSymptoms('');
      loadMessages(data.id);
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: ({ consultationId, content }: { consultationId: number; content: string }) =>
      aiConsultationService.sendMessage(consultationId, { content }),
    onSuccess: () => {
      if (selectedConsultation) {
        loadMessages(selectedConsultation);
      }
    },
  });

  const completeConsultationMutation = useMutation({
    mutationFn: (consultationId: number) =>
      aiConsultationService.completeConsultation(consultationId),
    onSuccess: (data) => {
      setAnalysis(data);
      queryClient.invalidateQueries({ queryKey: ['aiConsultations'] });
    },
  });

  const loadMessages = async (consultationId: number) => {
    const msgs = await aiConsultationService.getConsultationMessages(consultationId);
    setMessages(msgs);
  };

  useEffect(() => {
    if (selectedConsultation) {
      loadMessages(selectedConsultation);
    }
  }, [selectedConsultation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedConsultation) return;

    const content = inputMessage;
    setInputMessage('');
    setIsStreaming(true);
    setStreamingMessage('');

    try {
      await aiConsultationService.sendMessageStream(
        selectedConsultation,
        content,
        (chunk) => {
          setStreamingMessage((prev) => prev + chunk);
        },
        () => {
          setIsStreaming(false);
          setStreamingMessage('');
          loadMessages(selectedConsultation);
        },
        (error) => {
          console.error('Streaming error:', error);
          setIsStreaming(false);
          setStreamingMessage('');
          // Fallback to non-streaming
          sendMessageMutation.mutate({ consultationId: selectedConsultation, content });
        }
      );
    } catch (error) {
      console.error('Error:', error);
      setIsStreaming(false);
    }
  };

  const handleCompleteConsultation = () => {
    if (selectedConsultation) {
      completeConsultationMutation.mutate(selectedConsultation);
    }
  };

  const currentConsultation = consultations.find(c => c.id === selectedConsultation);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show consultation list
  if (!selectedConsultation && !showStartForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AI Health Consultation</h1>
            <p className="text-muted-foreground mt-1">
              Chat with our AI assistant about your symptoms and get personalized recommendations
            </p>
          </div>
          <Button onClick={() => setShowStartForm(true)}>
            <MessageCircle className="mr-2 h-4 w-4" />
            Start New Consultation
          </Button>
        </div>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">How it works</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Describe your symptoms in detail</li>
                  <li>• Chat with our AI assistant for clarification</li>
                  <li>• Get analysis and doctor recommendations</li>
                  <li>• Book appointments with recommended specialists</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Consultations List */}
        {consultations.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
                <h3 className="text-lg font-semibold mb-2">No Consultations Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start your first AI consultation to get personalized health recommendations.
                </p>
                <Button onClick={() => setShowStartForm(true)}>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Start Consultation
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {consultations.map((consultation) => (
              <Card
                key={consultation.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedConsultation(consultation.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Bot className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">
                          Consultation #{consultation.id}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(consultation.created_at), 'MMMM dd, yyyy • HH:mm')}
                        </p>
                      </div>
                    </div>
                    <Badge variant={consultation.status === 'completed' ? 'default' : 'success'}>
                      {consultation.status.toUpperCase()}
                    </Badge>
                  </div>

                  <p className="text-sm mb-3 line-clamp-2">{consultation.symptoms_text}</p>

                  {consultation.recommended_specialization && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {consultation.recommended_specialization}
                      </Badge>
                      {consultation.confidence && (
                        <span className="text-xs text-muted-foreground">
                          {Math.round(consultation.confidence * 100)}% confidence
                        </span>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Show start consultation form
  if (showStartForm) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div>
          <Button variant="ghost" onClick={() => setShowStartForm(false)} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Start New Consultation</h1>
          <p className="text-muted-foreground mt-1">
            Describe your symptoms in detail to get started
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Describe Your Symptoms</label>
                <Textarea
                  value={initialSymptoms}
                  onChange={(e) => setInitialSymptoms(e.target.value)}
                  placeholder="Please describe what you're experiencing, including when symptoms started, severity, and any other relevant details..."
                  rows={8}
                  className="resize-none"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowStartForm(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => startConsultationMutation.mutate(initialSymptoms)}
                  disabled={!initialSymptoms.trim() || startConsultationMutation.isPending}
                >
                  {startConsultationMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Start Consultation
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show chat interface
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setSelectedConsultation(null)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Consultation #{selectedConsultation}</h1>
            <p className="text-sm text-muted-foreground">
              {currentConsultation && format(new Date(currentConsultation.created_at), 'MMMM dd, yyyy • HH:mm')}
            </p>
          </div>
        </div>
        {currentConsultation?.status !== 'completed' && (
          <Button
            onClick={handleCompleteConsultation}
            disabled={completeConsultationMutation.isPending}
          >
            {completeConsultationMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Completing...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Complete Consultation
              </>
            )}
          </Button>
        )}
      </div>

      {/* Analysis Results */}
      {analysis && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-900">Consultation Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysis.analysis.summary && (
              <div>
                <h4 className="font-semibold mb-2 text-green-900">Summary</h4>
                <p className="text-sm text-green-800">{analysis.analysis.summary}</p>
              </div>
            )}

            {analysis.analysis.symptoms && analysis.analysis.symptoms.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-green-900">Identified Symptoms</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.analysis.symptoms.map((symptom, idx) => (
                    <Badge key={idx} variant="outline" className="bg-white">
                      {symptom}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {analysis.analysis.recommended_specialization && (
              <div>
                <h4 className="font-semibold mb-2 text-green-900">Recommended Specialization</h4>
                <Badge className="bg-green-600">
                  {analysis.analysis.recommended_specialization}
                </Badge>
              </div>
            )}

            {analysis.recommended_doctors.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-green-900">Recommended Doctors</h4>
                <div className="grid gap-2">
                  {analysis.recommended_doctors.map((doctor) => (
                    <div
                      key={doctor.id}
                      className="p-3 rounded-lg bg-white border border-green-200"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{doctor.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {doctor.specialty}
                            {doctor.yearsOfExperience && ` • ${doctor.yearsOfExperience} years`}
                          </p>
                        </div>
                        {doctor.rating && (
                          <Badge variant="outline">{doctor.rating.toFixed(1)} ★</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Chat Messages */}
      <Card className="h-[500px] flex flex-col">
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className={message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}>
                  {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
              <div
                className={`rounded-lg p-3 max-w-[80%] ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                  {format(new Date(message.created_at), 'HH:mm')}
                </p>
              </div>
            </div>
          ))}

          {/* Streaming message */}
          {isStreaming && streamingMessage && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-secondary">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="rounded-lg p-3 bg-secondary max-w-[80%]">
                <p className="text-sm whitespace-pre-wrap">{streamingMessage}</p>
                <Loader2 className="h-3 w-3 animate-spin mt-1" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>

        <Separator />

        {/* Input Area */}
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type your message... (Shift+Enter for new line)"
              rows={2}
              className="resize-none"
              disabled={isStreaming || currentConsultation?.status === 'completed'}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isStreaming || currentConsultation?.status === 'completed'}
              size="icon"
              className="h-auto"
            >
              {isStreaming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
