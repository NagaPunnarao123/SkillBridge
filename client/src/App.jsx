import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import LoadingSpinner from './components/LoadingSpinner'
import AnimatedBackground from './components/AnimatedBackground'

// Pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import BrowseProjects from './pages/BrowseProjects'
import BrowseStudents from './pages/BrowseStudents'
import ProjectDetail from './pages/ProjectDetail'
import UserProfile from './pages/UserProfile'
import Messages from './pages/Messages'

// Client Pages
import ClientDashboard from './pages/client/Dashboard'
import PostProject from './pages/client/PostProject'
import MyProjects from './pages/client/MyProjects'

// Student Pages
import StudentDashboard from './pages/student/Dashboard'
import MyApplications from './pages/student/MyApplications'
import EditProfile from './pages/student/EditProfile'

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner fullPage />
  if (!user) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }
  return children
}

function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner fullPage />
  if (user) {
    if (user.role === 'client') return <Navigate to="/client/dashboard" replace />
    if (user.role === 'student') return <Navigate to="/student/dashboard" replace />
  }
  return children
}

export default function App() {
  const { loading } = useAuth()
  if (loading) return <LoadingSpinner fullPage />

  return (
    <>
      {/* ── Animated particle-network background (canvas) ── */}
      <AnimatedBackground />

      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/browse-projects" element={<BrowseProjects />} />
        <Route path="/browse-students" element={<BrowseStudents />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/profile/:id" element={<UserProfile />} />

        {/* Auth */}
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />

        {/* Messages */}
        <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/messages/:conversationId" element={<ProtectedRoute><Messages /></ProtectedRoute>} />

        {/* Client */}
        <Route path="/client/dashboard" element={<ProtectedRoute allowedRoles={['client']}><ClientDashboard /></ProtectedRoute>} />
        <Route path="/client/post-project" element={<ProtectedRoute allowedRoles={['client']}><PostProject /></ProtectedRoute>} />
        <Route path="/client/projects" element={<ProtectedRoute allowedRoles={['client']}><MyProjects /></ProtectedRoute>} />

        {/* Student */}
        <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/applications" element={<ProtectedRoute allowedRoles={['student']}><MyApplications /></ProtectedRoute>} />
        <Route path="/student/profile" element={<ProtectedRoute allowedRoles={['student']}><EditProfile /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </>
  )
}
