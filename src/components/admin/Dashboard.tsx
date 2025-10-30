"use client";
// components/AdminDashboard.tsx
import { useState, useEffect } from "react";
import Link from "next/link";
import BookingCalendar from "./BookingCalender";

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
  bookingDate: string;
  status: string;
  estimatedCost: number;
}

interface LowStockItem {
  id: number;
  itemName: string;
  category: string;
  quantity: number;
  unitPrice: number;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
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

  useEffect(() => {
    // Simulate data fetching
    setTimeout(() => {
      setStats({
        totalCustomers: 156,
        totalWorkers: 8,
        pendingBookings: 12,
        completedServices: 89,
        monthlyRevenue: 45230.5,
        lowStockItems: 5,
      });

      setRecentBookings([
        {
          id: 1,
          customerName: "Ahmad bin Ismail",
          vehicleModel: "Toyota Vios",
          bookingDate: "2024-01-15",
          status: "Pending",
          estimatedCost: 120,
        },
        {
          id: 2,
          customerName: "Siti Nurhaliza",
          vehicleModel: "Honda City",
          bookingDate: "2024-01-14",
          status: "In Progress",
          estimatedCost: 250,
        },
        {
          id: 3,
          customerName: "Raj Kumar",
          vehicleModel: "Proton Saga",
          bookingDate: "2024-01-13",
          status: "Completed",
          estimatedCost: 85,
        },
      ]);

      setLowStockItems([
        {
          id: 1,
          itemName: "Engine Oil 5W-30",
          category: "Lubricants",
          quantity: 3,
          unitPrice: 45.0,
        },
        {
          id: 2,
          itemName: "Brake Pads Front",
          category: "Brakes",
          quantity: 2,
          unitPrice: 120.0,
        },
        {
          id: 3,
          itemName: "Air Filter",
          category: "Filters",
          quantity: 4,
          unitPrice: 35.0,
        },
      ]);

      setIsLoading(false);
    }, 1000);
  }, []);

