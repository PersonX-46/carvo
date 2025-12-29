"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface CustomerVehicle {
  id: number;
  model: string;
  registrationNumber: string;
  year: number | null;
  type: string | null;
}

interface ServiceType {
  id: number;
  name: string;
  description: string;
  priceRange: {
    min: number;
    max: number;
    typical: number;
  };
  estimatedDuration: number;
  category: string;
}

interface TimeSlot {
  date: string;
  time: string;
  available: boolean;
  hour: number;
  minute: number;
}

const BookService: React.FC = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [vehicles, setVehicles] = useState<CustomerVehicle[]>([]);
  const [services, setServices] = useState<ServiceType[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    vehicleId: "",
    serviceType: "",
    bookingDate: "",
    bookingTime: "",
    reportedIssue: "",
    urgency: "medium" as "low" | "medium" | "high",
    specialRequests: "",
  });

  // Fetch vehicles and services on component mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Fetch available time slots when date is selected
  useEffect(() => {
    if (formData.bookingDate) {
      fetchAvailableSlots();
    }
  }, [formData.bookingDate]);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      setError("");

      const [vehiclesResponse, servicesResponse] = await Promise.all([
        fetch("/api/customer/vehicles"),
        fetch("/api/customer/services/book-service"),
      ]);

      if (!vehiclesResponse.ok) throw new Error("Failed to fetch vehicles");
      if (!servicesResponse.ok) throw new Error("Failed to fetch services");

      const vehiclesData = await vehiclesResponse.json();
      const servicesData = await servicesResponse.json();

      setVehicles(vehiclesData.vehicles || []);
      setServices(servicesData.services || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load service data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/customer/available-slots?date=${formData.bookingDate}`
      );

      if (!response.ok) throw new Error("Failed to fetch available slots");

      const slots = await response.json();
      setAvailableSlots(slots.availableSlots || []);
    } catch (error) {
      console.error("Error fetching slots:", error);
      setError("Failed to load available time slots");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleServiceSelect = (serviceType: string) => {
    setFormData((prev) => ({
      ...prev,
      serviceType,
    }));
    setStep(2);
  };

  const handleVehicleSelect = (vehicleId: string) => {
    setFormData((prev) => ({
      ...prev,
      vehicleId,
    }));
    setStep(3);
  };

  const handleDateSelect = (date: string) => {
    setFormData((prev) => ({
      ...prev,
      bookingDate: date,
    }));
  };

  const handleTimeSelect = (time: string) => {
    setFormData((prev) => ({
      ...prev,
      bookingTime: time,
    }));
    setStep(4);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.vehicleId ||
      !formData.serviceType ||
      !formData.bookingDate ||
      !formData.bookingTime
    ) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const bookingData = {
        vehicleId: parseInt(formData.vehicleId),
        serviceType: formData.serviceType,
        bookingDate: `${formData.bookingDate}T${formData.bookingTime}`,
        reportedIssue: formData.reportedIssue,
        urgency: formData.urgency,
        specialRequests: formData.specialRequests,
      };

      const response = await fetch("/api/customer/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create booking");
      }

      const result = await response.json();

      // Redirect to booking management with success message
      router.push("/customer?tab=bookings&bookingCreated=true");
    } catch (error) {
      console.error("Error creating booking:", error);
      setError(
        error instanceof Error ? error.message : "Failed to create booking"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedVehicle = () => {
    return vehicles.find(
      (vehicle) => vehicle.id === parseInt(formData.vehicleId)
    );
  };

  const getServiceCategories = () => {
    const categories = [
      ...new Set(services.map((service) => service.category)),
    ];
    return categories;
  };

  const getServicesByCategory = (category: string) => {
    return services.filter((service) => service.category === category);
  };

  // Generate next 30 days for date selection (excluding weekends)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      // Skip weekends (Saturday = 6, Sunday = 0)
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        dates.push(date.toISOString().split("T")[0]);
      }
    }

    return dates;
  };

  if (isLoading && step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            <p className="text-gray-400 mt-4">Loading services...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Book Your Service
          </h1>
          <p className="text-gray-400 text-lg">
            Schedule your vehicle service in a few simple steps
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 font-semibold ${
                    step >= stepNumber
                      ? "bg-amber-500 border-amber-500 text-white"
                      : "border-gray-600 text-gray-400"
                  }`}
                >
                  {stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div
                    className={`w-16 h-1 ${
                      step > stepNumber ? "bg-amber-500" : "bg-gray-600"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Labels */}
        <div className="flex justify-between text-sm text-gray-400 mb-8 px-4">
          <span className={step >= 1 ? "text-amber-400" : ""}>
            Service Type
          </span>
          <span className={step >= 2 ? "text-amber-400" : ""}>Vehicle</span>
          <span className={step >= 3 ? "text-amber-400" : ""}>Date & Time</span>
          <span className={step >= 4 ? "text-amber-400" : ""}>Details</span>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6">
            <div className="flex items-center">
              <span className="text-red-400 mr-2">⚠️</span>
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Step 1: Service Selection */}
        {/* Step 1: Service Selection */}
        {step === 1 && (
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              Select Service Type
            </h2>
            <p className="text-gray-400 mb-6">
              Choose the service your vehicle needs. Price depends on vehicle
              model and condition.
            </p>

            <div className="space-y-6">
              {getServiceCategories().map((category) => (
                <div key={category}>
                  <h3 className="text-lg font-semibold text-amber-400 mb-4">
                    {category}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getServicesByCategory(category).map((service) => (
                      <div
                        key={service.id}
                        onClick={() => handleServiceSelect(service.name)}
                        className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 cursor-pointer hover:border-amber-500/50 hover:bg-gray-800 transition-all duration-200 group"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-white font-semibold">
                            {service.name}
                          </h4>
                          <div className="text-right">
                            <div className="text-amber-400 font-bold">
                              RM {service.priceRange.typical}
                            </div>
                            <div className="text-xs text-gray-400">
                              Typically
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-400 text-sm mb-3">
                          {service.description}
                        </p>

                        {/* Price Range Indicator */}
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>From RM {service.priceRange.min}</span>
                            <span>To RM {service.priceRange.max}</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-amber-400 to-amber-600 h-2 rounded-full"
                              style={{
                                width: `${
                                  ((service.priceRange.typical -
                                    service.priceRange.min) /
                                    (service.priceRange.max -
                                      service.priceRange.min)) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>⏱️ {service.estimatedDuration}h</span>
                          <span className="text-amber-400 group-hover:scale-110 transition-transform">
                            *Final price after inspection
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Price Explanation */}
            <div className="mt-6 p-4 bg-gray-800/30 rounded-xl border border-amber-500/20">
              <div className="flex items-start">
                <span className="text-amber-400 mr-3 text-lg">💡</span>
                <div>
                  <h4 className="text-amber-400 font-semibold mb-1">
                    How Prices Are Determined
                  </h4>
                  <p className="text-gray-300 text-sm">
                    Final service cost depends on: Vehicle model & age • Parts
                    condition • Required materials • Labor intensity
                  </p>
                  <p className="text-gray-400 text-xs mt-2">
                    You'll receive an exact quote after vehicle inspection for
                    approval.
                  </p>
                </div>
              </div>
            </div>

            {/* Custom Service Option */}
            <div className="mt-8 p-4 border border-dashed border-gray-600 rounded-xl">
              <div className="text-center">
                <h3 className="text-white font-semibold mb-2">
                  Don't see what you need?
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Describe your issue and we'll recommend the right service
                </p>
                <button
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      serviceType: "Custom Service",
                    }));
                    setStep(2);
                  }}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Describe Custom Issue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Vehicle Selection */}
        {step === 2 && (
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
            <div className="flex items-center mb-6">
              <button
                onClick={() => setStep(1)}
                className="text-gray-400 hover:text-white mr-4 transition-colors p-2 hover:bg-gray-800 rounded-lg"
              >
                ← Back
              </button>
              <h2 className="text-2xl font-bold text-white">Select Vehicle</h2>
            </div>

            {vehicles.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4 text-6xl">🚗</div>
                <h3 className="text-white font-semibold mb-2">
                  No Vehicles Found
                </h3>
                <p className="text-gray-400 mb-4">
                  You need to add a vehicle before booking a service
                </p>
                <button
                  onClick={() => router.push("/customer?tab=vehicles")}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Add Vehicle
                </button>
              </div>
            ) : (
              <>
                <p className="text-gray-400 mb-6">
                  Choose which vehicle needs service
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {vehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      onClick={() => handleVehicleSelect(vehicle.id.toString())}
                      className={`bg-gray-800/50 border rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                        formData.vehicleId === vehicle.id.toString()
                          ? "border-amber-500 bg-amber-500/10"
                          : "border-gray-700 hover:border-amber-500/50 hover:bg-gray-800"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-white font-semibold">
                          {vehicle.model}
                        </h4>
                        {vehicle.year && (
                          <span className="text-gray-400 text-sm">
                            {vehicle.year}
                          </span>
                        )}
                      </div>
                      <div className="text-gray-400 text-sm mb-2">
                        {vehicle.registrationNumber}
                      </div>
                      {vehicle.type && (
                        <div className="text-xs text-amber-400">
                          {vehicle.type}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => router.push("/customer?tab=vehicles")}
                  className="w-full bg-gray-800/50 border border-dashed border-gray-600 hover:border-amber-500/50 text-gray-400 hover:text-white py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <span>+</span>
                  <span>Add New Vehicle</span>
                </button>
              </>
            )}
          </div>
        )}

        {/* Step 3: Date & Time Selection */}
        {step === 3 && (
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
            <div className="flex items-center mb-6">
              <button
                onClick={() => setStep(2)}
                className="text-gray-400 hover:text-white mr-4 transition-colors p-2 hover:bg-gray-800 rounded-lg"
              >
                ← Back
              </button>
              <h2 className="text-2xl font-bold text-white">
                Select Date & Time
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Date Selection */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Available Dates
                </h3>
                <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1">
                  {getAvailableDates().map((date) => {
                    const dateObj = new Date(date);
                    const isSelected = formData.bookingDate === date;
                    const isToday =
                      date === new Date().toISOString().split("T")[0];

                    return (
                      <div
                        key={date}
                        onClick={() => handleDateSelect(date)}
                        className={`p-3 border rounded-lg text-center cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? "border-amber-500 bg-amber-500/10 text-amber-400"
                            : "border-gray-700 hover:border-amber-500/50 text-gray-300 hover:text-white"
                        }`}
                      >
                        <div className="font-semibold text-lg">
                          {dateObj.getDate()}
                        </div>
                        <div className="text-sm">
                          {dateObj.toLocaleDateString("en-US", {
                            month: "short",
                          })}
                        </div>
                        <div className="text-xs text-gray-400">
                          {dateObj.toLocaleDateString("en-US", {
                            weekday: "short",
                          })}
                        </div>
                        {isToday && (
                          <div className="text-xs text-amber-400 mt-1">
                            Today
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Time Selection */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Available Times
                </h3>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500"></div>
                    <p className="text-gray-400 mt-2">
                      Loading available slots...
                    </p>
                  </div>
                ) : formData.bookingDate ? (
                  <div className="grid grid-cols-3 gap-3 max-h-60 overflow-y-auto p-1">
                    {availableSlots.map((slot) => (
                      <div
                        key={slot.time}
                        onClick={() =>
                          slot.available && handleTimeSelect(slot.time)
                        }
                        className={`p-3 border rounded-lg text-center cursor-pointer transition-all duration-200 ${
                          slot.available
                            ? formData.bookingTime === slot.time
                              ? "border-amber-500 bg-amber-500/10 text-amber-400"
                              : "border-gray-700 hover:border-amber-500/50 text-gray-300 hover:text-white"
                            : "border-gray-800 bg-gray-900/50 text-gray-600 cursor-not-allowed"
                        }`}
                      >
                        {slot.time}
                        {!slot.available && (
                          <div className="text-xs text-red-400 mt-1">
                            Booked
                          </div>
                        )}
                      </div>
                    ))}
                    {availableSlots.length === 0 && (
                      <div className="col-span-3 text-center py-8 text-gray-400">
                        No available slots for this date
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    Please select a date first
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Final Details & Confirmation */}
        {step === 4 && (
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
            <div className="flex items-center mb-6">
              <button
                onClick={() => setStep(3)}
                className="text-gray-400 hover:text-white mr-4 transition-colors p-2 hover:bg-gray-800 rounded-lg"
              >
                ← Back
              </button>
              <h2 className="text-2xl font-bold text-white">Service Details</h2>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
                {/* In Step 4 - Booking Summary */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-amber-400">
                    Booking Summary
                  </h3>

                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Service:</span>
                        <span className="text-white font-semibold">
                          {formData.serviceType}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Vehicle:</span>
                        <span className="text-white font-semibold">
                          {getSelectedVehicle()?.model} (
                          {getSelectedVehicle()?.registrationNumber})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Date & Time:</span>
                        <span className="text-white font-semibold">
                          {new Date(
                            `${formData.bookingDate}T${formData.bookingTime}`
                          ).toLocaleString("en-US", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      {/* Dynamic Price Estimate */}
                      <div className="pt-3 border-t border-gray-700">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-400">Cost Estimate:</span>
                          {(() => {
                            const selectedService = services.find(
                              (s) => s.name === formData.serviceType
                            );
                            if (selectedService) {
                              return (
                                <div className="text-right">
                                  <div className="text-amber-400 font-bold text-lg">
                                    RM {selectedService.priceRange.typical}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    Typically • Range: RM{" "}
                                    {selectedService.priceRange.min} -{" "}
                                    {selectedService.priceRange.max}
                                  </div>
                                </div>
                              );
                            }
                            return (
                              <span className="text-amber-400 font-bold text-lg">
                                To be determined
                              </span>
                            );
                          })()}
                        </div>
                        <div className="text-xs text-gray-400">
                          *Final price will be confirmed after vehicle
                          inspection
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-amber-400">
                    Additional Information
                  </h3>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">
                      Describe the Issue *
                    </label>
                    <textarea
                      name="reportedIssue"
                      value={formData.reportedIssue}
                      onChange={handleInputChange}
                      placeholder="Please describe any symptoms, noises, or issues you've noticed with your vehicle..."
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none transition-colors"
                      rows={4}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">
                      Urgency Level
                    </label>
                    <select
                      name="urgency"
                      value={formData.urgency}
                      onChange={handleInputChange}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl p-3 text-white focus:border-amber-500 focus:outline-none transition-colors"
                    >
                      <option value="low">Low - Convenience service</option>
                      <option value="medium">
                        Medium - Should be addressed soon
                      </option>
                      <option value="high">
                        High - Needs immediate attention
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">
                      Special Requests (Optional)
                    </label>
                    <textarea
                      name="specialRequests"
                      value={formData.specialRequests}
                      onChange={handleInputChange}
                      placeholder="Any special instructions or requests..."
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none transition-colors"
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              {/* Price Approval Notice */}
              <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4 mb-6">
                <div className="flex items-start">
                  <span className="text-blue-400 mr-3 text-lg">💡</span>
                  <div>
                    <h4 className="text-blue-400 font-semibold mb-1">
                      Price Approval Process
                    </h4>
                    <p className="text-blue-300 text-sm">
                      After you submit this booking, our technician will inspect
                      your vehicle and provide a detailed cost estimate. You'll
                      need to approve the price before any work begins. You can
                      accept or reject the quote based on your budget.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-4 px-6 rounded-xl font-semibold transition-colors border border-gray-700"
                >
                  Back to Time Selection
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-4 px-6 rounded-xl font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating Booking...
                    </>
                  ) : (
                    "Confirm Booking Request"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookService;
