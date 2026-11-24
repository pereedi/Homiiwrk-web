// =====================================================================
// LYDIA NATURAL LANGUAGE BUDGET PARSER
// Converts Nigerian Naira currency inputs to integer KOBO (NGN * 100)
// =====================================================================

export function parseBudgetKobo(input) {
  if (!input) return null
  const clean = String(input).toLowerCase().replace(/,/g, '').trim()

  // Match "400k" or "400 k"
  const kMatch = clean.match(/(\d+(?:\.\d+)?)\s*k\b/)
  if (kMatch) {
    const naira = parseFloat(kMatch[1]) * 1000
    return Math.round(naira * 100)
  }

  // Match "500 thousand" or "500k"
  const thousandMatch = clean.match(/(\d+(?:\.\d+)?)\s*(?:thousand|kobo)/)
  if (thousandMatch) {
    const naira = parseFloat(thousandMatch[1]) * 1000
    return Math.round(naira * 100)
  }

  // Match raw numbers like "450000" or "₦380000"
  const numMatch = clean.match(/(?:₦|ngn|n)?\s*(\d{5,8})/)
  if (numMatch) {
    const naira = parseFloat(numMatch[1])
    return Math.round(naira * 100)
  }

  // Common fallbacks
  if (clean.includes('350')) return 35000000
  if (clean.includes('400')) return 40000000
  if (clean.includes('450')) return 45000000
  if (clean.includes('500')) return 50000000
  if (clean.includes('600')) return 60000000
  if (clean.includes('300')) return 30000000

  return null
}

export function formatKoboToNaira(kobo) {
  if (!kobo) return '₦0'
  const naira = Math.round(kobo / 100)
  return '₦' + naira.toLocaleString('en-NG')
}
