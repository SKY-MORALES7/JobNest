"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import API from "../../../lib/api"; 
import toast from "react-hot-toast";
import Loader from "../../components/Loader";

export default function EditJobPage() {
  const router = useRouter();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    salary: "",
    skills: "",
    job_type: "Full-Time",
    location: "On-site"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const access = localStorage.getItem("access");
        const res = await API.get(`/jobs/${id}/`, {
          headers: { Authorization: `Bearer ${access}` },
        });
        
        // 🔹 FORMAT ON LOAD: Add commas immediately so the user sees them
        const jobData = res.data;
        setFormData({
          ...jobData,
          salary: jobData.salary ? Number(jobData.salary).toLocaleString("en-US") : "",
          job_type: jobData.job_type || "Full-Time",
          location_type: jobData.location_type || "On-site" 
        });
      } catch (error) {
        toast.error("Could not find that job.");
        router.push("/");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchJob();
  }, [id, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "salary") {
      const numericValue = value.replace(/[^0-9]/g, "");
      const formattedValue = numericValue 
        ? Number(numericValue).toLocaleString("en-US") 
        : "";
      setFormData({ ...formData, [name]: formattedValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    // 🔹 STRIP COMMAS: Create the clean version for the database
    const dataToSend = {
      ...formData,
      salary: parseInt(formData.salary.toString().replace(/,/g, ""), 10)
    };

    try {
      const access = localStorage.getItem("access");
      // 🔹 SEND dataToSend, NOT formData
      await API.put(`/jobs/${id}/`, dataToSend, {
        headers: { Authorization: `Bearer ${access}` },
      });
      toast.success("Job updated successfully!");
      router.push("/"); 
    } catch (error) {
      toast.error("Update failed. Check your connection.");
      console.error(error);
    }
  };

if (loading) {
  return <Loader />;
}

  return (
  
            <main className="relative min-h-screen w-full overflow-hidden">
    <div 
  className="absolute inset-0 z-0 animate-kenburns bg-cover bg-center"
  style={{ backgroundImage: `url('/images/marvel-wakanda-1920x1080.jpg')` }}
/>

    <div className=" relative z-10 max-w-xl mx-auto mt-10 p-8 shadow-2xl rounded-2xl border border-gray-100 bg-gradient-to-r from-amber-400/30 via-cyan-500/40 to-blue-300/50 animate-gradient">

      <h1 className="text-2xl font-bold mb-6 text-cyan-50">Edit Job Listing</h1>
      
      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-white mb-1">Job Title</label>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="text-green-200 w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-white mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            autoComplete="off"
            onChange={handleChange}
            rows="4"
            className="text-green-300 w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            required
          />
        </div>

        <div>
          <div>
            <label className="block text-sm font-semibold text-white mb-1">Location</label>
            <input
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="text-amber-400 w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-white mb-1">Salary ($)</label>
            <input
              name="salary"
              type="text" // 🔹 Changed from number to text to support commas
              inputMode="numeric"
              value={formData.salary}
              onChange={handleChange}
              className="text-white/90 w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-white mb-1">Skills</label>
            <input
              name="skills"
              type="text"
              value={formData.skills}
              onChange={handleChange}
              className="text-sky-200 w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              
            />
          </div>
<div className = "grid grid-cols-2 gap-4 mt-4">
  <div>
    <label className = "block text-sm font-semibold text-white mb-1">Job-Type</label>
    <select
      name="job_type"
      value={formData.job_type}
      onChange={handleChange}
      className="text-sky-200 font-semibold w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
    >
      <option value="Full-Time">Full-Time</option>
      <option value="Part-Time">Part-Time</option>
      <option value="Contract">Contract</option>
      <option value="Freelance">Freelance</option>
    </select>
    </div>
    <div>
      <label className = "block text-sm font-semibold text-white mb-1">location-Type</label>
      <select
        name = "location_type"
        value = {formData.location_type}
        onChange = {handleChange}
        className = "text-sky-200 font-semibold w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
      >
        <option value = "On-site">On-site</option>
        <option value = "Remote">Remote</option>
        <option value = "Hybrid">Hybrid</option> 
        </select>
      </div>
  </div>

        </div>

        <div className="flex gap-3 mt-6">
          <button 
            type="submit" 
            className="flex-1 bg-teal-500 text-white py-3 rounded-lg font-bold hover:bg-teal-600 transition shadow-lg"
          >
            Update Job
          </button>
          <button 
            type="button" 
            onClick={() => router.back()} 
            className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-lg font-bold hover:bg-gray-200 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
    
    </main>
  );
}