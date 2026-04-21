import { useState, useEffect, useRef } from "react";

const INITIAL_TASKS = [
  { id: 1, title: "Redesign landing page hero section", priority: "high", status: "in-progress", due: "2026-04-24", tags: ["design", "ui"], subtasks: ["Wireframe", "Prototype", "Dev handoff"], done: [true, false, false] },
  { id: 2, title: "API integration for auth module", priority: "high", status: "todo", due: "2026-04-26", tags: ["backend", "auth"], subtasks: ["OAuth setup", "Token refresh", "Tests"], done: [false, false, false] },
  { id: 3, title: "Write unit tests for payment flow", priority: "medium", status: "todo", due: "2026-04-28", tags: ["testing"], subtasks: ["Stripe mock", "Edge cases"], done: [false, false] },
  { id: 4, title: "Performance audit & optimization", priority: "low", status: "done", due: "2026-04-20", tags: ["performance"], subtasks: ["Lighthouse run", "Lazy load images", "Bundle split"], done: [true, true, true] },
  { id: 5, title: "Deploy staging environment", priority: "medium", status: "in-progress", due: "2026-04-22", tags: ["devops"], subtasks: ["Docker setup", "CI/CD pipeline"], done: [true, false] },
  { id: 6, title: "User research interviews", priority: "low", status: "done", due: "2026-04-18", tags: ["research", "ux"], subtasks: ["Script prep", "5 interviews", "Synthesis"], done: [true, true, true] },
];

const COLS = ["todo", "in-progress", "done"];
const COL_LABELS = { todo: "To Do", "in-progress": "In Progress", done: "Done" };
const PRIORITY_COLOR = { high: "#ff2d55", medium: "#ff9f0a", low: "#30d158" };
const TAG_COLORS = ["#0a84ff", "#bf5af2", "#ff9f0a", "#30d158", "#ff2d55", "#5ac8fa", "#ffcc00"];

function tagColor(tag) {
  let h = 0;
  for (let c of tag) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return TAG_COLORS[h % TAG_COLORS.length];
}

function ProgressRing({ pct, size = 36 }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#222" strokeWidth={5}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e8ff47" strokeWidth={5}
        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.5s ease" }}/>
    </svg>
  );
}

