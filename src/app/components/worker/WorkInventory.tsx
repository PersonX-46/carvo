'use client';
import { useState, useEffect } from 'react';

interface InventoryItem {
  id: number;
  itemName: string;
  category: string;
  quantity: number;
  unitPrice: number;
  minStockLevel: number;
  supplier: string;
  supplierContact: string;
  location: string;
  notes?: string;
  lastRestocked: string;
  updatedAt: string;
}

interface StockMovement {
  id: number;
  stockItemId: number;
  type: 'in' | 'out';
  quantity: number;
  reason: string;
  date: string;
  performedBy: string;
  reference?: string;
}

interface PartsRequest {
  id: number;
  itemName: string;
  category: string;
  quantity: number;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'approved' | 'rejected' | 'ordered' | 'received';
  requestedBy: string;
  requestedDate: string;
  expectedDate?: string;
  notes?: string;
}

const WorkerInventory: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [partsRequests, setPartsRequests] = useState<PartsRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'items' | 'movements' | 'requests'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isRequestingParts, setIsRequestingParts] = useState(false);
  const [newRequest, setNewRequest] = useState({
    itemName: '',
    category: '',
    quantity: 1,
    urgency: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    notes: ''
  });

  // Simulated data fetch
  useEffect(() => {
    const fetchInventoryData = async () => {
      setIsLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        const mockInventory: InventoryItem[] = [
          {
            id: 1,
            itemName: 'Engine Oil 5W-30',
            category: 'Lubricants',
            quantity: 45,
            unitPrice: 28.50,
            minStockLevel: 20,
            supplier: 'Petronas Lubricants',
            supplierContact: '03-2345 6789',
            location: 'Shelf A1',
            notes: 'Fully synthetic, suitable for most vehicles',
            lastRestocked: '2024-01-10',
            updatedAt: '2024-01-15'
          },
          {
            id: 2,
            itemName: 'Brake Pads (Front)',
            category: 'Brake Systems',
            quantity: 12,
            unitPrice: 85.00,
            minStockLevel: 10,
            supplier: 'Brembo Malaysia',
            supplierContact: '03-3456 7890',
            location: 'Shelf B2',
            notes: 'Ceramic brake pads for sedans and SUVs',
            lastRestocked: '2024-01-12',
            updatedAt: '2024-01-16'
          },
          {
            id: 3,
            itemName: 'Air Filter',
            category: 'Filters',
            quantity: 8,
            unitPrice: 35.00,
            minStockLevel: 15,
            supplier: 'K&N Filters',
            supplierContact: '03-4567 8901',
            location: 'Shelf C3',
            lastRestocked: '2024-01-08',
            updatedAt: '2024-01-14'
          },
          {
            id: 4,
            itemName: 'Spark Plugs',
            category: 'Ignition',
            quantity: 25,
            unitPrice: 18.00,
            minStockLevel: 30,
            supplier: 'NGK Spark Plugs',
            supplierContact: '03-5678 9012',
            location: 'Shelf D4',
            notes: 'Iridium tipped, long life',
            lastRestocked: '2024-01-05',
            updatedAt: '2024-01-15'
          },
          {
            id: 5,
            itemName: 'AC Compressor',
            category: 'AC Systems',
            quantity: 3,
            unitPrice: 450.00,
            minStockLevel: 2,
            supplier: 'Denso Malaysia',
            supplierContact: '03-6789 0123',
            location: 'Storage Room',
            lastRestocked: '2024-01-02',
            updatedAt: '2024-01-10'
          },
          {
            id: 6,
            itemName: 'Transmission Fluid',
            category: 'Lubricants',
            quantity: 18,
            unitPrice: 42.00,
            minStockLevel: 12,
            supplier: 'Castrol Malaysia',
            supplierContact: '03-7890 1234',
            location: 'Shelf A2',
            lastRestocked: '2024-01-14',
            updatedAt: '2024-01-16'
          },
          {
            id: 7,
            itemName: 'Battery 12V 60Ah',
            category: 'Electrical',
            quantity: 5,
            unitPrice: 280.00,
            minStockLevel: 4,
            supplier: 'Varta Batteries',
            supplierContact: '03-8901 2345',
            location: 'Battery Rack',
            notes: 'Maintenance-free, 2-year warranty',
            lastRestocked: '2024-01-11',
            updatedAt: '2024-01-16'
          },
          {
            id: 8,
            itemName: 'Wheel Bearings',
            category: 'Suspension',
            quantity: 15,
            unitPrice: 65.00,
            minStockLevel: 8,
            supplier: 'SKF Malaysia',
            supplierContact: '03-9012 3456',
            location: 'Shelf E5',
            lastRestocked: '2024-01-09',
            updatedAt: '2024-01-13'
          }
        ];

        const mockMovements: StockMovement[] = [
          {
            id: 1,
            stockItemId: 2,
            type: 'out',
            quantity: 2,
            reason: 'Service for Toyota Vios ABC1234',
            date: '2024-01-15T10:30:00',
            performedBy: 'Ali bin Ahmad',
            reference: 'Booking #1001'
          },
          {
            id: 2,
            stockItemId: 1,
            type: 'out',
            quantity: 3,
            reason: 'Regular maintenance',
            date: '2024-01-15T09:15:00',
            performedBy: 'Ali bin Ahmad',
            reference: 'Booking #1002'
          },
          {
            id: 3,
            stockItemId: 3,
            type: 'out',
            quantity: 1,
            reason: 'AC service for Honda City',
            date: '2024-01-14T14:20:00',
            performedBy: 'Ali bin Ahmad',
            reference: 'Booking #1003'
          },
          {
            id: 4,
            stockItemId: 6,
            type: 'in',
            quantity: 24,
            reason: 'Restock from supplier',
            date: '2024-01-14T11:00:00',
            performedBy: 'Inventory Manager',
            reference: 'PO #23456'
          }
        ];

        const mockRequests: PartsRequest[] = [
          {
            id: 1,
            itemName: 'Timing Belt Kit',
            category: 'Engine',
            quantity: 2,
            urgency: 'high',
            status: 'approved',
            requestedBy: 'Ali bin Ahmad',
            requestedDate: '2024-01-15',
            expectedDate: '2024-01-18',
            notes: 'Needed for upcoming Toyota Camry service'
          },
          {
            id: 2,
            itemName: 'Shock Absorbers',
            category: 'Suspension',
            quantity: 4,
            urgency: 'medium',
            status: 'pending',
            requestedBy: 'Ali bin Ahmad',
            requestedDate: '2024-01-14',
            notes: 'For suspension upgrade services'
          },
          {
            id: 3,
            itemName: 'Fuel Pump',
            category: 'Fuel System',
            quantity: 1,
            urgency: 'urgent',
            status: 'ordered',
            requestedBy: 'Ali bin Ahmad',
            requestedDate: '2024-01-13',
            expectedDate: '2024-01-16',
            notes: 'Emergency replacement for customer vehicle'
          }
        ];

        setInventory(mockInventory);
        setStockMovements(mockMovements);
        setPartsRequests(mockRequests);
        setIsLoading(false);
      }, 1500);
    };

    fetchInventoryData();
  }, []);

  const categories = ['all', ...new Set(inventory.map(item => item.category))];

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockItems = inventory.filter(item => item.quantity <= item.minStockLevel);
  const outOfStockItems = inventory.filter(item => item.quantity === 0);
  const totalInventoryValue = inventory.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  const getStockStatusColor = (quantity: number, minStock: number) => {
    if (quantity === 0) return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (quantity <= minStock) return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    return 'bg-green-500/20 text-green-400 border-green-500/30';
  };

  const getStockStatusText = (quantity: number, minStock: number) => {
    if (quantity === 0) return 'Out of Stock';
    if (quantity <= minStock) return 'Low Stock';
    return 'In Stock';
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'ordered': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'received': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const handleRequestParts = () => {
    if (!newRequest.itemName || !newRequest.category) {
      alert('Please fill in all required fields');
      return;
    }

    const request: PartsRequest = {
      id: partsRequests.length + 1,
      itemName: newRequest.itemName,
      category: newRequest.category,
      quantity: newRequest.quantity,
      urgency: newRequest.urgency,
      status: 'pending',
      requestedBy: 'Ali bin Ahmad',
      requestedDate: new Date().toISOString().split('T')[0],
      notes: newRequest.notes
    };

    setPartsRequests(prev => [request, ...prev]);
    setNewRequest({
      itemName: '',
      category: '',
      quantity: 1,
      urgency: 'medium',
      notes: ''
    });
    setIsRequestingParts(false);
    setActiveTab('requests');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Inventory Management</h2>
            <p className="text-gray-400">Access and request spare parts</p>
          </div>
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            <p className="text-gray-400 mt-4">Loading inventory data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Inventory Management</h2>
          <p className="text-gray-400">Access and request spare parts</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => setIsRequestingParts(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl font-semibold transition-all flex items-center space-x-2"
          >
            <span>📦</span>
            <span>Request Parts</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl font-medium transition-colors ${
            activeTab === 'overview'
              ? 'bg-amber-500 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          📊 Overview
        </button>
        <button
          onClick={() => setActiveTab('items')}
          className={`px-4 py-2 rounded-xl font-medium transition-colors ${
            activeTab === 'items'
              ? 'bg-amber-500 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          🔧 Inventory Items
        </button>
        <button
          onClick={() => setActiveTab('movements')}
          className={`px-4 py-2 rounded-xl font-medium transition-colors ${
            activeTab === 'movements'
              ? 'bg-amber-500 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          📈 Stock Movements
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-xl font-medium transition-colors ${
            activeTab === 'requests'
              ? 'bg-amber-500 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          📋 Parts Requests
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-2">Total Items</p>
                  <p className="text-3xl font-bold text-white">{inventory.length}</p>
                </div>
                <div className="text-3xl p-3 rounded-xl bg-gray-700/50 text-blue-400">
                  📦
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-2">Low Stock</p>
                  <p className="text-3xl font-bold text-orange-400">{lowStockItems.length}</p>
                </div>
                <div className="text-3xl p-3 rounded-xl bg-gray-700/50 text-orange-400">
                  ⚠️
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-2">Out of Stock</p>
                  <p className="text-3xl font-bold text-red-400">{outOfStockItems.length}</p>
                </div>
                <div className="text-3xl p-3 rounded-xl bg-gray-700/50 text-red-400">
                  ❌
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-2">Total Value</p>
                  <p className="text-3xl font-bold text-green-400">RM {totalInventoryValue.toLocaleString()}</p>
                </div>
                <div className="text-3xl p-3 rounded-xl bg-gray-700/50 text-green-400">
                  💰
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Low Stock Alert */}
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-6 border border-orange-500/30">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <span className="text-orange-400 mr-3">⚠️</span>
                Low Stock Alerts
              </h3>

              <div className="space-y-3">
                {lowStockItems.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                    <div>
                      <p className="text-white font-medium">{item.itemName}</p>
                      <p className="text-orange-400 text-sm">
                        {item.quantity} left (Min: {item.minStockLevel})
                      </p>
                    </div>
                    <button
                      onClick={() => setIsRequestingParts(true)}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-all"
                    >
                      Request
                    </button>
                  </div>
                ))}
                {lowStockItems.length === 0 && (
                  <p className="text-gray-400 text-center py-4">No low stock items 🎉</p>
                )}
              </div>
            </div>

            {/* Recent Movements */}
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <span className="text-amber-400 mr-3">📈</span>
                Recent Stock Movements
              </h3>

              <div className="space-y-3">
                {stockMovements.slice(0, 5).map((movement) => {
                  const item = inventory.find(i => i.id === movement.stockItemId);
                  return (
                    <div key={movement.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                      <div>
                        <p className="text-white font-medium text-sm">{item?.itemName}</p>
                        <p className="text-gray-400 text-xs">
                          {movement.type === 'in' ? '📥 In' : '📤 Out'} • {movement.quantity} units
                        </p>
                        <p className="text-gray-500 text-xs mt-1">{movement.reason}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 text-xs">{formatDateTime(movement.date)}</p>
                        <p className="text-amber-400 text-xs">{movement.performedBy}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-6 border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
              <span className="text-amber-400 mr-3">⚡</span>
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setActiveTab('items')}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-4 px-6 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg shadow-amber-500/25 flex items-center justify-center space-x-3"
              >
                <span className="text-xl">🔍</span>
                <span>Browse Inventory</span>
              </button>
              <button
                onClick={() => setIsRequestingParts(true)}
                className="bg-gray-700 hover:bg-gray-600 text-white py-4 px-6 rounded-xl font-semibold transition-all border border-gray-600 flex items-center justify-center space-x-3"
              >
                <span className="text-xl">📦</span>
                <span>Request Parts</span>
              </button>
              <button
                onClick={() => setActiveTab('movements')}
                className="bg-gray-700 hover:bg-gray-600 text-white py-4 px-6 rounded-xl font-semibold transition-all border border-gray-600 flex items-center justify-center space-x-3"
              >
                <span className="text-xl">📊</span>
                <span>View History</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Items Tab */}
      {activeTab === 'items' && (
        <div className="space-y-6">
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex flex-wrap gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                <option value="all">All Categories</option>
                {categories.filter(cat => cat !== 'all').map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 min-w-48"
              />
            </div>
          </div>

          {/* Inventory Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInventory.map((item) => (
              <div
                key={item.id}
                className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-6 border border-gray-700/50 hover:border-amber-500/30 transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedItem(item)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-1">{item.itemName}</h3>
                    <p className="text-amber-400 text-sm">{item.category}</p>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStockStatusColor(item.quantity, item.minStockLevel)}`}>
                    {getStockStatusText(item.quantity, item.minStockLevel)}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Quantity</span>
                    <span className="text-white font-medium">{item.quantity} units</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Unit Price</span>
                    <span className="text-green-400 font-medium">RM {item.unitPrice}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Location</span>
                    <span className="text-blue-400 font-medium">{item.location}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Min Stock</span>
                    <span className="text-orange-400 font-medium">{item.minStockLevel} units</span>
                  </div>
                </div>

                {item.notes && (
                  <p className="text-gray-300 text-sm mb-3">
                    {item.notes}
                  </p>
                )}

                <div className="flex justify-between items-center text-xs text-gray-400">
                  <span>Last restocked: {formatDate(item.lastRestocked)}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsRequestingParts(true);
                    }}
                    className="text-amber-400 hover:text-amber-300 font-medium"
                  >
                    Request
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredInventory.length === 0 && (
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-12 border border-gray-700/50 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-white mb-2">No items found</h3>
              <p className="text-gray-400">
                {searchTerm 
                  ? `No items match "${searchTerm}"` 
                  : `No items found in the selected category.`}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Stock Movements Tab */}
      {activeTab === 'movements' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-6 border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
              <span className="text-amber-400 mr-3">📈</span>
              Stock Movement History
            </h3>

            <div className="space-y-4">
              {stockMovements.map((movement) => {
                const item = inventory.find(i => i.id === movement.stockItemId);
                return (
                  <div key={movement.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/30">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        movement.type === 'in' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {movement.type === 'in' ? '📥' : '📤'}
                      </div>
                      <div>
                        <p className="text-white font-medium">{item?.itemName}</p>
                        <p className="text-gray-400 text-sm">{movement.reason}</p>
                        {movement.reference && (
                          <p className="text-amber-400 text-xs">{movement.reference}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        movement.type === 'in' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {movement.type === 'in' ? '+' : '-'}{movement.quantity}
                      </p>
                      <p className="text-gray-400 text-sm">{formatDateTime(movement.date)}</p>
                      <p className="text-blue-400 text-xs">{movement.performedBy}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Parts Requests Tab */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-6 border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
              <span className="text-amber-400 mr-3">📋</span>
              My Parts Requests
            </h3>

            <div className="space-y-4">
              {partsRequests.map((request) => (
                <div key={request.id} className="p-4 bg-gray-700/30 rounded-lg border border-gray-600/30">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-white font-semibold text-lg mb-1">
                            {request.itemName}
                          </h4>
                          <p className="text-amber-400 text-sm">{request.category}</p>
                        </div>
                        <div className="flex gap-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getUrgencyColor(request.urgency)}`}>
                            {request.urgency}
                          </span>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-gray-400 text-sm">Quantity</p>
                          <p className="text-white font-medium">{request.quantity} units</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Requested Date</p>
                          <p className="text-white font-medium">{formatDate(request.requestedDate)}</p>
                        </div>
                        {request.expectedDate && (
                          <div>
                            <p className="text-gray-400 text-sm">Expected Date</p>
                            <p className="text-amber-400 font-medium">{formatDate(request.expectedDate)}</p>
                          </div>
                        )}
                      </div>

                      {request.notes && (
                        <p className="text-gray-300 text-sm">
                          <span className="text-gray-400">Notes:</span> {request.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex lg:flex-col gap-2">
                      <button className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl font-semibold transition-all text-sm whitespace-nowrap">
                        Update Request
                      </button>
                      <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-xl font-semibold transition-all border border-gray-600 text-sm whitespace-nowrap">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {partsRequests.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-4xl mb-2">📋</div>
                  <p>No parts requests yet</p>
                  <p className="text-sm">Start by requesting some parts!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Request Parts Modal */}
      {isRequestingParts && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl border border-amber-500/30 max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold text-white">Request Parts</h3>
                <button
                  onClick={() => setIsRequestingParts(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Item Name *</label>
                  <input
                    type="text"
                    value={newRequest.itemName}
                    onChange={(e) => setNewRequest({...newRequest, itemName: e.target.value})}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                    placeholder="Enter item name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Category *</label>
                    <select
                      value={newRequest.category}
                      onChange={(e) => setNewRequest({...newRequest, category: e.target.value})}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="">Select category</option>
                      {categories.filter(cat => cat !== 'all').map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Quantity</label>
                    <input
                      type="number"
                      value={newRequest.quantity}
                      onChange={(e) => setNewRequest({...newRequest, quantity: parseInt(e.target.value) || 1})}
                      min="1"
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Urgency</label>
                  <select
                    value={newRequest.urgency}
                    onChange={(e) => setNewRequest({...newRequest, urgency: e.target.value as any})}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Notes (Optional)</label>
                  <textarea
                    value={newRequest.notes}
                    onChange={(e) => setNewRequest({...newRequest, notes: e.target.value})}
                    rows={3}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 resize-none"
                    placeholder="Additional information about your request..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-800">
                <button
                  onClick={handleRequestParts}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-3 px-6 rounded-xl font-semibold transition-all"
                >
                  Submit Request
                </button>
                <button
                  onClick={() => setIsRequestingParts(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-xl font-semibold transition-all border border-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Item Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl border border-amber-500/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold text-white">Item Details</h3>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-amber-400 flex items-center">
                      <span className="mr-2">📦</span>
                      Item Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-gray-400 text-sm">Item Name</p>
                        <p className="text-white font-medium">{selectedItem.itemName}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Category</p>
                        <p className="text-white font-medium">{selectedItem.category}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Location</p>
                        <p className="text-white font-medium">{selectedItem.location}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Stock Status</p>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStockStatusColor(selectedItem.quantity, selectedItem.minStockLevel)}`}>
                          {getStockStatusText(selectedItem.quantity, selectedItem.minStockLevel)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-amber-400 flex items-center">
                      <span className="mr-2">💰</span>
                      Pricing & Stock
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-gray-400 text-sm">Current Quantity</p>
                        <p className="text-white font-medium text-2xl">{selectedItem.quantity} units</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Minimum Stock Level</p>
                        <p className="text-orange-400 font-medium">{selectedItem.minStockLevel} units</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Unit Price</p>
                        <p className="text-green-400 font-bold text-xl">RM {selectedItem.unitPrice}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Total Value</p>
                        <p className="text-green-400 font-medium">RM {(selectedItem.quantity * selectedItem.unitPrice).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Supplier Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-amber-400 flex items-center">
                    <span className="mr-2">🏢</span>
                    Supplier Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-gray-400 text-sm">Supplier</p>
                      <p className="text-white font-medium">{selectedItem.supplier}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Contact</p>
                      <p className="text-white font-medium">{selectedItem.supplierContact}</p>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedItem.notes && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-amber-400 flex items-center">
                      <span className="mr-2">📝</span>
                      Additional Notes
                    </h4>
                    <p className="text-white p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                      {selectedItem.notes}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-800">
                  <button
                    onClick={() => {
                      setIsRequestingParts(true);
                      setNewRequest({
                        itemName: selectedItem.itemName,
                        category: selectedItem.category,
                        quantity: 1,
                        urgency: selectedItem.quantity === 0 ? 'urgent' : 'medium',
                        notes: `Requesting ${selectedItem.itemName} from inventory`
                      });
                      setSelectedItem(null);
                    }}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-3 px-6 rounded-xl font-semibold transition-all transform hover:scale-105"
                  >
                    Request This Item
                  </button>
                  <button className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 px-6 rounded-xl font-semibold transition-all border border-gray-700">
                    View Usage History
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerInventory;