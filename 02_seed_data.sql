-- ============================================================================
-- STEWARD CRM — Seed Data for IMT Global
-- Run AFTER 01_schema.sql
-- 
-- IMPORTANT: Before running this, create these Supabase Auth users
-- (via Dashboard > Authentication > Users > Add User):
--   1. byron@imtglobal.test    (password: steward123)
--   2. wayne@imtglobal.test    (password: steward123)
--   3. jefferson@imtglobal.test (password: steward123)
--   4. millie@imtglobal.test   (password: steward123)
--   5. paul@imtglobal.test     (password: steward123)
--
-- Then update the user_id values below with the actual UUIDs from Supabase.
-- ============================================================================

-- Organization
insert into organizations (id, name, slug) values
  ('00000000-0000-0000-0000-000000000001', 'IMT Global', 'imtglobal');

-- Memberships (update user_id with real Supabase Auth UUIDs)
-- For now using placeholder UUIDs — replace after creating auth users
insert into memberships (id, org_id, user_id, role, display_name) values
  ('m0000001-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-aaaa-0000-0000-000000000001', 'admin',   'Byron Lambert'),
  ('m0000001-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '00000000-aaaa-0000-0000-000000000002', 'steward', 'Wayne Jones'),
  ('m0000001-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '00000000-aaaa-0000-0000-000000000003', 'steward', 'Jefferson Lee'),
  ('m0000001-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', '00000000-aaaa-0000-0000-000000000004', 'steward', 'Millie Chan'),
  ('m0000001-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', '00000000-aaaa-0000-0000-000000000005', 'steward', 'Paul Stevens'),
  ('m0000001-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', '00000000-aaaa-0000-0000-000000000006', 'steward', 'Board Member 2'),
  ('m0000001-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', '00000000-aaaa-0000-0000-000000000007', 'steward', 'Board Member 3'),
  ('m0000001-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', '00000000-aaaa-0000-0000-000000000008', 'steward', 'Board Member 4');

-- Convenience: steward ID aliases
-- s1 = Byron Lambert, s2 = Wayne Jones, s3 = Jefferson Lee, s4 = Millie Chan
-- s5 = Paul Stevens, s6 = Board Member 2, s7 = Board Member 3, s8 = Board Member 4

-- ── CONTACTS ─────────────────────────────────────────────────────────────────
insert into contacts (id, org_id, display_name, organization, category, contact_type, tier, capacity, priority, region, steward_id, stage, ask_amount, probability, next_action, next_action_date, given_current_year, notes) values
-- Tier 1
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Ralf and Helga Schmidtke', 'Sasamat Foundation', 'Individual', 'Donor', 'Tier 1', 127500, 'A - Must Cultivate', 'North America', 'm0000001-0000-0000-0000-000000000001', 'Stewardship', 54052, 0.95, 'Thank you + renew conversation', '2026-04-24', 51000, 'Largest donor. Foundation potential.'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Bill Palmer', null, 'Individual', 'Donor', 'Tier 1', 101390, 'A - Must Cultivate', 'North America', 'm0000001-0000-0000-0000-000000000002', 'Stewardship', 38983, 0.95, 'Thank you + renew conversation', '2026-04-24', 40556, 'USD. Explore planned giving.'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Carrie Li & Zhen Wu (Leo)', null, 'Individual', 'Donor', 'Tier 1', 62500, 'A - Must Cultivate', 'Asia', 'm0000001-0000-0000-0000-000000000003', 'Stewardship', 26729, 0.95, 'Thank you + renew conversation', '2026-06-03', 25000, 'Major Asia donor.'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Natalie', null, 'Individual', 'Donor', 'Tier 1', 40000, 'A - Must Cultivate', 'North America', 'm0000001-0000-0000-0000-000000000002', 'Negotiation', 18158, 0.75, 'Finalize ask amount + terms', '2026-04-07', 20000, 'Full pledge outstanding.'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Charis Good News Foundation', 'Charis Good News Foundation', 'Organization', 'Foundation', 'Tier 1', 49500, 'A - Must Cultivate', 'North America', 'm0000001-0000-0000-0000-000000000002', 'Negotiation', 16934, 0.75, 'Finalize ask amount + terms', '2026-04-18', 16500, 'David Sayson contact. $15K forecast.'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Clive and Michelle Lim', null, 'Individual', 'Donor', 'Tier 1', 20000, 'B - Should Cultivate', 'Asia', 'm0000001-0000-0000-0000-000000000004', 'Solicitation', 10790, 0.60, 'Present specific ask', '2026-06-14', 10000, 'Consistent. Singapore.'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Gordon Dobson-Mack', null, 'Individual', 'Donor', 'Tier 1', 20000, 'B - Should Cultivate', 'North America', 'm0000001-0000-0000-0000-000000000002', 'Solicitation', 10123, 0.60, 'Present specific ask', '2026-05-26', 10000, 'Reliable annual.'),

-- Tier 2
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Albert Erisman', null, 'Individual', 'Donor', 'Tier 2', 25539, 'A - Must Cultivate', 'North America', 'm0000001-0000-0000-0000-000000000007', 'Cultivation', 9276, 0.35, 'Deepen relationship + explore alignment', '2026-04-23', 8513, 'USD. Marketplace champion.'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', '527116 BC LTD', '527116 BC LTD', 'Organization', 'Donor', 'Tier 2', 25515, 'A - Must Cultivate', 'North America', 'm0000001-0000-0000-0000-000000000006', 'Cultivation', 8377, 0.35, 'Deepen relationship + explore alignment', '2026-04-07', 8505, 'Dale & Linda Barkman.'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Daughter of Bill Palmer', null, 'Individual', 'Donor', 'Tier 2', 21051, 'B - Should Cultivate', 'North America', 'm0000001-0000-0000-0000-000000000006', 'Cultivation', 6494, 0.35, 'Deepen relationship + explore alignment', '2026-05-04', 7017, 'USD. Connected through Bill.'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Vincent and Julia Tang', null, 'Individual', 'Donor', 'Tier 2', 18450, 'B - Should Cultivate', 'Asia', 'm0000001-0000-0000-0000-000000000004', 'Cultivation', 6838, 0.35, 'Deepen relationship + explore alignment', '2026-06-09', 6150, 'Hong Kong. Consistent.'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Anonymous Donor (DK Korea)', null, 'Individual', 'Donor', 'Tier 2', 17400, 'B - Should Cultivate', 'Asia', 'm0000001-0000-0000-0000-000000000003', 'Cultivation', 6278, 0.35, 'Deepen relationship + explore alignment', '2026-06-04', 5800, 'Korea. $2.9K forecast.'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Wilson Chan', null, 'Individual', 'Donor', 'Tier 2', 16500, 'B - Should Cultivate', 'North America', 'm0000001-0000-0000-0000-000000000006', 'Cultivation', 5058, 0.35, 'Deepen relationship + explore alignment', '2026-05-27', 5500, 'Local. Networking potential.'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Andre Chen', null, 'Individual', 'Donor', 'Tier 2', 15000, 'B - Should Cultivate', 'North America', 'm0000001-0000-0000-0000-000000000005', 'Cultivation', 5221, 0.35, 'Deepen relationship + explore alignment', '2026-04-02', 5000, 'Marketplace leader. Growth.'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Morgan Stanley', 'Morgan Stanley', 'Organization', 'Donor', 'Tier 2', 15000, 'B - Should Cultivate', 'North America', 'm0000001-0000-0000-0000-000000000005', 'Cultivation', 5466, 0.35, 'Deepen relationship + explore alignment', '2026-04-28', 5000, 'Corporate match. David Hataj.'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Anonymous Others', null, 'Individual', 'Donor', 'Tier 2', 14604, 'B - Should Cultivate', 'North America', 'm0000001-0000-0000-0000-000000000008', 'Cultivation', 5435, 0.35, 'Deepen relationship + explore alignment', '2026-05-09', 4868, 'Pooled anonymous.'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Anonymous USD', null, 'Individual', 'Donor', 'Tier 2', 11541, 'B - Should Cultivate', 'North America', 'm0000001-0000-0000-0000-000000000006', 'Cultivation', 4073, 0.35, 'Deepen relationship + explore alignment', '2026-05-06', 3847, 'Anonymous USD.'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Hunter Zou', null, 'Individual', 'Donor', 'Tier 2', 10950, 'B - Should Cultivate', 'North America', 'm0000001-0000-0000-0000-000000000001', 'Cultivation', 3609, 0.35, 'Deepen relationship + explore alignment', '2026-05-23', 3650, 'Growing. Engage deeper.'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'R. Paul Stevens', null, 'Individual', 'Board Member', 'Tier 2', 9000, 'B - Should Cultivate', 'North America', 'm0000001-0000-0000-0000-000000000005', 'Cultivation', 3156, 0.35, 'Deepen relationship + explore alignment', '2026-04-18', 3000, 'Board member.'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Byron Lambert', null, 'Individual', 'Board Member', 'Tier 2', 8190, 'B - Should Cultivate', 'North America', 'm0000001-0000-0000-0000-000000000001', 'Cultivation', 2954, 0.35, 'Deepen relationship + explore alignment', '2026-04-15', 2730, 'Board member. USD.'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'MacKenzie Foundation', 'The Foundation Office', 'Organization', 'Foundation', 'Tier 2', 7500, 'B - Should Cultivate', 'North America', 'm0000001-0000-0000-0000-000000000006', 'Cultivation', 2487, 0.35, 'Deepen relationship + explore alignment', '2026-06-08', 2500, 'Mark McLean. Multiple foundations.'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Timothy Chan', null, 'Individual', 'Donor', 'Tier 2', 6150, 'B - Should Cultivate', 'North America', 'm0000001-0000-0000-0000-000000000002', 'Cultivation', 2276, 0.35, 'Deepen relationship + explore alignment', '2026-04-08', 2050, 'Consistent mid-level.'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Rebecca Ou', null, 'Individual', 'Donor', 'Tier 2', 6000, 'B - Should Cultivate', 'North America', 'm0000001-0000-0000-0000-000000000001', 'Cultivation', 2202, 0.35, 'Deepen relationship + explore alignment', '2026-05-09', 2000, 'Reliable annual.'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Hiep Nguyen', null, 'Individual', 'Donor', 'Tier 2', 6000, 'B - Should Cultivate', 'North America', 'm0000001-0000-0000-0000-000000000006', 'Cultivation', 1905, 0.35, 'Deepen relationship + explore alignment', '2026-06-23', 2000, 'Consistent.'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Wai Yen Chan (Millie Chan)', null, 'Individual', 'Board Member', 'Tier 2', 6000, 'B - Should Cultivate', 'North America', 'm0000001-0000-0000-0000-000000000004', 'Cultivation', 1906, 0.35, 'Deepen relationship + explore alignment', '2026-05-13', 2000, 'Board member.'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'West Point Grey Baptist Church', 'West Point Grey Baptist Church', 'Organization', 'Church', 'Tier 2', 3000, 'C - Maintain', 'North America', 'm0000001-0000-0000-0000-000000000004', 'Cultivation', 1681, 0.35, 'Deepen relationship + explore alignment', '2026-05-05', 1500, 'Church partner.'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Sun Nan Jonathan Sun', null, 'Individual', 'Donor', 'Tier 2', 3000, 'C - Maintain', 'North America', 'm0000001-0000-0000-0000-000000000004', 'Cultivation', 934, 0.35, 'Deepen relationship + explore alignment', '2026-06-18', 1000, 'Toronto-based.'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Granville Chapel', 'Granville Chapel', 'Organization', 'Church', 'Tier 2', 2000, 'C - Maintain', 'North America', 'm0000001-0000-0000-0000-000000000007', 'Cultivation', 1086, 0.35, 'Deepen relationship + explore alignment', '2026-05-19', 1000, 'Church partner.'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Aaron Tsang', null, 'Individual', 'Donor', 'Tier 2', 3000, 'C - Maintain', 'North America', 'm0000001-0000-0000-0000-000000000008', 'Cultivation', 990, 0.35, 'Deepen relationship + explore alignment', '2026-04-17', 1000, 'Annual giver.'),

-- Tier 3
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Dr. Glen and Ms Joyce Manning', null, 'Individual', 'Donor', 'Tier 3', 3750, 'C - Maintain', 'North America', 'm0000001-0000-0000-0000-000000000001', 'Qualification', 692, 0.15, 'Initial discovery meeting', '2026-04-28', 750, 'Growth potential.'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Peter Chan', null, 'Individual', 'Donor', 'Tier 3', 3430, 'C - Maintain', 'North America', 'm0000001-0000-0000-0000-000000000007', 'Qualification', 643, 0.15, 'Initial discovery meeting', '2026-04-26', 686, 'Consistent small.'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Phoebe Wong', null, 'Individual', 'Donor', 'Tier 3', 4500, 'C - Maintain', 'North America', 'm0000001-0000-0000-0000-000000000008', 'Qualification', 944, 0.15, 'Initial discovery meeting', '2026-05-13', 900, '$400 forecast.'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Graham Lee', null, 'Individual', 'Donor', 'Tier 3', 2500, 'C - Maintain', 'North America', 'm0000001-0000-0000-0000-000000000002', 'Qualification', 516, 0.15, 'Initial discovery meeting', '2026-06-28', 500, null),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Flow Foundation Inc', 'Flow Foundation Inc', 'Organization', 'Foundation', 'Tier 3', 1500, 'C - Maintain', 'North America', 'm0000001-0000-0000-0000-000000000004', 'Qualification', 535, 0.15, 'Initial discovery meeting', '2026-04-22', 500, 'USD. Don Flow. Small initial.'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Wayne Wong', null, 'Individual', 'Donor', 'Tier 3', 2500, 'C - Maintain', 'North America', 'm0000001-0000-0000-0000-000000000004', 'Qualification', 546, 0.15, 'Initial discovery meeting', '2026-05-04', 500, null),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Paul Cho', null, 'Individual', 'Donor', 'Tier 3', 2500, 'C - Maintain', 'Asia', 'm0000001-0000-0000-0000-000000000007', 'Qualification', 504, 0.15, 'Initial discovery meeting', '2026-05-01', 500, null),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Sean Tan', null, 'Individual', 'Donor', 'Tier 3', 2500, 'C - Maintain', 'Asia', 'm0000001-0000-0000-0000-000000000004', 'Qualification', 559, 0.15, 'Initial discovery meeting', '2026-05-17', 500, null),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Tunyi and Annile', null, 'Individual', 'Donor', 'Tier 3', 2500, 'C - Maintain', 'Asia', 'm0000001-0000-0000-0000-000000000007', 'Qualification', 513, 0.15, 'Initial discovery meeting', '2026-04-28', 500, null),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Michael Low', null, 'Individual', 'Donor', 'Tier 3', 2500, 'C - Maintain', 'Asia', 'm0000001-0000-0000-0000-000000000004', 'Qualification', 487, 0.15, 'Initial discovery meeting', '2026-06-20', 500, null),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Damon Mak', null, 'Individual', 'Donor', 'Tier 3', 2500, 'C - Maintain', 'North America', 'm0000001-0000-0000-0000-000000000002', 'Qualification', 469, 0.15, 'Initial discovery meeting', '2026-04-18', 500, null),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Chin Yeow Micha Low', null, 'Individual', 'Donor', 'Tier 3', 2500, 'C - Maintain', 'Asia', 'm0000001-0000-0000-0000-000000000004', 'Qualification', 524, 0.15, 'Initial discovery meeting', '2026-05-01', 500, null),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Sharon and Darryle Johnson', null, 'Individual', 'Donor', 'Tier 3', 2500, 'C - Maintain', 'North America', 'm0000001-0000-0000-0000-000000000002', 'Qualification', 566, 0.15, 'Initial discovery meeting', '2026-05-08', 500, null),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Jackson Lam', null, 'Individual', 'Donor', 'Tier 3', 2500, 'C - Maintain', 'North America', 'm0000001-0000-0000-0000-000000000001', 'Qualification', 480, 0.15, 'Initial discovery meeting', '2026-06-03', 500, null),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Liu Vincent and Jenny Chen', null, 'Individual', 'Donor', 'Tier 3', 2500, 'C - Maintain', 'Asia', 'm0000001-0000-0000-0000-000000000007', 'Qualification', 541, 0.15, 'Initial discovery meeting', '2026-04-25', 500, null),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Hung Chi Ling (Thomas)', null, 'Individual', 'Donor', 'Tier 3', 2500, 'C - Maintain', 'Asia', 'm0000001-0000-0000-0000-000000000003', 'Qualification', 545, 0.15, 'Initial discovery meeting', '2026-04-22', 500, null),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Walton Pang', null, 'Individual', 'Donor', 'Tier 3', 2500, 'C - Maintain', 'North America', 'm0000001-0000-0000-0000-000000000007', 'Qualification', 568, 0.15, 'Initial discovery meeting', '2026-04-09', 500, null),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Thomas Choi', null, 'Individual', 'Donor', 'Tier 3', 2500, 'C - Maintain', 'North America', 'm0000001-0000-0000-0000-000000000005', 'Qualification', 570, 0.15, 'Initial discovery meeting', '2026-06-25', 500, null);

