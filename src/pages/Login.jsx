import { useState } from 'react'
import { login } from '../store'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (!email) { setError('Please enter your email'); return }
    setLoading(true)
    setError('')
    // Simulate network delay
    setTimeout(() => {
      const session = login(email, password)
      if (session) {
        onLogin(session)
      } else {
        setError('Invalid credentials')
      }
      setLoading(false)
    }, 800)
  }

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-orb login-orb-1"></div>
        <div className="login-orb login-orb-2"></div>
        <div className="login-orb login-orb-3"></div>
      </div>

      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <img src="/usl-logo.png" alt="USL Logo" style={{ width: '85px', height: '85px' }} />
          </div>
          <h1 className="login-title">CommunityBridge</h1>
          <p className="login-subtitle">Community Extension Program Management System</p>
          <p className="login-institution">University of Saint Louis — Tuguegarao City</p>
          <p className="login-motto">Sapientia Aedificat — Wisdom Builds</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="form-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="loginEmail" className="form-label">Email Address</label>
            <input
              id="loginEmail"
              type="email"
              className="form-input"
              placeholder="your.name@usl.edu.ph"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="loginPassword" className="form-label">Password</label>
            <input
              id="loginPassword"
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="login-demo">
          <p className="demo-label">Demo Accounts (any password works):</p>
          <div className="demo-accounts">
            <button className="demo-account" onClick={() => { setEmail('admin@usl.edu.ph'); setPassword('demo') }}>
              <strong>Admin</strong><span>admin@usl.edu.ph</span>
            </button>
            <button className="demo-account" onClick={() => { setEmail('staff@usl.edu.ph'); setPassword('demo') }}>
              <strong>Staff</strong><span>staff@usl.edu.ph</span>
            </button>
            <button className="demo-account" onClick={() => { setEmail('volunteer@usl.edu.ph'); setPassword('demo') }}>
              <strong>Volunteer</strong><span>volunteer@usl.edu.ph</span>
            </button>
          </div>
        </div>

        <div className="login-footer">
          <p>A Capstone Project by Naval, Colobong, Gacus, Perdido & Tabanganay</p>
        </div>
      </div>
    </div>
  )
}
