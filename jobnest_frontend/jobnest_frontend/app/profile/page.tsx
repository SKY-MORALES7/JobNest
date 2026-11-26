"use client";

import API from "../../lib/api";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Loader from "../components/Loader";

export default function ProfilePage() {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  
 
  const [companyName, setCompanyName] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyLocation, setCompanyLocation] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // 1. Fetch CURRENT data on load
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const res = await API.get("api/user/update/"); 
        
        // Basic Info
        setUsername(res.data.username || "");
        setEmail(res.data.email || "");
        setRole(res.data.role || "User");
        
        // 🔹 NEW: Load Company Info if user is an employer
        if (res.data.role === 'employer') {
          setCompanyName(res.data.company_name || "");
          setCompanyPhone(res.data.company_phone || "");
          setCompanyLocation(res.data.company_location || "");
          setCompanyDescription(res.data.company_description || "");
        }

      } catch (err) {
        console.error("Failed to fetch fresh profile data:", err);
      } finally {
        setProfileLoading(false);
      }
    };

    if (!localStorage.getItem("access")) {
      router.push("/login");
    } else {
      fetchProfileData();
    }
  }, [router]);

  // 2. Save All Changes
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (loading) return;
    
    if (newPassword && newPassword !== confirmPassword) {
      return toast.error("Passwords do not match!");
    }

    setLoading(true)
    try {
    
      const updateData: any = {
        username: username,
        email: email,
        company_name: companyName,
        company_phone: companyPhone,
        company_location: companyLocation,
        company_description: companyDescription
      };
      
      if (newPassword) updateData.password = newPassword;

      await API.patch("api/user/update/", updateData);

      if (newPassword) {
        toast.success("Password updated! Logging you out for security...!", { icon: '🔐' });
        localStorage.clear(); 
        setTimeout(() => router.push("/login"), 2000);
      } else {
        localStorage.setItem("username", username);
        toast.success("Profile updated!");
      }

    } catch (err) {
      toast.error("Update failed. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading) return <Loader />;
  if (loading) return <Loader />;

  return (
    <main className="relative min-h-[calc(100vh-64px)] w-full flex items-center justify-center p-6 bg-slate-950">
      <div className="fixed inset-0 z-0 animate-kenburns bg-cover bg-center" style={{ backgroundImage: `url('/images/spiderverse-concept-art-05.jpg')` }} />
      <div className="fixed inset-0 bg-black/70 z-1" />

      <div className="relative z-10 w-full max-w-lg bg-indigo-950/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl my-10">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-teal-500 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl font-black text-white shadow-lg uppercase">
            {username?.charAt(0)}
          </div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-tighter">Account Settings</h2>
          <p className="text-teal-400 text-[10px] font-black uppercase tracking-[0.2em]">{role?.replace("_", " ")}</p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
          {/* --- Section 1: User Info --- */}
          <div className="space-y-4">
            <h3 className="text-white/40 text-[10px] font-black uppercase tracking-widest border-b border-white/10 pb-2">General Info</h3>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="w-full bg-white/10 border border-white/20 p-3 rounded-xl text-white text-sm" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full bg-white/10 border border-white/20 p-3 rounded-xl text-white text-sm" />
          </div>

          {/* --- 🔹 NEW Section 2: Company Info (Only shows for Employers) --- */}
          {role === 'employer' && (
            <div className="space-y-4 pt-2">
              <h3 className="text-white/40 text-[10px] font-black uppercase tracking-widest border-b border-white/10 pb-2">Company Details</h3>

                            <h3 className="text-white/40 text-[10px] font-black uppercase tracking-widest   mt-2">Company Name</h3>   
           <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Company Name" className="w-full bg-white/10 border border-white/20 p-3 rounded-xl text-white text-sm" />
                                          <h3 className="text-white/40 text-[10px] font-black uppercase tracking-widest   mt-2">Company Number</h3>
              <input type="text" value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} placeholder="Company Phone" className="w-full bg-white/10 border border-white/20 p-3 rounded-xl text-white text-sm" />
                                         <h3 className="text-white/40 text-[10px] font-black uppercase tracking-widest   mt-2">Company Location</h3>
              <input type="text" value={companyLocation} onChange={(e) => setCompanyLocation(e.target.value)} placeholder="HQ Location (e.g. New York)" className="w-full bg-white/10 border border-white/20 p-3 rounded-xl text-white text-sm" />
                                          <h3 className="text-white/40 text-[10px] font-black uppercase tracking-widest   mt-2">Company Description</h3>
              <textarea value={companyDescription} onChange={(e) => setCompanyDescription(e.target.value)} placeholder="Company Description" className="w-full bg-white/10 border border-white/20 p-3 rounded-xl text-white text-sm h-24" />
            </div>
          )}

          {/* --- Section 3: Security --- */}
           <label className="block text-gray-400 text-[10px] font-bold mb-1.5 uppercase ml-1 text-left">
                New Password
              </label>
               <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Leave blank to keep current"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 p-3 rounded-xl text-white focus:ring-1 focus:ring-teal-500 outline-none text-sm transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-[10px] font-bold uppercase tracking-widest"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            
            
            <div>
              <label className="block text-gray-400 text-[10px] font-bold mb-1.5 uppercase ml-1 text-left">
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-white/10 border border-white/20 p-3 rounded-xl text-white focus:ring-1 focus:ring-teal-500 outline-none text-sm transition"
              />
            </div>
          <button type="submit" className="w-full bg-teal-500 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-teal-600 transition shadow-lg mt-6">
            Save All Changes
          </button>
        </form>
      </div>
    </main>
  );
}