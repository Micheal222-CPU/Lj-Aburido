import { useEffect, useMemo, useState } from "react";

const ROOMS = [
  { id: 1, name: "Royal Penthouse Suite", category: "Suite", price: 480, units: 2, tone: "#d4af37" },
  { id: 2, name: "Gold Leaf Executive Suite", category: "Suite", price: 320, units: 4, tone: "#c9a227" },
  { id: 3, name: "Deluxe King Room", category: "Deluxe", price: 190, units: 10, tone: "#b8902c" },
  { id: 4, name: "Deluxe Twin Room", category: "Deluxe", price: 175, units: 8, tone: "#a67c1f" },
  { id: 5, name: "Family Residence", category: "Family", price: 260, units: 5, tone: "#e0c068" },
  { id: 6, name: "Garden Villa", category: "Villa", price: 560, units: 2, tone: "#f0d78c" },
];
const CATEGORIES = ["All", "Suite", "Deluxe", "Family", "Villa"];
const STATUSES = ["Pending", "Confirmed", "Checked-in", "Checked-out", "Cancelled"];
const SEED = [
  { id: 3031, guest: "Maria Santos", roomId: 1, nights: 3, status: "Confirmed" },
  { id: 3030, guest: "John Reyes", roomId: 3, nights: 2, status: "Checked-in" },
  { id: 3029, guest: "Ana Cruz", roomId: 5, nights: 4, status: "Pending" },
  { id: 3028, guest: "Liza Gomez", roomId: 4, nights: 1, status: "Checked-out" },
  { id: 3027, guest: "Nina Lim", roomId: 2, nights: 2, status: "Checked-out" },
  { id: 3026, guest: "Carla Diaz", roomId: 6, nights: 2, status: "Cancelled" },
];
const KEY = "gold-hotel-bookings";

const load = () => {
  try { const raw = localStorage.getItem(KEY); if (raw) return JSON.parse(raw); } catch (e) {}
  return SEED;
};
const save = (list) => { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {} };
const room = (id) => ROOMS.find((r) => r.id === id);
const total = (b) => (room(b.roomId)?.price ?? 0) * b.nights;
const active = (b) => ["Pending", "Confirmed", "Checked-in"].includes(b.status);
const money = (n) => "$" + Number(n).toLocaleString();
const left = (r, list) => Math.max(0, r.units - list.filter((b) => b.roomId === r.id && active(b)).length);

export default function Dashboard() {
  const [bookings, setBookings] = useState(load);
  const [category, setCategory] = useState("All");

  useEffect(() => save(bookings), [bookings]);

  const stats = useMemo(() => ({
    total: bookings.length,
    revenue: bookings.filter((b) => b.status !== "Cancelled").reduce((s, b) => s + total(b), 0),
    inHouse: bookings.filter((b) => b.status === "Checked-in").length,
    low: ROOMS.filter((r) => left(r, bookings) <= 1).length,
  }), [bookings]);

  const setStatus = (id, status) =>
    setBookings((l) => l.map((b) => (b.id === id ? { ...b, status } : b)));
  const remove = (id) => setBookings((l) => l.filter((b) => b.id !== id));

  return (
    <div className="hd">
      <style>{css}</style>
      <div className="wrap">
        <div className="nav">
          <div className="brand">Aurum Grand Hotel</div>
          <div className="links">
            <a href="/products">Rooms</a>
            <a className="on" href="/dashboard">Dashboard</a>
          </div>
        </div>

        <h1>Hotel Dashboard</h1>
        <p className="sub">Manage bookings and keep an eye on room availability.</p>

        <div className="stats">
          <div className="card"><div className="lbl">Total bookings</div><div className="val">{stats.total}</div></div>
          <div className="card"><div className="lbl">Revenue</div><div className="val">{money(stats.revenue)}</div></div>
          <div className="card"><div className="lbl">Guests in house</div><div className="val">{stats.inHouse}</div></div>
          <div className="card"><div className="lbl">Almost full</div><div className={"val " + (stats.low ? "warn" : "")}>{stats.low}</div></div>
        </div>

        <div className="layout">
          <div className="card">
            <h2>Recent bookings</h2>
            {bookings.length === 0 ? (
              <div className="empty">No bookings yet.</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Booking</th><th>Guest</th><th>Room</th><th>Nights</th><th>Total</th><th>Status</th><th className="r">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id}>
                      <td className="id">#{b.id}</td>
                      <td>{b.guest}</td>
                      <td>{room(b.roomId)?.name}</td>
                      <td>{b.nights}</td>
                      <td>{money(total(b))}</td>
                      <td>
                        <select className={"status s-" + b.status} value={b.status} onChange={(e) => setStatus(b.id, e.target.value)}>
                          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="r"><button className="ghost danger" onClick={() => remove(b.id)}>Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="card">
            <h2>Rooms &amp; Suites</h2>
            <div className="chips">
              {CATEGORIES.map((c) => (
                <button key={c} className={"chip " + (category === c ? "on" : "")} onClick={() => setCategory(c)}>{c}</button>
              ))}
            </div>
            <div className="side">
              {ROOMS.filter((r) => category === "All" || r.category === category).map((r) => {
                const n = left(r, bookings);
                return (
                  <div className="mini" key={r.id}>
                    <div className="sw" style={{ background: `linear-gradient(135deg, ${r.tone}, #1a1405)` }} />
                    <div>
                      <div className="nm">{r.name}</div>
                      <div className="meta">
                        {money(r.price)} / night · <span className={n <= 1 ? "low" : "ok"}>{n === 0 ? "Fully booked" : `${n} left`}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const css = `
.hd{--bg:#070706;--panel:#12100c;--panel2:#1a1711;--line:rgba(212,175,55,.18);--gold:#d4af37;--soft:#f0d78c;--text:#f5efe0;--muted:#9d9378;--danger:#e5645c;--ok:#5fd0a0;--info:#6fb3ff;
 background:radial-gradient(1200px 500px at 0 0,rgba(212,175,55,.12),transparent 60%),var(--bg);color:var(--text);font-family:"Segoe UI",system-ui,sans-serif;min-height:100vh}
.hd *{box-sizing:border-box}
.hd .wrap{max-width:1180px;margin:0 auto;padding:28px 20px 60px}
.hd .nav{display:flex;justify-content:space-between;align-items:center;margin-bottom:28px}
.hd .brand{font-family:Georgia,serif;font-size:20px;letter-spacing:3px;color:var(--gold);text-transform:uppercase}
.hd .links{display:flex;gap:22px;font-size:14px}
.hd .links a{color:var(--muted);text-decoration:none}.hd .links a.on,.hd .links a:hover{color:var(--gold)}
.hd h1{font-family:Georgia,serif;font-size:34px;margin:0 0 4px}
.hd .sub{color:var(--muted);font-size:14px;margin:0 0 24px}
.hd h2{font-family:Georgia,serif;font-size:18px;margin:0 0 16px;color:var(--soft)}
.hd .card{background:linear-gradient(180deg,var(--panel2),var(--panel));border:1px solid var(--line);border-radius:14px;padding:20px}
.hd .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px}
.hd .lbl{font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted)}
.hd .val{font-size:30px;font-weight:700;margin-top:6px;color:var(--soft)}.hd .val.warn{color:var(--danger)}
.hd .layout{display:grid;grid-template-columns:1fr 340px;gap:20px;align-items:start}
.hd table{width:100%;border-collapse:collapse;font-size:14px}
.hd th{text-align:left;font-size:11px;letter-spacing:1.2px;text-transform:uppercase;color:var(--muted);padding:0 8px 10px;font-weight:500}
.hd td{padding:13px 8px;border-top:1px solid var(--line)}
.hd .id{color:var(--gold);font-weight:600}.hd .r{text-align:right}
.hd select.status{appearance:none;background:transparent;border-radius:999px;padding:4px 12px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid currentColor}
.hd select.status option{background:#12100c;color:var(--text)}
.hd .s-Pending{color:#f0a63c}.hd .s-Confirmed{color:var(--info)}.hd .s-Checked-in{color:var(--ok)}.hd .s-Checked-out{color:var(--muted)}.hd .s-Cancelled{color:var(--danger)}
.hd button{font-family:inherit;cursor:pointer}
.hd .ghost{background:transparent;color:var(--gold);border:1px solid var(--line);border-radius:8px;padding:6px 12px;font-size:12px}
.hd .ghost:hover{border-color:var(--gold)}.hd .danger{color:var(--danger);border-color:rgba(229,100,92,.35)}
.hd .chips{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px}
.hd .chip{background:var(--panel);color:var(--muted);border:1px solid var(--line);border-radius:999px;padding:6px 14px;font-size:13px}
.hd .chip.on{background:var(--gold);color:#1a1405;border-color:var(--gold);font-weight:700}
.hd .side{max-height:520px;overflow-y:auto;display:grid;gap:12px;padding-right:4px}
.hd .mini{display:flex;gap:12px;align-items:center;border:1px solid var(--line);border-radius:12px;padding:10px}
.hd .sw{width:54px;height:54px;border-radius:10px;flex:none}
.hd .nm{font-size:14px;font-weight:600}.hd .meta{font-size:12px;color:var(--muted);margin-top:2px}
.hd .low{color:var(--danger)}.hd .ok{color:var(--ok)}
.hd .empty{color:var(--muted);text-align:center;padding:40px 0}
@media(max-width:900px){.hd .layout{grid-template-columns:1fr}.hd .stats{grid-template-columns:repeat(2,1fr)}}
`;