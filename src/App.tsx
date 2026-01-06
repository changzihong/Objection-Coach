import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Landing from './pages/Landing'
import AuthGuard from './components/AuthGuard'
import HomeDashboard from './pages/HomeDashboard'
import Library from './pages/Library'
import ObjectionDetail from './pages/ObjectionDetail'
import ForgotPassword from './pages/ForgotPassword'
import PrivacyPolicy from './pages/PrivacyPolicy'
import Settings from './pages/Settings'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<PrivacyPolicy />} />

        <Route path="/dashboard" element={
          <AuthGuard>
            <HomeDashboard />
          </AuthGuard>
        } />

        <Route path="/library" element={
          <AuthGuard>
            <Library />
          </AuthGuard>
        } />

        <Route path="/objection/:id" element={
          <AuthGuard>
            <ObjectionDetail />
          </AuthGuard>
        } />

        <Route path="/settings" element={
          <AuthGuard>
            <Settings />
          </AuthGuard>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
