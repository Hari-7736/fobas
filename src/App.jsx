import { useEffect, useState } from "react"; import { api } from "./api.js"; import logo from "./assets/logo.png";
const WHY = [["Experienced faculty", "Learn from trainers with practical industry experience."], ["Industry-aligned curriculum", "Modules built around what employers expect from new hires."], ["Practical training", "Applied sessions and assessments alongside classroom teaching."], ["Placement assistance", "Resume preparation, interview coaching and employer connections."]];
const STEPS = [["Enquire", "Send an enquiry or call our admissions team."], ["Get counselling", "We help you choose the programme that fits your goals."], ["Enrol", "Complete registration and confirm your batch."], ["Train and get placed", "Attend classes, earn your certificate and receive placement support."]];

function Enquiry({ courses }) {
  const [d, setD] = useState({ name: "", phone: "", email: "", course: "", message: "" }); const [st, setSt] = useState(""); const [err, setErr] = useState("");
  const u = k => e => setD({ ...d, [k]: e.target.value });
  const send = async e => { e.preventDefault(); setErr(""); try { await api("/enquiries", { method: "POST", body: d }); setSt("done"); } catch (x) { setErr(x.message); } };
  if (st === "done") return <div className="ok">Thank you, {d.name}. Your enquiry has been received. Our admissions team will contact you shortly.</div>;
  return (<form onSubmit={send} className="form">
    <input placeholder="Full name *" value={d.name} onChange={u("name")} required />
    <input placeholder="Phone number *" type="tel" value={d.phone} onChange={u("phone")} required />
    <input placeholder="Email address" type="email" value={d.email} onChange={u("email")} />
    <select value={d.course} onChange={u("course")}><option value="">Select a course</option>{courses.map(c => <option key={c.id}>{c.title}</option>)}</select>
    <textarea rows="3" placeholder="Message" value={d.message} onChange={u("message")} />
    {err && <div className="err">{err}</div>}<button className="btn">Send enquiry</button></form>);
}

export default function App() {
  const [s, setS] = useState(null), [courses, setC] = useState([]), [f, setF] = useState("All");
  useEffect(() => { api("/settings").then(setS); api("/courses").then(setC); }, []);
  const [sm, setSm] = useState(false);
  useEffect(() => { const f = () => setSm(scrollY > 40); f(); addEventListener("scroll", f, { passive: true }); return () => removeEventListener("scroll", f); }, []);
  if (!s) return <p className="load">Loading…</p>;
  const cats = ["All", ...new Set(courses.map(c => c.category).filter(Boolean))];
  const map = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(s.address);
  return (<>
    <div className="top"><div className="w"><span>Kozhikode, Kerala</span><span>{s.phone} | {s.email}</span></div></div>
    <header className={"hd" + (sm ? " sm" : "")}><div className="w nav"><img src={logo} alt="Fobas" width="96" height="64" />
      <nav>{[["about", "About"], ["courses", "Courses"], ["why", "Why Fobas"], ["admission", "Admission"], ["contact", "Contact"]].map(([i, l]) => <a key={i} href={"#" + i}>{l}</a>)}<a className="btn" href="#contact">Apply now</a></nav></div></header>
    <div className="hero"><div className="w"><h1>Job-oriented training for careers in oil and gas, logistics and safety</h1><p>{s.tagline}</p>
      <a className="btn" href="#courses">View courses</a><a className="btn ghost" href="#contact">Request a callback</a></div></div>
    <section id="about"><div className="w two"><div><h2>About Fobas</h2><p className="sub">{s.tagline}</p><p>Our programmes connect classroom knowledge with what employers expect, through a structured curriculum, applied learning and mentoring, so learners can start their careers with confidence.</p></div>
      <ul className="tick">{["Structured, industry-aligned modules", "Trainers with sector experience", "Practical assessments", "Certificate on completion", "Career guidance and placement support"].map(x => <li key={x}>{x}</li>)}</ul></div></section>
    <section id="courses" className="alt"><div className="w"><h2>Our courses</h2><p className="sub">Career-oriented programmes designed around industry requirements.</p>
      <div>{cats.map(c => <button key={c} className={"chip" + (f === c ? " on" : "")} onClick={() => setF(c)}>{c}</button>)}</div>
      <div className="grid">{courses.filter(c => f === "All" || c.category === f).map(c => <div className="card" key={c.id}><small>{c.category}{c.duration && " · " + c.duration}</small><h3>{c.title}</h3><p>{c.description}</p><a href="#contact">Enquire about this course</a></div>)}</div></div></section>
    <section id="why"><div className="w"><h2>Why choose Fobas</h2><div className="grid" style={{ marginTop: 28 }}>{WHY.map(w => <div className="card" key={w[0]}><h3>{w[0]}</h3><p>{w[1]}</p></div>)}</div></div></section>
    <section id="admission" className="alt"><div className="w"><h2>How admission works</h2><div className="grid" style={{ marginTop: 28 }}>{STEPS.map((x, i) => <div className="card" key={x[0]}><small>Step {i + 1}</small><h3>{x[0]}</h3><p>{x[1]}</p></div>)}</div></div></section>
    <section id="contact"><div className="w two"><div><h2>Contact admissions</h2><p className="sub">Send your details and we will reply with course, fee and batch information.</p>
      <ul className="tick"><li>{s.address}</li><li>Phone: <a href={"tel:" + s.phone.replace(/\s/g, "")}>{s.phone}</a></li><li>Email: <a href={"mailto:" + s.email}>{s.email}</a></li><li><a href={map} target="_blank" rel="noreferrer">Get directions</a></li></ul></div><Enquiry courses={courses} /></div></section>
    <footer><div className="w"><img src={logo} alt="Fobas" width="120" height="80" /><p>{s.tagline}</p><p className="cp">© {new Date().getFullYear()} Fobas Group. All rights reserved.</p></div></footer>
    <a className="wa" href={"https://wa.me/" + s.whatsapp} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp">Chat on WhatsApp</a>
  </>);
}
