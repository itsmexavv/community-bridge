import { useState, useEffect, useRef, useCallback } from 'react'
import { getAll, create, update, remove } from '../store'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'

const CATEGORIES = ['All', 'MOA/MOU', 'Proposal', 'Report', 'Documentation', 'Training Material', 'Other']
const DOC_STATUSES = ['Under Review', 'Approved', 'Archived']

const FILE_ICONS = {
  pdf: { icon: '📄', color: '#dc2626', label: 'PDF' },
  docx: { icon: '📝', color: '#2563eb', label: 'DOCX' },
  doc: { icon: '📝', color: '#2563eb', label: 'DOC' },
  xlsx: { icon: '📊', color: '#059669', label: 'XLSX' },
  xls: { icon: '📊', color: '#059669', label: 'XLS' },
  pptx: { icon: '📽️', color: '#d97706', label: 'PPTX' },
  zip: { icon: '📦', color: '#7c3aed', label: 'ZIP' },
  jpg: { icon: '🖼️', color: '#0891b2', label: 'JPG' },
  jpeg: { icon: '🖼️', color: '#0891b2', label: 'JPEG' },
  png: { icon: '🖼️', color: '#0891b2', label: 'PNG' },
  mp4: { icon: '🎬', color: '#e11d48', label: 'MP4' },
  default: { icon: '📎', color: '#64748b', label: 'FILE' },
}

function getFileInfo(type) {
  return FILE_ICONS[type?.toLowerCase()] || FILE_ICONS.default
}

function formatSize(bytes) {
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB'
  if (bytes >= 1024) return (bytes / 1024).toFixed(0) + ' KB'
  return bytes + ' B'
}

const EMPTY = { name: '', type: '', size: 0, category: 'Other', programId: '', uploadedBy: '', uploadDate: new Date().toISOString().split('T')[0], description: '', status: 'Under Review' }

