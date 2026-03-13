export const UserRole = {
    ADMIN: 'ADMIN',
    DOCTOR: 'DOCTOR',
    PATIENT: 'PATIENT',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface User {
    id: number;
    email: string;
    full_name: string;
    phone: string;
    is_admin: boolean;
    is_doctor?: boolean;
    doctor_id?: number;
}

/**
 * Get the primary role for the user (highest priority role)
 */
export const getUserRole = (user: User): UserRole => {
    if (user.is_admin) return UserRole.ADMIN;
    if (user.is_doctor) return UserRole.DOCTOR;
    return UserRole.PATIENT;
};

/**
 * Get all roles/portals the user can access
 * - Admin can access: ADMIN + DOCTOR (if is_doctor) + PATIENT
 * - Doctor can access: DOCTOR + PATIENT
 * - Patient can access: PATIENT only
 */
export const getUserAccessibleRoles = (user: User): UserRole[] => {
    const roles: UserRole[] = [UserRole.PATIENT]; // Everyone can access patient portal

    if (user.is_doctor) {
        roles.unshift(UserRole.DOCTOR); // Add doctor portal access
    }

    if (user.is_admin) {
        roles.unshift(UserRole.ADMIN); // Add admin portal access at the start
    }

    return roles;
};

/**
 * Check if user can access a specific portal
 */
export const canAccessPortal = (user: User, role: UserRole): boolean => {
    return getUserAccessibleRoles(user).includes(role);
};

/**
 * Get the default/highest priority portal for the user after login
 */
export const getDefaultPortalPath = (user: User): string => {
    if (user.is_admin) return '/admin/dashboard';
    if (user.is_doctor) return '/doctor/dashboard';
    return '/patient/dashboard';
};

export const getUserNames = (user: User): { firstName: string; lastName: string } => {
    if (user.full_name) {
        const names = user.full_name.split(' ');
        return {
            firstName: names[0] || '',
            lastName: names.slice(1).join(' ') || '',
        };
    }
    return { firstName: '', lastName: '' };
};


export interface Doctor {
    id: number;
    bio: string;
    rating: number;
    experience_years: number;
    license_number: string;
    status?: string;
    rejection_reason?: string;
    user_id: number;
    specialization_id: number;
    created_at: string;
    updated_at: string;
    full_name?: string;
    email?: string;
    phone?: string;
    specialization_name?: string;
}

export const DoctorStatus = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    SUSPENDED: 'suspended',
} as const;

export type DoctorStatus = typeof DoctorStatus[keyof typeof DoctorStatus];

export interface Schedule {
    id: number;
    doctor_id: number;
    doctor?: Doctor;
    day_of_week: number;
    start_time: string;
    end_time: string;
    slot_duration_minutes: number;  // API uses slot_duration_minutes
    is_active: boolean;
    created_at: string;
    updated_at?: string;
}

// Backend uses Appointment, matches AppointmentStatus enum
export const AppointmentStatus = {
    SCHEDULED: 'scheduled',
    CONFIRMED: 'confirmed',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    NO_SHOW: 'no_show',
} as const;

export type AppointmentStatus = typeof AppointmentStatus[keyof typeof AppointmentStatus];

export interface Appointment {
    id: number;
    date_time: string;
    status: AppointmentStatus;
    notes?: string;
    symptoms?: string;
    patient_id: number;
    doctor_id: number;
    ai_consultation_id?: number;
    created_at: string;
    updated_at: string;
    patient_name?: string;
    patient_email?: string;
    patient_phone?: string;
    doctor_name?: string;
    specialization_name?: string;
}

// Keep Booking as an alias for backwards compatibility
export type Booking = Appointment;
export type BookingStatus = AppointmentStatus;
export const BookingStatus = AppointmentStatus;

export type DoctorDaySlot = {
    start_time: string;     // "07:31:11.451Z"
    end_time: string;       // "07:31:11.451Z"
    is_available: boolean;
};

export interface MedicalRecord {
    id: number;
    diagnosis: string;
    prescription?: string;
    notes?: string;
    patient_id: number;
    doctor_id: number;
    appointment_id?: number;
    created_at: string;
    updated_at: string;
    // Fields from MedicalRecordWithDetailsResponse
    patient_name?: string;
    patient_email?: string;
    doctor_name?: string;
    specialization_name?: string;
}

// Keep EMR as an alias
export type EMR = MedicalRecord;

export interface SymptomCheckRequest {
    symptoms: string[];
    age?: number;
    gender?: string;
}

