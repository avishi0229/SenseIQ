#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Sensory Smart Navigation System
Tests all 15 endpoints with real-looking data and proper error handling.
"""

import requests
import json
import time
import os
from datetime import datetime

# Test configuration
BASE_URL = "https://sensory-safe.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"

# Test user data
TEST_USER = {
    "email": "sarah.johnson@email.com",
    "password": "SecurePass123!",
    "name": "Sarah Johnson"
}

TEST_USER_2 = {
    "email": "alex.martinez@email.com", 
    "password": "StrongPass456!",
    "name": "Alex Martinez"
}

# Test location data (Mumbai coordinates)
MUMBAI_COORDS = {
    "latitude": 19.0760,
    "longitude": 72.8777
}

DELHI_COORDS = {
    "latitude": 28.6139,
    "longitude": 77.2090
}

class SensoryAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.user_id = None
        self.test_results = {}
        
    def log_test(self, test_name, success, details="", response_data=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        if not success and response_data:
            print(f"   Response: {response_data}")
        print()
        
        self.test_results[test_name] = {
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        
    def make_request(self, method, endpoint, data=None, params=None, auth=True):
        """Make HTTP request with proper error handling"""
        url = f"{API_BASE}{endpoint}"
        headers = {"Content-Type": "application/json"}
        
        if auth and self.auth_token:
            headers["Authorization"] = f"Bearer {self.auth_token}"
            
        try:
            if method == "GET":
                response = self.session.get(url, params=params, headers=headers, timeout=30)
            elif method == "POST":
                response = self.session.post(url, json=data, params=params, headers=headers, timeout=30)
            elif method == "PUT":
                response = self.session.put(url, json=data, params=params, headers=headers, timeout=30)
            elif method == "DELETE":
                response = self.session.delete(url, params=params, headers=headers, timeout=30)
                
            return response
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {e}")
            return None

    def test_user_registration(self):
        """Test POST /api/auth/register"""
        print("🔐 Testing User Registration...")
        
        # Test successful registration
        response = self.make_request("POST", "/auth/register", TEST_USER, auth=False)
        
        if response and response.status_code == 200:
            data = response.json()
            if "token" in data and "user" in data:
                self.log_test(
                    "User Registration", 
                    True, 
                    f"User registered successfully: {data['user']['email']}"
                )
                return True
            else:
                self.log_test("User Registration", False, "Missing token or user in response", data)
        elif response and response.status_code == 400:
            # User might already exist, try with different email
            test_user_new = TEST_USER.copy()
            test_user_new["email"] = f"test_{int(time.time())}@email.com"
            
            response = self.make_request("POST", "/auth/register", test_user_new, auth=False)
            if response and response.status_code == 200:
                data = response.json()
                self.log_test(
                    "User Registration", 
                    True, 
                    f"User registered successfully with new email: {data['user']['email']}"
                )
                return True
        
        self.log_test(
            "User Registration", 
            False, 
            f"Registration failed with status: {response.status_code if response else 'No response'}", 
            response.json() if response else None
        )
        return False

    def test_user_login(self):
        """Test POST /api/auth/login"""
        print("🔐 Testing User Login...")
        
        login_data = {
            "email": TEST_USER["email"],
            "password": TEST_USER["password"]
        }
        
        response = self.make_request("POST", "/auth/login", login_data, auth=False)
        
        if response and response.status_code == 200:
            data = response.json()
            if "token" in data and "user" in data:
                self.auth_token = data["token"]
                self.user_id = data["user"]["id"]
                self.log_test(
                    "User Login", 
                    True, 
                    f"Login successful for: {data['user']['email']}"
                )
                return True
            else:
                self.log_test("User Login", False, "Missing token or user in response", data)
        else:
            self.log_test(
                "User Login", 
                False, 
                f"Login failed with status: {response.status_code if response else 'No response'}", 
                response.json() if response else None
            )
        return False

    def test_get_current_user(self):
        """Test GET /api/auth/me"""
        print("🔐 Testing Get Current User...")
        
        if not self.auth_token:
            self.log_test("Get Current User", False, "No auth token available")
            return False
            
        response = self.make_request("GET", "/auth/me")
        
        if response and response.status_code == 200:
            data = response.json()
            if "id" in data and "email" in data:
                self.log_test(
                    "Get Current User", 
                    True, 
                    f"User data retrieved: {data['email']}"
                )
                return True
            else:
                self.log_test("Get Current User", False, "Invalid user data structure", data)
        else:
            self.log_test(
                "Get Current User", 
                False, 
                f"Request failed with status: {response.status_code if response else 'No response'}", 
                response.json() if response else None
            )
        return False

    def test_create_sensory_profile(self):
        """Test POST /api/profile"""
        print("👤 Testing Create Sensory Profile...")
        
        if not self.auth_token:
            self.log_test("Create Sensory Profile", False, "No auth token available")
            return False
            
        profile_data = {
            "noiseSensitivity": 7,
            "lightSensitivity": 6,
            "crowdTolerance": 4
        }
        
        response = self.make_request("POST", "/profile", profile_data)
        
        if response and response.status_code == 200:
            data = response.json()
            if "noiseSensitivity" in data and "lightSensitivity" in data and "crowdTolerance" in data:
                self.log_test(
                    "Create Sensory Profile", 
                    True, 
                    f"Profile created: Noise={data['noiseSensitivity']}, Light={data['lightSensitivity']}, Crowd={data['crowdTolerance']}"
                )
                return True
            else:
                self.log_test("Create Sensory Profile", False, "Invalid profile data structure", data)
        else:
            self.log_test(
                "Create Sensory Profile", 
                False, 
                f"Request failed with status: {response.status_code if response else 'No response'}", 
                response.json() if response else None
            )
        return False

    def test_get_sensory_profile(self):
        """Test GET /api/profile"""
        print("👤 Testing Get Sensory Profile...")
        
        if not self.auth_token:
            self.log_test("Get Sensory Profile", False, "No auth token available")
            return False
            
        response = self.make_request("GET", "/profile")
        
        if response and response.status_code == 200:
            data = response.json()
            if "noiseSensitivity" in data and "lightSensitivity" in data and "crowdTolerance" in data:
                self.log_test(
                    "Get Sensory Profile", 
                    True, 
                    f"Profile retrieved: Noise={data['noiseSensitivity']}, Light={data['lightSensitivity']}, Crowd={data['crowdTolerance']}"
                )
                return True
            else:
                self.log_test("Get Sensory Profile", False, "Invalid profile data structure", data)
        else:
            self.log_test(
                "Get Sensory Profile", 
                False, 
                f"Request failed with status: {response.status_code if response else 'No response'}", 
                response.json() if response else None
            )
        return False

    def test_create_location_tag(self):
        """Test POST /api/tags"""
        print("📍 Testing Create Location Tag...")
        
        if not self.auth_token:
            self.log_test("Create Location Tag", False, "No auth token available")
            return False
            
        tag_data = {
            "latitude": MUMBAI_COORDS["latitude"],
            "longitude": MUMBAI_COORDS["longitude"],
            "placeName": "Mumbai Central Station",
            "noiseLevel": 8,
            "lightingLevel": 6,
            "crowdDensity": 9,
            "timeOfDay": "Morning",
            "environment": "Indoor",
            "notes": "Very busy train station during morning hours"
        }
        
        response = self.make_request("POST", "/tags", tag_data)
        
        if response and response.status_code == 200:
            data = response.json()
            if "id" in data and "latitude" in data and "longitude" in data:
                self.log_test(
                    "Create Location Tag", 
                    True, 
                    f"Tag created for {data.get('placeName', 'location')}: Noise={data['noiseLevel']}, Light={data['lightingLevel']}, Crowd={data['crowdDensity']}"
                )
                return True
            else:
                self.log_test("Create Location Tag", False, "Invalid tag data structure", data)
        else:
            self.log_test(
                "Create Location Tag", 
                False, 
                f"Request failed with status: {response.status_code if response else 'No response'}", 
                response.json() if response else None
            )
        return False

    def test_get_location_tags(self):
        """Test GET /api/tags"""
        print("📍 Testing Get Location Tags...")
        
        # Test without location filter
        response = self.make_request("GET", "/tags", auth=False)
        
        if response and response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                self.log_test(
                    "Get Location Tags (All)", 
                    True, 
                    f"Retrieved {len(data)} tags"
                )
                
                # Test with location filter
                params = {
                    "lat": MUMBAI_COORDS["latitude"],
                    "lng": MUMBAI_COORDS["longitude"],
                    "radius": 5
                }
                
                response = self.make_request("GET", "/tags", params=params, auth=False)
                if response and response.status_code == 200:
                    filtered_data = response.json()
                    self.log_test(
                        "Get Location Tags (Filtered)", 
                        True, 
                        f"Retrieved {len(filtered_data)} tags near Mumbai"
                    )
                    return True
                else:
                    self.log_test("Get Location Tags (Filtered)", False, "Failed to get filtered tags")
            else:
                self.log_test("Get Location Tags (All)", False, "Response is not an array", data)
        else:
            self.log_test(
                "Get Location Tags (All)", 
                False, 
                f"Request failed with status: {response.status_code if response else 'No response'}", 
                response.json() if response else None
            )
        return False

    def test_sli_calculation(self):
        """Test POST /api/sli/calculate"""
        print("📊 Testing SLI Calculation...")
        
        if not self.auth_token:
            self.log_test("SLI Calculation", False, "No auth token available")
            return False
            
        sli_data = {
            "latitude": MUMBAI_COORDS["latitude"],
            "longitude": MUMBAI_COORDS["longitude"],
            "timeSlot": "Morning"
        }
        
        response = self.make_request("POST", "/sli/calculate", sli_data)
        
        if response and response.status_code == 200:
            data = response.json()
            if "sliScore" in data and "riskLevel" in data:
                self.log_test(
                    "SLI Calculation", 
                    True, 
                    f"SLI Score: {data['sliScore']}, Risk Level: {data['riskLevel']}"
                )
                return True
            else:
                self.log_test("SLI Calculation", False, "Invalid SLI data structure", data)
        else:
            self.log_test(
                "SLI Calculation", 
                False, 
                f"Request failed with status: {response.status_code if response else 'No response'}", 
                response.json() if response else None
            )
        return False

    def test_heatmap_data(self):
        """Test GET /api/heatmap"""
        print("🗺️ Testing Heatmap Data...")
        
        params = {
            "lat": MUMBAI_COORDS["latitude"],
            "lng": MUMBAI_COORDS["longitude"],
            "radius": 10
        }
        
        response = self.make_request("GET", "/heatmap", params=params, auth=False)
        
        if response and response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                self.log_test(
                    "Heatmap Data", 
                    True, 
                    f"Retrieved heatmap data with {len(data)} points"
                )
                return True
            else:
                self.log_test("Heatmap Data", False, "Response is not an array", data)
        else:
            self.log_test(
                "Heatmap Data", 
                False, 
                f"Request failed with status: {response.status_code if response else 'No response'}", 
                response.json() if response else None
            )
        return False

    def test_emergency_support(self):
        """Test POST /api/emergency"""
        print("🚨 Testing Emergency Support...")
        
        if not self.auth_token:
            self.log_test("Emergency Support", False, "No auth token available")
            return False
            
        emergency_data = {
            "latitude": MUMBAI_COORDS["latitude"],
            "longitude": MUMBAI_COORDS["longitude"],
            "triggerReason": "High sensory overload",
            "currentSliScore": 8.5
        }
        
        response = self.make_request("POST", "/emergency", emergency_data)
        
        if response and response.status_code == 200:
            data = response.json()
            if "message" in data and "quietSpaces" in data:
                self.log_test(
                    "Emergency Support", 
                    True, 
                    f"Emergency activated: {data['message']}, Found {len(data['quietSpaces'])} nearby quiet spaces"
                )
                return True
            else:
                self.log_test("Emergency Support", False, "Invalid emergency response structure", data)
        else:
            self.log_test(
                "Emergency Support", 
                False, 
                f"Request failed with status: {response.status_code if response else 'No response'}", 
                response.json() if response else None
            )
        return False

    def test_get_quiet_spaces(self):
        """Test GET /api/quiet-spaces"""
        print("🤫 Testing Get Quiet Spaces...")
        
        # Test without location filter
        response = self.make_request("GET", "/quiet-spaces", auth=False)
        
        if response and response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                self.log_test(
                    "Get Quiet Spaces (All)", 
                    True, 
                    f"Retrieved {len(data)} quiet spaces"
                )
                
                # Test with location filter
                params = {
                    "lat": MUMBAI_COORDS["latitude"],
                    "lng": MUMBAI_COORDS["longitude"]
                }
                
                response = self.make_request("GET", "/quiet-spaces", params=params, auth=False)
                if response and response.status_code == 200:
                    filtered_data = response.json()
                    self.log_test(
                        "Get Quiet Spaces (Filtered)", 
                        True, 
                        f"Retrieved {len(filtered_data)} quiet spaces near Mumbai"
                    )
                    return True
                else:
                    self.log_test("Get Quiet Spaces (Filtered)", False, "Failed to get filtered quiet spaces")
            else:
                self.log_test("Get Quiet Spaces (All)", False, "Response is not an array", data)
        else:
            self.log_test(
                "Get Quiet Spaces (All)", 
                False, 
                f"Request failed with status: {response.status_code if response else 'No response'}", 
                response.json() if response else None
            )
        return False

    def test_create_quiet_space(self):
        """Test POST /api/quiet-spaces"""
        print("🤫 Testing Create Quiet Space...")
        
        if not self.auth_token:
            self.log_test("Create Quiet Space", False, "No auth token available")
            return False
            
        quiet_space_data = {
            "latitude": 19.0825,
            "longitude": 72.8818,
            "name": "Oval Maidan Park",
            "type": "Park",
            "avgNoise": 3,
            "avgLight": 4,
            "avgCrowd": 2,
            "description": "Large open park perfect for quiet walks and meditation"
        }
        
        response = self.make_request("POST", "/quiet-spaces", quiet_space_data)
        
        if response and response.status_code == 200:
            data = response.json()
            if "id" in data and "name" in data and "type" in data:
                self.log_test(
                    "Create Quiet Space", 
                    True, 
                    f"Quiet space created: {data['name']} ({data['type']}) - Noise: {data['avgNoise']}, Light: {data['avgLight']}, Crowd: {data['avgCrowd']}"
                )
                return True
            else:
                self.log_test("Create Quiet Space", False, "Invalid quiet space data structure", data)
        else:
            self.log_test(
                "Create Quiet Space", 
                False, 
                f"Request failed with status: {response.status_code if response else 'No response'}", 
                response.json() if response else None
            )
        return False

    def test_recommendations(self):
        """Test GET /api/recommendations"""
        print("💡 Testing Recommendations...")
        
        params = {
            "lat": MUMBAI_COORDS["latitude"],
            "lng": MUMBAI_COORDS["longitude"]
        }
        
        response = self.make_request("GET", "/recommendations", params=params, auth=False)
        
        if response and response.status_code == 200:
            data = response.json()
            if "recommendations" in data and "bestTimeSlot" in data:
                self.log_test(
                    "Recommendations", 
                    True, 
                    f"Best time slot: {data['bestTimeSlot']}, Recommendations available for all time periods"
                )
                return True
            else:
                self.log_test("Recommendations", False, "Invalid recommendations data structure", data)
        else:
            self.log_test(
                "Recommendations", 
                False, 
                f"Request failed with status: {response.status_code if response else 'No response'}", 
                response.json() if response else None
            )
        return False

    def test_save_route(self):
        """Test POST /api/routes"""
        print("🛣️ Testing Save Route...")
        
        if not self.auth_token:
            self.log_test("Save Route", False, "No auth token available")
            return False
            
        route_data = {
            "originLat": MUMBAI_COORDS["latitude"],
            "originLng": MUMBAI_COORDS["longitude"],
            "originName": "Mumbai Central",
            "destinationLat": DELHI_COORDS["latitude"],
            "destinationLng": DELHI_COORDS["longitude"], 
            "destinationName": "New Delhi Railway Station",
            "routePath": [
                {"lat": 19.0760, "lng": 72.8777},
                {"lat": 20.0000, "lng": 75.0000},
                {"lat": 25.0000, "lng": 76.0000},
                {"lat": 28.6139, "lng": 77.2090}
            ],
            "distance": 1384.5,
            "duration": 900,
            "avgSliScore": 6.2,
            "riskLevel": "Medium",
            "routeType": "Calm"
        }
        
        response = self.make_request("POST", "/routes", route_data)
        
        if response and response.status_code == 200:
            data = response.json()
            if "id" in data and "distance" in data and "duration" in data:
                self.log_test(
                    "Save Route", 
                    True, 
                    f"Route saved: {data['distance']}km, {data['duration']}min, SLI Score: {data['avgSliScore']}, Risk: {data['riskLevel']}"
                )
                return True
            else:
                self.log_test("Save Route", False, "Invalid route data structure", data)
        else:
            self.log_test(
                "Save Route", 
                False, 
                f"Request failed with status: {response.status_code if response else 'No response'}", 
                response.json() if response else None
            )
        return False

    def test_get_routes(self):
        """Test GET /api/routes"""
        print("🛣️ Testing Get Routes...")
        
        if not self.auth_token:
            self.log_test("Get Routes", False, "No auth token available")
            return False
            
        response = self.make_request("GET", "/routes")
        
        if response and response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                self.log_test(
                    "Get Routes", 
                    True, 
                    f"Retrieved {len(data)} saved routes"
                )
                return True
            else:
                self.log_test("Get Routes", False, "Response is not an array", data)
        else:
            self.log_test(
                "Get Routes", 
                False, 
                f"Request failed with status: {response.status_code if response else 'No response'}", 
                response.json() if response else None
            )
        return False

    def test_error_scenarios(self):
        """Test various error scenarios"""
        print("⚠️ Testing Error Scenarios...")
        
        # Test invalid auth
        old_token = self.auth_token
        self.auth_token = "invalid_token"
        
        response = self.make_request("GET", "/auth/me")
        if response and response.status_code == 401:
            self.log_test("Invalid Auth Token", True, "Correctly rejected invalid token")
        else:
            self.log_test("Invalid Auth Token", False, "Should have rejected invalid token")
            
        # Restore token
        self.auth_token = old_token
        
        # Test missing required fields
        response = self.make_request("POST", "/profile", {"noiseSensitivity": 5}, auth=True)
        if response and response.status_code == 400:
            self.log_test("Missing Required Fields", True, "Correctly rejected incomplete data")
        else:
            self.log_test("Missing Required Fields", False, "Should have rejected incomplete data")
        
        # Test invalid data ranges
        invalid_profile = {
            "noiseSensitivity": 15,  # Invalid range
            "lightSensitivity": 5,
            "crowdTolerance": 5
        }
        response = self.make_request("POST", "/profile", invalid_profile, auth=True)
        if response and response.status_code == 400:
            self.log_test("Invalid Data Ranges", True, "Correctly rejected out-of-range values")
        else:
            self.log_test("Invalid Data Ranges", False, "Should have rejected out-of-range values")

    def run_all_tests(self):
        """Run all API tests in sequence"""
        print("=" * 60)
        print("🧪 SENSORY SMART NAVIGATION API TESTS")
        print("=" * 60)
        print(f"Base URL: {BASE_URL}")
        print(f"Testing started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 60)
        
        # Authentication flow
        auth_success = False
        if self.test_user_registration():
            if self.test_user_login():
                if self.test_get_current_user():
                    auth_success = True
        
        # Profile management (requires auth)
        if auth_success:
            self.test_create_sensory_profile()
            self.test_get_sensory_profile()
        
        # Location features
        self.test_create_location_tag() if auth_success else None
        self.test_get_location_tags()
        
        # SLI and analysis features
        self.test_sli_calculation() if auth_success else None
        self.test_heatmap_data()
        
        # Emergency and quiet spaces
        self.test_emergency_support() if auth_success else None
        self.test_get_quiet_spaces()
        self.test_create_quiet_space() if auth_success else None
        
        # Recommendations and routes
        self.test_recommendations()
        self.test_save_route() if auth_success else None
        self.test_get_routes() if auth_success else None
        
        # Error handling
        self.test_error_scenarios() if auth_success else None
        
        # Print summary
        print("=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results.values() if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n❌ Failed Tests:")
            for test_name, result in self.test_results.items():
                if not result["success"]:
                    print(f"  - {test_name}: {result['details']}")
        
        print("=" * 60)
        print(f"Testing completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        return passed_tests, failed_tests

if __name__ == "__main__":
    try:
        tester = SensoryAPITester()
        passed, failed = tester.run_all_tests()
        
        # Exit with appropriate code
        exit(0 if failed == 0 else 1)
        
    except KeyboardInterrupt:
        print("\n🛑 Testing interrupted by user")
        exit(1)
    except Exception as e:
        print(f"\n💥 Testing failed with error: {e}")
        exit(1)