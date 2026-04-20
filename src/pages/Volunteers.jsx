import { useState, useEffect } from 'react'
import { getAll, create, update, remove } from '../store'
import Modal from '../components/Modal'
import DataTable from '../components/DataTable'
import { useToast } from '../components/Toast'

const EMPTY = { name: '', email: '', course: '', year: '', skills: [], availability: '', deployments: 0 }
const SKILL_OPTIONS = ['Project Management', 'Documentation', 'Community Organizing', 'Data Entry', 'Web Development', 'Technical Support', 'Teaching', 'Tutoring', 'First Aid', 'Health Education', 'Photography', 'Report Writing', 'Public Speaking']

export default function Volunteers() {
  const toast = useToast()
  const [items, setItems] = useState([])
  const [deployments, setDeployments] = useState([])
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
    if (editId) { update('volunteers', editId, data); toast('Volunteer updated', 'success') }
    else { create('volunteers', data); toast('Volunteer added', 'success') }
    setModal(null); reload()
  }

  function handleDelete(id) { remove('volunteers', id); setDeleteConfirm(null); reload(); toast('Volunteer removed', 'info') }

  function toggleSkill(skill) {
    const skills = form.skills || []
    setForm({ ...form, skills: skills.includes(skill) ? skills.filter(s => s !== skill) : [...skills, skill] })
  }

  const columns = [
    { key: 'name', header: 'Volunteer', className: 'td-primary', render: v => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div className="vol-avatar" style={{ width: '30px', height: '30px', fontSize: '0.65rem' }}>
          {v.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
        <div>
          <div>{v.name}</div>
          <div className="vol-meta" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{v.course} · {v.year}</div>
        </div>
      </div>
    )},
    { key: 'email', header: 'Email' },
    { key: 'availability', header: 'Availability' },
    { key: 'hours', header: 'Hours', render: v => <span className="hours-badge">{getVolunteerHours(v.id)}h</span> },
    { key: 'skills', header: 'Skills', sortable: false, render: v => (
      <div className="vol-skills" style={{ marginBottom: 0 }}>
        {(v.skills || []).slice(0, 3).map(s => <span key={s} className="skill-tag">{s}</span>)}
        {(v.skills || []).length > 3 && <span className="skill-tag">+{v.skills.length - 3}</span>}
      </div>
    )},
    { key: 'deployments', header: 'Deployments' },
    { key: 'actions', header: 'Actions', sortable: false, render: v => (
      <div className="action-btns">
        <button className="btn-icon" onClick={() => openEdit(v)} title="Edit">✏️</button>
        <button className="btn-icon danger" onClick={() => setDeleteConfirm(v.id)} title="Delete">🗑️</button>
      </div>
    )}
  ]

  const handleBulkDelete = (selectedIds) => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} volunteers?`)) {
      selectedIds.forEach(id => remove('volunteers', id))
      reload()
      toast(`Removed ${selectedIds.length} volunteers`, 'info')
    }
  }

  function getVolunteerHours(volunteerId) {
    return deployments.filter(d => d.volunteerId === volunteerId).reduce((sum, d) => sum + (d.hours || 0), 0)
  }

  return (
    <div className="page-content">
      <DataTable 
        data={items}
        columns={columns}
        searchKeys={['name', 'email', 'course', 'skills']}
        searchPlaceholder="Search volunteers..."
        actions={<button className="btn btn-primary" onClick={openAdd}>+ Add Volunteer</button>}
        bulkActions={[
          { label: 'Delete Selected', danger: true, onClick: handleBulkDelete }
        ]}
      />

      {modal && (
        <Modal title={modal === 'add' ? 'Add Volunteer' : 'Edit Volunteer'} onClose={() => setModal(null)}>
          <form onSubmit={handleSave} className="modal-form">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" placeholder="user.email@gmail.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
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
