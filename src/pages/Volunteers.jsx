import { useState, useEffect } from 'react'
import { getAll, create, update, remove } from '../store'
import Modal from '../components/Modal'

const EMPTY = { name: '', email: '', course: '', year: '', skills: [], availability: '', deployments: 0 }
const SKILL_OPTIONS = ['Project Management', 'Documentation', 'Community Organizing', 'Data Entry', 'Web Development', 'Technical Support', 'Teaching', 'Tutoring', 'First Aid', 'Health Education', 'Photography', 'Report Writing', 'Public Speaking']

export default function Volunteers() {
  const [items, setItems] = useState([])
  const [deployments, setDeployments] = useState([])
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => { reload() }, [])
  function reload() { setItems(getAll('volunteers')); setDeployments(getAll('deployments')) }

  function openAdd() { setForm({ ...EMPTY, skills: [] }); setEditId(null); setModal('add') }
  function openEdit(item) { setForm({ ...item }); setEditId(item.id); setModal('edit') }

  function handleSave(e) {
    e.preventDefault()
    const data = { ...form, deployments: parseInt(form.deployments) || 0 }
    if (editId) update('volunteers', editId, data); else create('volunteers', data)
    setModal(null); reload()
  }

  function handleDelete(id) { remove('volunteers', id); setDeleteConfirm(null); reload() }

  function toggleSkill(skill) {
    const skills = form.skills || []
    setForm({ ...form, skills: skills.includes(skill) ? skills.filter(s => s !== skill) : [...skills, skill] })
  }

  const filtered = items.filter(v =>
    !search || v.name.toLowerCase().includes(search.toLowerCase()) || v.course?.toLowerCase().includes(search.toLowerCase())
  )

  function getVolunteerHours(volunteerId) {
    return deployments.filter(d => d.volunteerId === volunteerId).reduce((sum, d) => sum + (d.hours || 0), 0)
  }

  return (
    <div className="page-content">
      <div className="toolbar">
        <div className="toolbar-left">
          <input className="form-input search-input" placeholder="Search volunteers..." value={search} onChange={e => setSearch(e.target.value)} />
          <span className="result-count">{filtered.length} volunteer{filtered.length !== 1 ? 's' : ''}</span>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Volunteer</button>
      </div>

      <div className="card-grid">
        {filtered.length === 0 ? (
          <div className="empty-state">No volunteers found</div>
        ) : filtered.map(v => (
          <div className="volunteer-card" key={v.id}>
            <div className="vol-card-header">
              <div className="vol-avatar">{v.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
              <div>
                <div className="vol-name">{v.name}</div>
                <div className="vol-meta">{v.course} · {v.year}</div>
              </div>
              <div className="action-btns">
                <button className="btn-icon small" onClick={() => openEdit(v)} title="Edit">✏️</button>
                <button className="btn-icon small danger" onClick={() => setDeleteConfirm(v.id)} title="Delete">🗑️</button>
              </div>
            </div>
            <div className="vol-details">
              <div className="vol-detail-row"><span className="vol-label">Email:</span><span>{v.email}</span></div>
              <div className="vol-detail-row"><span className="vol-label">Availability:</span><span>{v.availability}</span></div>
              <div className="vol-detail-row"><span className="vol-label">Hours Served:</span><span className="hours-badge">{getVolunteerHours(v.id)}h</span></div>
            </div>
            <div className="vol-skills">
              {(v.skills || []).map(s => <span key={s} className="skill-tag">{s}</span>)}
            </div>
            <div className="vol-deployments">
              <span className="deployment-count">{v.deployments} deployment{v.deployments !== 1 ? 's' : ''}</span>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <Modal title={modal === 'add' ? 'Add Volunteer' : 'Edit Volunteer'} onClose={() => setModal(null)}>
          <form onSubmit={handleSave} className="modal-form">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Course</label>
                <input className="form-input" placeholder="e.g. BSIT" value={form.course} onChange={e => setForm({ ...form, course: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Year Level</label>
                <input className="form-input" placeholder="e.g. 4th Year" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Availability</label>
              <input className="form-input" placeholder="e.g. MWF, TTh, Sat" value={form.availability} onChange={e => setForm({ ...form, availability: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Skills</label>
              <div className="checkbox-group skills-grid">
                {SKILL_OPTIONS.map(skill => (
                  <label key={skill} className="checkbox-label">
                    <input type="checkbox" checked={(form.skills || []).includes(skill)} onChange={() => toggleSkill(skill)} />
                    <span>{skill}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary">{modal === 'add' ? 'Add Volunteer' : 'Save Changes'}</button>
            </div>
          </form>
        </Modal>
      )}

      {deleteConfirm && (
        <Modal title="Remove Volunteer?" onClose={() => setDeleteConfirm(null)} width="400px">
          <p style={{ marginBottom: '1rem', color: '#64748b' }}>This will remove the volunteer record.</p>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>Remove</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
