import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  NavLink,
  useNavigate,
  useLocation,
} from "react-router-dom";

import { Toaster, toast } from "react-hot-toast";

import {
  Wallet,
  LayoutDashboard,
  ArrowLeftRight,
  Target,
  Repeat,
  CalendarClock,
  ChartNoAxesCombined,
  UserRound,
  LogOut,
  Plus,
  Trash2,
  Menu,
  X,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  CheckCircle2,
  Download,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import api from "./api";

// --------------------------------------------------
// COMMON HELPERS
// --------------------------------------------------

const money = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(n) || 0);

const today = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());

  return date.toISOString().slice(0, 10);
};

const nav = [
  ["Dashboard", "/dashboard", LayoutDashboard],
  ["Transactions", "/transactions", ArrowLeftRight],
  ["Spending Limits", "/budgets", Target],
  ["Savings Goals", "/goals", Wallet],
  ["Recurring Transactions", "/recurring", Repeat],
  ["Bill Reminders", "/reminders", CalendarClock],
  ["Analytics", "/analytics", ChartNoAxesCombined],
  ["Profile", "/profile", UserRound],
];

// --------------------------------------------------
// MAIN APP
// --------------------------------------------------

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Auth mode="login" />} />
        <Route path="/register" element={<Auth mode="register" />} />
        <Route path="/*" element={<Guard />} />
      </Routes>
    </BrowserRouter>
  );
}

// --------------------------------------------------
// LANDING PAGE
// --------------------------------------------------

function Landing() {
  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="brand">
          <span className="brand-icon">
            <Wallet size={21} />
          </span>
          SpendWise
        </div>

        <div>
          <NavLink className="nav-login" to="/login">
            Sign in
          </NavLink>
        </div>
      </nav>

      <section className="hero hero-centered">
        <div className="hero-copy">
          <span className="eyebrow">YOUR MONEY, MADE CLEAR</span>

          <h1>
            Make every rupee
            <br />
            <em>count.</em>
          </h1>

          <p>
            A simpler way to understand your spending,
            build savings habits and stay on top of your money.
          </p>

          <div className="hero-actions">
            <NavLink className="btn btn-lg" to="/register">
              Get started <ArrowUpRight size={17} />
            </NavLink>
          </div>

          <div className="hero-points">
            <span>
              <CheckCircle2 />
              Track income & expenses
            </span>

            <span>
              <CheckCircle2 />
              Plan monthly budgets
            </span>

            <span>
              <CheckCircle2 />
              Reach savings goals
            </span>
          </div>
        </div>
      </section>

      <section className="landing-foot">
        <span>Simple by design. Connected to your account</span>
        <span>SpendWise © {new Date().getFullYear()}</span>
      </section>
    </div>
  );
}

// --------------------------------------------------
// LOGIN AND REGISTER
// --------------------------------------------------

function Auth({ mode }) {
  const register = mode === "register";
  const navg = useNavigate();

  const [form, set] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [busy, B] = useState(false);

  async function submit(e) {
    e.preventDefault();
    B(true);

    try {
      const { data } = await api.post(`/auth/${mode}`, form);

      localStorage.setItem("spendwiseToken", data.token);
      localStorage.setItem(
        "spendwiseUser",
        JSON.stringify(data.user)
      );

      toast.success(
        register
          ? "Account created. Welcome to SpendWise!"
          : "Welcome back!"
      );

      navg("/dashboard");
    } catch (e) {
      toast.error(
        e.response?.data?.message ||
          "Unable to connect. Check that the server is running."
      );
    } finally {
      B(false);
    }
  }

  return (
    <div className="auth-wrap">
      <NavLink to="/" className="brand auth-brand">
        <span className="brand-icon">
          <Wallet />
        </span>
        SpendWise
      </NavLink>

      <form className="auth-card" onSubmit={submit}>
        <span className="eyebrow">
          {register ? "GET STARTED" : "WELCOME BACK"}
        </span>

        <h1>
          {register ? "Create your account" : "Sign in"}
        </h1>

        <p className="muted">
          {register
            ? "Your personal finance space, starting from zero."
            : "Continue managing your money with clarity."}
        </p>

        {register && (
          <Field label="Full name">
            <input
              required
              value={form.name}
              onChange={(e) =>
                set({ ...form, name: e.target.value })
              }
              placeholder="Your name"
            />
          </Field>
        )}

        <Field label="Email address">
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) =>
              set({ ...form, email: e.target.value })
            }
            placeholder="you@gmail.com"
          />
        </Field>

        <Field label="Password">
          <input
            type="password"
            minLength="6"
            required
            value={form.password}
            onChange={(e) =>
              set({ ...form, password: e.target.value })
            }
            placeholder="At least 6 characters"
          />
        </Field>

        <button className="btn submit-btn" disabled={busy}>
          {busy
            ? "Please wait…"
            : register
              ? "Create account"
              : "Sign in"}
        </button>

        <p className="auth-switch">
          {register
            ? "Already have an account?"
            : "New to SpendWise?"}{" "}
          <NavLink to={register ? "/login" : "/register"}>
            {register ? "Sign in" : "Create an account"}
          </NavLink>
        </p>
      </form>

      <p className="auth-privacy">
        Your account and finance records are stored securely in
        your connected database.
      </p>
    </div>
  );
}

