import { lazy } from 'react';

const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('@/pages/auth/VerifyEmailPage'));
const TicketsPage = lazy(() => import('@/pages/tickets/TicketsPage'));
const TicketTestPage = lazy(() => import('@/pages/tickets/TicketTestPage'));
const TopicsPage = lazy(() => import('@/pages/topics/TopicsPage'));
const TopicTestPage = lazy(() => import('@/pages/topics/TopicTestPage'));
const ExamPage = lazy(() => import('@/pages/exam/ExamPage'));
const MarathonPage = lazy(() => import('@/pages/marathon/MarathonPage'));
const SmartTestPage = lazy(() => import('@/pages/smart-test/SmartTestPage'));
const OctagonLobbyPage = lazy(() => import('@/pages/octagon/OctagonLobbyPage'));
const OctagonMatchPage = lazy(() => import('@/pages/octagon/OctagonMatchPage'));
const OctagonResultsPage = lazy(() => import('@/pages/octagon/OctagonResultsPage'));
const MistakesPage = lazy(() => import('@/pages/mistakes/MistakesPage'));
const StatsPage = lazy(() => import('@/pages/stats/StatsPage'));
const ProfilePage = lazy(() => import('@/pages/profile/ProfilePage'));
const SettingsPage = lazy(() => import('@/pages/profile/SettingsPage'));
const SubscriptionPage = lazy(() => import('@/pages/subscription/SubscriptionPage'));
const LeaderboardPage = lazy(() => import('@/pages/leaderboard/LeaderboardPage'));
const AchievementsPage = lazy(() => import('@/pages/achievements/AchievementsPage'));

export const publicRoutes = [
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  { path: '/verify-email', element: <VerifyEmailPage /> },
];

export const protectedRoutes = [
  { path: '/', element: <DashboardPage /> },
  { path: '/tickets', element: <TicketsPage /> },
  { path: '/tickets/:id', element: <TicketTestPage /> },
  { path: '/topics', element: <TopicsPage /> },
  { path: '/topics/:id', element: <TopicTestPage /> },
  { path: '/exam', element: <ExamPage /> },
  { path: '/marathon', element: <MarathonPage /> },
  { path: '/smart-test', element: <SmartTestPage /> },
  { path: '/octagon', element: <OctagonLobbyPage /> },
  { path: '/octagon/match/:id', element: <OctagonMatchPage /> },
  { path: '/octagon/results/:id', element: <OctagonResultsPage /> },
  { path: '/mistakes', element: <MistakesPage /> },
  { path: '/stats', element: <StatsPage /> },
  { path: '/profile', element: <ProfilePage /> },
  { path: '/settings', element: <SettingsPage /> },
  { path: '/subscription', element: <SubscriptionPage /> },
  { path: '/leaderboard', element: <LeaderboardPage /> },
  { path: '/achievements', element: <AchievementsPage /> },
];
