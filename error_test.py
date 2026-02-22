#!/usr/bin/env python3
"""
Quick test to verify error handling is working correctly
"""

import requests
import json
import time

BASE_URL = "https://sensory-safe.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"

def test_error_scenarios():
    print("Testing error scenarios...")
    
    # Get a valid token first
    register_response = requests.post(f"{API_BASE}/auth/register", json={
        "email": f"errortest_{int(time.time() * 1000)}@example.com",
        "password": "TestPass123!",
        "name": "Error Test User"
    })
    
    if register_response.status_code != 200:
        print("❌ Failed to create test user")
        return False
        
    token = register_response.json()["token"]
    
    # Test 1: Invalid auth token
    response = requests.get(f"{API_BASE}/auth/me", headers={"Authorization": "Bearer invalid_token"})
    if response.status_code == 401:
        print("✅ Invalid Auth Token: Correctly rejected")
    else:
        print(f"❌ Invalid Auth Token: Expected 401, got {response.status_code}")
        
    # Test 2: Missing required fields
    response = requests.post(f"{API_BASE}/profile", 
                           json={"noiseSensitivity": 5},
                           headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"})
    if response.status_code == 400:
        print("✅ Missing Required Fields: Correctly rejected")
    else:
        print(f"❌ Missing Required Fields: Expected 400, got {response.status_code}")
        
    # Test 3: Invalid data ranges
    response = requests.post(f"{API_BASE}/profile", 
                           json={"noiseSensitivity": 15, "lightSensitivity": 5, "crowdTolerance": 5},
                           headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"})
    if response.status_code == 400:
        print("✅ Invalid Data Ranges: Correctly rejected")
    else:
        print(f"❌ Invalid Data Ranges: Expected 400, got {response.status_code}")
        
    print("Error scenario testing complete!")

if __name__ == "__main__":
    test_error_scenarios()