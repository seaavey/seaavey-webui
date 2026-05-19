const API_BASE = "http://localhost:8080/api"

export async function fetchStats() {
  const res = await fetch(`${API_BASE}/stats`)
  return res.json()
}

export async function fetchChartData() {
  const res = await fetch(`${API_BASE}/stats/chart`)
  return res.json()
}

export async function fetchActivity() {
  const res = await fetch(`${API_BASE}/stats/activity`)
  return res.json()
}

export async function fetchUsers() {
  const res = await fetch(`${API_BASE}/users`)
  return res.json()
}

export async function updateUser(jid: string, data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/users/${jid}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function banUser(jid: string) {
  const res = await fetch(`${API_BASE}/users/${jid}/ban`, { method: "POST" })
  return res.json()
}

export async function unbanUser(jid: string) {
  const res = await fetch(`${API_BASE}/users/${jid}/unban`, { method: "POST" })
  return res.json()
}

export async function fetchGroups() {
  const res = await fetch(`${API_BASE}/groups`)
  return res.json()
}

export async function updateGroup(jid: string, data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/groups/${jid}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function muteGroup(jid: string) {
  const res = await fetch(`${API_BASE}/groups/${jid}/mute`, { method: "POST" })
  return res.json()
}

export async function unmuteGroup(jid: string) {
  const res = await fetch(`${API_BASE}/groups/${jid}/unmute`, { method: "POST" })
  return res.json()
}

export async function fetchCommands() {
  const res = await fetch(`${API_BASE}/commands`)
  return res.json()
}

export async function updateCommand(name: string, data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/commands/${name}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function enableCommand(name: string) {
  const res = await fetch(`${API_BASE}/commands/${name}/enable`, { method: "POST" })
  return res.json()
}

export async function disableCommand(name: string) {
  const res = await fetch(`${API_BASE}/commands/${name}/disable`, { method: "POST" })
  return res.json()
}

export async function fetchLogs(level?: string) {
  const params = level && level !== "all" ? `?level=${level}` : ""
  const res = await fetch(`${API_BASE}/logs${params}`)
  return res.json()
}

export async function fetchSettings() {
  const res = await fetch(`${API_BASE}/settings`)
  return res.json()
}

export async function updateSettings(data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/settings`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function fetchSchedules() {
  const res = await fetch(`${API_BASE}/schedules`)
  return res.json()
}

export async function createSchedule(data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/schedules`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function deleteSchedule(id: string) {
  const res = await fetch(`${API_BASE}/schedules/${id}`, { method: "DELETE" })
  return res.json()
}

export async function sendBroadcast(target: string, message: string) {
  const res = await fetch(`${API_BASE}/broadcast`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ target, message }),
  })
  return res.json()
}
