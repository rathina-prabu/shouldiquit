const KEY = "siq-user-uuid"

/**
 * UUID v4 generator that works in insecure browser contexts (e.g. http://192.168.x:3000
 * on a phone, where `crypto.randomUUID()` is unavailable). Uses crypto.getRandomValues
 * if present, falls back to Math.random as last resort.
 */
function uuidv4(): string {
  let bytes: Uint8Array
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    bytes = new Uint8Array(16)
    crypto.getRandomValues(bytes)
  } else {
    bytes = new Uint8Array(16)
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256)
  }
  // RFC 4122 §4.4: version + variant bits
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex: string[] = []
  for (let i = 0; i < 16; i++) hex.push(bytes[i].toString(16).padStart(2, "0"))
  const h = hex.join("")
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`
}

export function getOrCreateUserUuid(): string {
  if (typeof window === "undefined") return ""
  let id: string | null = null
  try {
    id = localStorage.getItem(KEY)
  } catch {
    // localStorage may throw in private mode or denied origins
  }
  if (!id) {
    id = uuidv4()
    try {
      localStorage.setItem(KEY, id)
    } catch {
      // best-effort; we still return the generated id for this session
    }
  }
  return id
}

export function getShortUserId(): string {
  const uuid = getOrCreateUserUuid()
  if (!uuid) return "usr_….."
  return "usr_" + uuid.replace(/-/g, "").slice(0, 5)
}
