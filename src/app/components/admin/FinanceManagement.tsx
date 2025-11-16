// src/components/admin/FinanceManagement.tsx
'use client';
import { useState, useEffect } from 'react';

interface FinanceOverview {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  revenueGrowth: number;
  profitMargin: number;
  revenueByService: Array<{ name: string; revenue: number; percentage: number }>;
  monthlyRevenue: Array<{ month: string; revenue: number; year: number }>;
  topRevenueSources: Array<{ name: string; revenue: number }>;
  period: {
    start: string;
    end: string;
    type: string;
  };
}

interface FinancialRecord {
  id: number;
  amount: number;
  category: string;
  date: string;
  notes: string;
  createdBy: string;
  createdAt: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const FinanceManagement: React.FC = () => {
  const [overview, setOverview] = useState<FinanceOverview | null>(null);
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'records' | 'add'>('overview');
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    amount: '',
    category: 'revenue',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // Fetch finance overview
  const fetchFinanceOverview = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/finance/overview?period=${period}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch finance overview');
      }

      const data = await response.json();
      setOverview(data);
    } catch (err) {
      console.error('Error fetching finance overview:', err);
      setError('Failed to load finance data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch financial records
  const fetchFinancialRecords = async (page: number = 1) => {
    try {
      setIsLoadingRecords(true);
      setError(null);

      const response = await fetch(`/api/admin/finance/records?page=${page}&limit=10`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch financial records');
      }

      const data = await response.json();
      setRecords(data.records);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching financial records:', err);
      setError('Failed to load financial records. Please try again.');
    } finally {
      setIsLoadingRecords(false);
    }
  };

  // Add new financial record
  const addFinancialRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/admin/finance/records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to add financial record');
      }

      setSuccess('Financial record added successfully!');
      setFormData({
        amount: '',
        category: 'revenue',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      
      // Refresh data
      fetchFinanceOverview();
      fetchFinancialRecords();
      setActiveTab('records');
    } catch (err) {
      console.error('Error adding financial record:', err);
      setError('Failed to add financial record. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchFinanceOverview();
    fetchFinancialRecords();
  }, [period]);

  const StatCard = ({ title, value, change, subtitle, color, icon }: any) => (
    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-amber-500/30 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-2">{title}</p>
          <p className="text-3xl font-bold text-white mb-1">{value}</p>
          {change && (
            <p className={`text-sm ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {change > 0 ? '↗' : '↘'} {Math.abs(change).toFixed(1)}%
            </p>
          )}
          {subtitle && <p className="text-gray-400 text-xs mt-1">{subtitle}</p>}
        </div>
        <div className={`text-3xl p-3 rounded-xl bg-gray-700/50 ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const RevenueChart = () => {
    if (!overview?.monthlyRevenue.length) return null;

    const maxRevenue = Math.max(...overview.monthlyRevenue.map(m => m.revenue));
    
    return (
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Revenue Trend</h3>
        <div className="space-y-3">
          {overview.monthlyRevenue.map((month) => (
            <div key={month.month} className="flex items-center justify-between">
              <span className="text-gray-400 text-sm w-12">{month.month}</span>
              <div className="flex-1 mx-4">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-full h-3 transition-all duration-500"
                  style={{ 
                    width: `${maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0}%` 
                  }}
                ></div>
              </div>
              <span className="text-white text-sm font-medium w-20 text-right">
                RM {month.revenue.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const TopRevenueSources = () => {
    if (!overview?.topRevenueSources.length) return null;

    return (
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Top Revenue Sources</h3>
        <div className="space-y-3">
          {overview.topRevenueSources.map((source, index) => (
            <div key={source.name} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-amber-400 text-sm font-bold">{index + 1}</span>
                </div>
                <span className="text-white text-sm">{source.name}</span>
              </div>
              <span className="text-green-400 font-semibold">
                RM {source.revenue.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const FinancialRecordsTable = () => (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white">Financial Records</h3>
        <p className="text-gray-400 text-sm">All income and expense transactions</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left p-4 text-gray-400 text-sm font-medium">Date</th>
              <th className="text-left p-4 text-gray-400 text-sm font-medium">Category</th>
              <th className="text-left p-4 text-gray-400 text-sm font-medium">Amount</th>
              <th className="text-left p-4 text-gray-400 text-sm font-medium">Notes</th>
              <th className="text-left p-4 text-gray-400 text-sm font-medium">Created By</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id} className="border-b border-gray-800 hover:bg-gray-700/30 transition-colors">
                <td className="p-4 text-white text-sm">
                  {new Date(record.date).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                    record.category === 'revenue' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {record.category}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`font-semibold ${
                    record.category === 'revenue' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {record.category === 'revenue' ? '+' : '-'}RM {Math.abs(record.amount).toLocaleString()}
                  </span>
                </td>
                <td className="p-4 text-gray-400 text-sm">{record.notes}</td>
                <td className="p-4 text-gray-400 text-sm">{record.createdBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="p-4 border-t border-gray-700 flex justify-between items-center">
          <span className="text-gray-400 text-sm">
            Showing {records.length} of {pagination.totalRecords} records
          </span>
          <div className="flex space-x-2">
            <button
              onClick={() => fetchFinancialRecords(pagination.currentPage - 1)}
              disabled={!pagination.hasPrev}
              className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-gray-400">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              onClick={() => fetchFinancialRecords(pagination.currentPage + 1)}
              disabled={!pagination.hasNext}
              className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const AddRecordForm = () => (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Add Financial Record</h3>
      <form onSubmit={addFinancialRecord} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Amount (RM)
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
              placeholder="Enter amount"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
            >
              <option value="revenue">Revenue</option>
              <option value="expense">Expense</option>
              <option value="salary">Salary</option>
              <option value="supplies">Supplies</option>
              <option value="maintenance">Maintenance</option>
              <option value="utilities">Utilities</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Date
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
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
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
            placeholder="Enter description or notes for this transaction..."
          />
        </div>

        <div className="flex space-x-4 pt-4">
          <button
            type="button"
            onClick={() => setActiveTab('records')}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-medium transition-all transform hover:scale-105 disabled:opacity-50"
          >
            {isLoading ? 'Adding...' : 'Add Record'}
          </button>
        </div>
      </form>
    </div>
  );

  if (isLoading && !overview) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Finance Management</h2>
            <p className="text-gray-400">Loading financial data...</p>
          </div>
        </div>
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            <p className="text-gray-400 mt-4">Loading financial overview...</p>
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
          <h2 className="text-2xl font-bold text-white">Finance Management</h2>
          <p className="text-gray-400">Monitor revenue, expenses, and financial performance</p>
        </div>
        <div className="flex gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button
            onClick={() => setActiveTab('add')}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105"
          >
            + Add Record
          </button>
        </div>
      </div>

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

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-800/50 rounded-xl p-1 border border-gray-700">
        {[
          { id: 'overview', name: '📊 Overview', icon: '📊' },
          { id: 'records', name: '📋 Records', icon: '📋' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-3 px-4 rounded-lg transition-all duration-300 text-sm font-medium ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <span className="hidden sm:inline">{tab.icon} </span>
            {tab.name.replace(/[^\w\s]/g, '')}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && overview && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Revenue"
              value={`RM ${overview.totalRevenue.toLocaleString()}`}
              change={overview.revenueGrowth}
              subtitle={`vs previous ${period}`}
              icon="💰"
              color="text-green-400"
            />
            <StatCard
              title="Total Expenses"
              value={`RM ${overview.totalExpenses.toLocaleString()}`}
              change={-5.2}
              subtitle="Operating costs"
              icon="📤"
              color="text-red-400"
            />
            <StatCard
              title="Net Profit"
              value={`RM ${overview.netProfit.toLocaleString()}`}
              change={8.2}
              subtitle={`${overview.profitMargin.toFixed(1)}% margin`}
              icon="📈"
              color="text-emerald-400"
            />
            <StatCard
              title="Profit Margin"
              value={`${overview.profitMargin.toFixed(1)}%`}
              change={2.1}
              subtitle="Net profit percentage"
              icon="⚡"
              color="text-blue-400"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RevenueChart />
            <TopRevenueSources />
          </div>
        </div>
      )}

      {/* Records Tab */}
      {activeTab === 'records' && (
        <div className="space-y-6">
          <FinancialRecordsTable />
        </div>
      )}

      {/* Add Record Tab */}
      {activeTab === 'add' && (
        <div className="space-y-6">
          <AddRecordForm />
        </div>
      )}
    </div>
  );
};

export default FinanceManagement;