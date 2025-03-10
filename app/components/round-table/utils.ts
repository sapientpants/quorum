export interface CircularPosition {
  x: number
  y: number
}

/**
 * Calculates positions for participants in a circular layout
 * @param count Number of participants
 * @param radius Radius as a percentage (default: 40)
 * @param startAngle Starting angle in degrees (default: -90 to start at top)
 * @returns Array of positions with x,y coordinates as percentages
 */
export function calculateCircularPositions(
  count: number,
  radius: number = 40,
  startAngle: number = -90
): CircularPosition[] {
  if (count === 0) return []
  if (count === 1) return [{ x: 50, y: 50 }]

  const positions: CircularPosition[] = []
  const angleStep = 360 / count
  const centerX = 50
  const centerY = 50

  for (let i = 0; i < count; i++) {
    const angle = (startAngle + i * angleStep) * (Math.PI / 180)
    positions.push({
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    })
  }

  return positions
}

/**
 * Calculates the angle between two points in degrees
 */
export function calculateAngle(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  return Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI)
}

/**
 * Calculates the distance between two points
 */
export function calculateDistance(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
} 