function TaskCard({ task, onUpdate, onDelete, onDrop, dragging, setDragging }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const doneCount = task.done.filter(Boolean).length;
  const pct = task.subtasks.length ? doneCount / task.subtasks.length : 0;
  const overdue = new Date(task.due) < new Date() && task.status !== "done";

  function toggleSub(i) {
    const done = [...task.done];
    done[i] = !done[i];
    onUpdate({ ...task, done });
  }

  function saveEdit() {
    onUpdate({ ...task, title: editTitle });
    setEditing(false);
  }

  return (
    <div
      draggable
      onDragStart={() => setDragging(task.id)}
      onDragEnd={() => setDragging(null)}
      style={{
        background: dragging === task.id ? "#1a1a1a" : "#111",
        border: `1.5px solid ${dragging === task.id ? "#e8ff47" : "#222"}`,
        borderRadius: 2,
        padding: "16px",
        marginBottom: 10,
        cursor: "grab",
        opacity: dragging === task.id ? 0.5 : 1,
        transition: "border-color 0.2s, opacity 0.2s",
        fontFamily: "'Space Mono', monospace",
        position: "relative",
      }}
    >
      {/* Priority bar */}
      <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: PRIORITY_COLOR[task.priority], borderRadius: "2px 0 0 2px" }}/>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ flex: 1 }}>
          {editing ? (
            <input
              autoFocus
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={e => e.key === "Enter" && saveEdit()}
              style={{ width: "100%", background: "transparent", border: "none", borderBottom: "1px solid #e8ff47", color: "#fff", fontSize: 13, fontFamily: "'Space Mono', monospace", outline: "none", paddingBottom: 2 }}
            />
          ) : (
            <div
              onDoubleClick={() => setEditing(true)}
              style={{ fontSize: 13, fontWeight: 700, color: task.status === "done" ? "#555" : "#f5f5f5", textDecoration: task.status === "done" ? "line-through" : "none", lineHeight: 1.4, cursor: "text" }}
            >{task.title}</div>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 }}>
            {task.tags.map(t => (
              <span key={t} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 20, background: tagColor(t) + "22", color: tagColor(t), border: `1px solid ${tagColor(t)}44`, fontWeight: 700, letterSpacing: 0.5 }}>{t}</span>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flexShrink: 0 }}>
          <ProgressRing pct={pct} size={36}/>
          <span style={{ fontSize: 9, color: "#555" }}>{doneCount}/{task.subtasks.length}</span>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
        <span style={{ fontSize: 10, color: overdue ? "#ff2d55" : "#555", fontFamily: "'Space Mono', monospace" }}>
          {overdue ? "⚠ " : ""}DUE {task.due}
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setExpanded(!expanded)} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 11, padding: 0, fontFamily: "'Space Mono', monospace" }}>
            {expanded ? "▲ HIDE" : "▼ SUBS"}
          </button>
          <button onClick={() => onDelete(task.id)} style={{ background: "none", border: "none", color: "#333", cursor: "pointer", fontSize: 11, padding: 0 }}>✕</button>
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: 12, borderTop: "1px solid #1e1e1e", paddingTop: 10 }}>
          {task.subtasks.map((s, i) => (
            <label key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7, cursor: "pointer" }}>
              <div
                onClick={() => toggleSub(i)}
                style={{ width: 14, height: 14, border: `1.5px solid ${task.done[i] ? "#e8ff47" : "#444"}`, borderRadius: 2, background: task.done[i] ? "#e8ff47" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}
              >
                {task.done[i] && <span style={{ color: "#000", fontSize: 9, fontWeight: 900 }}>✓</span>}
              </div>
              <span style={{ fontSize: 11, color: task.done[i] ? "#444" : "#aaa", textDecoration: task.done[i] ? "line-through" : "none" }}>{s}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function Column({ status, tasks, onUpdate, onDelete, dragging, setDragging, onDropColumn }) {
  const [over, setOver] = useState(false);
  return (
    <div
      onDragOver={e => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={() => { setOver(false); onDropColumn(status); }}
      style={{ flex: 1, minWidth: 260, maxWidth: 340 }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, borderBottom: `2px solid ${over ? "#e8ff47" : "#1e1e1e"}`, paddingBottom: 10, transition: "border-color 0.2s" }}>
        <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: 3, color: "#555", fontFamily: "'Space Mono', monospace" }}>{COL_LABELS[status].toUpperCase()}</span>
        <span style={{ fontSize: 11, color: "#e8ff47", fontFamily: "'Space Mono', monospace", fontWeight: 700 }}>{tasks.length}</span>
      </div>
      {tasks.map(t => (
        <TaskCard key={t.id} task={t} onUpdate={onUpdate} onDelete={onDelete} dragging={dragging} setDragging={setDragging} onDrop={onDropColumn}/>
      ))}
      {over && (
        <div style={{ border: "2px dashed #e8ff4755", borderRadius: 2, height: 60, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 10, color: "#e8ff47", fontFamily: "'Space Mono', monospace" }}>DROP HERE</span>
        </div>
      )}
    </div>
  );
}

function AddTaskModal({ onAdd, onClose }) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [due, setDue] = useState("");
  const [tagInput, setTagInput] = useState("");

  function submit() {
    if (!title.trim()) return;
    onAdd({
      id: Date.now(),
      title: title.trim(),
      priority,
      status: "todo",
      due: due || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      tags: tagInput.split(",").map(t => t.trim()).filter(Boolean),
      subtasks: [],
      done: [],
    });
    onClose();
  }

  const inputStyle = { width: "100%", background: "#111", border: "1px solid #333", color: "#f5f5f5", borderRadius: 2, padding: "10px 12px", fontSize: 13, fontFamily: "'Space Mono', monospace", outline: "none", boxSizing: "border-box" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000cc", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
      <div style={{ background: "#0a0a0a", border: "1.5px solid #222", borderRadius: 4, padding: 32, width: 440, fontFamily: "'Space Mono', monospace" }}>
        <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: 3, color: "#e8ff47", marginBottom: 24 }}>NEW TASK</div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: "#555", letterSpacing: 2, marginBottom: 6 }}>TITLE *</div>
          <input style={inputStyle} value={title} onChange={e => setTitle(e.target.value)} placeholder="Task description..." onKeyDown={e => e.key === "Enter" && submit()}/>
        </div>
        <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: "#555", letterSpacing: 2, marginBottom: 6 }}>PRIORITY</div>
            <select style={{ ...inputStyle }} value={priority} onChange={e => setPriority(e.target.value)}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: "#555", letterSpacing: 2, marginBottom: 6 }}>DUE DATE</div>
            <input type="date" style={inputStyle} value={due} onChange={e => setDue(e.target.value)}/>
          </div>
        </div>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 10, color: "#555", letterSpacing: 2, marginBottom: 6 }}>TAGS (comma separated)</div>
          <input style={inputStyle} value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="design, frontend, ..."/>
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ background: "none", border: "1px solid #333", color: "#555", padding: "10px 20px", borderRadius: 2, cursor: "pointer", fontFamily: "'Space Mono', monospace", fontSize: 12 }}>CANCEL</button>
          <button onClick={submit} style={{ background: "#e8ff47", border: "none", color: "#000", padding: "10px 24px", borderRadius: 2, cursor: "pointer", fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 900, letterSpacing: 1 }}>ADD TASK</button>
        </div>
      </div>
    </div>
  );
}

