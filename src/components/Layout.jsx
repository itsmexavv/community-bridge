import { NavLink, useLocation } from 'react-router-dom'
import { logout } from '../store'
import uslLogo from '../assets/usl-logo.png'

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/programs', label: 'Programs', icon: '📋' },
  { path: '/beneficiaries', label: 'Beneficiaries', icon: '👥' },
  { path: '/volunteers', label: 'Volunteers', icon: '🙋' },
  { path: '/activities', label: 'Activities', icon: '📝' },
  { path: '/partners', label: 'Partners', icon: '🤝' },
  { path: '/reports', label: 'Reports', icon: '📈' },
]

export default function Layout({ children, session, onLogout }) {
  const location = useLocation()
  const currentPage = NAV_ITEMS.find(n => n.path === location.pathname)

  function handleLogout() {
    logout()
    onLogout()
  }

  return (
    <div className="app-layout">
      {/* Sidebar */}
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
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
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
              <div className="user-role">{session.role}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Sign out">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-area">
        <header className="topbar">
          <div>
            <h1 className="page-title">{currentPage?.icon} {currentPage?.label || 'CommunityBridge'}</h1>
            <p className="page-subtitle">University of Saint Louis — Extension Services Office</p>
          </div>
          <div className="topbar-right">
            <div className="topbar-badge">
              <span className="status-dot online"></span>
              System Active
            </div>
          </div>
        </header>
        <main className="content">
          {children}
        </main>
      </div>
    </div>
  )
}