// --------------------------------------------------
// AUTHENTICATION GUARD
// --------------------------------------------------

function Guard() {
  return localStorage.getItem("spendwiseToken") ? (
    <Workspace />
  ) : (
    <Navigate to="/login" replace />
  );
}

// --------------------------------------------------
// MAIN WORKSPACE
// --------------------------------------------------

function Workspace() {
  const [user, U] = useState(
    JSON.parse(localStorage.getItem("spendwiseUser") || "{}")
  );

  const [data, D] = useState({
    transactions: [],
    budgets: [],
    goals: [],
    recurring: [],
    reminders: [],
  });

  const [loading, L] = useState(true);
  const [mobile, M] = useState(false);

  const loc = useLocation();
  const navigate = useNavigate();

  const title =
    nav.find((x) => x[1] === loc.pathname)?.[0] || "Dashboard";

  async function refresh() {
    L(true);

    try {
      const keys = Object.keys(data);

      const results = await Promise.all(
        keys.map((k) => api.get(`/${k}`))
      );

      D(
        Object.fromEntries(
          keys.map((k, i) => [k, results[i].data])
        )
      );
    } catch (e) {
      if (e.response?.status === 401) {
        localStorage.removeItem("spendwiseToken");
        localStorage.removeItem("spendwiseUser");
        navigate("/login");
      } else {
        toast.error(
          "Could not load your data. Check the API connection."
        );
      }
    } finally {
      L(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function save(key, item, id) {
    try {
      if (id) {
        await api.put(`/${key}/${id}`, item);
      } else {
        await api.post(`/${key}`, item);
      }

      toast.success("Saved successfully");

      await refresh();
      return true;
    } catch (e) {
      toast.error(
        e.response?.data?.message ||
          "Could not save. Check the entered values."
      );

      return false;
    }
  }

  async function remove(key, id) {
    if (!confirm("Delete this record? This cannot be undone.")) {
      return;
    }

    try {
      await api.delete(`/${key}/${id}`);

      toast.success("Deleted");
      refresh();
    } catch {
      toast.error("Could not delete record.");
    }
  }

  function logout() {
    localStorage.removeItem("spendwiseToken");
    localStorage.removeItem("spendwiseUser");
    navigate("/");
  }

  return (
    <div className="app-shell">
      {/* SIDEBAR */}

      <aside className={`sidebar ${mobile ? "show" : ""}`}>
        <div className="side-brand">
          <span className="brand-icon">
            <Wallet />
          </span>

          SpendWise

          <button
            className="mobile-close"
            onClick={() => M(false)}
          >
            <X />
          </button>
        </div>

        <div className="side-caption">WORKSPACE</div>

        <div className="side-links">
          {nav.map(([name, path, Icon]) => (
            <NavLink
              onClick={() => M(false)}
              key={path}
              to={path}
              className={({ isActive }) =>
                `side-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={18} />
              {name}
            </NavLink>
          ))}
        </div>

        <div className="sidebar-bottom">
          <div className="user-mini">
            <div className="avatar">
              {(user.name || "U").slice(0, 1).toUpperCase()}
            </div>

            <div>
              <b>{user.name || "User"}</b>
              <small>Personal account</small>
            </div>
          </div>

          <button className="logout" onClick={logout}>
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </aside>

      {mobile && (
        <div className="scrim" onClick={() => M(false)} />
      )}

      {/* MAIN CONTENT */}

      <main className="main-area">
        <header className="topbar">
          <button
            className="mobile-menu"
            onClick={() => M(true)}
          >
            <Menu />
          </button>

          <div>
            <span className="top-kicker">
              SPENDWISE / WORKSPACE
            </span>
          </div>

          <div className="top-user">
            <span className="status-dot" />
            Saved on this device
          </div>
        </header>

        <div className="page-content">
          {loading ? (
            <div className="loading">
              Loading your financial workspace…
            </div>
          ) : (
            <Page
              title={title}
              data={data}
              user={user}
              save={save}
              remove={remove}
              refresh={refresh}
              setUser={U}
            />
          )}
        </div>
      </main>
    </div>
  );
}

// --------------------------------------------------
// PAGE ROUTING
// --------------------------------------------------

function Page({
  title,
  data,
  user,
  save,
  remove,
  refresh,
  setUser,
}) {
  if (title === "Dashboard") {
    return <Dashboard data={data} />;
  }

  if (title === "Transactions") {
    return (
      <Transactions
        rows={data.transactions}
        save={save}
        remove={remove}
      />
    );
  }

  if (title === "Spending Limits") {
    return (
      <Budgets
        rows={data.budgets}
        transactions={data.transactions}
        save={save}
        remove={remove}
      />
    );
  }

  if (title === "Savings Goals") {
    return (
      <Goals
        rows={data.goals}
        save={save}
        remove={remove}
      />
    );
  }

  if (title === "Recurring Transactions") {
    return (
      <RecurringPage
        rows={data.recurring}
        save={save}
        remove={remove}
      />
    );
  }

  if (title === "Bill Reminders") {
    return (
      <Reminders
        rows={data.reminders}
        save={save}
        remove={remove}
      />
    );
  }

  if (title === "Analytics") {
    return <Analytics data={data} />;
  }

  return <Profile user={user} setUser={setUser} />;
}

// --------------------------------------------------
// DASHBOARD
// --------------------------------------------------

function Dashboard({ data }) {
  const tx = data.transactions;

  const income = tx
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);

  const expense = tx
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  const balance = income - expense;

  const month = new Date().toISOString().slice(0, 7);

  const current = tx.filter(
    (t) => String(t.date).slice(0, 7) === month
  );

  const chart = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - 5 + i);

    const m = d.toISOString().slice(0, 7);

    return {
      month: d.toLocaleString("en-IN", { month: "short" }),

      income: tx
        .filter(
          (t) =>
            String(t.date).slice(0, 7) === m &&
            t.type === "income"
        )
        .reduce((s, t) => s + t.amount, 0),

      expenses: tx
        .filter(
          (t) =>
            String(t.date).slice(0, 7) === m &&
            t.type === "expense"
        )
        .reduce((s, t) => s + t.amount, 0),
    };
  });

  return (
    <>
      <div className="welcome-row">
        <div>
          <p className="muted">
            Here’s your financial snapshot.
          </p>

          <h1>Your money at a glance</h1>
        </div>

        <span className="date-pill">
          {new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
      </div>

      <div className="stats-grid">
        <Stat
          label="Available balance"
          value={money(balance)}
          icon={Wallet}
          tone="green"
          sub="Income minus expenses"
        />

        <Stat
          label="Total income"
          value={money(income)}
          icon={TrendingUp}
          tone="blue"
          sub="All recorded income"
        />

        <Stat
          label="Total expenses"
          value={money(expense)}
          icon={TrendingDown}
          tone="orange"
          sub="All recorded expenses"
        />

        <Stat
          label="Savings rate"
          value={
            income
              ? `${Math.max(
                  0,
                  Math.round((balance / income) * 100)
                )}%`
              : "—"
          }
          icon={Target}
          tone="purple"
          sub="Based on recorded income"
        />
      </div>

      <div className="dash-grid">
        <section className="panel chart-panel">
          <div className="panel-head">
            <div>
              <h3>Cash flow</h3>
              <p>Income and expenses over the last six months</p>
            </div>

            <span className="tiny-tag">6 MONTHS</span>
          </div>

          {tx.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chart}>
                <defs>
                  <linearGradient
                    id="inc"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#27865b"
                      stopOpacity={0.2}
                    />

                    <stop
                      offset="100%"
                      stopColor="#27865b"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#edf1ee"
                />

                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${v / 1000}k`}
                />

                <Tooltip formatter={(v) => money(v)} />

                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#27865b"
                  fill="url(#inc)"
                  strokeWidth={2.5}
                />

                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke="#e29a56"
                  fill="#e29a56"
                  fillOpacity={0.08}
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <Empty text="Your cash-flow chart will appear after you add transactions." />
          )}

          <div className="legend">
            <span>
              <i className="legend-green" />
              Income
            </span>

            <span>
              <i className="legend-orange" />
              Expenses
            </span>
          </div>
        </section>

        <section className="panel insight-panel">
          <div className="panel-head">
            <div>
              <h3>Monthly overview</h3>
              <p>Your activity this month</p>
            </div>
          </div>

          <div className="overview-total">
            {money(
              current
                .filter((t) => t.type === "expense")
                .reduce((s, t) => s + t.amount, 0)
            )}

            <small>Expenses this month</small>
          </div>

          <div className="overview-line">
            <span>Income</span>

            <b>
              {money(
                current
                  .filter((t) => t.type === "income")
                  .reduce((s, t) => s + t.amount, 0)
              )}
            </b>
          </div>

          <div className="overview-line">
            <span>Transactions</span>
            <b>{current.length}</b>
          </div>

          <div className="insight-note">
            <span>✦</span>

            <p>
              {tx.length
                ? "Keep recording transactions to get a clearer picture of your habits."
                : "Start by adding your first income or expense. Your dashboard will update automatically."}
            </p>
          </div>
        </section>
      </div>

      <section className="panel">
        <div className="panel-head">
          <div>
            <h3>Recent transactions</h3>
            <p>Your latest recorded activity</p>
          </div>

          <NavLink to="/transactions" className="text-link">
            View all <ArrowUpRight size={15} />
          </NavLink>
        </div>

        {tx.length ? (
          <TransactionTable
            rows={[...tx]
              .sort(
                (a, b) => new Date(b.date) - new Date(a.date)
              )
              .slice(0, 5)}
          />
        ) : (
          <Empty text="No transactions yet. Add your first entry from the Transactions page." />
        )}
      </section>
    </>
  );
}

// --------------------------------------------------
// REUSABLE COMPONENTS
// --------------------------------------------------

function Stat({ label, value, icon: Icon, tone, sub }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}>
        <Icon size={19} />
      </div>

      <span>{label}</span>
      <strong>{value}</strong>
      <small>{sub}</small>
    </div>
  );
}

function Empty({ text }) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Wallet size={22} />
      </span>

      <b>Nothing here yet</b>
      <p>{text}</p>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

// --------------------------------------------------
// REUSABLE MODAL FORM
// --------------------------------------------------

function ModalForm({
  title,
  fields,
  onClose,
  onSave,
  initial = {},
}) {
  const [v, S] = useState({ ...initial });

  async function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const values = Object.fromEntries(formData.entries());

    const finalValues = {
      ...initial,
      ...values,
    };

    if (await onSave(finalValues)) {
      onClose();
    }
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) =>
        e.target === e.currentTarget && onClose()
      }
    >
      <form className="modal" onSubmit={handleSubmit}>
        <div className="modal-head">
          <h3>{title}</h3>

          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
          >
            <X />
          </button>
        </div>

        {fields.map((f) => (
          <Field key={f.name} label={f.label}>
            {f.options ? (
              <select
                name={f.name}
                required={f.required !== false}
                value={v[f.name] ?? f.default ?? ""}
                onChange={(e) =>
                  S({
                    ...v,
                    [f.name]: e.target.value,
                  })
                }
              >
                {f.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                name={f.name}
                required={f.required !== false}
                type={f.type || "text"}
                min={f.min}
                step={f.step}
                placeholder={f.placeholder || ""}
                value={v[f.name] ?? ""}
                onChange={(e) =>
                  S({
                    ...v,
                    [f.name]: e.target.value,
                  })
                }
              />
            )}
          </Field>
        ))}

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-quiet"
            onClick={onClose}
          >
            Cancel
          </button>

          <button type="submit" className="btn">
            Save
          </button>
        </div>
      </form>
    </div>
  );
}

