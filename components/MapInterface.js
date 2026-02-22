'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

export default function MapInterface({ 
  center = { lat: 20.5937, lng: 78.9629 },
  zoom = 5,
  onMapClick,
  markers = [],
  heatmapData = [],
  routes = []
}) {
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const markersRef = useRef([]);
  const heatmapLayerRef = useRef(null);
  const routePolylineRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['places', 'visualization', 'geometry']
    });

    loader.load().then((google) => {
      if (mapRef.current && !googleMapRef.current) {
        googleMapRef.current = new google.maps.Map(mapRef.current, {
          center,
          zoom,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        // Add click listener
        if (onMapClick) {
          googleMapRef.current.addListener('click', (e) => {
            onMapClick({
              lat: e.latLng.lat(),
              lng: e.latLng.lng()
            });
          });
        }

        setMapLoaded(true);
      }
    }).catch((error) => {
      console.error('Error loading Google Maps:', error);
    });
  }, []);

  // Update markers
  useEffect(() => {
    if (!mapLoaded || !googleMapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    markers.forEach(markerData => {
      const marker = new google.maps.Marker({
        position: { lat: markerData.lat, lng: markerData.lng },
        map: googleMapRef.current,
        title: markerData.title,
        icon: markerData.icon || null
      });

      if (markerData.onClick) {
        marker.addListener('click', () => markerData.onClick(markerData));
      }

      if (markerData.infoWindow) {
        const infoWindow = new google.maps.InfoWindow({
          content: markerData.infoWindow
        });
        marker.addListener('click', () => {
          infoWindow.open(googleMapRef.current, marker);
        });
      }

      markersRef.current.push(marker);
    });
  }, [markers, mapLoaded]);

  // Update heatmap
  useEffect(() => {
    if (!mapLoaded || !googleMapRef.current || !google.maps.visualization) return;

    // Remove existing heatmap
    if (heatmapLayerRef.current) {
      heatmapLayerRef.current.setMap(null);
    }

    if (heatmapData.length > 0) {
      const heatmapPoints = heatmapData.map(point => ({
        location: new google.maps.LatLng(point.lat, point.lng),
        weight: point.intensity || 1
      }));

      heatmapLayerRef.current = new google.maps.visualization.HeatmapLayer({
        data: heatmapPoints,
        map: googleMapRef.current,
        radius: 30,
        opacity: 0.6,
        gradient: [
          'rgba(0, 255, 0, 0)',
          'rgba(0, 255, 0, 1)',
          'rgba(255, 255, 0, 1)',
          'rgba(255, 165, 0, 1)',
          'rgba(255, 0, 0, 1)'
        ]
      });
    }
  }, [heatmapData, mapLoaded]);

  // Update routes
  useEffect(() => {
    if (!mapLoaded || !googleMapRef.current) return;

    // Remove existing polyline
    if (routePolylineRef.current) {
      routePolylineRef.current.setMap(null);
    }

    if (routes.length > 0) {
      const path = routes.map(point => ({ lat: point.lat, lng: point.lng }));
      
      routePolylineRef.current = new google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: '#10b981',
        strokeOpacity: 0.8,
        strokeWeight: 4,
        map: googleMapRef.current
      });
    }
  }, [routes, mapLoaded]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-full min-h-[600px] rounded-lg"
    />
  );
}
