'use client';
import { useState, useEffect } from 'react';

interface CustomerProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string | null;
  joinDate: string;
  createdAt: string;
  emergencyContact?: string;
  preferredCommunication: 'email' | 'sms' | 'whatsapp';
  marketingEmails: boolean;
  serviceReminders: boolean;
  language: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ProfileProps {
  customerData?: CustomerProfile;
}

const Profile: React.FC<ProfileProps> = ({ customerData: initialCustomerData }) => {
  const [profile, setProfile] = useState<CustomerProfile | null>(initialCustomerData || null);
  const [isLoading, setIsLoading] = useState(!initialCustomerData);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [activeSection, setActiveSection] = useState<'profile' | 'preferences' | 'security'>('profile');
  const [passwordData, setPasswordData] = useState<ChangePasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  // Fetch profile data if not provided
  useEffect(() => {
    if (!initialCustomerData) {
      fetchProfile();
    }
  }, [initialCustomerData]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch('/api/customer/me');
      if (!response.ok) {
        throw new Error('Failed to fetch profile data');
      }
      
      const result = await response.json();
      setProfile(result.customer);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    setSaveStatus('saving');
    setError('');
    
    try {
      const response = await fetch('/api/customer/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          address: profile.address,
          emergencyContact: profile.emergencyContact,
          preferredCommunication: profile.preferredCommunication,
          marketingEmails: profile.marketingEmails,
          serviceReminders: profile.serviceReminders,
          language: profile.language
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      setSaveStatus('success');
      setIsEditing(false);
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to update profile');
      setSaveStatus('error');
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords don't match!");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError("New password must be at least 6 characters long");
      return;
    }

    setSaveStatus('saving');
    setError('');
    
    try {
      const response = await fetch('/api/customer/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to change password');
      }

      setSaveStatus('success');
      setIsChangingPassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error changing password:', error);
      setError(error instanceof Error ? error.message : 'Failed to change password');
      setSaveStatus('error');
    }
  };

  const handleInputChange = (field: keyof CustomerProfile, value: any) => {
    if (profile) {
      setProfile({
        ...profile,
        [field]: value
      });
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getMembershipDuration = (joinDate: string) => {
    const join = new Date(joinDate);
    const now = new Date();
    const months = (now.getFullYear() - join.getFullYear()) * 12 + (now.getMonth() - join.getMonth());
    
    if (months < 12) {
      return `${months} month${months !== 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      return `${years} year${years !== 1 ? 's' : ''}${remainingMonths > 0 ? ` and ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}` : ''}`;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">My Profile</h2>
            <p className="text-gray-400">Manage your account information and preferences</p>
          </div>
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            <p className="text-gray-400 mt-4">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">My Profile</h2>
            <p className="text-gray-400">Manage your account information and preferences</p>
          </div>
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="text-red-400 text-lg mb-4">⚠️ {error || 'Failed to load profile'}</div>
            <button 
              onClick={fetchProfile}
              className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
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
          <h2 className="text-2xl font-bold text-white">My Profile</h2>
          <p className="text-gray-400">Manage your account information and preferences</p>
        </div>
        
        {saveStatus === 'success' && (
          <div className="bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-2 rounded-xl flex items-center space-x-2">
            <span>✅</span>
            <span>Profile updated successfully!</span>
          </div>
        )}
        
        {saveStatus === 'error' && error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-2 rounded-xl flex items-center space-x-2">
            <span>❌</span>
            <span>{error}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <div className="space-y-2">
              <button
                onClick={() => setActiveSection('profile')}
                className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all ${
                  activeSection === 'profile'
                    ? 'bg-amber-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                👤 Personal Information
              </button>
              <button
                onClick={() => setActiveSection('preferences')}
                className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all ${
                  activeSection === 'preferences'
                    ? 'bg-amber-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                ⚙️ Preferences
              </button>
              <button
                onClick={() => setActiveSection('security')}
                className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all ${
                  activeSection === 'security'
                    ? 'bg-amber-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                🔒 Security
              </button>
            </div>

            {/* Profile Summary */}
            <div className="mt-8 pt-6 border-t border-gray-700/50">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">
                    {getInitials(profile.name)}
                  </span>
                </div>
                <div>
                  <p className="text-white font-semibold">{profile.name}</p>
                  <p className="text-gray-400 text-sm">Member since {formatJoinDate(profile.joinDate)}</p>
                </div>
              </div>
              <div className="bg-gray-700/30 rounded-xl p-3">
                <p className="text-amber-400 text-sm font-medium">
                  🎉 {getMembershipDuration(profile.joinDate)} with CARVO
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Personal Information */}
          {activeSection === 'profile' && (
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <span className="text-amber-400 mr-3">👤</span>
                  Personal Information
                </h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl font-semibold transition-all flex items-center space-x-2"
                  >
                    <span>✏️</span>
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setError('');
                        // Reset to original data
                        if (initialCustomerData) {
                          setProfile(initialCustomerData);
                        }
                      }}
                      className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-xl font-semibold transition-all border border-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={saveStatus === 'saving'}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-semibold transition-all flex items-center space-x-2 disabled:opacity-50"
                    >
                      {saveStatus === 'saving' ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <span>💾</span>
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                    />
                  ) : (
                    <p className="text-white font-medium text-lg">{profile.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Email Address</label>
                  <p className="text-white font-medium text-lg">{profile.email}</p>
                  <p className="text-gray-400 text-xs mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Phone Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                    />
                  ) : (
                    <p className="text-white font-medium text-lg">{profile.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Emergency Contact</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profile.emergencyContact || ''}
                      onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                      placeholder="+60 XXX XXXX"
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                    />
                  ) : (
                    <p className="text-white font-medium text-lg">{profile.emergencyContact || 'Not set'}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-400 text-sm mb-2">Address</label>
                  {isEditing ? (
                    <textarea
                      value={profile.address || ''}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      rows={3}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 resize-none"
                      placeholder="Enter your address"
                    />
                  ) : (
                    <p className="text-white font-medium">{profile.address || 'No address provided'}</p>
                  )}
                </div>
              </div>

              {/* Read-only Information */}
              {!isEditing && (
                <div className="mt-6 pt-6 border-t border-gray-700/50">
                  <h4 className="text-gray-400 text-sm mb-4">Account Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">Member Since</p>
                      <p className="text-white font-medium">{formatJoinDate(profile.joinDate)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Membership Duration</p>
                      <p className="text-amber-400 font-medium">{getMembershipDuration(profile.joinDate)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Customer ID</p>
                      <p className="text-white font-medium">C{profile.id.toString().padStart(6, '0')}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Account Status</p>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                        ✅ Active
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Preferences */}
          {activeSection === 'preferences' && (
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <span className="text-amber-400 mr-3">⚙️</span>
                  Preferences & Settings
                </h3>
                <button
                  onClick={handleSaveProfile}
                  disabled={saveStatus === 'saving'}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-semibold transition-all flex items-center space-x-2 disabled:opacity-50"
                >
                  {saveStatus === 'saving' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <span>💾</span>
                      <span>Save Preferences</span>
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h4 className="text-white font-semibold mb-4">Communication Preferences</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-3">Preferred Communication Method</label>
                      <div className="flex flex-wrap gap-3">
                        {(['email', 'sms', 'whatsapp'] as const).map((method) => (
                          <label key={method} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              name="communication"
                              value={method}
                              checked={profile.preferredCommunication === method}
                              onChange={() => handleInputChange('preferredCommunication', method)}
                              className="hidden"
                            />
                            <div className={`w-4 h-4 border-2 rounded-full flex items-center justify-center ${
                              profile.preferredCommunication === method
                                ? 'border-amber-500 bg-amber-500'
                                : 'border-gray-600'
                            }`}>
                              {profile.preferredCommunication === method && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                            <span className="text-white capitalize">
                              {method === 'whatsapp' ? 'WhatsApp' : method.toUpperCase()}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profile.marketingEmails}
                          onChange={(e) => handleInputChange('marketingEmails', e.target.checked)}
                          className="w-4 h-4 text-amber-500 bg-gray-700 border-gray-600 rounded focus:ring-amber-500 focus:ring-2"
                        />
                        <span className="text-white">Receive marketing and promotional emails</span>
                      </label>
                      
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profile.serviceReminders}
                          onChange={(e) => handleInputChange('serviceReminders', e.target.checked)}
                          className="w-4 h-4 text-amber-500 bg-gray-700 border-gray-600 rounded focus:ring-amber-500 focus:ring-2"
                        />
                        <span className="text-white">Receive service reminders and maintenance alerts</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-700/50">
                  <h4 className="text-white font-semibold mb-4">Language & Region</h4>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Preferred Language</label>
                    <select
                      value={profile.language}
                      onChange={(e) => handleInputChange('language', e.target.value)}
                      className="bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 w-full md:w-64"
                    >
                      <option value="English">English</option>
                      <option value="Malay">Bahasa Malaysia</option>
                      <option value="Chinese">中文</option>
                      <option value="Tamil">தமிழ்</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security */}
          {activeSection === 'security' && (
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <span className="text-amber-400 mr-3">🔒</span>
                  Security Settings
                </h3>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                {!isChangingPassword ? (
                  <div className="bg-gray-700/30 rounded-xl p-6">
                    <h4 className="text-white font-semibold mb-2">Password</h4>
                    <p className="text-gray-400 text-sm mb-4">
                      Keep your account secure with a strong password
                    </p>
                    <button
                      onClick={() => setIsChangingPassword(true)}
                      className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl font-semibold transition-all flex items-center space-x-2"
                    >
                      <span>🔑</span>
                      <span>Change Password</span>
                    </button>
                  </div>
                ) : (
                  <div className="bg-gray-700/30 rounded-xl p-6">
                    <h4 className="text-white font-semibold mb-4">Change Password</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Current Password</label>
                        <input
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                          className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                          placeholder="Enter current password"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">New Password</label>
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                          className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                          placeholder="Enter new password"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Confirm New Password</label>
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                          placeholder="Confirm new password"
                        />
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={handleChangePassword}
                          disabled={saveStatus === 'saving'}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-semibold transition-all flex items-center space-x-2 disabled:opacity-50"
                        >
                          {saveStatus === 'saving' ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Updating...</span>
                            </>
                          ) : (
                            <>
                              <span>💾</span>
                              <span>Update Password</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setIsChangingPassword(false);
                            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                            setError('');
                          }}
                          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-xl font-semibold transition-all border border-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-gray-700/30 rounded-xl p-6">
                  <h4 className="font-semibold mb-2 text-red-400">Danger Zone</h4>
                  <p className="text-gray-400 text-sm mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <button className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-xl font-semibold transition-all border border-red-500/30">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;