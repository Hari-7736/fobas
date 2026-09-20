create table if not exists settings (key text primary key, value text not null default '');
create table if not exists courses (id uuid primary key default gen_random_uuid(), title text not null, category text default '', duration text default '', description text default '', sort int default 0, created_at timestamptz default now());
create table if not exists enquiries (id uuid primary key default gen_random_uuid(), name text not null, phone text not null, email text default '', course text default '', message text default '', status text default 'New', created_at timestamptz default now());
alter table settings enable row level security;
alter table courses enable row level security;
alter table enquiries enable row level security;
insert into settings (key, value) values
 ('phone','+91 86067 97539'),('whatsapp','918606797539'),('email','info@fobasgroup.com'),
 ('address','Fobas Group, Bethel Building, Kallai Rd, Near MCC Bank, Kozhikode, Kerala 673002'),
 ('tagline','Fobas Institute specializes in job-oriented courses to improve employability in today''s competitive job market.')
on conflict (key) do nothing;
insert into courses (title, category, description, sort) values
 ('Diploma and PG Diploma in Logistics','Logistics','Supply chain, warehousing, freight and logistics management for careers in the logistics sector.',1),
 ('Focused Oil and Gas Diploma','Oil & Gas','Oil and gas industry fundamentals with a focus on operations and job readiness.',2),
 ('Diploma in Fire & Safety','Safety','Fire prevention, industrial safety practices and emergency response training.',3),
 ('QA/QC Mechanical','Inspection','Quality assurance and quality control for mechanical works, inspection and documentation.',4);
