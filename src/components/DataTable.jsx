import { useState, useMemo } from 'react'

export default function DataTable({ 
  data, 
  columns, 
  searchable = true,
  searchPlaceholder = 'Search...',
  searchKeys = [],
  pagination = true,
  itemsPerPage = 10,
  actions,
  bulkActions = [],
  filterNode,
  emptyMessage = "No records found"
}) {
  const [search, setSearch] = useState('')
  const [sortConfig, setSortConfig] = useState(null) // { key, direction: 'asc' | 'desc' }
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState([])

  const filtered = useMemo(() => {
    let result = data;
    // We let the parent handle some filtering via data prop if they want, 
    // but we also support internal searching
    if (search && searchKeys.length > 0) {
      result = result.filter(item => {
        return searchKeys.some(key => {
          const val = item[key]
          return val && String(val).toLowerCase().includes(search.toLowerCase())
        })
      })
    }
    return result
  }, [data, search, searchKeys])

  const sorted = useMemo(() => {
    let sortableItems = [...filtered]
    if (sortConfig !== null && sortConfig.key) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }
    return sortableItems
  }, [filtered, sortConfig])

  const paginated = useMemo(() => {
    if (!pagination) return sorted
    const start = (page - 1) * itemsPerPage
    return sorted.slice(start, start + itemsPerPage)
  }, [sorted, page, itemsPerPage, pagination])

  const totalPages = Math.ceil(sorted.length / itemsPerPage)

  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const toggleSelectAll = () => {
    if (selected.length === paginated.length) setSelected([])
    else setSelected(paginated.map(i => i.id))
  }

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  return (
    <div className="data-table-container">
      <div className="toolbar" style={{ marginBottom: '1rem' }}>
        <div className="toolbar-left" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {searchable && searchKeys.length > 0 && (
             <input className="form-input search-input" placeholder={searchPlaceholder} value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          )}
          {filterNode}
          <span className="result-count">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</span>
          
          {bulkActions.length > 0 && selected.length > 0 && (
            <div className="bulk-actions" style={{ display: 'flex', gap: '0.5rem', marginLeft: '0.5rem' }}>
              {bulkActions.map((action, i) => (
                <button key={i} className={`btn ${action.danger ? 'btn-danger' : 'btn-secondary'}`} onClick={() => { action.onClick(selected); setSelected([]); }}>
                  {action.label} ({selected.length})
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          {actions}
        </div>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              {bulkActions.length > 0 && (
                <th style={{ width: '40px', textAlign: 'center' }}>
                  <input type="checkbox" checked={selected.length === paginated.length && paginated.length > 0} onChange={toggleSelectAll} />
                </th>
              )}
              {columns.map((col, i) => (
                <th 
                  key={i} 
                  onClick={() => col.sortable !== false ? handleSort(col.key || col.header) : undefined} 
                  style={{ cursor: col.sortable !== false ? 'pointer' : 'default', userSelect: 'none' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {col.header}
                    {col.sortable !== false && sortConfig?.key === (col.key || col.header) && (
                      <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (bulkActions.length > 0 ? 1 : 0)} className="empty-row">{emptyMessage}</td>
              </tr>
            ) : paginated.map((item, index) => (
              <tr key={item.id || index} className={selected.includes(item.id) ? 'row-selected' : ''}>
                {bulkActions.length > 0 && (
                  <td style={{ textAlign: 'center' }}>
                    <input type="checkbox" checked={selected.includes(item.id)} onChange={() => toggleSelect(item.id)} />
                  </td>
                )}
                {columns.map((col, i) => (
                  <td key={i} className={col.className}>
                    {col.render ? col.render(item) : item[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', padding: '0 0.5rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Showing {(page - 1) * itemsPerPage + 1} to {Math.min(page * itemsPerPage, sorted.length)} of {sorted.length} entries
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button className="btn btn-ghost" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
            {Array.from({ length: totalPages }, (_, i) => {
               // simple pagination truncation (show first, last, current, current+-1)
               if (i === 0 || i === totalPages - 1 || (i >= page - 2 && i <= page)) {
                 return (
                  <button key={i} className={`btn ${page === i + 1 ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: '0.4rem 0.8rem', minWidth: '32px' }} onClick={() => setPage(i + 1)}>
                    {i + 1}
                  </button>
                 )
               } else if (i === 1 || i === totalPages - 2) {
                 return <span key={i} style={{ padding: '0.4rem', color: 'var(--text-secondary)' }}>...</span>
               }
               return null
            })}
            <button className="btn btn-ghost" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        </div>
      )}
    </div>
  )
}
