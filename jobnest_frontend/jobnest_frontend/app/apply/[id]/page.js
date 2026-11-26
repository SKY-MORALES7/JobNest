"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import API from "../../../lib/api";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";

export default function ApplyPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [jobDetails, setJobDetails] = useState(null);
  const [jobLoading, setJobLoading] = useState(true);
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userFullName, setUserFullName] = useState("");
  
  // New Form Fields
  const [formData, setFormData] = useState({
   
    phone: "",
    experience: "",
    previousJobs: "",
  });

useEffect(() => {
  // Try to get full_name, fallback to username if full_name isn't set yet
  const storedName = localStorage.getItem("full_name") || localStorage.getItem("username") || "Guest User";
  setUserFullName(storedName);

  const fetchJob = async () => {
    try {
      const res = await API.get(`/jobs/${id}/`);
      setJobDetails(res.data);
    } catch (err) {
      console.error("Error fetching job:", err);
      toast.error("Could not find job details.");
    } finally {
      setJobLoading(false);
    }
  };

  if (id) {
    fetchJob();
  } else {
    setJobLoading(false);
  }
}, [id]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    const { name, value } = e.target;

  if (name === "phone") {
    // 1. Remove everything except digits and '+'
    // 2. Ensure '+' only stays if it is the first character
    const cleaned = value.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "");
    
    setFormData({ ...formData, [name]: cleaned });
  } else {
    setFormData({ ...formData, [name]: value });
  }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!resume) return toast.error("Please upload a resume.");

    setLoading(true);
    const data = new FormData();
    data.append("phone", formData.phone);
    data.append("job", id);
    data.append("resume", resume);
    data.append("experience_years", formData.experience);
    data.append("previous_jobs", formData.previousJobs);
    data.append("full_name", userFullName)

    try {
      await API.post(`/apply/`, data, {
        headers: { "Content-Type": "multipart/form-data" },

      });

      toast.success("Application sent!");
      router.push("/joblist");
    } catch (error) {
      toast.error("Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  if (jobLoading) return <Loader />;
  if (!jobDetails) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 text-white">
        <p>Could not load this job application.</p>
        <button
          type="button"
          onClick={() => router.push("/joblist")}
          className="rounded bg-teal-600 px-4 py-2 font-bold hover:bg-teal-700"
        >
          Return to job listings
        </button>
      </main>
    );
  }
  if (loading) return <Loader />;

  return (

            <main className="relative min-h-screen w-full overflow-hidden">
    <div 
  className="absolute inset-0 z-0 animate-kenburns bg-cover bg-center"
  style={{ backgroundImage: `url('/images/flickr-50963545897.png')` }}
/>
    
    <div className="relative z-10 max-w-2xl mx-auto my-12 p-8 bg-white shadow-2xl rounded-3xl border border-gray-100  bg-gradient-to-r from-sky-400/30 via-sky-800/60 to-blue-300/50 animate-gradient">
      <div className="mb-8 border-b pb-6">
        <h1 className="text-3xl font-extrabold text-gray-900">Apply for {jobDetails.title}</h1>
        <p className="text-gray-500 mt-2">{jobDetails.company_name} • {jobDetails.location}</p>
      </div>

      <form onSubmit={handleApply} className="space-y-6">
        {/* Personal Details Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
            <input 
              type="text"
              value = {userFullName}
              disabled
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
      
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
            <input 
              type="tel" name="phone" required 
              value = {formData.phone || ""}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="+234..."
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Experience Details */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Years of Experience</label>
          <input 
            type="number" name="experience" required min = "1" 
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
            placeholder="e.g. 3"
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Previous Roles / Companies</label>
          <textarea 
            name="previousJobs" rows="3"
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
            placeholder="Software Engineer at Google, Intern at Jumia..."
            onChange={handleInputChange}
          ></textarea>
        </div>

        {/* Resume Upload Section */}
        <div className="bg-gray-50/30 p-6 rounded-2xl border-2 border-dashed border-gray-200 text-center">
          <label className="cursor-pointer block">
            <span className="text-teal-600 font-bold block mb-2">Upload your Resume (PDF)</span>
            <input
              type="file" accept=".pdf" required
              onChange={(e) => setResume(e.target.files[0])}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
            />
          </label>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit" disabled={loading}
            className="flex-1 bg-teal-600 text-white py-4 rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            Send Application
          </button>
          <button
            type="button" onClick={() => router.back()}
            className="px-8 py-4 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all"
          >
            Back
          </button>
        </div>
      </form>
    </div>
    </main>
  );
}