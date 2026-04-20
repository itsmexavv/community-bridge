/* ================================================================
   CommunityBridge — Data Store (localStorage-backed)
   All data is persisted in the browser. Replace this file with API
   calls when you connect a real backend (Node/Django + PostgreSQL).
   ================================================================ */

// ── Seed / Demo Data ────────────────────────────────────────────
const SEED = {
  programs: [
    { id: 1, title: 'Barangay Health Literacy Program', description: 'Health education sessions for rural barangays focusing on maternal care, nutrition, and first aid.', status: 'Active', sdgTags: ['SDG 3', 'SDG 10'], location: 'Brgy. San Vicente, Tuguegarao City', startDate: '2026-02-01', endDate: '2026-07-31', targetBeneficiaries: 200, coordinator: 'Leigh Amor Naval' },
    { id: 2, title: 'TechBridge Digital Literacy Workshop', description: 'Computer basics and internet safety workshops for out-of-school youth and senior citizens.', status: 'Active', sdgTags: ['SDG 4', 'SDG 10'], location: 'USL Extension Center', startDate: '2026-03-15', endDate: '2026-06-15', targetBeneficiaries: 80, coordinator: 'Xavier John Gacus' },
    { id: 3, title: 'GreenCampus Tree Planting Initiative', description: 'Community reforestation along riverbanks in partnership with DENR Region 02.', status: 'Planned', sdgTags: ['SDG 11', 'SDG 17'], location: 'Cagayan River Basin', startDate: '2026-06-01', endDate: '2026-06-30', targetBeneficiaries: 150, coordinator: 'Jones Nemesis Colobong' },
    { id: 4, title: 'Community Feeding Program', description: 'Monthly feeding sessions for malnourished children in partner barangays.', status: 'Completed', sdgTags: ['SDG 3', 'SDG 10'], location: 'Brgy. Atulayan, Tuguegarao City', startDate: '2025-08-01', endDate: '2025-12-31', targetBeneficiaries: 120, coordinator: 'Patrick Vince Tabanganay' },
    { id: 5, title: 'Livelihood Skills Training', description: 'Entrepreneurship and livelihood skills training for women in marginalized communities.', status: 'Active', sdgTags: ['SDG 4', 'SDG 10', 'SDG 17'], location: 'Brgy. Caggay, Tuguegarao City', startDate: '2026-01-15', endDate: '2026-05-30', targetBeneficiaries: 60, coordinator: 'Jon Jiro Perdido' },
  ],

  beneficiaries: [
    { id: 1, name: 'Maria Santos', age: 34, gender: 'Female', address: 'Brgy. San Vicente, Tuguegarao City', contact: '09171234567', programIds: [1, 4], registeredDate: '2026-02-05' },
    { id: 2, name: 'Juan Dela Cruz', age: 67, gender: 'Male', address: 'Brgy. Atulayan, Tuguegarao City', contact: '09281234567', programIds: [2], registeredDate: '2026-03-18' },
    { id: 3, name: 'Ana Reyes', age: 28, gender: 'Female', address: 'Brgy. Caggay, Tuguegarao City', contact: '09351234567', programIds: [5], registeredDate: '2026-01-20' },
    { id: 4, name: 'Pedro Bautista', age: 45, gender: 'Male', address: 'Brgy. Annafunan East, Tuguegarao City', contact: '09431234567', programIds: [1, 3], registeredDate: '2026-02-10' },
    { id: 5, name: 'Rosa Garcia', age: 52, gender: 'Female', address: 'Brgy. San Vicente, Tuguegarao City', contact: '09531234567', programIds: [4], registeredDate: '2025-08-15' },
    { id: 6, name: 'Carlos Mendoza', age: 19, gender: 'Male', address: 'Brgy. Caggay, Tuguegarao City', contact: '09631234567', programIds: [2, 5], registeredDate: '2026-03-20' },
    { id: 7, name: 'Elena Torres', age: 40, gender: 'Female', address: 'Brgy. Atulayan, Tuguegarao City', contact: '09731234567', programIds: [1], registeredDate: '2026-04-01' },
    { id: 8, name: 'Roberto Villanueva', age: 55, gender: 'Male', address: 'Brgy. Annafunan West, Tuguegarao City', contact: '09831234567', programIds: [3], registeredDate: '2026-05-12' },
  ],

  volunteers: [
    { id: 1, name: 'Leigh Amor Naval', email: 'leigh.naval@usl.edu.ph', course: 'BSIT', year: '4th Year', skills: ['Project Management', 'Documentation'], availability: 'MWF', deployments: 8 },
    { id: 2, name: 'Jones Nemesis Colobong', email: 'jones.colobong@usl.edu.ph', course: 'BSIT', year: '4th Year', skills: ['Community Organizing', 'Data Entry'], availability: 'TTh', deployments: 6 },
    { id: 3, name: 'Xavier John Gacus', email: 'xavier.gacus@usl.edu.ph', course: 'BSIT', year: '4th Year', skills: ['Web Development', 'Technical Support'], availability: 'MWF', deployments: 10 },
    { id: 4, name: 'Jon Jiro Perdido', email: 'jon.perdido@usl.edu.ph', course: 'BSIT', year: '4th Year', skills: ['Teaching', 'First Aid'], availability: 'Sat', deployments: 5 },
    { id: 5, name: 'Patrick Vince Tabanganay', email: 'patrick.tabanganay@usl.edu.ph', course: 'BSIT', year: '4th Year', skills: ['Photography', 'Report Writing'], availability: 'TTh-Sat', deployments: 7 },
    { id: 6, name: 'Angela Reyes', email: 'angela.reyes@usl.edu.ph', course: 'BSN', year: '3rd Year', skills: ['Health Education', 'First Aid'], availability: 'MWF', deployments: 4 },
    { id: 7, name: 'Mark Dela Peña', email: 'mark.delapena@usl.edu.ph', course: 'BSED', year: '3rd Year', skills: ['Teaching', 'Tutoring'], availability: 'TTh', deployments: 3 },
  ],

  activities: [
    { id: 1, programId: 1, title: 'Maternal Health Seminar', date: '2026-02-15', location: 'Brgy. San Vicente Hall', description: 'Seminar on prenatal care and safe delivery practices.', participants: 45, facilitator: 'Leigh Amor Naval' },
    { id: 2, programId: 2, title: 'Basic Computer Operations Workshop', date: '2026-03-20', location: 'USL Computer Lab 3', description: 'Hands-on session on using Microsoft Office and email.', participants: 25, facilitator: 'Xavier John Gacus' },
    { id: 3, programId: 1, title: 'Nutrition and Child Care Session', date: '2026-03-10', location: 'Brgy. San Vicente Health Center', description: 'Workshop on balanced diet and child nutrition for mothers.', participants: 38, facilitator: 'Angela Reyes' },
    { id: 4, programId: 5, title: 'Business Plan Writing Workshop', date: '2026-02-20', location: 'Brgy. Caggay Multi-Purpose Hall', description: 'Training on writing simple business plans for micro-enterprises.', participants: 30, facilitator: 'Jon Jiro Perdido' },
    { id: 5, programId: 4, title: 'Monthly Feeding — November', date: '2025-11-15', location: 'Brgy. Atulayan Covered Court', description: 'Prepared and served nutritious meals to 35 children.', participants: 35, facilitator: 'Patrick Vince Tabanganay' },
    { id: 6, programId: 2, title: 'Internet Safety and Social Media Awareness', date: '2026-04-05', location: 'USL Extension Center', description: 'Session on online safety, scam awareness, and responsible social media use.', participants: 20, facilitator: 'Xavier John Gacus' },
  ],

  partners: [
    { id: 1, name: 'DENR Region 02', type: 'Government Agency', contactPerson: 'Engr. Roberto Cruz', email: 'denr02@denr.gov.ph', phone: '(078) 844-1234', moaStatus: 'Active', moaExpiry: '2027-12-31' },
    { id: 2, name: 'LGU Tuguegarao City', type: 'Local Government', contactPerson: 'Hon. Maria Lopez', email: 'lgu.tuguegarao@gmail.com', phone: '(078) 844-5678', moaStatus: 'Active', moaExpiry: '2027-06-30' },
    { id: 3, name: 'Philippine Red Cross — Cagayan Chapter', type: 'NGO', contactPerson: 'Dr. Carlos Mendez', email: 'prc.cagayan@redcross.org.ph', phone: '(078) 844-9012', moaStatus: 'Active', moaExpiry: '2026-12-31' },
    { id: 4, name: 'Cagayan Valley Medical Center', type: 'Hospital', contactPerson: 'Dr. Elena Pascual', email: 'cvmc.info@doh.gov.ph', phone: '(078) 844-3456', moaStatus: 'For Renewal', moaExpiry: '2026-05-31' },
  ],

  deployments: [
    { id: 1, volunteerId: 1, programId: 1, date: '2026-02-15', hours: 4, status: 'Completed' },
    { id: 2, volunteerId: 3, programId: 2, date: '2026-03-20', hours: 6, status: 'Completed' },
    { id: 3, volunteerId: 6, programId: 1, date: '2026-03-10', hours: 4, status: 'Completed' },
    { id: 4, volunteerId: 4, programId: 5, date: '2026-02-20', hours: 5, status: 'Completed' },
    { id: 5, volunteerId: 5, programId: 4, date: '2025-11-15', hours: 6, status: 'Completed' },
    { id: 6, volunteerId: 3, programId: 2, date: '2026-04-05', hours: 4, status: 'Completed' },
    { id: 7, volunteerId: 2, programId: 3, date: '2026-06-05', hours: 0, status: 'Scheduled' },
    { id: 8, volunteerId: 7, programId: 2, date: '2026-04-15', hours: 0, status: 'Scheduled' },
  ],
};

