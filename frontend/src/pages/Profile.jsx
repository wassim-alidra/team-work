import { useContext, useState, useEffect, useRef } from "react";
import AuthContext from "../context/AuthContext";
import DashboardLayout from "../components/layout/DashboardLayout";
import { User, Mail, Shield, MapPin, Calendar, Camera, Edit2, Check, X, Key, Loader2, Eye, EyeOff, Lock } from "lucide-react";
import "../styles/dashboard.css"; // Keep any base dashboard styles
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
const Profile = () => {
    const { user, setUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const fileInputRef = useRef(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    
    // Password Modal State
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordUploading, setPasswordUploading] = useState(false);
    const [passwordData, setPasswordData] = useState({
        old_password: "",
        new_password: "",
        confirm_password: ""
    });
    const [showPasswords, setShowPasswords] = useState({
        old: false,
        new: false,
        confirm: false
    });
    
    const roleLabels = {
        FARMER: "Farmer",
        BUYER: "Buyer",
        TRANSPORTER: "Transporter",
        ADMIN: "Admin",
        EQUIPMENT_PROVIDER: "Equipment Provider"
    };

    // State for the form
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        address: "",
        role: "",
        joinDate: "January 2024" // Placeholder for created date
    });

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.username || "",
                email: user.email || "",
                address: user.wilaya || "",
                role: user.role || "",
                joinDate: user.date_joined
  ? new Date(user.date_joined).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long"
    })
  : ""
            });
        }
    }, [user]);

    if (!user) return <div className="flex justify-center items-center h-screen">Loading...</div>;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        // Restore original values
        setFormData({
            fullName: user.username || "",
            email: user.email || "",
            address:  user.wilaya || "",
            role: user.role || "",
           joinDate: user.date_joined
  ? new Date(user.date_joined).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long"
    })
  : ""
        });
    };

   const handleSave = () => {
  const dataToUpdate = {
    username: formData.fullName,
    email: formData.email,
    wilaya: formData.address,
  };

  console.log("Update:", dataToUpdate);

  setIsEditing(false);
};

const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setPreview(URL.createObjectURL(file));
        uploadImage(file);
    }
};

const uploadImage = async (file) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("profile_image", file);

    try {
        const response = await api.put("users/profile/image/", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        // Update user context with new profile image URL
        setUser(prev => ({ ...prev, ...response.data }));
    } catch (error) {
        console.error("Upload failed:", error);
        alert(error.response?.data?.error || "Upload failed. Please try again.");
        setPreview(null); // Reset preview on failure
    } finally {
        setUploading(false);
    }
};

const getAvatarUrl = () => {
    if (preview) return preview;
    if (user?.profile_image) {
        const baseUrl = "http://localhost:8000";
        return user.profile_image.startsWith('http') ? user.profile_image : `${baseUrl}${user.profile_image}`;
    }
    return null;
};

const handlePasswordDataChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
};

const submitPasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
        alert("New passwords do not match.");
        return;
    }
    
    setPasswordUploading(true);
    try {
        await api.put("users/change-password/", passwordData);
        alert("Password updated successfully!");
        setShowPasswordModal(false);
        setPasswordData({ old_password: "", new_password: "", confirm_password: "" });
    } catch (error) {
        console.error("Password update failed:", error);
        const errorData = error.response?.data;
        if (typeof errorData === 'object') {
            const firstError = Object.values(errorData)[0];
            alert(Array.isArray(firstError) ? firstError[0] : (errorData.message || "Update failed."));
        } else {
            alert("Update failed. Please try again.");
        }
    } finally {
        setPasswordUploading(false);
    }
};
    return (
        <DashboardLayout activeTab="profile" setActiveTab={() => {}}>
            <button
  onClick={() => navigate(-1)}
  className="flex items-center gap-2 mb-4 text-sm text-gray-700 hover:text-black bg-white px-3 py-1.5 rounded-lg shadow-sm"
>
  ← Back
</button>
            <div className="w-full max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300">
                
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    
                    {/* Header Banner */}
                    <div className="h-32 bg-gradient-to-r from-emerald-500 to-teal-600"></div>

                    {/* Profile Content */}
                    <div className="px-6 sm:px-10 pb-10">
                        {/* Avatar Section */}
                        <div className="relative flex flex-col sm:flex-row justify-between sm:items-end -mt-12 mb-8 gap-4">
                            <div className="flex flex-col items-center sm:items-start">
                                <div className="relative h-24 w-24 rounded-full border-4 border-white dark:border-slate-800 bg-emerald-100 flex items-center justify-center text-emerald-600 text-3xl font-bold shadow-md overflow-hidden">
                                    {getAvatarUrl() ? (
                                        <img src={getAvatarUrl()} alt="Profile" className="h-full w-full object-cover" />
                                    ) : (
                                        formData.fullName.charAt(0).toUpperCase() || "U"
                                    )}
                                    {uploading && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                            <Loader2 className="text-white animate-spin" size={24} />
                                        </div>
                                    )}
                                </div>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleFileChange} 
                                    accept="image/*" 
                                    className="hidden" 
                                />
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    className="mt-3 flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-full border border-emerald-200 disabled:opacity-50"
                                >
                                    <Camera size={16} />
                                    <span>{uploading ? "Uploading..." : "Change Photo"}</span>
                                </button>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3 mt-4 sm:mt-0 mb-2 justify-center sm:justify-start">
                                {!isEditing ? (
                                    <>
                                        <button 
                                            onClick={handleEdit}
                                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm"
                                        >
                                            <Edit2 size={16} />
                                            <span>Edit Profile</span>
                                        </button>
                                        <button 
                                            onClick={() => setShowPasswordModal(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                        >
                                            <Key size={16} />
                                            <span>Change Password</span>
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button 
                                            onClick={handleCancel}
                                            className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                                        >
                                            <X size={16} />
                                            <span>Cancel</span>
                                        </button>
                                        <button 
                                            onClick={handleSave}
                                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm"
                                        >
                                            <Check size={16} />
                                            <span>Save Changes</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Form Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Full Name */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                                    <User size={16} className="text-slate-400" />
                                    Full Name
                                </label>
                                <input 
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                   disabled={!isEditing}
                                    className={`w-full px-4 py-2.5 rounded-lg border ${isEditing ? 'border-emerald-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-800 dark:text-white' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400'} transition-all`}
                                    placeholder="Enter your full name"
                                />
                            </div>

                            {/* Email Address (Readonly always) */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                                    <Mail size={16} className="text-slate-400" />
                                    Email Address
                                </label>
                                <input 
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    disabled={!isEditing}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                                />
                            </div>

                            {/* Role (Dropdown - disabled by default) */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                                    <Shield size={16} className="text-slate-400" />
                                    Account Role
                                </label>
                                <input 
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    disabled={true}
                                    className={`w-full px-4 py-2.5 rounded-lg border ${true ? 'border-emerald-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-800 dark:text-white' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 appearance-none'} transition-all`}
                                >
                                   
                                </input>
                            </div>

                            {/* Account Created Date (Readonly) */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                                    <Calendar size={16} className="text-slate-400" />
                                    Member Since
                                </label>
                                <input 
                                    type="text"
                                    name="joinDate"
                                    value={formData.joinDate}
                                    disabled={true}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                                />
                            </div>

                            {/* Address (Textarea) */}
                            <div className="space-y-2 md:col-span-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                                    <MapPin size={16} className="text-slate-400" />
                                    Address
                                </label>
                                <textarea 
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    rows="3"
                                    className={`w-full px-4 py-2.5 rounded-lg border ${isEditing ? 'border-emerald-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-800 dark:text-white' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400'} transition-all resize-none`}
                                    placeholder="Enter your address"
                                ></textarea>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <Lock className="text-emerald-500" size={20} />
                                Change Password
                            </h3>
                            <button onClick={() => setShowPasswordModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={submitPasswordChange} className="p-6 space-y-4">
                            {/* Old Password */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Current Password</label>
                                <div className="relative">
                                    <input 
                                        type={showPasswords.old ? "text" : "password"}
                                        name="old_password"
                                        value={passwordData.old_password}
                                        onChange={handlePasswordDataChange}
                                        required
                                        className="w-full pl-4 pr-10 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                                        placeholder="••••••••"
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPasswords(prev => ({ ...prev, old: !prev.old }))}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPasswords.old ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* New Password */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">New Password</label>
                                <div className="relative">
                                    <input 
                                        type={showPasswords.new ? "text" : "password"}
                                        name="new_password"
                                        value={passwordData.new_password}
                                        onChange={handlePasswordDataChange}
                                        required

                                        className="w-full pl-4 pr-10 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                                        placeholder="••••••••"
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Confirm New Password</label>
                                <div className="relative">
                                    <input 
                                        type={showPasswords.confirm ? "text" : "password"}
                                        name="confirm_password"
                                        value={passwordData.confirm_password}
                                        onChange={handlePasswordDataChange}
                                        required
                                        className="w-full pl-4 pr-10 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                                        placeholder="••••••••"
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setShowPasswordModal(false)}
                                    className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={passwordUploading}
                                    className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 dark:shadow-none flex items-center justify-center gap-2 disabled:opacity-70"
                                >
                                    {passwordUploading ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        "Update Password"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default Profile;
