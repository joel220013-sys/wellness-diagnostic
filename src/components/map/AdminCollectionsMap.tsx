'use client';

import React, { useEffect, useRef } from 'react';
import { Booking, DriverProfile } from '@/types';

interface AdminCollectionsMapProps {
  bookings: Booking[];
  drivers: DriverProfile[];
  onSelectBooking?: (booking: Booking) => void;
  onAssignDriver?: (bookingId: string, driverId: string) => void;
}

const GOOGLE_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
  'AIzaSyAwsS5CrgxBPJ37X6UoWiX5ZgIAlVWDk48';

function loadGoogleMapsScript(apiKey: string): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.google?.maps) return Promise.resolve();
  if (window.__googleMapsLoadingPromise) return window.__googleMapsLoadingPromise;

  window.__googleMapsLoadingPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById('google-maps-sdk-script');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', (err) => reject(err));
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-sdk-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });

  return window.__googleMapsLoadingPromise;
}

export default function AdminCollectionsMap({
  bookings,
  drivers,
  onSelectBooking,
  onAssignDriver,
}: AdminCollectionsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function init() {
      if (typeof window === 'undefined' || !mapRef.current) return;
      await loadGoogleMapsScript(GOOGLE_API_KEY);
      if (!isMounted || !mapRef.current || !window.google?.maps) return;

      const google = window.google;

      // Default center: Davanagere Lab
      const defaultCenter = { lat: 14.4408576, lng: 75.9332864 };

      if (!mapInstance.current) {
        mapInstance.current = new google.maps.Map(mapRef.current, {
          center: defaultCenter,
          zoom: 13,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          mapTypeControl: true,
          zoomControl: true,
          streetViewControl: false,
          fullscreenControl: false,
        });
      }

      // Clear existing markers
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];

      const bounds = new google.maps.LatLngBounds();
      let hasValidCoords = false;

      // Add pins for bookings
      bookings.forEach((booking, idx) => {
        const lat = booking.address_snapshot?.latitude || (14.4408 + ((idx % 5) - 2) * 0.008);
        const lng = booking.address_snapshot?.longitude || (75.9332 + (((idx * 3) % 5) - 2) * 0.009);

        const isAssigned = Boolean(booking.driver_id || booking.driver_name);
        const pinColor = isAssigned ? '#08784E' : '#F6B58D';

        const markerPos = { lat, lng };
        bounds.extend(markerPos);
        hasValidCoords = true;

        const marker = new google.maps.Marker({
          position: markerPos,
          map: mapInstance.current,
          title: `#${booking.booking_reference} - ${booking.patient_name}`,
          icon: {
            url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="${encodeURIComponent(pinColor)}" stroke="%23ffffff" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><text x="12" y="16" font-size="10" font-family="sans-serif" font-weight="bold" text-anchor="middle" fill="${isAssigned ? '%23ffffff' : '%2318352E'}">${idx + 1}</text></svg>`,
            scaledSize: new google.maps.Size(34, 34),
            anchor: new google.maps.Point(17, 17),
          },
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="font-family: sans-serif; font-size: 12px; color: #18352E; padding: 4px; max-width: 200px;">
              <div style="font-weight: bold; color: #08784E; margin-bottom: 2px;">#${booking.booking_reference}</div>
              <div style="font-weight: 600; color: #0D2319;">${booking.patient_name} (${booking.scheduled_slot})</div>
              <div style="color: #555; margin-bottom: 4px;">${booking.address_snapshot?.locality || 'Locality'}, ${booking.address_snapshot?.city || 'Davanagere'}</div>
              <div style="font-size: 10px; margin-bottom: 4px;">
                Status: <b>${booking.status}</b><br/>
                Phlebotomist: <b>${booking.driver_name || 'Unassigned'}</b>
              </div>
            </div>
          `,
        });

        marker.addListener('click', () => {
          infoWindow.open(mapInstance.current, marker);
          if (onSelectBooking) onSelectBooking(booking);
        });

        markersRef.current.push(marker);
      });

      if (hasValidCoords && bookings.length > 1) {
        mapInstance.current.fitBounds(bounds);
      }
    }

    init();

    return () => {
      isMounted = false;
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
    };
  }, [bookings, drivers, onSelectBooking]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapRef} className="w-full h-full min-h-[450px] rounded-2xl overflow-hidden" />
    </div>
  );
}
