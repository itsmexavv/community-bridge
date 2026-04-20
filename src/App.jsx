import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { initData, getSession } from './store'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Programs from './pages/Programs'
import Beneficiaries from './pages/Beneficiaries'
import Volunteers from './pages/Volunteers'
import Activities from './pages/Activities'
import Partners from './pages/Partners'
import Reports from './pages/Reports'
import Documents from './pages/Documents'
import Tasks from './pages/Tasks'

export default function App() {
  const [session, setSession] = useState(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    async function boot() {
      await initData()
      setSession(getSession())
      setLoaded(true)
    }
    boot()
  }, [])

  if (!loaded) return null
  if (!session) return <Login onLogin={setSession} />

  return (
    <Layout session={session} onLogout={() => setSession(null)}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/programs" element={<Programs />} />
        <Route path="/beneficiaries" element={<Beneficiaries />} />
        <Route path="/volunteers" element={<Volunteers />} />
        <Route path="/activities" element={<Activities />} />
        <Route path="/partners" element={<Partners />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}
