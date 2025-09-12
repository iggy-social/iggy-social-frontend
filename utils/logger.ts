export async function sendLog(
  level: "info" | "error" | "warn" | "debug",
  message: string,
  meta?: Record<string, any>
) {
  console.log('Sending log to BetterStack:', { level, message, meta })
  const thisAppUrl = window.location.origin
  try {
    await fetch(thisAppUrl + "/.netlify/functions/logsUploader", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ level, message, meta }),
    })
  } catch (err) {
    // fallback: log locally if network fails
    console.error("Failed to send log to BetterStack:", err)
  }
}