// ── Helper: Load/Save ───────────────────────────────────────────
function load(key) {
  try {
    const raw = localStorage.getItem(`cb_${key}`);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function save(key, data) {
  localStorage.setItem(`cb_${key}`, JSON.stringify(data));
}

// ── Initialize data if empty ────────────────────────────────────
export function initData() {
  Object.keys(SEED).forEach(key => {
    if (!load(key)) save(key, SEED[key]);
  });
}

// ── CRUD Operations ─────────────────────────────────────────────
// These functions mirror what your backend API endpoints would do.
// When you add a real backend, replace these with fetch() calls.

export function getAll(collection) {
  return load(collection) || [];
}

export function getById(collection, id) {
  const items = getAll(collection);
  return items.find(item => item.id === id) || null;
}

export function create(collection, item) {
  const items = getAll(collection);
  const maxId = items.reduce((max, i) => Math.max(max, i.id), 0);
  const newItem = { ...item, id: maxId + 1 };
  items.push(newItem);
  save(collection, items);
  return newItem;
}

export function update(collection, id, updates) {
  const items = getAll(collection);
  const index = items.findIndex(item => item.id === id);
  if (index === -1) return null;
  items[index] = { ...items[index], ...updates, id };
  save(collection, items);
  return items[index];
}

export function remove(collection, id) {
  const items = getAll(collection).filter(item => item.id !== id);
  save(collection, items);
  return true;
}

// ── Auth (Mock) ─────────────────────────────────────────────────
// Replace with real JWT authentication when backend is ready.

export function login(email, password) {
  // Mock authentication — accepts any credentials
  const mockUsers = {
    'admin@usl.edu.ph': { name: 'Admin User', role: 'admin' },
    'staff@usl.edu.ph': { name: 'Extension Staff', role: 'staff' },
    'volunteer@usl.edu.ph': { name: 'Student Volunteer', role: 'volunteer' },
  };
  const user = mockUsers[email];
  if (user) {
    const session = { ...user, email, loggedInAt: new Date().toISOString() };
    save('session', session);
    return session;
  }
  // Accept any email as staff for demo purposes
  const session = { name: email.split('@')[0], email, role: 'staff', loggedInAt: new Date().toISOString() };
  save('session', session);
  return session;
}

export function logout() {
  localStorage.removeItem('cb_session');
}

export function getSession() {
  return load('session');
}

// ── Stats ───────────────────────────────────────────────────────
export function getDashboardStats() {
  const programs = getAll('programs');
  const beneficiaries = getAll('beneficiaries');
  const volunteers = getAll('volunteers');
  const activities = getAll('activities');
  const deployments = getAll('deployments');
  const partners = getAll('partners');

  return {
    totalPrograms: programs.length,
    activePrograms: programs.filter(p => p.status === 'Active').length,
    totalBeneficiaries: beneficiaries.length,
    totalVolunteers: volunteers.length,
    totalActivities: activities.length,
    totalPartners: partners.length,
    totalDeployments: deployments.length,
    completedDeployments: deployments.filter(d => d.status === 'Completed').length,
    totalHours: deployments.reduce((sum, d) => sum + (d.hours || 0), 0),
    programsByStatus: {
      Active: programs.filter(p => p.status === 'Active').length,
      Planned: programs.filter(p => p.status === 'Planned').length,
      Completed: programs.filter(p => p.status === 'Completed').length,
    },
    recentActivities: activities.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5),
  };
}

// ── Reset to demo data ──────────────────────────────────────────
export function resetData() {
  Object.keys(SEED).forEach(key => save(key, SEED[key]));
}
