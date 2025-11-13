'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface StockItem {
  id: number;
  itemName: string;
  category: string;
  quantity: number;
  unitPrice: number;
  minStockLevel: number;
  supplier: string;
  supplierContact: string;
  lastRestocked: string;
  location: string;
  notes?: string;
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

const InventoryManagement: React.FC = () => {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'details' | 'add' | 'edit' | 'restock'>('list');
  const [activeFilter, setActiveFilter] = useState<'all' | 'low_stock' | 'out_of_stock' | 'need_reorder'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

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
    notes: ''
  });

  // Simulated data fetch
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        const mockStockItems: StockItem[] = [
          {
            id: 1,
            itemName: 'Engine Oil 5W-30 Synthetic',
            category: 'Lubricants',
            quantity: 8,
            unitPrice: 45.00,
            minStockLevel: 10,
            supplier: 'Shell Malaysia',
            supplierContact: '+603-1234-5678',
            lastRestocked: '2024-01-10',
            location: 'Shelf A1',
            notes: 'Fully synthetic, 4L bottles'
          },
          {
            id: 2,
            itemName: 'Brake Pads Front Set',
            category: 'Brakes',
            quantity: 3,
            unitPrice: 120.00,
            minStockLevel: 5,
            supplier: 'Brembo Auto Parts',
            supplierContact: '+603-2345-6789',
            lastRestocked: '2024-01-12',
            location: 'Shelf B2',
            notes: 'Suitable for most Japanese cars'
          },
          {
            id: 3,
            itemName: 'Air Filter',
            category: 'Filters',
            quantity: 15,
            unitPrice: 35.00,
            minStockLevel: 8,
            supplier: 'Mann Filter',
            supplierContact: '+603-3456-7890',
            lastRestocked: '2024-01-08',
            location: 'Shelf C3'
          },
          {
            id: 4,
            itemName: 'Spark Plugs Iridium',
            category: 'Ignition',
            quantity: 0,
            unitPrice: 25.00,
            minStockLevel: 12,
            supplier: 'NGK Malaysia',
            supplierContact: '+603-4567-8901',
            lastRestocked: '2023-12-20',
            location: 'Shelf D4',
            notes: 'OUT OF STOCK - Urgent reorder needed'
          },
          {
            id: 5,
            itemName: 'Coolant Concentrate',
            category: 'Cooling',
            quantity: 5,
            unitPrice: 28.50,
            minStockLevel: 6,
            supplier: 'Prestone Distributor',
            supplierContact: '+603-5678-9012',
            lastRestocked: '2024-01-05',
            location: 'Shelf A2'
          },
          {
            id: 6,
            itemName: 'Windshield Wiper Blades',
            category: 'Accessories',
            quantity: 22,
            unitPrice: 45.00,
            minStockLevel: 10,
            supplier: 'Bosch Auto Parts',
            supplierContact: '+603-6789-0123',
            lastRestocked: '2024-01-15',
            location: 'Shelf E1'
          },
          {
            id: 7,
            itemName: 'Transmission Fluid',
            category: 'Lubricants',
            quantity: 2,
            unitPrice: 65.00,
            minStockLevel: 8,
            supplier: 'Shell Malaysia',
            supplierContact: '+603-1234-5678',
            lastRestocked: '2023-12-28',
            location: 'Shelf A3',
            notes: 'Low stock - reorder soon'
          },
          {
            id: 8,
            itemName: 'Brake Fluid DOT 4',
            category: 'Brakes',
            quantity: 18,
            unitPrice: 22.00,
            minStockLevel: 12,
            supplier: 'Brembo Auto Parts',
            supplierContact: '+603-2345-6789',
            lastRestocked: '2024-01-18',
            location: 'Shelf B1'
          }
        ];

        setStockItems(mockStockItems);
        setIsLoading(false);
      }, 1000);
    };

    fetchData();
  }, []);

  const fetchStockMovements = async (itemId: number) => {
    setIsLoading(true);
    
    // Simulate API call for stock movements
    setTimeout(() => {
      const mockMovements: StockMovement[] = [
        {
          id: 1,
          stockItemId: itemId,
          type: 'in',
          quantity: 20,
          reason: 'Initial stock',
          date: '2024-01-10',
          performedBy: 'Admin User',
          reference: 'PO-001'
        },
        {
          id: 2,
          stockItemId: itemId,
          type: 'out',
          quantity: 5,
          reason: 'Service job #1234',
          date: '2024-01-12',
          performedBy: 'Ali Mechanic',
          reference: 'SVC-1234'
        },
        {
          id: 3,
          stockItemId: itemId,
          type: 'out',
          quantity: 7,
          reason: 'Service job #1245',
          date: '2024-01-14',
          performedBy: 'Rajesh Mechanic',
          reference: 'SVC-1245'
        },
        {
          id: 4,
          stockItemId: itemId,
          type: 'in',
          quantity: 15,
          reason: 'Restock order',
          date: '2024-01-18',
          performedBy: 'Admin User',
          reference: 'PO-002'
        }
      ];

      setStockMovements(mockMovements);
      setIsLoading(false);
    }, 500);
  };

  const handleViewItem = (item: StockItem) => {
    setSelectedItem(item);
    setViewMode('details');
    fetchStockMovements(item.id);
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
  };

  const handleEditItem = (item: StockItem) => {
    setFormData({
      itemName: item.itemName,
      category: item.category,
      quantity: item.quantity.toString(),
      unitPrice: item.unitPrice.toString(),
      minStockLevel: item.minStockLevel.toString(),
      supplier: item.supplier,
      supplierContact: item.supplierContact,
      location: item.location,
      notes: item.notes || ''
    });
    setSelectedItem(item);
    setViewMode('edit');
  };

  const handleRestockItem = (item: StockItem) => {
    setRestockData({
      quantity: '',
      unitPrice: item.unitPrice.toString(),
      supplier: item.supplier,
      notes: ''
    });
    setSelectedItem(item);
    setViewMode('restock');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedItem(null);
    setStockMovements([]);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form data:', formData);
    // Simulate API call
    setTimeout(() => {
      setViewMode('list');
    }, 1000);
  };

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle restock submission here
    console.log('Restock data:', restockData);
    // Simulate API call
    setTimeout(() => {
      setViewMode('list');
    }, 1000);
  };

  const getStockStatus = (item: StockItem) => {
    if (item.quantity === 0) {
      return { text: 'Out of Stock', color: 'bg-red-500/20 text-red-400', level: 'critical' };
    } else if (item.quantity <= item.minStockLevel) {
      return { text: 'Low Stock', color: 'bg-orange-500/20 text-orange-400', level: 'warning' };
    } else if (item.quantity <= item.minStockLevel * 1.5) {
      return { text: 'Adequate', color: 'bg-yellow-500/20 text-yellow-400', level: 'adequate' };
    } else {
      return { text: 'In Stock', color: 'bg-green-500/20 text-green-400', level: 'good' };
    }
  };

  const getCategoryOptions = () => {
    const categories = [...new Set(stockItems.map(item => item.category))];
    return categories;
  };

  const filteredItems = stockItems.filter(item => {
    const matchesSearch = 
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      activeFilter === 'all' ||
      (activeFilter === 'low_stock' && item.quantity > 0 && item.quantity <= item.minStockLevel) ||
      (activeFilter === 'out_of_stock' && item.quantity === 0) ||
      (activeFilter === 'need_reorder' && item.quantity <= item.minStockLevel);
    
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;

    return matchesSearch && matchesFilter && matchesCategory;
  });

  const lowStockItems = stockItems.filter(item => item.quantity <= item.minStockLevel);
  const outOfStockItems = stockItems.filter(item => item.quantity === 0);
  const totalInventoryValue = stockItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  if (viewMode === 'details' && selectedItem) {
    const status = getStockStatus(selectedItem);
    
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackToList}
              className="p-2 text-gray-400 hover:text-amber-400 transition-colors rounded-lg hover:bg-gray-800/50"
            >
              <span className="text-lg">←</span>
            </button>
            <div>
              <h2 className="text-2xl font-bold text-white">{selectedItem.itemName}</h2>
              <p className="text-gray-400">{selectedItem.category}</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => handleEditItem(selectedItem)}
              className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors border border-gray-700"
            >
              ✏️ Edit
            </button>
            <button 
              onClick={() => handleRestockItem(selectedItem)}
              className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105"
            >
              📦 Restock
            </button>
          </div>
        </div>

        {/* Item Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Current Stock</p>
            <p className="text-2xl font-bold text-white">{selectedItem.quantity}</p>
            <p className="text-gray-400 text-xs">Min: {selectedItem.minStockLevel}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Unit Price</p>
            <p className="text-2xl font-bold text-white">RM {selectedItem.unitPrice.toFixed(2)}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Stock Value</p>
            <p className="text-2xl font-bold text-white">RM {(selectedItem.quantity * selectedItem.unitPrice).toFixed(2)}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Status</p>
            <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs ${status.color}`}>
              {status.text}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Item Details */}
          <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-5">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <span className="mr-2">📋</span>
              Item Details
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-gray-400 text-sm">Category</p>
                <p className="text-white">{selectedItem.category}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Location</p>
                <p className="text-white">{selectedItem.location}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Last Restocked</p>
                <p className="text-white">{new Date(selectedItem.lastRestocked).toLocaleDateString()}</p>
              </div>
              {selectedItem.notes && (
                <div>
                  <p className="text-gray-400 text-sm">Notes</p>
                  <p className="text-white">{selectedItem.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Supplier Information */}
          <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-5">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <span className="mr-2">🏢</span>
              Supplier Information
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-gray-400 text-sm">Supplier</p>
                <p className="text-white">{selectedItem.supplier}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Contact</p>
                <p className="text-white">{selectedItem.supplierContact}</p>
              </div>
              <div className="pt-3">
                <button className="bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 px-4 py-2 rounded-lg font-medium transition-colors border border-amber-500/30">
                  📞 Contact Supplier
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stock Movement History */}
        <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-5">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <span className="mr-2">📊</span>
            Stock Movement History
          </h3>
          <div className="space-y-3">
            {stockMovements.map(movement => (
              <div key={movement.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-3">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                        movement.type === 'in' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {movement.type === 'in' ? 'IN' : 'OUT'}
                      </span>
                      <p className="text-white font-medium">{movement.reason}</p>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">
                      By {movement.performedBy} • {new Date(movement.date).toLocaleDateString()}
                    </p>
                    {movement.reference && (
                      <p className="text-gray-400 text-xs mt-1">Ref: {movement.reference}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      movement.type === 'in' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {movement.type === 'in' ? '+' : '-'}{movement.quantity}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'add' || viewMode === 'edit') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackToList}
              className="p-2 text-gray-400 hover:text-amber-400 transition-colors rounded-lg hover:bg-gray-800/50"
            >
              <span className="text-lg">←</span>
            </button>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {viewMode === 'add' ? 'Add New Stock Item' : 'Edit Stock Item'}
              </h2>
              <p className="text-gray-400">
                {viewMode === 'add' ? 'Add a new item to inventory' : `Editing ${selectedItem?.itemName}`}
              </p>
            </div>
          </div>
        </div>

        {/* Item Form */}
        <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.itemName}
                  onChange={(e) => setFormData(prev => ({ ...prev, itemName: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  placeholder="Enter item name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                >
                  <option value="">Select Category</option>
                  <option value="Lubricants">Lubricants</option>
                  <option value="Brakes">Brakes</option>
                  <option value="Filters">Filters</option>
                  <option value="Ignition">Ignition</option>
                  <option value="Cooling">Cooling</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Suspension">Suspension</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  required
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  placeholder="Enter quantity"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Unit Price (RM) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.unitPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, unitPrice: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  placeholder="Enter unit price"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Minimum Stock Level *
                </label>
                <input
                  type="number"
                  required
                  value={formData.minStockLevel}
                  onChange={(e) => setFormData(prev => ({ ...prev, minStockLevel: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  placeholder="Enter minimum stock level"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  placeholder="Enter storage location"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Supplier *
                </label>
                <input
                  type="text"
                  required
                  value={formData.supplier}
                  onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  placeholder="Enter supplier name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Supplier Contact
                </label>
                <input
                  type="text"
                  value={formData.supplierContact}
                  onChange={(e) => setFormData(prev => ({ ...prev, supplierContact: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  placeholder="Enter supplier contact"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                placeholder="Enter any additional notes..."
              />
            </div>

            {/* Form Actions */}
            <div className="flex space-x-4 pt-6 border-t border-gray-800">
              <button
                type="button"
                onClick={handleBackToList}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors border border-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white rounded-xl font-medium transition-all transform hover:scale-105"
              >
                {viewMode === 'add' ? 'Add Item' : 'Update Item'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (viewMode === 'restock' && selectedItem) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackToList}
              className="p-2 text-gray-400 hover:text-amber-400 transition-colors rounded-lg hover:bg-gray-800/50"
            >
              <span className="text-lg">←</span>
            </button>
            <div>
              <h2 className="text-2xl font-bold text-white">Restock Item</h2>
              <p className="text-gray-400">Add stock for {selectedItem.itemName}</p>
            </div>
          </div>
        </div>

        {/* Restock Form */}
        <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
          <form onSubmit={handleRestockSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Quantity to Add *
                </label>
                <input
                  type="number"
                  required
                  value={restockData.quantity}
                  onChange={(e) => setRestockData(prev => ({ ...prev, quantity: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  placeholder="Enter quantity"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Unit Price (RM) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={restockData.unitPrice}
                  onChange={(e) => setRestockData(prev => ({ ...prev, unitPrice: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  placeholder="Enter unit price"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Supplier *
                </label>
                <input
                  type="text"
                  required
                  value={restockData.supplier}
                  onChange={(e) => setRestockData(prev => ({ ...prev, supplier: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  placeholder="Enter supplier name"
                />
              </div>

              <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/20">
                <p className="text-amber-400 text-sm font-medium">Current Stock</p>
                <p className="text-white text-2xl font-bold">{selectedItem.quantity}</p>
                <p className="text-gray-400 text-xs">Will become: {selectedItem.quantity + parseInt(restockData.quantity || '0')}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Restock Notes
              </label>
              <textarea
                value={restockData.notes}
                onChange={(e) => setRestockData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                placeholder="Enter restock notes or purchase order reference..."
              />
            </div>

            {/* Form Actions */}
            <div className="flex space-x-4 pt-6 border-t border-gray-800">
              <button
                type="button"
                onClick={handleBackToList}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors border border-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white rounded-xl font-medium transition-all transform hover:scale-105"
              >
                📦 Confirm Restock
              </button>
            </div>
          </form>
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
            {getCategoryOptions().map(category => (
              <option key={category} value={category}>{category}</option>
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
            {filteredItems.map((item) => {
              const status = getStockStatus(item);
              return (
                <div
                  key={item.id}
                  className="p-4 hover:bg-gray-800/30 transition-colors cursor-pointer"
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
                        <h3 className="text-white font-semibold">{item.itemName}</h3>
                        <p className="text-gray-400 text-sm">{item.category} • {item.location}</p>
                        <p className="text-gray-400 text-sm">{item.supplier}</p>
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
                            <p className="text-white font-bold">RM {item.unitPrice.toFixed(2)}</p>
                            <p className="text-gray-400 text-xs">Unit Price</p>
                          </div>
                          <div className="text-center">
                            <p className="text-white font-bold">RM {(item.quantity * item.unitPrice).toFixed(2)}</p>
                            <p className="text-gray-400 text-xs">Total Value</p>
                          </div>
                        </div>
                        <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs ${status.color}`}>
                          {status.text}
                        </span>
                      </div>
                      <div className="text-gray-400">→</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!isLoading && filteredItems.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-400">No inventory items found matching your search.</p>
          </div>
        )}
      </div>

      {/* Inventory Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{stockItems.length}</p>
          <p className="text-gray-400 text-sm">Total Items</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{lowStockItems.length}</p>
          <p className="text-gray-400 text-sm">Low Stock</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{outOfStockItems.length}</p>
          <p className="text-gray-400 text-sm">Out of Stock</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">RM {totalInventoryValue.toFixed(2)}</p>
          <p className="text-gray-400 text-sm">Total Value</p>
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement;