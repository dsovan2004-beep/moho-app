/**
 * MoHoLocal — Screenshot Signal Inbox Processor
 *
 * Workflow:
 *   1. Scan /signals-inbox/raw/ for image files
 *   2. Run Tesseract OCR on each image
 *   3. Classify signal type (event / lost_pet / garage_sale / business_update / community_tip)
 *   4. Extract structured fields (title, description, city, event_date, contact_url)
 *   5. POST to /submit-signal worker endpoint
 *   6. Move file to /processed (success) or /failed (unrecoverable error)
 *   7. Write log to /signals-inbox/logs/
 *
 * Usage:
 *   cd scripts && npm install && node process-signals.mjs
 *   — or from scaffold root —
 *   npm run process-signals
 *
 * All submissions land in community_submissions with needs_review = true.
 * Nothing is auto-published.
 */

import Tesseract from 'tesseract.js'
import { createClient } from '@supabase/supabase-js'
import fs        from 'fs'
import path      from 'path'
import { fileURLToPath } from 'url'
import { config as dotenvConfig } from 'dotenv'

// ── Config ────────────────────────────────────────────────────────────────────

const __dirname    = path.dirname(fileURLToPath(import.meta.url))

// Load Next.js env vars from scaffold root .env.local
dotenvConfig({ path: path.join(__dirname, '..', '.env.local') })
dotenvConfig({ path: path.join(__dirname, '..', '.env') })  // fallback

const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SCAFFOLD_DIR = path.resolve(__dirname, '..')
const SIGNALS_DIR  = path.join(SCAFFOLD_DIR, 'signals-inbox')
const RAW_DIR      = path.join(SIGNALS_DIR, 'raw')
const PROCESSED_DIR = path.join(SIGNALS_DIR, 'processed')
const FAILED_DIR   = path.join(SIGNALS_DIR, 'failed')
const LOGS_DIR     = path.join(SIGNALS_DIR, 'logs')

const WORKER_URL   = 'https://moho-ingestion.dsovan2004.workers.dev'
const SUPPORTED    = new Set(['.png', '.jpg', '.jpeg', '.webp'])

// ── Classification rules ──────────────────────────────────────────────────────

const CLASSIFICATION_RULES = {
  lost_pet: [
    'lost', 'missing', 'found pet', 'found dog', 'found cat', 'last seen',
    'reward', 'lost dog', 'lost cat', 'lost puppy', 'lost kitten',
    'missing dog', 'missing cat', 'please help find', 'collar',
    'microchipped', 'reunite',
  ],
  garage_sale: [
    'garage sale', 'yard sale', 'moving sale', 'estate sale',
    'everything must go', 'rummage sale', 'multi-family sale',
    'moving out', 'downsizing',
  ],
  event: [
    'event', 'festival', 'food truck', 'fundraiser', 'farmers market',
    'night market', 'pop-up', 'popup', 'concert', 'gathering', 'celebration',
    'block party', 'carnival', 'fair', 'show', 'workshop', 'class',
    'meetup', 'volunteer', 'church', 'school', 'annual', 'join us',
    'come out', 'free admission', 'open to all', 'community event',
    'holiday', 'trunk or treat',
  ],
  business_update: [
    'grand opening', 'now open', 'soft open', 'new location', 'new hours',
    'hours change', 'permanently closed', 'opening soon', 'now hiring',
    'we are open', 'come visit us', 'restaurant', 'salon', 'barber',
    'cafe', 'coffee shop', 'spa', 'store', 'shop', 'location',
    'special offer', 'discount', 'promotion', 'deal',
  ],
  community_tip: [
    'heads up', 'alert', 'warning', 'fyi', 'road closure', 'construction',
    'traffic', 'detour', 'announcement', 'notice', 'reminder',
    'neighborhood', 'community update', 'city update', 'local news',
    'recommendation', 'beware', 'watch out',
  ],
}

// ── City detection ─────────────────────────────────────────────────────────────

