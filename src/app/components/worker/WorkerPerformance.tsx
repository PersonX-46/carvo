'use client';
import { useState, useEffect } from 'react';

interface PerformanceMetrics {
  totalServices: number;
  completedThisWeek: number;
  completedThisMonth: number;
  averageRating: number;
  efficiency: number;
  onTimeCompletion: number;
  currentWorkload: number;
  totalEarnings: number;
  monthlyEarnings: number;
  specializedServices: {
    category: string;
    count: number;
    rating: number;
  }[];
  weeklyPerformance: {
    week: string;
    services: number;
    efficiency: number;
    rating: number;
  }[];
  monthlyTrend: {
    month: string;
    services: number;
    earnings: number;
  }[];
  serviceQuality: {
    category: string;
    score: number;
  }[];
  recentFeedback: {
    id: number;
    customerName: string;
    rating: number;
    comment: string;
    date: string;
    serviceType: string;
  }[];
}

interface WorkerStats {
  bestCategory: string;
  fastestService: string;
  mostEfficientMonth: string;
  customerSatisfaction: number;
  improvementAreas: string[];
}

const WorkerPerformance: React.FC = () => {
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);
  const [workerStats, setWorkerStats] = useState<WorkerStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [activeMetric, setActiveMetric] = useState<'overview' | 'services' | 'earnings' | 'quality'>('overview');

  // Simulated data fetch
  useEffect(() => {
    const fetchPerformanceData = async () => {
      setIsLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        const mockPerformance: PerformanceMetrics = {
          totalServices: 247,
          completedThisWeek: 8,
          completedThisMonth: 32,
          averageRating: 4.8,
          efficiency: 92,
          onTimeCompletion: 88,
          currentWorkload: 3,
          totalEarnings: 45800,
          monthlyEarnings: 5200,
          specializedServices: [
            { category: 'Engine Repair', count: 45, rating: 4.9 },
            { category: 'Brake Service', count: 38, rating: 4.8 },
            { category: 'AC Service', count: 32, rating: 4.7 },
            { category: 'Transmission', count: 28, rating: 4.9 },
            { category: 'Electrical Systems', count: 25, rating: 4.6 },
            { category: 'Regular Maintenance', count: 79, rating: 4.8 }
          ],
          weeklyPerformance: [
            { week: 'Week 1', services: 7, efficiency: 89, rating: 4.7 },
            { week: 'Week 2', services: 8, efficiency: 91, rating: 4.8 },
            { week: 'Week 3', services: 9, efficiency: 94, rating: 4.9 },
            { week: 'Week 4', services: 8, efficiency: 92, rating: 4.8 }
          ],
          monthlyTrend: [
            { month: 'Jan', services: 28, earnings: 4200 },
            { month: 'Feb', services: 32, earnings: 4800 },
            { month: 'Mar', services: 35, earnings: 5200 },
            { month: 'Apr', services: 31, earnings: 4700 },
            { month: 'May', services: 29, earnings: 4400 },
            { month: 'Jun', services: 33, earnings: 4900 }
          ],
          serviceQuality: [
            { category: 'Technical Skill', score: 95 },
            { category: 'Time Management', score: 88 },
            { category: 'Communication', score: 92 },
            { category: 'Quality Work', score: 96 },
            { category: 'Cleanliness', score: 90 }
          ],
          recentFeedback: [
            {
              id: 1,
              customerName: 'Ahmad bin Ismail',
              rating: 5,
              comment: 'Excellent service! Very professional and thorough. Fixed my AC issue quickly.',
              date: '2024-01-15',
              serviceType: 'AC Service'
            },
            {
              id: 2,
              customerName: 'Siti Nurhaliza',
              rating: 4,
              comment: 'Good work on the brake service. Car feels much safer now.',
              date: '2024-01-14',
              serviceType: 'Brake Service'
            },
            {
              id: 3,
              customerName: 'Raj Kumar',
              rating: 5,
              comment: 'Best technician I have ever worked with. Very knowledgeable!',
              date: '2024-01-12',
              serviceType: 'Engine Diagnostic'
            },
            {
              id: 4,
              customerName: 'Mei Ling',
              rating: 4,
              comment: 'Professional service, completed on time. Will come back again.',
              date: '2024-01-10',
              serviceType: 'Regular Maintenance'
            }
          ]
        };

        const mockStats: WorkerStats = {
          bestCategory: 'Engine Repair',
          fastestService: 'Tire Rotation',
          mostEfficientMonth: 'March',
          customerSatisfaction: 94,
          improvementAreas: ['Documentation', 'Parts Management', 'Customer Updates']
        };

        setPerformance(mockPerformance);
        setWorkerStats(mockStats);
        setIsLoading(false);
      }, 1500);
    };

    fetchPerformanceData();
  }, []);

  const StatCard = ({ title, value, change, icon, color, subtitle }: any) => (
    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-amber-500/30 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-2">{title}</p>
          <p className="text-3xl font-bold text-white mb-1">
            {isLoading ? "..." : value}
          </p>
          {change && (
            <p className={`text-xs font-medium ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {change > 0 ? '↑' : '↓'} {Math.abs(change)}% from last period
            </p>
          )}
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

  const ProgressBar = ({ label, value, color, max = 100 }: any) => (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-medium">{value}%</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${color}`}
          style={{ width: `${(value / max) * 100}%` }}
        ></div>
      </div>
    </div>
  );

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-lg ${
              star <= rating ? 'text-amber-400' : 'text-gray-600'
            }`}
          >
            ★
          </span>
        ))}
        <span className="text-amber-400 ml-2 font-semibold">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const getEfficiencyColor = (value: number) => {
    if (value >= 90) return 'text-green-400';
    if (value >= 80) return 'text-amber-400';
    return 'text-red-400';
  };

  const getEfficiencyBgColor = (value: number) => {
    if (value >= 90) return 'bg-green-500';
    if (value >= 80) return 'bg-amber-500';
    return 'bg-red-500';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Performance Analytics</h2>
            <p className="text-gray-400">Detailed performance metrics and analytics</p>
          </div>
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            <p className="text-gray-400 mt-4">Loading performance data...</p>
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
          <h2 className="text-2xl font-bold text-white">Performance Analytics</h2>
          <p className="text-gray-400">Detailed performance metrics and analytics</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-800/50 rounded-lg border border-gray-700 p-1">
            <button
              onClick={() => setTimeRange('week')}
              className={`px-3 py-1 rounded text-sm transition-all ${
                timeRange === 'week' 
                  ? 'bg-amber-500 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-3 py-1 rounded text-sm transition-all ${
                timeRange === 'month' 
                  ? 'bg-amber-500 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setTimeRange('quarter')}
              className={`px-3 py-1 rounded text-sm transition-all ${
                timeRange === 'quarter' 
                  ? 'bg-amber-500 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Quarter
            </button>
            <button
              onClick={() => setTimeRange('year')}
              className={`px-3 py-1 rounded text-sm transition-all ${
                timeRange === 'year' 
                  ? 'bg-amber-500 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Year
            </button>
          </div>
        </div>
      </div>

      {/* Metric Navigation */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveMetric('overview')}
          className={`px-4 py-2 rounded-xl font-medium transition-colors ${
            activeMetric === 'overview'
              ? 'bg-amber-500 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          📊 Overview
        </button>
        <button
          onClick={() => setActiveMetric('services')}
          className={`px-4 py-2 rounded-xl font-medium transition-colors ${
            activeMetric === 'services'
              ? 'bg-amber-500 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          🔧 Services
        </button>
        <button
          onClick={() => setActiveMetric('earnings')}
          className={`px-4 py-2 rounded-xl font-medium transition-colors ${
            activeMetric === 'earnings'
              ? 'bg-amber-500 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          💰 Earnings
        </button>
        <button
          onClick={() => setActiveMetric('quality')}
          className={`px-4 py-2 rounded-xl font-medium transition-colors ${
            activeMetric === 'quality'
              ? 'bg-amber-500 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          ⭐ Quality
        </button>
      </div>

      {/* Overview Metrics */}
      {activeMetric === 'overview' && performance && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Services"
              value={performance.totalServices}
              change={12}
              icon="🔧"
              color="text-blue-400"
              subtitle="Lifetime"
            />
            <StatCard
              title="Average Rating"
              value={performance.averageRating.toFixed(1)}
              change={3}
              icon="⭐"
              color="text-yellow-400"
              subtitle="Out of 5.0"
            />
            <StatCard
              title="Efficiency"
              value={`${performance.efficiency}%`}
              change={5}
              icon="⚡"
              color="text-amber-400"
              subtitle="This month"
            />
            <StatCard
              title="On-time Completion"
              value={`${performance.onTimeCompletion}%`}
              change={-2}
              icon="⏱️"
              color="text-green-400"
              subtitle="This month"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Performance Progress */}
            <div className="lg:col-span-2 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                <span className="text-amber-400 mr-3">📈</span>
                Performance Metrics
              </h3>

              <div className="space-y-4">
                <ProgressBar
                  label="Service Efficiency"
                  value={performance.efficiency}
                  color={getEfficiencyBgColor(performance.efficiency)}
                />
                <ProgressBar
                  label="On-time Completion"
                  value={performance.onTimeCompletion}
                  color="bg-green-500"
                />
                <ProgressBar
                  label="Customer Satisfaction"
                  value={workerStats?.customerSatisfaction || 0}
                  color="bg-purple-500"
                />
                <ProgressBar
                  label="Quality Work"
                  value={performance.serviceQuality.find(q => q.category === 'Quality Work')?.score || 0}
                  color="bg-blue-500"
                />
              </div>

              {/* Weekly Performance */}
              <div className="mt-6 pt-6 border-t border-gray-700/50">
                <h4 className="text-white font-semibold mb-4">Weekly Performance</h4>
                <div className="space-y-3">
                  {performance.weeklyPerformance.map((week, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                      <span className="text-gray-300 text-sm">{week.week}</span>
                      <div className="flex items-center space-x-4">
                        <span className="text-white text-sm">{week.services} services</span>
                        <span className={`text-sm ${getEfficiencyColor(week.efficiency)}`}>
                          {week.efficiency}% eff.
                        </span>
                        <span className="text-amber-400 text-sm">{week.rating}★</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Worker Stats */}
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                <span className="text-amber-400 mr-3">🏆</span>
                Your Stats
              </h3>

              <div className="space-y-4">
                <div className="p-4 bg-gray-700/30 rounded-lg">
                  <p className="text-gray-400 text-sm">Best Category</p>
                  <p className="text-white font-semibold text-lg">{workerStats?.bestCategory}</p>
                </div>

                <div className="p-4 bg-gray-700/30 rounded-lg">
                  <p className="text-gray-400 text-sm">Fastest Service</p>
                  <p className="text-white font-semibold text-lg">{workerStats?.fastestService}</p>
                </div>

                <div className="p-4 bg-gray-700/30 rounded-lg">
                  <p className="text-gray-400 text-sm">Most Efficient Month</p>
                  <p className="text-white font-semibold text-lg">{workerStats?.mostEfficientMonth}</p>
                </div>

                <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
                  <p className="text-gray-400 text-sm">Customer Satisfaction</p>
                  <p className="text-amber-400 font-semibold text-xl">{workerStats?.customerSatisfaction}%</p>
                </div>
              </div>

              {/* Improvement Areas */}
              <div className="mt-6 pt-6 border-t border-gray-700/50">
                <h4 className="text-white font-semibold mb-4">Areas for Improvement</h4>
                <div className="space-y-2">
                  {workerStats?.improvementAreas.map((area, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <span className="text-red-400">●</span>
                      <span className="text-gray-300">{area}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Services Breakdown */}
      {activeMetric === 'services' && performance && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Specialized Services */}
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                <span className="text-amber-400 mr-3">🔧</span>
                Specialized Services
              </h3>

              <div className="space-y-4">
                {performance.specializedServices.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{service.category}</p>
                      <p className="text-gray-400 text-sm">{service.count} services</p>
                    </div>
                    <div className="text-right">
                      {renderStars(service.rating)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Service Trends */}
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                <span className="text-amber-400 mr-3">📊</span>
                Monthly Service Trends
              </h3>

              <div className="space-y-4">
                {performance.monthlyTrend.map((month, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                    <span className="text-gray-300 text-sm">{month.month}</span>
                    <div className="flex items-center space-x-4">
                      <span className="text-white text-sm">{month.services} services</span>
                      <span className="text-amber-400 text-sm">RM {month.earnings}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Summary */}
              <div className="mt-6 p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Total ({performance.monthlyTrend.length} months)</span>
                  <div className="text-right">
                    <p className="text-amber-400 font-semibold">
                      {performance.monthlyTrend.reduce((sum, month) => sum + month.services, 0)} services
                    </p>
                    <p className="text-amber-400 text-sm">
                      RM {performance.monthlyTrend.reduce((sum, month) => sum + month.earnings, 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Earnings Analytics */}
      {activeMetric === 'earnings' && performance && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total Earnings"
              value={`RM ${performance.totalEarnings.toLocaleString()}`}
              change={15}
              icon="💰"
              color="text-green-400"
              subtitle="Lifetime"
            />
            <StatCard
              title="This Month"
              value={`RM ${performance.monthlyEarnings.toLocaleString()}`}
              change={8}
              icon="📈"
              color="text-amber-400"
              subtitle="Current month"
            />
            <StatCard
              title="Avg per Service"
              value={`RM ${Math.round(performance.totalEarnings / performance.totalServices)}`}
              change={5}
              icon="⚡"
              color="text-blue-400"
              subtitle="Average earning"
            />
          </div>

          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
              <span className="text-amber-400 mr-3">💸</span>
              Earnings Breakdown
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Service Type Earnings */}
              <div>
                <h4 className="text-white font-semibold mb-4">By Service Type</h4>
                <div className="space-y-3">
                  {performance.specializedServices.map((service, index) => {
                    const estimatedEarnings = service.count * 185; // Average service cost
                    return (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                        <span className="text-gray-300">{service.category}</span>
                        <span className="text-amber-400 font-medium">RM {estimatedEarnings}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Monthly Earnings Chart */}
              <div>
                <h4 className="text-white font-semibold mb-4">Monthly Earnings Trend</h4>
                <div className="space-y-4">
                  {performance.monthlyTrend.map((month, index) => {
                    const maxEarnings = Math.max(...performance.monthlyTrend.map(m => m.earnings));
                    const percentage = (month.earnings / maxEarnings) * 100;
                    return (
                      <div key={index} className="flex items-center space-x-3">
                        <span className="text-gray-400 text-sm w-12">{month.month}</span>
                        <div className="flex-1 bg-gray-700 rounded-full h-4">
                          <div 
                            className="bg-gradient-to-r from-amber-500 to-amber-600 h-4 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-amber-400 text-sm w-16 text-right">RM {month.earnings}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quality Metrics */}
      {activeMetric === 'quality' && performance && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Service Quality Scores */}
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                <span className="text-amber-400 mr-3">⭐</span>
                Service Quality Scores
              </h3>

              <div className="space-y-4">
                {performance.serviceQuality.map((metric, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">{metric.category}</span>
                      <span className="text-white font-medium">{metric.score}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-amber-500 h-2 rounded-full"
                        style={{ width: `${metric.score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Overall Rating */}
              <div className="mt-6 p-4 bg-amber-500/10 rounded-lg border border-amber-500/30 text-center">
                <p className="text-gray-400 text-sm mb-2">Overall Quality Score</p>
                <p className="text-amber-400 text-2xl font-bold">
                  {Math.round(performance.serviceQuality.reduce((sum, metric) => sum + metric.score, 0) / performance.serviceQuality.length)}%
                </p>
              </div>
            </div>

            {/* Recent Customer Feedback */}
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                <span className="text-amber-400 mr-3">💬</span>
                Recent Customer Feedback
              </h3>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {performance.recentFeedback.map((feedback, index) => (
                  <div key={index} className="p-4 bg-gray-700/30 rounded-lg border border-gray-600/30">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-white font-medium">{feedback.customerName}</p>
                        <p className="text-gray-400 text-sm">{feedback.serviceType}</p>
                      </div>
                      <div className="text-right">
                        {renderStars(feedback.rating)}
                        <p className="text-gray-400 text-xs mt-1">
                          {new Date(feedback.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm">{feedback.comment}</p>
                  </div>
                ))}
              </div>

              {/* Feedback Summary */}
              <div className="mt-6 p-4 bg-gray-700/30 rounded-lg">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Average Rating</span>
                  <span className="text-amber-400 font-semibold">{performance.averageRating.toFixed(1)}/5.0</span>
                </div>
                <div className="flex justify-between items-center text-sm mt-2">
                  <span className="text-gray-400">Total Reviews</span>
                  <span className="text-white">{performance.recentFeedback.length}+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Summary */}
      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-amber-500/30">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Performance Summary</h3>
            <p className="text-gray-400">
              You're performing {performance.efficiency >= 90 ? 'excellently' : performance.efficiency >= 80 ? 'well' : 'adequately'} this {timeRange}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <button className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center space-x-2">
              <span>📥</span>
              <span>Download Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerPerformance;