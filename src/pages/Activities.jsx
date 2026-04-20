import { useState, useEffect } from 'react'
import { getAll, create, update, remove } from '../store'
import Modal from '../components/Modal'

const EMPTY = { programId: '', title: '', date: '', location: '', description: '', participants: '', facilitator: '' }

export default function Activities() {
  const [items, setItems] = useState([])
  const [programs, setPrograms] = useState([])
  const [search, setSearch] = useState('')
  const [filterProgram, setFilterProgram] = useState('All')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => { reload() }, [])
  function reload() { setItems(getAll('activities')); setPrograms(getAll('programs')) }

  function openAdd() { setForm({ ...EMPTY }); setEditId(null); setModal('add') }
  function openEdit(item) { setForm({ ...item, programId: String(item.programId) }); setEditId(item.id); setModal('edit') }

  function handleSave(e) {
    e.preventDefault()
    const data = { ...form, programId: parseInt(form.programId) || 0, participants: parseInt(form.participants) || 0 }
    if (editId) update('activities', editId, data); else create('activities', data)
    setModal(null); reload()
  }

  function handleDelete(id) { remove('activities', id); setDeleteConfirm(null); reload() }

  function getProgramTitle(pid) {
    return programs.find(p => p.id === pid)?.title || 'Unknown'
  }

  const filtered = items
    .filter(a => {
      if (filterProgram !== 'All' && a.programId !== parseInt(filterProgram)) return false
      if (search && !a.title.toLowerCase().includes(search.toLowerCase()) && !a.facilitator?.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  const totalParticipants = filtered.reduce((sum, a) => sum + (a.participants || 0), 0)

  return (
    <div className="page-content">
      <div className="toolbar">
        <div className="toolbar-left">
          <input className="form-input search-input" placeholder="Search activities..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="form-input filter-select" value={filterProgram} onChange={e => setFilterProgram(e.target.value)}>
            <option value="All">All Programs</option>
            {programs.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
          <span className="result-count">{filtered.length} activities · {totalParticipants} total participants</span>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Log Activity</button>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Activity Title</th>
              <th>Program</th>
              <th>Date</th>
              <th>Location</th>
              <th>Participants</th>
              <th>Facilitator</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="7" className="empty-row">No activities found</td></tr>
            ) : filtered.map(a => (
              <tr key={a.id}>
                <td className="td-primary">{a.title}</td>
                <td><span className="program-tag">{getProgramTitle(a.programId)}</span></td>
                <td className="td-nowrap">{a.date}</td>
                <td>{a.location}</td>
                <td><span className="participant-badge">{a.participants}</span></td>
                <td>{a.facilitator}</td>
                <td>
                  <div className="action-btns">
                    <button className="btn-icon" onClick={() => openEdit(a)} title="Edit">✏️</button>
                    <button className="btn-icon danger" onClick={() => setDeleteConfirm(a.id)} title="Delete">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={modal === 'add' ? 'Log New Activity' : 'Edit Activity'} onClose={() => setModal(null)}>
          <form onSubmit={handleSave} className="modal-form">
            <div className="form-group">
              <label className="form-label">Activity Title *</label>
              <input className="form-input" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Program *</label>
              <select className="form-input" required value={form.programId} onChange={e => setForm({ ...form, programId: e.target.value })}>
                <option value="">Select a program</option>
                {programs.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date</label>
                <input type="date" className="form-input" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Participants</label>
                <input type="number" className="form-input" value={form.participants} onChange={e => setForm({ ...form, participants: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input className="form-input" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Facilitator</label>
              <input className="form-input" value={form.facilitator} onChange={e => setForm({ ...form, facilitator: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input form-textarea" rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary">{modal === 'add' ? 'Log Activity' : 'Save Changes'}</button>
            </div>
          </form>
        </Modal>
      )}

      {deleteConfirm && (
        <Modal title="Delete Activity?" onClose={() => setDeleteConfirm(null)} width="400px">
          <p style={{ marginBottom: '1rem', color: '#64748b' }}>This activity log will be permanently removed.</p>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
