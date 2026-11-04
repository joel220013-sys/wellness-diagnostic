'use client';

import React, { useEffect, useRef } from 'react';
import { ExternalLink, Navigation, MapPin } from 'lucide-react';

interface DriverDirectionsMapProps {
  latitude: number;
  longitude: number;
  patientName: string;
  addressText: string;
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

export default function DriverDirectionsMap({
  latitude,
  longitude,
  patientName,
  addressText,
}: DriverDirectionsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    async function init() {
      if (typeof window === 'undefined' || !mapRef.current) return;
      await loadGoogleMapsScript(GOOGLE_API_KEY);
      if (!isMounted || !mapRef.current || !window.google?.maps) return;

      const google = window.google;
      const pos = { lat: latitude, lng: longitude };

      if (!mapInstance.current) {
        mapInstance.current = new google.maps.Map(mapRef.current, {
          center: pos,
          zoom: 16,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
      } else {
        mapInstance.current.setCenter(pos);
      }

      if (markerRef.current) {
        markerRef.current.setMap(null);
      }

      const marker = new google.maps.Marker({
        position: pos,
        map: mapInstance.current,
        title: patientName,
        icon: {
          url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="%2308784E" stroke="%23ffffff" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 7v10M7 12h10" stroke="%23ffffff" stroke-width="2.5" stroke-linecap="round"/></svg>`,
          scaledSize: new google.maps.Size(36, 36),
          anchor: new google.maps.Point(18, 18),
        },
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="font-family: sans-serif; font-size: 12px; color: #18352E; padding: 4px;">
            <b>${patientName}</b><br/>
            ${addressText}
          </div>
        `,
      });
      infoWindow.open(mapInstance.current, marker);

      markerRef.current = marker;
    }

    init();

    return () => {
      isMounted = false;
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
    };
  }, [latitude, longitude, patientName, addressText]);

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

  return (
    <div className="rounded-2xl border border-ivory-300 overflow-hidden bg-white shadow-soft-sm">
      <div className="relative h-48 w-full bg-ivory-100">
        <div ref={mapRef} className="w-full h-full" />
      </div>

      <div className="p-3 bg-white flex items-center justify-between gap-2 border-t border-ivory-200">
        <div className="flex items-center gap-2 overflow-hidden text-xs">
          <MapPin className="w-4 h-4 text-botanical-600 flex-shrink-0" />
          <span className="truncate text-botanical-900 font-medium">{addressText}</span>
        </div>

        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-botanical-600 hover:bg-botanical-700 text-white text-xs font-bold transition-colors shadow-soft-sm"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Open Google GPS</span>
          <ExternalLink className="w-3 h-3 opacity-70" />
        </a>
      </div>
    </div>
  );
}
