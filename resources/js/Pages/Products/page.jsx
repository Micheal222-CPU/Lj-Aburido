import { useEffect, useMemo, useState } from "react";

const ROOMS = [
  { id: 1, name: "Royal Penthouse Suite", category: "Suite", price: 480, units: 2, guests: 4, desc: "Panoramic skyline views, private lounge and marble bath.", tone: "#d4af37" },
  { id: 2, name: "Gold Leaf Executive Suite", category: "Suite", price: 320, units: 4, guests: 3, desc: "Separate living area, butler service and evening turndown.", tone: "#c9a227" },
  { id: 3, name: "Deluxe King Room", category: "Deluxe", price: 190, units: 10, guests: 2, desc: "King bed, rainfall shower and city-facing balcony.", tone: "#b8902c" },
  { id: 4, name: "Deluxe Twin Room", category: "Deluxe", price: 175, units: 8, guests: 2, desc: "Two plush beds, work desk and espresso corner.", tone: "#a67c1f" },
  { id: 5, name: "Family Residence", category: "Family", price: 260, units: 5, guests: 5, desc: "Two bedrooms, kitchenette and kids' welcome set.", tone: "#e0c068" },
  { id: 6, name: "Garden Villa", category: "Villa", price: 560, units: 2, guests: 6, desc: "Private pool, garden terrace and dedicated concierge.", tone: "#f0d78c" },
];
const CATEGORIES = ["All", "Suite", "Deluxe", "Family", "Villa"];
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
const active = (b) => ["Pending", "Confirmed", "Checked-in"].includes(b.status);
const money = (n) => "$" + Number(n).toLocaleString();
const left = (r, list) => Math.max(0, r.units - list.filter((b) => b.roomId === r.id && active(b)).length);

export default function Page() {
  const [bookings, setBookings] = useState(load);
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");
  const [selected, setSelected] = useState(null);
  const [guest, setGuest] = useState("");
  const [nights, setNights] = useState(1);
  const [toast, setToast] = useState("");

  useEffect(() => save(bookings), [bookings]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const rooms = useMemo(() => {
    let list = ROOMS.filter((r) =>
      (category === "All" || r.category === category) && r.name.toLowerCase().includes(query.toLowerCase())
    );
    if (sort === "low") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "high") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [category, query, sort]);

  const open = (r) => { setSelected(r); setGuest(""); setNights(1); };

  const place = () => {
    if (!guest.trim() || !selected) return;
    const id = bookings.length ? Math.max(...bookings.map((b) => b.id)) + 1 : 3000;
    setBookings([{ id, guest: guest.trim(), roomId: selected.id, nights, status: "Pending" }, ...bookings]);
    setToast(`Booking #${id} placed for ${guest.trim()}`);
    setSelected(null);
  };

  return (
    <div className="hp">
      <style>{css}</style>
      <div className="wrap">
        <div className="nav">
          <div className="brand">Aurum Grand Hotel</div>
          <div className="links">
            <a className="on" href="/products">Rooms</a>
            <a href="/dashboard">Dashboard</a>
          </div>
        </div>

        <h1>Rooms &amp; Suites</h1>
        <p className="sub">Handpicked stays with gold-standard service, from city suites to private villas.</p>

        <div className="toolbar">
          <input className="input" placeholder="Search rooms..." value={query} onChange={(e) => setQuery(e.target.value)} />
          <select className="input" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="featured">Featured</option>
            <option value="low">Price: low to high</option>
            <option value="high">Price: high to low</option>
          </select>
        </div>

        <div className="chips">
          {CATEGORIES.map((c) => (
            <button key={c} className={"chip " + (category === c ? "on" : "")} onClick={() => setCategory(c)}>{c}</button>
          ))}
        </div>

        {rooms.length === 0 ? (
          <div className="empty">No rooms match your search.</div>
        ) : (
          <div className="grid">
            {rooms.map((r) => {
              const n = left(r, bookings);
              return (
                <div className="card room" key={r.id}>
                  <div className="photo" style={{ background: `radial-gradient(circle at 30% 25%, ${r.tone}, #1a1405 75%)` }}>
                    <span className="tag">{r.category}</span>
                  </div>
                  <div className="body">
                    <div className="title">{r.name}</div>
                    <div className="desc">{r.desc}</div>
                    <div className="meta">
                      Up to {r.guests} guests · <span className={n <= 1 ? "low" : "ok"}>{n === 0 ? "Fully booked" : `${n} left`}</span>
                    </div>
                    <div className="foot">
                      <div className="price">{money(r.price)} <small>/ night</small></div>
                      <button className="btn" disabled={n === 0} onClick={() => open(r)}>Book now</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selected && (
        <div className="overlay" onClick={() => setSelected(null)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <h2>Your booking</h2>
            <div>
              <div style={{ fontWeight: 600 }}>{selected.name}</div>
              <div className="meta">{money(selected.price)} per night</div>
            </div>
            <div className="field">
              <label>Guest name</label>
              <input className="input" value={guest} onChange={(e) => setGuest(e.target.value)} placeholder="Full name" />
            </div>
            <div className="field">
              <label>Nights</label>
              <div className="stepper">
                <button onClick={() => setNights((n) => Math.max(1, n - 1))}>−</button>
                <span>{nights}</span>
                <button onClick={() => setNights((n) => Math.min(30, n + 1))}>+</button>
              </div>
            </div>
            <div className="summary"><span>Total</span><b>{money(selected.price * nights)}</b></div>
            <button className="btn" disabled={!guest.trim()} onClick={place}>Confirm booking</button>
            <button className="ghost" onClick={() => setSelected(null)}>Cancel</button>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

const css = `
.hp{--bg:#070706;--panel:#12100c;--panel2:#1a1711;--line:rgba(212,175,55,.18);--gold:#d4af37;--soft:#f0d78c;--text:#f5efe0;--muted:#9d9378;--danger:#e5645c;--ok:#5fd0a0;
 background:radial-gradient(1200px 500px at 0 0,rgba(212,175,55,.12),transparent 60%),var(--bg);color:var(--text);font-family:"Segoe UI",system-ui,sans-serif;min-height:100vh}
.hp *{box-sizing:border-box}
.hp .wrap{max-width:1180px;margin:0 auto;padding:28px 20px 60px}
.hp .nav{display:flex;justify-content:space-between;align-items:center;margin-bottom:28px}
.hp .brand{font-family:Georgia,serif;font-size:20px;letter-spacing:3px;color:var(--gold);text-transform:uppercase}
.hp .links{display:flex;gap:22px;font-size:14px}
.hp .links a{color:var(--muted);text-decoration:none}.hp .links a.on,.hp .links a:hover{color:var(--gold)}
.hp h1{font-family:Georgia,serif;font-size:34px;margin:0 0 4px}
.hp h2{font-family:Georgia,serif;font-size:18px;margin:0;color:var(--soft)}
.hp .sub{color:var(--muted);font-size:14px;margin:0 0 24px}
.hp button{font-family:inherit;cursor:pointer}
.hp .input{background:var(--panel);border:1px solid var(--line);border-radius:8px;color:var(--text);padding:10px 12px;font-size:14px;font-family:inherit}
.hp .input:focus{outline:none;border-color:var(--gold)}
.hp .toolbar{display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap}.hp .toolbar input{flex:1;min-width:200px}
.hp .chips{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px}
.hp .chip{background:var(--panel);color:var(--muted);border:1px solid var(--line);border-radius:999px;padding:6px 14px;font-size:13px}
.hp .chip.on{background:var(--gold);color:#1a1405;border-color:var(--gold);font-weight:700}
.hp .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:18px}
.hp .card{background:linear-gradient(180deg,var(--panel2),var(--panel));border:1px solid var(--line);border-radius:14px}
.hp .room{overflow:hidden;display:flex;flex-direction:column}
.hp .photo{height:170px;position:relative}
.hp .tag{position:absolute;top:12px;left:12px;background:rgba(0,0,0,.65);color:var(--soft);font-size:11px;letter-spacing:1.2px;text-transform:uppercase;padding:4px 10px;border-radius:999px;border:1px solid var(--line)}
.hp .body{padding:16px;display:flex;flex-direction:column;gap:8px;flex:1}
.hp .title{font-family:Georgia,serif;font-size:18px}
.hp .desc{color:var(--muted);font-size:13px;line-height:1.5;flex:1}
.hp .meta{font-size:12px;color:var(--muted)}
.hp .low{color:var(--danger)}.hp .ok{color:var(--ok)}
.hp .foot{display:flex;align-items:center;justify-content:space-between;margin-top:8px}
.hp .price{font-size:20px;font-weight:700;color:var(--soft)}.hp .price small{font-size:12px;color:var(--muted);font-weight:400}
.hp .btn{background:linear-gradient(180deg,#e6c453,#b8902c);color:#1a1405;border:none;border-radius:8px;padding:10px 18px;font-weight:700;font-size:14px}
.hp .btn:hover{filter:brightness(1.08)}.hp .btn:disabled{opacity:.4;cursor:not-allowed}
.hp .ghost{background:transparent;color:var(--gold);border:1px solid var(--line);border-radius:8px;padding:8px 12px;font-size:13px}
.hp .overlay{position:fixed;inset:0;background:rgba(0,0,0,.7);display:flex;justify-content:flex-end;z-index:50}
.hp .drawer{width:380px;max-width:100%;height:100%;background:var(--panel);border-left:1px solid var(--gold);padding:26px;display:flex;flex-direction:column;gap:16px}
.hp .field label{display:block;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:var(--muted);margin-bottom:6px}
.hp .field .input{width:100%}
.hp .stepper{display:flex;align-items:center;gap:14px}
.hp .stepper button{width:34px;height:34px;border-radius:50%;background:transparent;color:var(--gold);border:1px solid var(--line);font-size:18px}
.hp .summary{border-top:1px solid var(--line);padding-top:14px;display:flex;justify-content:space-between;font-size:18px}
.hp .summary b{color:var(--soft)}
.hp .toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--gold);color:#1a1405;padding:12px 22px;border-radius:10px;font-weight:700;z-index:60}
.hp .empty{color:var(--muted);text-align:center;padding:40px 0}
`;