const KEY = 'northlight-crm-demo-v2'

const seedLeads = [
  { id: 'demo-1', name: 'Aarav Sharma', email: 'aarav@greenleaf.tech', phone: '+91 98765 43210', company: 'GreenLeaf Technologies', project: 'E-commerce Website', source: 'Website', status: 'New', priority: 'High', notes: [], followUpDate: '2026-09-08', createdAt: '2026-09-04T09:20:00Z' },
  { id: 'demo-2', name: 'Priya Nair', email: 'priya@pixelcraft.studio', phone: '+91 98450 12345', company: 'PixelCraft Studio', project: 'Brand Website', source: 'Referral', status: 'Contacted', priority: 'Medium', notes: [{ id: 'demo-note-2', text: 'Discovery call completed. Preparing a proposal for the brand website.', createdAt: '2026-09-03T10:00:00Z' }], followUpDate: '2026-09-10', createdAt: '2026-09-02T14:45:00Z' },
  { id: 'demo-3', name: 'Rahul Verma', email: 'rahul@novadigital.in', phone: '+91 99887 66554', company: 'Nova Digital', project: 'CRM Development', source: 'LinkedIn', status: 'Converted', priority: 'High', notes: [{ id: 'demo-note-3', text: 'Contract signed. Move the account into onboarding.', createdAt: '2026-08-30T12:30:00Z' }], followUpDate: '2026-09-15', createdAt: '2026-08-25T08:10:00Z' },
  { id: 'demo-4', name: 'Meera Kapoor', email: 'meera@brightpath.co', phone: '+91 98111 22334', company: 'BrightPath Consulting', project: 'Marketing Automation', source: 'Website', status: 'New', priority: 'Medium', notes: [], followUpDate: '', createdAt: '2026-09-01T11:30:00Z' },
  { id: 'demo-5', name: 'Daniel Brooks', email: 'daniel@orbitworks.com', phone: '+1 415 555 0199', company: 'Orbit Works', project: 'Product Design Sprint', source: 'Other', status: 'Contacted', priority: 'Low', notes: [], followUpDate: '2026-09-12', createdAt: '2026-08-29T16:00:00Z' }
]

function read() {
  const saved = localStorage.getItem(KEY)
  return saved ? JSON.parse(saved) : seedLeads
}
function write(leads) { localStorage.setItem(KEY, JSON.stringify(leads)); return leads }
export const demoService = {
  list: () => read(),
  create: (lead) => { const next = { ...lead, id: crypto.randomUUID(), createdAt: new Date().toISOString(), notes: [] }; write([next, ...read()]); return next },
  update: (id, changes) => { const next = read().map((lead) => lead.id === id ? { ...lead, ...changes } : lead); write(next); return next.find((lead) => lead.id === id) },
  remove: (id) => write(read().filter((lead) => lead.id !== id)),
  addNote: (id, text) => { const lead = read().find((item) => item.id === id); return demoService.update(id, { notes: [...(lead?.notes || []), { id: crypto.randomUUID(), text, createdAt: new Date().toISOString() }] }) },
  removeNote: (leadId, noteId) => { const lead = read().find((item) => item.id === leadId); return demoService.update(leadId, { notes: lead.notes.filter((note) => note.id !== noteId) }) },
  reset: () => write(seedLeads)
}
