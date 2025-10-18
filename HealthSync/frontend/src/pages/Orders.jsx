import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import API from '../services/api';
import { Receipt, CheckCircle2, Clock, XCircle } from 'lucide-react';

const StatusPill = ({ status }) => {
  const s = (status || '').toUpperCase();
  const cls = s === 'PAID'
    ? 'bg-emerald-100 text-emerald-700'
    : s === 'FAILED' || s === 'CANCELLED'
    ? 'bg-red-100 text-red-700'
    : 'bg-yellow-100 text-yellow-700';
  const Icon = s === 'PAID' ? CheckCircle2 : s === 'FAILED' || s === 'CANCELLED' ? XCircle : Clock;
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${cls}`}>
      <Icon size={14} /> {status}
    </span>
  );
};

const Orders = () => {
  const [token, setToken] = useState(true);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [showPaidOnly, setShowPaidOnly] = useState(false);

  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  }, []);
  const patientId = user?.id || user?._id;

  useEffect(() => {
    const load = async () => {
      if (!patientId) { setOrders([]); return; }
      setLoading(true);
      try {
        const res = await API.get(`/payments/patient/${patientId}`);
        const list = Array.isArray(res.data) ? res.data : [];
        // de-duplicate by id (and keep most recent first)
        const unique = [];
        const seen = new Set();
        for (const o of list) {
          const id = o.id || o._id;
          if (id && !seen.has(id)) { seen.add(id); unique.push(o); }
        }
        setOrders(unique);
      } catch (_) {
        setOrders([]);
      } finally { setLoading(false); }
    };
    load();
  }, [patientId]);

  const filtered = useMemo(() => {
    const arr = Array.isArray(orders) ? orders : [];
    return showPaidOnly ? arr.filter(o => (o.status || '').toUpperCase() === 'PAID') : arr;
  }, [orders, showPaidOnly]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar token={token} setToken={setToken} />
      <div className="flex-1 ml-64 px-8 pb-8">
        <Header token={token} setToken={setToken} />

        <div className="py-8 space-y-6">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-xl">
                <Receipt className="text-primary" size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
                <p className="text-gray-600 text-sm">View your prescription orders and payment status</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Recent Orders</h2>
              <div className="flex items-center gap-4">
                <label className="text-sm text-gray-700 inline-flex items-center gap-2">
                  <input type="checkbox" checked={showPaidOnly} onChange={(e) => setShowPaidOnly(e.target.checked)} />
                  Show only Paid
                </label>
                {loading && <span className="text-sm text-gray-500">Loading...</span>}
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-sm">No orders found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="py-2 pr-4">Order</th>
                      <th className="py-2 pr-4">Amount</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2 pr-4">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(o => (
                      <tr key={o.id} className="border-b">
                        <td className="py-2 pr-4">
                          <div className="font-medium text-gray-800">{o.billNumber || o.id}</div>
                          <div className="text-xs text-gray-500">Prescription: {o.prescriptionId}</div>
                        </td>
                        <td className="py-2 pr-4">Rs.{(o.grandTotal || 0).toFixed(2)}</td>
                        <td className="py-2 pr-4"><StatusPill status={o.status} /></td>
                        <td className="py-2 pr-4">{o.createdAt ? new Date(o.createdAt).toLocaleString() : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;
