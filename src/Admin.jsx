import { useEffect, useState } from "react"; import { api } from "./api.js"; import logo from "./assets/logo.png";
const STATUS = ["New", "Contacted", "Enrolled", "Closed"];

function Login({ onOk }) {
  const [u, setU] = useState(""), [p, setP] = useState(""), [e, setE] = useState("");
  const go = async ev => { ev.preventDefault(); try { onOk((await api("/login", { method: "POST", body: { username: u, password: p } })).token); } catch (x) { setE(x.message); } };
  return (<div className="login"><form onSubmit={go} className="form box"><img src={logo} alt="Fobas" width="96" height="64" /><h2>Admin sign in</h2>
    <input placeholder="Username" value={u} onChange={x => setU(x.target.value)} /><input placeholder="Password" type="password" value={p} onChange={x => setP(x.target.value)} />
    {e && <div className="err">{e}</div>}<button className="btn">Sign in</button></form></div>);
}

function Enquiries({ t, out }) {
  const [rows, setR] = useState(null), [q, setQ] = useState("");
  const load = () => api("/enquiries", { token: t }).then(setR).catch(e => e.message === "Unauthorized" && out());
  useEffect(() => { load(); }, []);
  const set = async (id, status) => { await api("/enquiries/" + id, { method: "PATCH", body: { status }, token: t }); load(); };
  const del = async id => { if (confirm("Delete this enquiry?")) { await api("/enquiries/" + id, { method: "DELETE", token: t }); load(); } };
  if (!rows) return <p>Loading…</p>;
  const list = rows.filter(r => (r.name + r.phone + r.course + r.email).toLowerCase().includes(q.toLowerCase()));
  return (<><div className="bar"><h2>Enquiries ({rows.length})</h2><input placeholder="Search name, phone or course" value={q} onChange={e => setQ(e.target.value)} /></div>
    {!list.length ? <p className="sub">No enquiries yet. New submissions from the website appear here.</p> :
      <div className="tbl"><table><thead><tr><th>Date</th><th>Name</th><th>Contact</th><th>Course</th><th>Message</th><th>Status</th><th></th></tr></thead><tbody>
        {list.map(r => <tr key={r.id}><td>{new Date(r.created_at).toLocaleDateString()}</td><td>{r.name}</td><td>{r.phone}<br />{r.email}</td><td>{r.course}</td><td>{r.message}</td>
          <td><select value={r.status} onChange={e => set(r.id, e.target.value)}>{STATUS.map(s => <option key={s}>{s}</option>)}</select></td><td><button className="lnk" onClick={() => del(r.id)}>Delete</button></td></tr>)}</tbody></table></div>}</>);
}

function Courses({ t, out }) {
  const blank = { title: "", category: "", duration: "", description: "" };
  const [rows, setR] = useState([]), [f, setF] = useState(blank);
  const load = () => api("/courses").then(setR);
  useEffect(() => { load(); }, []);
  const save = async e => { e.preventDefault(); try { await api(f.id ? "/courses/" + f.id : "/courses", { method: f.id ? "PUT" : "POST", body: f, token: t }); setF(blank); load(); } catch (x) { x.message === "Unauthorized" ? out() : alert(x.message); } };
  const del = async id => { if (confirm("Delete this course?")) { await api("/courses/" + id, { method: "DELETE", token: t }); load(); } };
  return (<><h2>Courses</h2><form onSubmit={save} className="form box"><h3>{f.id ? "Edit course" : "Add a course"}</h3>
    <input placeholder="Course title *" value={f.title} onChange={e => setF({ ...f, title: e.target.value })} />
    <input placeholder="Category (for example, Safety)" value={f.category} onChange={e => setF({ ...f, category: e.target.value })} />
    <input placeholder="Duration (optional)" value={f.duration} onChange={e => setF({ ...f, duration: e.target.value })} />
    <textarea rows="3" placeholder="Description" value={f.description} onChange={e => setF({ ...f, description: e.target.value })} />
    <div><button className="btn">{f.id ? "Save changes" : "Add course"}</button>{f.id && <button type="button" className="lnk" onClick={() => setF(blank)}>Cancel</button>}</div></form>
    <div className="tbl"><table><tbody>{rows.map(c => <tr key={c.id}><td><b>{c.title}</b><br /><small>{c.category} {c.duration}</small></td><td>{c.description}</td>
      <td><button className="lnk" onClick={() => { setF(c); scrollTo(0, 0); }}>Edit</button> <button className="lnk" onClick={() => del(c.id)}>Delete</button></td></tr>)}</tbody></table></div></>);
}

function Settings({ t, out }) {
  const [s, setS] = useState(null), [m, setM] = useState("");
  useEffect(() => { api("/settings").then(setS); }, []);
  if (!s) return <p>Loading…</p>;
  const save = async e => { e.preventDefault(); try { await api("/settings", { method: "PUT", body: s, token: t }); setM("Settings saved."); } catch (x) { x.message === "Unauthorized" ? out() : setM(x.message); } };
  const L = { phone: "Phone number", whatsapp: "WhatsApp number (digits with country code)", email: "Email address", address: "Address", tagline: "Institute description" };
  return (<><h2>Site settings</h2><form onSubmit={save} className="form box">{Object.keys(L).map(k => <label key={k}>{L[k]}<textarea rows={k === "address" || k === "tagline" ? 3 : 1} value={s[k] || ""} onChange={e => setS({ ...s, [k]: e.target.value })} /></label>)}
    {m && <div className="ok">{m}</div>}<button className="btn">Save settings</button></form></>);
}

export default function Admin() {
  const [t, setT] = useState(localStorage.getItem("fobas_token") || ""), [tab, setTab] = useState("enquiries");
  const out = () => { localStorage.removeItem("fobas_token"); setT(""); };
  if (!t) return <Login onOk={x => { localStorage.setItem("fobas_token", x); setT(x); }} />;
  const P = { enquiries: Enquiries, courses: Courses, settings: Settings }[tab];
  return (<div><header className="hd solid"><div className="w nav"><img src={logo} alt="Fobas" width="96" height="64" />
    <nav>{["enquiries", "courses", "settings"].map(x => <a key={x} href="#" className={tab === x ? "cur" : ""} onClick={e => { e.preventDefault(); setTab(x); }}>{x[0].toUpperCase() + x.slice(1)}</a>)}<a href="/" target="_blank">View site</a><a href="#" onClick={e => { e.preventDefault(); out(); }}>Sign out</a></nav></div></header>
    <main className="w admin"><P t={t} out={out} /></main></div>);
}
