'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Report {
  id: number;
  type: 'financial' | 'service' | 'inventory' | 'customer' | 'worker';
  title: string;
  description: string;
  dateRange: string;
  generatedBy: string;
  status: 'completed' | 'generating' | 'failed';
  downloadUrl?: string;
  data: any;
}

interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  revenueGrowth: number;
  mostProfitableServices: Array<{ name: string; revenue: number }>;
  monthlyRevenue: Array<{ month: string; revenue: number }>;
}

interface ServiceAnalytics {
  totalServices: number;
  completedServices: number;
  pendingServices: number;
  averageServiceTime: number;
  popularServices: Array<{ name: string; count: number }>;
  workerPerformance: Array<{ name: string; completed: number; rating: number }>;
}

interface CustomerInsights {
  totalCustomers: number;
  newCustomersThisMonth: number;
  returningCustomers: number;
  customerSatisfaction: number;
  topCustomers: Array<{ name: string; totalSpent: number; services: number }>;
}

const ReportsManagement: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'financial' | 'services' | 'customers' | 'reports'>('overview');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year' | 'custom'>('month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);

  // Analytics data
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [serviceAnalytics, setServiceAnalytics] = useState<ServiceAnalytics | null>(null);
  const [customerInsights, setCustomerInsights] = useState<CustomerInsights | null>(null);

  // Simulated data fetch
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        // Mock reports data
        const mockReports: Report[] = [
          {
            id: 1,
            type: 'financial',
            title: 'Monthly Financial Report - January 2024',
            description: 'Complete financial overview including revenue, expenses, and profit analysis',
            dateRange: '2024-01-01 to 2024-01-31',
            generatedBy: 'Admin User',
            status: 'completed',
            downloadUrl: '/reports/financial-jan-2024.pdf',
            data: {}
          },
          {
            id: 2,
            type: 'service',
            title: 'Service Performance Report',
            description: 'Analysis of service completion rates and worker performance',
            dateRange: '2024-01-01 to 2024-01-31',
            generatedBy: 'Admin User',
            status: 'completed',
            downloadUrl: '/reports/service-jan-2024.pdf',
            data: {}
          },
          {
            id: 3,
            type: 'customer',
            title: 'Customer Insights Report',
            description: 'Customer acquisition, retention, and satisfaction analysis',
            dateRange: '2023-12-01 to 2024-01-31',
            generatedBy: 'Admin User',
            status: 'completed',
            data: {}
          },
          {
            id: 4,
            type: 'inventory',
            title: 'Inventory Valuation Report',
            description: 'Current stock levels and inventory value analysis',
            dateRange: '2024-01-31',
            generatedBy: 'System',
            status: 'completed',
            data: {}
          },
          {
            id: 5,
            type: 'financial',
            title: 'Quarterly Financial Report - Q4 2023',
            description: 'Quarterly financial performance and trend analysis',
            dateRange: '2023-10-01 to 2023-12-31',
            generatedBy: 'Admin User',
            status: 'completed',
            downloadUrl: '/reports/financial-q4-2023.pdf',
            data: {}
          }
        ];

        // Mock analytics data
        const mockFinancialSummary: FinancialSummary = {
          totalRevenue: 45230.50,
          totalExpenses: 28760.25,
          netProfit: 16470.25,
          revenueGrowth: 12.5,
          mostProfitableServices: [
            { name: 'Engine Overhaul', revenue: 12500.00 },
            { name: 'Transmission Repair', revenue: 8900.00 },
            { name: 'Brake System Service', revenue: 6750.50 },
            { name: 'Electrical Diagnostics', revenue: 5430.00 },
            { name: 'AC System Repair', revenue: 4650.00 }
          ],
          monthlyRevenue: [
            { month: 'Aug', revenue: 38500 },
            { month: 'Sep', revenue: 41200 },
            { month: 'Oct', revenue: 39800 },
            { month: 'Nov', revenue: 42500 },
            { month: 'Dec', revenue: 44100 },
            { month: 'Jan', revenue: 45230 }
          ]
        };

        const mockServiceAnalytics: ServiceAnalytics = {
          totalServices: 156,
          completedServices: 142,
          pendingServices: 14,
          averageServiceTime: 2.5,
          popularServices: [
            { name: 'Oil Change', count: 45 },
            { name: 'Brake Service', count: 32 },
            { name: 'Tire Rotation', count: 28 },
            { name: 'AC Service', count: 25 },
            { name: 'Battery Replacement', count: 18 }
          ],
          workerPerformance: [
            { name: 'Ali bin Ahmad', completed: 38, rating: 4.8 },
            { name: 'Rajesh Kumar', completed: 35, rating: 4.6 },
            { name: 'Chen Wei', completed: 32, rating: 4.7 },
            { name: 'Siti Fatimah', completed: 28, rating: 4.9 },
            { name: 'Ahmad Firdaus', completed: 15, rating: 4.2 }
          ]
        };

        const mockCustomerInsights: CustomerInsights = {
          totalCustomers: 156,
          newCustomersThisMonth: 23,
          returningCustomers: 89,
          customerSatisfaction: 4.7,
          topCustomers: [
            { name: 'Ahmad bin Ismail', totalSpent: 2850.00, services: 8 },
            { name: 'Siti Nurhaliza', totalSpent: 1920.50, services: 5 },
            { name: 'Raj Kumar', totalSpent: 1675.00, services: 6 },
            { name: 'Mei Ling', totalSpent: 1430.75, services: 4 },
            { name: 'John Lim', totalSpent: 1280.00, services: 3 }
          ]
        };

        setReports(mockReports);
        setFinancialSummary(mockFinancialSummary);
        setServiceAnalytics(mockServiceAnalytics);
        setCustomerInsights(mockCustomerInsights);
        setIsLoading(false);
      }, 1500);
    };

    fetchData();
  }, []);

  const generateReport = async (reportType: string) => {
    setGeneratingReport(reportType);
    
    // Simulate report generation
    setTimeout(() => {
      const newReport: Report = {
        id: reports.length + 1,
        type: reportType as any,
        title: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report - ${new Date().toLocaleDateString()}`,
        description: `Automatically generated ${reportType} report`,
        dateRange: `${new Date().toISOString().split('T')[0]}`,
        generatedBy: 'Admin User',
        status: 'completed',
        data: {}
      };

      setReports(prev => [newReport, ...prev]);
      setGeneratingReport(null);
    }, 3000);
  };

  const StatCard = ({ title, value, change, icon, color }: any) => (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700 hover:border-amber-500/30 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-2">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {change && (
            <p className={`text-xs mt-1 ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {change > 0 ? '↑' : '↓'} {Math.abs(change)}%
            </p>
          )}
        </div>
        <div className={`text-2xl ${color}`}>{icon}</div>
      </div>
    </div>
  );

  const ReportTypeCard = ({ type, title, description, icon, color }: any) => (
    <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700 hover:border-amber-500/30 transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className={`text-2xl ${color}`}>{icon}</div>
        <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full capitalize">
          {type}
        </span>
      </div>
      <h3 className="text-white font-semibold mb-2">{title}</h3>
      <p className="text-gray-400 text-sm mb-4">{description}</p>
      <button
        onClick={() => generateReport(type)}
        disabled={generatingReport === type}
        className="w-full bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {generatingReport === type ? (
          <span className="flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mr-2"></div>
            Generating...
          </span>
        ) : (
          'Generate Report'
        )}
      </button>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Reports & Analytics</h2>
            <p className="text-gray-400">Loading dashboard data...</p>
          </div>
        </div>
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            <p className="text-gray-400 mt-4">Loading reports and analytics...</p>
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
          <h2 className="text-2xl font-bold text-white">Reports & Analytics</h2>
          <p className="text-gray-400">Comprehensive insights and performance reports</p>
        </div>
        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
            <option value="custom">Custom Range</option>
          </select>
          {dateRange === 'custom' && (
            <div className="flex gap-2">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
              />
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
              />
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-800/50 rounded-xl p-1 border border-gray-700">
        {[
          { id: 'overview', name: '📊 Overview', icon: '📊' },
          { id: 'financial', name: '💰 Financial', icon: '💰' },
          { id: 'services', name: '🔧 Services', icon: '🔧' },
          { id: 'customers', name: '👥 Customers', icon: '👥' },
          { id: 'reports', name: '📋 Reports', icon: '📋' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-3 px-4 rounded-lg transition-all duration-300 text-sm font-medium ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <span className="hidden sm:inline">{tab.icon} </span>
            {tab.name.replace(/[^\\w\\s]/g, '')}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && financialSummary && serviceAnalytics && customerInsights && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Revenue"
              value={`RM ${financialSummary.totalRevenue.toLocaleString()}`}
              change={financialSummary.revenueGrowth}
              icon="💰"
              color="text-green-400"
            />
            <StatCard
              title="Net Profit"
              value={`RM ${financialSummary.netProfit.toLocaleString()}`}
              change={8.2}
              icon="📈"
              color="text-emerald-400"
            />
            <StatCard
              title="Completed Services"
              value={serviceAnalytics.completedServices}
              change={5.3}
              icon="✅"
              color="text-blue-400"
            />
            <StatCard
              title="Customer Satisfaction"
              value={customerInsights.customerSatisfaction}
              change={2.1}
              icon="⭐"
              color="text-yellow-400"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Revenue Trend</h3>
              <div className="space-y-3">
                {financialSummary.monthlyRevenue.map((month, index) => (
                  <div key={month.month} className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm w-12">{month.month}</span>
                    <div className="flex-1 mx-4">
                      <div 
                        className="bg-gradient-to-r from-yellow-500 to-amber-600 rounded-full h-3"
                        style={{ width: `${(month.revenue / 50000) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-white text-sm font-medium w-20 text-right">
                      RM {month.revenue.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Services */}
            <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Popular Services</h3>
              <div className="space-y-4">
                {serviceAnalytics.popularServices.map((service, index) => (
                  <div key={service.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-amber-400 text-sm">{index + 1}</span>
                      </div>
                      <span className="text-white text-sm">{service.name}</span>
                    </div>
                    <span className="text-amber-400 font-semibold">{service.count} services</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800/50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-white">{customerInsights.newCustomersThisMonth}</p>
              <p className="text-gray-400 text-sm">New Customers This Month</p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-white">{serviceAnalytics.pendingServices}</p>
              <p className="text-gray-400 text-sm">Pending Services</p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-white">{serviceAnalytics.averageServiceTime}h</p>
              <p className="text-gray-400 text-sm">Avg. Service Time</p>
            </div>
          </div>
        </div>
      )}

      {/* Financial Tab */}
      {activeTab === 'financial' && financialSummary && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-gray-800/50 rounded-xl p-5 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Financial Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-700">
                  <span className="text-gray-400">Total Revenue</span>
                  <span className="text-green-400 font-semibold">RM {financialSummary.totalRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-700">
                  <span className="text-gray-400">Total Expenses</span>
                  <span className="text-red-400 font-semibold">RM {financialSummary.totalExpenses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-700">
                  <span className="text-gray-400">Net Profit</span>
                  <span className="text-emerald-400 font-semibold">RM {financialSummary.netProfit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-400">Revenue Growth</span>
                  <span className="text-green-400 font-semibold">+{financialSummary.revenueGrowth}%</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Most Profitable Services</h3>
              <div className="space-y-3">
                {financialSummary.mostProfitableServices.map((service, index) => (
                  <div key={service.name} className="flex justify-between items-center">
                    <span className="text-white text-sm">{service.name}</span>
                    <span className="text-amber-400 font-semibold">RM {service.revenue.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Services Tab */}
      {activeTab === 'services' && serviceAnalytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Service Overview</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Services</span>
                  <span className="text-white font-semibold">{serviceAnalytics.totalServices}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Completed</span>
                  <span className="text-green-400 font-semibold">{serviceAnalytics.completedServices}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Pending</span>
                  <span className="text-orange-400 font-semibold">{serviceAnalytics.pendingServices}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Average Service Time</span>
                  <span className="text-blue-400 font-semibold">{serviceAnalytics.averageServiceTime} hours</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Worker Performance</h3>
              <div className="space-y-3">
                {serviceAnalytics.workerPerformance.map((worker) => (
                  <div key={worker.name} className="flex justify-between items-center">
                    <div>
                      <span className="text-white text-sm">{worker.name}</span>
                      <div className="flex items-center space-x-1">
                        <span className="text-amber-400 text-xs">⭐ {worker.rating}</span>
                      </div>
                    </div>
                    <span className="text-green-400 font-semibold">{worker.completed} services</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customers Tab */}
      {activeTab === 'customers' && customerInsights && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Customer Insights</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Customers</span>
                  <span className="text-white font-semibold">{customerInsights.totalCustomers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">New This Month</span>
                  <span className="text-green-400 font-semibold">{customerInsights.newCustomersThisMonth}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Returning Customers</span>
                  <span className="text-blue-400 font-semibold">{customerInsights.returningCustomers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Satisfaction Rate</span>
                  <span className="text-yellow-400 font-semibold">{customerInsights.customerSatisfaction}/5</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Top Customers</h3>
              <div className="space-y-3">
                {customerInsights.topCustomers.map((customer) => (
                  <div key={customer.name} className="flex justify-between items-center">
                    <div>
                      <span className="text-white text-sm">{customer.name}</span>
                      <p className="text-gray-400 text-xs">{customer.services} services</p>
                    </div>
                    <span className="text-amber-400 font-semibold">RM {customer.totalSpent.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Report Generation */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ReportTypeCard
              type="financial"
              title="Financial Report"
              description="Revenue, expenses, profit analysis and financial trends"
              icon="💰"
              color="text-green-400"
            />
            <ReportTypeCard
              type="service"
              title="Service Report"
              description="Service performance, completion rates and worker efficiency"
              icon="🔧"
              color="text-blue-400"
            />
            <ReportTypeCard
              type="customer"
              title="Customer Report"
              description="Customer acquisition, retention and satisfaction analysis"
              icon="👥"
              color="text-purple-400"
            />
            <ReportTypeCard
              type="inventory"
              title="Inventory Report"
              description="Stock levels, valuation and inventory turnover analysis"
              icon="📦"
              color="text-orange-400"
            />
            <ReportTypeCard
              type="worker"
              title="Worker Performance"
              description="Worker productivity, efficiency and quality metrics"
              icon="⚡"
              color="text-amber-400"
            />
          </div>

          {/* Generated Reports List */}
          <div className="bg-gray-800/50 rounded-xl border border-gray-800 overflow-hidden">
            <div className="p-5 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">Generated Reports</h3>
              <p className="text-gray-400 text-sm">Previously generated and scheduled reports</p>
            </div>
            
            <div className="divide-y divide-gray-800">
              {reports.map((report) => (
                <div key={report.id} className="p-4 hover:bg-gray-800/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        report.type === 'financial' ? 'bg-green-500/20' :
                        report.type === 'service' ? 'bg-blue-500/20' :
                        report.type === 'customer' ? 'bg-purple-500/20' :
                        report.type === 'inventory' ? 'bg-orange-500/20' :
                        'bg-amber-500/20'
                      }`}>
                        <span className={
                          report.type === 'financial' ? 'text-green-400' :
                          report.type === 'service' ? 'text-blue-400' :
                          report.type === 'customer' ? 'text-purple-400' :
                          report.type === 'inventory' ? 'text-orange-400' :
                          'text-amber-400'
                        }>
                          {report.type === 'financial' ? '💰' :
                           report.type === 'service' ? '🔧' :
                           report.type === 'customer' ? '👥' :
                           report.type === 'inventory' ? '📦' : '⚡'}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-white font-semibold">{report.title}</h4>
                        <p className="text-gray-400 text-sm">{report.description}</p>
                        <p className="text-gray-500 text-xs">
                          {report.dateRange} • Generated by {report.generatedBy}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        report.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        report.status === 'generating' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </span>
                      {report.downloadUrl && (
                        <button className="bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 px-3 py-1 rounded-lg text-sm transition-colors">
                          Download
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsManagement;