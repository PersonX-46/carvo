'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface StockItem {
  id: number;
  itemName: string;
  category: string | null;
  quantity: number;
  unitPrice: number | null;
  minStockLevel: number;
  supplier: string | null;
  supplierContact: string | null;
  lastRestocked: Date | null;
  location: string | null;
  notes: string | null;
  movements?: StockMovement[];
}

interface StockMovement {
  id: number;
  stockItemId: number;
  type: 'in' | 'out';
  quantity: number;
  reason: string;
  date: Date;
  performedBy: string;
  reference: string | null;
}

interface InventoryStats {
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalInventoryValue: number;
  categories: { name: string; count: number }[];
}

const InventoryManagement: React.FC = () => {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [inventoryStats, setInventoryStats] = useState<InventoryStats>({
    totalItems: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    totalInventoryValue: 0,
    categories: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'details' | 'add' | 'edit' | 'restock'>('list');
  const [activeFilter, setActiveFilter] = useState<'all' | 'low_stock' | 'out_of_stock' | 'need_reorder'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    itemName: '',
    category: '',
    quantity: '',
    unitPrice: '',
    minStockLevel: '',
    supplier: '',
    supplierContact: '',
    location: '',
    notes: ''
  });

  const [restockData, setRestockData] = useState({
    quantity: '',
    unitPrice: '',
    supplier: '',
    notes: '',
    reference: ''
  });

  // Fetch inventory items
  const fetchInventory = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append('search', searchTerm);
      if (activeFilter !== 'all') queryParams.append('filter', activeFilter);
      if (categoryFilter !== 'all') queryParams.append('category', categoryFilter);

      const response = await fetch(`/api/admin/inventory?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch inventory');
      }

      const data = await response.json();
      setStockItems(data);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError('Failed to load inventory. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch inventory stats
  const fetchInventoryStats = async () => {
    try {
      const response = await fetch('/api/admin/inventory/stats');
      if (response.ok) {
        const stats = await response.json();
        setInventoryStats(stats);
      }
    } catch (err) {
      console.error('Error fetching inventory stats:', err);
    }
  };

  // Fetch stock item details
  const fetchStockItemDetails = async (itemId: number) => {
    try {
      setIsLoadingDetails(true);
      setError(null);

      const response = await fetch(`/api/admin/inventory/${itemId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch item details');
      }

      const itemData = await response.json();
      setStockMovements(itemData.movements || []);
    } catch (err) {
      console.error('Error fetching item details:', err);
      setError('Failed to load item details. Please try again.');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchInventory();
    fetchInventoryStats();
  }, [activeFilter, categoryFilter]);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInventory();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleViewItem = async (item: StockItem) => {
    setSelectedItem(item);
    setViewMode('details');
    await fetchStockItemDetails(item.id);
  };

  const handleAddItem = () => {
    setFormData({
      itemName: '',
      category: '',
      quantity: '',
      unitPrice: '',
      minStockLevel: '',
      supplier: '',
      supplierContact: '',
      location: '',
      notes: ''
    });
    setViewMode('add');
    setError(null);
    setSuccess(null);
  };

  const handleEditItem = (item: StockItem) => {
    setFormData({
      itemName: item.itemName,
      category: item.category || '',
      quantity: item.quantity.toString(),
      unitPrice: item.unitPrice?.toString() || '',
      minStockLevel: item.minStockLevel.toString(),
      supplier: item.supplier || '',
      supplierContact: item.supplierContact || '',
      location: item.location || '',
      notes: item.notes || ''
    });
    setSelectedItem(item);
    setViewMode('edit');
    setError(null);
    setSuccess(null);
  };

  const handleRestockItem = (item: StockItem) => {
    setRestockData({
      quantity: '',
      unitPrice: item.unitPrice?.toString() || '',
      supplier: item.supplier || '',
      notes: '',
      reference: ''
    });
    setSelectedItem(item);
    setViewMode('restock');
    setError(null);
    setSuccess(null);
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedItem(null);
    setStockMovements([]);
    setError(null);
    setSuccess(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);

      const url = viewMode === 'add' 
        ? '/api/admin/inventory'
        : `/api/admin/inventory/${selectedItem?.id}`;
      
      const method = viewMode === 'add' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${viewMode === 'add' ? 'create' : 'update'} item`);
      }

      setSuccess(`Item ${viewMode === 'add' ? 'added' : 'updated'} successfully!`);
      setTimeout(() => {
        handleBackToList();
        fetchInventory();
        fetchInventoryStats();
      }, 1500);
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(`Failed to ${viewMode === 'add' ? 'add' : 'update'} item. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch(`/api/admin/inventory/${selectedItem?.id}/restock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(restockData),
      });

      if (!response.ok) {
        throw new Error('Failed to restock item');
      }

      setSuccess('Item restocked successfully!');
      setTimeout(() => {
        handleBackToList();
        fetchInventory();
        fetchInventoryStats();
      }, 1500);
    } catch (err) {
      console.error('Error restocking item:', err);
      setError('Failed to restock item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStockStatus = (item: StockItem) => {
    if (item.quantity === 0) {
      return { text: 'Out of Stock', color: 'bg-red-500/20 text-red-400 border border-red-500/30', level: 'critical' };
    } else if (item.quantity <= item.minStockLevel) {
      return { text: 'Low Stock', color: 'bg-orange-500/20 text-orange-400 border border-orange-500/30', level: 'warning' };
    } else if (item.quantity <= item.minStockLevel * 1.5) {
      return { text: 'Adequate', color: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30', level: 'adequate' };
    } else {
      return { text: 'In Stock', color: 'bg-green-500/20 text-green-400 border border-green-500/30', level: 'good' };
    }
  };

  const getCategoryOptions = () => {
    const categories = [...new Set(stockItems.map(item => item.category).filter(Boolean))] as string[];
    return categories;
  };

  const lowStockItems = stockItems.filter(item => item.quantity > 0 && item.quantity <= item.minStockLevel);
  const outOfStockItems = stockItems.filter(item => item.quantity === 0);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // ... (Rest of the component remains the same, but replace mock data with real data)

  // The JSX structure remains largely the same, but we'll update the data display parts
  // For brevity, I'll show the key changes:

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {success && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-green-400">
          <div className="flex items-center justify-between">
            <span>{success}</span>
            <button onClick={() => setSuccess(null)} className="text-green-400 hover:text-green-300">
              ×
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
              ×
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Inventory Management</h2>
          <p className="text-gray-400">Manage workshop stock and supplies</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleAddItem}
            className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105"
          >
            ➕ Add Item
          </button>
          <button className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors border border-gray-700">
            📊 Stock Report
          </button>
        </div>
      </div>

      {/* Alerts */}
      {(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {outOfStockItems.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-red-400 font-semibold flex items-center">
                    <span className="mr-2">🚨</span>
                    Out of Stock Items
                  </h3>
                  <p className="text-red-400/80 text-sm">{outOfStockItems.length} items need immediate restocking</p>
                </div>
                <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm font-bold">
                  {outOfStockItems.length}
                </span>
              </div>
            </div>
          )}
          {lowStockItems.length > 0 && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-orange-400 font-semibold flex items-center">
                    <span className="mr-2">⚠️</span>
                    Low Stock Items
                  </h3>
                  <p className="text-orange-400/80 text-sm">{lowStockItems.length} items below minimum stock level</p>
                </div>
                <span className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-sm font-bold">
                  {lowStockItems.length}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search items by name, category, or supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
            />
            <span className="absolute right-3 top-3 text-gray-400">🔍</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
          >
            <option value="all">All Categories</option>
            {inventoryStats.categories.map(category => (
              <option key={category.name} value={category.name}>
                {category.name} ({category.count})
              </option>
            ))}
          </select>
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-3 rounded-xl font-medium transition-colors ${
              activeFilter === 'all'
                ? 'bg-amber-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveFilter('low_stock')}
            className={`px-4 py-3 rounded-xl font-medium transition-colors ${
              activeFilter === 'low_stock'
                ? 'bg-amber-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Low Stock
          </button>
          <button
            onClick={() => setActiveFilter('out_of_stock')}
            className={`px-4 py-3 rounded-xl font-medium transition-colors ${
              activeFilter === 'out_of_stock'
                ? 'bg-amber-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Out of Stock
          </button>
        </div>
      </div>

      {/* Inventory List */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            <p className="text-gray-400 mt-2">Loading inventory...</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {stockItems.map((item) => {
              const status = getStockStatus(item);
              const itemValue = item.quantity * (item.unitPrice || 0);
              
              return (
                <div
                  key={item.id}
                  className="p-4 hover:bg-gray-800/30 transition-colors cursor-pointer group"
                  onClick={() => handleViewItem(item)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        status.level === 'critical' ? 'bg-red-500/20' :
                        status.level === 'warning' ? 'bg-orange-500/20' :
                        'bg-green-500/20'
                      }`}>
                        <span className={`text-lg ${
                          status.level === 'critical' ? 'text-red-400' :
                          status.level === 'warning' ? 'text-orange-400' :
                          'text-green-400'
                        }`}>
                          📦
                        </span>
                      </div>
                      <div>
                        <h3 className="text-white font-semibold group-hover:text-amber-400 transition-colors">
                          {item.itemName}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {item.category || 'Uncategorized'} • {item.location || 'No location'}
                        </p>
                        <p className="text-gray-400 text-sm">{item.supplier || 'No supplier'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <p className="text-white font-bold">{item.quantity}</p>
                            <p className="text-gray-400 text-xs">In Stock</p>
                          </div>
                          <div className="text-center">
                            <p className="text-white font-bold">RM {(item.unitPrice || 0).toFixed(2)}</p>
                            <p className="text-gray-400 text-xs">Unit Price</p>
                          </div>
                          <div className="text-center">
                            <p className="text-white font-bold">RM {itemValue.toFixed(2)}</p>
                            <p className="text-gray-400 text-xs">Total Value</p>
                          </div>
                        </div>
                        <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs ${status.color}`}>
                          {status.text}
                        </span>
                      </div>
                      <div className="text-gray-400 group-hover:text-amber-400 transition-colors">→</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!isLoading && stockItems.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-400">No inventory items found matching your search.</p>
          </div>
        )}
      </div>

      {/* Inventory Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{inventoryStats.totalItems}</p>
          <p className="text-gray-400 text-sm">Total Items</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{inventoryStats.lowStockItems}</p>
          <p className="text-gray-400 text-sm">Low Stock</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{inventoryStats.outOfStockItems}</p>
          <p className="text-gray-400 text-sm">Out of Stock</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">RM {inventoryStats.totalInventoryValue.toFixed(2)}</p>
          <p className="text-gray-400 text-sm">Total Value</p>
        </div>
      </div>

      {/* The details, add, edit, and restock views remain largely the same */}
      {/* but they now use the real data from the API calls */}
      {/* ... */}
    </div>
  );
};

export default InventoryManagement;