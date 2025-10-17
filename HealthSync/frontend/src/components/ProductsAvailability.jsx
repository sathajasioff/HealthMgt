import React, { useEffect, useState } from 'react';
import { Package, TrendingUp, AlertCircle, CheckCircle, Search, Filter, ChevronRight } from 'lucide-react';
import API from '../services/api';

const ProductsAvailability = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, in-stock, low-stock, out-of-stock
  const [items, setItems] = useState([]);

  // Load active products from backend
  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get('/products/active');
        const base = API.defaults.baseURL.replace(/\/$/, '');
        const mapped = (Array.isArray(res.data) ? res.data : []).map(p => ({
          id: p.id || p._id,
          name: p.name,
          price: p.price || 0,
          stock: p.stockQty ?? 0,
          category: p.category || 'General',
          image: `${base}/products/${p.id || p._id}/image?ts=${Date.now()}`,
        }));
        setItems(mapped);
      } catch (_) {
        setItems([]);
      }
    };
    load();
  }, []);

  // Calculate stock statistics
  const getStockStats = () => {
    const inStock = items.filter(p => (p.stock || 0) > 20).length;
    const lowStock = items.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 20).length;
    const outOfStock = items.filter(p => (p.stock || 0) === 0).length;
    const totalValue = items.reduce((sum, p) => sum + ((p.price || 0) * (p.stock || 0)), 0);

    return { inStock, lowStock, outOfStock, totalValue, total: items.length };
  };

  const stats = getStockStats();

  // Filter products based on search and status
  const getFilteredProducts = () => {
    let filtered = items;

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(product =>
        (product.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.category || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus === 'in-stock') {
      filtered = filtered.filter(p => (p.stock || 0) > 20);
    } else if (filterStatus === 'low-stock') {
      filtered = filtered.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 20);
    } else if (filterStatus === 'out-of-stock') {
      filtered = filtered.filter(p => (p.stock || 0) === 0);
    }

    return filtered.slice(0, 10); // Show top 10
  };

  const filteredProducts = getFilteredProducts();

  // Get stock status
  const getStockStatus = (stock = 100) => {
    if (stock === 0) return { label: 'Out of Stock', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
    if (stock <= 20) return { label: 'Low Stock', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
    return { label: 'In Stock', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-emerald-600 px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Package size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Products Availability</h2>
              <p className="text-emerald-50 text-sm">Real-time inventory tracking</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-50 text-sm">Total Products:</span>
            <span className="text-white font-bold text-2xl">{stats.total}</span>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-gray-50 border-b border-gray-200">
        {/* In Stock */}
        <div className="bg-white rounded-xl p-4 border-2 border-green-200 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <span className="text-2xl font-bold text-green-600">{stats.inStock}</span>
          </div>
          <p className="text-sm font-semibold text-gray-700">In Stock</p>
          <p className="text-xs text-gray-500 mt-1">Available items</p>
        </div>

        {/* Low Stock */}
        <div className="bg-white rounded-xl p-4 border-2 border-orange-200 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertCircle size={20} className="text-orange-600" />
            </div>
            <span className="text-2xl font-bold text-orange-600">{stats.lowStock}</span>
          </div>
          <p className="text-sm font-semibold text-gray-700">Low Stock</p>
          <p className="text-xs text-gray-500 mt-1">Need reorder</p>
        </div>

        {/* Out of Stock */}
        <div className="bg-white rounded-xl p-4 border-2 border-red-200 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Package size={20} className="text-red-600" />
            </div>
            <span className="text-2xl font-bold text-red-600">{stats.outOfStock}</span>
          </div>
          <p className="text-sm font-semibold text-gray-700">Out of Stock</p>
          <p className="text-xs text-gray-500 mt-1">Unavailable</p>
        </div>

        {/* Total Value */}
        <div className="bg-white rounded-xl p-4 border-2 border-blue-200 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp size={20} className="text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-blue-600">Rs.{(stats.totalValue / 1000).toFixed(1)}K</span>
          </div>
          <p className="text-sm font-semibold text-gray-700">Total Value</p>
          <p className="text-xs text-gray-500 mt-1">Inventory worth</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search products by name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                filterStatus === 'all'
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('in-stock')}
              className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                filterStatus === 'in-stock'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              In Stock
            </button>
            <button
              onClick={() => setFilterStatus('low-stock')}
              className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                filterStatus === 'low-stock'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Low Stock
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Value
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => {
                const stock = product.stock || 100;
                const status = getStockStatus(stock);
                const value = (product.price || 0) * stock;

                return (
                  <tr
                    key={product.id || index}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    {/* Product */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                        />
                        <div>
                          <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500">ID: #{product.id || index + 1}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                        {product.category || 'General'}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-900">
                        Rs.{(product.price || 0).toFixed(2)}
                      </p>
                    </td>

                    {/* Stock */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[80px]">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              stock > 50 ? 'bg-green-500' : stock > 20 ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min((stock / 100) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-700">{stock}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${status.bg} ${status.color} ${status.border}`}
                      >
                        {status.label}
                      </span>
                    </td>

                    {/* Value */}
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-primary">Rs.{value.toFixed(2)}</p>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <Package size={48} className="text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">No products found</p>
                    <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {filteredProducts.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Showing <span className="font-semibold">{filteredProducts.length}</span> of{' '}
            <span className="font-semibold">{items.length}</span> products
          </span>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-emerald-600 text-white font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg">
            <span>View All Products</span>
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductsAvailability;
