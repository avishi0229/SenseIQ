/**
 * Route Optimization Engine
 * Ranks routes based on sensory load and user preferences
 */

export function optimizeRoutes(routes, sensoryData, userProfile) {
  if (!routes || routes.length === 0) return [];

  const scoredRoutes = routes.map(route => {
    const score = calculateRouteScore(route, sensoryData, userProfile);
    return {
      ...route,
      sensoryScore: score.sensoryScore,
      riskLevel: score.riskLevel,
      avoidanceScore: score.avoidanceScore
    };
  });

  // Sort by sensory score (lower is better)
  return scoredRoutes.sort((a, b) => a.sensoryScore - b.sensoryScore);
}

function calculateRouteScore(route, sensoryData, userProfile) {
  // Get route polyline points
  const points = route.overview_polyline?.points || [];
  
  // Calculate average sensory load along the route
  let totalLoad = 0;
  let highRiskSegments = 0;
  
  // For MVP, we'll use a simplified approach
  // In production, we'd sample points along the route and check sensory data
  const baseScore = 5; // Default moderate sensory load
  
  // Adjust based on distance (longer routes may accumulate more load)
  const distanceKm = (route.legs?.[0]?.distance?.value || 0) / 1000;
  const distanceFactor = Math.min(distanceKm / 10, 2); // Cap at 2x
  
  const sensoryScore = baseScore * (1 + distanceFactor * 0.2);
  
  return {
    sensoryScore: parseFloat(sensoryScore.toFixed(2)),
    riskLevel: sensoryScore <= 4 ? 'Low' : sensoryScore <= 7 ? 'Medium' : 'High',
    avoidanceScore: highRiskSegments
  };
}

export function findNearbyQuietSpaces(userLat, userLng, quietSpaces, radius = 2) {
  if (!quietSpaces || quietSpaces.length === 0) return [];

  const nearby = quietSpaces
    .map(space => {
      const distance = calculateDistance(userLat, userLng, space.latitude, space.longitude);
      return {
        ...space,
        distance
      };
    })
    .filter(space => space.distance <= radius)
    .sort((a, b) => a.distance - b.distance);

  return nearby.slice(0, 5); // Return top 5 nearest
}

// Haversine formula for distance calculation
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return parseFloat(distance.toFixed(2));
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}