export default function TaskDashboard() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [dragging, setDragging] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;800;900&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  function onDropColumn(newStatus) {
    if (!dragging) return;
    setTasks(ts => ts.map(t => t.id === dragging ? { ...t, status: newStatus } : t));
    setDragging(null);
  }

  function onUpdate(updated) {
    setTasks(ts => ts.map(t => t.id === updated.id ? updated : t));
  }

  function onDelete(id) {
    setTasks(ts => ts.filter(t => t.id !== id));
  }

  function onAdd(task) {
    setTasks(ts => [task, ...ts]);
  }

  const filtered = tasks
    .filter(t => filter === "all" || t.priority === filter)
    .filter(t => !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.tags.some(tag => tag.includes(search.toLowerCase())));

  const stats = {
    total: tasks.length,
    done: tasks.filter(t => t.status === "done").length,
    overdue: tasks.filter(t => new Date(t.due) < new Date() && t.status !== "done").length,
    high: tasks.filter(t => t.priority === "high" && t.status !== "done").length,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#050505", color: "#f5f5f5", padding: "0 0 60px" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #0a0a0a; } ::-webkit-scrollbar-thumb { background: #222; }
        ::selection { background: #e8ff4744; }
        input[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.5); }
        select option { background: #0a0a0a; }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: "1px solid #111", padding: "24px 36px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "#050505", zIndex: 100 }}>
        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 900, letterSpacing: -0.5 }}>
            TASK<span style={{ color: "#e8ff47" }}>BOARD</span>
          </div>
          <div style={{ fontSize: 10, color: "#333", letterSpacing: 3, fontFamily: "'Space Mono', monospace", marginTop: 2 }}>PROJECT MANAGEMENT</div>
        </div>
        {/* Stats */}
        <div style={{ display: "flex", gap: 32, fontFamily: "'Space Mono', monospace" }}>
          {[
            { label: "TOTAL", val: stats.total, color: "#f5f5f5" },
            { label: "DONE", val: stats.done, color: "#30d158" },
            { label: "OVERDUE", val: stats.overdue, color: "#ff2d55" },
            { label: "HIGH PRI", val: stats.high, color: "#ff9f0a" },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: 9, color: "#333", letterSpacing: 2, marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <button
          onClick={() => setShowAdd(true)}
          style={{ background: "#e8ff47", border: "none", color: "#000", padding: "11px 22px", borderRadius: 2, cursor: "pointer", fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 900, letterSpacing: 1, transition: "transform 0.1s", flexShrink: 0 }}
          onMouseDown={e => e.currentTarget.style.transform = "scale(0.96)"}
          onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
        >+ NEW TASK</button>
      </div>

      {/* Filter & Search */}
      <div style={{ padding: "18px 36px", display: "flex", gap: 12, alignItems: "center", borderBottom: "1px solid #0e0e0e" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 260 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#333", fontSize: 12 }}>⌕</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tasks or tags..."
            style={{ width: "100%", background: "#0a0a0a", border: "1px solid #1a1a1a", color: "#f5f5f5", borderRadius: 2, padding: "9px 12px 9px 32px", fontSize: 12, fontFamily: "'Space Mono', monospace", outline: "none" }}
          />
        </div>
        {["all", "high", "medium", "low"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            background: filter === f ? "#e8ff47" : "transparent",
            border: `1px solid ${filter === f ? "#e8ff47" : "#222"}`,
            color: filter === f ? "#000" : "#555",
            padding: "8px 16px", borderRadius: 2, cursor: "pointer",
            fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 700, letterSpacing: 1,
            transition: "all 0.15s"
          }}>{f.toUpperCase()}</button>
        ))}
      </div>

      {/* Board */}
      <div style={{ display: "flex", gap: 20, padding: "28px 36px", overflowX: "auto" }}>
        {COLS.map(col => (
          <Column
            key={col}
            status={col}
            tasks={filtered.filter(t => t.status === col)}
            onUpdate={onUpdate}
            onDelete={onDelete}
            dragging={dragging}
            setDragging={setDragging}
            onDropColumn={onDropColumn}
          />
        ))}
      </div>

      {showAdd && <AddTaskModal onAdd={onAdd} onClose={() => setShowAdd(false)}/>}
    </div>
  );
}
