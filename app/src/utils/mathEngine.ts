import { randomUUID, createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto'

// Derive a secure 32-byte key directly from the user's existing Supabase URL to keep it zero-config
const getSecretKey = () => 
  createHash('sha256')
    .update(process.env.NEXT_PUBLIC_SUPABASE_URL || 'fallback_dev_key_secure_01')
    .digest()

function encryptPayload(answer: number, timestamp: number, equation: string, rank: string): string {
  const iv = randomBytes(12)
  const key = getSecretKey()
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  
  const text = JSON.stringify({ a: answer, t: timestamp, e: equation, r: rank })
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const authTag = cipher.getAuthTag()

  return `${iv.toString('hex')}.${authTag.toString('hex')}.${encrypted}`
}

export function verifyPayload(payload: string, userAnswer: number, timeSpentMs: number) {
  try {
    const [ivHex, authTagHex, encryptedHex] = payload.split('.')
    const key = getSecretKey()
    const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(ivHex, 'hex'))
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'))
    
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    const parsed = JSON.parse(decrypted)
    const timeSinceGenerate = Date.now() - parsed.t
    
    // Strict Anti Cheat validations
    if (parsed.a !== userAnswer) return { success: false, reason: 'wrong_answer', equation: parsed.e, rank: parsed.r }
    if (timeSpentMs < 300) return { success: false, reason: 'impossible_speed', equation: parsed.e, rank: parsed.r }
    
    // Ensure the payload isn't recycled or arbitrarily generated hours ago (10 mins max)
    if (timeSinceGenerate > 600000) return { success: false, reason: 'payload_expired', equation: parsed.e, rank: parsed.r }

    return { success: true, equation: parsed.e, rank: parsed.r }
  } catch(e) {
    return { success: false, reason: 'invalid_encryption' }
  }
}

// ----------------------------------------------------
// MATH GENERATION LOGIC
// ----------------------------------------------------

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function getBossRank(currentRank: string): string {
  const levels = ['E', 'D', 'C', 'B', 'A', 'S', 'NATIONAL_LEVEL']
  const idx = levels.indexOf(currentRank)
  if (idx === -1) return 'C'
  return levels[Math.min(idx + 2, levels.length - 1)]
}

export function generateProblem(rank: string = 'E') {
  let equation = ''
  let answer = 0
  let timeLimitMs = 10000
  let baseXp = 10
  let type = 'Mixed'

  switch (rank.toUpperCase()) {
    case 'E':
      // Single digit add/sub
      const opE = Math.random() > 0.5 ? '+' : '-'
      const n1E = rand(2, 9), n2E = rand(1, 9)
      equation = opE === '+' ? `${n1E} + ${n2E}` : `${Math.max(n1E, n2E)} - ${Math.min(n1E, n2E)}`
      answer = opE === '+' ? n1E + n2E : Math.max(n1E, n2E) - Math.min(n1E, n2E)
      timeLimitMs = 8000
      baseXp = 15
      type = 'Basic Arithmetic'
      break;

    case 'D':
      // Multi-digit add/sub or single-digit mult
      if (Math.random() > 0.6) {
        const n1D = rand(3, 9), n2D = rand(3, 9)
        equation = `${n1D} × ${n2D}`
        answer = n1D * n2D
        type = 'Multiplication'
      } else {
        const opD = Math.random() > 0.5 ? '+' : '-'
        const aD = rand(15, 99), bD = rand(10, 50)
        equation = opD === '+' ? `${aD} + ${bD}` : `${Math.max(aD, bD)} - ${Math.min(aD, bD)}`
        answer = opD === '+' ? aD + bD : Math.max(aD, bD) - Math.min(aD, bD)
        type = 'Double Digit'
      }
      timeLimitMs = 6000
      baseXp = 30
      break;

    case 'C':
      // Multi-digit multiplication & division
      if (Math.random() > 0.5) {
        const c1 = rand(11, 20), c2 = rand(3, 12)
        equation = `${c1} × ${c2}`
        answer = c1 * c2
        type = 'Multiplication'
      } else {
        const div = rand(3, 12), ans = rand(11, 25)
        equation = `${div * ans} ÷ ${div}`
        answer = ans
        type = 'Division'
      }
      timeLimitMs = 8000
      baseXp = 50
      break;

    case 'B':
      // 3-step mixed operations
      const b1 = rand(5, 15), b2 = rand(3, 9), b3 = rand(10, 30)
      equation = `(${b1} × ${b2}) + ${b3}`
      answer = (b1 * b2) + b3
      timeLimitMs = 10000
      baseXp = 80
      type = 'Mixed Operations'
      break;

    case 'A':
      // Complex Multi-Step
      const a1 = rand(11, 30), a2 = rand(5, 12), a3 = rand(2, 9)
      equation = `${a1} × ${a2} × ${a3}`
      answer = a1 * a2 * a3
      timeLimitMs = 15000
      baseXp = 150
      type = 'Heavy Multiplication'
      break;

    case 'S':
      // As seen in design.html (e.g. 847 x 23)
      const s1 = rand(100, 999), s2 = rand(10, 99)
      equation = `${s1} × ${s2}`
      answer = s1 * s2
      timeLimitMs = 20000
      baseXp = 400
      type = 'Elite S-Tier'
      break;

    case 'NATIONAL_LEVEL':
      // Mind breaking
      const n1 = rand(1000, 9999), n2 = rand(11, 99), n3 = rand(100, 999)
      equation = `(${n1} × ${n2}) - ${n3}`
      answer = (n1 * n2) - n3
      timeLimitMs = 25000
      baseXp = 800
      type = 'National Calamity'
      break;

    default:
      equation = `1 + 1`
      answer = 2
  }

  return {
    id: randomUUID(),
    equation,
    payload: encryptPayload(answer, Date.now(), equation, rank), // Server encrypts answer and telemetry natively
    timeLimitMs,
    baseXp,
    type,
    rank
  }
}
