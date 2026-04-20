import { useState, useEffect } from 'react'
import { getAll, getDashboardStats } from '../store'

export default function Reports() {
  const [stats, setStats] = useState(null)
  const [programs, setPrograms] = useState([])
  const [activities, setActivities] = useState([])
  const [beneficiaries, setBeneficiaries] = useState([])
  const [volunteers, setVolunteers] = useState([])
  const [deployments, setDeployments] = useState([])

  useEffect(() => {
    setStats(getDashboardStats())
    setPrograms(getAll('programs'))
    setActivities(getAll('activities'))
    setBeneficiaries(getAll('beneficiaries'))
    setVolunteers(getAll('volunteers'))
    setDeployments(getAll('deployments'))
  }, [])

  if (!stats) return null

  function exportCSV(filename, headers, rows) {
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = filename
    a.click()
  }

  function exportPrograms() {
    exportCSV('programs_report.csv',
      ['Title', 'Status', 'Location', 'Start Date', 'End Date', 'Target Beneficiaries', 'Coordinator', 'SDG Tags'],
      programs.map(p => [p.title, p.status, p.location, p.startDate, p.endDate, p.targetBeneficiaries, p.coordinator, (p.sdgTags || []).join('; ')])
    )
  }

  function exportBeneficiaries() {
    exportCSV('beneficiaries_report.csv',
      ['Name', 'Age', 'Gender', 'Address', 'Contact', 'Registered Date', 'Programs'],
      beneficiaries.map(b => [b.name, b.age, b.gender, b.address, b.contact, b.registeredDate, (b.programIds || []).map(pid => programs.find(p => p.id === pid)?.title || '').join('; ')])
    )
  }

  function exportActivities() {
    exportCSV('activities_report.csv',
      ['Title', 'Program', 'Date', 'Location', 'Participants', 'Facilitator', 'Description'],
      activities.map(a => [a.title, programs.find(p => p.id === a.programId)?.title || '', a.date, a.location, a.participants, a.facilitator, a.description])
    )
  }

  function exportAll() {
    exportPrograms()
    setTimeout(exportBeneficiaries, 300)
    setTimeout(exportActivities, 600)
  }

  // Program-wise summary
  const programSummary = programs.map(p => {
    const acts = activities.filter(a => a.programId === p.id)
    const totalParticipants = acts.reduce((s, a) => s + (a.participants || 0), 0)
    const bens = beneficiaries.filter(b => (b.programIds || []).includes(p.id))
    const deps = deployments.filter(d => d.programId === p.id)
    const hours = deps.reduce((s, d) => s + (d.hours || 0), 0)
    return { ...p, activityCount: acts.length, totalParticipants, beneficiaryCount: bens.length, deploymentCount: deps.length, hoursRendered: hours }
  })

  return (
    <div className="page-content">
      {/* Summary Stats */}
      <div className="report-summary">
        <div className="report-stat">
          <div className="report-stat-value">{stats.totalPrograms}</div>
          <div className="report-stat-label">Programs</div>
        </div>
        <div className="report-stat">
          <div className="report-stat-value">{stats.totalBeneficiaries}</div>
          <div className="report-stat-label">Beneficiaries</div>
        </div>
        <div className="report-stat">
          <div className="report-stat-value">{stats.totalActivities}</div>
          <div className="report-stat-label">Activities</div>
        </div>
        <div className="report-stat">
          <div className="report-stat-value">{stats.totalVolunteers}</div>
          <div className="report-stat-label">Volunteers</div>
        </div>
        <div className="report-stat">
          <div className="report-stat-value">{stats.totalHours}</div>
          <div className="report-stat-label">Hours Served</div>
        </div>
        <div className="report-stat">
          <div className="report-stat-value">{stats.totalPartners}</div>
          <div className="report-stat-label">Partners</div>
        </div>
      </div>

      {/* Export Actions */}
      <div className="report-actions">
        <h3 className="report-section-title">📥 Export Data</h3>
        <div className="export-btns">
          <button className="btn btn-secondary" onClick={exportPrograms}>
            📋 Export Programs CSV
          </button>
          <button className="btn btn-secondary" onClick={exportBeneficiaries}>
            👥 Export Beneficiaries CSV
          </button>
          <button className="btn btn-secondary" onClick={exportActivities}>
            📝 Export Activities CSV
          </button>
          <button className="btn btn-primary" onClick={exportAll}>
            📦 Export All Reports
          </button>
        </div>
      </div>

      {/* Program-wise Summary */}
      <div className="report-section">
        <h3 className="report-section-title">📊 Program Performance Summary</h3>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Program</th>
                <th>Status</th>
                <th>Activities</th>
                <th>Participants</th>
                <th>Beneficiaries</th>
                <th>Deployments</th>
                <th>Hours</th>
                <th>SDG</th>
              </tr>
            </thead>
            <tbody>
              {programSummary.map(p => (
                <tr key={p.id}>
                  <td className="td-primary">{p.title}</td>
                  <td><span className={`status-badge ${p.status.toLowerCase()}`}>{p.status}</span></td>
                  <td>{p.activityCount}</td>
                  <td>{p.totalParticipants}</td>
                  <td>{p.beneficiaryCount}</td>
                  <td>{p.deploymentCount}</td>
                  <td>{p.hoursRendered}h</td>
                  <td>
                    <div className="tag-group">
                      {(p.sdgTags || []).map(t => <span key={t} className="sdg-tag small">{t}</span>)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Volunteer Leaderboard */}
      <div className="report-section">
        <h3 className="report-section-title">🏆 Volunteer Leaderboard</h3>
        <div className="leaderboard">
          {volunteers
            .map(v => ({
              ...v,
              totalHours: deployments.filter(d => d.volunteerId === v.id).reduce((s, d) => s + (d.hours || 0), 0),
              totalDeps: deployments.filter(d => d.volunteerId === v.id).length
            }))
            .sort((a, b) => b.totalHours - a.totalHours)
            .map((v, i) => (
              <div className="leaderboard-item" key={v.id}>
                <div className="lb-rank">{i + 1}</div>
                <div className="lb-avatar">{v.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
                <div className="lb-info">
                  <div className="lb-name">{v.name}</div>
                  <div className="lb-meta">{v.course} · {v.totalDeps} deployments</div>
                </div>
                <div className="lb-hours">{v.totalHours}h</div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}
