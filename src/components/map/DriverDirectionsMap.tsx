'use client';

import React, { useEffect, useRef } from 'react';
import { ExternalLink, Navigation, MapPin } from 'lucide-react';

interface DriverDirectionsMapProps {
  latitude: number;
  longitude: number;
  patientName: string;
  addressText: string;
}

export default function DriverDirectionsMap({
  latitude,
  longitude,
  patientName,
  addressText,
}: DriverDirectionsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    async function init() {
      if (typeof window === 'undefined' || !mapRef.current) return;
      const L = (await import('leaflet')).default;

      if (mapInstance.current) {
        mapInstance.current.remove();
      }

      const map = L.map(mapRef.current, {
        center: [latitude, longitude],
        zoom: 15,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
      }).addTo(map);

      const pinIcon = L.divIcon({
        className: 'driver-dest-pin',
        html: `
          <div style="background-color: #08784E; color: white; width: 34px; height: 34px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2px solid white;">
            <svg style="transform: rotate(45deg); width: 16px; height: 16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2v20M2 12h20"/>
            </svg>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
      });

      L.marker([latitude, longitude], { icon: pinIcon })
        .addTo(map)
        .bindPopup(`<b>${patientName}</b><br/>${addressText}`)
        .openPopup();

      mapInstance.current = map;
    }

    init();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
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
          <span>Open GPS</span>
          <ExternalLink className="w-3 h-3 opacity-70" />
        </a>
      </div>
    </div>
  );
}
