"use client";
// components/Register.tsx
import { useState } from "react";
import Link from "next/link";

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
    vehicleModel: "",
    registrationNumber: "",
    vehicleYear: "",
    vehicleType: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";

    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!formData.vehicleModel.trim())
      newErrors.vehicleModel = "Vehicle model is required";
    if (!formData.registrationNumber.trim())
      newErrors.registrationNumber = "Registration number is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/customer/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Registration successful:", data);
        // Redirect to login or show success message
        alert("Registration successful! You can now login.");
        // You can redirect to login page
        // router.push('/login');
      } else {
        setErrors({ submit: data.error || "Registration failed" });
      }
    } catch (error) {
      console.error("Registration error:", error);
      setErrors({ submit: "Network error. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 30 }, (_, i) => currentYear - i);

  return (
    <section className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center py-4 xs:py-6 sm:py-8 lg:py-12">
      {/* Grid Background */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(#fbbf24 1px, transparent 1px),
                             linear-gradient(90deg, #fbbf24 1px, transparent 1px)`,
            backgroundSize: "30px 30px",
          }}
        />
      </div>

      {/* Floating Gradient Bubbles */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full animate-float hidden sm:block ${
              i % 2 === 0
                ? "bg-gradient-to-r from-yellow-400/10 to-amber-500/10"
                : "bg-gradient-to-r from-amber-400/10 to-yellow-500/10"
            }`}
            style={{
              width: `${Math.random() * 50 + 25}px`,
              height: `${Math.random() * 50 + 25}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 15}s`,
              animationDuration: `${Math.random() * 25 + 25}s`,
              filter: "blur(20px)",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-xs xs:max-w-sm sm:max-w-md lg:max-w-2xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
        {/* Registration Card */}
        <div className="bg-gray-900/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border-2 border-amber-500/30 shadow-2xl shadow-amber-500/20 p-4 xs:p-5 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex justify-center mb-3 sm:mb-4">
              <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-lg xs:rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl xs:text-2xl sm:text-3xl">
                  C
                </span>
              </div>
            </div>
            <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold text-white mb-2">
              Create{" "}
              <span className="bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
                Customer Account
              </span>
            </h1>
            <p className="text-gray-400 text-xs xs:text-sm">
              Register to book services and track your vehicle at Chong Meng
              AutoService
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4 xs:space-y-5">
            {/* Personal Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xs:gap-5">
              <div>
                <h3 className="text-sm xs:text-base font-semibold text-amber-400 mb-3 flex items-center">
                  <span className="mr-2">👤</span>
                  Personal Information
                </h3>

                <div className="space-y-3 xs:space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-xs xs:text-sm font-medium text-gray-300 mb-1 xs:mb-2"
                    >
                      Full Name *
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-3 xs:px-4 py-2 xs:py-3 bg-gray-800/50 border rounded-lg xs:rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors text-sm ${
                        errors.name
                          ? "border-red-500"
                          : "border-gray-700 focus:border-amber-500"
                      }`}
                      placeholder="Enter your full name"
                      required
                    />
                    {errors.name && (
                      <p className="text-red-400 text-xs mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs xs:text-sm font-medium text-gray-300 mb-1 xs:mb-2"
                    >
                      Email Address *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-3 xs:px-4 py-2 xs:py-3 bg-gray-800/50 border rounded-lg xs:rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors text-sm ${
                        errors.email
                          ? "border-red-500"
                          : "border-gray-700 focus:border-amber-500"
                      }`}
                      placeholder="Enter your email"
                      required
                    />
                    {errors.email && (
                      <p className="text-red-400 text-xs mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-xs xs:text-sm font-medium text-gray-300 mb-1 xs:mb-2"
                    >
                      Phone Number *
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-3 xs:px-4 py-2 xs:py-3 bg-gray-800/50 border rounded-lg xs:rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors text-sm ${
                        errors.phone
                          ? "border-red-500"
                          : "border-gray-700 focus:border-amber-500"
                      }`}
                      placeholder="Enter your phone number"
                      required
                    />
                    {errors.phone && (
                      <p className="text-red-400 text-xs mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="address"
                      className="block text-xs xs:text-sm font-medium text-gray-300 mb-1 xs:mb-2"
                    >
                      Address
                    </label>
                    <input
                      id="address"
                      name="address"
                      type="text"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-3 xs:px-4 py-2 xs:py-3 bg-gray-800/50 border border-gray-700 rounded-lg xs:rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors text-sm"
                      placeholder="Enter your address (optional)"
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              <div>
                <h3 className="text-sm xs:text-base font-semibold text-amber-400 mb-3 flex items-center">
                  <span className="mr-2">🚗</span>
                  Vehicle Information
                </h3>

                <div className="space-y-3 xs:space-y-4">
                  <div>
                    <label
                      htmlFor="vehicleModel"
                      className="block text-xs xs:text-sm font-medium text-gray-300 mb-1 xs:mb-2"
                    >
                      Vehicle Model *
                    </label>
                    <input
                      id="vehicleModel"
                      name="vehicleModel"
                      type="text"
                      value={formData.vehicleModel}
                      onChange={handleChange}
                      className={`w-full px-3 xs:px-4 py-2 xs:py-3 bg-gray-800/50 border rounded-lg xs:rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors text-sm ${
                        errors.vehicleModel
                          ? "border-red-500"
                          : "border-gray-700 focus:border-amber-500"
                      }`}
                      placeholder="e.g., Toyota Vios, Honda City"
                      required
                    />
                    {errors.vehicleModel && (
                      <p className="text-red-400 text-xs mt-1">
                        {errors.vehicleModel}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="registrationNumber"
                      className="block text-xs xs:text-sm font-medium text-gray-300 mb-1 xs:mb-2"
                    >
                      Registration Number *
                    </label>
                    <input
                      id="registrationNumber"
                      name="registrationNumber"
                      type="text"
                      value={formData.registrationNumber}
                      onChange={handleChange}
                      className={`w-full px-3 xs:px-4 py-2 xs:py-3 bg-gray-800/50 border rounded-lg xs:rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors text-sm ${
                        errors.registrationNumber
                          ? "border-red-500"
                          : "border-gray-700 focus:border-amber-500"
                      }`}
                      placeholder="e.g., ABC1234"
                      required
                    />
                    {errors.registrationNumber && (
                      <p className="text-red-400 text-xs mt-1">
                        {errors.registrationNumber}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 xs:gap-4">
                    <div>
                      <label
                        htmlFor="vehicleYear"
                        className="block text-xs xs:text-sm font-medium text-gray-300 mb-1 xs:mb-2"
                      >
                        Year
                      </label>
                      <select
                        id="vehicleYear"
                        name="vehicleYear"
                        value={formData.vehicleYear}
                        onChange={handleChange}
                        className="w-full px-3 xs:px-4 py-2 xs:py-3 bg-gray-800/50 border border-gray-700 rounded-lg xs:rounded-xl text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors text-sm"
                      >
                        <option value="">Select Year</option>
                        {yearOptions.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="vehicleType"
                        className="block text-xs xs:text-sm font-medium text-gray-300 mb-1 xs:mb-2"
                      >
                        Type
                      </label>
                      <select
                        id="vehicleType"
                        name="vehicleType"
                        value={formData.vehicleType}
                        onChange={handleChange}
                        className="w-full px-3 xs:px-4 py-2 xs:py-3 bg-gray-800/50 border border-gray-700 rounded-lg xs:rounded-xl text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors text-sm"
                      >
                        <option value="">Select Type</option>
                        <option value="Sedan">Sedan</option>
                        <option value="SUV">SUV</option>
                        <option value="Hatchback">Hatchback</option>
                        <option value="MPV">MPV</option>
                        <option value="Pickup">Pickup</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Password Section */}
            <div className="border-t border-gray-700 pt-4 xs:pt-5">
              <h3 className="text-sm xs:text-base font-semibold text-amber-400 mb-3 flex items-center">
                <span className="mr-2">🔒</span>
                Account Security
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xs:gap-5">
                <div>
                  <label
                    htmlFor="password"
                    className="block text-xs xs:text-sm font-medium text-gray-300 mb-1 xs:mb-2"
                  >
                    Password *
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-3 xs:px-4 py-2 xs:py-3 bg-gray-800/50 border rounded-lg xs:rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors text-sm ${
                      errors.password
                        ? "border-red-500"
                        : "border-gray-700 focus:border-amber-500"
                    }`}
                    placeholder="Enter your password"
                    required
                  />
                  {errors.password && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-xs xs:text-sm font-medium text-gray-300 mb-1 xs:mb-2"
                  >
                    Confirm Password *
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-3 xs:px-4 py-2 xs:py-3 bg-gray-800/50 border rounded-lg xs:rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors text-sm ${
                      errors.confirmPassword
                        ? "border-red-500"
                        : "border-gray-700 focus:border-amber-500"
                    }`}
                    placeholder="Confirm your password"
                    required
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white py-2 xs:py-3 sm:py-3 px-4 rounded-lg xs:rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center text-sm xs:text-base mt-4"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 xs:w-5 xs:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span className="text-xs xs:text-sm">
                    Creating Account...
                  </span>
                </>
              ) : (
                "Create Customer Account"
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-4 xs:mt-5 sm:mt-6 text-center">
            <p className="text-gray-400 text-xs xs:text-sm">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-amber-400 hover:text-amber-300 font-semibold transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>

          {/* Back to Home */}
          <div className="mt-4 xs:mt-5 text-center">
            <Link
              href="/"
              className="inline-flex items-center text-xs xs:text-sm text-gray-400 hover:text-white transition-colors"
            >
              <span className="mr-1 xs:mr-2">←</span>
              Back to homepage
            </Link>
          </div>
        </div>

        {/* Workshop Info */}
        <div className="mt-4 xs:mt-5 sm:mt-6 text-center">
          <div className="inline-flex items-center space-x-1 xs:space-x-2 bg-gray-800/30 backdrop-blur-sm rounded-full px-3 xs:px-4 py-1 xs:py-2 border border-amber-500/20">
            <span className="text-amber-400 text-xs xs:text-sm">🏢</span>
            <span className="text-gray-300 text-xs xs:text-sm">
              Chong Meng AutoService Seremban
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-8px) rotate(120deg);
          }
          66% {
            transform: translateY(4px) rotate(240deg);
          }
        }
        .animate-float {
          animation: float 35s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default Register;
