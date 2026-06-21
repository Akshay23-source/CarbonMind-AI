import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Loader } from './components/Loader';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ProtectedRoute, OnboardingRoute } from './components/ProtectedRoute';

// Lazy load Pages & Layouts
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Onboarding = lazy(() => import('./pages/Onboarding'));

// Dashboard views
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CarbonTracker = lazy(() => import('./pages/CarbonTracker'));
const AICoach = lazy(() => import('./pages/AICoach'));
const Challenges = lazy(() => import('./pages/Challenges'));
const Community = lazy(() => import('./pages/Community'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Rewards = lazy(() => import('./pages/Rewards'));
const Wallet = lazy(() => import('./pages/Wallet'));
const Reports = lazy(() => import('./pages/Reports'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const ReceiptScanner = lazy(() => import('./pages/ReceiptScanner'));
const MealAnalyzer = lazy(() => import('./pages/MealAnalyzer'));
const TravelPlanner = lazy(() => import('./pages/TravelPlanner'));
const EnergyIntelligence = lazy(() => import('./pages/EnergyIntelligence'));
const CarbonTwin = lazy(() => import('./pages/CarbonTwin'));
const CommunityMap = lazy(() => import('./pages/CommunityMap'));
const ExperienceMode = lazy(() => import('./pages/ExperienceMode'));
const AIDashboard = lazy(() => import('./pages/AIDashboard'));

// Onboarding Layout
const AuthLayout = lazy(() => import('./layouts/AuthLayout'));

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<Loader fullScreen />}>
          <Routes>
            {/* Public Views */}
            <Route path="/" element={<Landing />} />
            <Route path="experience" element={<ExperienceMode />} />

            {/* Onboarding Credentials routes */}
            <Route element={<AuthLayout />}>
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
            </Route>

            {/* Onboarding Questionnaire wizard */}
            <Route element={<OnboardingRoute />}>
              <Route path="onboarding" element={<Onboarding />} />
            </Route>

            {/* Protected Workspace workspace routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="tracker" element={<CarbonTracker />} />
                <Route path="coach" element={<AICoach />} />
                <Route path="challenges" element={<Challenges />} />
                <Route path="community" element={<Community />} />
                <Route path="leaderboard" element={<Leaderboard />} />
                <Route path="rewards" element={<Rewards />} />
                <Route path="wallet" element={<Wallet />} />
                <Route path="reports" element={<Reports />} />
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<Settings />} />
                <Route path="scanner" element={<ReceiptScanner />} />
                <Route path="meals" element={<MealAnalyzer />} />
                <Route path="travel" element={<TravelPlanner />} />
                <Route path="energy" element={<EnergyIntelligence />} />
                <Route path="twin" element={<CarbonTwin />} />
                <Route path="map" element={<CommunityMap />} />
                <Route path="ai-dashboard" element={<AIDashboard />} />
              </Route>
            </Route>

            {/* Error and Redirection routes */}
            <Route path="404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
