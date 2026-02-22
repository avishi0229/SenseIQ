import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, comparePassword, generateToken, getUserFromRequest } from '@/lib/auth';
import { calculateSLI, aggregateLocationTags, getCurrentTimeSlot } from '@/lib/sliEngine';
import { optimizeRoutes, findNearbyQuietSpaces } from '@/lib/routeOptimizer';

// Helper function to handle CORS
function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }));
}

// Main route handler
async function handleRoute(request, context) {
  const params = await context.params;
  const { path = [] } = params;
  const route = `/${path.join('/')}`;
  const method = request.method;

  try {
    // ========================================
    // AUTHENTICATION ENDPOINTS
    // ========================================
    
    // Register - POST /api/auth/register
    if (route === '/auth/register' && method === 'POST') {
      const body = await request.json();
      const { email, password, name } = body;

      if (!email || !password) {
        return handleCORS(NextResponse.json(
          { error: 'Email and password are required' },
          { status: 400 }
        ));
      }

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return handleCORS(NextResponse.json(
          { error: 'User already exists' },
          { status: 400 }
        ));
      }

      // Create user
      const hashedPassword = await hashPassword(password);
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: name || null
        }
      });

      const token = generateToken(user.id, user.email);

      return handleCORS(NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        },
        token
      }));
    }

    // Login - POST /api/auth/login
    if (route === '/auth/login' && method === 'POST') {
      const body = await request.json();
      const { email, password } = body;

      if (!email || !password) {
        return handleCORS(NextResponse.json(
          { error: 'Email and password are required' },
          { status: 400 }
        ));
      }

      const user = await prisma.user.findUnique({
        where: { email },
        include: { sensoryProfile: true }
      });

      if (!user || !user.password) {
        return handleCORS(NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        ));
      }

      const isValid = await comparePassword(password, user.password);
      if (!isValid) {
        return handleCORS(NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        ));
      }

      const token = generateToken(user.id, user.email);

      return handleCORS(NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          hasProfile: !!user.sensoryProfile
        },
        token
      }));
    }

    // Get current user - GET /api/auth/me
    if (route === '/auth/me' && method === 'GET') {
      const userData = getUserFromRequest(request);
      if (!userData) {
        return handleCORS(NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        ));
      }

      const user = await prisma.user.findUnique({
        where: { id: userData.userId },
        include: { sensoryProfile: true }
      });

      if (!user) {
        return handleCORS(NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        ));
      }

      return handleCORS(NextResponse.json({
        id: user.id,
        email: user.email,
        name: user.name,
        sensoryProfile: user.sensoryProfile
      }));
    }

    // ========================================
    // SENSORY PROFILE ENDPOINTS
    // ========================================

    // Create/Update sensory profile - POST /api/profile
    if (route === '/profile' && method === 'POST') {
      const userData = getUserFromRequest(request);
      if (!userData) {
        return handleCORS(NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        ));
      }

      const body = await request.json();
      const { noiseSensitivity, lightSensitivity, crowdTolerance } = body;

      // Validate required fields
      if (
        noiseSensitivity === undefined || noiseSensitivity === null ||
        lightSensitivity === undefined || lightSensitivity === null ||
        crowdTolerance === undefined || crowdTolerance === null
      ) {
        return handleCORS(NextResponse.json(
          { error: 'All sensitivity values (noiseSensitivity, lightSensitivity, crowdTolerance) are required' },
          { status: 400 }
        ));
      }

      // Validate input (1-10 range)
      if (
        noiseSensitivity < 1 || noiseSensitivity > 10 ||
        lightSensitivity < 1 || lightSensitivity > 10 ||
        crowdTolerance < 1 || crowdTolerance > 10
      ) {
        return handleCORS(NextResponse.json(
          { error: 'Sensitivity values must be between 1 and 10' },
          { status: 400 }
        ));
      }

      // Upsert profile
      const profile = await prisma.sensoryProfile.upsert({
        where: { userId: userData.userId },
        update: {
          noiseSensitivity: parseInt(noiseSensitivity),
          lightSensitivity: parseInt(lightSensitivity),
          crowdTolerance: parseInt(crowdTolerance)
        },
        create: {
          userId: userData.userId,
          noiseSensitivity: parseInt(noiseSensitivity),
          lightSensitivity: parseInt(lightSensitivity),
          crowdTolerance: parseInt(crowdTolerance)
        }
      });

      return handleCORS(NextResponse.json(profile));
    }

    // Get sensory profile - GET /api/profile
    if (route === '/profile' && method === 'GET') {
      const userData = getUserFromRequest(request);
      if (!userData) {
        return handleCORS(NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        ));
      }

      const profile = await prisma.sensoryProfile.findUnique({
        where: { userId: userData.userId }
      });

      if (!profile) {
        return handleCORS(NextResponse.json(
          { error: 'Profile not found' },
          { status: 404 }
        ));
      }

      return handleCORS(NextResponse.json(profile));
    }

    // ========================================
    // LOCATION TAGGING ENDPOINTS
    // ========================================

    // Create location tag - POST /api/tags
    if (route === '/tags' && method === 'POST') {
      const userData = getUserFromRequest(request);
      if (!userData) {
        return handleCORS(NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        ));
      }

      const body = await request.json();
      const {
        latitude,
        longitude,
        placeName,
        noiseLevel,
        lightingLevel,
        crowdDensity,
        timeOfDay,
        environment,
        notes
      } = body;

      if (!latitude || !longitude || !noiseLevel || !lightingLevel || !crowdDensity) {
        return handleCORS(NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        ));
      }

      const tag = await prisma.locationTag.create({
        data: {
          userId: userData.userId,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          placeName: placeName || null,
          noiseLevel: parseInt(noiseLevel),
          lightingLevel: parseInt(lightingLevel),
          crowdDensity: parseInt(crowdDensity),
          timeOfDay: timeOfDay || getCurrentTimeSlot(),
          environment: environment || 'Outdoor',
          notes: notes || null
        }
      });

      return handleCORS(NextResponse.json(tag));
    }

    // Get location tags - GET /api/tags
    if (route === '/tags' && method === 'GET') {
      const url = new URL(request.url);
      const lat = url.searchParams.get('lat');
      const lng = url.searchParams.get('lng');
      const radius = parseFloat(url.searchParams.get('radius')) || 5;

      let tags;
      
      if (lat && lng) {
        // Get tags near a location (simplified - in production use PostGIS)
        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lng);
        const latRange = radius / 111; // rough km to degrees
        const lngRange = radius / (111 * Math.cos(latNum * Math.PI / 180));

        tags = await prisma.locationTag.findMany({
          where: {
            latitude: {
              gte: latNum - latRange,
              lte: latNum + latRange
            },
            longitude: {
              gte: lngNum - lngRange,
              lte: lngNum + lngRange
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 100
        });
      } else {
        // Get all recent tags
        tags = await prisma.locationTag.findMany({
          orderBy: { createdAt: 'desc' },
          take: 100
        });
      }

      return handleCORS(NextResponse.json(tags));
    }

    // ========================================
    // COMMUNITY RATINGS ENDPOINTS
    // ========================================

    // Get aggregated ratings for location - GET /api/ratings
    if (route === '/ratings' && method === 'GET') {
      const url = new URL(request.url);
      const lat = url.searchParams.get('lat');
      const lng = url.searchParams.get('lng');
      const timeSlot = url.searchParams.get('timeSlot');

      if (!lat || !lng) {
        return handleCORS(NextResponse.json(
          { error: 'Latitude and longitude required' },
          { status: 400 }
        ));
      }

      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      const radius = 0.5; // 0.5 km radius
      const latRange = radius / 111;
      const lngRange = radius / (111 * Math.cos(latNum * Math.PI / 180));

      // Get nearby tags
      const tags = await prisma.locationTag.findMany({
        where: {
          latitude: {
            gte: latNum - latRange,
            lte: latNum + latRange
          },
          longitude: {
            gte: lngNum - lngRange,
            lte: lngNum + lngRange
          },
          ...(timeSlot && { timeOfDay: timeSlot })
        }
      });

      const aggregated = aggregateLocationTags(tags);

      return handleCORS(NextResponse.json({
        latitude: latNum,
        longitude: lngNum,
        timeSlot: timeSlot || 'All',
        ...aggregated
      }));
    }

    // ========================================
    // SLI CALCULATION ENDPOINTS
    // ========================================

    // Calculate SLI for location - POST /api/sli/calculate
    if (route === '/sli/calculate' && method === 'POST') {
      const userData = getUserFromRequest(request);
      if (!userData) {
        return handleCORS(NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        ));
      }

      const body = await request.json();
      const { latitude, longitude, timeSlot } = body;

      if (!latitude || !longitude) {
        return handleCORS(NextResponse.json(
          { error: 'Latitude and longitude required' },
          { status: 400 }
        ));
      }

      // Get user profile
      const profile = await prisma.sensoryProfile.findUnique({
        where: { userId: userData.userId }
      });

      if (!profile) {
        return handleCORS(NextResponse.json(
          { error: 'Sensory profile not found. Please complete your profile first.' },
          { status: 404 }
        ));
      }

      const latNum = parseFloat(latitude);
      const lngNum = parseFloat(longitude);
      const radius = 0.5;
      const latRange = radius / 111;
      const lngRange = radius / (111 * Math.cos(latNum * Math.PI / 180));

      // Get nearby tags
      const tags = await prisma.locationTag.findMany({
        where: {
          latitude: {
            gte: latNum - latRange,
            lte: latNum + latRange
          },
          longitude: {
            gte: lngNum - lngRange,
            lte: lngNum + lngRange
          },
          ...(timeSlot && { timeOfDay: timeSlot })
        }
      });

      const locationData = aggregateLocationTags(tags);
      const sliResult = calculateSLI(locationData, profile);

      return handleCORS(NextResponse.json({
        latitude: latNum,
        longitude: lngNum,
        timeSlot: timeSlot || getCurrentTimeSlot(),
        locationData,
        ...sliResult
      }));
    }

    // ========================================
    // HEATMAP DATA ENDPOINTS
    // ========================================

    // Get heatmap data - GET /api/heatmap
    if (route === '/heatmap' && method === 'GET') {
      const url = new URL(request.url);
      const centerLat = parseFloat(url.searchParams.get('lat')) || 20.5937;
      const centerLng = parseFloat(url.searchParams.get('lng')) || 78.9629;
      const radius = parseFloat(url.searchParams.get('radius')) || 10;

      const latRange = radius / 111;
      const lngRange = radius / (111 * Math.cos(centerLat * Math.PI / 180));

      const tags = await prisma.locationTag.findMany({
        where: {
          latitude: {
            gte: centerLat - latRange,
            lte: centerLat + latRange
          },
          longitude: {
            gte: centerLng - lngRange,
            lte: centerLng + lngRange
          }
        },
        take: 500
      });

      // Group by approximate location
      const heatmapData = tags.map(tag => ({
        lat: tag.latitude,
        lng: tag.longitude,
        intensity: (tag.noiseLevel + tag.lightingLevel + tag.crowdDensity) / 30
      }));

      return handleCORS(NextResponse.json(heatmapData));
    }

    // ========================================
    // ROUTE OPTIMIZATION ENDPOINTS
    // ========================================

    // Save route - POST /api/routes
    if (route === '/routes' && method === 'POST') {
      const userData = getUserFromRequest(request);
      if (!userData) {
        return handleCORS(NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        ));
      }

      const body = await request.json();
      const {
        originLat,
        originLng,
        originName,
        destinationLat,
        destinationLng,
        destinationName,
        routePath,
        distance,
        duration,
        avgSliScore,
        riskLevel,
        routeType
      } = body;

      const route = await prisma.route.create({
        data: {
          userId: userData.userId,
          originLat: parseFloat(originLat),
          originLng: parseFloat(originLng),
          originName: originName || null,
          destinationLat: parseFloat(destinationLat),
          destinationLng: parseFloat(destinationLng),
          destinationName: destinationName || null,
          routePath: JSON.stringify(routePath),
          distance: parseFloat(distance),
          duration: parseInt(duration),
          avgSliScore: parseFloat(avgSliScore),
          riskLevel: riskLevel || 'Medium',
          routeType: routeType || 'Standard'
        }
      });

      return handleCORS(NextResponse.json(route));
    }

    // Get user routes - GET /api/routes
    if (route === '/routes' && method === 'GET') {
      const userData = getUserFromRequest(request);
      if (!userData) {
        return handleCORS(NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        ));
      }

      const routes = await prisma.route.findMany({
        where: { userId: userData.userId },
        orderBy: { createdAt: 'desc' },
        take: 20
      });

      return handleCORS(NextResponse.json(routes));
    }

    // ========================================
    // EMERGENCY SUPPORT ENDPOINTS
    // ========================================

    // Trigger emergency calm mode - POST /api/emergency
    if (route === '/emergency' && method === 'POST') {
      const userData = getUserFromRequest(request);
      if (!userData) {
        return handleCORS(NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        ));
      }

      const body = await request.json();
      const { latitude, longitude, triggerReason, currentSliScore } = body;

      if (!latitude || !longitude) {
        return handleCORS(NextResponse.json(
          { error: 'Location required' },
          { status: 400 }
        ));
      }

      // Get nearby quiet spaces
      const quietSpaces = await prisma.quietSpace.findMany({
        take: 100
      });

      const nearby = findNearbyQuietSpaces(
        parseFloat(latitude),
        parseFloat(longitude),
        quietSpaces
      );

      // Log emergency
      const log = await prisma.emergencyLog.create({
        data: {
          userId: userData.userId,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          triggerReason: triggerReason || 'User triggered',
          currentSliScore: currentSliScore ? parseFloat(currentSliScore) : null,
          suggestedSpaces: JSON.stringify(nearby)
        }
      });

      return handleCORS(NextResponse.json({
        message: 'Emergency support activated',
        quietSpaces: nearby,
        log
      }));
    }

    // ========================================
    // QUIET SPACES ENDPOINTS
    // ========================================

    // Get quiet spaces - GET /api/quiet-spaces
    if (route === '/quiet-spaces' && method === 'GET') {
      const url = new URL(request.url);
      const lat = url.searchParams.get('lat');
      const lng = url.searchParams.get('lng');

      let quietSpaces;

      if (lat && lng) {
        const allSpaces = await prisma.quietSpace.findMany();
        quietSpaces = findNearbyQuietSpaces(
          parseFloat(lat),
          parseFloat(lng),
          allSpaces
        );
      } else {
        quietSpaces = await prisma.quietSpace.findMany({
          take: 20
        });
      }

      return handleCORS(NextResponse.json(quietSpaces));
    }

    // Create quiet space - POST /api/quiet-spaces
    if (route === '/quiet-spaces' && method === 'POST') {
      const userData = getUserFromRequest(request);
      if (!userData) {
        return handleCORS(NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        ));
      }

      const body = await request.json();
      const {
        latitude,
        longitude,
        name,
        type,
        avgNoise,
        avgLight,
        avgCrowd,
        description
      } = body;

      const quietSpace = await prisma.quietSpace.create({
        data: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          name,
          type: type || 'Park',
          avgNoise: parseFloat(avgNoise) || 2,
          avgLight: parseFloat(avgLight) || 3,
          avgCrowd: parseFloat(avgCrowd) || 2,
          description: description || null
        }
      });

      return handleCORS(NextResponse.json(quietSpace));
    }

    // ========================================
    // RECOMMENDATIONS ENDPOINT
    // ========================================

    // Get best hours for location - GET /api/recommendations
    if (route === '/recommendations' && method === 'GET') {
      const url = new URL(request.url);
      const lat = url.searchParams.get('lat');
      const lng = url.searchParams.get('lng');

      if (!lat || !lng) {
        return handleCORS(NextResponse.json(
          { error: 'Latitude and longitude required' },
          { status: 400 }
        ));
      }

      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      const radius = 0.5;
      const latRange = radius / 111;
      const lngRange = radius / (111 * Math.cos(latNum * Math.PI / 180));

      // Get tags grouped by time slot
      const timeSlots = ['Morning', 'Afternoon', 'Evening', 'Night'];
      const recommendations = {};

      for (const slot of timeSlots) {
        const tags = await prisma.locationTag.findMany({
          where: {
            latitude: {
              gte: latNum - latRange,
              lte: latNum + latRange
            },
            longitude: {
              gte: lngNum - lngRange,
              lte: lngNum + lngRange
            },
            timeOfDay: slot
          }
        });

        const aggregated = aggregateLocationTags(tags);
        recommendations[slot] = {
          ...aggregated,
          avgScore: ((aggregated.avgNoise + aggregated.avgLight + aggregated.avgCrowd) / 3).toFixed(2)
        };
      }

      // Find best time slot
      const bestSlot = Object.entries(recommendations)
        .sort(([, a], [, b]) => parseFloat(a.avgScore) - parseFloat(b.avgScore))[0];

      return handleCORS(NextResponse.json({
        latitude: latNum,
        longitude: lngNum,
        recommendations,
        bestTimeSlot: bestSlot ? bestSlot[0] : 'Morning'
      }));
    }

    // Health check
    if (route === '/' && method === 'GET') {
      return handleCORS(NextResponse.json({
        message: 'Sensory Smart Navigation API',
        status: 'online',
        timestamp: new Date().toISOString()
      }));
    }

    // Route not found
    return handleCORS(NextResponse.json(
      { error: `Route ${route} not found` },
      { status: 404 }
    ));

  } catch (error) {
    console.error('API Error:', error);
    return handleCORS(NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    ));
  }
}

// Export all HTTP methods
export const GET = handleRoute;
export const POST = handleRoute;
export const PUT = handleRoute;
export const DELETE = handleRoute;
export const PATCH = handleRoute;
