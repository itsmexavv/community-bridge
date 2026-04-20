import { useState, useEffect } from 'react'
import { getDashboardStats, getAll } from '../store'

export default function Dashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    setStats(getDashboardStats())
  }, [])

  if (!stats) return null

  const statCards = [
    { label: 'Total Programs', value: stats.totalPrograms, icon: '📋', color: '#3b82f6', sub: `${stats.activePrograms} active` },
    { label: 'Beneficiaries', value: stats.totalBeneficiaries, icon: '👥', color: '#10b981', sub: 'registered' },
    { label: 'Volunteers', value: stats.totalVolunteers, icon: '🙋', color: '#8b5cf6', sub: `${stats.totalHours} hours served` },
    { label: 'Activities', value: stats.totalActivities, icon: '📝', color: '#f59e0b', sub: 'documented' },
    { label: 'Partners', value: stats.totalPartners, icon: '🤝', color: '#ef4444', sub: 'institutions' },
    { label: 'Deployments', value: stats.totalDeployments, icon: '🚀', color: '#06b6d4', sub: `${stats.completedDeployments} completed` },
  ]

  const statusColors = { Active: '#10b981', Planned: '#3b82f6', Completed: '#6b7280' }
  const maxPrograms = Math.max(...Object.values(stats.programsByStatus), 1)

  return (
    <div className="dashboard">
      {/* Stat Cards */}
      <div className="stat-grid">
        {statCards.map((card, i) => (
          <div className="stat-card" key={i} style={{ '--accent': card.color }}>
            <div className="stat-card-top">
              <div>
                <div className="stat-value">{card.value}</div>
                <div className="stat-label">{card.label}</div>
              </div>
              <div className="stat-icon">{card.icon}</div>
            </div>
            <div className="stat-sub">{card.sub}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* Programs by Status Chart */}
        <div className="dash-card">
          <h3 className="dash-card-title">Programs by Status</h3>
          <div className="bar-chart">
            {Object.entries(stats.programsByStatus).map(([status, count]) => (
              <div className="bar-row" key={status}>
                <div className="bar-label">{status}</div>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${(count / maxPrograms) * 100}%`,
                      backgroundColor: statusColors[status]
                    }}
                  ></div>
                </div>
                <div className="bar-value">{count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* SDG Alignment */}
        <div className="dash-card">
          <h3 className="dash-card-title">UN SDG Alignment</h3>
          <div className="sdg-tags-grid">
            {['SDG 3', 'SDG 4', 'SDG 10', 'SDG 11', 'SDG 17'].map(sdg => {
              const programs = getAll('programs')
              const count = programs.filter(p => p.sdgTags?.includes(sdg)).length
              const sdgNames = {
                'SDG 3': 'Good Health', 'SDG 4': 'Quality Education',
                'SDG 10': 'Reduced Inequalities', 'SDG 11': 'Sustainable Cities',
                'SDG 17': 'Partnerships'
              }
              return (
                <div className="sdg-item" key={sdg}>
                  <div className="sdg-badge">{sdg}</div>
                  <div className="sdg-name">{sdgNames[sdg]}</div>
                  <div className="sdg-count">{count} program{count !== 1 ? 's' : ''}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="dash-card full-width">
          <h3 className="dash-card-title">Recent Activities</h3>
          <div className="activity-timeline">
            {stats.recentActivities.map(activity => {
              const program = getAll('programs').find(p => p.id === activity.programId)
              return (
                <div className="timeline-item" key={activity.id}>
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <div className="timeline-title">{activity.title}</div>
                    <div className="timeline-meta">
                      <span>{activity.date}</span>
                      <span className="dot-sep">·</span>
                      <span>{activity.participants} participants</span>
                      <span className="dot-sep">·</span>
                      <span>{program?.title || 'Unknown Program'}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
