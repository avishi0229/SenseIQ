/**
 * SLI (Sensory Load Index) Calculation Engine
 * Combines user sensory profile with location data to calculate risk levels
 */

export function calculateSLI(locationData, userProfile, externalData = {}) {
  const {
    avgNoise = 5,
    avgLight = 5,
    avgCrowd = 5,
  } = locationData;

  const {
    noiseSensitivity = 5,
    lightSensitivity = 5,
    crowdTolerance = 5,
  } = userProfile;

  const {
    trafficLevel = 0,
    eventDensity = 0,
  } = externalData;

  // Weighted SLI calculation
  // Higher sensitivity + higher level = higher score (worse)
  const noiseScore = (avgNoise / 10) * (noiseSensitivity / 10) * 10;
  const lightScore = (avgLight / 10) * (lightSensitivity / 10) * 10;
  const crowdScore = (avgCrowd / 10) * ((11 - crowdTolerance) / 10) * 10; // Inverted tolerance
  
  // External factors add to overall load
  const trafficScore = trafficLevel * 0.5;
  const eventScore = eventDensity * 0.3;

  // Final SLI Score (0-10 scale)
  const sliScore = Math.min(
    10,
    (noiseScore * 0.35 + lightScore * 0.25 + crowdScore * 0.4 + trafficScore + eventScore)
  );

  return {
    sliScore: parseFloat(sliScore.toFixed(2)),
    riskLevel: getRiskLevel(sliScore),
    zoneType: getZoneType(sliScore),
    breakdown: {
      noiseScore: parseFloat(noiseScore.toFixed(2)),
      lightScore: parseFloat(lightScore.toFixed(2)),
      crowdScore: parseFloat(crowdScore.toFixed(2)),
      trafficScore: parseFloat(trafficScore.toFixed(2)),
      eventScore: parseFloat(eventScore.toFixed(2)),
    }
  };
}

function getRiskLevel(sliScore) {
  if (sliScore <= 3.5) return 'Low';
  if (sliScore <= 6.5) return 'Medium';
  return 'High';
}

function getZoneType(sliScore) {
  if (sliScore <= 2.5) return 'Calm';
  if (sliScore <= 5) return 'Moderate';
  if (sliScore <= 7.5) return 'Busy';
  return 'Overwhelming';
}

export function aggregateLocationTags(tags) {
  if (!tags || tags.length === 0) {
    return {
      avgNoise: 5,
      avgLight: 5,
      avgCrowd: 5,
      count: 0
    };
  }

  const sum = tags.reduce((acc, tag) => {
    acc.noise += tag.noiseLevel;
    acc.light += tag.lightingLevel;
    acc.crowd += tag.crowdDensity;
    return acc;
  }, { noise: 0, light: 0, crowd: 0 });

  return {
    avgNoise: parseFloat((sum.noise / tags.length).toFixed(2)),
    avgLight: parseFloat((sum.light / tags.length).toFixed(2)),
    avgCrowd: parseFloat((sum.crowd / tags.length).toFixed(2)),
    count: tags.length
  };
}

export function getTimeSlot(hour) {
  if (hour >= 5 && hour < 12) return 'Morning';
  if (hour >= 12 && hour < 17) return 'Afternoon';
  if (hour >= 17 && hour < 21) return 'Evening';
  return 'Night';
}

export function getCurrentTimeSlot() {
  const hour = new Date().getHours();
  return getTimeSlot(hour);
}
