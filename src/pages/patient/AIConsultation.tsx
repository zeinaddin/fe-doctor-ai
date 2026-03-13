import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  Send,
  Loader2,
  Check,
  Bot,
  User,
  ArrowLeft,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Star,
} from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '../../contexts/AuthContext';
import { chatService } from '../../services/chatService';
import type { ChatMessage, TriageRunWithDetails } from '../../types';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface ExternalResource {
  name: string;
  type: string;
  url: string;
  description: string;
}

interface EmergencyContacts {
  emergency?: string;
  poison_control?: string;
  mental_health?: string;
}

interface DoctorRecommendation {
  recommendation: boolean;
  specialization: string;
  confidence: number;
  urgency: string;
  reasoning: string;
  has_platform_doctors?: boolean;
  recommended_doctor_ids?: number[];
  recommended_doctors?: Array<{
    id: number;
    name: string;
    specialization: string;
    rating: number;
    experience_years: number;
  }>;
  external_resources?: ExternalResource[];
  emergency_contacts?: EmergencyContacts;
  general_advice?: string;
}

// Parse JSON recommendation from AI message
const parseRecommendation = (content: string): { text: string; recommendation: DoctorRecommendation | null } => {
  const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    try {
      const recommendation = JSON.parse(jsonMatch[1]) as DoctorRecommendation;
      const text = content.replace(/```json[\s\S]*?```/, '').trim();
      return { text, recommendation };
    } catch {
      return { text: content, recommendation: null };
    }
  }
  return { text: content, recommendation: null };
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Inline Doctor Recommendation Component
const DoctorRecommendationCard: React.FC<{
  recommendation: DoctorRecommendation;
  onBookDoctor: (doctorId: number) => void;
}> = ({ recommendation, onBookDoctor }) => {
  const { t } = useTranslation();
  const hasPlatformDoctors = recommendation.has_platform_doctors !== false &&
    recommendation.recommended_doctors && recommendation.recommended_doctors.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 p-4 rounded-xl bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200"
    >
      {/* Header with urgency badge */}
      <div className="flex items-center gap-2 mb-3">
        <Stethoscope className="h-5 w-5 text-teal-600" />
        <h4 className="font-semibold text-teal-900">
          {hasPlatformDoctors ? t('aiConsultation.recommendedDoctors') : t('aiConsultation.externalResources')}
        </h4>
        <Badge
          className={cn(
            'ml-auto capitalize',
            recommendation.urgency === 'emergency'
              ? 'bg-red-100 text-red-700'
              : recommendation.urgency === 'high'
              ? 'bg-orange-100 text-orange-700'
              : recommendation.urgency === 'medium'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-green-100 text-green-700'
          )}
        >
          {recommendation.urgency} {t('aiConsultation.urgency')}
        </Badge>
      </div>

      {/* Platform Doctors */}
      {hasPlatformDoctors ? (
        <div className="space-y-2">
          {recommendation.recommended_doctors!.map((doctor) => (
            <div
              key={doctor.id}
              className="p-3 rounded-lg bg-white border border-teal-100 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                  {doctor.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{doctor.name}</p>
                  <p className="text-sm text-gray-500">
                    {doctor.specialization} • {doctor.experience_years} {t('common.years')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="font-medium">{doctor.rating?.toFixed(1)}</span>
                </div>
                <Button
                  size="sm"
                  onClick={() => onBookDoctor(doctor.id)}
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                >
                  {t('aiConsultation.bookAppointment')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {/* No platform doctors message */}
          <p className="text-sm text-teal-800 bg-teal-100/50 p-3 rounded-lg">
            {recommendation.general_advice || t('aiConsultation.noMatchingDoctors', { specialization: recommendation.specialization })}
          </p>

          {/* External Resources */}
          {recommendation.external_resources && recommendation.external_resources.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-teal-900">{t('aiConsultation.findDoctorsOnline')}</p>
              {recommendation.external_resources.map((resource, idx) => (
                <a
                  key={idx}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg-white border border-teal-100 hover:border-teal-300 hover:shadow-sm transition-all group"
                >
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white shrink-0">
                    {resource.type === 'search' ? '🔍' : resource.type === 'booking' ? '📅' : '📋'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 group-hover:text-teal-600 transition-colors">
                      {resource.name}
                    </p>
                    <p className="text-sm text-gray-500 truncate">{resource.description}</p>
                  </div>
                  <svg className="h-5 w-5 text-gray-400 group-hover:text-teal-500 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ))}
            </div>
          )}

          {/* Emergency Contacts */}
          {recommendation.emergency_contacts && (recommendation.urgency === 'high' || recommendation.urgency === 'emergency') && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm font-semibold text-red-800 mb-2">{t('aiConsultation.emergencyContacts')}</p>
              <div className="flex flex-wrap gap-3">
                {recommendation.emergency_contacts.emergency && (
                  <a href={`tel:${recommendation.emergency_contacts.emergency}`} className="text-sm text-red-700 hover:underline">
                    🚨 {t('aiConsultation.emergency')}: {recommendation.emergency_contacts.emergency}
                  </a>
                )}
                {recommendation.emergency_contacts.poison_control && (
                  <a href={`tel:${recommendation.emergency_contacts.poison_control}`} className="text-sm text-red-700 hover:underline">
                    ☠️ {t('aiConsultation.poisonControl')}: {recommendation.emergency_contacts.poison_control}
                  </a>
                )}
                {recommendation.emergency_contacts.mental_health && (
                  <a href={`tel:${recommendation.emergency_contacts.mental_health}`} className="text-sm text-red-700 hover:underline">
                    💚 {t('aiConsultation.mentalHealth')}: {recommendation.emergency_contacts.mental_health}
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export const AIConsultation: React.FC = () => {
  useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showStartForm, setShowStartForm] = useState(false);
  const [initialSymptoms, setInitialSymptoms] = useState('');
  const [triageResult, setTriageResult] = useState<TriageRunWithDetails | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch user's chat sessions
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['chatSessions'],
    queryFn: () => chatService.getMySessions(0, 100),
  });

  // Create new session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (symptoms: string) => {
      const session = await chatService.createSession({
        locale: navigator.language.split('-')[0] || 'en',
        context_json: { initial_symptoms: symptoms },
      });
      // Send initial symptoms as first message
      await chatService.sendMessage(session.id, { content: symptoms });
      return session;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['chatSessions'] });
      setSelectedSession(data.id);
      setShowStartForm(false);
      setInitialSymptoms('');
      loadMessages(data.id);
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: ({ sessionId, content }: { sessionId: number; content: string }) =>
      chatService.sendMessage(sessionId, { content }),
    onSuccess: () => {
      if (selectedSession) {
        loadMessages(selectedSession);
      }
    },
  });

  // Create triage mutation
  const createTriageMutation = useMutation({
    mutationFn: (sessionId: number) => chatService.createTriageRun(sessionId),
    onSuccess: async (_, sessionId) => {
      // Fetch the triage result with details
      const result = await chatService.getLatestTriageRun(sessionId);
      setTriageResult(result);
      queryClient.invalidateQueries({ queryKey: ['chatSessions'] });
    },
  });

  const loadMessages = async (sessionId: number) => {
    try {
      const sessionData = await chatService.getSession(sessionId);
      setMessages(sessionData.messages || []);
      // Also check for existing triage
      const triage = await chatService.getLatestTriageRun(sessionId);
      setTriageResult(triage);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  useEffect(() => {
    if (selectedSession) {
      loadMessages(selectedSession);
    }
  }, [selectedSession]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedSession || isSending) return;

    const content = inputMessage;
    setInputMessage('');
    setIsSending(true);

    // Optimistically add user message
    const tempMessage: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content,
      content_type: 'text',
      session_id: selectedSession,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMessage]);

    try {
      await sendMessageMutation.mutateAsync({ sessionId: selectedSession, content });
    } finally {
      setIsSending(false);
    }
  };

  const handleRunTriage = () => {
    if (selectedSession) {
      createTriageMutation.mutate(selectedSession);
    }
  };

  const currentSession = sessions.find((s) => s.id === selectedSession);

  const handleBookDoctor = (doctorId: number) => {
    navigate(`/patient/find-doctors?doctorId=${doctorId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  // Session List View
  if (!selectedSession && !showStartForm) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              {t('aiConsultation.title')}
            </h1>
            <p className="text-muted-foreground mt-1">{t('aiConsultation.subtitle')}</p>
          </div>
          <Button
            onClick={() => setShowStartForm(true)}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 shadow-lg shadow-teal-500/25"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            {t('aiConsultation.startNewConsultation')}
          </Button>
        </motion.div>

        {/* How it works */}
        <motion.div variants={itemVariants}>
          <Card className="border-teal-200 bg-gradient-to-r from-teal-50 to-cyan-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shrink-0">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-teal-900 text-lg mb-2">
                    {t('aiConsultation.howItWorks')}
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((step) => (
                      <div key={step} className="flex items-center gap-2 text-sm text-teal-800">
                        <div className="h-6 w-6 rounded-full bg-teal-200 flex items-center justify-center text-xs font-semibold text-teal-700">
                          {step}
                        </div>
                        <span>{t(`aiConsultation.step${step}`)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sessions List */}
        {sessions.length === 0 ? (
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="py-16">
                <div className="text-center">
                  <div className="h-20 w-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                    <MessageCircle className="h-10 w-10 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{t('aiConsultation.noConsultationsYet')}</h3>
                  <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                    {t('aiConsultation.startFirstConsultation')}
                  </p>
                  <Button
                    onClick={() => setShowStartForm(true)}
                    className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    {t('aiConsultation.startConsultationBtn')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div variants={itemVariants} className="grid gap-4">
            {sessions.map((session) => (
              <motion.div key={session.id} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Card
                  className="hover:shadow-lg transition-all duration-200 cursor-pointer border-gray-200 hover:border-teal-200"
                  onClick={() => setSelectedSession(session.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-teal-500/10 to-cyan-500/10 flex items-center justify-center shrink-0">
                          <Bot className="h-6 w-6 text-teal-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg mb-1">
                            {t('aiConsultation.consultation', { id: session.id })}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            {format(new Date(session.created_at), 'MMM dd, yyyy • HH:mm')}
                          </div>
                        </div>
                      </div>
                      <Badge
                        className={cn(
                          'capitalize',
                          session.status === 'closed'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-teal-100 text-teal-700'
                        )}
                      >
                        {session.status === 'closed' ? (
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                        ) : (
                          <div className="h-2 w-2 rounded-full bg-teal-500 mr-1.5 animate-pulse" />
                        )}
                        {session.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    );
  }

  // Start New Consultation Form
  if (showStartForm) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 max-w-2xl mx-auto"
      >
        <div>
          <Button variant="ghost" onClick={() => setShowStartForm(false)} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.back')}
          </Button>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
            {t('aiConsultation.startNewConsultation')}
          </h1>
          <p className="text-muted-foreground mt-1">{t('aiConsultation.describeSymptoms')}</p>
        </div>

        <Card className="border-2 border-teal-100">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-teal-50 to-cyan-50">
                <div className="h-10 w-10 rounded-lg bg-teal-100 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-teal-600" />
                </div>
                <p className="text-sm text-teal-800">
                  Describe your symptoms in detail. Our AI will analyze them and help you find the
                  right specialist.
                </p>
              </div>

              <Textarea
                value={initialSymptoms}
                onChange={(e) => setInitialSymptoms(e.target.value)}
                placeholder={t('aiConsultation.symptomsPlaceholder')}
                rows={6}
                className="resize-none border-gray-200 focus:border-teal-300 focus:ring-teal-200"
              />

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowStartForm(false)}>
                  {t('common.cancel')}
                </Button>
                <Button
                  onClick={() => createSessionMutation.mutate(initialSymptoms)}
                  disabled={!initialSymptoms.trim() || createSessionMutation.isPending}
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                >
                  {createSessionMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('aiConsultation.starting')}
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      {t('aiConsultation.startConsultationBtn')}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Chat Interface
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 h-[calc(100vh-200px)] flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setSelectedSession(null)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Consultation #{selectedSession}</h1>
            <p className="text-sm text-muted-foreground">
              {currentSession && format(new Date(currentSession.created_at), 'MMMM dd, yyyy • HH:mm')}
            </p>
          </div>
        </div>
        {currentSession?.status !== 'closed' && (
          <Button
            onClick={handleRunTriage}
            disabled={createTriageMutation.isPending}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
          >
            {createTriageMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('aiConsultation.completing')}
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                {t('aiConsultation.completeConsultation')}
              </>
            )}
          </Button>
        )}
      </div>

      {/* Triage Results */}
      <AnimatePresence>
        {triageResult && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-teal-200 bg-gradient-to-r from-teal-50 to-cyan-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-teal-900 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-teal-600" />
                  {t('aiConsultation.consultationAnalysis')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {triageResult.urgency && (
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-teal-600" />
                    <div>
                      <p className="text-sm text-teal-700">Urgency Level</p>
                      <Badge
                        className={cn(
                          'capitalize',
                          triageResult.urgency === 'emergency'
                            ? 'bg-red-100 text-red-700'
                            : triageResult.urgency === 'high'
                            ? 'bg-orange-100 text-orange-700'
                            : triageResult.urgency === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        )}
                      >
                        {triageResult.urgency}
                      </Badge>
                    </div>
                  </div>
                )}

                {triageResult.specialization_name && (
                  <div className="flex items-center gap-3">
                    <Stethoscope className="h-5 w-5 text-teal-600" />
                    <div>
                      <p className="text-sm text-teal-700">
                        {t('aiConsultation.recommendedSpecialization')}
                      </p>
                      <Badge className="bg-teal-600 text-white">
                        {triageResult.specialization_name}
                      </Badge>
                    </div>
                  </div>
                )}

                {triageResult.candidates && triageResult.candidates.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-teal-900 mb-3">
                      {t('aiConsultation.recommendedDoctors')}
                    </p>
                    <div className="grid gap-2">
                      {triageResult.candidates.map((candidate) => (
                        <div
                          key={candidate.id}
                          className="p-3 rounded-xl bg-white border border-teal-100 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                              {candidate.doctor_name?.charAt(0) || 'D'}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Dr. {candidate.doctor_name}</p>
                              <p className="text-sm text-gray-500">
                                {candidate.specialization_name} • {candidate.doctor_experience_years} years
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-amber-500">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="font-medium">{candidate.doctor_rating?.toFixed(1)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Messages */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => {
            const isAssistant = message.role === 'assistant';
            const { text, recommendation } = isAssistant
              ? parseRecommendation(message.content)
              : { text: message.content, recommendation: null };

            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn('flex gap-3', message.role === 'user' ? 'flex-row-reverse' : '')}
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback
                    className={cn(
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white'
                        : 'bg-gray-100'
                    )}
                  >
                    {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <div className="max-w-[80%]">
                  <div
                    className={cn(
                      'rounded-2xl p-4',
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                        : 'bg-gray-100'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{text}</p>
                    <p
                      className={cn(
                        'text-xs mt-2',
                        message.role === 'user' ? 'text-teal-100' : 'text-muted-foreground'
                      )}
                    >
                      {format(new Date(message.created_at), 'HH:mm')}
                    </p>
                  </div>
                  {recommendation && (
                    <DoctorRecommendationCard
                      recommendation={recommendation}
                      onBookDoctor={handleBookDoctor}
                    />
                  )}
                </div>
              </motion.div>
            );
          })}

          {isSending && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-gray-100">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="rounded-2xl p-4 bg-gray-100">
                <div className="flex gap-1">
                  <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" />
                  <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.1s]" />
                  <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.2s]" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>

        {/* Input Area */}
        <div className="border-t p-4 shrink-0">
          <div className="flex gap-3">
            <Textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={t('aiConsultation.typeMessage')}
              rows={1}
              className="resize-none min-h-[44px] border-gray-200 focus:border-teal-300"
              disabled={isSending || currentSession?.status === 'closed'}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isSending || currentSession?.status === 'closed'}
              size="icon"
              className="h-11 w-11 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
