import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Battery, BatteryCharging, Navigation, WifiOff, RefreshCw, Phone } from 'lucide-react';
import { getSocket } from '../services/socket';
import { useAuthStore } from '../store/authStore';

// Custom Marker Icon generator
function createMemberIcon(name: string, isStale = false) {
  const initial = name?.charAt(0).toUpperCase() || '?';
  const bgColor = isStale ? '#94a3b8' : '#2563eb';

  const html = `
    <div style="
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: ${bgColor};
      color: white;
      font-weight: bold;
      font-family: sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid white;
      box-shadow: 0 4px 10px rgba(0,0,0,0.25);
      position: relative;
    ">
      <span>${initial}</span>
      <div style="
        position: absolute;
        bottom: -5px;
        left: 14px;
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 6px solid ${bgColor};
      "></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-member-pin',
    iconSize: [40, 45],
    iconAnchor: [20, 45],
    popupAnchor: [0, -45],
  });
}

// Helper component to center map programmatically
function ChangeMapView({ coords }: { coords: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(coords, 15, { duration: 1.5 });
  }, [coords, map]);
  return null;
}

interface MemberMarkerData {
  userId: string;
  name: string;
  lat: number;
  lng: number;
  accuracy?: number;
  battery?: number;
  isCharging?: boolean;
  speed?: number;
  updatedAt: string;
  isStale?: boolean;
  phone?: string;
}

export const LiveMapPage: React.FC = () => {
  const { user } = useAuthStore();
  const [selectedCoords, setSelectedCoords] = useState<[number, number]>([28.6139, 77.209]); // Default fallback
  const [members, setMembers] = useState<MemberMarkerData[]>([]);
  const [selectedMember, setSelectedMember] = useState<MemberMarkerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial dummy/placeholder or fetched locations
    // In Phase 3 & 4, real family member locations will be populated via /families/:id/locations
    const sampleMembers: MemberMarkerData[] = [
      {
        userId: user?.id || 'self',
        name: user?.fullName || 'You (Primary)',
        lat: 28.6139,
        lng: 77.209,
        accuracy: 15,
        battery: 88,
        isCharging: true,
        updatedAt: 'Just now',
        isStale: false,
      },
    ];

    setMembers(sampleMembers);
    setSelectedMember(sampleMembers[0]);
    setSelectedCoords([sampleMembers[0].lat, sampleMembers[0].lng]);
    setLoading(false);

    // Socket.IO Real-time updates listener
    const socket = getSocket();
    const handleLocationUpdate = (data: any) => {
      setMembers((prev) => {
        const index = prev.findIndex((m) => m.userId === data.userId);
        const updated: MemberMarkerData = {
          userId: data.userId,
          name: data.userName || 'Member',
          lat: data.latitude,
          lng: data.longitude,
          accuracy: data.accuracy,
          battery: data.batteryPercentage,
          isCharging: data.isCharging,
          speed: data.speed,
          updatedAt: 'Just now',
          isStale: false,
        };

        if (index >= 0) {
          const clone = [...prev];
          clone[index] = updated;
          return clone;
        }
        return [...prev, updated];
      });
    };

    socket.on('location:update', handleLocationUpdate);

    return () => {
      socket.off('location:update', handleLocationUpdate);
    };
  }, [user]);

  const handleSelectMember = (member: MemberMarkerData) => {
    setSelectedMember(member);
    setSelectedCoords([member.lat, member.lng]);
  };

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Map Element */}
      <MapContainer
        center={selectedCoords}
        zoom={14}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ChangeMapView coords={selectedCoords} />

        {members.map((member) => (
          <React.Fragment key={member.userId}>
            <Marker
              position={[member.lat, member.lng]}
              icon={createMemberIcon(member.name, member.isStale)}
              eventHandlers={{
                click: () => handleSelectMember(member),
              }}
            >
              <Popup>
                <div className="p-1 min-w-[180px]">
                  <h4 className="font-bold text-slate-900 text-sm">{member.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Updated: {member.updatedAt}</p>
                  {member.battery !== undefined && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-600">
                      {member.isCharging ? (
                        <BatteryCharging className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Battery className="h-4 w-4 text-slate-600" />
                      )}
                      <span>{member.battery}% Battery</span>
                    </div>
                  )}
                  {member.phone && (
                    <a
                      href={`tel:${member.phone}`}
                      className="mt-3 flex items-center justify-center gap-2 py-1.5 px-3 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      <span>Call Member</span>
                    </a>
                  )}
                </div>
              </Popup>
            </Marker>

            {member.accuracy && (
              <Circle
                center={[member.lat, member.lng]}
                radius={member.accuracy}
                pathOptions={{
                  fillColor: '#3b82f6',
                  fillOpacity: 0.15,
                  color: '#3b82f6',
                  weight: 1,
                }}
              />
            )}
          </React.Fragment>
        ))}
      </MapContainer>

      {/* Floating Family Members Cards (Overlay on Map) */}
      <div className="absolute top-4 left-4 right-4 sm:right-auto sm:w-80 z-[1000] pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-200/80 p-4 pointer-events-auto space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Family Members</h3>
              <p className="text-[11px] text-slate-500">{members.length} member online</p>
            </div>
            <button
              onClick={() => {}}
              title="Refresh"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {members.map((member) => {
              const isSelected = selectedMember?.userId === member.userId;
              return (
                <div
                  key={member.userId}
                  onClick={() => handleSelectMember(member)}
                  className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50/80 border border-blue-200 shadow-sm'
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-sm">
                      {member.name.charAt(0)}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-semibold text-slate-800 truncate">{member.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{member.updatedAt}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {member.battery !== undefined && (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-slate-600">
                        {member.isCharging ? (
                          <BatteryCharging className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Battery className="h-3.5 w-3.5 text-slate-500" />
                        )}
                        {member.battery}%
                      </span>
                    )}
                    <button
                      title="Focus on map"
                      className="p-1 text-slate-400 hover:text-blue-600"
                    >
                      <Navigation className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