export default function Documents() {
  const toast = useToast()
  const [items, setItems] = useState([])
  const [programs, setPrograms] = useState([])
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('All')
  const [modal, setModal] = useState(null) // null | 'add' | 'edit' | 'upload'
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [detailDoc, setDetailDoc] = useState(null)
  const [selectedIds, setSelectedIds] = useState([])
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false)
  const [viewMode, setViewMode] = useState('table') // 'table' | 'grid'

  // Drag-and-drop state
  const [isDragging, setIsDragging] = useState(false)
  const [uploadQueue, setUploadQueue] = useState([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)
  const dragCounter = useRef(0)

  useEffect(() => { reload() }, [])
  function reload() { setItems(getAll('documents')); setPrograms(getAll('programs')); setSelectedIds([]) }

  // ── Drag & Drop handlers ────────────────
  const handleDragEnter = useCallback((e) => {
    e.preventDefault(); e.stopPropagation()
    dragCounter.current++
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault(); e.stopPropagation()
    dragCounter.current--
    if (dragCounter.current === 0) setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault(); e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault(); e.stopPropagation()
    setIsDragging(false)
    dragCounter.current = 0
    const files = [...e.dataTransfer.files]
    if (files.length > 0) processFiles(files)
  }, [])

  function processFiles(files) {
    const queue = files.map(f => ({
      name: f.name,
      type: f.name.split('.').pop().toLowerCase(),
      size: f.size,
      progress: 0,
      status: 'pending',
    }))
    setUploadQueue(queue)
    setModal('upload')
    simulateUpload(queue)
  }

  function simulateUpload(queue) {
    setUploading(true)
    let idx = 0
    function uploadNext() {
      if (idx >= queue.length) {
        setUploading(false)
        // Auto-create document records for each file
        queue.forEach(f => {
          create('documents', {
            name: f.name, type: f.type, size: f.size,
            category: 'Other', programId: null,
            uploadedBy: 'Current User',
            uploadDate: new Date().toISOString().split('T')[0],
            description: '', status: 'Under Review'
          })
        })
        reload()
        toast(`✅ ${queue.length} document${queue.length > 1 ? 's' : ''} finished uploading!`, 'success')
        return
      }
      const interval = setInterval(() => {
        setUploadQueue(prev => {
          const next = [...prev]
          if (next[idx]) {
            next[idx] = { ...next[idx], progress: Math.min(next[idx].progress + Math.random() * 30, 100), status: 'uploading' }
            if (next[idx].progress >= 100) {
              next[idx] = { ...next[idx], progress: 100, status: 'done' }
              clearInterval(interval)
              idx++
              setTimeout(uploadNext, 200)
            }
          }
          return next
        })
      }, 150)
    }
    uploadNext()
  }

  function handleFileInput(e) {
    const files = [...e.target.files]
    if (files.length > 0) processFiles(files)
    e.target.value = ''
  }

  // ── CRUD ────────────────
  function openAdd() { setForm({ ...EMPTY }); setEditId(null); setModal('add') }
  function openEdit(item) { setForm({ ...item, programId: item.programId ? String(item.programId) : '' }); setEditId(item.id); setModal('edit') }

  function handleSave(e) {
    e.preventDefault()
    const data = { ...form, programId: form.programId ? parseInt(form.programId) : null, size: parseInt(form.size) || 0 }
    if (editId) {
      update('documents', editId, data)
      toast('Document updated successfully', 'success')
    } else {
      create('documents', data)
      toast('Document added successfully', 'success')
    }
    setModal(null); reload()
  }

  function handleDelete(id) { remove('documents', id); setDeleteConfirm(null); setDetailDoc(null); reload(); toast('Document deleted', 'info') }

  function handleBulkDelete() {
    const count = selectedIds.length
    selectedIds.forEach(id => remove('documents', id))
    setBulkDeleteConfirm(false); reload()
    toast(`${count} document${count > 1 ? 's' : ''} deleted`, 'info')
  }

  // ── Selection ────────────────
  function toggleSelect(id) {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }
  function toggleSelectAll() {
    if (selectedIds.length === filtered.length) setSelectedIds([])
    else setSelectedIds(filtered.map(d => d.id))
  }

  // ── Filter ────────────────
  const filtered = items
    .filter(d => {
      if (filterCat !== 'All' && d.category !== filterCat) return false
      if (search && !d.name.toLowerCase().includes(search.toLowerCase()) && !d.description?.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
    .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))

  // ── Storage Stats ────────────────
  const totalSize = items.reduce((s, d) => s + (d.size || 0), 0)
  const categoryStats = CATEGORIES.filter(c => c !== 'All').map(cat => ({
    name: cat,
    count: items.filter(d => d.category === cat).length,
    size: items.filter(d => d.category === cat).reduce((s, d) => s + (d.size || 0), 0)
  })).filter(c => c.count > 0)

  function getProgramTitle(pid) {
    return programs.find(p => p.id === pid)?.title || '—'
  }

  return (
    <div className="page-content"
      onDragEnter={handleDragEnter} onDragLeave={handleDragLeave}
      onDragOver={handleDragOver} onDrop={handleDrop}
    >
      {/* Global drop overlay */}
      {isDragging && (
        <div className="drop-overlay">
          <div className="drop-overlay-content">
            <div className="drop-icon">📂</div>
            <div className="drop-title">Drop files here to upload</div>
            <div className="drop-sub">Supported: PDF, DOCX, XLSX, PPTX, ZIP, Images, Videos</div>
          </div>
        </div>
      )}

      {/* Storage Stats Bar */}
      <div className="storage-stats">
        <div className="storage-header">
          <div className="storage-title">📁 Document Storage</div>
          <div className="storage-total">{items.length} files · {formatSize(totalSize)} total</div>
        </div>
        <div className="storage-bar-track">
          {categoryStats.map((cat, i) => {
            const pct = totalSize > 0 ? (cat.size / totalSize) * 100 : 0
            const colors = ['#3b82f6', '#059669', '#d97706', '#7c3aed', '#ef4444', '#0891b2']
            return (
              <div key={cat.name} className="storage-bar-segment"
                style={{ width: `${pct}%`, backgroundColor: colors[i % colors.length] }}
                title={`${cat.name}: ${cat.count} files (${formatSize(cat.size)})`}
              />
            )
          })}
        </div>
        <div className="storage-legend">
          {categoryStats.map((cat, i) => {
            const colors = ['#3b82f6', '#059669', '#d97706', '#7c3aed', '#ef4444', '#0891b2']
            return (
              <div key={cat.name} className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: colors[i % colors.length] }} />
                <span>{cat.name} ({cat.count})</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-left">
          <input className="form-input search-input" placeholder="Search documents..." value={search} onChange={e => setSearch(e.target.value)} />
          <div className="filter-pills">
            {CATEGORIES.map(c => (
              <button key={c} className={`pill ${filterCat === c ? 'active' : ''}`} onClick={() => setFilterCat(c)}>{c}</button>
            ))}
          </div>
        </div>
        <div className="toolbar-right-group">
          <div className="view-toggle">
            <button className={`view-btn ${viewMode === 'table' ? 'active' : ''}`} onClick={() => setViewMode('table')} title="Table view">☰</button>
            <button className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')} title="Grid view">▦</button>
          </div>
          {selectedIds.length > 0 && (
            <button className="btn btn-danger" onClick={() => setBulkDeleteConfirm(true)}>
              🗑️ Delete ({selectedIds.length})
            </button>
          )}
          <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>📎 Browse Files</button>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Document</button>
          <input ref={fileInputRef} type="file" multiple style={{ display: 'none' }} onChange={handleFileInput} />
        </div>
      </div>

      {/* Upload Drop Zone (always visible) */}
      <div className="upload-zone" onClick={() => fileInputRef.current?.click()}>
        <div className="upload-zone-inner">
          <div className="upload-zone-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><rect x="6" y="20" width="36" height="24" rx="4" stroke="#94a3b8" strokeWidth="2" fill="none"/><path d="M16 20V14a8 8 0 0116 0v6" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"/><path d="M24 28v8M20 32l4-4 4 4" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div className="upload-zone-text">
            <strong>Drag & drop files here</strong> or click to browse
          </div>
          <div className="upload-zone-hint">PDF, DOCX, XLSX, PPTX, ZIP, Images up to 50MB</div>
        </div>
      </div>

      {/* Content: Table or Grid */}
      {viewMode === 'table' ? (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 36 }}>
                  <input type="checkbox" checked={selectedIds.length === filtered.length && filtered.length > 0} onChange={toggleSelectAll} />
                </th>
                <th>Document</th>
                <th>Category</th>
                <th>Program</th>
                <th>Size</th>
                <th>Status</th>
                <th>Uploaded</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="8" className="empty-row">No documents found</td></tr>
              ) : filtered.map(d => {
                const fi = getFileInfo(d.type)
                return (
                  <tr key={d.id} className={selectedIds.includes(d.id) ? 'row-selected' : ''}>
                    <td><input type="checkbox" checked={selectedIds.includes(d.id)} onChange={() => toggleSelect(d.id)} /></td>
                    <td>
                      <div className="doc-name-cell" onClick={() => setDetailDoc(d)} style={{ cursor: 'pointer' }}>
                        <span className="file-type-icon" style={{ backgroundColor: fi.color + '18', color: fi.color }}>{fi.icon}</span>
                        <div>
                          <div className="td-primary">{d.name}</div>
                          <div className="td-sub">{fi.label} file</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="category-tag">{d.category}</span></td>
                    <td className="td-truncate">{d.programId ? getProgramTitle(d.programId) : '—'}</td>
                    <td className="td-nowrap">{formatSize(d.size)}</td>
                    <td><span className={`doc-status-badge ${d.status?.toLowerCase().replace(/\s+/g, '-')}`}>{d.status}</span></td>
                    <td className="td-nowrap">{d.uploadDate}</td>
                    <td>
                      <div className="action-btns">
                        <button className="btn-icon" onClick={() => setDetailDoc(d)} title="View">👁️</button>
                        <button className="btn-icon" onClick={() => openEdit(d)} title="Edit">✏️</button>
                        <button className="btn-icon danger" onClick={() => setDeleteConfirm(d.id)} title="Delete">🗑️</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="doc-grid">
          {filtered.length === 0 ? (
            <div className="empty-state">No documents found</div>
          ) : filtered.map(d => {
            const fi = getFileInfo(d.type)
            return (
              <div key={d.id} className={`doc-card ${selectedIds.includes(d.id) ? 'selected' : ''}`} onClick={() => setDetailDoc(d)}>
                <div className="doc-card-check" onClick={e => { e.stopPropagation(); toggleSelect(d.id) }}>
                  <input type="checkbox" checked={selectedIds.includes(d.id)} readOnly />
                </div>
                <div className="doc-card-preview" style={{ backgroundColor: fi.color + '12' }}>
                  <span className="doc-card-icon" style={{ color: fi.color }}>{fi.icon}</span>
                  <span className="doc-card-type" style={{ backgroundColor: fi.color, color: '#fff' }}>{fi.label}</span>
                </div>
                <div className="doc-card-body">
                  <div className="doc-card-name">{d.name}</div>
                  <div className="doc-card-meta">
                    <span>{formatSize(d.size)}</span>
                    <span className="dot-sep">·</span>
                    <span>{d.uploadDate}</span>
                  </div>
                  <div className="doc-card-footer">
                    <span className="category-tag small">{d.category}</span>
                    <span className={`doc-status-badge small ${d.status?.toLowerCase().replace(/\s+/g, '-')}`}>{d.status}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Detail Panel Modal */}
      {detailDoc && (
        <Modal title="Document Details" onClose={() => setDetailDoc(null)} width="520px">
          <div className="doc-detail">
            <div className="doc-detail-preview" style={{ backgroundColor: getFileInfo(detailDoc.type).color + '12' }}>
              <span style={{ fontSize: '3rem' }}>{getFileInfo(detailDoc.type).icon}</span>
              <span className="doc-detail-type" style={{ backgroundColor: getFileInfo(detailDoc.type).color }}>{getFileInfo(detailDoc.type).label}</span>
            </div>
            <h3 className="doc-detail-name">{detailDoc.name}</h3>
            <div className="doc-detail-grid">
              <div className="doc-detail-row"><span className="doc-detail-label">Category</span><span className="category-tag">{detailDoc.category}</span></div>
              <div className="doc-detail-row"><span className="doc-detail-label">Status</span><span className={`doc-status-badge ${detailDoc.status?.toLowerCase().replace(/\s+/g, '-')}`}>{detailDoc.status}</span></div>
              <div className="doc-detail-row"><span className="doc-detail-label">File Size</span><span>{formatSize(detailDoc.size)}</span></div>
              <div className="doc-detail-row"><span className="doc-detail-label">Program</span><span>{detailDoc.programId ? getProgramTitle(detailDoc.programId) : 'None'}</span></div>
              <div className="doc-detail-row"><span className="doc-detail-label">Uploaded By</span><span>{detailDoc.uploadedBy}</span></div>
              <div className="doc-detail-row"><span className="doc-detail-label">Upload Date</span><span>{detailDoc.uploadDate}</span></div>
            </div>
            {detailDoc.description && (
              <div className="doc-detail-desc">
                <div className="doc-detail-label">Description</div>
                <p>{detailDoc.description}</p>
              </div>
            )}
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => { setDetailDoc(null); openEdit(detailDoc) }}>✏️ Edit</button>
              <button className="btn btn-danger" onClick={() => { setDetailDoc(null); setDeleteConfirm(detailDoc.id) }}>🗑️ Delete</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add/Edit Modal */}
      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Add Document Record' : 'Edit Document'} onClose={() => setModal(null)} width="580px">
          <form onSubmit={handleSave} className="modal-form">
            <div className="form-group">
              <label className="form-label">File Name *</label>
              <input className="form-input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Project_Proposal.pdf" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">File Type</label>
                <input className="form-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} placeholder="e.g. pdf, docx" />
              </div>
              <div className="form-group">
                <label className="form-label">File Size (bytes)</label>
                <input type="number" className="form-input" value={form.size} onChange={e => setForm({ ...form, size: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  {DOC_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Program (Optional)</label>
              <select className="form-input" value={form.programId} onChange={e => setForm({ ...form, programId: e.target.value })}>
                <option value="">None — General Document</option>
                {programs.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Uploaded By</label>
              <input className="form-input" value={form.uploadedBy} onChange={e => setForm({ ...form, uploadedBy: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input form-textarea" rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary">{modal === 'add' ? 'Add Document' : 'Save Changes'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Upload Progress Modal */}
      {modal === 'upload' && (
        <Modal title="Uploading Files" onClose={() => { if (!uploading) setModal(null) }} width="480px">
          <div className="upload-progress-list">
            {uploadQueue.map((f, i) => {
              const fi = getFileInfo(f.type)
              return (
                <div key={i} className="upload-progress-item">
                  <span className="file-type-icon small" style={{ backgroundColor: fi.color + '18', color: fi.color }}>{fi.icon}</span>
                  <div className="upload-progress-info">
                    <div className="upload-progress-name">{f.name}</div>
                    <div className="upload-progress-bar-track">
                      <div className="upload-progress-bar-fill" style={{ width: `${f.progress}%`, backgroundColor: f.status === 'done' ? '#059669' : '#3b82f6' }} />
                    </div>
                  </div>
                  <span className="upload-progress-pct">{f.status === 'done' ? '✓' : `${Math.round(f.progress)}%`}</span>
                </div>
              )
            })}
          </div>
          {!uploading && (
            <div className="modal-actions" style={{ marginTop: '1rem' }}>
              <button className="btn btn-primary" onClick={() => setModal(null)}>Done</button>
            </div>
          )}
        </Modal>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <Modal title="Delete Document?" onClose={() => setDeleteConfirm(null)} width="400px">
          <p style={{ marginBottom: '1rem', color: '#64748b' }}>This document record will be permanently removed.</p>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
          </div>
        </Modal>
      )}

      {/* Bulk Delete Confirmation */}
      {bulkDeleteConfirm && (
        <Modal title="Delete Selected Documents?" onClose={() => setBulkDeleteConfirm(false)} width="420px">
          <p style={{ marginBottom: '1rem', color: '#64748b' }}>
            You are about to delete <strong>{selectedIds.length}</strong> document{selectedIds.length > 1 ? 's' : ''}. This cannot be undone.
          </p>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setBulkDeleteConfirm(false)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleBulkDelete}>Delete All Selected</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
