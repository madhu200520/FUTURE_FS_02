import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BarChart3,
  Bell,
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  CircleUserRound,
  ClipboardList,
  Globe2,
  LayoutDashboard,
  LogOut,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Trash2,
  TrendingUp,
  UserRound,
  X,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { demoService } from "./services/demoService";
import AnalyticsEnhanced from "./components/AnalyticsEnhanced";
import "./styles.css";

const nav = [
  {
    id: "dashboard",
    label: "Pipeline Leads",
    icon: LayoutDashboard,
    group: "WORKSPACE",
  },
  {
    id: "analytics",
    label: "Performance & Funnel",
    icon: BarChart3,
    group: "WORKSPACE",
  },
  {
    id: "alerts",
    label: "Email Alerts Log",
    icon: Bell,
    group: "AUTOMATIONS & REPORTS",
  },
  {
    id: "public",
    label: "Client Public Site",
    icon: Globe2,
    group: "AUTOMATIONS & REPORTS",
  },
];
const blankLead = {
  name: "",
  email: "",
  phone: "",
  company: "",
  project: "",
  source: "Website",
  status: "New",
  priority: "Medium",
  followUpDate: "",
};
const colors = { New: "#efb464", Contacted: "#60a5a0", Converted: "#e27d60" };
const fmtDate = (date) =>
  date
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(date))
    : "Not scheduled";
const initials = (name) =>
  name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => sessionStorage.getItem("northlight-auth") === "true",
  );
  const [page, setPage] = useState(() =>
    window.location.search.includes("public=true") ? "public" : "dashboard",
  );
  const [leads, setLeads] = useState([]);
  const [selected, setSelected] = useState(null);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState("");
  useEffect(() => setLeads(demoService.list()), []);
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(""), 2800);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  const refresh = () => setLeads(demoService.list());
  const notify = (message) => setToast(message);
  if (page === "public")
    return (
      <PublicSite
        onBack={() => setPage("dashboard")}
        onSubmit={(data) => {
          demoService.create({
            ...data,
            status: "New",
            priority: "Medium",
            source: "Website",
            followUpDate: "",
          });
          refresh();
          notify("Inquiry added to your pipeline");
        }}
      />
    );
  if (!isLoggedIn)
    return (
      <Login
        onPublicSite={() => setPage("public")}
        onLogin={() => {
          sessionStorage.setItem("northlight-auth", "true");
          setIsLoggedIn(true);
        }}
      />
    );
  return (
    <div className="app-shell">
      <Sidebar
        page={page}
        setPage={setPage}
        onLogout={() => {
          sessionStorage.removeItem("northlight-auth");
          setIsLoggedIn(false);
        }}
      />
      <main className="main-content">
        <header className="topbar">
          <button className="icon-button mobile-menu">
            <Menu size={20} />
          </button>
          <div className="breadcrumb">
            <span>Workspace</span>
            <ChevronRight size={14} />
            <strong>{nav.find((item) => item.id === page)?.label}</strong>
          </div>
          <div className="top-actions">
            <span className="demo-pill">
              <span></span> Demo mode
            </span>
            <button className="icon-button">
              <Bell size={18} />
            </button>
            <div className="mini-avatar">M</div>
          </div>
        </header>
        {page === "dashboard" && (
          <Dashboard
            leads={leads}
            onCreate={() => setModal({ type: "create" })}
            onSelect={(lead) => setSelected(lead)}
            onUpdate={(id, changes) => {
              demoService.update(id, changes);
              refresh();
              notify("Lead updated");
            }}
          />
        )}
        {page === "analytics" && (
          <AnalyticsEnhanced
            leads={leads}
            onCreate={() => setModal({ type: "create" })}
            onSelect={(lead) => lead && setSelected(lead)}
            onNavigate={(nextPage, action) => {
              setPage(nextPage);
              if (action === "schedule") {
                const target = leads.find((lead) => !lead.followUpDate);
                if (target) setSelected(target);
              }
            }}
            onPublicSite={() => setPage("public")}
          />
        )}
        {page === "alerts" && <Alerts leads={leads} />}
      </main>
      {selected && (
        <LeadDetails
          lead={selected}
          onClose={() => setSelected(null)}
          onEdit={() => {
            setSelected(null);
            setModal({ type: "edit", lead: selected });
          }}
          onRefresh={(message) => {
            refresh();
            setSelected(
              demoService.list().find((lead) => lead.id === selected.id),
            );
            notify(message);
          }}
          onDelete={() => {
            demoService.remove(selected.id);
            setSelected(null);
            refresh();
            notify("Lead deleted");
          }}
        />
      )}
      {modal?.type === "create" && (
        <LeadForm
          onClose={() => setModal(null)}
          onSave={(data) => {
            demoService.create(data);
            refresh();
            setModal(null);
            notify("New lead added");
          }}
        />
      )}
      {modal?.type === "edit" && (
        <LeadForm
          lead={modal.lead}
          onClose={() => setModal(null)}
          onSave={(data) => {
            demoService.update(data.id, data);
            refresh();
            setModal(null);
            notify("Lead updated");
          }}
        />
      )}
      {toast && (
        <div className="toast">
          <Check size={16} />
          {toast}
        </div>
      )}
    </div>
  );
}