// --------------------------------------------------
// PAGE HEADER
// --------------------------------------------------

function PageHeader({
  title,
  desc,
  onAdd,
  button = "Add new",
}) {
  return (
    <div className="page-heading">
      <div>
        <h1>{title}</h1>
        <p>{desc}</p>
      </div>

      {onAdd && (
        <button className="btn" onClick={onAdd}>
          <Plus size={17} />
          {button}
        </button>
      )}
    </div>
  );
}

// --------------------------------------------------
// TRANSACTIONS
// --------------------------------------------------

function Transactions({ rows, save, remove }) {
  const [open, O] = useState(false);
  const [search, S] = useState("");
  const [filter, F] = useState("all");

  const fields = [
    {
      name: "title",
      label: "Description",
    },
    {
      name: "amount",
      label: "Amount (₹)",
      type: "number",
      min: "0.01",
      step: "0.01",
    },
    {
      name: "type",
      label: "Type",
      options: [
        { value: "expense", label: "Expense" },
        { value: "income", label: "Income" },
      ],
    },
    {
      name: "category",
      label: "Category",
      options: [
        "Food",
        "Transport",
        "Shopping",
        "Bills",
        "Health",
        "Salary",
        "Freelance",
        "Education",
        "Other",
      ].map((x) => ({
        value: x,
        label: x,
      })),
    },
    {
      name: "date",
      label: "Date",
      type: "date",
      max:today(),
    },
  ];

  const list = rows.filter(
    (r) =>
      (filter === "all" || r.type === filter) &&
      `${r.title} ${r.category}`
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <>
      <PageHeader
        title="Transactions"
        desc="Record and manage every rupee coming in or going out."
        onAdd={() => O(true)}
        button="Add transaction"
      />

      <div className="panel">
        <div className="toolbar">
          <input
            placeholder="Search transactions…"
            value={search}
            onChange={(e) => S(e.target.value)}
          />

          <select
            value={filter}
            onChange={(e) => F(e.target.value)}
          >
            <option value="all">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expenses</option>
          </select>
        </div>

        {list.length ? (
          <TransactionTable
            rows={list}
            onDelete={(id) => remove("transactions", id)}
          />
        ) : (
          <Empty text="No matching transactions. Add an income or expense to get started." />
        )}
      </div>

    {open && (
  <ModalForm
    title="Add transaction"
    fields={fields}
    onClose={() => O(false)}
    onSave={(v) => {
      const amount = Number(v.amount);
      const transactionDate = v.date || today();

      if (!v.title?.trim()) {
        toast.error("Please enter a transaction description.");
        return false;
      }

      if (!v.category) {
        toast.error("Please select a category.");
        return false;
      }

      if (!Number.isFinite(amount) || amount <= 0) {
        toast.error("Amount must be greater than zero.");
        return false;
      }

      if (transactionDate > today()) {
        toast.error("Future transaction dates are not allowed.");
        return false;
      }

      return save("transactions", {
        ...v,
        title: v.title.trim(),
        amount,
        date: new Date(`${transactionDate}T00:00:00`),
      });
    }}
  />
)} 
    </>
  );
}

