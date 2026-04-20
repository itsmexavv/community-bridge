import { useState, useEffect } from 'react'
import { getAll, create, update, remove } from '../store'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'

const GENDERS = ['Male', 'Female', 'Other']
const EMPTY = { name: '', age: '', gender: 'Female', address: '', contact: '', programIds: [], registeredDate: new Date().toISOString().split('T')[0] }

export default function Beneficiaries() {
  const toast = useToast()
  const [items, setItems] = useState([])
  const [programs, setPrograms] = useState([])
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => { reload() }, [])
  function reload() { setItems(getAll('beneficiaries')); setPrograms(getAll('programs')) }

  function openAdd() { setForm({ ...EMPTY }); setEditId(null); setModal('add') }
  function openEdit(item) { setForm({ ...item }); setEditId(item.id); setModal('edit') }

  function handleSave(e) {
    e.preventDefault()
    const data = { ...form, age: parseInt(form.age) || 0 }
    if (editId) { update('beneficiaries', editId, data); toast('Beneficiary updated', 'success') }
    else { create('beneficiaries', data); toast('Beneficiary registered', 'success') }
    setModal(null); reload()
  }

  function handleDelete(id) { remove('beneficiaries', id); setDeleteConfirm(null); reload(); toast('Beneficiary removed', 'info') }

  function toggleProgram(pid) {
    const ids = form.programIds || []
    setForm({ ...form, programIds: ids.includes(pid) ? ids.filter(i => i !== pid) : [...ids, pid] })
  }

  const filtered = items.filter(b =>
    !search || b.name.toLowerCase().includes(search.toLowerCase()) || b.address?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page-content">
      <div className="toolbar">
        <div className="toolbar-left">
          <input className="form-input search-input" placeholder="Search beneficiaries..." value={search} onChange={e => setSearch(e.target.value)} />
          <span className="result-count">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</span>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Beneficiary</button>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Address</th>
              <th>Contact</th>
              <th>Programs Enrolled</th>
              <th>Registered</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="8" className="empty-row">No beneficiaries found</td></tr>
            ) : filtered.map(b => (
              <tr key={b.id}>
                <td className="td-primary">{b.name}</td>
                <td>{b.age}</td>
                <td>{b.gender}</td>
                <td>{b.address}</td>
                <td>{b.contact}</td>
                <td>
                  <div className="tag-group">
                    {(b.programIds || []).map(pid => {
                      const prog = programs.find(p => p.id === pid)
                      return prog ? <span key={pid} className="program-tag">{prog.title.length > 25 ? prog.title.slice(0, 25) + '…' : prog.title}</span> : null
                    })}
                  </div>
                </td>
                <td className="td-nowrap">{b.registeredDate}</td>
                <td>
                  <div className="action-btns">
                    <button className="btn-icon" onClick={() => openEdit(b)} title="Edit">✏️</button>
                    <button className="btn-icon danger" onClick={() => setDeleteConfirm(b.id)} title="Delete">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={modal === 'add' ? 'Register Beneficiary' : 'Edit Beneficiary'} onClose={() => setModal(null)}>
          <form onSubmit={handleSave} className="modal-form">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Age</label>
                <input type="number" className="form-input" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select className="form-input" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                  {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Contact</label>
                <input className="form-input" value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input className="form-input" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Enrolled Programs</label>
              <div className="checkbox-group">
                {programs.map(p => (
                  <label key={p.id} className="checkbox-label">
                    <input type="checkbox" checked={(form.programIds || []).includes(p.id)} onChange={() => toggleProgram(p.id)} />
                    <span>{p.title}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Date Registered</label>
              <input type="date" className="form-input" value={form.registeredDate} onChange={e => setForm({ ...form, registeredDate: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary">{modal === 'add' ? 'Register' : 'Save Changes'}</button>
            </div>
          </form>
        </Modal>
      )}

      {deleteConfirm && (
        <Modal title="Remove Beneficiary?" onClose={() => setDeleteConfirm(null)} width="400px">
          <p style={{ marginBottom: '1rem', color: '#64748b' }}>This will remove the beneficiary record permanently.</p>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>Remove</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
