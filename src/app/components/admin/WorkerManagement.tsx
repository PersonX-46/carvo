"use client";
import { useState, useEffect } from "react";

interface Worker {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  position: string;
  status: "active" | "inactive" | "on_leave";
  specialization: string[];
  totalServices: number;
  completedServices: number;
  currentWorkload: number;
  rating: number;
  hireDate: string;
  salary: number;
  totalRevenue?: number;
  inProgressServices?: number;
  services?: Service[];
  reports?: Report[];
}

interface Service {
  id: number;
  workerId: number;
  bookingId: number;
  serviceStatus: string;
  repairNotes: string | null;
  serviceCost: number | null;
  completionDate: string | null;
  customerName: string;
  customerPhone?: string;
  vehicleModel: string;
  registrationNumber?: string;
  createdAt: string;
}

interface Report {
  id: number;
  type: string;
  title: string;
  createdAt: string;
}

const WorkerManagement: React.FC = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [workerServices, setWorkerServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "details" | "add" | "edit">(
    "list"
  );
  const [activeFilter, setActiveFilter] = useState<
    "all" | "active" | "inactive" | "on_leave"
  >("all");
  const [positionFilter, setPositionFilter] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    onLeave: 0,
    inactive: 0,
  });

  // Form states for add/edit
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "mechanic",
    specialization: [] as string[],
    status: "active" as "active" | "inactive" | "on_leave",
    salary: "",
    password: "", // For new workers
  });

  // Fetch all workers
  // In fetchWorkers function, add:
  const fetchWorkers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Fetching workers from API...");
      const response = await fetch("/api/admin/workers");

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error("Failed to fetch workers");
      }

      const data = await response.json();
      console.log("Workers data:", data);

      setWorkers(data.workers);
      setStats({
        total: data.total,
        active: data.active,
        onLeave: data.onLeave,
        inactive: data.inactive,
      });
    } catch (error) {
      console.error("Error fetching workers:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load workers. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch worker details
  const fetchWorkerDetails = async (workerId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/admin/workers/${workerId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch worker details");
      }

      const data = await response.json();
      setSelectedWorker(data.worker);
      setWorkerServices(data.worker.services || []);
    } catch (error) {
      console.error("Error fetching worker details:", error);
      setError("Failed to load worker details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch worker services
  const fetchWorkerServices = async (workerId: number) => {
    try {
      const response = await fetch(
        `/api/admin/workers/${workerId}/services?limit=10`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch worker services");
      }

      const data = await response.json();
      setWorkerServices(data.services || []);
    } catch (error) {
      console.error("Error fetching worker services:", error);
    }
  };

  // Add new worker
  const handleAddWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/admin/workers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add worker");
      }

      // Refresh workers list
      await fetchWorkers();
      setViewMode("list");
      alert("Worker added successfully!");
    } catch (error) {
      console.error("Error adding worker:", error);
      setError(error instanceof Error ? error.message : "Failed to add worker");
    } finally {
      setIsLoading(false);
    }
  };

  // Update worker
  const handleUpdateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorker) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/workers/${selectedWorker.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update worker");
      }

      // Refresh workers list and details
      await fetchWorkers();
      if (viewMode === "details") {
        await fetchWorkerDetails(selectedWorker.id);
      }
      setViewMode("details");
      alert("Worker updated successfully!");
    } catch (error) {
      console.error("Error updating worker:", error);
      setError(
        error instanceof Error ? error.message : "Failed to update worker"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Delete/Deactivate worker
  const handleDeleteWorker = async (workerId: number) => {
    if (
      !confirm(
        "Are you sure you want to deactivate this worker? This will change their status to inactive."
      )
    ) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/workers/${workerId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to deactivate worker");
      }

      // Refresh workers list
      await fetchWorkers();
      if (selectedWorker?.id === workerId) {
        setViewMode("list");
        setSelectedWorker(null);
      }
      alert("Worker deactivated successfully!");
    } catch (error) {
      console.error("Error deactivating worker:", error);
      setError(
        error instanceof Error ? error.message : "Failed to deactivate worker"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchWorkers();
  }, []);

  // Handle view worker
  const handleViewWorker = (worker: Worker) => {
    setSelectedWorker(worker);
    setViewMode("details");
    fetchWorkerDetails(worker.id);
  };

  // Handle add worker button
  const handleAddWorkerClick = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      position: "mechanic",
      specialization: [],
      status: "active",
      salary: "",
      password: "",
    });
    setViewMode("add");
  };

  // Handle edit worker button
  const handleEditWorkerClick = (worker: Worker) => {
    setFormData({
      name: worker.name,
      email: worker.email,
      phone: worker.phone || "",
      position: worker.position.toLowerCase().replace(" ", "_"),
      specialization: worker.specialization || [],
      status: worker.status,
      salary: worker.salary.toString(),
      password: "", // Don't pre-fill password for security
    });
    setSelectedWorker(worker);
    setViewMode("edit");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedWorker(null);
    setWorkerServices([]);
    setError(null);
  };

  const handleSpecializationChange = (specialization: string) => {
    setFormData((prev) => ({
      ...prev,
      specialization: prev.specialization.includes(specialization)
        ? prev.specialization.filter((s) => s !== specialization)
        : [...prev.specialization, specialization],
    }));
  };

  // Filter workers
  const filteredWorkers = workers.filter((worker) => {
    const matchesSearch =
      worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.position.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      activeFilter === "all" || worker.status === activeFilter;
    const matchesPosition =
      positionFilter === "all" ||
      worker.position.toLowerCase().includes(positionFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesPosition;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { text: "Active", color: "bg-green-500/20 text-green-400" },
      inactive: { text: "Inactive", color: "bg-red-500/20 text-red-400" },
      on_leave: { text: "On Leave", color: "bg-yellow-500/20 text-yellow-400" },
    };
    return (
      statusConfig[status as keyof typeof statusConfig] || statusConfig.active
    );
  };

  const getPositionOptions = () => {
    const positions = [...new Set(workers.map((worker) => worker.position))];
    return positions;
  };

  const specializationOptions = [
    "Engine Repair",
    "Transmission",
    "Electrical",
    "Brakes",
    "Suspension",
    "Tires",
    "AC Repair",
    "Bodywork",
    "Painting",
    "Customer Service",
    "Booking Management",
    "ECU Programming",
    "General Maintenance",
    "Diagnostics",
    "Battery Service",
    "Oil Change",
  ];

  // Loading state
  if (isLoading && viewMode === "list") {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Worker Management</h2>
            <p className="text-gray-400">
              Manage workshop staff and their assignments
            </p>
          </div>
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            <p className="text-gray-400 mt-4">Loading workers...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && viewMode === "list") {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Worker Management</h2>
            <p className="text-gray-400">
              Manage workshop staff and their assignments
            </p>
          </div>
        </div>
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-6">
          <div className="flex items-center">
            <span className="text-red-400 mr-2">⚠️</span>
            <div>
              <h3 className="text-red-400 font-semibold">Error Loading Data</h3>
              <p className="text-red-300 mt-1">{error}</p>
              <button
                onClick={fetchWorkers}
                className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Worker Details View
  if (viewMode === "details" && selectedWorker) {
    const status = getStatusBadge(selectedWorker.status);

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
                {selectedWorker.name}
              </h2>
              <p className="text-gray-400">{selectedWorker.position}</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => handleEditWorkerClick(selectedWorker)}
              className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors border border-gray-700"
            >
              ✏️ Edit
            </button>
            <button
              onClick={() => handleDeleteWorker(selectedWorker.id)}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg font-medium transition-colors border border-red-500/30"
            >
              🗑️ Deactivate
            </button>
            <button className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105">
              📊 Performance
            </button>
          </div>
        </div>

        {/* Worker Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Total Services</p>
            <p className="text-2xl font-bold text-white">
              {selectedWorker.totalServices}
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Current Workload</p>
            <p className="text-2xl font-bold text-white">
              {selectedWorker.currentWorkload}
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Rating</p>
            <div className="flex items-center space-x-2">
              <p className="text-2xl font-bold text-white">
                {selectedWorker.rating.toFixed(1)}
              </p>
              <span className="text-amber-400">⭐</span>
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Status</p>
            <span
              className={`inline-block px-2 py-1 rounded-full text-xs ${status.color}`}
            >
              {status.text}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-5">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <span className="mr-2">👤</span>
              Personal Information
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-gray-400 text-sm">Email</p>
                <p className="text-white">{selectedWorker.email}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Phone</p>
                <p className="text-white">
                  {selectedWorker.phone || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Hire Date</p>
                <p className="text-white">
                  {new Date(selectedWorker.hireDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Salary</p>
                <p className="text-white">
                  RM {selectedWorker.salary.toLocaleString()}
                </p>
              </div>
              {selectedWorker.totalRevenue !== undefined && (
                <div>
                  <p className="text-gray-400 text-sm">
                    Total Revenue Generated
                  </p>
                  <p className="text-amber-400 font-semibold">
                    RM{" "}
                    {selectedWorker.totalRevenue.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Specializations */}
          <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-5">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <span className="mr-2">🔧</span>
              Specializations
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedWorker.specialization &&
              selectedWorker.specialization.length > 0 ? (
                selectedWorker.specialization.map((spec) => (
                  <span
                    key={spec}
                    className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-sm"
                  >
                    {spec}
                  </span>
                ))
              ) : (
                <p className="text-gray-400">No specializations assigned</p>
              )}
            </div>
          </div>
        </div>

        {/* Current Services */}
        <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-5">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <span className="mr-2">📋</span>
            Recent Services ({workerServices.length})
          </h3>
          {isLoading ? (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500"></div>
              <p className="text-gray-400 mt-2">Loading services...</p>
            </div>
          ) : workerServices.length === 0 ? (
            <p className="text-gray-400 text-center py-4">
              No services found for this worker.
            </p>
          ) : (
            <div className="space-y-3">
              {workerServices.map((service) => (
                <div
                  key={service.id}
                  className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white font-medium">
                        {service.customerName}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {service.vehicleModel}{" "}
                        {service.registrationNumber
                          ? `(${service.registrationNumber})`
                          : ""}
                      </p>
                      {service.customerPhone && (
                        <p className="text-gray-400 text-sm">
                          {service.customerPhone}
                        </p>
                      )}
                      {service.repairNotes && (
                        <p className="text-gray-400 text-sm mt-1">
                          {service.repairNotes}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs ${
                          service.serviceStatus === "Completed"
                            ? "bg-green-500/20 text-green-400"
                            : service.serviceStatus === "In Progress"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-orange-500/20 text-orange-400"
                        }`}
                      >
                        {service.serviceStatus}
                      </span>
                      {service.serviceCost && (
                        <p className="text-amber-400 font-semibold mt-1">
                          RM {service.serviceCost.toFixed(2)}
                        </p>
                      )}
                      {service.completionDate && (
                        <p className="text-gray-400 text-xs mt-1">
                          {new Date(
                            service.completionDate
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {workerServices.length > 0 && (
            <button
              onClick={() => fetchWorkerServices(selectedWorker.id)}
              className="mt-4 text-amber-400 hover:text-amber-300 text-sm font-medium"
            >
              View All Services →
            </button>
          )}
        </div>
      </div>
    );
  }

  // Add/Edit Worker Form
  if (viewMode === "add" || viewMode === "edit") {
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
                {viewMode === "add" ? "Add New Worker" : "Edit Worker"}
              </h2>
              <p className="text-gray-400">
                {viewMode === "add"
                  ? "Create a new worker account"
                  : `Editing ${selectedWorker?.name}`}
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4">
            <div className="flex items-center">
              <span className="text-red-400 mr-2">⚠️</span>
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Worker Form */}
        <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
          <form
            onSubmit={viewMode === "add" ? handleAddWorker : handleUpdateWorker}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  placeholder="Enter full name"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  placeholder="Enter email address"
                  disabled={isLoading}
                />
              </div>

              {viewMode === "add" && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Temporary Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                    placeholder="Enter temporary password"
                    disabled={isLoading}
                  />
                  <p className="text-gray-400 text-xs mt-1">
                    Worker should change this on first login
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  placeholder="Enter phone number"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Position *
                </label>
                <select
                  value={formData.position}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      position: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  disabled={isLoading}
                >
                  <option value="mechanic">Mechanic</option>
                  <option value="senior_mechanic">Senior Mechanic</option>
                  <option value="electrical_specialist">
                    Electrical Specialist
                  </option>
                  <option value="service_advisor">Service Advisor</option>
                  <option value="painter">Painter</option>
                  <option value="trainee">Trainee</option>
                  <option value="workshop_manager">Workshop Manager</option>
                  <option value="quality_controller">Quality Controller</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value as
                        | "active"
                        | "inactive"
                        | "on_leave",
                    }))
                  }
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  disabled={isLoading}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on_leave">On Leave</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Monthly Salary (RM) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.salary}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, salary: e.target.value }))
                  }
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  placeholder="Enter monthly salary"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Specializations */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Specializations
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {specializationOptions.map((spec) => (
                  <label key={spec} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.specialization.includes(spec)}
                      onChange={() => handleSpecializationChange(spec)}
                      className="w-4 h-4 text-amber-500 bg-gray-800 border-gray-700 rounded focus:ring-amber-500"
                      disabled={isLoading}
                    />
                    <span className="text-gray-300 text-sm">{spec}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex space-x-4 pt-6 border-t border-gray-800">
              <button
                type="button"
                onClick={handleBackToList}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white rounded-xl font-medium transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {viewMode === "add" ? "Adding..." : "Updating..."}
                  </div>
                ) : viewMode === "add" ? (
                  "Add Worker"
                ) : (
                  "Update Worker"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Main List View
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Worker Management</h2>
          <p className="text-gray-400">
            Manage workshop staff and their assignments
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleAddWorkerClick}
            className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105"
          >
            ➕ Add Worker
          </button>
          <button
            onClick={fetchWorkers}
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors border border-gray-700"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{stats.total}</p>
          <p className="text-gray-400 text-sm">Total Workers</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{stats.active}</p>
          <p className="text-gray-400 text-sm">Active Workers</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{stats.onLeave}</p>
          <p className="text-gray-400 text-sm">On Leave</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{stats.inactive}</p>
          <p className="text-gray-400 text-sm">Inactive</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search workers by name, email, or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
            />
            <span className="absolute right-3 top-3 text-gray-400">🔍</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={positionFilter}
            onChange={(e) => setPositionFilter(e.target.value)}
            className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
          >
            <option value="all">All Positions</option>
            {getPositionOptions().map((position) => (
              <option key={position} value={position}>
                {position}
              </option>
            ))}
          </select>
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-4 py-3 rounded-xl font-medium transition-colors ${
              activeFilter === "all"
                ? "bg-amber-500 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveFilter("active")}
            className={`px-4 py-3 rounded-xl font-medium transition-colors ${
              activeFilter === "active"
                ? "bg-amber-500 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveFilter("on_leave")}
            className={`px-4 py-3 rounded-xl font-medium transition-colors ${
              activeFilter === "on_leave"
                ? "bg-amber-500 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            On Leave
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4">
          <div className="flex items-center">
            <span className="text-red-400 mr-2">⚠️</span>
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Workers List */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            <p className="text-gray-400 mt-2">Loading workers...</p>
          </div>
        ) : filteredWorkers.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-400">
              No workers found matching your search.
            </p>
            <button
              onClick={handleAddWorkerClick}
              className="mt-4 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Add Your First Worker
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {filteredWorkers.map((worker) => {
              const status = getStatusBadge(worker.status);
              return (
                <div
                  key={worker.id}
                  className="p-4 hover:bg-gray-800/30 transition-colors cursor-pointer"
                  onClick={() => handleViewWorker(worker)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center">
                        <span className="text-amber-400 font-semibold">
                          {worker.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">
                          {worker.name}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {worker.position}
                        </p>
                        <p className="text-gray-400 text-sm">{worker.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <p className="text-white font-bold">
                              {worker.totalServices}
                            </p>
                            <p className="text-gray-400 text-xs">Services</p>
                          </div>
                          <div className="text-center">
                            <p className="text-white font-bold">
                              {worker.currentWorkload}
                            </p>
                            <p className="text-gray-400 text-xs">Workload</p>
                          </div>
                          <div className="text-center">
                            <p className="text-white font-bold">
                              {worker.rating.toFixed(1)}
                            </p>
                            <p className="text-gray-400 text-xs">Rating</p>
                          </div>
                        </div>
                        <span
                          className={`inline-block mt-2 px-2 py-1 rounded-full text-xs ${status.color}`}
                        >
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
      </div>
    </div>
  );
};

export default WorkerManagement;