// --------------------------------------------------
// TRANSACTION TABLE
// --------------------------------------------------

function TransactionTable({ rows, onDelete }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>DESCRIPTION</th>
            <th>CATEGORY</th>
            <th>DATE</th>
            <th>TYPE</th>
            <th className="right">AMOUNT</th>
            {onDelete && <th />}
          </tr>
        </thead>

        <tbody>
          {rows.map((r) => (
            <tr key={r._id}>
              <td>
                <b>{r.title}</b>
              </td>

              <td>{r.category}</td>

              <td>
                {new Date(r.date).toLocaleDateString("en-IN")}
              </td>

              <td>
                <span className={`type-pill ${r.type}`}>
                  {r.type}
                </span>
              </td>

              <td className={`right amount ${r.type}`}>
                {r.type === "income" ? "+" : "−"}
                {money(r.amount)}
              </td>

              {onDelete && (
                <td>
                  <button
                    className="icon-btn danger"
                    onClick={() => onDelete(r._id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --------------------------------------------------
// SPENDING LIMITS
// --------------------------------------------------


function Budgets({ rows, transactions, save, remove }) {
  const [open, O] = useState(false);

  const currentMonth = today().slice(0, 7);

  const fields = [
    {
      name: "category",
      label: "Category",
      options: [
        "Food",
        "Transport",
        "Shopping",
        "Bills",
        "Health",
        "Education",
        "Entertainment",
        "Other",
      ].map((x) => ({
        value: x,
        label: x,
      })),
    },
    {
      name: "limit",
      label: "Monthly limit (₹)",
      type: "number",
      min: "0.01",
      step: "0.01",
    },
    {
      name: "month",
      label: "Budget month",
      type: "month",
      min: currentMonth,
    },
  ];

  return (
    <>
      <PageHeader
        title="Spending Limits"
        desc="Set a monthly limit for categories and keep spending in check."
        onAdd={() => O(true)}
        button="Set a limit"
      />

      {rows.length ? (
        <div className="feature-grid">
          {rows.map((r) => {
            const spent = transactions
              .filter(
                (t) =>
                  t.type === "expense" &&
                  t.category === r.category &&
                  String(t.date).slice(0, 7) === r.month
              )
              .reduce((s, t) => s + Number(t.amount), 0);

            const pct = Math.min(
              100,
              (spent / Number(r.limit)) * 100
            );

            return (
              <div className="panel feature-card" key={r._id}>
                <div className="feature-card-head">
                  <div>
                    <span className="muted">{r.month}</span>
                    <h3>{r.category}</h3>
                  </div>

                  <button
                    className="icon-btn danger"
                    onClick={() => remove("budgets", r._id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <strong className="big-amount">
                  {money(spent)} <small>of {money(r.limit)}</small>
                </strong>

                <div className="progress">
                  <i style={{ width: `${pct}%` }} />
                </div>

                <div className="progress-label">
                  <span>{Math.round(pct)}% used</span>
                  <b>{money(Math.max(0, r.limit - spent))} left</b>
                </div>

                {spent > r.limit && (
                  <p className="warning">
                    You have exceeded this limit.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="panel">
          <Empty text="No spending limits set. Create a category limit to start tracking your monthly budget." />
        </div>
      )}

      {open && (
        <ModalForm
          title="Set spending limit"
          fields={fields}
          initial={{ month: currentMonth }}
          onClose={() => O(false)}
          onSave={(v) => {
            const amount = Number(v.limit);
            const selectedMonth = v.month || currentMonth;

            if (!v.category) {
              toast.error("Please select a category.");
              return false;
            }

            if (!Number.isFinite(amount) || amount <= 0) {
              toast.error("Budget amount must be greater than zero.");
              return false;
            }

            if (selectedMonth < currentMonth) {
              toast.error("Past budget months are not allowed.");
              return false;
            }

            return save("budgets", {
              ...v,
              limit: amount,
              month: selectedMonth,
            });
          }}
        />
      )}
    </>
  );
}


// --------------------------------------------------
// SAVINGS GOALS
// --------------------------------------------------


function Goals({ rows, save, remove }) {
  const [open, O] = useState(false);
  const [edit, E] = useState(null);

  const fields = [
    {
      name: "name",
      label: "Goal name",
    },
    {
      name: "target",
      label: "Target amount (₹)",
      type: "number",
      min: "0.01",
      step: "0.01",
    },
    {
      name: "saved",
      label: "Already saved (₹)",
      type: "number",
      min: "0",
      step: "0.01",
      required: false,
    },
    {
      name: "deadline",
      label: "Target date",
      type: "date",
      min: today(),
      required: false,
    },
  ];

  return (
    <>
      <PageHeader
        title="Savings Goals"
        desc="Give your savings a purpose and track your progress."
        onAdd={() => O(true)}
        button="Create goal"
      />

      {rows.length ? (
        <div className="feature-grid">
          {rows.map((r) => {
            const pct = Math.min(
              100,
              (Number(r.saved) / Number(r.target)) * 100
            );

            return (
              <div className="panel feature-card" key={r._id}>
                <div className="feature-card-head">
                  <div className="goal-symbol">
                    <Target />
                  </div>

                  <button
                    className="icon-btn danger"
                    onClick={() => remove("goals", r._id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <h3>{r.name}</h3>

                <strong className="big-amount">
                  {money(r.saved)} <small>saved of {money(r.target)}</small>
                </strong>

                <div className="progress">
                  <i style={{ width: `${pct}%` }} />
                </div>

                <div className="progress-label">
                  <span>{Math.round(pct)}% complete</span>
                  <b>{money(Math.max(0, r.target - r.saved))} to go</b>
                </div>

                <button
                  className="text-link goal-update"
                  onClick={() => E(r)}
                >
                  Update saved amount <ArrowUpRight size={15} />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="panel">
          <Empty text="No savings goals yet. Create a goal for something you want to achieve." />
        </div>
      )}

      {open && (
        <ModalForm
          title="Create savings goal"
          fields={fields}
          onClose={() => O(false)}
          onSave={(v) => {
            const target = Number(v.target);
            const saved = Number(v.saved || 0);
            const deadline = v.deadline || "";

            if (!v.name?.trim()) {
              toast.error("Please enter a goal name.");
              return false;
            }

            if (!Number.isFinite(target) || target <= 0) {
              toast.error("Target amount must be greater than zero.");
              return false;
            }

            if (!Number.isFinite(saved) || saved < 0) {
              toast.error("Saved amount cannot be negative.");
              return false;
            }

            if (deadline && deadline < today()) {
              toast.error("Past target dates are not allowed.");
              return false;
            }

            if (saved > target) {
              const confirmed = window.confirm(
                "Your saved amount is greater than your target. Do you want to continue?"
              );

              if (!confirmed) return false;
            }

            return save("goals", {
              ...v,
              name: v.name.trim(),
              target,
              saved,
              deadline: deadline
                ? new Date(`${deadline}T00:00:00`)
                : undefined,
            });
          }}
        />
      )}

      {edit && (
        <ModalForm
          title={`Update ${edit.name}`}
          fields={[
            {
              name: "saved",
              label: "Total amount saved (₹)",
              type: "number",
              min: "0",
              step: "0.01",
            },
          ]}
          initial={{ saved: edit.saved }}
          onClose={() => E(null)}
          onSave={(v) => {
            const saved = Number(v.saved);
            const target = Number(edit.target);

            if (!Number.isFinite(saved) || saved < 0) {
              toast.error("Saved amount cannot be negative.");
              return false;
            }

            if (saved > target) {
              const confirmed = window.confirm(
                "Your saved amount is greater than your target. Do you want to continue?"
              );

              if (!confirmed) return false;
            }

            return save(
              "goals",
              { saved },
              edit._id
            );
          }}
        />
      )}
    </>
  );
}

// --------------------------------------------------
// RECURRING TRANSACTIONS
// --------------------------------------------------

function RecurringPage({ rows, save, remove }) {
  const [open, O] = useState(false);

  const fields = [
    {
      name: "title",
      label: "Description",
    },
    {
      name: "amount",
      label: "Amount (₹)",
      type: "number",
      min: "0.01",
      step: "0.01",
    },
    {
      name: "type",
      label: "Type",
      options: [
        { value: "expense", label: "Expense" },
        { value: "income", label: "Income" },
      ],
    },
    {
      name: "category",
      label: "Category",
      options: [
        "Bills",
        "Salary",
        "Rent",
        "Subscriptions",
        "Other",
      ].map((x) => ({
        value: x,
        label: x,
      })),
    },
    {
      name: "frequency",
      label: "Frequency",
      options: ["weekly", "monthly", "yearly"].map((x) => ({
        value: x,
        label: x[0].toUpperCase() + x.slice(1),
      })),
    },
    {
      name: "nextDate",
      label: "Next date",
      type: "date",
    },
  ];

  return (
    <>
      <PageHeader
        title="Recurring Transactions"
        desc="Keep a record of regular income and expenses."
        onAdd={() => O(true)}
        button="Add recurring"
      />

      <div className="panel">
        {rows.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>DESCRIPTION</th>
                  <th>CATEGORY</th>
                  <th>FREQUENCY</th>
                  <th>NEXT DATE</th>
                  <th className="right">AMOUNT</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {rows.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <b>{r.title}</b>
                    </td>

                    <td>{r.category}</td>
                    <td>{r.frequency}</td>

                    <td>
                      {new Date(r.nextDate).toLocaleDateString(
                        "en-IN"
                      )}
                    </td>

                    <td className={`right amount ${r.type}`}>
                      {money(r.amount)}
                    </td>

                    <td>
                      <button
                        className="icon-btn danger"
                        onClick={() =>
                          remove("recurring", r._id)
                        }
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty text="No recurring transactions. Add regular payments or income to keep them organised." />
        )}
      </div>

      {open && (
        <ModalForm
          title="Add recurring transaction"
          fields={fields}
          onClose={() => O(false)}
          onSave={(v) =>
            save("recurring", {
              ...v,
              amount: Number(v.amount),
              nextDate: new Date(v.nextDate),
            })
          }
        />
      )}
    </>
  );
}

// --------------------------------------------------
// BILL REMINDERS
// --------------------------------------------------

function Reminders({ rows, save, remove }) {
  const [open, O] = useState(false);

  const fields = [
    {
      name: "title",
      label: "Bill or payment name",
    },
    {
      name: "amount",
      label: "Amount (₹)",
      type: "number",
      min: "0.01",
      step: "0.01",
    },
    {
      name: "dueDate",
      label: "Due date",
      type: "date",
    },
    {
      name: "note",
      label: "Note",
      required: false,
    },
  ];

  return (
    <>
      <PageHeader
        title="Bill Reminders"
        desc="Keep upcoming payments visible and mark bills when paid."
        onAdd={() => O(true)}
        button="Add reminder"
      />

      <div className="panel">
        {rows.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>BILL</th>
                  <th>DUE DATE</th>
                  <th>STATUS</th>
                  <th className="right">AMOUNT</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {rows.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <b>{r.title}</b>
                    </td>

                    <td>
                      {new Date(r.dueDate).toLocaleDateString(
                        "en-IN"
                      )}
                    </td>

                    <td>
                      <button
                        className={`type-pill ${
                          r.paid ? "income" : "expense"
                        }`}
                        onClick={() =>
                          save(
                            "reminders",
                            { paid: !r.paid },
                            r._id
                          )
                        }
                      >
                        {r.paid ? "Paid" : "Mark as paid"}
                      </button>
                    </td>

                    <td className="right amount">
                      {money(r.amount)}
                    </td>

                    <td>
                      <button
                        className="icon-btn danger"
                        onClick={() =>
                          remove("reminders", r._id)
                        }
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty text="No bill reminders yet. Add a payment and due date to stay organised." />
        )}
      </div>

      {open && (
        <ModalForm
          title="Add bill reminder"
          fields={fields}
          onClose={() => O(false)}
          onSave={(v) =>
            save("reminders", {
              ...v,
              amount: Number(v.amount),
              dueDate: new Date(v.dueDate),
            })
          }
        />
      )}
    </>
  );
}

// --------------------------------------------------
// ANALYTICS
// --------------------------------------------------

function Analytics({ data }) {
  const tx = data.transactions;

  const expense = tx.filter((t) => t.type === "expense");

  const total = expense.reduce((s, t) => s + t.amount, 0);

  const cats = Object.entries(
    expense.reduce((o, t) => {
      o[t.category] = (o[t.category] || 0) + t.amount;
      return o;
    }, {})
  ).map(([name, value]) => ({
    name,
    value,
  }));

  const colors = [
    "#27865b",
    "#75b99a",
    "#e5a15c",
    "#7e91bd",
    "#a9b4a9",
    "#d0b58a",
  ];

  return (
    <>
      <PageHeader
        title="Analytics"
        desc="Understand where your money goes using your recorded transactions."
      />

      <div className="stats-grid">
        <Stat
          label="Recorded transactions"
          value={tx.length}
          icon={ArrowLeftRight}
          tone="blue"
          sub="All time"
        />

        <Stat
          label="Total income"
          value={money(
            tx
              .filter((t) => t.type === "income")
              .reduce((s, t) => s + t.amount, 0)
          )}
          icon={TrendingUp}
          tone="green"
          sub="All time"
        />

        <Stat
          label="Total expenses"
          value={money(total)}
          icon={TrendingDown}
          tone="orange"
          sub="All time"
        />

        <Stat
          label="Categories used"
          value={cats.length}
          icon={ChartNoAxesCombined}
          tone="purple"
          sub="Expense categories"
        />
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Expenses by category</h3>
            <p>Based on all expense records</p>
          </div>
        </div>

        {cats.length ? (
          <div className="analytics-chart">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={cats}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={110}
                  innerRadius={65}
                  paddingAngle={3}
                >
                  {cats.map((c, i) => (
                    <Cell
                      key={c.name}
                      fill={colors[i % colors.length]}
                    />
                  ))}
                </Pie>

                <Tooltip formatter={(v) => money(v)} />
              </PieChart>
            </ResponsiveContainer>

            <div className="category-legend">
              {cats.map((c, i) => (
                <div key={c.name}>
                  <i
                    style={{
                      background: colors[i % colors.length],
                    }}
                  />

                  <span>{c.name}</span>
                  <b>{money(c.value)}</b>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <Empty text="Add expense transactions to see your category breakdown here." />
        )}
      </div>

      <div className="panel export-panel">
        <div>
          <h3>Export your transactions</h3>
          <p>
            Download a CSV file of the transactions stored in
            your account.
          </p>
        </div>

        <button
          className="btn"
          disabled={!tx.length}
          onClick={() => {
            const csv = [
              "Date,Title,Type,Category,Amount",

              ...tx.map((t) =>
                [
                  new Date(t.date).toISOString().slice(0, 10),
                  `"${t.title.replaceAll('"', '""')}"`,
                  t.type,
                  t.category,
                  t.amount,
                ].join(",")
              ),
            ].join("\n");

            const a = document.createElement("a");

            a.href = URL.createObjectURL(
              new Blob([csv], { type: "text/csv" })
            );

            a.download = "spendwise-transactions.csv";
            a.click();

            URL.revokeObjectURL(a.href);
          }}
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>
    </>
  );
}

// --------------------------------------------------
// PROFILE
// --------------------------------------------------

function Profile({ user, setUser }) {
  const [name, N] = useState(user.name || "");

  async function submit(e) {
    e.preventDefault();

    try {
      const { data } = await api.put("/auth/me", { name });

      localStorage.setItem(
        "spendwiseUser",
        JSON.stringify(data.user)
      );

      setUser(data.user);

      toast.success("Profile updated");
    } catch (e) {
      toast.error(
        e.response?.data?.message ||
          "Could not update profile."
      );
    }
  }

  return (
    <>
      <PageHeader
        title="Profile"
        desc="Manage your personal account details."
      />

      <form className="panel profile-form" onSubmit={submit}>
        <div className="profile-avatar">
          {(user.name || "U").slice(0, 1).toUpperCase()}
        </div>

        <Field label="Full name">
          <input
            value={name}
            onChange={(e) => N(e.target.value)}
            required
          />
        </Field>

        <Field label="Email address">
          <input value={user.email || ""} disabled />
        </Field>

        <p className="muted small">
          Your email address is used to sign in and cannot be
          changed here.
        </p>

        <button className="btn">Save changes</button>
      </form>
    </>
  );
}

export default App;