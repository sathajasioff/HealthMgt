import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Stethoscope, CheckCircle2, XCircle, Download, Building2, FileText } from 'lucide-react';
import API from '../services/api';
import { useNotification } from '../context/NotificationContext';

const OrdersPanel = ({ selectedPharmacyId }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useNotification();

  useEffect(() => {
    const load = async () => {
      if (!selectedPharmacyId) return setOrders([]);
      setLoading(true);
      try {
        const res = await API.get(`/payments/pharmacy/${selectedPharmacyId}`);
        const list = Array.isArray(res.data) ? res.data : [];
        // Group by billNumber (fallback prescriptionId) and pick the latest status
        const byGroup = new Map();
        for (const p of list) {
          const key = p.billNumber || p.prescriptionId || p.id;
          const ts = new Date(p.paidAt || p.createdAt || 0).getTime();
          const prev = byGroup.get(key);
          if (!prev || ts > new Date(prev.paidAt || prev.createdAt || 0).getTime()) {
            byGroup.set(key, p);
          }
        }
        const unique = Array.from(byGroup.values())
          .sort((a, b) => new Date(b.createdAt || b.paidAt || 0) - new Date(a.createdAt || a.paidAt || 0));
        setOrders(unique);
      } catch (e) {
        setOrders([]);
        showToast('Failed to load orders', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedPharmacyId, showToast]);

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="text-gray-600" size={18} />
          <h2 className="text-lg font-semibold text-gray-800">Recent Orders</h2>
        </div>
        {loading && <span className="text-sm text-gray-500">Loading...</span>}
      </div>
      {orders.length === 0 ? (
        <div className="text-center py-8 text-gray-500 text-sm">No orders</div>
      ) : (
        <div className="space-y-3 max-h-[520px] overflow-y-auto">
          {orders.map((o) => (
            <div key={o.id} className="border rounded-lg p-3">
              <div className="flex items-center justify-between text-sm">
                <div className="font-semibold text-gray-800">{o.billNumber || o.id}</div>
                <div className={`text-xs px-2 py-0.5 rounded-full ${o.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>{o.status}</div>
              </div>
              <div className="mt-1 text-xs text-gray-600">
                <div>Amount: Rs.{(o.grandTotal || 0).toFixed(2)}</div>
                <div>Created: {o.createdAt ? new Date(o.createdAt).toLocaleString() : '-'}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const PharmacyDashboard = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState(true);
  const [loading, setLoading] = useState(false);
  const [pharmacies, setPharmacies] = useState([]);
  const [selectedPharmacyId, setSelectedPharmacyId] = useState('');
  const [prescriptions, setPrescriptions] = useState([]);
  const [products, setProducts] = useState([]);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteRx, setQuoteRx] = useState(null);
  const [quoteItems, setQuoteItems] = useState([]); // {productId, quantity, unitPrice}
  const { showToast } = useNotification();
  const [manageProducts, setManageProducts] = useState([]);
  const [productForm, setProductForm] = useState({
    name: '',
    dosageForm: '',
    strength: '',
    price: '',
    stockQty: '',
    active: true,
  });
  const [savingProduct, setSavingProduct] = useState(false);
  const [productImage, setProductImage] = useState(null);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const loadOwnedPharmacies = async () => {
      try {
        const uid = user?.id || user?._id;
        if (!uid) return;
        const res = await API.get(`/pharmacies/user/${uid}`);
        const list = Array.isArray(res.data) ? res.data : [];
        setPharmacies(list);
        if (list.length > 0) setSelectedPharmacyId(list[0].id || list[0]._id);
      } catch (e) {
        showToast('Failed to load your pharmacies', 'error');
      }
    };
    loadOwnedPharmacies();
  }, [showToast, user]);

  const loadPrescriptions = async (pharmacyId) => {
    if (!pharmacyId) return setPrescriptions([]);
    setLoading(true);
    try {
      const res = await API.get(`/prescriptions/pharmacy/${pharmacyId}`);
      const list = Array.isArray(res.data) ? res.data : [];
      setPrescriptions(list);
    } catch (e) {
      showToast('Failed to load prescriptions', 'error');
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrescriptions(selectedPharmacyId);
  }, [selectedPharmacyId]);

  // Auto-refresh prescriptions periodically and on tab focus
  useEffect(() => {
    if (!selectedPharmacyId) return;
    const id = setInterval(() => loadPrescriptions(selectedPharmacyId), 15000);
    const onFocus = () => {
      if (document.visibilityState === 'visible') loadPrescriptions(selectedPharmacyId);
    };
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [selectedPharmacyId]);

  // Load active products for selected pharmacy
  useEffect(() => {
    const loadProducts = async () => {
      if (!selectedPharmacyId) return setProducts([]);
      try {
        const res = await API.get(`/products/pharmacy/${selectedPharmacyId}/active`);
        setProducts(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        setProducts([]);
      }
    };
    loadProducts();
  }, [selectedPharmacyId]);

  // Load all products (for management) for selected pharmacy
  useEffect(() => {
    const loadAll = async () => {
      if (!selectedPharmacyId) return setManageProducts([]);
      try {
        const res = await API.get(`/products/pharmacy/${selectedPharmacyId}`);
        setManageProducts(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        setManageProducts([]);
      }
    };
    loadAll();
  }, [selectedPharmacyId]);

  const updateStatus = async (p, status) => {
    try {
      await API.post(`/prescriptions/${p.id || p._id}/status`, { status });
      setPrescriptions((prev) =>
        prev.map((x) => (x.id === p.id || x._id === p._id ? { ...x, status } : x))
      );
      showToast(`Marked as ${status}`, 'success');
    } catch (e) {
      showToast('Failed to update status', 'error');
    }
  };

  const download = (p) => {
    const url =
      API.defaults.baseURL.replace(/\/$/, '') +
      `/prescriptions/${p.id || p._id}/file`;
    window.open(url, '_blank');
  };

  const openQuote = (p) => {
    if (!products || products.length === 0) {
      showToast('No active products found. Add products to create a quote.', 'error');
      return;
    }
    setQuoteRx(p);
    setQuoteItems([]);
    setShowQuoteModal(true);
  };

  const addQuoteRow = () => {
    const first = products[0];
    setQuoteItems((prev) => [
      ...prev,
      {
        productId: first?.id || first?._id || '',
        quantity: 1,
        unitPrice: first?.price ?? 0,
      },
    ]);
  };

  const updateQuoteRow = (idx, patch) => {
    setQuoteItems((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, ...patch } : row))
    );
  };

  const removeQuoteRow = (idx) => {
    setQuoteItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const reloadProducts = async (pid) => {
    const pharmacyId = pid || selectedPharmacyId;
    if (!pharmacyId) return;
    try {
      const [allRes, activeRes] = await Promise.all([
        API.get(`/products/pharmacy/${pharmacyId}`),
        API.get(`/products/pharmacy/${pharmacyId}/active`),
      ]);
      setManageProducts(Array.isArray(allRes.data) ? allRes.data : []);
      setProducts(Array.isArray(activeRes.data) ? activeRes.data : []);
    } catch (_) {}
  };

  const updateProduct = async (id, patch) => {
    try {
      await API.put(`/products/${id}`, patch);
      await reloadProducts(selectedPharmacyId);
      showToast('Product updated', 'success');
    } catch (e) {
      showToast('Failed to update product', 'error');
    }
  };

  const toggleProductActive = async (p) => {
    await updateProduct(p.id || p._id, { active: !p.active });
  };

  const deleteProduct = async (id) => {
    try {
      await API.delete(`/products/${id}`);
      await reloadProducts(selectedPharmacyId);
      showToast('Product deleted', 'success');
    } catch (e) {
      showToast('Failed to delete product', 'error');
    }
  };

  const uploadProductImage = async (id, file) => {
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    try {
      await API.put(`/products/${id}/image`, fd);
      await reloadProducts(selectedPharmacyId);
      showToast('Image uploaded', 'success');
    } catch (e) {
      showToast('Failed to upload image', 'error');
    }
  };

  const saveProduct = async (e) => {
    e?.preventDefault?.();
    if (!selectedPharmacyId) {
      showToast('Select a pharmacy first', 'error');
      return;
    }
    const payload = {
      name: productForm.name?.trim(),
      dosageForm: productForm.dosageForm?.trim() || undefined,
      strength: productForm.strength?.trim() || undefined,
      price: Number(productForm.price) || 0,
      stockQty: Number(productForm.stockQty) || 0,
      active: !!productForm.active,
    };
    if (!payload.name) {
      showToast('Product name is required', 'error');
      return;
    }
    try {
      setSavingProduct(true);
      const res = await API.post(`/products/pharmacy/${selectedPharmacyId}`, payload);
      const created = res?.data;
      // upload image if selected
      if (created && productImage) {
        await uploadProductImage(created.id || created._id, productImage);
      }
      setProductForm({ name: '', dosageForm: '', strength: '', price: '', stockQty: '', active: true });
      setProductImage(null);
      await reloadProducts(selectedPharmacyId);
      showToast('Product added', 'success');
    } catch (e) {
      showToast('Failed to add product', 'error');
    } finally {
      setSavingProduct(false);
    }
  };

  const submitQuote = async () => {
    if (!quoteRx) return;
    try {
      const items = quoteItems
        .filter((r) => r.productId && (r.quantity || 0) > 0)
        .map((r) => {
          const prod =
            products.find((pr) => (pr.id || pr._id) === r.productId) || {};
          const unit =
            r.unitPrice != null ? Number(r.unitPrice) : prod.price || 0;
          return {
            productId: r.productId,
            medicineName: prod.name,
            dosage: [prod.strength, prod.dosageForm].filter(Boolean).join(' '),
            quantity: Number(r.quantity) || 1,
            unitPrice: unit,
          };
        });
      if (!products || products.length === 0) {
        showToast('No active products available. Please add products first.', 'error');
        return;
      }
      if (items.length === 0) {
        showToast('Add at least one product', 'error');
        return;
      }
      await API.post(`/prescriptions/${quoteRx.id || quoteRx._id}/quote`, {
        items,
      });
      setShowQuoteModal(false);
      setQuoteRx(null);
      setQuoteItems([]);
      showToast('Quote sent to patient', 'success');
      loadPrescriptions(selectedPharmacyId);
    } catch (e) {
      showToast('Failed to send quote', 'error');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar token={token} setToken={setToken} />
      <div className="flex-1 ml-64 px-8 pb-8">
        <Header token={token} setToken={setToken} />
        <div className="py-8 space-y-6">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-xl">
                  <Stethoscope className="text-primary" size={28} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Pharmacy Dashboard</h1>
                  <p className="text-gray-600 text-sm">Manage prescriptions, quotes and orders</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="text-gray-500" size={18} />
                <select
                  value={selectedPharmacyId}
                  onChange={(e) => setSelectedPharmacyId(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  {pharmacies.map((p) => (
                    <option key={p.id || p._id} value={p.id || p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="text-blue-600" size={20} />
                    <h2 className="text-lg font-semibold text-gray-800">Incoming Prescriptions</h2>
                  </div>
                  <div className="flex items-center gap-3">
                    {loading && <span className="text-sm text-gray-500">Loading...</span>}
                    <button onClick={() => loadPrescriptions(selectedPharmacyId)} className="text-sm px-3 py-1 border rounded">Refresh</button>
                  </div>
                </div>

                {prescriptions.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 text-sm">No prescriptions</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-500 border-b">
                          <th className="py-2 pr-4">Patient</th>
                          <th className="py-2 pr-4">File</th>
                          <th className="py-2 pr-4">Status</th>
                          <th className="py-2 pr-4">Submitted</th>
                          <th className="py-2 pr-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {prescriptions.map((p) => (
                          <tr key={p.id || p._id} className="border-b">
                            <td className="py-2 pr-4">
                              <div className="font-medium text-gray-800">{p.patientName || p.patientId}</div>
                              <div className="text-xs text-gray-500">{p.notes}</div>
                            </td>
                            <td className="py-2 pr-4">
                              <button onClick={() => download(p)} className="inline-flex items-center gap-1 text-blue-600 hover:underline">
                                <Download size={16} />
                                <span>Download</span>
                              </button>
                            </td>
                            <td className="py-2 pr-4">
                              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">{p.status}</span>
                            </td>
                            <td className="py-2 pr-4">
                              {p.submittedDate ? new Date(p.submittedDate).toLocaleString() : '-'}
                            </td>
                            <td className="py-2 pr-4">
                              <div className="flex flex-wrap items-center gap-2">
                                {p.status === 'Pending' && (
                                  <>
                                    <button
                                      onClick={() => updateStatus(p, 'Approved')}
                                      className="inline-flex items-center gap-1 bg-emerald-500 text-white text-xs px-3 py-1 rounded"
                                    >
                                      <CheckCircle2 size={14} /> Approve
                                    </button>
                                    <button
                                      onClick={() => updateStatus(p, 'Rejected')}
                                      className="inline-flex items-center gap-1 bg-red-500 text-white text-xs px-3 py-1 rounded"
                                    >
                                      <XCircle size={14} /> Reject
                                    </button>
                                    <button
                                      onClick={() => navigate('/order', { state: { quoteContext: { prescriptionId: p.id || p._id, pharmacyId: p.pharmacyId, patientId: p.patientId } } })}
                                      className="inline-flex items-center gap-1 bg-gray-700 text-white text-xs px-3 py-1 rounded"
                                    >
                                      Select Products
                                    </button>
                                    <button
                                      onClick={() => openQuote(p)}
                                      className="inline-flex items-center gap-1 bg-blue-600 text-white text-xs px-3 py-1 rounded"
                                    >
                                      Create Quote
                                    </button>
                                  </>
                                )}
                              </div>
                              {p.status === 'Quoted' && (
                                <div className="mt-2 text-xs text-gray-600">Grand Total: Rs.{(p.grandTotal ?? p.totalPrice ?? 0).toFixed(2)}</div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Manage Products */}
              <div className="bg-white rounded-2xl shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="text-emerald-600" size={20} />
                    <h2 className="text-lg font-semibold text-gray-800">Manage Products</h2>
                  </div>
                </div>

                <form onSubmit={saveProduct} className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-4">
                  <input
                    type="text"
                    placeholder="Name"
                    value={productForm.name}
                    onChange={(e) => setProductForm((p) => ({ ...p, name: e.target.value }))}
                    className="md:col-span-2 border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Dosage Form (e.g., Tablet)"
                    value={productForm.dosageForm}
                    onChange={(e) => setProductForm((p) => ({ ...p, dosageForm: e.target.value }))}
                    className="md:col-span-1 border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Strength (e.g., 500mg)"
                    value={productForm.strength}
                    onChange={(e) => setProductForm((p) => ({ ...p, strength: e.target.value }))}
                    className="md:col-span-1 border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="Price"
                    value={productForm.price}
                    onChange={(e) => setProductForm((p) => ({ ...p, price: e.target.value }))}
                    className="md:col-span-1 border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    min={0}
                    placeholder="Stock Qty"
                    value={productForm.stockQty}
                    onChange={(e) => setProductForm((p) => ({ ...p, stockQty: e.target.value }))}
                    className="md:col-span-1 border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                  <div className="md:col-span-2 flex items-center gap-3">
                    <label className="text-sm text-gray-700">Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setProductImage(e.target.files?.[0] || null)}
                      className="text-xs"
                    />
                    {productImage && (
                      <span className="text-xs text-gray-500 truncate max-w-[140px]">{productImage.name}</span>
                    )}
                  </div>
                  <div className="md:col-span-5 flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={productForm.active}
                        onChange={(e) => setProductForm((p) => ({ ...p, active: e.target.checked }))}
                      />
                      Active
                    </label>
                  </div>
                  <div className="md:col-span-1 flex justify-end">
                    <button
                      type="submit"
                      disabled={savingProduct || !productForm.name}
                      className="w-full bg-emerald-600 text-white text-sm px-3 py-2 rounded disabled:opacity-50"
                    >
                      {savingProduct ? 'Saving...' : 'Add'}
                    </button>
                  </div>
                </form>

                {manageProducts.length === 0 ? (
                  <div className="text-center py-6 text-gray-500 text-sm">No products yet</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-500 border-b">
                          <th className="py-2 pr-4">Image</th>
                          <th className="py-2 pr-4">Name</th>
                          <th className="py-2 pr-4">Dosage</th>
                          <th className="py-2 pr-4">Strength</th>
                          <th className="py-2 pr-4">Price</th>
                          <th className="py-2 pr-4">Stock</th>
                          <th className="py-2 pr-4">Active</th>
                          <th className="py-2 pr-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {manageProducts.map((p) => {
                          const id = p.id || p._id;
                          const inputId = `upload-${id}`;
                          const imgUrl = `${API.defaults.baseURL.replace(/\/$/, '')}/products/${id}/image?ts=${Date.now()}`;
                          return (
                            <tr key={id} className="border-b align-middle">
                              <td className="py-2 pr-4">
                                <div className="flex items-center gap-2">
                                  <img src={imgUrl} alt="" className="w-10 h-10 object-cover rounded border" onError={(e)=>{e.currentTarget.style.visibility='hidden';}} />
                                  <label htmlFor={inputId} className="text-xs text-blue-600 cursor-pointer">
                                    <input id={inputId} type="file" accept="image/*" className="hidden" onChange={(e)=> uploadProductImage(id, e.target.files?.[0])} />
                                    Upload
                                  </label>
                                </div>
                              </td>
                              <td className="py-2 pr-4 text-gray-800">{p.name}</td>
                              <td className="py-2 pr-4 text-gray-600">{p.dosageForm || '-'}</td>
                              <td className="py-2 pr-4 text-gray-600">{p.strength || '-'}</td>
                              <td className="py-2 pr-4">
                                <input
                                  type="number"
                                  min={0}
                                  step="0.01"
                                  defaultValue={p.price || 0}
                                  onBlur={(e)=> updateProduct(id, { price: Number(e.target.value)||0 })}
                                  className="w-28 border border-gray-300 rounded px-2 py-1"
                                />
                              </td>
                              <td className="py-2 pr-4">
                                <input
                                  type="number"
                                  min={0}
                                  defaultValue={p.stockQty ?? 0}
                                  onBlur={(e)=> updateProduct(id, { stockQty: Number(e.target.value)||0 })}
                                  className="w-24 border border-gray-300 rounded px-2 py-1"
                                />
                              </td>
                              <td className="py-2 pr-4">
                                <button
                                  onClick={()=> toggleProductActive(p)}
                                  className={`text-xs px-2 py-1 rounded ${p.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}
                                >
                                  {p.active ? 'Active' : 'Inactive'}
                                </button>
                              </td>
                              <td className="py-2 pr-4">
                                <button onClick={() => deleteProduct(id)} className="text-red-600 text-xs">Delete</button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <OrdersPanel selectedPharmacyId={selectedPharmacyId} />
          </div>
        </div>

        {showQuoteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText size={22} className="text-blue-600" />
                  <div>
                    <div className="text-lg font-semibold text-gray-800">Create Quote</div>
                    <div className="text-xs text-gray-500">{quoteRx?.patientName || quoteRx?.patientId}</div>
                  </div>
                </div>
                <button onClick={() => { setShowQuoteModal(false); setQuoteRx(null); setQuoteItems([]); }} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500">
                        <th className="py-2 pr-3">Product</th>
                        <th className="py-2 pr-3">Qty</th>
                        <th className="py-2 pr-3">Unit Price</th>
                        <th className="py-2 pr-3">Line Total</th>
                        <th className="py-2 pr-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {quoteItems.map((row, idx) => {
                        const prod = products.find((pr) => (pr.id || pr._id) === row.productId) || {};
                        const qty = Number(row.quantity) || 0;
                        const unit = row.unitPrice != null ? Number(row.unitPrice) : (prod.price || 0);
                        const total = qty * unit;
                        return (
                          <tr key={idx} className="border-t">
                            <td className="py-2 pr-3">
                              <select
                                value={row.productId}
                                onChange={(e) => updateQuoteRow(idx, { productId: e.target.value })}
                                className="border border-gray-300 rounded px-2 py-1"
                              >
                                {products.map((pr) => (
                                  <option key={pr.id || pr._id} value={pr.id || pr._id}>{pr.name}</option>
                                ))}
                              </select>
                            </td>
                            <td className="py-2 pr-3">
                              <input
                                type="number"
                                min={1}
                                value={row.quantity}
                                onChange={(e) => updateQuoteRow(idx, { quantity: Number(e.target.value) })}
                                className="w-20 border border-gray-300 rounded px-2 py-1"
                              />
                            </td>
                            <td className="py-2 pr-3">
                              <input
                                type="number"
                                min={0}
                                step="0.01"
                                value={row.unitPrice}
                                onChange={(e) => updateQuoteRow(idx, { unitPrice: Number(e.target.value) })}
                                className="w-28 border border-gray-300 rounded px-2 py-1"
                              />
                            </td>
                            <td className="py-2 pr-3">Rs.{total.toFixed(2)}</td>
                            <td className="py-2 pr-3">
                              <button onClick={() => removeQuoteRow(idx)} className="text-red-600 text-xs">Remove</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <button onClick={addQuoteRow} className="px-4 py-2 bg-gray-100 rounded">Add Item</button>
                  <div className="flex gap-2">
                    <button onClick={() => { setShowQuoteModal(false); setQuoteRx(null); setQuoteItems([]); }} className="px-4 py-2 border rounded">Cancel</button>
                    <button onClick={submitQuote} className="px-4 py-2 bg-blue-600 text-white rounded">Send Quote</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PharmacyDashboard;