const CITY_PATTERNS = {
  'Mountain House': [
    'mountain house', 'mtn house', 'mhcsd', '95391',
    'gateway dr', 'mountain house pkwy', 'bethany rd',
  ],
  'Tracy': [
    'tracy', 'tracy ca', 'tracy, ca', '95376', '95377', '95378', '95304',
    'tracy unified', 'west valley mall', 'central park tracy',
  ],
  'Lathrop': [
    'lathrop', 'lathrop ca', 'lathrop, ca', '95330',
    'mossdale', 'lathrop road',
  ],
  'Manteca': [
    'manteca', 'manteca ca', 'manteca, ca', '95336', '95337',
    'great wolf', 'manteca park',
  ],
  'Brentwood': [
    'brentwood', 'brentwood ca', 'brentwood, ca', '94513',
    'sand creek', 'brentwood blvd',
  ],
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function classifySignal(text) {
  const lower = text.toLowerCase()
  const scores = {}

  for (const [type, keywords] of Object.entries(CLASSIFICATION_RULES)) {
    scores[type] = keywords.filter((k) => lower.includes(k)).length
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
  const [bestType, bestScore] = sorted[0]

  if (bestScore === 0) {
    return { type: 'community_tip', confidence: 0.4 }
  }

  const total = Object.values(scores).reduce((a, b) => a + b, 0)
  const confidence = Math.min(0.90, 0.50 + (bestScore / total) * 0.50)
  return { type: bestType, confidence: Math.round(confidence * 100) / 100 }
}

function detectCity(text) {
  const lower = text.toLowerCase()
  for (const [city, patterns] of Object.entries(CITY_PATTERNS)) {
    if (patterns.some((p) => lower.includes(p))) return city
  }
  return null
}

function extractTitle(text, type) {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 4 && !/^[\W\d]+$/.test(l))

  const first = lines[0] ?? ''
  if (first.length >= 10) return first.slice(0, 120)

  // Fallback: combine first two lines
  const combined = lines.slice(0, 2).join(' ').trim()
  if (combined.length >= 5) return combined.slice(0, 120)

  // Last resort generic title
  const labels = {
    event:           'Community Event',
    lost_pet:        'Lost or Found Pet',
    garage_sale:     'Garage Sale',
    business_update: 'Local Business Update',
    community_tip:   'Community Tip',
  }
  return labels[type] ?? 'Community Submission'
}

// ── Content quality checks ────────────────────────────────────────────────────

/**
 * Returns true if OCR text looks like a Facebook screenshot (not a real signal).
 * Facebook screenshots produce garbage OCR: group names, nav chrome, emoji reactions.
 */
function isFacebookScreenshot(text) {
  const lower = text.toLowerCase()
  const indicators = [
    'facebook.com/groups',
    'facebook.com/group',
    '/groups/mountainhouse',
    '/groups/tracy',
    '/groups/manteca',
    '/groups/lathrop',
    'search facebook',
    'write a comment',
    'like comment share',
    'most relevant',
    'top contributor',
    'see more',
    'view full post',
    'reactions',
    '· follow',
    'years ago',
    'months ago',
    'days ago',
  ]
  const matches = indicators.filter(i => lower.includes(i)).length
  return matches >= 2
}

/**
 * Returns true if OCR text is too garbled to be useful.
 * Detects high ratio of noise characters (|, <, >, =, ~, ^).
 */
function isGarbledText(text) {
  const noiseChars = (text.match(/[|<>=~^\\]{1}/g) || []).length
  const ratio = noiseChars / Math.max(text.length, 1)
  return ratio > 0.08  // more than 8% noise chars = garbled
}

/**
 * Returns true if the article contains crime or violence content.
 */
function isCrimeContent(text) {
  const lower = text.toLowerCase()
  const crimeKeywords = [
    'arrest', 'arrested', 'shooting', 'shot', 'stabbing', 'stabbed',
    'killed', 'murder', 'homicide', 'assault', 'robbery', 'bomb',
    'arson', 'charged', 'convicted', 'sentenced', 'jail', 'prison',
    'suspect', 'investigation', 'fatal', 'overdose',
  ]
  return crimeKeywords.some(k => lower.includes(k))
}

function extractDescription(text) {
  return text.replace(/\s{3,}/g, '\n\n').trim().slice(0, 1500)
}

function extractEventDate(text) {
  const patterns = [
    /\b(\d{1,2}\/\d{1,2}\/\d{2,4})\b/,
    /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}(?:st|nd|rd|th)?,?\s*\d{0,4}\b/i,
    /\b\d{1,2}(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december),?\s*\d{0,4}\b/i,
    /\b(sat|sun|mon|tue|wed|thu|fri)(?:urday|nday|day|sday|nesday|rsday|day)?\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}\b/i,
  ]
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      try {
        const d = new Date(match[0])
        if (!isNaN(d.getTime()) && d.getFullYear() >= 2025) {
          return d.toISOString()
        }
      } catch { /* ignore parse errors */ }
    }
  }
  return null
}

function extractContactUrl(text) {
  const match = text.match(/https?:\/\/[^\s\n"'<>]{5,}/)
  return match ? match[0].replace(/[.,;)]+$/, '') : null
}

function timestamp() {
  return new Date().toISOString()
}

function pad(n) {
  return String(n).padStart(2, '0')
}

function logFilename() {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}.log`
}

// ── Supabase image upload ─────────────────────────────────────────────────────

/**
 * Uploads the screenshot to Supabase community-images bucket.
 * Returns the public URL, or null if upload is unavailable/fails.
 */
async function uploadScreenshotImage(imagePath, filename) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null

  try {
    const supabase    = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    const imageBuffer = fs.readFileSync(imagePath)
    const ext         = path.extname(filename).toLowerCase()
    const mimeType    = (ext === '.jpg' || ext === '.jpeg') ? 'image/jpeg'
                      : ext === '.webp'                      ? 'image/webp'
                      : 'image/png'
    const safeName    = filename.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '')
    const storagePath = `signals/${Date.now()}_${safeName}`

    const { error } = await supabase.storage
      .from('community-images')
      .upload(storagePath, imageBuffer, { contentType: mimeType, upsert: false })

    if (error) {
      console.error('  ⚠️  Image upload skipped:', error.message)
      return null
    }

    const { data: { publicUrl } } = supabase.storage
      .from('community-images')
      .getPublicUrl(storagePath)

    return publicUrl
  } catch (err) {
    console.error('  ⚠️  Image upload error:', err.message)
    return null
  }
}

// ── OCR ───────────────────────────────────────────────────────────────────────

async function runOcr(imagePath) {
  const result = await Tesseract.recognize(imagePath, 'eng', {
    logger: () => {}, // suppress progress output
  })
  const text       = result.data.text ?? ''
  const confidence = result.data.confidence ?? 0   // 0–100
  return { text: text.trim(), confidence }
}

// ── Main processing loop ──────────────────────────────────────────────────────

async function processFile(filename, log) {
  const srcPath = path.join(RAW_DIR, filename)
  const ext     = path.extname(filename).toLowerCase()

  log.push(`\n── ${filename} ──────────────────────────────`)

  if (!SUPPORTED.has(ext)) {
    log.push(`  SKIP — unsupported file type: ${ext}`)
    return { status: 'skip' }
  }

  // ── OCR ──────────────────────────────────────────────────────────────────
  log.push(`  OCR starting…`)
  let ocrText = ''
  let ocrConfidence = 0

  try {
    const ocr = await runOcr(srcPath)
    ocrText       = ocr.text
    ocrConfidence = ocr.confidence
    log.push(`  OCR done — ${ocrText.length} chars, confidence ${ocrConfidence.toFixed(1)}%`)
  } catch (err) {
    log.push(`  OCR FAILED — ${err.message}`)
    moveFile(srcPath, path.join(FAILED_DIR, filename))
    log.push(`  → moved to failed/`)
    return { status: 'failed', reason: 'ocr_error' }
  }

  if (ocrText.length < 10) {
    log.push(`  OCR produced too little text (${ocrText.length} chars) — moving to failed`)
    moveFile(srcPath, path.join(FAILED_DIR, filename))
    return { status: 'failed', reason: 'ocr_empty' }
  }

  // ── Content quality checks ────────────────────────────────────────────────
  if (isFacebookScreenshot(ocrText)) {
    log.push(`  REJECTED — Facebook screenshot detected (not a valid community signal)`)
    moveFile(srcPath, path.join(FAILED_DIR, filename))
    log.push(`  → moved to failed/`)
    return { status: 'failed', reason: 'facebook_screenshot' }
  }

  if (isGarbledText(ocrText)) {
    log.push(`  REJECTED — OCR text too garbled to be useful (noise ratio too high)`)
    moveFile(srcPath, path.join(FAILED_DIR, filename))
    log.push(`  → moved to failed/`)
    return { status: 'failed', reason: 'garbled_text' }
  }

  if (isCrimeContent(ocrText)) {
    log.push(`  REJECTED — Crime/violence content detected — skipping`)
    moveFile(srcPath, path.join(FAILED_DIR, filename))
    log.push(`  → moved to failed/`)
    return { status: 'failed', reason: 'crime_content' }
  }

  // ── Classify ──────────────────────────────────────────────────────────────
  const classification = classifySignal(ocrText)
  log.push(`  Classification: ${classification.type} (confidence ${classification.confidence})`)

  // ── Extract fields ────────────────────────────────────────────────────────
  const city        = detectCity(ocrText)
  const title       = extractTitle(ocrText, classification.type)
  const description = extractDescription(ocrText)
  const eventDate   = extractEventDate(ocrText)
  const contactUrl  = extractContactUrl(ocrText)

  log.push(`  City: ${city ?? '(unknown — will need review)'}`)
  log.push(`  Title: ${title}`)
  if (eventDate)  log.push(`  Event date: ${eventDate}`)
  if (contactUrl) log.push(`  Contact URL: ${contactUrl}`)

  // ── Upload screenshot image to Supabase storage ──────────────────────────
  log.push(`  Uploading screenshot image…`)
  const imageUrl = await uploadScreenshotImage(srcPath, filename)
  if (imageUrl) {
    log.push(`  Image uploaded: ${imageUrl}`)
  } else {
    log.push(`  Image upload skipped (no Supabase env vars or upload failed)`)
  }

  // ── Build submission payload ──────────────────────────────────────────────
  const payload = {
    title,
    description,
    city:            city ?? 'Tracy',      // default to Tracy, mark low confidence
    submission_type: classification.type,
    source_file:     filename,
    raw_text:        ocrText.slice(0, 3000),
    ocr_confidence:  Math.round(ocrConfidence) / 100,  // normalize to 0–1
    confidence_score: classification.confidence,
  }

  if (eventDate)  payload.event_date  = eventDate
  if (contactUrl) payload.contact_url = contactUrl
  if (imageUrl)   payload.image_url   = imageUrl

  // If city unknown, lower confidence to trigger review
  if (!city) {
    payload.confidence_score = Math.min(payload.confidence_score, 0.5)
  }

  // ── POST to /submit-signal ────────────────────────────────────────────────
  log.push(`  POSTing to /submit-signal…`)
  try {
    const res = await fetch(`${WORKER_URL}/submit-signal`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    })

    const data = await res.json()

    if (res.ok) {
      log.push(`  ✅ Submitted — submission_id: ${data.submission_id}`)
      moveFile(srcPath, path.join(PROCESSED_DIR, filename))
      log.push(`  → moved to processed/`)
      return { status: 'success', submission_id: data.submission_id, type: classification.type, city }
    } else {
      log.push(`  ❌ Worker rejected — ${res.status}: ${JSON.stringify(data)}`)
      moveFile(srcPath, path.join(FAILED_DIR, filename))
      log.push(`  → moved to failed/`)
      return { status: 'failed', reason: 'worker_rejected', detail: data }
    }
  } catch (err) {
    log.push(`  ❌ Network error — ${err.message}`)
    moveFile(srcPath, path.join(FAILED_DIR, filename))
    log.push(`  → moved to failed/`)
    return { status: 'failed', reason: 'network_error' }
  }
}

function moveFile(src, dest) {
  // If a file with same name already exists in dest, add timestamp suffix
  if (fs.existsSync(dest)) {
    const ext  = path.extname(dest)
    const base = path.basename(dest, ext)
    const dir  = path.dirname(dest)
    dest = path.join(dir, `${base}_${Date.now()}${ext}`)
  }
  fs.renameSync(src, dest)
}

async function main() {
  // Ensure directories exist
  for (const dir of [RAW_DIR, PROCESSED_DIR, FAILED_DIR, LOGS_DIR]) {
    fs.mkdirSync(dir, { recursive: true })
  }

  const log = [
    `MoHoLocal Screenshot Signal Processor`,
    `Run started: ${timestamp()}`,
    `Worker: ${WORKER_URL}`,
    `────────────────────────────────────────`,
  ]

  // Scan raw/ for image files
  const allFiles    = fs.readdirSync(RAW_DIR)
  const imageFiles  = allFiles.filter((f) => {
    const ext = path.extname(f).toLowerCase()
    return SUPPORTED.has(ext) && !f.startsWith('.')
  })

  log.push(`\nFiles scanned: ${allFiles.length}`)
  log.push(`Image files found: ${imageFiles.length}`)

  if (imageFiles.length === 0) {
    console.log('\n📭 No images found in signals-inbox/raw/ — nothing to process.\n')
    log.push('\nNo images to process — exiting.')
    writeLog(log)
    return
  }

  console.log(`\n📸 MoHoLocal Screenshot Signal Processor`)
  console.log(`   Found ${imageFiles.length} image(s) to process\n`)

  // Track results
  const results = { success: 0, failed: 0, skipped: 0 }

  for (const filename of imageFiles) {
    console.log(`   Processing: ${filename}`)
    const result = await processFile(filename, log)

    if (result.status === 'success') {
      results.success++
      console.log(`   ✅ ${filename} → ${result.type} | ${result.city ?? 'unknown city'} | id: ${result.submission_id}`)
    } else if (result.status === 'failed') {
      results.failed++
      console.log(`   ❌ ${filename} → failed (${result.reason})`)
    } else {
      results.skipped++
      console.log(`   ⏭  ${filename} → skipped`)
    }
  }

  // Summary
  const summary = [
    `\n────────────────────────────────────────`,
    `Run complete: ${timestamp()}`,
    `  Scanned:   ${imageFiles.length}`,
    `  Submitted: ${results.success}`,
    `  Failed:    ${results.failed}`,
    `  Skipped:   ${results.skipped}`,
  ]

  log.push(...summary)

  console.log('\n' + summary.slice(1).join('\n'))
  console.log('\n   Check /admin → Community Submissions to review.\n')

  writeLog(log)
}

function writeLog(lines) {
  const logPath = path.join(LOGS_DIR, logFilename())
  fs.writeFileSync(logPath, lines.join('\n') + '\n', 'utf-8')
}

main().catch((err) => {
  console.error('\nFatal error:', err)
  process.exit(1)
})
