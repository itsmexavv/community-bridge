import { useState } from 'react'
import { login, register } from '../store'
import uslLogo from '../assets/usl-logo.png'

const ROLES = [
  { value: 'staff', label: 'Staff — Manage programs & tasks', icon: '👔' },
  { value: 'volunteer', label: 'Volunteer — View assignments & log hours', icon: '🙋' },
]

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('staff')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password) { setError('Please fill in all fields'); return }
    if (mode === 'register' && !name) { setError('Please enter your full name'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }

    setLoading(true)
    setError('')
    try {
      let session
      if (mode === 'login') {
        session = await login(email, password)
      } else {
        session = await register(email, password, name, role)
      }
      onLogin(session)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-bg"></div>

      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <img src={uslLogo} alt="USL Logo" style={{ width: '85px', height: '85px' }} />
          </div>
          <h1 className="login-title">CommunityBridge</h1>
          <p className="login-subtitle">Community Extension Program Management System</p>
          <p className="login-institution">University of Saint Louis — Tuguegarao City</p>
          <p className="login-motto">Sapientia Aedificat — Wisdom Builds</p>
        </div>

        <h2 style={{ textAlign: 'center', marginBottom: '1.2rem', fontSize: '1.2rem', fontWeight: '800', color: 'var(--text)' }}>
          {mode === 'login' ? 'Sign In' : 'Create an Account'}
        </h2>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="form-error">{error}</div>}

          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="regName" className="form-label">Full Name</label>
              <input id="regName" className="form-input" placeholder="e.g. Juan Dela Cruz" value={name} onChange={e => setName(e.target.value)} />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="loginEmail" className="form-label">Email Address</label>
            <input id="loginEmail" type="email" className="form-input" placeholder="your.email@gmail.com" value={email} onChange={e => setEmail(e.target.value)} autoFocus />
          </div>

          <div className="form-group">
            <label htmlFor="loginPassword" className="form-label">Password</label>
            <input id="loginPassword" type="password" className="form-input" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} />
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label">Account Role</label>
              <div className="role-selector">
                {ROLES.map(r => (
                  <label key={r.value} className={`role-option ${role === r.value ? 'selected' : ''}`}>
                    <input type="radio" name="role" value={r.value} checked={role === r.value} onChange={() => setRole(r.value)} />
                    <span className="role-icon">{r.icon}</span>
                    <div>
                      <div className="role-name">{r.value.charAt(0).toUpperCase() + r.value.slice(1)}</div>
                      <div className="role-desc">{r.label.split('—')[1]?.trim()}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? (mode === 'login' ? 'Signing in...' : 'Creating account...') : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="login-help">
          {mode === 'login' ? (
            <p>Don't have an account? <button className="link-btn" onClick={() => setMode('register')}>Register here</button></p>
          ) : (
            <p>Already registered? <button className="link-btn" onClick={() => setMode('login')}>Sign in</button></p>
          )}
        </div>

        <div className="login-footer">
          <p>CommunityBridge v2.0 — Extension Services Management System</p>
          <p style={{ marginTop: '.3rem' }}>A Capstone Project by Naval, Colobong, Gacus, Perdido & Tabanganay</p>
        </div>
      </div>
    </div>
  )
}