-- ── INTERACTIONS ──────────────────────────────────────────────────────────────
-- Note: contact_id references need to be updated after contacts are inserted.
-- This uses a subquery to look up contacts by display_name.

insert into interactions (org_id, contact_id, date, type, summary, outcome, next_step, follow_up_date, logged_by)
select '00000000-0000-0000-0000-000000000001', c.id, i.date::date, i.type, i.summary, i.outcome, i.next_step, i.follow_up::date, m.id
from (values
  ('Ralf and Helga Schmidtke', '2026-03-01', 'Phone Call', 'Discussed 2026/27 giving. Very positive.', 'Positive', 'Schedule in-person meeting', '2026-03-15', 'Byron Lambert'),
  ('Ralf and Helga Schmidtke', '2026-03-10', 'Coffee Meeting', 'Foundation giving potential. Exploring structured gift.', 'Positive', 'Send foundation proposal', '2026-04-01', 'Byron Lambert'),
  ('Bill Palmer', '2026-02-15', 'Phone Call', 'Annual check-in. Discussed legacy giving.', 'Positive', 'Send planned giving info', '2026-03-01', 'Wayne Jones'),
  ('Bill Palmer', '2026-03-05', 'Email', 'Sent planned giving brochure. Shared with daughter.', 'Positive', 'Follow up in 2 weeks', '2026-03-20', 'Wayne Jones'),
  ('Carrie Li & Zhen Wu (Leo)', '2026-01-20', 'Vision Briefing', 'Asia expansion plans. Excited about Fellows.', 'Positive', 'Connect with Millie', '2026-02-15', 'Jefferson Lee'),
  ('Natalie', '2026-03-12', 'Personal Outreach', 'Called about pledge. Confirmed Q4 commitment.', 'Needs Follow-Up', 'Follow up end of Q3', '2026-06-15', 'Wayne Jones'),
  ('Charis Good News Foundation', '2026-02-20', 'Email', 'David Sayson confirmed $15K remaining.', 'Positive', 'Submit grant report', '2026-03-30', 'Wayne Jones'),
  ('Clive and Michelle Lim', '2026-03-08', 'Vision Briefing', 'Fellows impact stories. Strong resonance.', 'Positive', 'Invite to Singapore gathering', '2026-04-10', 'Millie Chan'),
  ('Gordon Dobson-Mack', '2026-01-10', 'Coffee Meeting', 'Committed to similar level 2026/27.', 'Positive', 'Send thank you + report', '2026-02-01', 'Wayne Jones'),
  ('Albert Erisman', '2026-03-15', 'Phone Call', 'Marketplace integration. Very aligned.', 'Positive', 'Send Fellows update', '2026-04-01', 'Board Member 3'),
  ('West Point Grey Baptist Church', '2026-02-28', 'Email', 'Missions committee reviewing partnership.', 'Neutral', 'Present to committee', '2026-04-15', 'Millie Chan'),
  ('Hunter Zou', '2026-03-01', 'Personal Outreach', 'Getting involved. Asked about volunteering.', 'Positive', 'Invite to next event', '2026-04-01', 'Byron Lambert'),
  ('Wilson Chan', '2026-02-10', 'Coffee Meeting', 'Wants to connect us with network.', 'Positive', 'Strategic connector intro', '2026-03-15', 'Board Member 2'),
  ('R. Paul Stevens', '2026-03-18', 'Phone Call', 'Board fundraising strategy. Offered intros.', 'Positive', 'Set up intro meetings', '2026-04-05', 'Paul Stevens'),
  ('Granville Chapel', '2026-03-05', 'Phone Call', 'Missions Sunday presentation. Receptive.', 'Positive', 'Confirm presentation date', '2026-04-15', 'Board Member 3'),
  ('Vincent and Julia Tang', '2026-02-20', 'Vision Briefing', 'Asia vision dinner in Hong Kong.', 'Positive', 'Follow up with specific ask', '2026-03-20', 'Millie Chan'),
  ('Andre Chen', '2026-03-10', 'Coffee Meeting', 'Exploring major gift potential.', 'Positive', 'Invite to retreat', '2026-04-20', 'Paul Stevens'),
  ('Timothy Chan', '2026-03-20', 'Phone Call', 'Open to increasing gift.', 'Positive', 'Send giving opportunities', '2026-04-10', 'Wayne Jones')
) as i(contact_name, date, type, summary, outcome, next_step, follow_up, steward_name)
join contacts c on c.display_name = i.contact_name and c.org_id = '00000000-0000-0000-0000-000000000001'
join memberships m on m.display_name = i.steward_name and m.org_id = '00000000-0000-0000-0000-000000000001';
