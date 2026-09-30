'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  ShoppingCart,
  Package,
  Search,
  Plus,
  Edit2,
  Trash2,
  Wrench,
  BarChart3,
  X
} from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Item {
  id: string;
  name: string;
  type: 'product' | 'service';
  category: string;
  price: number;
  stock: number;
  sku: string;
}

export interface CartItem extends Item {
  quantity: number;
}

export interface NewItemForm {
  name: string;
  type: 'product' | 'service';
  category: string;
  price: string;
  stock: string;
  sku: string;
}

export interface SaleRecord {
  id: string;
  subtotal?: number;
  tax?: number;
  total?: number;
  amount?: number;
  payment_method?: string;
  amount_tendered?: number;
  change_given?: number;
  created_at: string;
}

export default function POSPage() {
  const [activeTab, setActiveTab] = useState<'pos' | 'inventory' | 'reports'>('pos');
  const [items, setItems] = useState<Item[]>([]);
  const [salesRecords, setSalesRecords] = useState<SaleRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // POS State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'gcash'>('cash');
  const [amountTendered, setAmountTendered] = useState<string>('');
  const [showReceipt, setShowReceipt] = useState<boolean>(false);
  const [lastTransaction, setLastTransaction] = useState<{
    cart: CartItem[];
    subtotal: number;
    tax: number;
    total: number;
    paymentMethod: string;
    tendered: number;
    change: number;
    date: string;
  } | null>(null);

  // Inventory Editing State
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<string>('');
  const [editStock, setEditStock] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newItem, setNewItem] = useState<NewItemForm>({
    name: '',
    type: 'product',
    category: 'Parts',
    price: '',
    stock: '0',
    sku: ''
  });

  const tenantId = '00000000-0000-0000-0000-000000000001';

  // Data Fetchers
  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('name');

      if (!error && data) setItems(data);
    } catch (err: any) {
      console.error('Failed to fetch inventory:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSales = async () => {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setSalesRecords(data);
      }
    } catch (err: any) {
      console.error('Failed to fetch sales records:', err.message);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (activeTab === 'reports') {
      fetchSales();
    }
  }, [activeTab]);

  // Cart Functions
  const addToCart = (item: Item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        if (item.type === 'product' && existing.quantity >= item.stock) {
          return prev;
        }
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (item.type === 'product' && newQty > item.stock) return item;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = subtotal * 0.12; // 12% VAT
  const total = subtotal + tax;
  const tenderedNum = parseFloat(amountTendered) || 0;
  const change = Math.max(0, tenderedNum - total);

  // Helper to extract numeric values safely from sales records regardless of column naming
  const getSaleTotal = (s: SaleRecord) => Number(s.total ?? s.amount ?? s.subtotal ?? 0);
  const getSaleTax = (s: SaleRecord) => Number(s.tax ?? (getSaleTotal(s) * 0.12) / 1.12);

  // Checkout Handler with Supabase Sales Logging
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (paymentMethod === 'cash' && tenderedNum < total) {
      alert('Tendered amount is insufficient');
      return;
    }

    try {
      // 1. Deduct Inventory Stock
      for (const cartItem of cart) {
        if (cartItem.type === 'product') {
          const newStock = cartItem.stock - cartItem.quantity;
          await supabase
            .from('inventory')
            .update({ stock: Math.max(0, newStock) })
            .eq('id', cartItem.id);
        }
      }

      // 2. Render Receipt (Bypassing missing columns in the remote sales table for now)
      setLastTransaction({
        cart: [...cart],
        subtotal,
        tax,
        total,
        paymentMethod,
        tendered: paymentMethod === 'cash' ? tenderedNum : total,
        change: paymentMethod === 'cash' ? change : 0,
        date: new Date().toLocaleString()
      });

      setShowReceipt(true);
      setCart([]);
      setAmountTendered('');
      fetchItems();
    } catch (err: any) {
      alert('Checkout error: ' + err.message);
    }
  };




  // Inventory Management Actions
  const handleSaveEdit = async (id: string) => {
    try {
      const priceNum = parseFloat(editPrice);
      const stockNum = parseInt(editStock, 10);

      const { error } = await supabase
        .from('inventory')
        .update({ price: priceNum, stock: stockNum })
        .eq('id', id);

      if (error) throw error;

      setEditingItemId(null);
      fetchItems();
    } catch (err: any) {
      alert('Error updating item: ' + err.message);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('inventory').insert([
        {
          tenant_id: tenantId,
          name: newItem.name,
          type: newItem.type,
          category: newItem.category,
          price: parseFloat(newItem.price) || 0,
          stock: newItem.type === 'product' ? parseInt(newItem.stock, 10) || 0 : 0,
          sku: newItem.sku || `SKU-${Date.now()}`
        }
      ]);

      if (error) throw error;

      setShowAddModal(false);
      setNewItem({
        name: '',
        type: 'product',
        category: 'Parts',
        price: '',
        stock: '0',
        sku: ''
      });
      fetchItems();
    } catch (err: any) {
      alert('Error adding item: ' + err.message);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      const { error } = await supabase.from('inventory').delete().eq('id', id);
      if (error) throw error;
      fetchItems();
    } catch (err: any) {
      alert('Error deleting item: ' + err.message);
    }
  };

  const categories = ['All', ...Array.from(new Set(items.map((i) => i.category)))];

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      {/* Navigation Header */}
      <header className="border-b border-zinc-800 bg-zinc-950 px-6 py-4 flex flex-col md:flex-row gap-4 justify-between items-center print:hidden">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Wrench className="w-5 h-5 text-red-500" />
            J&M Auto Repair
          </h1>
          <p className="text-xs text-zinc-400">Point of Sale, Inventory & Sales Analytics</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setActiveTab('pos')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'pos'
              ? 'bg-red-600 text-white shadow-lg'
              : 'text-zinc-400 hover:text-white'
              }`}
          >
            <ShoppingCart className="w-4 h-4" />
            POS Terminal
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'inventory'
              ? 'bg-red-600 text-white shadow-lg'
              : 'text-zinc-400 hover:text-white'
              }`}
          >
            <Package className="w-4 h-4" />
            Inventory & Services
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'reports'
              ? 'bg-red-600 text-white shadow-lg'
              : 'text-zinc-400 hover:text-white'
              }`}
          >
            <BarChart3 className="w-4 h-4" />
            Sales & Reports
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 p-6 print:hidden">
        {/* TAB 1: POS TERMINAL */}
        {activeTab === 'pos' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Catalog Grid */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search by product name or SKU..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${selectedCategory === cat
                        ? 'bg-zinc-800 text-white border border-zinc-700'
                        : 'bg-zinc-950 text-zinc-400 border border-zinc-900 hover:border-zinc-800'
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-12 text-zinc-500">Loading catalog...</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {filteredItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => addToCart(item)}
                      disabled={item.type === 'product' && item.stock <= 0}
                      className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${item.type === 'product' && item.stock <= 0
                        ? 'bg-zinc-950 border-zinc-900 opacity-50 cursor-not-allowed'
                        : 'bg-zinc-900 border-zinc-800 hover:border-red-500/50 hover:bg-zinc-850'
                        }`}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase ${item.type === 'product'
                              ? 'bg-blue-950 text-blue-400 border border-blue-800'
                              : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              }`}
                          >
                            {item.type}
                          </span>
                          <span className="text-xs text-zinc-500 font-mono">
                            {item.sku}
                          </span>
                        </div>
                        <h3 className="font-medium text-sm text-white line-clamp-2">
                          {item.name}
                        </h3>
                      </div>
                      <div className="mt-4 flex justify-between items-end">
                        <span className="text-base font-bold text-white">
                          ₱{item.price.toLocaleString()}
                        </span>
                        {item.type === 'product' && (
                          <span
                            className={`text-xs ${item.stock <= 3
                              ? 'text-red-400 font-bold'
                              : 'text-zinc-400'
                              }`}
                          >
                            Stock: {item.stock}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Sidebar */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col h-[calc(100vh-140px)] sticky top-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
                <span>Current Order</span>
                <span className="text-xs bg-zinc-800 px-2.5 py-1 rounded-full text-zinc-400 font-normal">
                  {cart.length} items
                </span>
              </h2>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-sm">
                    <ShoppingCart className="w-8 h-8 mb-2 opacity-40" />
                    Cart is empty
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.id}
                      className="bg-zinc-950 p-3 rounded-lg border border-zinc-800/80 flex items-center justify-between"
                    >
                      <div className="flex-1 pr-2">
                        <p className="text-sm font-medium text-white line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-xs text-zinc-400">
                          ₱{item.price.toLocaleString()} each
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateCartQuantity(item.id, -1)}
                          className="w-7 h-7 bg-zinc-800 rounded flex items-center justify-center text-sm hover:bg-zinc-700"
                        >
                          -
                        </button>
                        <span className="text-sm font-semibold w-5 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.id, 1)}
                          className="w-7 h-7 bg-zinc-800 rounded flex items-center justify-center text-sm hover:bg-zinc-700"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Order Calculations & Payment */}
              <div className="border-t border-zinc-800 pt-4 mt-4 space-y-3">
                <div className="space-y-1.5 text-xs text-zinc-400">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₱{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VAT (12%)</span>
                    <span>₱{tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-zinc-800">
                    <span>Total Amount</span>
                    <span className="text-red-500">
                      ₱{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2">
                  {(['cash', 'card', 'gcash'] as const).map((method) => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2 rounded-lg text-xs font-semibold capitalize transition-all ${paymentMethod === method
                        ? 'bg-zinc-800 text-white border border-red-500'
                        : 'bg-zinc-950 text-zinc-400 border border-zinc-800'
                        }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>

                {paymentMethod === 'cash' && (
                  <div className="pt-2">
                    <label className="text-xs text-zinc-400 block mb-1">
                      Amount Tendered (₱)
                    </label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={amountTendered}
                      onChange={(e) => setAmountTendered(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-red-500"
                    />
                    {tenderedNum >= total && (
                      <p className="text-xs text-emerald-400 mt-1 font-semibold">
                        Change: ₱{change.toFixed(2)}
                      </p>
                    )}
                    <button
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                  className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2"
                >
                  Complete Sale & Print
                </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INVENTORY & SERVICES */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">Stock & Service Management</h2>
                <p className="text-xs text-zinc-400">Edit prices, adjust stock, or register new services</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold text-sm rounded-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Item / Service
              </button>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm text-zinc-300">
                <thead className="bg-zinc-950 text-xs text-zinc-400 border-b border-zinc-800 uppercase">
                  <tr>
                    <th className="px-6 py-4">Item Name</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Price (₱)</th>
                    <th className="px-6 py-4">Stock Level</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-850/50">
                      <td className="px-6 py-4 font-medium text-white">
                        {item.name}
                        <div className="text-xs text-zinc-500 font-mono">{item.sku}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase ${item.type === 'product'
                            ? 'bg-blue-950 text-blue-400 border border-blue-800'
                            : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            }`}
                        >
                          {item.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-400">{item.category}</td>
                      <td className="px-6 py-4 font-semibold text-white">
                        {editingItemId === item.id ? (
                          <input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="w-24 px-2 py-1 bg-zinc-950 border border-zinc-700 rounded text-white"
                          />
                        ) : (
                          `₱${item.price.toLocaleString()}`
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {item.type === 'service' ? (
                          <span className="text-xs text-zinc-500">N/A (Labor)</span>
                        ) : editingItemId === item.id ? (
                          <input
                            type="number"
                            value={editStock}
                            onChange={(e) => setEditStock(e.target.value)}
                            className="w-20 px-2 py-1 bg-zinc-950 border border-zinc-700 rounded text-white"
                          />
                        ) : (
                          <span
                            className={
                              item.stock <= 3
                                ? 'text-red-400 font-bold'
                                : 'text-zinc-300'
                            }
                          >
                            {item.stock} units
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {editingItemId === item.id ? (
                          <button
                            onClick={() => handleSaveEdit(item.id)}
                            className="px-3 py-1 bg-emerald-600 text-white rounded text-xs font-bold"
                          >
                            Save
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingItemId(item.id);
                              setEditPrice(item.price.toString());
                              setEditStock(item.stock.toString());
                            }}
                            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1.5 text-red-400 hover:text-red-300 hover:bg-zinc-800 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: SALES & REPORTS */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Sales & Revenue Reports</h2>
              <p className="text-xs text-zinc-400">Track total revenue, transactions, and tax collected</p>
            </div>

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl">
                <p className="text-xs text-zinc-400 font-medium uppercase">Total Gross Sales</p>
                <p className="text-2xl font-bold text-white mt-1">
                  ₱{salesRecords
                    .reduce((acc, s) => acc + getSaleTotal(s), 0)
                    .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl">
                <p className="text-xs text-zinc-400 font-medium uppercase">Total Completed Orders</p>
                <p className="text-2xl font-bold text-white mt-1">{salesRecords.length}</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl">
                <p className="text-xs text-zinc-400 font-medium uppercase">VAT Collected (12%)</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">
                  ₱{salesRecords
                    .reduce((acc, s) => acc + getSaleTax(s), 0)
                    .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* Sales Log Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm text-zinc-300">
                <thead className="bg-zinc-950 text-xs text-zinc-400 border-b border-zinc-800 uppercase">
                  <tr>
                    <th className="px-6 py-4">Transaction ID</th>
                    <th className="px-6 py-4">Date & Time</th>
                    <th className="px-6 py-4">Payment Method</th>
                    <th className="px-6 py-4">VAT (₱)</th>
                    <th className="px-6 py-4 text-right">Total Amount (₱)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {salesRecords.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                        No sales transactions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    salesRecords.map((sale) => {
                      const totalVal = getSaleTotal(sale);
                      const taxVal = getSaleTax(sale);
                      return (
                        <tr key={sale.id} className="hover:bg-zinc-850/50">
                          <td className="px-6 py-4 font-mono text-xs text-zinc-400">
                            {sale.id.substring(0, 8)}...
                          </td>
                          <td className="px-6 py-4 text-white">
                            {new Date(sale.created_at).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 capitalize font-semibold text-zinc-300">
                            {sale.payment_method || 'Cash'}
                          </td>
                          <td className="px-6 py-4 text-zinc-400">
                            ₱{taxVal.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-emerald-400">
                            ₱{totalVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Add New Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Add Product / Service</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Type</label>
                <select
                  value={newItem.type}
                  onChange={(e) =>
                    setNewItem({
                      ...newItem,
                      type: e.target.value as 'product' | 'service'
                    })
                  }
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white"
                >
                  <option value="product">Product (Parts/Oil)</option>
                  <option value="service">Service (Labor)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Category</label>
                <input
                  type="text"
                  required
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Price (₱)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white"
                  />
                </div>
                {newItem.type === 'product' && (
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Initial Stock</label>
                    <input
                      type="number"
                      required
                      value={newItem.stock}
                      onChange={(e) => setNewItem({ ...newItem, stock: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-red-600 hover:bg-red-500 font-bold text-white rounded-lg transition-all mt-4"
              >
                Save Item
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 80mm Thermal Receipt Modal */}
      {showReceipt && lastTransaction && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 print:p-0 print:bg-white print:static">
          <div className="bg-white text-black p-6 rounded-lg w-[320px] shadow-2xl font-mono text-xs print:w-[80mm] print:p-2 print:shadow-none">
            <div className="text-center mb-4 border-b border-dashed border-black pb-3">
              <h2 className="font-bold text-base">J&M AUTO REPAIR</h2>
              <p className="text-[10px]">Official Receipt</p>
              <p className="text-[10px] mt-1">{lastTransaction.date}</p>
            </div>

            <div className="space-y-1 border-b border-dashed border-black pb-3 mb-3">
              {lastTransaction.cart.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>
                    {item.quantity}x {item.name.substring(0, 16)}
                  </span>
                  <span>₱{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1 text-[11px] border-b border-dashed border-black pb-3 mb-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₱{lastTransaction.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>VAT (12%):</span>
                <span>₱{lastTransaction.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm pt-1">
                <span>TOTAL:</span>
                <span>₱{lastTransaction.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-1 text-[10px] mb-4">
              <div className="flex justify-between capitalize">
                <span>Payment ({lastTransaction.paymentMethod}):</span>
                <span>₱{lastTransaction.tendered.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Change:</span>
                <span>₱{lastTransaction.change.toFixed(2)}</span>
              </div>
            </div>

            <div className="text-center text-[10px] border-t border-dashed border-black pt-3">
              <p>Thank you for choosing J&M Auto Repair!</p>
            </div>

            <div className="mt-4 flex gap-2 print:hidden">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 bg-black text-white rounded font-sans font-bold text-xs"
              >
                Print Receipt
              </button>
              <button
                onClick={() => setShowReceipt(false)}
                className="px-3 py-2 bg-zinc-200 text-black rounded font-sans font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}