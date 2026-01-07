import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { UserRole } from './types';

// Page imports
import { Login } from './pages/Login';
import { LandingPage } from './pages/LandingPage';

// Admin imports
import { AdminLayout } from './layouts/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { Users } from './pages/admin/Users';
import { Doctors } from './pages/admin/Doctors';
import { Specializations } from './pages/admin/Specializations';
import { DoctorRequests } from './pages/admin/DoctorRequests';
import { Bookings } from './pages/admin/Bookings';
import { SymptomChecker } from './pages/admin/SymptomChecker';

// Doctor imports
import { DoctorLayout } from './layouts/DoctorLayout';
import { DoctorDashboard } from './pages/doctor/DoctorDashboard';
import { DoctorWeeklySchedule } from './pages/doctor/DoctorWeeklySchedule';
import { DoctorAppointments } from './pages/doctor/DoctorAppointments';
import { DoctorPatients } from './pages/doctor/DoctorPatients';
import { DoctorEMR } from './pages/doctor/DoctorEMR';

// Patient imports
import { PatientLayout } from './layouts/PatientLayout';
import { PatientRegister } from './pages/patient/PatientRegister';
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { ApplyDoctor } from './pages/patient/ApplyDoctor';
import { PatientAppointments } from './pages/patient/PatientAppointments';
import { PatientFindDoctors } from './pages/patient/PatientFindDoctors';
import { PatientRecords } from './pages/patient/PatientRecords';
import { AIConsultation } from './pages/patient/AIConsultation';

// Unauthorized page component
const UnauthorizedPage = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{t('errors.unauthorized')}</h1>
        <p className="text-muted-foreground mt-2">{t('errors.noPermission')}</p>
      </div>
    </div>
  );
};

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes - Single unified login */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<PatientRegister />} />

            {/* Legacy login routes - redirect to unified login */}
            <Route path="/admin/login" element={<Navigate to="/login" replace />} />
            <Route path="/doctor/login" element={<Navigate to="/login" replace />} />
            <Route path="/patient/login" element={<Navigate to="/login" replace />} />
            <Route path="/patient/register" element={<Navigate to="/register" replace />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="doctors" element={<Doctors />} />
              <Route path="specializations" element={<Specializations />} />
              <Route path="doctor-requests" element={<DoctorRequests />} />
              <Route path="bookings" element={<Bookings />} />
              <Route path="symptom-checker" element={<SymptomChecker />} />
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
            </Route>

            {/* Doctor Routes */}
            <Route
              path="/doctor"
              element={
                <ProtectedRoute allowedRoles={[UserRole.DOCTOR]}>
                  <DoctorLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<DoctorDashboard />} />
              <Route path="schedule" element={<DoctorWeeklySchedule />} />
              <Route path="appointments" element={<DoctorAppointments />} />
              <Route path="patients" element={<DoctorPatients />} />
              <Route path="emr" element={<DoctorEMR />} />
              <Route index element={<Navigate to="/doctor/dashboard" replace />} />
            </Route>

            {/* Patient Routes */}
            <Route
              path="/patient"
              element={
                <ProtectedRoute allowedRoles={[UserRole.PATIENT]}>
                  <PatientLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<PatientDashboard />} />
              <Route path="apply-doctor" element={<ApplyDoctor />} />
              <Route path="appointments" element={<PatientAppointments />} />
              <Route path="find-doctors" element={<PatientFindDoctors />} />
              <Route path="records" element={<PatientRecords />} />
              <Route path="ai-consultation" element={<AIConsultation />} />
              <Route index element={<Navigate to="/patient/dashboard" replace />} />
            </Route>

            {/* Default Redirect */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
