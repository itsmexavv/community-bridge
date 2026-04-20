import { useState, useEffect } from 'react'
import { getAll, create, update, remove } from '../store'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'

const TYPES = ['Government Agency', 'Local Government', 'NGO', 'Hospital', 'Academic', 'Private', 'Other']
const MOA_STATUSES = ['Active', 'For Renewal', 'Expired', 'Pending']
const EMPTY = { name: '', type: 'NGO', contactPerson: '', email: '', phone: '', moaStatus: 'Pending', moaExpiry: '' }

export default function Partners() {
  const toast = useToast()
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => { reload() }, [])
  function reload() { setItems(getAll('partners')) }

  function openAdd() { setForm({ ...EMPTY }); setEditId(null); setModal('add') }
  function openEdit(item) { setForm({ ...item }); setEditId(item.id); setModal('edit') }

  function handleSave(e) {
    e.preventDefault()
    if (editId) { update('partners', editId, form); toast('Partner updated', 'success') }
    else { create('partners', form); toast('Partner added', 'success') }
    setModal(null); reload()
  }

  function handleDelete(id) { remove('partners', id); setDeleteConfirm(null); reload(); toast('Partner removed', 'info') }

  const filtered = items.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.type?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page-content">
      <div className="toolbar">
        <div className="toolbar-left">
          <input className="form-input search-input" placeholder="Search partners..." value={search} onChange={e => setSearch(e.target.value)} />
          <span className="result-count">{filtered.length} partner{filtered.length !== 1 ? 's' : ''}</span>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Partner</button>
      </div>

      <div className="card-grid partner-grid">
        {filtered.length === 0 ? (
          <div className="empty-state">No partners found</div>
        ) : filtered.map(p => (
          <div className="partner-card" key={p.id}>
            <div className="partner-header">
              <div className="partner-icon">{p.type === 'Government Agency' ? '🏛️' : p.type === 'Local Government' ? '🏢' : p.type === 'NGO' ? '🌍' : p.type === 'Hospital' ? '🏥' : '🤝'}</div>
              <div className="partner-info">
                <div className="partner-name">{p.name}</div>
                <div className="partner-type">{p.type}</div>
              </div>
              <div className="action-btns">
                <button className="btn-icon small" onClick={() => openEdit(p)} title="Edit">✏️</button>
                <button className="btn-icon small danger" onClick={() => setDeleteConfirm(p.id)} title="Delete">🗑️</button>
              </div>
            </div>
            <div className="partner-details">
              <div className="partner-row"><span className="partner-label">Contact:</span><span>{p.contactPerson}</span></div>
              <div className="partner-row"><span className="partner-label">Email:</span><span>{p.email}</span></div>
              <div className="partner-row"><span className="partner-label">Phone:</span><span>{p.phone}</span></div>
            </div>
            <div className="partner-footer">
              <span className={`moa-badge ${p.moaStatus?.toLowerCase().replace(/\s+/g, '-')}`}>MOA: {p.moaStatus}</span>
              {p.moaExpiry && <span className="moa-expiry">Expires: {p.moaExpiry}</span>}
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <Modal title={modal === 'add' ? 'Add Partner Institution' : 'Edit Partner'} onClose={() => setModal(null)}>
          <form onSubmit={handleSave} className="modal-form">
            <div className="form-group">
              <label className="form-label">Institution Name *</label>
              <input className="form-input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">MOA Status</label>
                <select className="form-input" value={form.moaStatus} onChange={e => setForm({ ...form, moaStatus: e.target.value })}>
                  {MOA_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Contact Person</label>
              <input className="form-input" value={form.contactPerson} onChange={e => setForm({ ...form, contactPerson: e.target.value })} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">MOA Expiry Date</label>
              <input type="date" className="form-input" value={form.moaExpiry} onChange={e => setForm({ ...form, moaExpiry: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary">{modal === 'add' ? 'Add Partner' : 'Save Changes'}</button>
            </div>
          </form>
        </Modal>
      )}

      {deleteConfirm && (
        <Modal title="Remove Partner?" onClose={() => setDeleteConfirm(null)} width="400px">
          <p style={{ marginBottom: '1rem', color: '#64748b' }}>This will remove the partner institution record.</p>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>Remove</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