  const StatCard = ({ title, value, icon, color, subtitle }: any) => (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 xs:p-5 border border-gray-700 hover:border-amber-500/30 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-xs xs:text-sm mb-1">{title}</p>
          <p className="text-2xl xs:text-3xl font-bold text-white">
            {isLoading ? "..." : value}
          </p>
          {subtitle && (
            <p className="text-amber-400 text-xs mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`text-2xl xs:text-3xl ${color}`}>{icon}</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 xs:w-12 xs:h-12 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-lg xs:rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl xs:text-2xl">
                  C
                </span>
              </div>
              <div>
                <h1 className="text-lg xs:text-xl font-bold bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
                  CARVO Admin
                </h1>
                <p className="text-gray-400 text-xs">Chong Meng AutoService</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 xs:space-x-4">
              <button className="p-2 text-gray-400 hover:text-amber-400 transition-colors">
                <span className="text-lg">🔔</span>
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 xs:w-10 xs:h-10 bg-amber-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <div className="hidden xs:block">
                  <p className="text-sm font-medium">Admin User</p>
                  <p className="text-gray-400 text-xs">Manager</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-4 xs:py-6">
        <div className="flex flex-col lg:flex-row gap-6 xs:gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-4 xs:p-5 h-fit lg:sticky lg:top-24">
            <nav className="space-y-2">
              {[
                { id: "overview", name: "📊 Overview", icon: "📊" },
                { id: "bookings", name: "📅 Bookings", icon: "📅" },
                { id: "customers", name: "👥 Customers", icon: "👥" },
                { id: "workers", name: "🔧 Workers", icon: "🔧" },
                { id: "inventory", name: "📦 Inventory", icon: "📦" },
                { id: "reports", name: "📈 Reports", icon: "📈" },
                { id: "finances", name: "💰 Finances", icon: "💰" },
                { id: "settings", name: "⚙️ Settings", icon: "⚙️" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-left px-3 xs:px-4 py-2 xs:py-3 rounded-lg transition-all duration-300 text-sm ${
                    activeTab === item.id
                      ? "bg-gradient-to-r from-yellow-500/20 to-amber-600/20 text-amber-400 border border-amber-500/30"
                      : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </button>
              ))}
            </nav>

            {/* Quick Actions */}
            <div className="mt-6 pt-4 border-t border-gray-800">
              <h3 className="text-xs xs:text-sm font-semibold text-amber-400 mb-3">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white py-2 px-3 rounded-lg text-xs xs:text-sm font-semibold transition-all transform hover:scale-105">
                  ➕ Add Worker
                </button>
                <button className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2 px-3 rounded-lg text-xs xs:text-sm font-semibold transition-all border border-gray-700">
                  📊 Generate Report
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {activeTab === "overview" && (
              <div className="space-y-6 xs:space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-5">
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
                    color="text-yellow-400"
                    subtitle="This month"
                  />
                  <StatCard
                    title="Low Stock Items"
                    value={stats.lowStockItems}
                    icon="📦"
                    color="text-red-400"
                  />
                </div>

                {/* Recent Bookings */}
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-4 xs:p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg xs:text-xl font-semibold text-white flex items-center">
                      <span className="mr-2">📋</span>
                      Recent Bookings
                    </h2>
                    <Link
                      href="/admin/bookings"
                      className="text-amber-400 hover:text-amber-300 text-xs xs:text-sm"
                    >
                      View All →
                    </Link>
                  </div>

                  <div className="space-y-3">
                    {recentBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700"
                      >
                        <div>
                          <p className="text-white text-sm font-medium">
                            {booking.customerName}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {booking.vehicleModel}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs ${
                              booking.status === "Completed"
                                ? "bg-green-500/20 text-green-400"
                                : booking.status === "In Progress"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-orange-500/20 text-orange-400"
                            }`}
                          >
                            {booking.status}
                          </span>
                          <p className="text-amber-400 text-sm font-semibold mt-1">
                            RM {booking.estimatedCost}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Low Stock Alert */}
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-amber-500/30 p-4 xs:p-5">
                  <h2 className="text-lg xs:text-xl font-semibold text-amber-400 mb-4 flex items-center">
                    <span className="mr-2">⚠️</span>
                    Low Stock Alert
                  </h2>

                  <div className="space-y-3">
                    {lowStockItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-amber-500/10 rounded-lg border border-amber-500/20"
                      >
                        <div>
                          <p className="text-white text-sm font-medium">
                            {item.itemName}
                          </p>
                          <p className="text-amber-400 text-xs">
                            {item.category}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-red-400 text-sm font-semibold">
                            Only {item.quantity} left
                          </p>
                          <p className="text-gray-400 text-xs">
                            RM {item.unitPrice} each
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button className="w-full mt-4 bg-amber-500 hover:bg-amber-600 text-white py-2 px-4 rounded-lg text-sm font-semibold transition-all">
                    📦 Order More Stock
                  </button>
                </div>
              </div>
            )}
            {activeTab === "bookings" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Booking Calendar
                    </h2>
                    <p className="text-gray-400">
                      Manage all service bookings in calendar view
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Link
                      href="/admin/bookings/list"
                      className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors border border-gray-700"
                    >
                      📋 List View
                    </Link>
                    <button className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105">
                      ➕ New Booking
                    </button>
                  </div>
                </div>

                <BookingCalendar />
              </div>
            )}
            {activeTab === "customers" && (
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-4 xs:p-5">
                <h2 className="text-lg xs:text-xl font-semibold text-white mb-4">
                  Customers Management
                </h2>
                <p className="text-gray-400">
                  Customers management content goes here...
                </p>
              </div>
            )}
            {/* Add other tabs content similarly */}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-t border-gray-800 p-3">
        <div className="grid grid-cols-4 gap-2">
          {[
            { id: "overview", icon: "📊", label: "Home" },
            { id: "bookings", icon: "📅", label: "Bookings" },
            { id: "customers", icon: "👥", label: "Customers" },
            { id: "inventory", icon: "📦", label: "Stock" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center p-2 rounded-lg transition-all text-xs ${
                activeTab === item.id
                  ? "text-amber-400 bg-amber-500/20"
                  : "text-gray-400"
              }`}
            >
              <span className="text-lg mb-1">{item.icon}</span>
              <span>{item.label}</span>
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
