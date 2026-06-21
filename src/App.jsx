import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Layout from '@/components/garden/Layout';
import Dashboard from '@/pages/Dashboard';
import Projects from '@/pages/Projects';
import WriteEditor from '@/pages/WriteEditor';
import StudioWall from '@/pages/StudioWall';
import Feed from '@/pages/Feed';
import Rooms from '@/pages/Rooms';
import AdminPanel from '@/pages/AdminPanel';
import Archive from '@/pages/Archive';
import Writers from '@/pages/Writers';
import Boards from '@/pages/Boards';
import BoardView from '@/pages/BoardView';
import PublicBoards from '@/pages/PublicBoards';
import Friends from '@/pages/Friends';
import RoomDetail from '@/pages/RoomDetail';
import WriterProfile from '@/pages/WriterProfile';
import Profile from '@/pages/Profile';
import Onboarding from '@/pages/Onboarding';

const OnboardingGuard = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { setChecked(true); return; }
    base44.auth.me()
      .then((user) => base44.entities.UserProfile.filter({ user_id: user.id }))
      .then((profiles) => {
        if (!profiles?.length || !profiles[0]?.onboarded) {
          navigate("/onboarding", { replace: true });
        }
        setChecked(true);
      })
      .catch(() => setChecked(true));
  }, [isAuthenticated]);

  if (!checked && isAuthenticated) return null;
  return children;
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: "#efe7d3" }}>
        <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: "#e7ddc6", borderTopColor: "#23402b" }} />
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route element={<OnboardingGuard><Layout /></OnboardingGuard>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/write/:id" element={<WriteEditor />} />
          <Route path="/studio-wall" element={<StudioWall />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/rooms/:id" element={<RoomDetail />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="/writers" element={<Writers />} />
          <Route path="/boards" element={<Boards />} />
          <Route path="/boards/:id" element={<BoardView />} />
          <Route path="/open-studios" element={<PublicBoards />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/writer/:id" element={<WriterProfile />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App