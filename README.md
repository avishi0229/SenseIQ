# Sensory Smart Navigation System

A comprehensive navigation system designed for sensory-sensitive users that helps navigate cities safely by providing community-driven environmental tagging, AI-powered risk prediction, and calm route suggestions.

## 🌟 Features

### ✅ Core Features Implemented

1. **User Authentication & Profiles**
   - Email/password registration and login
   - JWT-based authentication
   - Personalized sensory profiles (noise, light, crowd sensitivity)

2. **Community Location Tagging**
   - Interactive map interface with Google Maps
   - Pin-drop tagging of locations
   - Rate noise levels (1-10)
   - Rate lighting intensity (1-10)
   - Rate crowd density (1-10)
   - Time-of-day categorization
   - Indoor/outdoor classification

3. **Real-Time Heatmap Visualization**
   - Live sensory load heatmap overlays on Google Maps
   - Color-coded intensity (green = calm, red = overwhelming)
   - Community-aggregated data

4. **AI-Powered SLI (Sensory Load Index) Engine**
   - Personalized risk calculation based on user sensitivity
   - Combines location data with user profile
   - Generates risk levels: Low, Medium, High
   - Zone classification: Calm, Moderate, Busy, Overwhelming

5. **Emergency Calm Mode** 🚨
   - One-tap emergency button
   - Finds nearby quiet spaces automatically
   - Shows distance to each space
   - Displays sensory characteristics of each space

6. **Quiet Spaces Database**
   - 20+ pre-seeded quiet locations across major Indian cities
   - Parks, libraries, gardens, and indoor spaces
   - Community-rated sensory levels

7. **Best Hours Recommendations**
   - Analyzes location data by time slots
   - Recommends optimal visit times
   - Time-based aggregation (Morning, Afternoon, Evening, Night)

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: JavaScript (React)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Maps**: Google Maps JavaScript API (@googlemaps/js-api-loader)
- **State Management**: React Hooks
- **Notifications**: Sonner

### Backend
- **Framework**: Next.js API Routes
- **Database**: PostgreSQL 15
- **ORM**: Prisma 6.2
- **Authentication**: JWT + bcryptjs
- **Real-time**: WebSocket-ready architecture

### Infrastructure
- **Database**: Local PostgreSQL
- **Environment**: Kubernetes/Docker
- **Process Manager**: Supervisor

## 📊 Database Schema

The system uses 10 interconnected tables:

1. **User** - User accounts and authentication
2. **SensoryProfile** - Individual sensitivity settings
3. **LocationTag** - Community-submitted location data
4. **CommunityRating** - Aggregated ratings by location/time
5. **AggregatedData** - Combined sensory data with SLI scores
6. **Route** - Saved navigation routes
7. **Recommendation** - Best times to visit locations
8. **EmergencyLog** - Emergency calm mode activations
9. **QuietSpace** - Database of calm locations
10. **Route** - Optimized sensory-aware routes

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Google Maps API key

### Installation

1. **Environment Variables**
   ```bash
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sensory_db?schema=public"
   NEXT_PUBLIC_BASE_URL=https://your-domain.com
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   JWT_SECRET=your-secret-key
   ```

2. **Install Dependencies**
   ```bash
   yarn install
   ```

3. **Database Setup**
   ```bash
   # Run migrations
   npx prisma migrate dev --name init
   
   # Seed quiet spaces
   node prisma/seed.js
   ```

4. **Start Development Server**
   ```bash
   yarn dev
   ```

5. **Access the Application**
   ```
   http://localhost:3000
   ```

## 🎯 Key API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Sensory Profile
- `POST /api/profile` - Create/update sensory profile
- `GET /api/profile` - Get user profile

### Location Tagging
- `POST /api/tags` - Submit location tag
- `GET /api/tags?lat=X&lng=Y` - Get nearby tags

### SLI Calculation
- `POST /api/sli/calculate` - Calculate Sensory Load Index for location

### Heatmap
- `GET /api/heatmap?lat=X&lng=Y&radius=Z` - Get heatmap data

### Emergency
- `POST /api/emergency` - Activate calm mode, find quiet spaces

### Quiet Spaces
- `GET /api/quiet-spaces?lat=X&lng=Y` - Get nearby quiet spaces
- `POST /api/quiet-spaces` - Add new quiet space

### Recommendations
- `GET /api/recommendations?lat=X&lng=Y` - Get best hours to visit

### Routes
- `POST /api/routes` - Save route
- `GET /api/routes` - Get user's saved routes

## 🧮 SLI (Sensory Load Index) Algorithm

The SLI engine calculates personalized risk scores:

```javascript
SLI Score = (
  Noise Score × 0.35 +
  Light Score × 0.25 +
  Crowd Score × 0.40 +
  Traffic Factor +
  Event Factor
)

Where:
- Noise Score = (Location Noise / 10) × (User Sensitivity / 10) × 10
- Light Score = (Location Light / 10) × (User Sensitivity / 10) × 10
- Crowd Score = (Location Crowd / 10) × ((11 - User Tolerance) / 10) × 10
```

**Risk Levels:**
- 0-3.5: **Low** (Calm environment)
- 3.5-6.5: **Medium** (Moderate activity)
- 6.5-10: **High** (Overwhelming conditions)

## 🌍 Pre-Seeded Quiet Spaces

The system includes 20 quiet spaces across major Indian cities:

- **Delhi**: Lodhi Garden, Nehru Place Library, Sunder Nursery
- **Mumbai**: Hanging Gardens, Asiatic Library, Sanjay Gandhi Park
- **Bangalore**: Cubbon Park, Ulsoor Lake, State Library
- **Hyderabad**: Lumbini Park, KBR National Park, Botanical Garden
- **Chennai**: Theosophical Society, Connemara Library, Guindy Park
- **Pune**: Osho Garden, Saras Baug
- **Kolkata**: Victoria Memorial, Rabindra Sarobar, National Library

## 📱 User Journey

1. **Onboarding**
   - Sign up with email/password
   - Create sensory profile (set sensitivity levels)

2. **Exploring**
   - View live sensory heatmap
   - See community-tagged locations
   - Check nearby quiet spaces

3. **Tagging**
   - Click anywhere on map
   - Rate noise, light, crowd levels
   - Add notes and details

4. **Emergency Mode**
   - One-tap calm mode activation
   - Instant quiet space recommendations
   - Distance and characteristics displayed

5. **Route Planning** (Future)
   - Enter destination
   - Get calm route suggestions
   - View SLI scores along routes

## 🔒 Security Features

- Password hashing with bcrypt (10 rounds)
- JWT token authentication (7-day expiry)
- Authorization headers for protected routes
- Input validation with Zod schemas
- SQL injection protection via Prisma ORM
- CORS configuration

## 📈 Future Enhancements

### Phase 2 (Planned)
- [ ] Google Directions API integration for route optimization
- [ ] Real-time traffic data integration
- [ ] Event calendar integration
- [ ] Route comparison (calm vs fast vs standard)
- [ ] Turn-by-turn navigation with sensory alerts

### Phase 3 (Planned)
- [ ] WebSocket real-time updates
- [ ] Push notifications for high-risk areas
- [ ] Social features (friends, shared routes)
- [ ] ML-based prediction models
- [ ] Mobile app (React Native)

## 🧪 Testing

### Manual Testing Completed
✅ User registration and login
✅ Sensory profile creation
✅ Location tagging
✅ SLI calculation
✅ Emergency calm mode
✅ Heatmap data generation
✅ API authentication
✅ Database operations

### Sample API Calls

**Register User:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"pass123","name":"Test User"}'
```

**Create Profile:**
```bash
curl -X POST http://localhost:3000/api/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"noiseSensitivity":8,"lightSensitivity":7,"crowdTolerance":4}'
```

**Tag Location:**
```bash
curl -X POST http://localhost:3000/api/tags \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "latitude":28.6139,
    "longitude":77.2090,
    "placeName":"Connaught Place",
    "noiseLevel":8,
    "lightingLevel":7,
    "crowdDensity":9,
    "timeOfDay":"Evening",
    "environment":"Outdoor"
  }'
```

## 📦 Project Structure

```
/app
├── app/
│   ├── api/
│   │   └── [[...path]]/
│   │       └── route.js          # All API endpoints
│   ├── page.js                   # Main dashboard
│   ├── layout.js                 # Root layout
│   └── globals.css               # Global styles
├── components/
│   ├── MapInterface.js           # Google Maps component
│   ├── TaggingModal.js           # Location tagging UI
│   ├── SensoryProfileModal.js    # Profile setup UI
│   └── ui/                       # shadcn components
├── lib/
│   ├── prisma.js                 # Prisma client singleton
│   ├── auth.js                   # Authentication utilities
│   ├── sliEngine.js              # SLI calculation engine
│   └── routeOptimizer.js         # Route optimization logic
├── prisma/
│   ├── schema.prisma             # Database schema
│   ├── seed.js                   # Seed data script
│   └── migrations/               # Database migrations
├── .env                          # Environment variables
└── package.json                  # Dependencies
```

## 🎨 UI Design Principles

- **Modern**: Gradient backgrounds, glassmorphism effects
- **Accessible**: High contrast, clear labels, keyboard navigation
- **Responsive**: Mobile-first design, works on all screen sizes
- **Intuitive**: One-tap emergency, simple tagging interface
- **Visual**: Color-coded risk levels, progress bars, badges

## 🌈 Color Coding

- **Green**: Low sensory load (calm, safe)
- **Yellow**: Medium load (moderate, manageable)
- **Orange**: High load (busy, caution)
- **Red**: Very high load (overwhelming, avoid)

## 💡 Key Innovations

1. **Community-Driven Data**: Crowdsourced sensory information
2. **Personalized Risk Scores**: Adapts to individual sensitivity
3. **Emergency Support**: One-tap access to calm spaces
4. **Time-Based Analysis**: Best hours recommendations
5. **Real-Time Visualization**: Live heatmap updates

## 📝 License

This project is built for educational and accessibility purposes.

## 🤝 Contributing

This is an MVP focused on core functionality. Future contributions welcome for:
- Route optimization algorithms
- ML prediction models
- Mobile app development
- Additional city coverage
- Accessibility improvements

## 📞 Support

For issues or questions about the system, please refer to the API documentation or check the console logs for debugging information.

---

**Built with ❤️ for sensory-sensitive individuals to navigate the world more comfortably.**
