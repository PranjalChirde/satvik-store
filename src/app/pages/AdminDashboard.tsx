import { useEffect, useState, useRef, useMemo, Fragment } from 'react';
import { Package, Plus, Upload, Loader2, Store, Trash2, Ticket, Search, TrendingUp, DollarSign, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TableSkeleton } from '../components/SkeletonLoaders';

interface OrderItem {
  id: number;
  quantity: number;
  product: { title: string; price: number };
}

interface Product {
  id: number;
  title: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  badge?: string;
  description?: string;
}

interface Order {
  id: number;
  customerName: string;
  contactEmail: string;
  shippingAddress: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  orderItems: OrderItem[];
}

// Helper to get auth headers with JWT token
const getAdminHeaders = (): HeadersInit => {
  const token = localStorage.getItem('authToken');
  return token ? { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } : { 'Content-Type': 'application/json' };
};

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'product' | 'manage_products' | 'coupons'>('overview');
  
  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  // Products List State
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [loadingProductsList, setLoadingProductsList] = useState(true);
  const [productSearchTerm, setProductSearchTerm] = useState('');

  // Coupons State
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(true);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState('');

  // New Product State
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [category, setCategory] = useState('bestsellers');
  const [badge, setBadge] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<{id: number, url: string}[]>([]);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch orders for the Overview tab stats on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const authHeader = token ? { 'Authorization': `Bearer ${token}` } : {};
    fetch('/api/orders', { headers: authHeader })
      .then((res) => res.json())
      .then((data) => { setOrders(data); setLoadingOrders(false); })
      .catch(() => setLoadingOrders(false));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const authHeader = token ? { 'Authorization': `Bearer ${token}` } : {};
    if (activeTab === 'manage_products') {
      setLoadingProductsList(true);
      fetch('/api/products', { headers: authHeader })
        .then((res) => res.json())
        .then((data) => { setProductsList(data); setLoadingProductsList(false); });
    } else if (activeTab === 'coupons') {
      setLoadingCoupons(true);
      fetch('/api/coupons', { headers: authHeader })
        .then((res) => res.json())
        .then((data) => { setCoupons(data); setLoadingCoupons(false); });
    }
  }, [activeTab]);

  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: getAdminHeaders(),
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    const confirm = window.confirm("Are you sure you want to delete this product? All related reviews and cart items will be cascadingly deleted.");
    if (!confirm) return;
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        setProductsList(productsList.filter(p => p.id !== productId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditClick = async (productId: number) => {
    try {
      const res = await fetch(`/api/products/${productId}`);
      const prod = await res.json();
      setEditingProductId(prod.id);
      setTitle(prod.title);
      setPrice(prod.price.toString());
      setOriginalPrice(prod.originalPrice?.toString() || '');
      setCategory(prod.category);
      setBadge(prod.badge || '');
      setDescription(prod.description || '');
      setImageFile(null); // Clear image file input
      setAdditionalImages([]);
      setExistingImages(prod.images || []);
      setActiveTab('product');
    } catch (err) {
      console.error('Failed to fetch product details', err);
    }
  };

  const cancelEdit = () => {
    setEditingProductId(null);
    setTitle('');
    setPrice('');
    setOriginalPrice('');
    setCategory('bestsellers');
    setBadge('');
    setDescription('');
    setImageFile(null);
    setAdditionalImages([]);
    setExistingImages([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setActiveTab('manage_products');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!title || !price) {
      setError('Title and Price are required.');
      return;
    }
    
    if (!editingProductId && !imageFile) {
      setError('Image is required when creating a new product.');
      return;
    }

    setUploading(true);

    try {
      let finalImageUrl = undefined;

      // 1. Upload the image if a new one is selected
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);

        const token = localStorage.getItem('authToken');
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
          body: formData,
        });

        if (!uploadRes.ok) throw new Error('Image upload failed');
        const { url } = await uploadRes.json();
        finalImageUrl = url;
      }

      const payload: any = {
        title,
        price,
        originalPrice,
        category,
        badge,
        description
      };
      
      if (finalImageUrl) payload.image = finalImageUrl;

      // Upload additional images
      const newAdditionalUrls: string[] = [];
      for (const file of additionalImages) {
        const fileFormData = new FormData();
        fileFormData.append('image', file);
        const token = localStorage.getItem('authToken');
        const upRes = await fetch('/api/upload', {
          method: 'POST',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
          body: fileFormData
        });
        if (upRes.ok) {
          const { url } = await upRes.json();
          newAdditionalUrls.push(url);
        }
      }

      const allAdditionalImages = [...existingImages.map((img: any) => img.url), ...newAdditionalUrls];
      if (allAdditionalImages.length > 0 || editingProductId) {
        // If editing, we always pass the current list to allow deletions
        payload.additionalImages = allAdditionalImages;
      }

      // 2. Create or Update the product
      const endpoint = editingProductId ? `/api/products/${editingProductId}` : '/api/products';
      const method = editingProductId ? 'PATCH' : 'POST';

      const productRes = await fetch(endpoint, {
        method,
        headers: getAdminHeaders(),
        body: JSON.stringify(payload),
      });

      if (!productRes.ok) throw new Error(`Product ${editingProductId ? 'update' : 'creation'} failed`);

      setSuccess(true);
      if (!editingProductId) {
        // Reset form completely if it was a new creation
        setTitle('');
        setPrice('');
        setOriginalPrice('');
        setCategory('bestsellers');
        setBadge('');
        setDescription('');
        setImageFile(null);
        setAdditionalImages([]);
        setExistingImages([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
      
      setTimeout(() => setSuccess(false), 3000);

    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setUploading(false);
    }
  };

  const filteredProductsList = productsList.filter(p => 
    p.title.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearchTerm.toLowerCase())
  );

  // ─── Chart Data Aggregation ───
  const { chartData, totalRevenue, totalOrdersCount, avgOrderValue } = useMemo(() => {
    let rev = 0;
    const count = orders.length;
    
    // Aggregate by date
    const dailyData: Record<string, number> = {};
    
    orders.forEach(o => {
      rev += o.totalAmount;
      const d = new Date(o.createdAt);
      const dateString = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!dailyData[dateString]) dailyData[dateString] = 0;
      dailyData[dateString] += o.totalAmount;
    });

    const data = Object.entries(dailyData)
      .map(([date, revenue]) => ({ date, revenue }))
      .reverse(); // If orders are sorted desc, reverse to chronological

    return {
      chartData: data,
      totalRevenue: rev,
      totalOrdersCount: count,
      avgOrderValue: count > 0 ? rev / count : 0
    };
  }, [orders]);

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-3xl font-medium mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
          Admin Dashboard
        </h1>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8 gap-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-4 flex items-center gap-2 font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'overview' ? 'border-orange-600 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Activity className="w-5 h-5" /> Overview
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-4 flex items-center gap-2 font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'orders' ? 'border-orange-600 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Package className="w-5 h-5" /> Recent Orders
          </button>
          <button
            onClick={() => setActiveTab('manage_products')}
            className={`pb-4 flex items-center gap-2 font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'manage_products' ? 'border-orange-600 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Store className="w-5 h-5" /> Manage Products
          </button>
          <button
            onClick={() => setActiveTab('product')}
            className={`pb-4 flex items-center gap-2 font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'product' ? 'border-orange-600 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Plus className="w-5 h-5" /> {editingProductId ? 'Edit Product' : 'Add New Product'}
          </button>
          <button
            onClick={() => setActiveTab('coupons')}
            className={`pb-4 flex items-center gap-2 font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'coupons' ? 'border-orange-600 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Ticket className="w-5 h-5" /> Promo Coupons
          </button>
        </div>

        {/* Tab Content: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6 mb-8">
            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-green-100 p-2 rounded-lg text-green-700">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <h3 className="text-gray-500 font-medium">Lifetime Revenue</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">₹{totalRevenue.toLocaleString()}</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-blue-100 p-2 rounded-lg text-blue-700">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h3 className="text-gray-500 font-medium">Average Order Value</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">₹{avgOrderValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-orange-100 p-2 rounded-lg text-orange-700">
                    <Package className="w-5 h-5" />
                  </div>
                  <h3 className="text-gray-500 font-medium">Total Orders</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">{totalOrdersCount}</p>
              </div>
            </div>

            {/* Chart Area */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-800 mb-6">Revenue Over Time</h2>
              {chartData.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  No sales data yet to visualize.
                </div>
              ) : (
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ea580c" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(value) => `₹${value}`} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                        labelStyle={{ color: '#374151', fontWeight: 'bold', marginBottom: '4px' }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#ea580c" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab Content: Orders */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {loadingOrders ? (
              <TableSkeleton />
            ) : orders.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No orders found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-max">
                  <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
                    <tr>
                      <th className="px-6 py-4 font-semibold w-10"></th>
                      <th className="px-6 py-4 font-semibold">Order ID</th>
                      <th className="px-6 py-4 font-semibold">Customer</th>
                      <th className="px-6 py-4 font-semibold">Date</th>
                      <th className="px-6 py-4 font-semibold">Items</th>
                      <th className="px-6 py-4 font-semibold">Total</th>
                      <th className="px-6 py-4 font-semibold text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.map((order) => (
                      <Fragment key={order.id}>
                        <tr className="hover:bg-gray-50 transition border-b border-gray-100">
                          <td className="px-6 py-4">
                            <button 
                              onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                              className="text-gray-400 hover:text-orange-600 transition"
                            >
                              {expandedOrderId === order.id ? <ChevronUp className="w-5 h-5"/> : <ChevronDown className="w-5 h-5"/>}
                            </button>
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-900">#ORD-{order.id.toString().padStart(4, '0')}</td>
                          <td className="px-6 py-4 text-gray-600">{order.customerName || 'Guest'}</td>
                          <td className="px-6 py-4 text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 max-w-xs truncate text-gray-500">
                            {order.orderItems.map((item) => `${item.quantity}x ${item.product.title}`).join(', ')}
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-900">₹{order.totalAmount.toFixed(2)}</td>
                          <td className="px-6 py-4 text-center">
                            <select 
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                              className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-1.5 focus:ring-orange-500 focus:border-orange-500 outline-none font-medium cursor-pointer"
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="SHIPPED">SHIPPED</option>
                              <option value="DELIVERED">DELIVERED</option>
                              <option value="CANCELLED">CANCELLED</option>
                            </select>
                          </td>
                        </tr>
                        {expandedOrderId === order.id && (
                          <tr className="bg-orange-50/50">
                            <td colSpan={7} className="px-6 py-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl border border-orange-100 bg-white">
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-widest mb-3 border-b pb-2">Customer Details</h4>
                                  <p className="text-sm text-gray-600 mb-1"><span className="font-medium text-gray-900">Name:</span> {order.customerName || 'Guest User'}</p>
                                  <p className="text-sm text-gray-600"><span className="font-medium text-gray-900">Email:</span> <a href={`mailto:${order.contactEmail}`} className="text-orange-600 hover:underline">{order.contactEmail}</a></p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-widest mb-3 border-b pb-2">Shipping Information</h4>
                                  <p className="text-sm text-gray-600 leading-relaxed"><span className="font-medium text-gray-900 block mb-1">Full Shipping Address:</span> {order.shippingAddress}</p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Manage Products */}
        {activeTab === 'manage_products' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-medium text-gray-800">Inventory</h2>
              <div className="relative">
                <input 
                  type="text" 
                  value={productSearchTerm}
                  onChange={(e) => setProductSearchTerm(e.target.value)}
                  placeholder="Search products by name or category..." 
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 min-w-[300px]"
                />
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            
            {loadingProductsList ? (
              <TableSkeleton />
            ) : filteredProductsList.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {productSearchTerm ? 'No products match your search.' : 'No products found.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-max">
                  <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Image</th>
                      <th className="px-6 py-4 font-semibold">Title</th>
                      <th className="px-6 py-4 font-semibold">Category</th>
                      <th className="px-6 py-4 font-semibold">Price</th>
                      <th className="px-6 py-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredProductsList.map((prod) => (
                      <tr key={prod.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <img src={prod.image} alt={prod.title} className="w-12 h-12 rounded object-cover" />
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">{prod.title}</td>
                        <td className="px-6 py-4 text-gray-500 capitalize">{prod.category.replace('-', ' ')}</td>
                        <td className="px-6 py-4 font-medium text-gray-900">₹{prod.price.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                          <button
                            onClick={() => handleEditClick(prod.id)}
                            className="p-2 text-blue-400 hover:text-blue-600 transition rounded-full hover:bg-blue-50 text-sm font-medium"
                            title="Edit Product"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-2 text-gray-400 hover:text-red-500 transition rounded-full hover:bg-red-50"
                            title="Delete Product"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Add / Edit Product */}
        {activeTab === 'product' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-10 max-w-3xl relative">
            {editingProductId && (
              <button 
                onClick={cancelEdit}
                className="absolute top-6 right-6 text-sm text-gray-500 hover:text-gray-900 border border-gray-200 px-3 py-1.5 rounded-lg"
              >
                Cancel Edit
              </button>
            )}
            <h2 className="text-xl font-medium mb-6">{editingProductId ? 'Edit Product' : 'Create New Product'}</h2>

            {error && <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">{error}</div>}
            {success && <div className="mb-6 p-4 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm">Product {editingProductId ? 'updated' : 'added'} successfully!</div>}

            <form onSubmit={handleCreateProduct} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 outline-none"
                  placeholder="e.g. 5 Mukhi Rudraksha"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 outline-none"
                    placeholder="999"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Original Price (₹) - Optional</label>
                  <input
                    type="number"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 outline-none"
                    placeholder="1499"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 outline-none"
                  >
                    <option value="bestsellers">Best Sellers</option>
                    <option value="new-arrivals">New Arrivals</option>
                    <option value="jap-malas">Jap Mala Collection</option>
                    <option value="healing-gifts">Healing & Wellness</option>
                    <option value="brass-idols">Brass Idols</option>
                    <option value="puja-samagri">Puja Samagri</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Badge - Optional</label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 outline-none"
                    placeholder="e.g. New"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description - Optional</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 outline-none resize-none"
                  placeholder="Describe the product materials, spiritual significance, and key details..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-orange-500 transition">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none">
                        <span>{editingProductId ? 'Upload new file (optional)' : 'Upload a file'}</span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="sr-only"
                        />
                      </label>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 flex flex-col items-center">
                      {imageFile ? (
                        <>
                          <div className="relative w-16 h-16 rounded overflow-hidden border mb-2">
                            <img src={URL.createObjectURL(imageFile)} className="w-full h-full object-cover" alt="main preview" />
                          </div>
                          <span className="text-green-600 font-medium">{imageFile.name}</span>
                        </>
                      ) : (
                        'PNG, JPG, WEBP up to 5MB'
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gallery Images (Optional)</label>
                <div className="mt-1 flex flex-col gap-4">
                  <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-orange-500 transition">
                    <div className="space-y-1 text-center">
                      <div className="flex text-sm text-gray-600 justify-center">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none">
                          <span>Upload gallery images</span>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files) {
                                setAdditionalImages((prev) => [...prev, ...Array.from(e.target.files!)]);
                              }
                            }}
                            className="sr-only"
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">
                        Select multiple PNG, JPG, WEBP
                      </p>
                    </div>
                  </div>
                  
                  {/* Previews */}
                  {(existingImages.length > 0 || additionalImages.length > 0) && (
                    <div className="flex gap-2 flex-wrap">
                      {existingImages.map((img, idx) => (
                        <div key={`ext-${img.id}`} className="relative w-16 h-16 rounded overflow-hidden border">
                          <img src={img.url} className="w-full h-full object-cover" alt="existing" />
                          <button 
                            type="button"
                            onClick={() => setExistingImages(existingImages.filter((_, i) => i !== idx))}
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-bl px-1.5 py-0.5 text-xs hover:bg-red-600"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                      {additionalImages.map((file, idx) => (
                        <div key={`new-${idx}`} className="relative w-16 h-16 rounded overflow-hidden border">
                          <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="new" />
                          <button 
                            type="button"
                            onClick={() => setAdditionalImages(additionalImages.filter((_, i) => i !== idx))}
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-bl px-1.5 py-0.5 text-xs hover:bg-red-600"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={uploading}
                  className="bg-orange-600 text-white px-8 py-3 rounded-lg hover:bg-orange-700 font-medium transition disabled:opacity-70 flex items-center gap-2"
                >
                  {uploading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> {editingProductId ? 'Updating...' : 'Saving...'}</>
                  ) : (
                    editingProductId ? 'Update Product' : 'Save Product'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* COMPONENT: COUPONS */}
        {activeTab === 'coupons' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-xl font-medium mb-6">Manage Promo Codes</h2>
            
            <div className="flex flex-col md:flex-row gap-4 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <input
                type="text"
                placeholder="Code (e.g. FIRST10)"
                value={newCouponCode}
                onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                className="border border-gray-300 rounded-lg px-4 py-2 flex-grow focus:outline-none focus:ring-2 focus:ring-orange-600/50 uppercase"
              />
              <input
                type="number"
                placeholder="Discount %"
                value={newCouponDiscount}
                onChange={(e) => setNewCouponDiscount(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 md:w-32 focus:outline-none focus:ring-2 focus:ring-orange-600/50"
              />
              <button
                onClick={async () => {
                  if (!newCouponCode || !newCouponDiscount) return;
                  const res = await fetch('/api/coupons', {
                    method: 'POST',
                    headers: getAdminHeaders(),
                    body: JSON.stringify({ code: newCouponCode, discountPct: newCouponDiscount })
                  });
                  if (res.ok) {
                    const coupon = await res.json();
                    setCoupons([coupon, ...coupons]);
                    setNewCouponCode('');
                    setNewCouponDiscount('');
                  } else {
                    alert('Failed to create code (may already exist)');
                  }
                }}
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium transition whitespace-nowrap"
              >
                Create Code
              </button>
            </div>

            {loadingCoupons ? (
              <div className="flex justify-center p-12 text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {coupons.map((coupon) => (
                  <div key={coupon.id} className="border border-emerald-100 bg-emerald-50/30 rounded-xl p-5 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-lg text-gray-900 tracking-wider font-mono">{coupon.code}</div>
                      <div className="text-sm text-green-700 font-medium">{coupon.discountPct}% OFF</div>
                    </div>
                    <button
                      onClick={async () => {
                        if (!window.confirm('Revoke this code?')) return;
                        const token = localStorage.getItem('authToken');
                        const res = await fetch(`/api/coupons/${coupon.id}`, {
                          method: 'DELETE',
                          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                        });
                        if (res.ok) {
                          setCoupons(coupons.filter(c => c.id !== coupon.id));
                        }
                      }}
                      className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition"
                      title="Revoke Coupon"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                {coupons.length === 0 && (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    No promo codes found. Create one above to boost your sales!
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
