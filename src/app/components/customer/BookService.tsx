"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, Car, AlertCircle, CheckCircle, Loader2 } from "lucide-react";

interface CustomerVehicle {
  id: number;
  model: string;
  registrationNumber: string;
  year: number | null;
  type: string | null;
  color: string | null;
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
  isPast?: boolean;
}

const BookService: React.FC = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [vehicles, setVehicles] = useState<CustomerVehicle[]>([]);
  const [services, setServices] = useState<ServiceType[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState({
    initial: true,
    slots: false,
    submitting: false,
  });
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

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

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(prev => ({ ...prev, initial: true }));
        setError("");

        // Fetch vehicles and services in parallel
        const [vehiclesResponse, servicesResponse] = await Promise.all([
          fetch("/api/customer/vehicles"),
          fetch("/api/customer/services/book-service"),
        ]);

        if (!vehiclesResponse.ok) {
          throw new Error(`Failed to fetch vehicles: ${vehiclesResponse.status}`);
        }
        if (!servicesResponse.ok) {
          throw new Error(`Failed to fetch services: ${servicesResponse.status}`);
        }

        const vehiclesData = await vehiclesResponse.json();
        const servicesData = await servicesResponse.json();

        setVehicles(vehiclesData.vehicles || []);
        setServices(servicesData.services || []);
        
        // Generate available dates (next 30 days excluding weekends)
        generateAvailableDates();
        
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error instanceof Error ? error.message : "Failed to load service data");
      } finally {
        setIsLoading(prev => ({ ...prev, initial: false }));
      }
    };

    fetchInitialData();
  }, []);

  // Fetch available slots when date changes
  useEffect(() => {
    if (formData.bookingDate) {
      fetchAvailableSlots(formData.bookingDate);
    } else {
      setAvailableSlots([]);
    }
  }, [formData.bookingDate]);

  const generateAvailableDates = () => {
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
    
    setAvailableDates(dates);
  };

  const fetchAvailableSlots = async (date: string) => {
    try {
      setIsLoading(prev => ({ ...prev, slots: true }));
      setError("");

      const response = await fetch(`/api/customer/available-slots?date=${date}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch available slots");
      }

      const data = await response.json();
      setAvailableSlots(data.availableSlots || []);
      
      // If no slots available, show message
      if (data.availableSlots.length === 0) {
        setError("No available time slots for this date. Please select another date.");
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
      setError(error instanceof Error ? error.message : "Failed to load available time slots");
      setAvailableSlots([]);
    } finally {
      setIsLoading(prev => ({ ...prev, slots: false }));
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError(""); // Clear error when user makes changes
  };

  const handleServiceSelect = (serviceType: string) => {
    setFormData(prev => ({
      ...prev,
      serviceType,
    }));
    setStep(2);
  };

  const handleVehicleSelect = (vehicleId: string) => {
    setFormData(prev => ({
      ...prev,
      vehicleId,
    }));
    setStep(3);
  };

  const handleDateSelect = (date: string) => {
    setFormData(prev => ({
      ...prev,
      bookingDate: date,
      bookingTime: "", // Reset time when date changes
    }));
  };

  const handleTimeSelect = (time: string) => {
    setFormData(prev => ({
      ...prev,
      bookingTime: time,
    }));
    setStep(4);
  };

  const validateForm = () => {
    const errors: string[] = [];

    if (!formData.vehicleId) errors.push("Please select a vehicle");
    if (!formData.serviceType) errors.push("Please select a service type");
    if (!formData.bookingDate) errors.push("Please select a date");
    if (!formData.bookingTime) errors.push("Please select a time");
    if (!formData.reportedIssue.trim()) errors.push("Please describe the issue");

    if (errors.length > 0) {
      setError(errors.join(". "));
      return false;
    }

    // Validate time slot is still available
    const selectedSlot = availableSlots.find(slot => slot.time === formData.bookingTime);
    if (!selectedSlot?.available) {
      setError("This time slot is no longer available. Please select another time.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsLoading(prev => ({ ...prev, submitting: true }));
      setError("");
      setSuccess("");

      // Format booking date properly
      const bookingDateTime = `${formData.bookingDate}T${formData.bookingTime}:00`;

      const bookingData = {
        vehicleId: parseInt(formData.vehicleId),
        serviceType: formData.serviceType,
        bookingDate: bookingDateTime,
        reportedIssue: formData.reportedIssue,
        urgency: formData.urgency,
        specialRequests: formData.specialRequests,
      };

      console.log("Creating booking with data:", bookingData);

      const response = await fetch("/api/customer/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || `Failed to create booking (${response.status})`);
      }

      // Success!
      setSuccess("Booking created successfully! Redirecting to your bookings...");
      
      // Clear form
      setFormData({
        vehicleId: "",
        serviceType: "",
        bookingDate: "",
        bookingTime: "",
        reportedIssue: "",
        urgency: "medium",
        specialRequests: "",
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/customer?tab=bookings&success=true");
      }, 2000);

    } catch (error) {
      console.error("Booking creation error:", error);
      setError(error instanceof Error ? error.message : "Failed to create booking. Please try again.");
    } finally {
      setIsLoading(prev => ({ ...prev, submitting: false }));
    }
  };

  const getSelectedVehicle = () => {
    return vehicles.find(
      (vehicle) => vehicle.id === parseInt(formData.vehicleId)
    );
  };

  const getSelectedService = () => {
    return services.find(
      (service) => service.name === formData.serviceType
    );
  };

  const getServiceCategories = () => {
    const categories = [
      ...new Set(services.map((service) => service.category)),
    ];
    return categories.filter(Boolean);
  };

  const getServicesByCategory = (category: string) => {
    return services.filter((service) => service.category === category);
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((stepNumber) => (
        <div key={stepNumber} className="flex items-center">
          <div className={`flex flex-col items-center ${stepNumber <= step ? 'text-amber-500' : 'text-gray-500'}`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 font-bold text-lg transition-all duration-300 ${
              stepNumber === step
                ? 'border-amber-500 bg-amber-500 text-white scale-110'
                : stepNumber < step
                ? 'border-amber-500 bg-amber-500/20 text-amber-500'
                : 'border-gray-600 text-gray-400'
            }`}>
              {stepNumber < step ? "✓" : stepNumber}
            </div>
            <div className="mt-2 text-xs font-medium capitalize">
              {stepNumber === 1 && "Service"}
              {stepNumber === 2 && "Vehicle"}
              {stepNumber === 3 && "Date & Time"}
              {stepNumber === 4 && "Details"}
            </div>
          </div>
          {stepNumber < 4 && (
            <div className={`w-16 h-1 mx-2 ${
              stepNumber < step ? 'bg-amber-500' : 'bg-gray-700'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  if (isLoading.initial) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-amber-500 mb-4"></div>
            <h2 className="text-2xl font-bold text-white mb-2">Loading Services</h2>
            <p className="text-gray-400">Preparing your booking experience...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Book Your Service
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Schedule professional vehicle service in minutes. Choose your service, vehicle, and preferred time.
          </p>
        </div>

        {/* Step Indicator */}
        <StepIndicator />

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 animate-fadeIn">
            <div className="flex items-start">
              <AlertCircle className="text-red-400 mt-0.5 mr-3 flex-shrink-0" size={20} />
              <div>
                <h3 className="text-red-400 font-semibold mb-1">Error</h3>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-500/10 border border-green-500/30 rounded-xl p-4 animate-fadeIn">
            <div className="flex items-start">
              <CheckCircle className="text-green-400 mt-0.5 mr-3 flex-shrink-0" size={20} />
              <div>
                <h3 className="text-green-400 font-semibold mb-1">Success!</h3>
                <p className="text-green-300 text-sm">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Service Selection */}
        {step === 1 && (
          <div className="animate-slideIn">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6 md:p-8">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-amber-500/20 rounded-xl mr-4">
                  <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Select Service Type</h2>
                  <p className="text-gray-400">Choose the service your vehicle needs</p>
                </div>
              </div>

              {services.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4 text-6xl">🔧</div>
                  <h3 className="text-white font-semibold mb-2">No Services Available</h3>
                  <p className="text-gray-400 mb-6">Please check back later or contact us for assistance.</p>
                  <button
                    onClick={() => router.push("/customer")}
                    className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    Return to Dashboard
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-8">
                    {getServiceCategories().map((category) => (
                      <div key={category}>
                        <h3 className="text-xl font-bold text-amber-400 mb-4 flex items-center">
                          <span className="mr-2">📋</span>
                          {category}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {getServicesByCategory(category).map((service) => (
                            <div
                              key={service.id}
                              onClick={() => handleServiceSelect(service.name)}
                              className={`bg-gray-800/50 border rounded-xl p-5 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${
                                formData.serviceType === service.name
                                  ? "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/20"
                                  : "border-gray-700 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10"
                              }`}
                            >
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h4 className="text-white font-bold text-lg mb-1">{service.name}</h4>
                                  <div className="text-amber-400 font-bold text-xl">
                                    RM {service.priceRange.typical}
                                    <span className="text-gray-400 text-sm font-normal ml-2">typically</span>
                                  </div>
                                </div>
                                <div className="bg-gray-900/50 rounded-lg px-2 py-1">
                                  <span className="text-gray-400 text-sm">{service.estimatedDuration}h</span>
                                </div>
                              </div>
                              <p className="text-gray-400 text-sm mb-4 line-clamp-2">{service.description}</p>
                              
                              <div className="space-y-2">
                                <div className="flex justify-between text-xs text-gray-500">
                                  <span>From RM {service.priceRange.min}</span>
                                  <span>To RM {service.priceRange.max}</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-amber-400 to-amber-600 h-2 rounded-full transition-all duration-500"
                                    style={{
                                      width: `${(
                                        ((service.priceRange.typical - service.priceRange.min) /
                                          (service.priceRange.max - service.priceRange.min)) *
                                        100
                                      )}%`,
                                    }}
                                  />
                                </div>
                              </div>

                              {formData.serviceType === service.name && (
                                <div className="mt-4 flex items-center text-amber-400 text-sm">
                                  <CheckCircle size={16} className="mr-2" />
                                  Selected
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Custom Service Option */}
                  <div className="mt-10 p-5 border border-dashed border-gray-600 rounded-xl bg-gray-900/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-semibold mb-1">Need something specific?</h3>
                        <p className="text-gray-400 text-sm">
                          Describe your issue and we'll recommend the right service
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            serviceType: "Custom Service",
                          }));
                          setStep(2);
                        }}
                        className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors whitespace-nowrap"
                      >
                        Request Custom Service
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Vehicle Selection */}
        {step === 2 && (
          <div className="animate-slideIn">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6 md:p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <button
                    onClick={() => setStep(1)}
                    className="text-gray-400 hover:text-white mr-4 transition-colors p-2 hover:bg-gray-800 rounded-lg"
                  >
                    ← Back
                  </button>
                  <div className="p-3 bg-blue-500/20 rounded-xl mr-4">
                    <Car className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Select Vehicle</h2>
                    <p className="text-gray-400">Choose which vehicle needs service</p>
                  </div>
                </div>
              </div>

              {vehicles.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4 text-6xl">🚗</div>
                  <h3 className="text-white font-semibold mb-2">No Vehicles Found</h3>
                  <p className="text-gray-400 mb-6">You need to add a vehicle before booking a service</p>
                  <button
                    onClick={() => router.push("/customer?tab=vehicles")}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    Add Vehicle
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {vehicles.map((vehicle) => (
                      <div
                        key={vehicle.id}
                        onClick={() => handleVehicleSelect(vehicle.id.toString())}
                        className={`bg-gray-800/50 border rounded-xl p-5 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${
                          formData.vehicleId === vehicle.id.toString()
                            ? "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/20"
                            : "border-gray-700 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="text-white font-bold text-lg">{vehicle.model}</h4>
                            <p className="text-gray-400 text-sm">{vehicle.registrationNumber}</p>
                          </div>
                          {vehicle.year && (
                            <span className="text-gray-400 text-sm bg-gray-900/50 px-2 py-1 rounded">
                              {vehicle.year}
                            </span>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          {vehicle.type && (
                            <div className="flex items-center text-gray-400 text-sm">
                              <span className="mr-2">🎯</span>
                              {vehicle.type}
                            </div>
                          )}
                          {vehicle.color && (
                            <div className="flex items-center text-gray-400 text-sm">
                              <span className="mr-2">🎨</span>
                              {vehicle.color}
                            </div>
                          )}
                        </div>

                        {formData.vehicleId === vehicle.id.toString() && (
                          <div className="mt-4 flex items-center text-amber-400 text-sm">
                            <CheckCircle size={16} className="mr-2" />
                            Selected
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => router.push("/customer?tab=vehicles")}
                    className="w-full bg-gray-800/50 border border-dashed border-gray-600 hover:border-amber-500/50 text-gray-400 hover:text-white py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-3"
                  >
                    <span className="text-2xl">+</span>
                    <span className="font-medium">Add New Vehicle</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Date & Time Selection */}
        {step === 3 && (
          <div className="animate-slideIn">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6 md:p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <button
                    onClick={() => setStep(2)}
                    className="text-gray-400 hover:text-white mr-4 transition-colors p-2 hover:bg-gray-800 rounded-lg"
                  >
                    ← Back
                  </button>
                  <div className="p-3 bg-green-500/20 rounded-xl mr-4">
                    <Calendar className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Select Date & Time</h2>
                    <p className="text-gray-400">Choose your preferred appointment slot</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Date Selection */}
                <div>
                  <div className="flex items-center mb-4">
                    <Calendar className="text-amber-400 mr-2" size={20} />
                    <h3 className="text-lg font-semibold text-white">Available Dates</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto p-2">
                    {availableDates.map((date) => {
                      const dateObj = new Date(date);
                      const isSelected = formData.bookingDate === date;
                      const isToday = date === new Date().toISOString().split("T")[0];
                      const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" });

                      return (
                        <button
                          key={date}
                          type="button"
                          onClick={() => handleDateSelect(date)}
                          className={`p-4 border rounded-xl text-center transition-all duration-300 transform hover:-translate-y-1 ${
                            isSelected
                              ? "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/20"
                              : "border-gray-700 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10"
                          }`}
                        >
                          <div className="text-2xl font-bold text-white mb-1">
                            {dateObj.getDate()}
                          </div>
                          <div className="text-sm text-gray-300 mb-1">
                            {dateObj.toLocaleDateString("en-US", { month: "short" })}
                          </div>
                          <div className={`text-xs font-medium ${isToday ? "text-amber-400" : "text-gray-400"}`}>
                            {isToday ? "TODAY" : dayName}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time Selection */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Clock className="text-amber-400 mr-2" size={20} />
                      <h3 className="text-lg font-semibold text-white">
                        Available Times {formData.bookingDate && `for ${formData.bookingDate}`}
                      </h3>
                    </div>
                    {formData.bookingDate && (
                      <button
                        onClick={() => fetchAvailableSlots(formData.bookingDate)}
                        className="text-sm text-amber-400 hover:text-amber-300"
                      >
                        Refresh
                      </button>
                    )}
                  </div>

                  {isLoading.slots ? (
                    <div className="text-center py-12">
                      <Loader2 className="inline-block animate-spin text-amber-400 mb-4" size={32} />
                      <p className="text-gray-400">Loading available time slots...</p>
                    </div>
                  ) : formData.bookingDate ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-2">
                      {availableSlots.map((slot) => {
                        const isSelected = formData.bookingTime === slot.time;
                        const isBooked = !slot.available;
                        const isPast = slot.isPast || false;

                        return (
                          <button
                            key={slot.time}
                            type="button"
                            onClick={() => !isBooked && !isPast && handleTimeSelect(slot.time)}
                            disabled={isBooked || isPast}
                            className={`p-4 border rounded-xl text-center transition-all duration-300 ${
                              isBooked
                                ? "border-gray-800 bg-gray-900/50 text-gray-600 cursor-not-allowed"
                                : isPast
                                ? "border-gray-800 bg-gray-900/30 text-gray-500 cursor-not-allowed"
                                : isSelected
                                ? "border-amber-500 bg-amber-500/10 text-amber-400 shadow-lg shadow-amber-500/20"
                                : "border-gray-700 text-gray-300 hover:border-amber-500/50 hover:text-white hover:shadow-lg hover:shadow-amber-500/10"
                            }`}
                          >
                            <div className="text-lg font-bold mb-1">{slot.time}</div>
                            <div className="text-xs">
                              {isBooked ? (
                                <span className="text-red-400">Booked</span>
                              ) : isPast ? (
                                <span className="text-gray-500">Passed</span>
                              ) : isSelected ? (
                                <span className="text-green-400">Selected</span>
                              ) : (
                                <span className="text-gray-400">Available</span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                      
                      {availableSlots.length === 0 && (
                        <div className="col-span-full text-center py-12">
                          <Clock className="text-gray-400 mx-auto mb-4" size={48} />
                          <h4 className="text-white font-semibold mb-2">No Available Slots</h4>
                          <p className="text-gray-400 mb-4">All time slots are booked for this date</p>
                          <button
                            onClick={() => setFormData(prev => ({ ...prev, bookingDate: "" }))}
                            className="text-amber-400 hover:text-amber-300 underline"
                          >
                            Choose another date
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-900/30 rounded-xl border border-gray-800">
                      <Calendar className="text-gray-400 mx-auto mb-4" size={48} />
                      <p className="text-gray-400">Please select a date to view available time slots</p>
                    </div>
                  )}
                </div>
              </div>

              {formData.bookingDate && formData.bookingTime && (
                <div className="mt-8 p-4 bg-gray-800/50 rounded-xl border border-green-500/20">
                  <div className="flex items-center">
                    <CheckCircle className="text-green-400 mr-3 flex-shrink-0" size={20} />
                    <div>
                      <h4 className="text-green-400 font-semibold mb-1">Slot Selected</h4>
                      <p className="text-gray-300">
                        {new Date(`${formData.bookingDate}T${formData.bookingTime}`).toLocaleString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Details & Confirmation */}
        {step === 4 && (
          <div className="animate-slideIn">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6 md:p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <button
                    onClick={() => setStep(3)}
                    className="text-gray-400 hover:text-white mr-4 transition-colors p-2 hover:bg-gray-800 rounded-lg"
                  >
                    ← Back
                  </button>
                  <div className="p-3 bg-purple-500/20 rounded-xl mr-4">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Final Details</h2>
                    <p className="text-gray-400">Review and confirm your booking</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  {/* Booking Summary */}
                  <div>
                    <h3 className="text-xl font-bold text-amber-400 mb-6 flex items-center">
                      <CheckCircle className="mr-2" size={24} />
                      Booking Summary
                    </h3>
                    
                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 space-y-6">
                      <div className="flex items-center justify-between pb-4 border-b border-gray-700">
                        <div>
                          <h4 className="text-white font-bold text-lg">Service</h4>
                          <p className="text-gray-400">{formData.serviceType}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-amber-400 font-bold text-2xl">
                            RM {getSelectedService()?.priceRange.typical || "TBD"}
                          </div>
                          <div className="text-gray-400 text-sm">Estimated cost</div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center">
                          <Car className="text-gray-400 mr-3" size={20} />
                          <div>
                            <div className="text-gray-400 text-sm">Vehicle</div>
                            <div className="text-white font-medium">
                              {getSelectedVehicle()?.model} ({getSelectedVehicle()?.registrationNumber})
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <Calendar className="text-gray-400 mr-3" size={20} />
                          <div>
                            <div className="text-gray-400 text-sm">Date & Time</div>
                            <div className="text-white font-medium">
                              {new Date(`${formData.bookingDate}T${formData.bookingTime}`).toLocaleString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <Clock className="text-gray-400 mr-3" size={20} />
                          <div>
                            <div className="text-gray-400 text-sm">Duration</div>
                            <div className="text-white font-medium">
                              {getSelectedService()?.estimatedDuration || 2} hours (estimated)
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Price Breakdown */}
                      <div className="pt-4 border-t border-gray-700">
                        <div className="text-gray-400 text-sm mb-2">Price Range:</div>
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-gray-300">From RM {getSelectedService()?.priceRange.min || 0}</div>
                            <div className="text-gray-500 text-xs">Minimum expected cost</div>
                          </div>
                          <div className="text-center">
                            <div className="text-amber-400 font-bold">→</div>
                          </div>
                          <div className="text-right">
                            <div className="text-gray-300">To RM {getSelectedService()?.priceRange.max || 0}</div>
                            <div className="text-gray-500 text-xs">Maximum expected cost</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div>
                    <h3 className="text-xl font-bold text-amber-400 mb-6">Additional Information</h3>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-gray-300 font-medium mb-3">
                          Describe the Issue *
                        </label>
                        <textarea
                          name="reportedIssue"
                          value={formData.reportedIssue}
                          onChange={handleInputChange}
                          placeholder="Please describe any symptoms, noises, or issues you've noticed with your vehicle..."
                          className="w-full h-40 bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none transition-colors resize-none"
                          required
                        />
                        <div className="text-gray-500 text-sm mt-2">
                          Be as detailed as possible to help our technicians prepare
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-300 font-medium mb-3">
                          Urgency Level
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { value: "low", label: "Low", desc: "Convenience service", color: "bg-green-500/20 border-green-500/50" },
                            { value: "medium", label: "Medium", desc: "Should fix soon", color: "bg-yellow-500/20 border-yellow-500/50" },
                            { value: "high", label: "High", desc: "Needs attention", color: "bg-red-500/20 border-red-500/50" },
                          ].map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, urgency: option.value as any }))}
                              className={`p-4 border rounded-xl text-center transition-all duration-300 ${
                                formData.urgency === option.value
                                  ? `${option.color} text-white scale-105`
                                  : "border-gray-700 text-gray-400 hover:border-amber-500/50 hover:text-white"
                              }`}
                            >
                              <div className="font-bold mb-1">{option.label}</div>
                              <div className="text-xs">{option.desc}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-300 font-medium mb-3">
                          Special Requests (Optional)
                        </label>
                        <textarea
                          name="specialRequests"
                          value={formData.specialRequests}
                          onChange={handleInputChange}
                          placeholder="Any special instructions, requests, or preferences..."
                          className="w-full h-24 bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none transition-colors resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Important Notes */}
                <div className="mb-8 space-y-4">
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                    <div className="flex items-start">
                      <svg className="text-blue-400 mr-3 mt-0.5 flex-shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor"/>
                      </svg>
                      <div>
                        <h4 className="text-blue-400 font-semibold mb-1">Price Approval Required</h4>
                        <p className="text-blue-300 text-sm">
                          After booking, our technician will inspect your vehicle and provide a detailed cost estimate.
                          You must approve the final price before any work begins. You can accept or reject the quote.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                    <div className="flex items-start">
                      <svg className="text-amber-400 mr-3 mt-0.5 flex-shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 17C11.45 17 11 16.55 11 16V12C11 11.45 11.45 11 12 11C12.55 11 13 11.45 13 12V16C13 16.55 12.55 17 12 17ZM13 9H11V7H13V9Z" fill="currentColor"/>
                      </svg>
                      <div>
                        <h4 className="text-amber-400 font-semibold mb-1">Cancellation Policy</h4>
                        <p className="text-gray-300 text-sm">
                          You can cancel or reschedule up to 2 hours before your appointment without any charges.
                          Late cancellations may incur a small fee.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-800">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-4 px-6 rounded-xl font-semibold transition-colors border border-gray-700 flex items-center justify-center"
                  >
                    ← Back to Time Selection
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading.submitting}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
                  >
                    {isLoading.submitting ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Creating Booking...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={20} />
                        Confirm Booking Request
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookService;