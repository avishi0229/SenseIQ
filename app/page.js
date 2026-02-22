'use client';

import { useState, useEffect } from 'react';
import MapInterface from '@/components/MapInterface';
import TaggingModal from '@/components/TaggingModal';
import SensoryProfileModal from '@/components/SensoryProfileModal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  User, 
  AlertCircle, 
  Navigation, 
  Heart, 
  Map as MapIcon,
  Plus,
  LogIn,
  UserPlus,
  Settings
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

export default function Home() {
  // Auth state
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Sensory profile state
  const [sensoryProfile, setSensoryProfile] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Map state
  const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 }); // Center of India
  const [mapZoom, setMapZoom] = useState(5);
  const [markers, setMarkers] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Tagging state
  const [showTaggingModal, setShowTaggingModal] = useState(false);
  const [tags, setTags] = useState([]);

  // Route state
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [routeData, setRouteData] = useState(null);

  // Emergency state
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [quietSpaces, setQuietSpaces] = useState([]);

  // Load token from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      fetchCurrentUser(savedToken);
    }
  }, []);

  // Fetch current user
  const fetchCurrentUser = async (authToken) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        setSensoryProfile(userData.sensoryProfile);
        
        if (!userData.sensoryProfile) {
          toast.info('Please complete your sensory profile to get started');
          setShowProfileModal(true);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  // Auth handlers
  const handleAuth = async (e) => {
    e.preventDefault();
    
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin 
        ? { email, password }
        : { email, password, name };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Authentication failed');
        return;
      }

      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      setShowAuthModal(false);
      
      toast.success(isLogin ? 'Logged in successfully!' : 'Account created successfully!');
      
      if (!data.user.hasProfile) {
        setShowProfileModal(true);
      }
    } catch (error) {
      toast.error('Authentication failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setSensoryProfile(null);
    toast.success('Logged out successfully');
  };

  // Sensory profile handlers
  const handleSaveProfile = async (profileData) => {
    if (!token) return;

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      if (res.ok) {
        const profile = await res.json();
        setSensoryProfile(profile);
        return profile;
      }
    } catch (error) {
      throw error;
    }
  };

  // Map handlers
  const handleMapClick = (location) => {
    if (!user) {
      toast.error('Please login to tag locations');
      return;
    }
    
    setSelectedLocation(location);
    setShowTaggingModal(true);
  };

  // Tagging handlers
  const handleSubmitTag = async (tagData) => {
    if (!token) return;

    try {
      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(tagData)
      });

      if (res.ok) {
        const newTag = await res.json();
        setTags([...tags, newTag]);
        loadTags();
        loadHeatmapData();
        return newTag;
      }
    } catch (error) {
      throw error;
    }
  };

  // Load tags
  const loadTags = async () => {
    try {
      const res = await fetch('/api/tags');
      if (res.ok) {
        const data = await res.json();
        setTags(data);
        
        // Convert tags to markers
        const tagMarkers = data.slice(0, 50).map(tag => ({
          lat: tag.latitude,
          lng: tag.longitude,
          title: tag.placeName || 'Tagged Location',
          icon: {
            path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
            scale: 8,
            fillColor: '#10b981',
            fillOpacity: 0.7,
            strokeColor: '#059669',
            strokeWeight: 2
          },
          infoWindow: `
            <div style="padding: 8px;">
              <h3 style="font-weight: bold; margin-bottom: 8px;">${tag.placeName || 'Tagged Location'}</h3>
              <p style="margin: 4px 0;"><strong>Noise:</strong> ${tag.noiseLevel}/10</p>
              <p style="margin: 4px 0;"><strong>Light:</strong> ${tag.lightingLevel}/10</p>
              <p style="margin: 4px 0;"><strong>Crowd:</strong> ${tag.crowdDensity}/10</p>
              <p style="margin: 4px 0;"><strong>Time:</strong> ${tag.timeOfDay}</p>
            </div>
          `
        }));
        
        setMarkers(tagMarkers);
      }
    } catch (error) {
      console.error('Failed to load tags:', error);
    }
  };

  // Load heatmap data
  const loadHeatmapData = async () => {
    try {
      const res = await fetch(`/api/heatmap?lat=${mapCenter.lat}&lng=${mapCenter.lng}&radius=20`);
      if (res.ok) {
        const data = await res.json();
        setHeatmapData(data);
      }
    } catch (error) {
      console.error('Failed to load heatmap:', error);
    }
  };

  // Emergency calm mode
  const handleEmergency = async () => {
    if (!user || !token) {
      toast.error('Please login to use emergency features');
      return;
    }

    setEmergencyMode(true);
    toast.info('Finding nearby quiet spaces...');

    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          const res = await fetch('/api/emergency', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              latitude,
              longitude,
              triggerReason: 'User activated calm mode'
            })
          });

          if (res.ok) {
            const data = await res.json();
            setQuietSpaces(data.quietSpaces);
            
            // Center map on user location
            setMapCenter({ lat: latitude, lng: longitude });
            setMapZoom(13);
            
            // Add quiet space markers
            const spaceMarkers = data.quietSpaces.map(space => ({
              lat: space.latitude,
              lng: space.longitude,
              title: space.name,
              icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="20" r="15" fill="#10b981" stroke="#fff" stroke-width="3"/>
                    <text x="20" y="25" font-size="20" text-anchor="middle" fill="#fff">🤫</text>
                  </svg>
                `)
              },
              infoWindow: `
                <div style="padding: 12px; max-width: 200px;">
                  <h3 style="font-weight: bold; margin-bottom: 8px; color: #10b981;">${space.name}</h3>
                  <p style="margin: 4px 0;"><strong>Type:</strong> ${space.type}</p>
                  <p style="margin: 4px 0;"><strong>Distance:</strong> ${space.distance} km</p>
                  <p style="margin: 4px 0; font-size: 12px; color: #666;">${space.description || ''}</p>
                  <div style="margin-top: 8px; padding: 8px; background: #f0fdf4; border-radius: 4px;">
                    <p style="margin: 2px 0; font-size: 12px;">Noise: ${space.avgNoise}/10</p>
                    <p style="margin: 2px 0; font-size: 12px;">Light: ${space.avgLight}/10</p>
                    <p style="margin: 2px 0; font-size: 12px;">Crowd: ${space.avgCrowd}/10</p>
                  </div>
                </div>
              `
            }));
            
            setMarkers(spaceMarkers);
            toast.success(`Found ${data.quietSpaces.length} quiet spaces nearby!`);
          }
        } catch (error) {
          toast.error('Failed to activate emergency mode');
        }
      }, (error) => {
        toast.error('Unable to get your location');
      });
    } else {
      toast.error('Geolocation not supported');
    }
  };

  // Load initial data
  useEffect(() => {
    loadTags();
    loadHeatmapData();
  }, []);

  return (
    <div className=\"min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50\">
      <Toaster position=\"top-center\" richColors />
      
      {/* Header */}
      <header className=\"bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50\">
        <div className=\"container mx-auto px-4 py-4\">
          <div className=\"flex items-center justify-between\">
            <div className=\"flex items-center gap-3\">
              <div className=\"w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center\">
                <MapIcon className=\"w-6 h-6 text-white\" />
              </div>
              <div>
                <h1 className=\"text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent\">
                  Sensory Smart Navigation
                </h1>
                <p className=\"text-xs text-slate-600\">Navigate cities with sensory awareness</p>
              </div>
            </div>

            <div className=\"flex items-center gap-2\">
              {user ? (
                <>
                  <Button
                    variant=\"outline\"
                    size=\"sm\"
                    onClick={() => setShowProfileModal(true)}
                    className=\"hidden sm:flex\"
                  >
                    <Settings className=\"w-4 h-4 mr-2\" />
                    Profile
                  </Button>
                  <Button
                    variant=\"outline\"
                    size=\"sm\"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant=\"outline\"
                    size=\"sm\"
                    onClick={() => {
                      setIsLogin(true);
                      setShowAuthModal(true);
                    }}
                  >
                    <LogIn className=\"w-4 h-4 mr-2\" />
                    Login
                  </Button>
                  <Button
                    size=\"sm\"
                    onClick={() => {
                      setIsLogin(false);
                      setShowAuthModal(true);
                    }}
                  >
                    <UserPlus className=\"w-4 h-4 mr-2\" />
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className=\"container mx-auto px-4 py-6\">
        {/* Info Cards */}
        <div className=\"grid grid-cols-1 md:grid-cols-3 gap-4 mb-6\">
          <Card className=\"p-4 bg-white/80 backdrop-blur-sm border-blue-200\">
            <div className=\"flex items-center gap-3\">
              <div className=\"w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center\">
                <MapPin className=\"w-6 h-6 text-blue-600\" />
              </div>
              <div>
                <p className=\"text-sm text-slate-600\">Total Tags</p>
                <p className=\"text-2xl font-bold text-slate-900\">{tags.length}</p>
              </div>
            </div>
          </Card>

          <Card className=\"p-4 bg-white/80 backdrop-blur-sm border-green-200\">
            <div className=\"flex items-center gap-3\">
              <div className=\"w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center\">
                <Heart className=\"w-6 h-6 text-green-600\" />
              </div>
              <div>
                <p className=\"text-sm text-slate-600\">Quiet Spaces</p>
                <p className=\"text-2xl font-bold text-slate-900\">20</p>
              </div>
            </div>
          </Card>

          <Card className=\"p-4 bg-white/80 backdrop-blur-sm border-orange-200\">
            <div className=\"flex items-center gap-3\">
              <div className=\"w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center\">
                <User className=\"w-6 h-6 text-orange-600\" />
              </div>
              <div>
                <p className=\"text-sm text-slate-600\">Community Members</p>
                <p className=\"text-2xl font-bold text-slate-900\">Growing</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Emergency Button */}
        {user && (
          <div className=\"mb-6\">
            <Button
              onClick={handleEmergency}
              className=\"w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold py-6 text-lg shadow-lg\"
            >
              <AlertCircle className=\"w-6 h-6 mr-2\" />
              ONE TAP CALM MODE - Find Quiet Spaces Now
            </Button>
          </div>
        )}

        {/* Map and Actions */}
        <div className=\"grid grid-cols-1 lg:grid-cols-3 gap-6\">
          {/* Map */}
          <div className=\"lg:col-span-2\">
            <Card className=\"p-4 bg-white/80 backdrop-blur-sm\">
              <div className=\"mb-4 flex items-center justify-between\">
                <h2 className=\"text-lg font-bold text-slate-900\">Live Sensory Map</h2>
                <Badge variant=\"secondary\">
                  {heatmapData.length} data points
                </Badge>
              </div>
              <MapInterface
                center={mapCenter}
                zoom={mapZoom}
                onMapClick={handleMapClick}
                markers={markers}
                heatmapData={heatmapData}
              />
              <p className=\"text-sm text-slate-600 mt-4 text-center\">
                {user ? '📍 Click anywhere on the map to tag a location' : '⚠️ Please login to tag locations'}
              </p>
            </Card>
          </div>

          {/* Sidebar */}
          <div className=\"space-y-6\">
            {/* Quick Actions */}
            <Card className=\"p-6 bg-white/80 backdrop-blur-sm\">
              <h3 className=\"text-lg font-bold mb-4 text-slate-900\">Quick Actions</h3>
              <div className=\"space-y-3\">
                <Button
                  className=\"w-full justify-start\"
                  variant=\"outline\"
                  onClick={() => {
                    if (!user) {
                      toast.error('Please login first');
                      return;
                    }
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition((pos) => {
                        setSelectedLocation({
                          lat: pos.coords.latitude,
                          lng: pos.coords.longitude
                        });
                        setShowTaggingModal(true);
                      });
                    }
                  }}
                  disabled={!user}
                >
                  <Plus className=\"w-4 h-4 mr-2\" />
                  Tag Current Location
                </Button>

                <Button
                  className=\"w-full justify-start\"
                  variant=\"outline\"
                  onClick={() => setShowProfileModal(true)}
                  disabled={!user}
                >
                  <User className=\"w-4 h-4 mr-2\" />
                  Update Sensory Profile
                </Button>

                <Button
                  className=\"w-full justify-start\"
                  variant=\"outline\"
                  onClick={() => {
                    loadTags();
                    loadHeatmapData();
                    toast.success('Map refreshed!');
                  }}
                >
                  <Navigation className=\"w-4 h-4 mr-2\" />
                  Refresh Map Data
                </Button>
              </div>
            </Card>

            {/* Profile Info */}
            {user && sensoryProfile && (
              <Card className=\"p-6 bg-gradient-to-br from-blue-50 to-green-50 border-blue-200\">
                <h3 className=\"text-lg font-bold mb-4 text-slate-900\">Your Profile</h3>
                <div className=\"space-y-3\">
                  <div>
                    <p className=\"text-sm text-slate-600\">Noise Sensitivity</p>
                    <div className=\"flex items-center gap-2\">
                      <div className=\"flex-1 bg-white rounded-full h-2\">
                        <div 
                          className=\"bg-orange-500 h-2 rounded-full\"
                          style={{ width: `${(sensoryProfile.noiseSensitivity / 10) * 100}%` }}
                        />
                      </div>
                      <span className=\"text-sm font-bold\">{sensoryProfile.noiseSensitivity}/10</span>
                    </div>
                  </div>
                  <div>
                    <p className=\"text-sm text-slate-600\">Light Sensitivity</p>
                    <div className=\"flex items-center gap-2\">
                      <div className=\"flex-1 bg-white rounded-full h-2\">
                        <div 
                          className=\"bg-yellow-500 h-2 rounded-full\"
                          style={{ width: `${(sensoryProfile.lightSensitivity / 10) * 100}%` }}
                        />
                      </div>
                      <span className=\"text-sm font-bold\">{sensoryProfile.lightSensitivity}/10</span>
                    </div>
                  </div>
                  <div>
                    <p className=\"text-sm text-slate-600\">Crowd Tolerance</p>
                    <div className=\"flex items-center gap-2\">
                      <div className=\"flex-1 bg-white rounded-full h-2\">
                        <div 
                          className=\"bg-blue-500 h-2 rounded-full\"
                          style={{ width: `${(sensoryProfile.crowdTolerance / 10) * 100}%` }}
                        />
                      </div>
                      <span className=\"text-sm font-bold\">{sensoryProfile.crowdTolerance}/10</span>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Legend */}
            <Card className=\"p-6 bg-white/80 backdrop-blur-sm\">
              <h3 className=\"text-lg font-bold mb-4 text-slate-900\">Heatmap Legend</h3>
              <div className=\"space-y-2\">
                <div className=\"flex items-center gap-2\">
                  <div className=\"w-4 h-4 rounded bg-green-500\" />
                  <span className=\"text-sm\">Low Sensory Load (Calm)</span>
                </div>
                <div className=\"flex items-center gap-2\">
                  <div className=\"w-4 h-4 rounded bg-yellow-500\" />
                  <span className=\"text-sm\">Medium Load (Moderate)</span>
                </div>
                <div className=\"flex items-center gap-2\">
                  <div className=\"w-4 h-4 rounded bg-orange-500\" />
                  <span className=\"text-sm\">High Load (Busy)</span>
                </div>
                <div className=\"flex items-center gap-2\">
                  <div className=\"w-4 h-4 rounded bg-red-500\" />
                  <span className=\"text-sm\">Very High (Overwhelming)</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className=\"fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50\">
          <Card className=\"w-full max-w-md p-6\">
            <h2 className=\"text-2xl font-bold mb-4\">
              {isLogin ? 'Login' : 'Create Account'}
            </h2>
            <form onSubmit={handleAuth} className=\"space-y-4\">
              {!isLogin && (
                <div>
                  <label className=\"block text-sm font-medium mb-2\">Name</label>
                  <Input
                    type=\"text\"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder=\"Your name\"
                    required={!isLogin}
                  />
                </div>
              )}
              <div>
                <label className=\"block text-sm font-medium mb-2\">Email</label>
                <Input
                  type=\"email\"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=\"your@email.com\"
                  required
                />
              </div>
              <div>
                <label className=\"block text-sm font-medium mb-2\">Password</label>
                <Input
                  type=\"password\"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=\"••••••••\"
                  required
                />
              </div>
              <div className=\"flex gap-3\">
                <Button
                  type=\"button\"
                  variant=\"outline\"
                  className=\"flex-1\"
                  onClick={() => setShowAuthModal(false)}
                >
                  Cancel
                </Button>
                <Button type=\"submit\" className=\"flex-1\">
                  {isLogin ? 'Login' : 'Sign Up'}
                </Button>
              </div>
              <p className=\"text-sm text-center text-slate-600\">
                {isLogin ? \"Don't have an account? \" : 'Already have an account? '}
                <button
                  type=\"button\"
                  className=\"text-blue-600 hover:underline\"
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? 'Sign up' : 'Login'}
                </button>
              </p>
            </form>
          </Card>
        </div>
      )}

      {/* Modals */}
      <TaggingModal
        isOpen={showTaggingModal}
        onClose={() => setShowTaggingModal(false)}
        location={selectedLocation}
        onSubmit={handleSubmitTag}
      />

      <SensoryProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        currentProfile={sensoryProfile}
        onSave={handleSaveProfile}
      />
    </div>
  );
}
