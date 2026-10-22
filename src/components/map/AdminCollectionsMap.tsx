'use client';

import React, { useEffect, useRef } from 'react';
import { Booking, DriverProfile } from '@/types';

interface AdminCollectionsMapProps {
  bookings: Booking[];
  drivers: DriverProfile[];
  onSelectBooking?: (booking: Booking) => void;
  onAssignDriver?: (bookingId: string, driverId: string) => void;
}

export default function AdminCollectionsMap({
  bookings,
  drivers,
  onSelectBooking,
  onAssignDriver,
}: AdminCollectionsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    async function init() {
      if (typeof window === 'undefined' || !mapRef.current) return;
      const L = (await import('leaflet')).default;

      if (mapInstance.current) {
        mapInstance.current.remove();
      }

      // Default center: Delhi NCR / Gurugram
      const defaultCenter: [number, number] = [28.4595, 77.0266];

      const map = L.map(mapRef.current, {
        center: defaultCenter,
        zoom: 12,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      // Add pins for bookings
      bookings.forEach((booking, idx) => {
        const lat = booking.address_snapshot?.latitude || (28.4595 + ((idx % 5) - 2) * 0.018);
        const lng = booking.address_snapshot?.longitude || (77.0266 + (((idx * 3) % 5) - 2) * 0.022);

        const isAssigned = Boolean(booking.driver_id || booking.driver_name);
        const pinColor = isAssigned ? '#08784E' : '#F6B58D';

        const customMarker = L.divIcon({
          className: 'admin-marker-pin',
          html: `
            <div style="background-color: ${pinColor}; color: ${isAssigned ? '#ffffff' : '#18352E'}; width: 34px; height: 34px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2px solid white; font-weight: bold; font-size: 11px;">
              <span style="transform: rotate(45deg);">${idx + 1}</span>
            </div>
          `,
          iconSize: [34, 34],
          iconAnchor: [17, 34],
          popupAnchor: [0, -34],
        });

        const popupContent = document.createElement('div');
        popupContent.className = 'p-1 text-xs';
        popupContent.innerHTML = `
          <div style="font-weight: bold; color: #08784E; margin-bottom: 2px;">#${booking.booking_reference}</div>
          <div style="font-weight: 600; color: #0D2319;">${booking.patient_name} (${booking.scheduled_slot})</div>
          <div style="color: #555; margin-bottom: 4px;">${booking.address_snapshot?.locality || 'Locality'}, ${booking.address_snapshot?.city || 'City'}</div>
          <div style="font-size: 10px; margin-bottom: 6px;">
            Status: <b>${booking.status}</b><br/>
            Phlebotomist: <b>${booking.driver_name || 'Unassigned'}</b>
          </div>
        `;

        const marker = L.marker([lat, lng], { icon: customMarker })
          .addTo(map)
          .bindPopup(popupContent);

        marker.on('click', () => {
          if (onSelectBooking) onSelectBooking(booking);
        });
      });

      mapInstance.current = map;
    }

    init();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [bookings, drivers, onSelectBooking]);

  return (
    <div className="w-full h-full rounded-3xl border border-ivory-300 overflow-hidden relative shadow-soft">
      <div ref={mapRef} className="w-full h-full min-h-[520px]" />
      
      {/* Legend Badge */}
      <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-ivory-300 shadow-soft-sm text-xs space-y-1.5">
        <span className="font-bold text-botanical-950 block border-b border-ivory-200 pb-1">
          Active Phlebotomy Dispatch Map
        </span>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-peach-400 border border-peach-500 inline-block" />
          <span className="text-botanical-800">Pending Assignment</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-botanical-500 border border-botanical-600 inline-block" />
          <span className="text-botanical-800">Assigned / In Transit</span>
        </div>
      </div>
    </div>
  );
}
