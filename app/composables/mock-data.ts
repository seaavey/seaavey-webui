export const mockStats = {
  status: "connected" as const,
  uptime: "3d 14h 22m",
  totalGroups: 47,
  totalUsers: 1283,
  commandsToday: 156,
  messagesProcessed: 4892,
}

export const mockGroups = [
  { jid: "120363001@g.us", name: "Tech Community", members: 234, status: "active" as const, welcome: true, antiSpam: true },
  { jid: "120363002@g.us", name: "Gaming Squad", members: 89, status: "active" as const, welcome: true, antiSpam: false },
  { jid: "120363003@g.us", name: "Study Group", members: 156, status: "muted" as const, welcome: false, antiSpam: true },
  { jid: "120363004@g.us", name: "Random Chat", members: 312, status: "active" as const, welcome: true, antiSpam: true },
  { jid: "120363005@g.us", name: "Music Lovers", members: 67, status: "active" as const, welcome: false, antiSpam: false },
  { jid: "120363006@g.us", name: "Anime Fans", members: 198, status: "muted" as const, welcome: true, antiSpam: true },
]

export const mockUsers = [
  { jid: "628123456789@s.whatsapp.net", name: "Ahmad", status: "active" as const, lastSeen: "2 min ago", commands: 45 },
  { jid: "628987654321@s.whatsapp.net", name: "Budi", status: "active" as const, lastSeen: "15 min ago", commands: 32 },
  { jid: "628111222333@s.whatsapp.net", name: "Citra", status: "banned" as const, lastSeen: "1 hour ago", commands: 12 },
  { jid: "628444555666@s.whatsapp.net", name: "Dani", status: "active" as const, lastSeen: "5 min ago", commands: 78 },
  { jid: "628777888999@s.whatsapp.net", name: "Eka", status: "active" as const, lastSeen: "30 min ago", commands: 23 },
  { jid: "628222333444@s.whatsapp.net", name: "Fajar", status: "banned" as const, lastSeen: "3 hours ago", commands: 5 },
]

export const mockCommands = [
  { name: "menu", category: "general", usageCount: 892, enabled: true },
  { name: "sticker", category: "converter", usageCount: 654, enabled: true },
  { name: "play", category: "downloader", usageCount: 543, enabled: true },
  { name: "ai", category: "ai", usageCount: 421, enabled: true },
  { name: "ban", category: "admin", usageCount: 89, enabled: true },
  { name: "kick", category: "admin", usageCount: 67, enabled: true },
  { name: "tiktok", category: "downloader", usageCount: 398, enabled: false },
  { name: "weather", category: "utility", usageCount: 234, enabled: true },
]

export const mockLogs = [
  { id: 1, level: "info" as const, message: "Bot connected successfully", timestamp: "2026-05-19 12:00:01" },
  { id: 2, level: "info" as const, message: "Command executed: .menu by 628123456789", timestamp: "2026-05-19 12:01:15" },
  { id: 3, level: "warn" as const, message: "Rate limit reached for 628111222333", timestamp: "2026-05-19 12:02:30" },
  { id: 4, level: "error" as const, message: "Failed to download media: timeout", timestamp: "2026-05-19 12:03:45" },
  { id: 5, level: "info" as const, message: "Command executed: .sticker by 628987654321", timestamp: "2026-05-19 12:04:00" },
  { id: 6, level: "info" as const, message: "New member joined: Tech Community", timestamp: "2026-05-19 12:05:12" },
  { id: 7, level: "warn" as const, message: "Anti-spam triggered in Gaming Squad", timestamp: "2026-05-19 12:06:30" },
  { id: 8, level: "error" as const, message: "Database write failed: SQLITE_BUSY", timestamp: "2026-05-19 12:07:00" },
  { id: 9, level: "info" as const, message: "Scheduled message sent to 3 groups", timestamp: "2026-05-19 12:08:15" },
  { id: 10, level: "info" as const, message: "Command executed: .ai by 628444555666", timestamp: "2026-05-19 12:09:30" },
]

export const mockSchedules = [
  { id: "1", name: "Morning Greeting", cron: "0 7 * * *", target: "All Groups", status: "active" as const, lastRun: "2026-05-19 07:00" },
  { id: "2", name: "Daily Reminder", cron: "0 20 * * *", target: "Study Group", status: "active" as const, lastRun: "2026-05-18 20:00" },
  { id: "3", name: "Weekly Report", cron: "0 9 * * 1", target: "Tech Community", status: "paused" as const, lastRun: "2026-05-12 09:00" },
]

export const mockActivity = [
  { type: "command" as const, text: "Ahmad used .menu in Tech Community", time: "2 min ago" },
  { type: "join" as const, text: "New member joined Gaming Squad", time: "5 min ago" },
  { type: "command" as const, text: "Dani used .ai in Random Chat", time: "8 min ago" },
  { type: "warning" as const, text: "Anti-spam triggered in Anime Fans", time: "12 min ago" },
  { type: "command" as const, text: "Budi used .sticker in Music Lovers", time: "15 min ago" },
]

export const mockChartData = [
  { day: "Mon", commands: 142 },
  { day: "Tue", commands: 189 },
  { day: "Wed", commands: 156 },
  { day: "Thu", commands: 201 },
  { day: "Fri", commands: 178 },
  { day: "Sat", commands: 234 },
  { day: "Sun", commands: 156 },
]