export interface SymptomCheckResponse {
    predictedSpecialty: string; // Changed from Specialty enum to string to support custom specializations
    confidence: number;
    recommendations?: string[];
    urgencyLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    full_name: string;
    phone?: string;
    role: UserRole;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface UserFormData {
    email: string;
    firstName: '',
    lastName: '',
    phone?: string;
    role: UserRole;
    password?: string;
}

export interface DoctorFormData {
    bio: string;
    experience_years: number;
    license_number: string;
    specialization_id: number;
    status: DoctorStatus;
}

export interface DoctorStatusFormData {
    status: DoctorStatus;
    rejection_reason?: string;
}

export interface ScheduleFormData {
    doctor_id?: number;
    day_of_week: number;
    start_time: string;
    end_time: string;
    slot_duration_minutes: number;  // API uses slot_duration_minutes
    is_active: boolean;
}

export interface AppointmentFormData {
    date_time: string;
    notes?: string;
    doctor_id: number;
    ai_consultation_id?: number;
}

// Keep BookingFormData as an alias
export type BookingFormData = AppointmentFormData;

export interface MedicalRecordFormData {
    patient_id: number;
    doctor_id: number;
    appointment_id?: number;
    diagnosis: string;
    prescription?: string;
    notes?: string;
}

// Keep EMRFormData as an alias
export type EMRFormData = MedicalRecordFormData;

export interface AppointmentFilters {
    status?: AppointmentStatus;
    doctor_id?: number;
    patient_id?: number;
    date_from?: string;
    date_to?: string;
}

// Keep BookingFilters as an alias
export type BookingFilters = AppointmentFilters;

export interface DoctorFilters {
    specialization_id?: number;
    status?: DoctorStatus;
    skip?: number;
    limit?: number;
}

export interface AdminDashboardStats {
    totalUsers: number;
    totalDoctors: number;
    totalBookings: number;
    todayBookings: number;
    pendingBookings: number;
    completedBookings: number;
    totalEMRs: number;
}

export interface DoctorDashboardStats {
    todayAppointments: number;
    upcomingAppointments: number;
    completedAppointments: number;
    totalPatients: number;
    rating?: number;
}

export interface Specialization {
    id: number;
    title: string;
    description: string;
    created_at?: string;
    updated_at?: string;
    doctors_count: number;
}

export interface SpecializationFormData {
    title: string;
    description: string;
}

// Chat Session types - matches backend API
export const ChatSessionStatus = {
    ACTIVE: 'active',
    CLOSED: 'closed',
} as const;

export type ChatSessionStatus = typeof ChatSessionStatus[keyof typeof ChatSessionStatus];

export const ChatSource = {
    WEB: 'web',
    MOBILE: 'mobile',
    TELEGRAM: 'telegram',
    WHATSAPP: 'whatsapp',
} as const;

export type ChatSource = typeof ChatSource[keyof typeof ChatSource];

export const MessageRole = {
    USER: 'user',
    ASSISTANT: 'assistant',
    SYSTEM: 'system',
} as const;

export type MessageRole = typeof MessageRole[keyof typeof MessageRole];

export const UrgencyLevel = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    EMERGENCY: 'emergency',
} as const;

export type UrgencyLevel = typeof UrgencyLevel[keyof typeof UrgencyLevel];

export interface ChatMessage {
    id: number;
    role: MessageRole;
    content: string;
    content_type: string;
    model_name?: string;
    prompt_version?: string;
    token_input?: number;
    token_output?: number;
    latency_ms?: number;
    session_id: number;
    created_at: string;
}

export interface ChatSession {
    id: number;
    status: ChatSessionStatus;
    source: ChatSource;
    locale?: string;
    last_message_at?: string;
    context_json?: Record<string, unknown>;
    user_id?: number;
    created_at: string;
    updated_at: string;
}

export interface ChatSessionWithMessages extends ChatSession {
    messages: ChatMessage[];
}

export interface TriageCandidate {
    id: number;
    rank: number;
    score: number;
    reason?: string;
    matched_filters_json?: Record<string, unknown>;
    triage_run_id: number;
    doctor_id: number;
    doctor_name: string;
    doctor_bio: string;
    doctor_rating: number;
    doctor_experience_years: number;
    specialization_name: string;
}

export interface TriageRun {
    id: number;
    status: string;
    urgency?: UrgencyLevel;
    confidence?: number;
    notes?: string;
    inputs_json?: Record<string, unknown>;
    outputs_json?: Record<string, unknown>;
    filters_json?: Record<string, unknown>;
    model_name?: string;
    prompt_version?: string;
    temperature?: number;
    token_input?: number;
    token_output?: number;
    latency_ms?: number;
    error_message?: string;
    session_id: number;
    trigger_message_id?: number;
    recommended_specialization_id?: number;
    created_at: string;
}

export interface TriageRunWithDetails extends TriageRun {
    specialization_name?: string;
    candidates: TriageCandidate[];
}

export interface CreateChatSessionRequest {
    source?: ChatSource;
    locale?: string;
    context_json?: Record<string, unknown>;
}

export interface SendChatMessageRequest {
    content: string;
    role?: MessageRole;
    content_type?: string;
}

export interface CreateTriageRequest {
    trigger_message_id?: number;
    inputs_json?: Record<string, unknown>;
    recommended_specialization_id?: number;
}

// Legacy aliases for backwards compatibility
export type Consultation = ChatSession;
export type ConsultationWithMessages = ChatSessionWithMessages;
export type ConsultationStatus = ChatSessionStatus;
export const ConsultationStatus = ChatSessionStatus;

export interface ConsultationAnalysis {
    triage: TriageRunWithDetails;
}

export interface StartConsultationRequest {
    symptoms_text: string;
}

export interface SendMessageRequest {
    content: string;
}
