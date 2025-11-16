"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import WorkerSchedule from "./WorkSchedule";
import WorkerPerformance from "./WorkerPerformance";
import WorkerProfile from "./WorkerProfile";
import WorkerInventory from "./WorkInventory";

interface WorkerTask {
  id: number;
  bookingId: number;
  vehicleModel: string;
  registrationNumber: string;
  serviceType: string;
  customerName: string;
  customerPhone: string;
  status:
    | "assigned"
    | "in-progress"
    | "waiting-parts"
    | "completed"
    | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  estimatedDuration: number;
  actualDuration?: number;
  assignedDate: string;
  startTime?: string;
  completionTime?: string;
  reportedIssue: string;
  spareParts?: string[];
  notes?: string;
}

interface WorkerPerformance {
  totalServices: number;
  completedThisWeek: number;
  averageRating: number;
  efficiency: number;
  onTimeCompletion: number;
  currentWorkload: number;
}

interface WorkerProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  position: string;
  specialization: string[];
  status: "active" | "inactive" | "on_leave";
  salary: number;
  hireDate: string;
  totalServices: number;
  currentWorkload: number;
  rating: number;
}

const WorkerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "tasks" | "schedule" | "performance" | "profile" | "inventory"
  >("overview");
  const [workerProfile, setWorkerProfile] = useState<WorkerProfile | null>(
    null
  );
  const [tasks, setTasks] = useState<WorkerTask[]>([]);
  const [performance, setPerformance] = useState<WorkerPerformance | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<WorkerTask | null>(null);
  const [isUpdatingTask, setIsUpdatingTask] = useState(false);

  // Simulated data fetch
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      // Simulate API call
      setTimeout(() => {
        const mockProfile: WorkerProfile = {
          id: 1,
          name: "Ali bin Ahmad",
          email: "ali.ahmad@chengservice.com",
          phone: "+60 12-345 6789",
          position: "Senior Technician",
          specialization: [
            "Engine Repair",
            "Transmission",
            "Electrical Systems",
          ],
          status: "active",
          salary: 3500,
          hireDate: "2022-03-15",
          totalServices: 247,
          currentWorkload: 3,
          rating: 4.8,
        };

        const mockTasks: WorkerTask[] = [
          {
            id: 1,
            bookingId: 1001,
            vehicleModel: "Toyota Vios",
            registrationNumber: "ABC1234",
            serviceType: "Regular Maintenance",
            customerName: "Ahmad bin Ismail",
            customerPhone: "+60 12-345 6789",
            status: "in-progress",
            priority: "medium",
            estimatedDuration: 1.5,
            actualDuration: 1.2,
            assignedDate: "2024-01-15",
            startTime: "2024-01-15T09:00:00",
            reportedIssue: "Oil change and general checkup",
            spareParts: ["Engine oil", "Oil filter", "Air filter"],
            notes: "Customer requested extra tire pressure check",
          },
          {
            id: 2,
            bookingId: 1002,
            vehicleModel: "Honda City",
            registrationNumber: "XYZ5678",
            serviceType: "Brake Service",
            customerName: "Siti Nurhaliza",
            customerPhone: "+60 13-456 7890",
            status: "waiting-parts",
            priority: "high",
            estimatedDuration: 2,
            assignedDate: "2024-01-15",
            startTime: "2024-01-15T10:30:00",
            reportedIssue: "Brake pads replacement and rotor resurfacing",
            spareParts: ["Brake pads", "Brake fluid"],
            notes: "Waiting for brake pads delivery - expected today 2PM",
          },
          {
            id: 3,
            bookingId: 1003,
            vehicleModel: "Proton Saga",
            registrationNumber: "DEF9012",
            serviceType: "AC Service",
            customerName: "Raj Kumar",
            customerPhone: "+60 14-567 8901",
            status: "assigned",
            priority: "medium",
            estimatedDuration: 2.5,
            assignedDate: "2024-01-16",
            reportedIssue: "AC not cooling properly",
            spareParts: ["AC gas", "Cleaning solution"],
          },
          {
            id: 4,
            bookingId: 1004,
            vehicleModel: "Perodua Myvi",
            registrationNumber: "GHI3456",
            serviceType: "Tire Rotation",
            customerName: "Mei Ling",
            customerPhone: "+60 16-789 0123",
            status: "completed",
            priority: "low",
            estimatedDuration: 1,
            actualDuration: 0.8,
            assignedDate: "2024-01-14",
            startTime: "2024-01-14T11:00:00",
            completionTime: "2024-01-14T11:48:00",
            reportedIssue: "Regular tire maintenance",
            notes: "Completed ahead of schedule",
          },
        ];

        const mockPerformance: WorkerPerformance = {
          totalServices: 247,
          completedThisWeek: 8,
          averageRating: 4.8,
          efficiency: 92,
          onTimeCompletion: 88,
          currentWorkload: 3,
        };

        setWorkerProfile(mockProfile);
        setTasks(mockTasks);
        setPerformance(mockPerformance);
        setIsLoading(false);
      }, 1500);
    };

    fetchData();
  }, []);

  const StatusBadge = ({ status }: { status: string }) => {
    const getStatusColor = (status: string) => {
      switch (status.toLowerCase()) {
        case "completed":
          return "bg-green-500/20 text-green-400 border border-green-500/30";
        case "in-progress":
          return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
        case "waiting-parts":
          return "bg-orange-500/20 text-orange-400 border border-orange-500/30";
        case "assigned":
          return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
        case "cancelled":
          return "bg-red-500/20 text-red-400 border border-red-500/30";
        default:
          return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
      }
    };

    const getStatusIcon = (status: string) => {
      switch (status.toLowerCase()) {
        case "completed":
          return "✅";
        case "in-progress":
          return "🔧";
        case "waiting-parts":
          return "📦";
        case "assigned":
          return "📅";
        case "cancelled":
          return "❌";
        default:
          return "📝";
      }
    };

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
          status
        )}`}
      >
        <span className="mr-1">{getStatusIcon(status)}</span>
        {status.replace("-", " ")}
      </span>
    );
  };

  const PriorityBadge = ({ priority }: { priority: string }) => {
    const getPriorityColor = (priority: string) => {
      switch (priority.toLowerCase()) {
        case "urgent":
          return "bg-red-500/20 text-red-400 border border-red-500/30";
        case "high":
          return "bg-orange-500/20 text-orange-400 border border-orange-500/30";
        case "medium":
          return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
        case "low":
          return "bg-green-500/20 text-green-400 border border-green-500/30";
        default:
          return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
      }
    };

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
          priority
        )}`}
      >
        {priority}
      </span>
    );
  };

  const StatCard = ({ title, value, icon, color, subtitle }: any) => (
    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-amber-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-2">{title}</p>
          <p className="text-3xl font-bold text-white mb-1">
            {isLoading ? "..." : value}
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

  const handleUpdateTaskStatus = (
    taskId: number,
    newStatus: WorkerTask["status"]
  ) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
    setIsUpdatingTask(false);
    setSelectedTask(null);
  };

  const handleStartTask = (taskId: number) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: "in-progress",
              startTime: new Date().toISOString(),
            }
          : task
      )
    );
  };

  const handleCompleteTask = (taskId: number) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: "completed",
              completionTime: new Date().toISOString(),
              actualDuration:
                Math.round(
                  (Math.random() * 0.5 + 0.8) * task.estimatedDuration * 10
                ) / 10,
            }
          : task
      )
    );
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const navigationItems = [
    { id: "overview", icon: "📊", label: "Dashboard" },
    { id: "tasks", icon: "🔧", label: "My Tasks" },
    { id: "schedule", icon: "📅", label: "Schedule" },
    { id: "performance", icon: "⭐", label: "Performance" },
    { id: "profile", icon: "👤", label: "Profile" },
    { id: "inventory", icon: "📦", label: "Inventory" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-amber-500"></div>
          <p className="text-gray-400 mt-4">Loading worker dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/25">
                <span className="text-white font-bold text-xl">W</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">
                  ChengService Worker
                </h1>
                <p className="text-gray-400 text-sm">
                  Service Management Portal
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Quick Actions */}
              <div className="hidden md:flex items-center space-x-3">
                <button className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-xl font-semibold transition-all border border-gray-700 flex items-center space-x-2">
                  <span>📋</span>
                  <span>Daily Report</span>
                </button>
                <button className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl font-semibold transition-all transform hover:scale-105 flex items-center space-x-2">
                  <span>➕</span>
                  <span>New Task</span>
                </button>
              </div>

              {/* Worker Profile */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm">
                    {workerProfile?.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-white">
                    {workerProfile?.name}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {workerProfile?.position}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

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
                        Welcome back, {workerProfile?.name}! 👋
                      </h2>
                      <p className="text-gray-400">
                        You have{" "}
                        {
                          tasks.filter(
                            (t) =>
                              t.status === "assigned" ||
                              t.status === "in-progress"
                          ).length
                        }{" "}
                        active tasks today.
                      </p>
                    </div>
                    <div className="text-5xl">🔧</div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard
                    title="Today's Tasks"
                    value={
                      tasks.filter(
                        (t) =>
                          t.status === "assigned" || t.status === "in-progress"
                      ).length
                    }
                    icon="🔧"
                    color="text-blue-400"
                    subtitle="Active assignments"
                  />
                  <StatCard
                    title="Completed This Week"
                    value={performance?.completedThisWeek || 0}
                    icon="✅"
                    color="text-green-400"
                    subtitle="On track"
                  />
                  <StatCard
                    title="Average Rating"
                    value={workerProfile?.rating.toFixed(1)}
                    icon="⭐"
                    color="text-yellow-400"
                    subtitle="Out of 5.0"
                  />
                  <StatCard
                    title="Efficiency"
                    value={`${performance?.efficiency}%`}
                    icon="⚡"
                    color="text-amber-400"
                    subtitle="This month"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Active Tasks */}
                  <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-white flex items-center">
                        <span className="text-amber-400 mr-3">🔄</span>
                        Active Tasks
                      </h3>
                      <Link
                        href="/worker/tasks"
                        className="text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors"
                      >
                        View All →
                      </Link>
                    </div>

                    <div className="space-y-4">
                      {tasks
                        .filter(
                          (task) =>
                            task.status === "assigned" ||
                            task.status === "in-progress" ||
                            task.status === "waiting-parts"
                        )
                        .slice(0, 3)
                        .map((task) => (
                          <div
                            key={task.id}
                            className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30 hover:border-amber-500/30 transition-all duration-300"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="text-white font-semibold text-lg mb-1">
                                  {task.vehicleModel}
                                </h4>
                                <p className="text-gray-400 text-sm mb-2">
                                  {task.registrationNumber} • {task.serviceType}
                                </p>
                                <div className="flex gap-2">
                                  <StatusBadge status={task.status} />
                                  <PriorityBadge priority={task.priority} />
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-amber-400 font-bold text-xl">
                                  {task.estimatedDuration}h
                                </p>
                                {task.actualDuration && (
                                  <p className="text-green-400 text-xs">
                                    Actual: {task.actualDuration}h
                                  </p>
                                )}
                              </div>
                            </div>

                            <p className="text-gray-300 text-sm mb-3">
                              {task.reportedIssue}
                            </p>

                            <div className="flex items-center justify-between text-sm">
                              <div className="text-gray-400">
                                <span className="text-amber-400">👤</span>{" "}
                                {task.customerName}
                              </div>
                              {task.startTime && (
                                <div className="text-blue-400">
                                  Started: {formatTime(task.startTime)}
                                </div>
                              )}
                            </div>

                            <div className="flex gap-2 mt-3">
                              {task.status === "assigned" && (
                                <button
                                  onClick={() => handleStartTask(task.id)}
                                  className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-all"
                                >
                                  Start Task
                                </button>
                              )}
                              {task.status === "in-progress" && (
                                <button
                                  onClick={() => handleCompleteTask(task.id)}
                                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-all"
                                >
                                  Complete
                                </button>
                              )}
                              <button
                                onClick={() => setSelectedTask(task)}
                                className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded-lg text-sm font-medium transition-all"
                              >
                                Details
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                      <span className="text-amber-400 mr-3">📈</span>
                      Performance Metrics
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">Efficiency</span>
                          <span className="text-amber-400">
                            {performance?.efficiency}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-amber-500 h-2 rounded-full"
                            style={{ width: `${performance?.efficiency}%` }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">
                            On-time Completion
                          </span>
                          <span className="text-green-400">
                            {performance?.onTimeCompletion}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{
                              width: `${performance?.onTimeCompletion}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">Customer Rating</span>
                          <span className="text-yellow-400">
                            {workerProfile?.rating}/5.0
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-yellow-500 h-2 rounded-full"
                            style={{
                              width: `${(workerProfile?.rating || 0) * 20}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-700/50">
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div>
                            <p className="text-2xl font-bold text-white">
                              {performance?.totalServices}
                            </p>
                            <p className="text-gray-400 text-sm">
                              Total Services
                            </p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-white">
                              {workerProfile?.currentWorkload}
                            </p>
                            <p className="text-gray-400 text-sm">
                              Current Load
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                  <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                    <span className="text-amber-400 mr-3">⚡</span>
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-4 px-6 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg shadow-amber-500/25 flex items-center justify-center space-x-3">
                      <span className="text-xl">📋</span>
                      <span>Daily Report</span>
                    </button>
                    <button className="bg-gray-700 hover:bg-gray-600 text-white py-4 px-6 rounded-xl font-semibold transition-all border border-gray-600 flex items-center justify-center space-x-3">
                      <span className="text-xl">📦</span>
                      <span>Request Parts</span>
                    </button>
                    <button className="bg-gray-700 hover:bg-gray-600 text-white py-4 px-6 rounded-xl font-semibold transition-all border border-gray-600 flex items-center justify-center space-x-3">
                      <span className="text-xl">🔍</span>
                      <span>View Schedule</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* Tasks Tab */}
            {activeTab === "tasks" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white">My Tasks</h2>
                    <p className="text-gray-400">
                      Manage your assigned service tasks
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <select className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-amber-500">
                      <option>All Status</option>
                      <option>Assigned</option>
                      <option>In Progress</option>
                      <option>Waiting Parts</option>
                      <option>Completed</option>
                    </select>
                    <button className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl font-semibold transition-all flex items-center space-x-2">
                      <span>🔍</span>
                      <span>Filter</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-6 border border-gray-700/50 hover:border-amber-500/30 transition-all duration-300"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-white font-semibold text-xl mb-1">
                                {task.vehicleModel} • {task.registrationNumber}
                              </h3>
                              <p className="text-amber-400 text-lg">
                                {task.serviceType}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <StatusBadge status={task.status} />
                              <PriorityBadge priority={task.priority} />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className="text-gray-400 text-sm">Customer</p>
                              <p className="text-white font-medium">
                                {task.customerName}
                              </p>
                              <p className="text-gray-400 text-sm">
                                {task.customerPhone}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm">Duration</p>
                              <p className="text-white font-medium">
                                {task.estimatedDuration}h
                                {task.actualDuration &&
                                  ` (Actual: ${task.actualDuration}h)`}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm">
                                Assigned Date
                              </p>
                              <p className="text-white font-medium">
                                {formatDate(task.assignedDate)}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm">
                                Booking ID
                              </p>
                              <p className="text-white font-medium">
                                #{task.bookingId}
                              </p>
                            </div>
                          </div>

                          <p className="text-gray-300 text-sm mb-3">
                            <span className="text-gray-400">
                              Reported Issue:
                            </span>{" "}
                            {task.reportedIssue}
                          </p>

                          {task.spareParts && task.spareParts.length > 0 && (
                            <div className="flex items-center space-x-2 text-sm">
                              <span className="text-gray-400">
                                Spare Parts:
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {task.spareParts.map((part, index) => (
                                  <span
                                    key={index}
                                    className="bg-gray-700/50 text-gray-300 px-2 py-1 rounded-lg text-xs"
                                  >
                                    {part}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {task.notes && (
                            <div className="mt-3 p-3 bg-gray-700/30 rounded-lg">
                              <p className="text-amber-400 text-sm font-medium">
                                📝 Notes: {task.notes}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex lg:flex-col gap-2">
                          {task.status === "assigned" && (
                            <button
                              onClick={() => handleStartTask(task.id)}
                              className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl font-semibold transition-all text-sm whitespace-nowrap"
                            >
                              Start Task
                            </button>
                          )}
                          {task.status === "in-progress" && (
                            <button
                              onClick={() => handleCompleteTask(task.id)}
                              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-semibold transition-all text-sm whitespace-nowrap"
                            >
                              Complete Task
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedTask(task)}
                            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-xl font-semibold transition-all border border-gray-600 text-sm whitespace-nowrap"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => setIsUpdatingTask(true)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold transition-all text-sm whitespace-nowrap"
                          >
                            Update Status
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeTab === "schedule" && <WorkerSchedule />}
            {activeTab === "performance" && <WorkerPerformance />}
            {activeTab === "profile" && <WorkerProfile />}
            {activeTab === "inventory" && <WorkerInventory />}
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

      {/* Task Details Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl border border-amber-500/30 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold text-white">Task Details</h3>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Vehicle Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-amber-400 flex items-center">
                      <span className="mr-2">🚗</span>
                      Vehicle Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-gray-400 text-sm">Vehicle Model</p>
                        <p className="text-white font-medium">
                          {selectedTask.vehicleModel}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">
                          Registration Number
                        </p>
                        <p className="text-white font-medium">
                          {selectedTask.registrationNumber}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Service Type</p>
                        <p className="text-white font-medium">
                          {selectedTask.serviceType}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-amber-400 flex items-center">
                      <span className="mr-2">👤</span>
                      Customer Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-gray-400 text-sm">Customer Name</p>
                        <p className="text-white font-medium">
                          {selectedTask.customerName}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Phone Number</p>
                        <p className="text-white font-medium">
                          {selectedTask.customerPhone}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Booking ID</p>
                        <p className="text-white font-medium">
                          #{selectedTask.bookingId}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Task Details */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-amber-400 flex items-center">
                    <span className="mr-2">🔧</span>
                    Task Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-gray-400 text-sm mb-2">
                        Reported Issue
                      </p>
                      <p className="text-white p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                        {selectedTask.reportedIssue}
                      </p>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-gray-400 text-sm">Status</p>
                        <StatusBadge status={selectedTask.status} />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Priority</p>
                        <PriorityBadge priority={selectedTask.priority} />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">
                          Estimated Duration
                        </p>
                        <p className="text-white font-medium">
                          {selectedTask.estimatedDuration} hours
                        </p>
                      </div>
                      {selectedTask.actualDuration && (
                        <div>
                          <p className="text-gray-400 text-sm">
                            Actual Duration
                          </p>
                          <p className="text-green-400 font-medium">
                            {selectedTask.actualDuration} hours
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Spare Parts */}
                {selectedTask.spareParts &&
                  selectedTask.spareParts.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-amber-400 flex items-center">
                        <span className="mr-2">📦</span>
                        Required Spare Parts
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedTask.spareParts.map((part, index) => (
                          <span
                            key={index}
                            className="bg-gray-800/50 text-white px-3 py-2 rounded-lg border border-gray-700"
                          >
                            {part}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Notes */}
                {selectedTask.notes && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-amber-400 flex items-center">
                      <span className="mr-2">📝</span>
                      Additional Notes
                    </h4>
                    <p className="text-white p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                      {selectedTask.notes}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-800">
                  {selectedTask.status === "assigned" && (
                    <button
                      onClick={() => {
                        handleStartTask(selectedTask.id);
                        setSelectedTask(null);
                      }}
                      className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-3 px-6 rounded-xl font-semibold transition-all transform hover:scale-105"
                    >
                      Start Task
                    </button>
                  )}
                  {selectedTask.status === "in-progress" && (
                    <button
                      onClick={() => {
                        handleCompleteTask(selectedTask.id);
                        setSelectedTask(null);
                      }}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-xl font-semibold transition-all transform hover:scale-105"
                    >
                      Complete Task
                    </button>
                  )}
                  <button className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 px-6 rounded-xl font-semibold transition-all border border-gray-700">
                    Request Parts
                  </button>
                  <button className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 py-3 px-6 rounded-xl font-semibold transition-all border border-blue-500/30">
                    Contact Customer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {isUpdatingTask && selectedTask && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl border border-amber-500/30 max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold text-white">
                  Update Task Status
                </h3>
                <button
                  onClick={() => setIsUpdatingTask(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-gray-300">
                  Update status for {selectedTask.vehicleModel} (
                  {selectedTask.registrationNumber})
                </p>

                <div className="space-y-2">
                  {(
                    [
                      "assigned",
                      "in-progress",
                      "waiting-parts",
                      "completed",
                    ] as const
                  ).map((status) => (
                    <label
                      key={status}
                      className="flex items-center space-x-3 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="status"
                        value={status}
                        checked={selectedTask.status === status}
                        onChange={() =>
                          handleUpdateTaskStatus(selectedTask.id, status)
                        }
                        className="w-4 h-4 text-amber-500 bg-gray-700 border-gray-600 focus:ring-amber-500 focus:ring-2"
                      />
                      <span className="text-white capitalize">
                        {status.replace("-", " ")}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-800">
                <button
                  onClick={() => setIsUpdatingTask(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-xl font-semibold transition-all border border-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setIsUpdatingTask(false)}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-3 px-6 rounded-xl font-semibold transition-all"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerDashboard;
