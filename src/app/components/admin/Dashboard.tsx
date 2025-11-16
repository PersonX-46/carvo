"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import BookingCalendar from "./BookingCalender";
import CustomerManagement from "./CustomerManagement";
import WorkerManagement from "./WorkerManagement";
import InventoryManagement from "./InventoryManagement";
import ReportsManagement from "./ReportsManagement";
import FinanceManagement from "./FinanceManagement";

interface DashboardStats {
  totalCustomers: number;
  totalWorkers: number;
  pendingBookings: number;
  completedServices: number;
  monthlyRevenue: number;
  lowStockItems: number;
}

interface RecentBooking {
  id: number;
  customerName: string;
  vehicleModel: string;
  registrationNumber: string;
  bookingDate: string;
  status: string;
  estimatedCost: number;
  reportedIssue?: string;
}

interface LowStockItem {
  id: number;
  itemName: string;
  category: string;
  quantity: number;
  unitPrice: number;
  minStockLevel: number;
  supplier?: string;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    totalWorkers: 0,
    pendingBookings: 0,
    completedServices: 0,
    monthlyRevenue: 0,
    lowStockItems: 0,
  });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [statsResponse, bookingsResponse, stockResponse] =
        await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/recent-bookings?limit=5"),
          fetch("/api/admin/low-stock"),
        ]);

      if (!statsResponse.ok || !bookingsResponse.ok || !stockResponse.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const [statsData, bookingsData, stockData] = await Promise.all([
        statsResponse.json(),
        bookingsResponse.json(),
        stockResponse.json(),
      ]);

      setStats(statsData);
      setRecentBookings(bookingsData);
      setLowStockItems(stockData);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Refresh data function
  const refreshData = () => {
    fetchDashboardData();
  };

  const StatCard = ({ title, value, icon, color, subtitle }: any) => (
    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-amber-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-2">{title}</p>
          <p className="text-3xl font-bold text-white mb-1">
            {isLoading ? (
              <div className="h-8 w-20 bg-gray-700 rounded animate-pulse"></div>
            ) : (
              value
            )}
          </p>
          {subtitle && (
            <p className="text-amber-400 text-xs font-medium">{subtitle}</p>
          )}
        </div>
        <div className={`text-3xl p-3 rounded-xl bg-gray-700/50 ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const NavigationItem = ({ id, icon, label, isActive }: any) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 group ${
        isActive
          ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25"
          : "bg-gray-800/80 text-gray-400 hover:bg-gray-700/80 hover:text-white"
      }`}
    >
      <span className="text-xl">{icon}</span>

      {/* Tooltip */}
      <div className="absolute left-14 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50 whitespace-nowrap shadow-xl border border-gray-700">
        {label}
        <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
      </div>
    </button>
  );

  const navigationItems = [
    { id: "overview", icon: "📊", label: "Dashboard" },
    { id: "bookings", icon: "📅", label: "Bookings" },
    { id: "customers", icon: "👥", label: "Customers" },
    { id: "workers", icon: "🔧", label: "Workers" },
    { id: "inventory", icon: "📦", label: "Inventory" },
    { id: "finance", icon: "💰", label: "Finance" }, // Add this
    { id: "reports", icon: "📈", label: "Reports" },
    { id: "settings", icon: "⚙️", label: "Settings" },
  ];
  // Loading skeleton for recent bookings
  const BookingSkeleton = () => (
    <div className="animate-pulse">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl border border-gray-600/30 mb-4"
        >
          <div>
            <div className="h-4 bg-gray-600 rounded w-32 mb-2"></div>
            <div className="h-3 bg-gray-600 rounded w-24"></div>
          </div>
          <div className="text-right">
            <div className="h-6 bg-gray-600 rounded w-20 mb-2"></div>
            <div className="h-4 bg-gray-600 rounded w-16"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/25">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">
                  ChengService Admin
                </h1>
                <p className="text-gray-400 text-sm">Auto Service Management</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Refresh Button */}
              <button
                onClick={refreshData}
                disabled={isLoading}
                className="p-2 text-gray-400 hover:text-amber-400 transition-colors rounded-xl hover:bg-gray-800/50 disabled:opacity-50"
                title="Refresh Data"
              >
                <span className="text-xl">🔄</span>
              </button>

              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-amber-400 transition-colors rounded-xl hover:bg-gray-800/50">
                <span className="text-xl">🔔</span>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-gray-900"></div>
              </button>

              {/* User Profile */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-white">Admin User</p>
                  <p className="text-gray-400 text-xs">Manager</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-6 mt-4">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400">
            <div className="flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={refreshData}
                className="text-red-400 hover:text-red-300"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-8">
          {/* Floating Sidebar Navigation */}
          <div className="fixed left-6 top-1/2 transform -translate-y-1/2 z-30 hidden lg:block">
            <div className="bg-gray-800/80 backdrop-blur-xl rounded-2xl p-3 border border-gray-700/50 shadow-2xl">
              <div className="space-y-2">
                {navigationItems.map((item) => (
                  <NavigationItem
                    key={item.id}
                    id={item.id}
                    icon={item.icon}
                    label={item.label}
                    isActive={activeTab === item.id}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <main className="flex-1 lg:ml-20">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* Welcome Header */}
                <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">
                        Welcome back, Admin! 👋
                      </h2>
                      <p className="text-gray-400">
                        Here's what's happening at ChengService today
                      </p>
                    </div>
                    <div className="hidden md:flex items-center space-x-3">
                      <span className="text-amber-400 text-lg">🏢</span>
                      <span className="text-white font-medium">
                        Seremban Branch
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <StatCard
                    title="Total Customers"
                    value={stats.totalCustomers}
                    icon="👥"
                    color="text-blue-400"
                  />
                  <StatCard
                    title="Active Workers"
                    value={stats.totalWorkers}
                    icon="🔧"
                    color="text-green-400"
                  />
                  <StatCard
                    title="Pending Bookings"
                    value={stats.pendingBookings}
                    icon="📅"
                    color="text-orange-400"
                  />
                  <StatCard
                    title="Completed Services"
                    value={stats.completedServices}
                    icon="✅"
                    color="text-emerald-400"
                  />
                  <StatCard
                    title="Monthly Revenue"
                    value={`RM ${stats.monthlyRevenue.toLocaleString()}`}
                    icon="💰"
                    color="text-amber-400"
                    subtitle="This month"
                  />
                  <StatCard
                    title="Low Stock Items"
                    value={stats.lowStockItems}
                    icon="📦"
                    color="text-red-400"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Recent Bookings */}
                  <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-white flex items-center">
                        <span className="text-amber-400 mr-3">📋</span>
                        Recent Bookings
                      </h3>
                      <Link
                        href="/admin/bookings"
                        className="text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors"
                      >
                        View All →
                      </Link>
                    </div>

                    <div className="space-y-4">
                      {isLoading ? (
                        <BookingSkeleton />
                      ) : recentBookings.length > 0 ? (
                        recentBookings.map((booking) => (
                          <div
                            key={booking.id}
                            className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl border border-gray-600/30 hover:border-amber-500/30 transition-all duration-300"
                          >
                            <div>
                              <p className="text-white font-medium">
                                {booking.customerName}
                              </p>
                              <p className="text-gray-400 text-sm">
                                {booking.vehicleModel} (
                                {booking.registrationNumber})
                              </p>
                            </div>
                            <div className="text-right">
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                  booking.status === "Completed"
                                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                    : booking.status === "In Progress"
                                    ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                    : "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                                }`}
                              >
                                {booking.status}
                              </span>
                              <p className="text-amber-400 font-semibold mt-2">
                                RM {booking.estimatedCost.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-400 text-center py-4">
                          No recent bookings
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Low Stock Alert */}
                  <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 backdrop-blur-sm rounded-2xl p-6 border border-amber-500/20">
                    <h3 className="text-lg font-semibold text-amber-400 mb-6 flex items-center">
                      <span className="mr-3">⚠️</span>
                      Low Stock Alert
                    </h3>

                    <div className="space-y-4">
                      {isLoading ? (
                        <BookingSkeleton />
                      ) : lowStockItems.length > 0 ? (
                        lowStockItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-4 bg-amber-500/10 rounded-xl border border-amber-500/20"
                          >
                            <div>
                              <p className="text-white font-medium">
                                {item.itemName}
                              </p>
                              <p className="text-amber-400 text-sm">
                                {item.category}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-red-400 font-semibold">
                                Only {item.quantity} left
                              </p>
                              <p className="text-gray-400 text-xs">
                                Min: {item.minStockLevel} | RM{" "}
                                {item.unitPrice.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-amber-400 text-center py-4">
                          All stock levels are good! ✅
                        </p>
                      )}
                    </div>

                    <button className="w-full mt-6 bg-amber-500 hover:bg-amber-600 text-white py-3 px-4 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg shadow-amber-500/25">
                      📦 Order More Stock
                    </button>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                  <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                    <span className="text-amber-400 mr-3">⚡</span>
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-4 px-6 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg shadow-amber-500/25 flex items-center justify-center space-x-2">
                      <span>➕</span>
                      <span>New Booking</span>
                    </button>
                    <button className="bg-gray-700 hover:bg-gray-600 text-white py-4 px-6 rounded-xl font-semibold transition-all border border-gray-600 flex items-center justify-center space-x-2">
                      <span>👥</span>
                      <span>Add Customer</span>
                    </button>
                    <button className="bg-gray-700 hover:bg-gray-600 text-white py-4 px-6 rounded-xl font-semibold transition-all border border-gray-600 flex items-center justify-center space-x-2">
                      <span>📊</span>
                      <span>Generate Report</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Other tabs remain the same */}
            {activeTab === "bookings" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Service Bookings
                    </h2>
                    <p className="text-gray-400">
                      Manage all service bookings and appointments
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-xl font-medium transition-colors border border-gray-600 flex items-center space-x-2">
                      <span>📋</span>
                      <span>List View</span>
                    </button>
                    <button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-4 py-2 rounded-xl font-medium transition-all transform hover:scale-105 flex items-center space-x-2">
                      <span>➕</span>
                      <span>New Booking</span>
                    </button>
                  </div>
                </div>
                <BookingCalendar />
              </div>
            )}

            {activeTab === "customers" && <CustomerManagement />}
            {activeTab === "workers" && <WorkerManagement />}
            {activeTab === "inventory" && <InventoryManagement />}
            {activeTab === "reports" && <ReportsManagement />}

            {/* Placeholder for other tabs */}
            {activeTab === "finance" && <FinanceManagement />}

            {activeTab === "settings" && (
              <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 text-center">
                <div className="text-6xl mb-4">⚙️</div>
                <h3 className="text-2xl font-bold text-white mb-2">Settings</h3>
                <p className="text-gray-400">System settings coming soon...</p>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-t border-gray-800/50 p-4 z-40">
        <div className="grid grid-cols-5 gap-1">
          {navigationItems.slice(0, 5).map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center p-2 rounded-xl transition-all ${
                activeTab === item.id
                  ? "text-amber-400 bg-amber-500/20"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <span className="text-lg mb-1">{item.icon}</span>
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Add padding for mobile bottom nav */}
      <div className="lg:hidden h-20"></div>
    </div>
  );
};

export default AdminDashboard;
