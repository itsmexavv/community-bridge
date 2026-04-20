/* ================================================================
   CommunityBridge — Data Store (Hybrid: Firebase + localStorage)
   Real authentication with role-based access control.
   ================================================================ */
import { db, auth, isFirebaseEnabled } from './firebase'
import {
  collection, doc, getDocs, setDoc, updateDoc, deleteDoc,
  onSnapshot, writeBatch, query, where, orderBy
} from 'firebase/firestore'
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut, onAuthStateChanged
} from 'firebase/auth'

// ── Seed Data ───────────────────────────────────────────────────
const SEED = {
  programs: [
    { id: 1, title: 'Barangay Health Literacy Program', description: 'Health education sessions for rural barangays.', status: 'Active', sdgTags: ['SDG 3', 'SDG 10'], location: 'Brgy. San Vicente, Tuguegarao City', startDate: '2026-02-01', endDate: '2026-07-31', targetBeneficiaries: 200, coordinator: 'Leigh Amor Naval' },
    { id: 2, title: 'TechBridge Digital Literacy Workshop', description: 'Computer basics and internet safety workshops.', status: 'Active', sdgTags: ['SDG 4', 'SDG 10'], location: 'USL Extension Center', startDate: '2026-03-15', endDate: '2026-06-15', targetBeneficiaries: 80, coordinator: 'Xavier John Gacus' },
    { id: 3, title: 'GreenCampus Tree Planting Initiative', description: 'Community reforestation along riverbanks.', status: 'Planned', sdgTags: ['SDG 11', 'SDG 17'], location: 'Cagayan River Basin', startDate: '2026-06-01', endDate: '2026-06-30', targetBeneficiaries: 150, coordinator: 'Jones Nemesis Colobong' },
    { id: 4, title: 'Community Feeding Program', description: 'Monthly feeding sessions for malnourished children.', status: 'Completed', sdgTags: ['SDG 3', 'SDG 10'], location: 'Brgy. Atulayan, Tuguegarao City', startDate: '2025-08-01', endDate: '2025-12-31', targetBeneficiaries: 120, coordinator: 'Patrick Vince Tabanganay' },
    { id: 5, title: 'Livelihood Skills Training', description: 'Entrepreneurship training for women in marginalized communities.', status: 'Active', sdgTags: ['SDG 4', 'SDG 10', 'SDG 17'], location: 'Brgy. Caggay, Tuguegarao City', startDate: '2026-01-15', endDate: '2026-05-30', targetBeneficiaries: 60, coordinator: 'Jon Jiro Perdido' },
  ],
  beneficiaries: [
    { id: 1, name: 'Maria Santos', age: 34, gender: 'Female', address: 'Brgy. San Vicente', contact: '09171234567', programIds: [1, 4], registeredDate: '2026-02-05' },
    { id: 2, name: 'Juan Dela Cruz', age: 67, gender: 'Male', address: 'Brgy. Atulayan', contact: '09281234567', programIds: [2], registeredDate: '2026-03-18' },
    { id: 3, name: 'Ana Reyes', age: 28, gender: 'Female', address: 'Brgy. Caggay', contact: '09351234567', programIds: [5], registeredDate: '2026-01-20' },
    { id: 4, name: 'Pedro Bautista', age: 45, gender: 'Male', address: 'Brgy. Annafunan East', contact: '09431234567', programIds: [1, 3], registeredDate: '2026-02-10' },
    { id: 5, name: 'Rosa Garcia', age: 52, gender: 'Female', address: 'Brgy. San Vicente', contact: '09531234567', programIds: [4], registeredDate: '2025-08-15' },
  ],
  volunteers: [
    { id: 1, name: 'Leigh Amor Naval', email: 'leigh.naval@usl.edu.ph', course: 'BSIT', year: '4th Year', skills: ['Project Management', 'Documentation'], availability: 'MWF', deployments: 8 },
    { id: 2, name: 'Jones Nemesis Colobong', email: 'jones.colobong@usl.edu.ph', course: 'BSIT', year: '4th Year', skills: ['Community Organizing', 'Data Entry'], availability: 'TTh', deployments: 6 },
    { id: 3, name: 'Xavier John Gacus', email: 'xavier.gacus@usl.edu.ph', course: 'BSIT', year: '4th Year', skills: ['Web Development', 'Technical Support'], availability: 'MWF', deployments: 10 },
    { id: 4, name: 'Jon Jiro Perdido', email: 'jon.perdido@usl.edu.ph', course: 'BSIT', year: '4th Year', skills: ['Teaching', 'First Aid'], availability: 'Sat', deployments: 5 },
    { id: 5, name: 'Patrick Vince Tabanganay', email: 'patrick.tabanganay@usl.edu.ph', course: 'BSIT', year: '4th Year', skills: ['Photography', 'Report Writing'], availability: 'TTh-Sat', deployments: 7 },
  ],
  activities: [
    { id: 1, programId: 1, title: 'Maternal Health Seminar', date: '2026-02-15', location: 'Brgy. San Vicente Hall', description: 'Seminar on prenatal care.', participants: 45, facilitator: 'Leigh Amor Naval' },
    { id: 2, programId: 2, title: 'Basic Computer Operations', date: '2026-03-20', location: 'USL Computer Lab 3', description: 'Microsoft Office session.', participants: 25, facilitator: 'Xavier John Gacus' },
    { id: 3, programId: 1, title: 'Nutrition Session', date: '2026-03-10', location: 'Brgy. San Vicente Health Center', description: 'Child nutrition workshop.', participants: 38, facilitator: 'Angela Reyes' },
    { id: 4, programId: 5, title: 'Business Plan Workshop', date: '2026-02-20', location: 'Brgy. Caggay Hall', description: 'Business plan writing.', participants: 30, facilitator: 'Jon Jiro Perdido' },
  ],
  partners: [
    { id: 1, name: 'DENR Region 02', type: 'Government Agency', contactPerson: 'Engr. Roberto Cruz', email: 'denr02@denr.gov.ph', phone: '(078) 844-1234', moaStatus: 'Active', moaExpiry: '2027-12-31' },
    { id: 2, name: 'LGU Tuguegarao City', type: 'Local Government', contactPerson: 'Hon. Maria Lopez', email: 'lgu.tuguegarao@gmail.com', phone: '(078) 844-5678', moaStatus: 'Active', moaExpiry: '2027-06-30' },
    { id: 3, name: 'Philippine Red Cross — Cagayan', type: 'NGO', contactPerson: 'Dr. Carlos Mendez', email: 'prc.cagayan@redcross.org.ph', phone: '(078) 844-9012', moaStatus: 'Active', moaExpiry: '2026-12-31' },
  ],
  deployments: [
    { id: 1, volunteerId: 1, programId: 1, date: '2026-02-15', hours: 4, status: 'Completed' },
    { id: 2, volunteerId: 3, programId: 2, date: '2026-03-20', hours: 6, status: 'Completed' },
    { id: 3, volunteerId: 4, programId: 5, date: '2026-02-20', hours: 5, status: 'Completed' },
    { id: 4, volunteerId: 5, programId: 4, date: '2025-11-15', hours: 6, status: 'Completed' },
  ],
  documents: [
    { id: 1, name: 'MOA_DENR_Region02.pdf', type: 'pdf', size: 2450000, category: 'MOA/MOU', programId: 3, uploadedBy: 'Leigh Amor Naval', uploadDate: '2026-02-10', description: 'MOA with DENR Region 02.', status: 'Approved' },
    { id: 2, name: 'Health_Literacy_Proposal.docx', type: 'docx', size: 1280000, category: 'Proposal', programId: 1, uploadedBy: 'Xavier John Gacus', uploadDate: '2026-01-20', description: 'Health Literacy proposal.', status: 'Approved' },
    { id: 3, name: 'Volunteer_Attendance.xlsx', type: 'xlsx', size: 340000, category: 'Report', programId: 2, uploadedBy: 'Jones Nemesis Colobong', uploadDate: '2026-04-01', description: 'Volunteer attendance March 2026.', status: 'Approved' },
  ],
  tasks: [
    { id: 1, title: 'Prepare Health Seminar Materials', assignedTo: 'staff@usl.edu.ph', assignedRole: 'staff', programId: 1, priority: 'High', status: 'Completed', dueDate: '2026-02-10', completedDate: '2026-02-09', description: 'Prepare handouts and presentation slides for the maternal health seminar.', progress: 100 },
    { id: 2, title: 'Coordinate with DENR for Tree Planting', assignedTo: 'staff@usl.edu.ph', assignedRole: 'staff', programId: 3, priority: 'Medium', status: 'In Progress', dueDate: '2026-05-15', completedDate: null, description: 'Contact DENR Region 02 to finalize schedule and logistics.', progress: 60 },
    { id: 3, title: 'Compile Beneficiary Survey Data', assignedTo: 'staff@usl.edu.ph', assignedRole: 'staff', programId: 1, priority: 'High', status: 'In Progress', dueDate: '2026-04-30', completedDate: null, description: 'Collect and compile all beneficiary feedback forms.', progress: 40 },
    { id: 4, title: 'Document Feeding Program Photos', assignedTo: 'volunteer@usl.edu.ph', assignedRole: 'volunteer', programId: 4, priority: 'Low', status: 'Completed', dueDate: '2025-12-15', completedDate: '2025-12-10', description: 'Take and organize photos from feeding sessions.', progress: 100 },
    { id: 5, title: 'Assist Computer Workshop Setup', assignedTo: 'volunteer@usl.edu.ph', assignedRole: 'volunteer', programId: 2, priority: 'Medium', status: 'In Progress', dueDate: '2026-04-20', completedDate: null, description: 'Set up computers and install required software.', progress: 75 },
    { id: 6, title: 'Write Livelihood Training Report', assignedTo: 'staff@usl.edu.ph', assignedRole: 'staff', programId: 5, priority: 'Medium', status: 'Pending', dueDate: '2026-06-15', completedDate: null, description: 'Draft the accomplishment report for the livelihood training program.', progress: 0 },
    { id: 7, title: 'Distribute Flyers for Health Program', assignedTo: 'volunteer@usl.edu.ph', assignedRole: 'volunteer', programId: 1, priority: 'Low', status: 'Pending', dueDate: '2026-05-01', completedDate: null, description: 'Distribute information flyers to partner barangays.', progress: 0 },
  ],
};

// ── localStorage helpers ────────────────────────────────────────
function load(key) {
  try { const r = localStorage.getItem(`cb_${key}`); return r ? JSON.parse(r) : null } catch { return null }
}
function save(key, data) { localStorage.setItem(`cb_${key}`, JSON.stringify(data)) }

// ── Connection tracking ─────────────────────────────────────────
let _fbConnected = false, _listeners = []
export const getConnectionMode = () => _fbConnected ? 'cloud' : 'local'
export function onConnectionChange(cb) { _listeners.push(cb); return () => { _listeners = _listeners.filter(l => l !== cb) } }
function setConnected(v) { if (_fbConnected !== v) { _fbConnected = v; _listeners.forEach(cb => cb(v)) } }

// ── Init ────────────────────────────────────────────────────────
export async function initData() {
  Object.keys(SEED).forEach(k => { if (!load(k)) save(k, SEED[k]) })
  if (isFirebaseEnabled() && db) {
    try {
      const t = new Promise((_, r) => setTimeout(() => r(new Error('timeout')), 3000))
      const s = getDocs(collection(db, 'programs'))
      const snap = await Promise.race([s, t])
      if (snap.empty) {
        for (const k of Object.keys(SEED)) {
          const b = writeBatch(db); SEED[k].forEach(i => b.set(doc(db, k, String(i.id)), i)); await b.commit()
        }
      }
      setConnected(true)
    } catch { setConnected(false) }
  }
}

// ── CRUD ────────────────────────────────────────────────────────
export function getAll(col) { return load(col) || [] }
export function getById(col, id) { return getAll(col).find(i => i.id === id) || null }

export function create(col, item) {
  const items = getAll(col), maxId = items.reduce((m, i) => Math.max(m, i.id), 0)
  const newItem = { ...item, id: maxId + 1 }; items.push(newItem); save(col, items)
  if (_fbConnected && db) setDoc(doc(db, col, String(newItem.id)), newItem).catch(console.warn)
  return newItem
}

export function update(col, id, updates) {
  const items = getAll(col), idx = items.findIndex(i => i.id === id)
  if (idx === -1) return null; items[idx] = { ...items[idx], ...updates, id }; save(col, items)
  if (_fbConnected && db) setDoc(doc(db, col, String(id)), items[idx]).catch(console.warn)
  return items[idx]
}

export function remove(col, id) {
  save(col, getAll(col).filter(i => i.id !== id))
  if (_fbConnected && db) deleteDoc(doc(db, col, String(id))).catch(console.warn)
  return true
}

// ── Auth — Hybrid (Firebase when enabled, localStorage fallback) ─
const REGISTERED_USERS_KEY = 'cb_registered_users'

function getRegisteredUsers() {
  const defaults = [
    { email: 'admin@usl.edu.ph', password: 'admin123', name: 'Admin User', role: 'admin' },
    { email: 'staff@usl.edu.ph', password: 'staff123', name: 'Extension Staff', role: 'staff' },
    { email: 'volunteer@usl.edu.ph', password: 'volunteer123', name: 'Student Volunteer', role: 'volunteer' },
  ]
  const stored = load('registered_users')
  if (!stored) { save('registered_users', defaults); return defaults }
  return stored
}

export async function login(email, password) {
  // Try Firebase Auth first
  if (isFirebaseEnabled() && auth) {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      // Fetch user profile from Firestore
      const snap = await getDocs(query(collection(db, 'users'), where('email', '==', email)))
      let profile = { name: email.split('@')[0], role: 'volunteer' }
      snap.forEach(d => { profile = d.data() })
      const session = { ...profile, email, uid: cred.user.uid, loggedInAt: new Date().toISOString() }
      save('session', session)
      return session
    } catch (err) {
      throw new Error(err.code === 'auth/invalid-credential' ? 'Invalid email or password' : err.message)
    }
  }

  // Fallback: localStorage-based auth
  const users = getRegisteredUsers()
  const user = users.find(u => u.email === email)
  if (!user) throw new Error('Account not found. Please register first.')
  if (user.password !== password) throw new Error('Invalid password')
  const session = { name: user.name, email, role: user.role, loggedInAt: new Date().toISOString() }
  save('session', session)
  return session
}

export async function register(email, password, name, role = 'volunteer') {
  if (isFirebaseEnabled() && auth) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      const profile = { email, name, role, createdAt: new Date().toISOString() }
      await setDoc(doc(db, 'users', cred.user.uid), profile)
      const session = { ...profile, uid: cred.user.uid, loggedInAt: new Date().toISOString() }
      save('session', session)
      return session
    } catch (err) {
      throw new Error(err.code === 'auth/email-already-in-use' ? 'Email already registered' : err.message)
    }
  }

  // Fallback: localStorage
  const users = getRegisteredUsers()
  if (users.find(u => u.email === email)) throw new Error('Email already registered')
  const newUser = { email, password, name, role, createdAt: new Date().toISOString() }
  users.push(newUser); save('registered_users', users)
  const session = { name, email, role, loggedInAt: new Date().toISOString() }
  save('session', session)
  return session
}

export function logout() { localStorage.removeItem('cb_session'); if (isFirebaseEnabled() && auth) signOut(auth).catch(() => {}) }
export function getSession() { return load('session') }

export async function changePassword(email, currentPassword, newPassword) {
  if (newPassword.length < 6) throw new Error('New password must be at least 6 characters')
  // Firebase path
  if (isFirebaseEnabled() && auth) {
    try {
      await signInWithEmailAndPassword(auth, email, currentPassword)
      const { updatePassword } = await import('firebase/auth')
      await updatePassword(auth.currentUser, newPassword)
      return true
    } catch (err) {
      throw new Error(err.code === 'auth/invalid-credential' ? 'Current password is incorrect' : err.message)
    }
  }
  // localStorage path
  const users = getRegisteredUsers()
  const user = users.find(u => u.email === email)
  if (!user) throw new Error('Account not found')
  if (user.password !== currentPassword) throw new Error('Current password is incorrect')
  user.password = newPassword
  save('registered_users', users)
  return true
}

// ── Stats ───────────────────────────────────────────────────────
export function getDashboardStats() {
  const p = getAll('programs'), b = getAll('beneficiaries'), v = getAll('volunteers')
  const a = getAll('activities'), d = getAll('deployments'), pa = getAll('partners'), docs = getAll('documents')
  const tasks = getAll('tasks')
  return {
    totalPrograms: p.length, activePrograms: p.filter(x => x.status === 'Active').length,
    totalBeneficiaries: b.length, totalVolunteers: v.length, totalActivities: a.length,
    totalPartners: pa.length, totalDocuments: docs.length, totalDeployments: d.length,
    completedDeployments: d.filter(x => x.status === 'Completed').length,
    totalHours: d.reduce((s, x) => s + (x.hours || 0), 0),
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'Completed').length,
    inProgressTasks: tasks.filter(t => t.status === 'In Progress').length,
    pendingTasks: tasks.filter(t => t.status === 'Pending').length,
    programsByStatus: {
      Active: p.filter(x => x.status === 'Active').length,
      Planned: p.filter(x => x.status === 'Planned').length,
      Completed: p.filter(x => x.status === 'Completed').length,
    },
    recentActivities: a.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5),
  }
}

// ── Export/Import ───────────────────────────────────────────────
export function exportAllData() {
  const data = {}; Object.keys(SEED).forEach(k => { data[k] = getAll(k) }); return data
}
export function importData(json) {
  try {
    const d = typeof json === 'string' ? JSON.parse(json) : json
    Object.keys(d).forEach(k => { save(k, d[k]); if (_fbConnected && db) d[k].forEach(i => setDoc(doc(db, k, String(i.id)), i).catch(console.warn)) })
    return true
  } catch { return false }
}
export function resetData() { Object.keys(SEED).forEach(k => save(k, SEED[k])) }
