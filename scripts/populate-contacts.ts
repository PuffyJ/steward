import { createClient } from '@supabase/supabase-js'

// ─── Supabase setup ────────────────────────────────────────────────────────────
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
})

// ─── Enums (from src/lib/types.ts) ────────────────────────────────────────────
type Stage = 'Ready for Invitation' | 'Prayerful Discernment' | 'Needs Further Cultivation' | 'Strategic Connector' | 'Given'
type Tier = 'Tier 1' | 'Tier 2' | 'Tier 3'
type Priority = 'A - Must Cultivate' | 'B - Should Cultivate' | 'C - Maintain'
type ContactType = 'Donor' | 'Foundation' | 'Board Member' | 'Church'
type Category = 'Individual' | 'Organization'

const STAGES: Stage[] = ['Ready for Invitation', 'Prayerful Discernment', 'Needs Further Cultivation', 'Strategic Connector', 'Given']

// ─── Helpers ──────────────────────────────────────────────────────────────────
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randBetween(min: number, max: number): number {
  return Math.round(min + Math.random() * (max - min))
}

function futureDateStr(daysMin: number, daysMax: number): string {
  const d = new Date()
  d.setDate(d.getDate() + randBetween(daysMin, daysMax))
  return d.toISOString().split('T')[0]
}

// ─── Field generators ─────────────────────────────────────────────────────────

function stageFor(index: number, total: number): Stage {
  // Distribute: ~20% each across 5 stages
  const weights = [0.15, 0.25, 0.25, 0.15, 0.20]
  const thresholds = weights.reduce<number[]>((acc, w) => {
    acc.push((acc[acc.length - 1] ?? 0) + w)
    return acc
  }, [])
  const ratio = index / total
  for (let i = 0; i < thresholds.length; i++) {
    if (ratio < thresholds[i]) return STAGES[i]
  }
  return 'Given'
}

function probabilityFor(stage: Stage): number {
  const map: Record<Stage, [number, number]> = {
    'Ready for Invitation':      [0.10, 0.30],
    'Prayerful Discernment':     [0.25, 0.55],
    'Needs Further Cultivation': [0.20, 0.45],
    'Strategic Connector':       [0.50, 0.80],
    'Given':                     [0.75, 0.95],
  }
  const [lo, hi] = map[stage]
  return Math.round((lo + Math.random() * (hi - lo)) * 100) / 100
}

function capacityFor(tier: Tier): number {
  if (tier === 'Tier 1') return randBetween(50_000, 200_000)
  if (tier === 'Tier 2') return randBetween(5_000, 50_000)
  return randBetween(500, 5_000)
}

function askFor(capacity: number): number {
  const pct = 0.40 + Math.random() * 0.30 // 40–70% of capacity
  return Math.round(capacity * pct)
}

function givenFor(stage: Stage, ask: number): number {
  if (stage === 'Ready for Invitation' || stage === 'Prayerful Discernment' || stage === 'Needs Further Cultivation') {
    return 0
  }
  if (stage === 'Strategic Connector') {
    return Math.random() < 0.4 ? Math.round(ask * 0.5) : 0
  }
  // Given — likely donated
  return Math.round(ask * (0.6 + Math.random() * 0.4))
}

function forecastDateFor(stage: Stage): string | null {
  if (stage === 'Ready for Invitation' || stage === 'Needs Further Cultivation') return null
  if (stage === 'Prayerful Discernment') return Math.random() < 0.4 ? futureDateStr(60, 180) : null
  if (stage === 'Strategic Connector') return futureDateStr(14, 90)
  // Given — renewal expected in future
  return futureDateStr(30, 180)
}

const nextActions: Record<Stage, string[]> = {
  'Ready for Invitation': [
    'Send introductory email',
    'Schedule intro call',
    'Research giving history',
    'Reach out via mutual connection',
    'Request informational meeting',
  ],
  'Prayerful Discernment': [
    'Send ministry update',
    'Schedule coffee meeting',
    'Invite to upcoming event',
    'Share vision overview',
    'Plan vision briefing',
  ],
  'Needs Further Cultivation': [
    'Share impact story',
    'Follow up on last conversation',
    'Invite to site visit',
    'Send personalized update',
    'Schedule reconnect call',
  ],
  'Strategic Connector': [
    'Send formal proposal',
    'Follow up on proposal',
    'Confirm ask amount',
    'Present case for support',
    'Arrange lunch meeting',
  ],
  'Given': [
    'Send thank you letter',
    'Schedule annual update call',
    'Share year-end impact report',
    'Invite to donor appreciation event',
    'Renew conversation for next cycle',
  ],
}