function Login({ onLogin, onPublicSite }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const submit = () => {
    setError("Use Try Demo to enter the fictional recruiter workspace.");
  };
  return (
    <div className="login-page">
      <div className="login-art">
        <div className="brand-mark large">N</div>
        <div>
          <p className="eyebrow">NORTHLIGHT CRM</p>
          <h1>
            Make every
            <br />
            <em>conversation</em> count.
          </h1>
          <p className="login-copy">
            A calmer, clearer way to turn promising conversations into lasting
            client relationships.
          </p>
        </div>
        <div className="art-footer">
          Client lead management system <span>•</span> 2026
        </div>
      </div>
      <div className="login-panel">
        <div className="login-form">
          <div className="brand-line">
            <div className="brand-mark">N</div>
            <span>Northlight</span>
          </div>
          <p className="eyebrow">RECRUITER DEMO</p>
          <h2>Welcome back</h2>
          <p className="muted">Explore the interactive client lead management system.</p>
          <label>
            Email address
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              autoComplete="username"
            />
          </label>
          <label>
            Password
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              autoComplete="current-password"
            />
          </label>
          <button className="primary-button full" onClick={submit}>
            Sign in <ChevronRight size={17} />
          </button>
          <button className="ghost-button full demo-login-button" onClick={() => { setError(""); onLogin(); }}>
            <Sparkles size={16} /> Try Demo
          </button>
          {error && <p className="form-error">{error}</p>}
          <p className="demo-hint">
            <Sparkles size={14} /> DEMO MODE · fictional data only
          </p>
          <button className="public-link login-public-link" onClick={onPublicSite}>Explore public client site <ChevronRight size={15} /></button>
        </div>
      </div>
    </div>
  );
}

function Sidebar({ page, setPage, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark">N</div>
        <div>
          <strong>Northlight</strong>
          <small>CRM workspace</small>
        </div>
      </div>
      <div className="sidebar-nav">
        {["WORKSPACE", "AUTOMATIONS & REPORTS"].map((group) => (
          <div className="nav-group" key={group}>
            <p>{group}</p>
            {nav
              .filter((item) => item.group === group)
              .map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    className={
                      page === item.id ? "nav-item active" : "nav-item"
                    }
                    onClick={() => setPage(item.id)}
                  >
                    <Icon size={18} />
                    {item.label}
                    {item.id === "dashboard" && (
                      <span className="nav-count">
                        {demoService.list().length}
                      </span>
                    )}
                  </button>
                );
              })}
          </div>
        ))}
      </div>
      <div className="sidebar-bottom">
        <div className="profile">
          <div className="avatar">MS</div>
          <div>
            <strong>Demo workspace</strong>
            <small>Administrator</small>
          </div>
          <MoreHorizontal size={17} />
        </div>
        <button className="signout" onClick={onLogout}>
          <LogOut size={17} /> Sign out
        </button>
      </div>
    </aside>
  );
}

