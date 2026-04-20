import { useState, useEffect } from 'react'
import { getAll, create, update, remove } from '../store'
import Modal from '../components/Modal'

const STATUSES = ['Active', 'Planned', 'Completed']
const SDG_OPTIONS = ['SDG 3', 'SDG 4', 'SDG 10', 'SDG 11', 'SDG 17']
const EMPTY = { title: '', description: '', status: 'Planned', sdgTags: [], location: '', startDate: '', endDate: '', targetBeneficiaries: '', coordinator: '' }

export default function Programs() {
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [modal, setModal] = useState(null)  // null | 'add' | 'edit'
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => { reload() }, [])
  function reload() { setItems(getAll('programs')) }

  function openAdd() { setForm(EMPTY); setEditId(null); setModal('add') }
  function openEdit(item) { setForm({ ...item }); setEditId(item.id); setModal('edit') }

  function handleSave(e) {
    e.preventDefault()
    const data = { ...form, targetBeneficiaries: parseInt(form.targetBeneficiaries) || 0 }
    if (editId) { update('programs', editId, data) }
    else { create('programs', data) }
    setModal(null); reload()
  }

  function handleDelete(id) { remove('programs', id); setDeleteConfirm(null); reload() }

  function toggleSdg(tag) {
    const tags = form.sdgTags || []
    setForm({ ...form, sdgTags: tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag] })
  }

  const filtered = items.filter(p => {
    if (filterStatus !== 'All' && p.status !== filterStatus) return false
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.coordinator?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="page-content">
      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-left">
          <input className="form-input search-input" placeholder="Search programs..." value={search} onChange={e => setSearch(e.target.value)} />
          <div className="filter-pills">
            {['All', ...STATUSES].map(s => (
              <button key={s} className={`pill ${filterStatus === s ? 'active' : ''}`} onClick={() => setFilterStatus(s)}>{s}</button>
            ))}
          </div>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Program</button>
      </div>

      {/* Table */}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Program Title</th>
              <th>Status</th>
              <th>SDG Tags</th>
              <th>Location</th>
              <th>Duration</th>
              <th>Target</th>
              <th>Coordinator</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="8" className="empty-row">No programs found</td></tr>
            ) : filtered.map(p => (
              <tr key={p.id}>
                <td className="td-primary">{p.title}</td>
                <td><span className={`status-badge ${p.status.toLowerCase()}`}>{p.status}</span></td>
                <td>
                  <div className="tag-group">
                    {(p.sdgTags || []).map(t => <span key={t} className="sdg-tag">{t}</span>)}
                  </div>
                </td>
                <td>{p.location}</td>
                <td className="td-nowrap">{p.startDate} → {p.endDate}</td>
                <td>{p.targetBeneficiaries}</td>
                <td>{p.coordinator}</td>
                <td>
                  <div className="action-btns">
                    <button className="btn-icon" onClick={() => openEdit(p)} title="Edit">✏️</button>
                    <button className="btn-icon danger" onClick={() => setDeleteConfirm(p.id)} title="Delete">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <Modal title={modal === 'add' ? 'Add New Program' : 'Edit Program'} onClose={() => setModal(null)} width="640px">
          <form onSubmit={handleSave} className="modal-form">
            <div className="form-group">
              <label className="form-label">Program Title *</label>
              <input className="form-input" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input form-textarea" rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Coordinator</label>
                <input className="form-input" value={form.coordinator} onChange={e => setForm({ ...form, coordinator: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input className="form-input" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input type="date" className="form-input" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">End Date</label>
                <input type="date" className="form-input" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Target Beneficiaries</label>
                <input type="number" className="form-input" value={form.targetBeneficiaries} onChange={e => setForm({ ...form, targetBeneficiaries: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">UN SDG Alignment</label>
              <div className="checkbox-group">
                {SDG_OPTIONS.map(tag => (
                  <label key={tag} className="checkbox-label">
                    <input type="checkbox" checked={(form.sdgTags || []).includes(tag)} onChange={() => toggleSdg(tag)} />
                    <span>{tag}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary">{modal === 'add' ? 'Create Program' : 'Save Changes'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <Modal title="Delete Program?" onClose={() => setDeleteConfirm(null)} width="400px">
          <p style={{ marginBottom: '1rem', color: '#64748b' }}>This action cannot be undone. All related data will remain but will no longer be linked to this program.</p>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
