export function getLessDecimals(anyNum: any): number | string {
  const num = Number(anyNum)

  if (num === 0) {
    return 0
  }

  if (num < 0.0000000001) {
    return Number.parseFloat(num.toFixed(8))
  }

  if (num < 0.0001) {
    return Number.parseFloat(num.toFixed(8))
  }

  if (num < 0.01) {
    return Number.parseFloat(num.toFixed(6))
  }

  if (num < 1) {
    return Number.parseFloat(num.toFixed(4))
  }

  if (num < 100) {
    return Number.parseFloat(num.toFixed(2))
  }

  return Math.round(num)
}
