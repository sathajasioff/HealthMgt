import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';

function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const Track = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useMemo(() => { try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; } }, []);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let timer = null;
    const load = async () => {
      try {
        const res = await API.get(`/ambulance/dispatches/${id}`);
        setData(res.data || null);
        setError('');
      } catch (e) {
        setError(e?.response?.statusText || e?.message || 'Failed to load dispatch');
      }
    };
    load();
    timer = setInterval(load, 5000);
    return () => { if (timer) clearInterval(timer); };
  }, [id]);

  const etaText = () => {
    if (!data?.latitude || !data?.longitude) return '—';
    if (!data?.speedKph || data.speedKph <= 0) return '—';
    // Without destination coords we can't compute ETA precisely; show speed + last update age
    const last = data?.lastUpdated ? new Date(data.lastUpdated) : null;
    const ageSec = last ? Math.round((Date.now() - last.getTime()) / 1000) : null;
    return `${Math.round(data.speedKph)} km/h${ageSec!=null ? ` • updated ${ageSec}s ago` : ''}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Track Ambulance</h1>
          <button onClick={() => navigate(-1)} className="px-3 py-2 border rounded bg-white">Back</button>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-gray-500 mb-2">Tracking ID</div>
          <div className="font-mono text-sm mb-4">{id}</div>
          {error && (
            <div className="mb-3 p-2 bg-rose-50 border border-rose-200 rounded text-sm text-rose-700">{error}</div>
          )}
          {!data && !error && (
            <div className="text-sm text-gray-600">Loading...</div>
          )}
          {data && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-gray-500">Status</div>
                  <div className="font-medium">{data.status || '—'}</div>
                </div>
                <div>
                  <div className="text-gray-500">Last Updated</div>
                  <div className="font-medium">{data.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : '—'}</div>
                </div>
                <div>
                  <div className="text-gray-500">Pickup</div>
                  <div className="font-medium">{data.pickupLocation || '—'}</div>
                </div>
                <div>
                  <div className="text-gray-500">Destination</div>
                  <div className="font-medium">{data.dropoffLocation || '—'}</div>
                </div>
              </div>
              <div className="p-3 rounded border bg-gray-50 text-sm">
                <div className="text-gray-500 mb-1">Ambulance position</div>
                <div>Lat: <span className="font-mono">{data.latitude ?? '—'}</span></div>
                <div>Lng: <span className="font-mono">{data.longitude ?? '—'}</span></div>
                <div>Speed: {data.speedKph ? `${Math.round(data.speedKph)} km/h` : '—'} • Heading: {data.headingDeg ?? '—'}°</div>
                <div>ETA: {etaText()}</div>
              </div>
              <div className="text-xs text-gray-500">Note: This is a lightweight tracker. A map view (Leaflet) can be added later.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Track;
