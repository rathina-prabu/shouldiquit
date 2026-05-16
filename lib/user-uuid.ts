const KEY = "siq-user-uuid"

export function getOrCreateUserUuid(): string {
  if (typeof window === "undefined") return ""
  let id = localStorage.getItem(KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(KEY, id)
  }
  return id
}

export function getShortUserId(): string {
  const uuid = getOrCreateUserUuid()
  if (!uuid) return "usr_….."
  return "usr_" + uuid.replace(/-/g, "").slice(0, 5)
}
