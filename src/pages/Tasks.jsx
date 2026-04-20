import { useState, useEffect } from 'react'
import { getAll, create, update, remove, getSession } from '../store'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'

const PRIORITIES = ['High', 'Medium', 'Low']
const STATUSES = ['Pending', 'In Progress', 'Completed']
const EMPTY = { title: '', assignedTo: '', assignedRole: 'staff', programId: '', priority: 'Medium', status: 'Pending', dueDate: '', description: '', progress: 0 }

export default function Tasks() {
  const toast = useToast()
  const session = getSession()
  const isAdmin = session?.role === 'admin'
  const [items, setItems] = useState([])
  const [programs, setPrograms] = useState([])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterRole, setFilterRole] = useState('All')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => { reload() }, [])
  function reload() {
    let tasks = getAll('tasks')
    // Non-admin users only see their own tasks
    if (!isAdmin) tasks = tasks.filter(t => t.assignedTo === session?.email)
    setItems(tasks)
    setPrograms(getAll('programs'))
  }

  function openAdd() { setForm({ ...EMPTY }); setEditId(null); setModal('add') }
  function openEdit(t) { setForm({ ...t, programId: t.programId ? String(t.programId) : '' }); setEditId(t.id); setModal('edit') }

  function handleSave(e) {
    e.preventDefault()
    const data = { ...form, programId: form.programId ? parseInt(form.programId) : null, progress: parseInt(form.progress) || 0 }
    if (data.status === 'Completed') { data.progress = 100; data.completedDate = new Date().toISOString().split('T')[0] }
    if (editId) { update('tasks', editId, data); toast('Task updated', 'success') }
    else { create('tasks', data); toast('Task created', 'success') }
    setModal(null); reload()
  }

  function handleDelete(id) { remove('tasks', id); setDeleteConfirm(null); reload(); toast('Task deleted', 'info') }

  function quickUpdateStatus(task, newStatus) {
    const progress = newStatus === 'Completed' ? 100 : newStatus === 'In Progress' ? Math.max(task.progress, 10) : task.progress
    const completedDate = newStatus === 'Completed' ? new Date().toISOString().split('T')[0] : null
    update('tasks', task.id, { status: newStatus, progress, completedDate })
    toast(`Task marked as ${newStatus}`, 'success'); reload()
  }

  function quickUpdateProgress(task, newProgress) {
    const status = newProgress >= 100 ? 'Completed' : newProgress > 0 ? 'In Progress' : 'Pending'
    const completedDate = newProgress >= 100 ? new Date().toISOString().split('T')[0] : null
    update('tasks', task.id, { progress: newProgress, status, completedDate })
    reload()
  }

  const filtered = items.filter(t => {
    if (filterStatus !== 'All' && t.status !== filterStatus) return false
    if (filterRole !== 'All' && t.assignedRole !== filterRole) return false
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  // Stats
  const total = items.length
  const completed = items.filter(t => t.status === 'Completed').length
  const inProgress = items.filter(t => t.status === 'In Progress').length
  const pending = items.filter(t => t.status === 'Pending').length
  const overdue = items.filter(t => t.status !== 'Completed' && t.dueDate && new Date(t.dueDate) < new Date()).length
  const avgProgress = total > 0 ? Math.round(items.reduce((s, t) => s + (t.progress || 0), 0) / total) : 0

  // Group by assignee for admin view
  const assigneeGroups = {}
  items.forEach(t => {
    const key = t.assignedTo || 'Unassigned'
    if (!assigneeGroups[key]) assigneeGroups[key] = { email: key, role: t.assignedRole, tasks: [], completed: 0, total: 0, avgProgress: 0 }
    assigneeGroups[key].tasks.push(t)
    assigneeGroups[key].total++
    if (t.status === 'Completed') assigneeGroups[key].completed++
  })
  Object.values(assigneeGroups).forEach(g => {
    g.avgProgress = g.total > 0 ? Math.round(g.tasks.reduce((s, t) => s + (t.progress || 0), 0) / g.total) : 0
  })

  const priorityColors = { High: '#dc2626', Medium: '#d97706', Low: '#059669' }

  return (
    <div className="page-content">
      {/* Progress Overview */}
      <div className="task-overview">
        <div className="task-stat-card">
          <div className="task-stat-value">{total}</div>
          <div className="task-stat-label">Total Tasks</div>
        </div>
        <div className="task-stat-card completed-card">
          <div className="task-stat-value">{completed}</div>
          <div className="task-stat-label">Completed</div>
        </div>
        <div className="task-stat-card progress-card">
          <div className="task-stat-value">{inProgress}</div>
          <div className="task-stat-label">In Progress</div>
        </div>
        <div className="task-stat-card pending-card">
          <div className="task-stat-value">{pending}</div>
          <div className="task-stat-label">Pending</div>
        </div>
        <div className="task-stat-card" style={{ borderBottom: `3px solid ${overdue > 0 ? '#dc2626' : '#059669'}` }}>
          <div className="task-stat-value" style={{ color: overdue > 0 ? '#dc2626' : '#059669' }}>{overdue}</div>
          <div className="task-stat-label">Overdue</div>
        </div>
        <div className="task-stat-card">
          <div className="task-stat-value">{avgProgress}%</div>
          <div className="task-stat-label">Avg Progress</div>
          <div className="mini-progress-bar"><div className="mini-progress-fill" style={{ width: `${avgProgress}%` }} /></div>
        </div>
      </div>

      {/* Admin: Staff & Volunteer Progress Cards */}
      {isAdmin && Object.keys(assigneeGroups).length > 0 && (
        <div className="assignee-section">
          <h3 className="section-title">👥 Staff & Volunteer Progress</h3>
          <div className="assignee-grid">
            {Object.values(assigneeGroups).map(g => (
              <div key={g.email} className="assignee-card">
                <div className="assignee-header">
                  <div className="assignee-avatar">{g.role === 'staff' ? '👔' : '🙋'}</div>
                  <div>
                    <div className="assignee-email">{g.email}</div>
                    <div className="assignee-role">{g.role}</div>
                  </div>
                </div>
                <div className="assignee-stats">
                  <div className="assignee-stat"><span className="assignee-stat-val">{g.completed}/{g.total}</span><span className="assignee-stat-lbl">Tasks Done</span></div>
                  <div className="assignee-stat"><span className="assignee-stat-val">{g.avgProgress}%</span><span className="assignee-stat-lbl">Progress</span></div>
                </div>
                <div className="assignee-progress-bar"><div className="assignee-progress-fill" style={{ width: `${g.avgProgress}%`, backgroundColor: g.avgProgress >= 80 ? '#059669' : g.avgProgress >= 40 ? '#d97706' : '#dc2626' }} /></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-left">
          <input className="form-input search-input" placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} />
          <div className="filter-pills">
            {['All', ...STATUSES].map(s => (
              <button key={s} className={`pill ${filterStatus === s ? 'active' : ''}`} onClick={() => setFilterStatus(s)}>{s}</button>
            ))}
          </div>
          {isAdmin && (
            <div className="filter-pills">
              {['All', 'staff', 'volunteer'].map(r => (
                <button key={r} className={`pill ${filterRole === r ? 'active' : ''}`} onClick={() => setFilterRole(r)}>{r === 'All' ? 'All Roles' : r.charAt(0).toUpperCase() + r.slice(1)}</button>
              ))}
            </div>
          )}
        </div>
        {isAdmin && <button className="btn btn-primary" onClick={openAdd}>+ Assign Task</button>}
      </div>

      {/* Task List */}
      <div className="task-list">
        {filtered.length === 0 ? (
          <div className="empty-state">No tasks found</div>
        ) : filtered.map(t => (
          <div key={t.id} className={`task-item ${t.status === 'Completed' ? 'task-done' : ''}`}>
            <div className="task-item-left">
              <div className="task-priority-dot" style={{ backgroundColor: priorityColors[t.priority] || '#64748b' }} title={t.priority} />
              <div>
                <div className="task-item-title">{t.title}</div>
                <div className="task-item-meta">
                  {t.assignedRole && <span className={`role-badge ${t.assignedRole}`}>{t.assignedRole}</span>}
                  <span>{t.assignedTo}</span>
                  {t.dueDate && <><span className="dot-sep">·</span><span className={t.status !== 'Completed' && new Date(t.dueDate) < new Date() ? 'overdue-text' : ''}>Due: {t.dueDate}</span></>}
                  {t.programId && <><span className="dot-sep">·</span><span className="program-tag">{programs.find(p => p.id === t.programId)?.title || ''}</span></>}
                </div>
              </div>
            </div>
            <div className="task-item-right">
              <div className="task-progress-wrap">
                <div className="task-progress-track">
                  <div className="task-progress-fill" style={{ width: `${t.progress}%`, backgroundColor: t.progress >= 100 ? '#059669' : t.progress >= 50 ? '#3b82f6' : '#d97706' }} />
                </div>
                <span className="task-progress-text">{t.progress}%</span>
              </div>
              <span className={`status-badge ${t.status.toLowerCase().replace(/\s+/g, '-')}`}>{t.status}</span>
              <div className="action-btns">
                {t.status !== 'Completed' && (
                  <>
                    {t.status === 'Pending' && <button className="btn-icon" onClick={() => quickUpdateStatus(t, 'In Progress')} title="Start">▶️</button>}
                    {t.status === 'In Progress' && <button className="btn-icon" onClick={() => quickUpdateStatus(t, 'Completed')} title="Complete">✅</button>}
                    <input type="range" min="0" max="100" step="5" value={t.progress} onChange={e => quickUpdateProgress(t, parseInt(e.target.value))} className="progress-slider" title={`${t.progress}%`} />
                  </>
                )}
                {isAdmin && <button className="btn-icon" onClick={() => openEdit(t)} title="Edit">✏️</button>}
                {isAdmin && <button className="btn-icon danger" onClick={() => setDeleteConfirm(t.id)} title="Delete">🗑️</button>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <Modal title={modal === 'add' ? 'Assign New Task' : 'Edit Task'} onClose={() => setModal(null)} width="580px">
          <form onSubmit={handleSave} className="modal-form">
            <div className="form-group">
              <label className="form-label">Task Title *</label>
              <input className="form-input" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Assign To (email) *</label>
                <input className="form-input" required value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })} placeholder="user.email@gmail.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-input" value={form.assignedRole} onChange={e => setForm({ ...form, assignedRole: e.target.value })}>
                  <option value="staff">Staff</option>
                  <option value="volunteer">Volunteer</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-input" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                  {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input type="date" className="form-input" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Program</label>
              <select className="form-input" value={form.programId} onChange={e => setForm({ ...form, programId: e.target.value })}>
                <option value="">None</option>
                {programs.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Progress ({form.progress}%)</label>
              <input type="range" min="0" max="100" step="5" className="form-input" value={form.progress} onChange={e => setForm({ ...form, progress: parseInt(e.target.value) })} />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input form-textarea" rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary">{modal === 'add' ? 'Assign Task' : 'Save'}</button>
            </div>
          </form>
        </Modal>
      )}

      {deleteConfirm && (
        <Modal title="Delete Task?" onClose={() => setDeleteConfirm(null)} width="400px">
          <p style={{ marginBottom: '1rem', color: '#64748b' }}>This task will be permanently removed.</p>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
