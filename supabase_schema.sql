-- ==============================================================================
-- CAMPUS HELPDESK - SUPABASE POSTGRESQL SCHEMA SETUP
-- Run this script in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

-- 1. Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Drop existing triggers, tables, and sequence if re-running
DROP TRIGGER IF EXISTS trigger_log_request_status_change ON requests;
DROP TRIGGER IF EXISTS trigger_set_ticket_id ON requests;
DROP TRIGGER IF EXISTS trigger_update_timestamp ON requests;
DROP TABLE IF EXISTS status_history CASCADE;
DROP TABLE IF EXISTS requests CASCADE;
DROP SEQUENCE IF EXISTS ticket_id_seq;

-- 3. Create Ticket ID Sequence (Starts at 1001 -> CH-1001, CH-1002, ...)
CREATE SEQUENCE ticket_id_seq START 1001;

-- 4. Create 'requests' table with strict CHECK constraints
CREATE TABLE requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Electrical', 'Plumbing', 'IT/Network', 'Furniture', 'Cleaning', 'Security', 'Other')),
  title TEXT NOT NULL CHECK (char_length(trim(title)) >= 5 AND char_length(trim(title)) <= 80),
  description TEXT NOT NULL CHECK (char_length(trim(description)) >= 15 AND char_length(trim(description)) <= 500),
  location TEXT NOT NULL CHECK (char_length(trim(location)) >= 3),
  contact_name TEXT NOT NULL CHECK (char_length(trim(contact_name)) >= 2 AND char_length(trim(contact_name)) <= 50),
  priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
  status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Resolved')),
  staff_note TEXT,
  me_too_count INT NOT NULL DEFAULT 0 CHECK (me_too_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Create 'status_history' table
CREATE TABLE status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL CHECK (new_status IN ('Open', 'In Progress', 'Resolved')),
  note TEXT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Performance Indexes
CREATE INDEX idx_requests_ticket_id ON requests(ticket_id);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_category ON requests(category);
CREATE INDEX idx_requests_priority ON requests(priority);
CREATE INDEX idx_requests_created_at ON requests(created_at DESC);
CREATE INDEX idx_requests_me_too ON requests(me_too_count DESC);
CREATE INDEX idx_status_history_request_id ON status_history(request_id);

-- 6. Trigger: Automatically assign human-friendly ticket_id (CH-1001)
CREATE OR REPLACE FUNCTION set_ticket_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ticket_id IS NULL OR NEW.ticket_id = '' THEN
    NEW.ticket_id := 'CH-' || nextval('ticket_id_seq');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_ticket_id
BEFORE INSERT ON requests
FOR EACH ROW
EXECUTE FUNCTION set_ticket_id();

-- 7. Trigger: Automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_requests_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_timestamp
BEFORE UPDATE ON requests
FOR EACH ROW
EXECUTE FUNCTION update_requests_timestamp();

-- 8. Trigger: Automatically write history row on status change or initial creation
CREATE OR REPLACE FUNCTION log_request_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO status_history (request_id, old_status, new_status, note, changed_at)
    VALUES (
      NEW.id,
      NULL,
      NEW.status,
      COALESCE(NEW.staff_note, 'Ticket created by ' || NEW.contact_name),
      now()
    );
  ELSIF (TG_OP = 'UPDATE' AND (OLD.status IS DISTINCT FROM NEW.status OR OLD.staff_note IS DISTINCT FROM NEW.staff_note)) THEN
    IF (OLD.status IS DISTINCT FROM NEW.status) THEN
      INSERT INTO status_history (request_id, old_status, new_status, note, changed_at)
      VALUES (
        NEW.id,
        OLD.status,
        NEW.status,
        COALESCE(NEW.staff_note, 'Status updated from ' || OLD.status || ' to ' || NEW.status),
        now()
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_request_status_change
AFTER INSERT OR UPDATE ON requests
FOR EACH ROW
EXECUTE FUNCTION log_request_status_change();

-- 9. Row Level Security (RLS) - Enable for Anon Key Access
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon select requests"
  ON requests FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Allow anon insert requests"
  ON requests FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow anon update requests"
  ON requests FOR UPDATE TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon delete requests"
  ON requests FOR DELETE TO anon, authenticated
  USING (true);

CREATE POLICY "Allow anon select status_history"
  ON status_history FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Allow anon insert status_history"
  ON status_history FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- 10. Enable Supabase Realtime for table requests
ALTER PUBLICATION supabase_realtime ADD TABLE requests;

-- 11. Seed 10 realistic campus requests across all categories & statuses
INSERT INTO requests (id, ticket_id, category, title, description, location, contact_name, priority, status, staff_note, me_too_count, created_at, updated_at)
VALUES
  ('e1b1001a-82f3-4a1b-9a40-100100000001', 'CH-1001', 'IT/Network', 'Wi-Fi down in Main Library 2nd floor study area', 'The Campus-Secure Wi-Fi access point in the 2nd floor silent study room is showing No Internet Access since morning. Multiple students are unable to submit online assignments.', 'Central Library, 2nd Floor', 'Priya Sharma', 'High', 'In Progress', 'IT network engineer dispatched. Diagnosed faulty PoE switch on rack 4. Replacement switch being configured.', 14, now() - INTERVAL '4 hours', now() - INTERVAL '1 hour'),
  ('e1b1002a-82f3-4a1b-9a40-100100000002', 'CH-1002', 'Plumbing', 'Water leakage in Block B hostel 3rd floor washroom', 'Pipe joint beneath the 2nd washbasin is leaking continuously, causing water accumulation on the floor and slip hazard for residents.', 'Hostel Block B, 3rd Floor', 'Rahul Verma', 'High', 'Resolved', 'Plumbing team replaced the damaged connector gasket and tested with high pressure. Area mopped and dried.', 8, now() - INTERVAL '26 hours', now() - INTERVAL '3 hours'),
  ('e1b1003a-82f3-4a1b-9a40-100100000003', 'CH-1003', 'Electrical', 'Projector not working in Block A Room 204', 'The ceiling mounted Epson projector will not power on using the wall panel or remote. Important engineering seminar scheduled here this afternoon.', 'Academic Block A, Room 204', 'Dr. Ananya Iyer', 'High', 'Open', NULL, 5, now() - INTERVAL '2 hours', now() - INTERVAL '2 hours'),
  ('e1b1004a-82f3-4a1b-9a40-100100000004', 'CH-1004', 'Furniture', 'Broken desk chair and wobbly study table in Study Hall C', 'Chair 14 has a fractured castor wheel and Table 8 tilts heavily when pressure is applied, posing risk to laptops.', 'Student Center, Study Hall C', 'Karan Patel', 'Low', 'In Progress', 'Carpentry unit inspected. Replacement ergonomic chair assigned; table leveling screws being tightened today.', 2, now() - INTERVAL '18 hours', now() - INTERVAL '5 hours'),
  ('e1b1005a-82f3-4a1b-9a40-100100000005', 'CH-1005', 'Cleaning', 'Spilled beverage and trash overflow near Cafeteria Entrance', 'Sticky coffee spill on the main walkway and recycling bin is overflowing with food packaging.', 'North Campus Cafeteria', 'Sneha Kulkarni', 'Medium', 'Resolved', 'Sanitation crew emptied waste bins, disinfected flooring, and placed caution wet floor sign.', 4, now() - INTERVAL '12 hours', now() - INTERVAL '8 hours'),
  ('e1b1006a-82f3-4a1b-9a40-100100000006', 'CH-1006', 'Security', 'Main gate card swipe scanner intermittently failing', 'The RFID student ID scanner on Turnstile 3 fails to register cards on first tap, creating bottlenecks during morning peak entry hours.', 'South Campus Gate 2', 'Rajesh Kumar', 'High', 'Open', NULL, 19, now() - INTERVAL '6 hours', now() - INTERVAL '6 hours'),
  ('e1b1007a-82f3-4a1b-9a40-100100000007', 'CH-1007', 'IT/Network', 'Lab 3 Desktop PCs unable to reach campus intranet', 'Terminals 12 through 20 in the software engineering lab are unable to obtain DHCP IP addresses from the university subnet.', 'Computer Science Lab 302', 'Amit Roy', 'Medium', 'In Progress', 'Network patch cable issue traced to sub-switch B. New cat6 cable run in progress.', 3, now() - INTERVAL '22 hours', now() - INTERVAL '7 hours'),
  ('e1b1008a-82f3-4a1b-9a40-100100000008', 'CH-1008', 'Electrical', 'Flickering fluorescent lights causing distraction during lectures', 'The front row ceiling lights in Auditorium 2 are flickering loudly and turning off periodically.', 'Lecture Hall Complex, Audi 2', 'Meera Nambiar', 'Low', 'Resolved', 'Replaced 4 burnt-out LED ballast tubes and secured fixture wiring. Illumination test passed.', 1, now() - INTERVAL '48 hours', now() - INTERVAL '20 hours'),
  ('e1b1009a-82f3-4a1b-9a40-100100000009', 'CH-1009', 'Plumbing', 'Low water pressure and faulty tap in Mechanical Workshop sink', 'The safety eyewash station and washbasin tap in workshop 1 only dispense a faint trickle of water.', 'Engineering Workshop 1', 'Vikram Singh', 'Medium', 'Open', NULL, 0, now() - INTERVAL '10 hours', now() - INTERVAL '10 hours'),
  ('e1b1010a-82f3-4a1b-9a40-100100000010', 'CH-1010', 'Other', 'Campus shuttle bus stop bench damaged after rainstorm', 'The wooden slats on the passenger shelter bench have broken off, leaving exposed metal brackets that could snag clothes.', 'West Campus Bus Bay', 'Tanvi Deshmukh', 'Low', 'Open', NULL, 6, now() - INTERVAL '15 hours', now() - INTERVAL '15 hours');

-- Advance sequence to CH-1011 for next user submission
SELECT setval('ticket_id_seq', 1010);

-- Additional status progression history rows
INSERT INTO status_history (request_id, old_status, new_status, note, changed_at)
VALUES
  ('e1b1001a-82f3-4a1b-9a40-100100000001', 'Open', 'In Progress', 'IT network engineer dispatched. Diagnosed faulty PoE switch on rack 4. Replacement switch being configured.', now() - INTERVAL '1 hour'),
  ('e1b1002a-82f3-4a1b-9a40-100100000002', 'Open', 'In Progress', 'Plumber Kumar assigned to inspect hostel washroom plumbing line.', now() - INTERVAL '14 hours'),
  ('e1b1002a-82f3-4a1b-9a40-100100000002', 'In Progress', 'Resolved', 'Plumbing team replaced the damaged connector gasket and tested with high pressure. Area mopped and dried.', now() - INTERVAL '3 hours'),
  ('e1b1004a-82f3-4a1b-9a40-100100000004', 'Open', 'In Progress', 'Carpentry unit inspected. Replacement ergonomic chair assigned; table leveling screws being tightened today.', now() - INTERVAL '5 hours'),
  ('e1b1005a-82f3-4a1b-9a40-100100000005', 'Open', 'Resolved', 'Sanitation crew emptied waste bins, disinfected flooring, and placed caution wet floor sign.', now() - INTERVAL '8 hours'),
  ('e1b1007a-82f3-4a1b-9a40-100100000007', 'Open', 'In Progress', 'Network patch cable issue traced to sub-switch B. New cat6 cable run in progress.', now() - INTERVAL '7 hours'),
  ('e1b1008a-82f3-4a1b-9a40-100100000008', 'Open', 'Resolved', 'Replaced 4 burnt-out LED ballast tubes and secured fixture wiring. Illumination test passed.', now() - INTERVAL '20 hours');
