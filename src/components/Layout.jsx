import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { logout, getConnectionMode, onConnectionChange, changePassword } from '../store'
import { useToast } from './Toast'
import Modal from './Modal'
import uslLogo from '../assets/usl-logo.png'

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: '📊', roles: ['admin', 'staff', 'volunteer'] },
  { path: '/programs', label: 'Programs', icon: '📋', roles: ['admin', 'staff'] },
  { path: '/beneficiaries', label: 'Beneficiaries', icon: '👥', roles: ['admin', 'staff'] },
  { path: '/volunteers', label: 'Volunteers', icon: '🙋', roles: ['admin', 'staff'] },
  { path: '/activities', label: 'Activities', icon: '📝', roles: ['admin', 'staff', 'volunteer'] },
  { path: '/tasks', label: 'Tasks', icon: '✅', roles: ['admin', 'staff', 'volunteer'] },
  { path: '/partners', label: 'Partners', icon: '🤝', roles: ['admin'] },
  { path: '/documents', label: 'Documents', icon: '📂', roles: ['admin', 'staff'] },
  { path: '/reports', label: 'Reports', icon: '📈', roles: ['admin'] },
]

export default function Layout({ children, session, onLogout }) {
  const location = useLocation()
  const toast = useToast()
  const currentPage = NAV_ITEMS.find(n => n.path === location.pathname)
  const [connMode, setConnMode] = useState(getConnectionMode())
  const userRole = session?.role || 'volunteer'
  const [showPwModal, setShowPwModal] = useState(false)
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' })
  const [pwError, setPwError] = useState('')
  const [pwLoading, setPwLoading] = useState(false)

  useEffect(() => {
    return onConnectionChange((connected) => {
      setConnMode(connected ? 'cloud' : 'local')
    })
  }, [])

  const visibleNav = NAV_ITEMS.filter(item => item.roles.includes(userRole))

  function handleLogout() { logout(); onLogout() }

  async function handleChangePassword(e) {
    e.preventDefault()
    setPwError('')
    if (pwForm.newPw !== pwForm.confirm) { setPwError('New passwords do not match'); return }
    setPwLoading(true)
    try {
      await changePassword(session.email, pwForm.current, pwForm.newPw)
      toast('Password changed successfully!', 'success')
      setShowPwModal(false)
      setPwForm({ current: '', newPw: '', confirm: '' })
    } catch (err) {
      setPwError(err.message)
    } finally {
      setPwLoading(false)
    }
  }

  const roleLabels = { admin: '🛡️ Admin', staff: '👔 Staff', volunteer: '🙋 Volunteer' }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src={uslLogo} alt="USL Logo" className="sidebar-logo-img" />
            <div>
              <div className="logo-title">CommunityBridge</div>
              <div className="logo-subtitle">University of Saint Louis</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Main Menu</div>
          {visibleNav.map(item => (
            <NavLink key={item.path} to={item.path} end={item.path === '/'} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{session.name?.[0]?.toUpperCase() || 'U'}</div>
            <div>
              <div className="user-name">{session.name}</div>
              <div className="user-role">{roleLabels[userRole] || userRole}</div>
            </div>
          </div>
          <div className="sidebar-actions">
            <button className="sidebar-action-btn" onClick={() => setShowPwModal(true)} title="Change Password">🔑</button>
            <button className="logout-btn" onClick={handleLogout} title="Sign out">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
          </div>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div>
            <h1 className="page-title">{currentPage?.icon} {currentPage?.label || 'CommunityBridge'}</h1>
            <p className="page-subtitle">University of Saint Louis — Extension Services Office</p>
          </div>
          <div className="topbar-right">
            <div className={`topbar-badge ${connMode === 'cloud' ? 'cloud' : 'local'}`}>
              <span className={`status-dot ${connMode === 'cloud' ? 'online' : 'offline'}`}></span>
              {connMode === 'cloud' ? '☁️ Cloud Sync' : '💾 Local Mode'}
            </div>
          </div>
        </header>
        <main className="content">{children}</main>
      </div>

      {/* Change Password Modal */}
      {showPwModal && (
        <Modal title="🔑 Change Password" onClose={() => { setShowPwModal(false); setPwError('') }} width="400px">
          <form onSubmit={handleChangePassword} className="modal-form">
            {pwError && <div className="form-error">{pwError}</div>}
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input type="password" className="form-input" required value={pwForm.current} onChange={e => setPwForm({ ...pwForm, current: e.target.value })} autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input type="password" className="form-input" required minLength={6} value={pwForm.newPw} onChange={e => setPwForm({ ...pwForm, newPw: e.target.value })} placeholder="Min. 6 characters" />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input type="password" className="form-input" required value={pwForm.confirm} onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setShowPwModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={pwLoading}>{pwLoading ? 'Changing...' : 'Change Password'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
