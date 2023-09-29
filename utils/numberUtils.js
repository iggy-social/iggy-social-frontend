export function getLessDecimals(anyNum) {
  const num = Number(anyNum);

  if (num === 0) {
    return 0
  }

  if (num < 0.0000000001) {
    return num
  }

  if (num < 0.01) {
    return num.toFixed(6)
  }

  if (num < 1) {
    return num.toFixed(4)
  }

  if (num < 100) {
    return num.toFixed(2)
  }

  return Math.round(num); 
}
