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

  // Calculate responsive radius based on viewport
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1024
  
  // Adjust radius for smaller screens or when there are many participants
  let responsiveRadius = radius
  
  // On smaller screens, reduce the radius
  if (viewportWidth < 640) {
    responsiveRadius = Math.min(35, radius) // Smaller radius on mobile
  } else if (viewportWidth < 768) {
    responsiveRadius = Math.min(38, radius) // Slightly larger on tablets
  }
  
  // If there are many participants, adjust the radius further
  if (count > 6) {
    responsiveRadius = Math.min(responsiveRadius, 45) // Ensure participants don't go off-screen
  } else if (count <= 3) {
    responsiveRadius = Math.max(responsiveRadius, 30) // For fewer participants, keep them closer to center
  }
  
  const positions: CircularPosition[] = []
  const angleStep = 360 / count
  const centerX = 50
  const centerY = 50

  for (let i = 0; i < count; i++) {
    const angle = (startAngle + i * angleStep) * (Math.PI / 180)
    positions.push({
      x: centerX + responsiveRadius * Math.cos(angle),
      y: centerY + responsiveRadius * Math.sin(angle)
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