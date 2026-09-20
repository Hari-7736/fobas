import express from "express"; import cors from "cors"; import jwt from "jsonwebtoken"; import { createClient } from "@supabase/supabase-js";
const { SUPABASE_URL = "http://localhost", SUPABASE_SERVICE_KEY = "missing", ADMIN_USER = "admin", ADMIN_PASS, JWT_SECRET } = process.env;
const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });
const app = express(); app.use(cors(), express.json());
const str = (v, n = 500) => String(v ?? "").slice(0, n);
const KEYS = ["phone", "whatsapp", "email", "address", "tagline"];
const send = (s, p) => p.then(({ data, error }) => error ? s.status(500).json({ error: "Database error. Please try again." }) : s.json(data ?? { ok: true }));
const auth = (q, s, n) => { try { jwt.verify((q.headers.authorization || "").replace("Bearer ", ""), JWT_SECRET); n(); } catch { s.status(401).json({ error: "Unauthorized" }); } };
const cf = b => ({ title: str(b.title, 120), category: str(b.category, 60), duration: str(b.duration, 60), description: str(b.description, 600) });

app.post("/api/login", (q, s) => {
  if (!ADMIN_PASS || !JWT_SECRET) return s.status(500).json({ error: "Server is not configured. Set ADMIN_PASS and JWT_SECRET." });
  const { username, password } = q.body || {};
  if (username === ADMIN_USER && password === ADMIN_PASS) return s.json({ token: jwt.sign({ u: username }, JWT_SECRET, { expiresIn: "8h" }) });
  s.status(401).json({ error: "Invalid username or password" });
});
app.get("/api/settings", async (q, s) => { const { data, error } = await sb.from("settings").select("key,value"); if (error) return s.status(500).json({ error: "Database error" }); s.json(Object.fromEntries(data.map(r => [r.key, r.value]))); });
app.put("/api/settings", auth, (q, s) => send(s, sb.from("settings").upsert(KEYS.filter(k => k in q.body).map(k => ({ key: k, value: str(q.body[k]) })))));
app.get("/api/courses", (q, s) => send(s, sb.from("courses").select("*").order("sort").order("created_at")));
app.post("/api/courses", auth, (q, s) => q.body.title ? send(s, sb.from("courses").insert(cf(q.body)).select().single()) : s.status(400).json({ error: "Title is required" }));
app.put("/api/courses/:id", auth, (q, s) => send(s, sb.from("courses").update(cf(q.body)).eq("id", q.params.id)));
app.delete("/api/courses/:id", auth, (q, s) => send(s, sb.from("courses").delete().eq("id", q.params.id)));
app.post("/api/enquiries", (q, s) => { const b = q.body || {}; if (!b.name || !b.phone) return s.status(400).json({ error: "Name and phone number are required" });
  send(s, sb.from("enquiries").insert({ name: str(b.name, 100), phone: str(b.phone, 30), email: str(b.email, 120), course: str(b.course, 120), message: str(b.message, 1000) })); });
app.get("/api/enquiries", auth, (q, s) => send(s, sb.from("enquiries").select("*").order("created_at", { ascending: false })));
app.patch("/api/enquiries/:id", auth, (q, s) => send(s, sb.from("enquiries").update({ status: str(q.body.status, 20) }).eq("id", q.params.id)));
app.delete("/api/enquiries/:id", auth, (q, s) => send(s, sb.from("enquiries").delete().eq("id", q.params.id)));
export default app;