function Dashboard({ leads, onCreate, onSelect, onUpdate }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [priority, setPriority] = useState("All");
  const stats = ["Total inquiries", "New", "Contacted", "Converted"].map(
    (label) => ({
      label,
      value:
        label === "Total inquiries"
          ? leads.length
          : leads.filter((lead) => lead.status === label).length,
    }),
  );
  const filtered = leads.filter(
    (lead) =>
      `${lead.name} ${lead.email} ${lead.company} ${lead.project}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (status === "All" || lead.status === status) &&
      (priority === "All" || lead.priority === priority),
  );
  const upcoming = leads
    .filter((lead) => lead.followUpDate)
    .sort((a, b) => new Date(a.followUpDate) - new Date(b.followUpDate))
    .slice(0, 3);
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">TUESDAY, SEPTEMBER 6, 2026</p>
          <h1>
            Good morning <span>✦</span>
          </h1>
          <p className="muted">Here’s what’s moving in your pipeline today.</p>
        </div>
        <button className="primary-button" onClick={onCreate}>
          <Plus size={18} /> Add lead
        </button>
      </div>
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div className="stat-card" key={stat.label}>
            <div className={`stat-icon stat-${index}`}>
              <TrendingUp size={17} />
            </div>
            <p>{stat.label}</p>
            <strong>{stat.value}</strong>
            <small>
              {index === 0 ? "Across all stages" : "of total pipeline"}
            </small>
          </div>
        ))}
      </div>
      <div className="content-grid">
        <section className="panel leads-panel">
          <div className="panel-heading">
            <div>
              <h2>Pipeline leads</h2>
              <p className="muted">Manage and track every opportunity.</p>
            </div>
            <button className="ghost-button" onClick={onCreate}>
              <Plus size={16} /> New lead
            </button>
          </div>
          <div className="filters">
            <div className="search-box">
              <Search size={17} />
              <input
                placeholder="Search leads..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option>All statuses</option>
              <option>New</option>
              <option>Contacted</option>
              <option>Converted</option>
            </select>
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
            >
              <option>All priorities</option>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Lead</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Follow-up</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead) => (
                  <tr key={lead.id} onClick={() => onSelect(lead)}>
                    <td>
                      <div className="lead-cell">
                        <div className="lead-avatar">{initials(lead.name)}</div>
                        <div>
                          <strong>{lead.name}</strong>
                          <small>{lead.email}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      {lead.company}
                      <small className="table-sub">{lead.project}</small>
                    </td>
                    <td>
                      <span
                        className={`badge badge-${lead.status.toLowerCase()}`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`priority priority-${lead.priority.toLowerCase()}`}
                      >
                        <span></span>
                        {lead.priority}
                      </span>
                    </td>
                    <td>
                      {lead.followUpDate ? (
                        fmtDate(lead.followUpDate)
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                    <td>
                      <button
                        className="row-menu"
                        onClick={(event) => {
                          event.stopPropagation();
                          onUpdate(lead.id, {
                            status:
                              lead.status === "New"
                                ? "Contacted"
                                : lead.status === "Contacted"
                                  ? "Converted"
                                  : "New",
                          });
                        }}
                      >
                        <MoreHorizontal size={17} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="empty-state">
                <ClipboardList size={30} />
                <strong>No leads found</strong>
                <span>Try adjusting your search or filters.</span>
              </div>
            )}
          </div>
        </section>
        <aside className="side-stack">
          <section className="panel">
            <div className="panel-heading compact">
              <div>
                <h2>Upcoming follow-ups</h2>
                <p className="muted">Keep conversations moving.</p>
              </div>
              <CalendarDays size={18} className="heading-icon" />
            </div>
            {upcoming.length ? (
              upcoming.map((lead) => (
                <div
                  className="follow-up"
                  key={lead.id}
                  onClick={() => onSelect(lead)}
                >
                  <div className="date-box">
                    <strong>{new Date(lead.followUpDate).getDate()}</strong>
                    <span>
                      {new Intl.DateTimeFormat("en-US", {
                        month: "short",
                      }).format(new Date(lead.followUpDate))}
                    </span>
                  </div>
                  <div>
                    <strong>{lead.name}</strong>
                    <small>{lead.company}</small>
                  </div>
                  <ChevronRight size={16} />
                </div>
              ))
            ) : (
              <div className="small-empty">No follow-ups scheduled.</div>
            )}
          </section>
          <section className="accent-panel">
            <div className="accent-icon">
              <Sparkles size={18} />
            </div>
            <h3>Share your public site</h3>
            <p>Let new clients find their way into your pipeline.</p>
            <button onClick={() => window.open("/?public=true", "_blank")}>
              View client site <ChevronRight size={15} />
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Analytics({ leads }) {
  const total = leads.length;
  const converted = leads.filter((lead) => lead.status === "Converted").length;
  const contacted = leads.filter((lead) => lead.status === "Contacted").length;
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const key = date.toISOString().slice(0, 10);
    return {
      day: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date),
      count: leads.filter((lead) => lead.createdAt.slice(0, 10) === key).length,
    };
  });
  const distribution = ["New", "Contacted", "Converted"].map((name) => ({
    name,
    value: leads.filter((lead) => lead.status === name).length,
  }));
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">PERFORMANCE OVERVIEW</p>
          <h1>Performance & funnel</h1>
          <p className="muted">
            A clear view of momentum across your client journey.
          </p>
        </div>
        <div className="date-control">
          <CalendarDays size={16} /> Last 7 days
        </div>
      </div>
      <section className="funnel-panel">
        <div className="panel-heading">
          <div>
            <h2>Pipeline conversion funnel</h2>
            <p className="muted">From first conversation to retained client.</p>
          </div>
          <TrendingUp size={20} className="heading-icon" />
        </div>
        <div className="funnel">
          {[
            ["01", "Intake", "Total inquiries", total, 100],
            [
              "02",
              "Scoping",
              "Contacted leads",
              contacted,
              total ? Math.round((contacted / total) * 100) : 0,
            ],
            [
              "03",
              "Retained",
              "Converted clients",
              converted,
              total ? Math.round((converted / total) * 100) : 0,
            ],
          ].map(([number, title, label, value, percent]) => (
            <div className="funnel-stage" key={title}>
              <div className="stage-top">
                <span>{number}</span>
                <small>{percent}% of intake</small>
              </div>
              <div className="stage-bar">
                <div
                  style={{
                    width: `${Math.max(percent, 5)}%`,
                    background:
                      colors[
                        title === "Intake"
                          ? "New"
                          : title === "Scoping"
                            ? "Contacted"
                            : "Converted"
                      ],
                  }}
                />
              </div>
              <strong>{title}</strong>
              <p>{label}</p>
              <b>{value}</b>
            </div>
          ))}
        </div>
      </section>
      <div className="analytics-grid">
        <section className="panel chart-panel">
          <div className="panel-heading compact">
            <div>
              <h2>Intake velocity</h2>
              <p className="muted">Incoming leads over recent days.</p>
            </div>
            <span className="chart-legend">
              <i></i> New inquiries
            </span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart
              data={days}
              margin={{ top: 12, right: 10, bottom: 0, left: -24 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e8e9e4"
              />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#8b918a", fontSize: 12 }}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#8b918a", fontSize: 12 }}
              />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#e27d60"
                strokeWidth={3}
                dot={{ fill: "#fff", stroke: "#e27d60", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </section>
        <section className="panel chart-panel">
          <div className="panel-heading compact">
            <div>
              <h2>Stage distribution</h2>
              <p className="muted">Current lead volume by stage.</p>
            </div>
          </div>
          <div className="donut-wrap">
            <ResponsiveContainer width="50%" height={190}>
              <PieChart>
                <Pie
                  data={distribution}
                  innerRadius={55}
                  outerRadius={78}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {distribution.map((entry) => (
                    <Cell key={entry.name} fill={colors[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="legend-list">
              {distribution.map((item) => (
                <div key={item.name}>
                  <span style={{ background: colors[item.name] }}></span>
                  <p>
                    {item.name}
                    <strong>{item.value}</strong>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
      <section className="summary-grid">
        <div>
          <span>Total leads</span>
          <strong>{total}</strong>
        </div>
        <div>
          <span>Open leads</span>
          <strong>{total - converted}</strong>
        </div>
        <div>
          <span>Contacted rate</span>
          <strong>{total ? Math.round((contacted / total) * 100) : 0}%</strong>
        </div>
        <div>
          <span>Conversion rate</span>
          <strong>{total ? Math.round((converted / total) * 100) : 0}%</strong>
        </div>
        <div>
          <span>Converted clients</span>
          <strong>{converted}</strong>
        </div>
      </section>
    </div>
  );
}

function Alerts({ leads }) {
  const alerts = leads
    .flatMap((lead) => [
      {
        date: lead.createdAt,
        lead: lead.name,
        email: lead.email,
        event: "New inquiry received",
        status: "Logged",
      },
      ...(lead.status !== "New"
        ? [
            {
              date: lead.createdAt,
              lead: lead.name,
              email: lead.email,
              event: "Lead contacted",
              status: "Logged",
            },
          ]
        : []),
      ...(lead.followUpDate
        ? [
            {
              date: lead.followUpDate,
              lead: lead.name,
              email: lead.email,
              event: "Follow-up reminder",
              status: "Scheduled",
            },
          ]
        : []),
    ])
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">ACTIVITY LOG</p>
          <h1>Email alerts</h1>
          <p className="muted">
            A transparent record of lead communication events.
          </p>
        </div>
      </div>
      <section className="panel leads-panel">
        <div className="notice">
          <Bell size={17} />
          <span>Demo mode records events locally. No emails are sent.</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Lead</th>
                <th>Email</th>
                <th>Event</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert, index) => (
                <tr key={`${alert.date}-${index}`}>
                  <td>{fmtDate(alert.date)}</td>
                  <td>
                    <strong>{alert.lead}</strong>
                  </td>
                  <td>{alert.email}</td>
                  <td>{alert.event}</td>
                  <td>
                    <span className="badge badge-logged">{alert.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function LeadForm({ lead, onClose, onSave }) {
  const [form, setForm] = useState(lead || blankLead);
  const change = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));
  return (
    <div className="modal-backdrop">
      <div className="modal large-modal">
        <div className="modal-header">
          <div>
            <p className="eyebrow">PIPELINE</p>
            <h2>{lead ? "Edit lead" : "Add new lead"}</h2>
          </div>
          <button className="icon-button" onClick={onClose}>
            <X size={19} />
          </button>
        </div>
        <div className="form-grid">
          <label>
            Full name *
            <input
              value={form.name}
              onChange={(event) => change("name", event.target.value)}
              autoFocus
            />
          </label>
          <label>
            Email address *
            <input
              type="email"
              value={form.email}
              onChange={(event) => change("email", event.target.value)}
            />
          </label>
          <label>
            Phone
            <input
              value={form.phone}
              onChange={(event) => change("phone", event.target.value)}
            />
          </label>
          <label>
            Company
            <input
              value={form.company}
              onChange={(event) => change("company", event.target.value)}
            />
          </label>
          <label className="wide">
            Project / inquiry *
            <input
              value={form.project}
              onChange={(event) => change("project", event.target.value)}
            />
          </label>
          <label>
            Source
            <select
              value={form.source}
              onChange={(event) => change("source", event.target.value)}
            >
              <option>Website</option>
              <option>LinkedIn</option>
              <option>Referral</option>
              <option>Other</option>
            </select>
          </label>
          <label>
            Status
            <select
              value={form.status}
              onChange={(event) => change("status", event.target.value)}
            >
              <option>New</option>
              <option>Contacted</option>
              <option>Converted</option>
            </select>
          </label>
          <label>
            Priority
            <select
              value={form.priority}
              onChange={(event) => change("priority", event.target.value)}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </label>
          <label>
            Follow-up date
            <input
              type="date"
              value={form.followUpDate}
              onChange={(event) => change("followUpDate", event.target.value)}
            />
          </label>
        </div>
        <div className="modal-actions">
          <button className="ghost-button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="primary-button"
            disabled={!form.name || !form.email || !form.project}
            onClick={() => onSave(form)}
          >
            {lead ? "Save changes" : "Create lead"}
          </button>
        </div>
      </div>
    </div>
  );
}

function LeadDetails({ lead, onClose, onEdit, onRefresh, onDelete }) {
  const [note, setNote] = useState("");
  const [editingFollowUp, setEditingFollowUp] = useState(false);
  return (
    <div className="modal-backdrop">
      <div className="modal detail-modal">
        <div className="modal-header">
          <div className="detail-person">
            <div className="lead-avatar large-avatar">
              {initials(lead.name)}
            </div>
            <div>
              <p className="eyebrow">LEAD DETAILS</p>
              <h2>{lead.name}</h2>
              <p className="muted">{lead.company}</p>
            </div>
          </div>
          <button className="icon-button" onClick={onClose}>
            <X size={19} />
          </button>
        </div>
        <div className="detail-body">
          <div className="detail-main">
            <div className="detail-badges">
              <span className={`badge badge-${lead.status.toLowerCase()}`}>
                {lead.status}
              </span>
              <span
                className={`priority priority-${lead.priority.toLowerCase()}`}
              >
                <span></span>
                {lead.priority} priority
              </span>
            </div>
            <div className="detail-section">
              <p className="eyebrow">PROJECT INQUIRY</p>
              <h3>{lead.project}</h3>
              <div className="info-grid">
                <div>
                  <small>Email</small>
                  <strong>{lead.email}</strong>
                </div>
                <div>
                  <small>Phone</small>
                  <strong>{lead.phone || "Not provided"}</strong>
                </div>
                <div>
                  <small>Source</small>
                  <strong>{lead.source}</strong>
                </div>
                <div>
                  <small>Created</small>
                  <strong>{fmtDate(lead.createdAt)}</strong>
                </div>
              </div>
            </div>
            <div className="detail-section">
              <div className="section-title">
                <p className="eyebrow">NOTES</p>
                <span>{lead.notes.length}</span>
              </div>
              {lead.notes.map((item) => (
                <div className="note-item" key={item.id}>
                  <p>{item.text}</p>
                  <button
                    className="delete-icon"
                    onClick={() =>
                      onRefresh(
                        (demoService.removeNote(lead.id, item.id),
                        "Note removed"),
                      )
                    }
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
              <div className="note-input">
                <input
                  placeholder="Add a note..."
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                />
                <button
                  className="primary-button"
                  disabled={!note.trim()}
                  onClick={() => {
                    demoService.addNote(lead.id, note.trim());
                    setNote("");
                    onRefresh("Note added");
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
          <aside className="detail-side">
            <div className="followup-card">
              <CalendarDays size={19} />
              <p className="eyebrow">FOLLOW-UP</p>
              <strong>
                {lead.followUpDate
                  ? fmtDate(lead.followUpDate)
                  : "Not scheduled"}
              </strong>
              <button
                className="ghost-button"
                onClick={() => setEditingFollowUp(!editingFollowUp)}
              >
                {editingFollowUp ? "Cancel" : "Change date"}
              </button>
              {editingFollowUp && (
                <input
                  type="date"
                  defaultValue={lead.followUpDate}
                  onChange={(event) => {
                    demoService.update(lead.id, {
                      followUpDate: event.target.value,
                    });
                    onRefresh("Follow-up updated");
                    setEditingFollowUp(false);
                  }}
                />
              )}
            </div>
            <div className="detail-actions">
              <button className="ghost-button" onClick={onEdit}>
                <Settings2 size={16} /> Edit lead
              </button>
              <button className="danger-button" onClick={onDelete}>
                <Trash2 size={16} /> Delete lead
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function PublicSite({ onBack, onSubmit }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    project: "",
    budget: "",
    preferredContact: "Email",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const change = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));
  return (
    <div className="public-site">
      <nav className="public-nav">
        <div className="brand-line">
          <div className="brand-mark">N</div>
          <span>Northlight</span>
        </div>
        <button className="public-link" onClick={onBack}>
          Admin portal <ChevronRight size={16} />
        </button>
      </nav>
      <div className="public-hero">
        <div className="hero-copy">
          <p className="eyebrow">NORTHLIGHT STUDIO</p>
          <h1>
            Let’s build something <em>great</em> together.
          </h1>
          <p>
            Tell us about your project and we'll get back to you within two
            business days.
          </p>
          <div className="hero-meta">
            <span>
              <Check size={15} /> Thoughtful strategy
            </span>
            <span>
              <Check size={15} /> Crafted with care
            </span>
          </div>
        </div>
        <div className="inquiry-card">
          {submitted ? (
            <div className="success-state">
              <div className="success-icon">
                <Check size={24} />
              </div>
              <h2>Thank you!</h2>
              <p>
                Your inquiry has been submitted successfully. We'll be in touch
                soon.
              </p>
              <button
                className="ghost-button"
                onClick={() => setSubmitted(false)}
              >
                Submit another inquiry
              </button>
            </div>
          ) : (
            <>
              <div className="form-heading">
                <p className="eyebrow">START A CONVERSATION</p>
                <h2>Tell us about your project</h2>
              </div>
              <div className="form-grid">
                <label>
                  Name *
                  <input
                    value={form.name}
                    onChange={(event) => change("name", event.target.value)}
                  />
                </label>
                <label>
                  Email *
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => change("email", event.target.value)}
                  />
                </label>
                <label>
                  Phone
                  <input
                    value={form.phone}
                    onChange={(event) => change("phone", event.target.value)}
                  />
                </label>
                <label>
                  Company
                  <input
                    value={form.company}
                    onChange={(event) => change("company", event.target.value)}
                  />
                </label>
                <label className="wide">
                  Project / inquiry *
                  <input
                    value={form.project}
                    onChange={(event) => change("project", event.target.value)}
                  />
                </label>
                <label>
                  Budget
                  <select
                    value={form.budget}
                    onChange={(event) => change("budget", event.target.value)}
                  >
                    <option value="">Select range</option>
                    <option>$5k – $10k</option>
                    <option>$10k – $25k</option>
                    <option>$25k+</option>
                  </select>
                </label>
                <label>
                  Preferred contact
                  <select
                    value={form.preferredContact}
                    onChange={(event) =>
                      change("preferredContact", event.target.value)
                    }
                  >
                    <option>Email</option>
                    <option>Phone</option>
                  </select>
                </label>
                <label className="wide">
                  Message
                  <textarea
                    rows="3"
                    value={form.message}
                    onChange={(event) => change("message", event.target.value)}
                    placeholder="A little context goes a long way..."
                  />
                </label>
              </div>
              <button
                className="primary-button full"
                disabled={!form.name || !form.email || !form.project}
                onClick={() => {
                  onSubmit(form);
                  setSubmitted(true);
                }}
              >
                Submit inquiry <ChevronRight size={17} />
              </button>
            </>
          )}
        </div>
      </div>
      <footer className="public-footer">
        Northlight CRM <span>Client lead management system</span>
        <span>hello@northlight.co</span>
      </footer>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