function noteFor(stage: Stage, tier: Tier): string {
  const tierLabel = tier === 'Tier 1' ? 'major' : tier === 'Tier 2' ? 'mid-level' : 'new'
  const notes = [
    `${tier} ${tierLabel} donor; currently in ${stage} phase.`,
    `Strong relationship — engaged and responsive to outreach.`,
    `Referred by existing donor; warm introduction completed.`,
    `First connected at annual fundraising gala.`,
    `Long-time supporter with consistent giving history.`,
    `Interest in scholarship fund and overseas programs.`,
    `Prefers quarterly updates; no unsolicited calls.`,
    `Follow-up should reference previous conversation.`,
    `Introduced through church network; faith-aligned mission fit.`,
    `Foundation giving potential; exploring structured gift.`,
  ]
  return pick(notes)
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  // 1. Get the org
  const { data: org, error: orgErr } = await supabase
    .from('organizations')
    .select('id, name, slug')
    .limit(1)
    .single()

  if (orgErr || !org) {
    console.error('Could not fetch org:', orgErr?.message)
    process.exit(1)
  }
  console.log(`\nOrg: ${org.name} (${org.slug})`)

  // 2. Get stewards
  const { data: memberships, error: memErr } = await supabase
    .from('memberships')
    .select('id, display_name, role')
    .eq('org_id', org.id)
    .order('created_at')

  if (memErr || !memberships?.length) {
    console.error('Could not fetch memberships:', memErr?.message)
    process.exit(1)
  }
  console.log(`Stewards (${memberships.length}): ${memberships.map(m => m.display_name).join(', ')}`)

  // 3. Get all contacts
  const { data: contacts, error: conErr } = await supabase
    .from('contacts')
    .select('id, display_name')
    .eq('org_id', org.id)
    .order('created_at')

  if (conErr || !contacts?.length) {
    console.error('Could not fetch contacts:', conErr?.message)
    process.exit(1)
  }
  console.log(`Contacts to populate: ${contacts.length}\n`)

  const total = contacts.length
  const stewardCount = memberships.length

  // Tier distribution: ~15% Tier 1, ~50% Tier 2, ~35% Tier 3
  const tier1Count = Math.round(total * 0.15)
  const tier2Count = Math.round(total * 0.50)

  const regions = ['North America', 'Europe', 'Asia', 'Latin America', 'Africa', 'Oceania']
  // Weighted contact types: mostly Donor
  const contactTypes: ContactType[] = ['Donor', 'Donor', 'Donor', 'Donor', 'Foundation', 'Foundation', 'Board Member', 'Church']

  const stewardAssignments: Record<string, number> = {}
  memberships.forEach(m => (stewardAssignments[m.display_name] = 0))

  let successCount = 0
  const updates: object[] = []

  for (let idx = 0; idx < contacts.length; idx++) {
    const contact = contacts[idx]

    const tier: Tier =
      idx < tier1Count ? 'Tier 1' :
      idx < tier1Count + tier2Count ? 'Tier 2' :
      'Tier 3'

    const priority: Priority =
      tier === 'Tier 1' ? 'A - Must Cultivate' :
      tier === 'Tier 2' ? pick(['A - Must Cultivate', 'B - Should Cultivate']) :
      pick(['B - Should Cultivate', 'C - Maintain'])

    const contactType = contactTypes[idx % contactTypes.length]
    const category: Category = (contactType === 'Foundation' || contactType === 'Church') ? 'Organization' : 'Individual'
    const stage = stageFor(idx, total)
    const prob = probabilityFor(stage)
    const capacity = capacityFor(tier)
    const ask = askFor(capacity)
    const given = givenFor(stage, ask)
    const steward = memberships[idx % stewardCount]
    const nextAction = pick(nextActions[stage])
    const nextActionDate = futureDateStr(7, 60)

    const fields = {
      tier,
      priority,
      stage,
      probability: prob,
      capacity,
      ask_amount: ask,
      given_current_year: given,
      forecast_date: forecastDateFor(stage),
      contact_type: contactType,
      category,
      region: pick(regions),
      steward_id: steward.id,
      next_action: nextAction,
      next_action_date: nextActionDate,
      notes: noteFor(stage, tier),
    }

    updates.push({ id: contact.id, stewardName: steward.display_name, ...fields })
  }

  // ── Scale ask_amount to hit ~$300K pipeline total ─────────────────────────
  const TARGET_PIPELINE = 300_000
  const rawPipeline = (updates as any[]).reduce((sum, u: any) => sum + (u.ask_amount || 0), 0)
  if (rawPipeline > 0) {
    const scale = TARGET_PIPELINE / rawPipeline
    for (const u of updates as any[]) {
      if (u.ask_amount > 0) {
        u.ask_amount = Math.round(u.ask_amount * scale / 100) * 100
      }
    }
  }

  // ── Scale given_current_year to hit ~$50K total ───────────────────────────
  const TARGET_GIVING = 50_000
  const rawTotal = (updates as any[]).reduce((sum, u: any) => sum + u.given_current_year, 0)
  if (rawTotal > 0) {
    const scale = TARGET_GIVING / rawTotal
    for (const u of updates as any[]) {
      if (u.given_current_year > 0) {
        u.given_current_year = Math.round(u.given_current_year * scale / 100) * 100
      }
    }
  }

  for (const u of updates as any[]) {
    const { id, stewardName, ...fields } = u

    const { error: upErr } = await supabase
      .from('contacts')
      .update(fields)
      .eq('id', id)

    if (upErr) {
      console.error(`  ✗ ${stewardName}: ${upErr.message}`)
    } else {
      successCount++
      stewardAssignments[stewardName]++
    }
  }

  const actualPipeline = (updates as any[]).reduce((sum: number, u: any) => sum + (u.ask_amount || 0), 0)
  const actualGiven = (updates as any[]).reduce((sum: number, u: any) => sum + u.given_current_year, 0)
  console.log(`✓ ${successCount}/${total} contacts populated.`)
  console.log(`  Pipeline total: $${actualPipeline.toLocaleString()}`)
  console.log(`  Raised total:   $${actualGiven.toLocaleString()}\n`)
  console.log('Steward assignments:')
  Object.entries(stewardAssignments).forEach(([name, count]) => {
    console.log(`  ${name}: ${count} contacts`)
  })
  console.log()
}

main()
