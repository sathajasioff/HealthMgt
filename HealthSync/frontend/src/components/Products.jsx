import React, { useState, useRef, useEffect } from 'react';
import { products, assets } from '../assets/assets';
import { Search, X, Filter, SlidersHorizontal, Sparkles, ShoppingCart, Download, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Products = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('PRODUCTS');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [notification, setNotification] = useState(null);
  const searchInputRef = useRef(null);
  const filterRef = useRef(null);

  // Filter states
  const [filters, setFilters] = useState({
    priceRange: { min: 0, max: 50000 },
    categories: [],
    hasDiscount: false,
    inStock: true,
    sortBy: 'default'
  });

  const tabs = ['MEDICINES', 'PRODUCTS', 'BEST RATED'];

  // Load recent searches from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter handlers
  const handlePriceChange = (type, value) => {
    setFilters(prev => ({
      ...prev,
      priceRange: { ...prev.priceRange, [type]: Number(value) }
    }));
  };

  const handleCategoryToggle = (category) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      priceRange: { min: 0, max: 50000 },
      categories: [],
      hasDiscount: false,
      inStock: true,
      sortBy: 'default'
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.categories.length > 0) count++;
    if (filters.hasDiscount) count++;
    if (filters.priceRange.min > 0 || filters.priceRange.max < 50000) count++;
    if (filters.sortBy !== 'default') count++;
    return count;
  };

  // Cart functions
  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
      // Update quantity if item already exists
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
      showNotification(`Updated ${product.name} quantity in cart`);
    } else {
      // Add new item to cart
      setCart([...cart, { ...product, quantity: 1 }]);
      showNotification(`${product.name} added to cart`);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
    showNotification('Item removed from cart');
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price || 0) * item.quantity, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  // Generate and download invoice
  const downloadInvoice = async () => {
    const invoiceDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const invoiceNumber = `INV-${Date.now().toString().slice(-8)}`;

    // Convert logo to base64
    let logoBase64 = '';
    try {
      const response = await fetch(assets.Logo);
      const blob = await response.blob();
      logoBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error loading logo:', error);
    }

    // Create invoice HTML
    let invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice - ${invoiceNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Arial', sans-serif; padding: 40px; background: #f5f5f5; }
          .invoice-container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
          .header { border-bottom: 3px solid #10b981; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { color: #10b981; font-size: 32px; margin-bottom: 5px; }
          .header p { color: #666; font-size: 14px; }
          .info-section { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .info-box h3 { color: #333; font-size: 14px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px; }
          .info-box p { color: #666; font-size: 14px; line-height: 1.6; }
          .invoice-details { background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 30px; }
          .invoice-details p { color: #666; font-size: 14px; margin-bottom: 5px; }
          .invoice-details strong { color: #333; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          thead { background: #10b981; color: white; }
          th { padding: 12px; text-align: left; font-size: 14px; font-weight: 600; }
          td { padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #666; }
          tbody tr:hover { background: #f9fafb; }
          .text-right { text-align: right; }
          .totals { margin-left: auto; width: 300px; }
          .totals-row { display: flex; justify-content: space-between; padding: 10px 0; font-size: 14px; }
          .totals-row.subtotal { border-top: 1px solid #e5e7eb; }
          .totals-row.total { border-top: 2px solid #333; font-size: 18px; font-weight: bold; color: #10b981; padding-top: 15px; margin-top: 10px; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #999; font-size: 12px; }
          .badge { background: #10b981; color: white; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <img src="${logoBase64}" alt="HealthSync Logo" style="width: 140px; height: auto; margin-bottom: 10px;" />
            <p>Your Trusted Healthcare Partner</p>
          </div>
          
          <div class="info-section">
            <div class="info-box">
              <h3>Bill To:</h3>
              <p><strong>Customer</strong><br>
              Email: customer@healthsync.com<br>
              Phone: +92 XXX XXXXXXX</p>
            </div>
            <div class="info-box" style="text-align: right;">
              <h3>Invoice Details:</h3>
              <p><strong>Invoice #:</strong> ${invoiceNumber}<br>
              <strong>Date:</strong> ${invoiceDate}<br>
              <strong>Status:</strong> <span class="badge">PENDING</span></p>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th class="text-right">Quantity</th>
                <th class="text-right">Price</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
    `;

    // Add cart items
    cart.forEach(item => {
      const itemTotal = (item.price * item.quantity).toFixed(2);
      invoiceHTML += `
              <tr>
                <td><strong>${item.name}</strong></td>
                <td class="text-right">${item.quantity}</td>
                <td class="text-right">Rs.${item.price.toFixed(2)}</td>
                <td class="text-right">Rs.${itemTotal}</td>
              </tr>
      `;
    });

    const subtotal = getTotalPrice().toFixed(2);
    const total = getTotalPrice().toFixed(2);

    invoiceHTML += `
            </tbody>
          </table>
          
          <div class="totals">
            <div class="totals-row subtotal">
              <span>Subtotal:</span>
              <span>Rs.${total}</span>
            </div>
            <div class="totals-row">
              <span>Delivery Fee:</span>
              <span style="color: #10b981; font-weight: 600;">FREE</span>
            </div>
            <div class="totals-row total">
              <span>Total Amount:</span>
              <span>Rs.${total}</span>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>Thank you for your purchase!</strong></p>
            <p>For any queries, contact us at support@healthsync.com | +92 XXX XXXXXXX</p>
            <p style="margin-top: 10px;">This is a computer-generated invoice and does not require a signature.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Create a blob and download
    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HealthSync_Invoice_${invoiceNumber}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    showNotification('Invoice downloaded successfully!');
  };

  // Save recent searches to localStorage
  const saveToRecentSearches = (query) => {
    if (!query.trim()) return;

    const updated = [query, ...recentSearches.filter(item => item !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSuggestions(value.length > 0);
  };

  const handleSearchSubmit = (query = searchQuery) => {
    if (query.trim()) {
      saveToRecentSearches(query.trim());
      setShowSuggestions(false);
      searchInputRef.current?.blur();
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setShowSuggestions(false);
    searchInputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    handleSearchSubmit(suggestion);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      searchInputRef.current?.blur();
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  // Generate search suggestions based on products
  const getSearchSuggestions = () => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    return products
      .filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query)
      )
      .slice(0, 5)
      .map(product => product.name);
  };

  // Remove duplicates from suggestions
  const uniqueSuggestions = [...new Set(getSearchSuggestions())];
  const hasSuggestions = uniqueSuggestions.length > 0;
  const hasRecentSearches = recentSearches.length > 0;

  // Filter products based on search query, active tab, and filters
  const getFilteredProducts = () => {
    let filtered = products;

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Tab filter
    if (activeTab === 'MEDICINES') {
      filtered = filtered.filter(product => product.category === 'medicine');
    } else if (activeTab === 'BEST RATED') {
      filtered = filtered.filter(product => product.rating >= 4);
    }

    // Price range filter
    filtered = filtered.filter(product => {
      const price = product.price || 0;
      return price >= filters.priceRange.min && price <= filters.priceRange.max;
    });

    // Category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(product =>
        filters.categories.includes(product.category)
      );
    }

    // Discount filter
    if (filters.hasDiscount) {
      filtered = filtered.filter(product => product.discount !== null);
    }

    // Sort products
    if (filters.sortBy === 'price-low') {
      filtered = [...filtered].sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (filters.sortBy === 'price-high') {
      filtered = [...filtered].sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (filters.sortBy === 'name') {
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  };

  const filteredProducts = getFilteredProducts();

  return (
    <div className="bg-gray-100">
      {/* Products Section */}
      <div className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-100">
        <div className="max-w-7xl mx-auto">
          {/* Header with Search and Filters */}
          <div className="flex items-center justify-between gap-6 mb-8">
            {/* Left: Heading */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Our Products</h2>
              <p className="text-gray-600">
                Browse our wide range of healthcare products
              </p>
            </div>

            {/* Right: Search Bar, Cart, and Filters */}
            <div className="flex items-center gap-2">
              {/* Search Container */}
              <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search medicines, products, categories..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => {
                    setIsSearchFocused(true);
                    setShowSuggestions(searchQuery.length > 0 || recentSearches.length > 0);
                  }}
                  onBlur={() => {
                    setIsSearchFocused(false);
                    setTimeout(() => setShowSuggestions(false), 200);
                  }}
                  onKeyDown={handleKeyPress}
                  className="w-full pl-10 pr-10 py-4 rounded-lg text-sm placeholder-gray-400 bg-white"
                />
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={16} className="text-gray-400" />
                  </button>
                )}

                {/* Search Suggestions Dropdown */}
                {showSuggestions && (hasSuggestions || hasRecentSearches) && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                    {/* Recent Searches */}
                    {hasRecentSearches && !searchQuery && (
                      <div className="p-2 border-b border-gray-100">
                        <div className="flex items-center justify-between px-3 py-2">
                          <span className="text-sm font-medium text-gray-700">Recent Searches</span>
                          <button
                            onClick={clearRecentSearches}
                            className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            Clear all
                          </button>
                        </div>
                        {recentSearches.map((search, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestionClick(search)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md flex items-center gap-3 group transition-colors"
                          >
                            <Search size={16} className="text-gray-400 group-hover:text-primary" />
                            <span className="text-gray-700 group-hover:text-primary">{search}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Search Suggestions */}
                    {hasSuggestions && (
                      <div className="p-2">
                        <div className="px-3 py-2">
                          <span className="text-sm text-gray-400 flex items-center gap-2">
                            Suggestions
                          </span>
                        </div>
                        {uniqueSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="w-full text-left px-3 py-3 hover:bg-gray-50 rounded-md transition-colors border-b border-gray-50 last:border-b-0"
                          >
                            <div className="text-gray-800 font-medium">{suggestion}</div>
                            <div className="text-sm text-gray-500 mt-1">
                              Found in {products.filter(p => p.name === suggestion).length} product(s)
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Quick Search Tips */}
                    <div className="p-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                      <div className="text-xs text-gray-500">
                        <strong>Tip:</strong> Press Enter to search • Esc to close
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Cart Button */}
            <button
              onClick={() => setShowCart(!showCart)}
              className="relative flex items-center gap-2 px-8 py-3 border border-white rounded-lg bg-white text-gray-700 font-medium"
            >
              <ShoppingCart size={18} />
              <span className="hidden sm:inline">Cart</span>
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </button>

            {/* Filter Button */}
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="hidden sm:flex items-center gap-2 px-8 py-3 border border-white rounded-lg bg-white text-gray-700 font-medium relative"
              >
                <SlidersHorizontal size={18} />
                Filters
                {getActiveFiltersCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {getActiveFiltersCount()}
                  </span>
                )}
              </button>

              {/* Filter Dropdown */}
              {showFilters && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-[500px] overflow-y-auto">
                  {/* Filter Header */}
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                    <h3 className="font-semibold text-gray-900">Filters</h3>
                    <button
                      onClick={handleResetFilters}
                      className="text-sm text-primary hover:text-emerald-600 font-medium"
                    >
                      Reset All
                    </button>
                  </div>

                  {/* Price Range Filter */}
                  <div className="p-4 border-b border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-3">Price Range</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-600">Min Price (Rs.)</label>
                        <input
                          type="number"
                          value={filters.priceRange.min}
                          onChange={(e) => handlePriceChange('min', e.target.value)}
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Max Price (Rs.)</label>
                        <input
                          type="number"
                          value={filters.priceRange.max}
                          onChange={(e) => handlePriceChange('max', e.target.value)}
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div className="p-4 border-b border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-3">Category</h4>
                    <div className="space-y-2">
                      {['medicine', 'product'].map((category) => (
                        <label key={category} className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.categories.includes(category)}
                            onChange={() => handleCategoryToggle(category)}
                            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                          />
                          <span className="ml-2 text-gray-700 capitalize">{category}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Discount Filter */}
                  <div className="p-4 border-b border-gray-200">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.hasDiscount}
                        onChange={(e) => setFilters(prev => ({ ...prev, hasDiscount: e.target.checked }))}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <span className="ml-2 text-gray-700">Show only discounted items</span>
                    </label>
                  </div>

                  {/* Sort By Filter */}
                  <div className="p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Sort By</h4>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="default">Default</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="name">Name: A to Z</option>
                    </select>
                  </div>

                  {/* Apply Button */}
                  <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <button
                      onClick={() => setShowFilters(false)}
                      className="w-full bg-primary hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg transition-colors duration-200"
                    >
                      Apply Filters ({filteredProducts.length} products)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search Status */}
          <div className="mt-3 flex items-center justify-between">
            {searchQuery && (
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  Searching for: <span className="font-semibold text-primary">"{searchQuery}"</span>
                </div>
                <div className="text-sm text-gray-500">
                  {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
                </div>
              </div>
            )}

          </div>

          {/* Tabs */}
          <div className="flex flex-wrap justify-center gap-4 mb-8 border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 px-4 font-medium text-sm transition-colors ${activeTab === tab
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer group relative"
                >
                  <div className="relative aspect-square bg-white border-b flex items-center justify-center p-4 overflow-hidden">
                    {product.discount && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
                        {product.discount}
                      </span>
                    )}
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Add to Cart Button - Shows on Hover */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                      }}
                      className="absolute bottom-3 left-1/2 transform -translate-x-1/2 translate-y-12 group-hover:translate-y-0 bg-primary hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-lg"
                    >
                      <ShoppingCart size={16} />
                      Add to Cart
                    </button>
                  </div>

                  <div className="p-3">
                    <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 min-h-[40px]">
                      {product.name}
                    </h3>

                    {product.price ? (
                      <div className="flex items-center gap-2">
                        <span className="text-primary font-bold text-base">
                          Rs.{product.price.toFixed(2)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-gray-400 text-sm line-through">
                            Rs.{product.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">Price on request</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500">
                {searchQuery
                  ? `No products match "${searchQuery}". Try a different search term.`
                  : 'No products available in this category.'}
              </p>
            </div>
          )}

          {/* View More Button */}
          {filteredProducts.length > 0 && !searchQuery && (
            <div className="text-center mt-10">
              <button className="bg-primary hover:bg-emerald-600 text-white font-semibold px-8 py-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl">
                View All Products
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cart Sidebar - Professional Design */}
      {showCart && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
            onClick={() => setShowCart(false)}
          ></div>

          {/* Cart Panel */}
          <div className="fixed right-0 top-0 h-full w-full sm:w-[450px] bg-white shadow-2xl z-50 flex flex-col animate-slideInRight">
            {/* Cart Header */}
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-primary to-emerald-600">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <ShoppingCart size={20} className="text-white" />
                    </div>
                    Shopping Cart
                  </h2>
                  <p className="text-emerald-50 text-sm mt-1">
                    {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'} in your cart
                  </p>
                </div>
                <button
                  onClick={() => setShowCart(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-all duration-200 text-white"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <ShoppingCart size={48} className="text-gray-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
                  <p className="text-gray-500 text-sm">Add some products to get started!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item, index) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-4 border border-gray-100"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="relative flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                          />
                          {item.discount && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                              {item.discount}
                            </span>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                            {item.name}
                          </h3>
                          <div className="flex items-baseline gap-2 mb-3">
                            <span className="text-primary font-bold text-lg">
                              Rs.{item.price?.toFixed(2)}
                            </span>
                            {item.originalPrice && (
                              <span className="text-gray-400 text-sm line-through">
                                Rs.{item.originalPrice.toFixed(2)}
                              </span>
                            )}
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-8 h-8 flex items-center justify-center bg-white hover:bg-gray-50 rounded-md text-gray-700 font-semibold shadow-sm transition-all duration-200 hover:scale-110"
                              >
                                -
                              </button>
                              <span className="text-sm font-bold text-gray-900 w-8 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center bg-white hover:bg-gray-50 rounded-md text-gray-700 font-semibold shadow-sm transition-all duration-200 hover:scale-110"
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-500 hover:text-red-700 text-sm font-medium hover:bg-red-50 px-3 py-1 rounded-md transition-all duration-200"
                            >
                              Remove
                            </button>
                          </div>

                          {/* Item Subtotal */}
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">Subtotal:</span>
                              <span className="font-bold text-gray-900">
                                Rs.{(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="border-t border-gray-200 bg-white">
                {/* Price Summary */}
                <div className="px-6 py-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-gray-900">Rs.{getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-semibold text-green-600">FREE</span>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">Total:</span>
                      <span className="text-2xl font-bold text-primary">Rs.{getTotalPrice().toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="px-6 pb-6 space-y-3">
                  {/* Download Invoice Button */}
                  <button
                    onClick={downloadInvoice}
                    className="w-full bg-white border-2 border-primary text-primary font-semibold py-3 rounded-xl transition-all duration-300 hover:bg-primary hover:text-white shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
                  >
                    <Download size={20} className="group-hover:animate-bounce" />
                    <span>Download Invoice</span>
                  </button>

                  {/* Checkout Button */}
                  <button
                    onClick={() => navigate('/pay', { state: { cart, totalPrice: getTotalPrice() } })}
                    className="w-full bg-gradient-to-r from-primary to-emerald-600 hover:from-emerald-600 hover:to-primary text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <span>Proceed to Checkout</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                  <p className="text-center text-xs text-gray-500 mt-2">
                    Secure checkout • Free delivery on orders above Rs.1000
                  </p>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Notification Modal - Bootstrap Style */}
      {notification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setNotification(null)}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full animate-scaleIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <ShoppingCart size={18} className="text-primary" />
                </div>
                Cart Updated
              </h3>
              <button
                onClick={() => setNotification(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-gray-700 font-medium">{notification}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    You now have {getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''} in your cart
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
              <button
                onClick={() => setNotification(null)}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Continue Shopping
              </button>
              <button
                onClick={() => {
                  setNotification(null);
                  setShowCart(true);
                }}
                className="flex-1 px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-emerald-600 transition-colors shadow-md"
              >
                View Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Products;