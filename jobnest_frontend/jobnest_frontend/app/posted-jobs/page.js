"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import API from "../../lib/api";
import Swal from "sweetalert2"
import Loader from "../components/Loader";

export default function PostedJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({ total: 0, accepted: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);

  // Memoize fetchData so it doesn't trigger unnecessary re-renders
  const fetchData = useCallback(async () => {
    try {
      // Fetch Jobs and Applications in parallel for speed
      const [jobsRes, appsRes] = await Promise.all([
        API.get("/jobs/"),
        API.get("/employer/applications/")
      ]);

      setJobs(jobsRes.data);
      
      const allApps = appsRes.data;
      setStats({
        total: allApps.length,
        accepted: allApps.filter(a => a.status === 'accepted').length,
        rejected: allApps.filter(a => a.status === 'rejected').length,
      });
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [fetchData]);


   const handleDelete = async (jobId) => {
   const result = await Swal.fire({
    title: '<span style="font-size: 1.2rem; font-weight: 500; color:white ;">Are You Sure You Want To Delete Job?</span>',
    text: "You won't be able to revert this!",
    color: 'white',
    // icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#1ab814', // Your teal color
    cancelButtonColor: '#ef4444',
    confirmButtonText: 'Yes, delete it!',
    background: '#1e293b',
    width: '450px',
    customClass: {
    popup: 'rounded-2xl shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200', 
  },
  

  });
  if (result.isConfirmed){
    try {
      const access = localStorage.getItem("access");
      await API.delete(`/jobs/${jobId}/`, {
        headers: { Authorization: `Bearer ${access}` },
      });
      toast.success("Job deleted successfully.");
      fetchData(); 
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete job.");
    }

  }
}

  if (loading) return <Loader />;

  return (
    <main className="min-h-screen bg-slate-950 p-6 pt-24 text-white font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-end mb-10 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter italic">Posted Jobs</h1>
            <p className="text-teal-400 font-bold text-[10px] uppercase tracking-widest">View your job postings History</p>
          </div>
          <Link href="/post-job" className="bg-fuchsia-600 hover:bg-fuchsia-500 px-6 py-3 rounded-full font-black uppercase text-xs transition-all active:scale-95 shadow-[0_0_20px_rgba(217,70,239,0.4)]">
            + Post New Job
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 text-center">
          <div className="bg-indigo-950/40 border border-teal-500/30 p-6 rounded-2xl backdrop-blur-md shadow-[0_0_15px_rgba(20,184,166,0.1)]">
            <p className="text-teal-400/70 text-[10px] font-black uppercase tracking-widest mb-1">Total Applied</p>
            <h3 className="text-3xl font-black text-white">{stats.total}</h3>
          </div>
          <div className="bg-indigo-950/40 border border-sky-500/30 p-6 rounded-2xl backdrop-blur-md">
            <p className="text-sky-400 text-[10px] font-black uppercase tracking-widest mb-1">Accepted</p>
            <h3 className="text-3xl font-black text-white">{stats.accepted}</h3>
          </div>
          <div className="bg-indigo-950/40 border border-red-500/30 p-6 rounded-2xl backdrop-blur-md">
            <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mb-1">Rejected</p>
            <h3 className="text-3xl font-black text-white">{stats.rejected}</h3>
          </div>
          <div className="bg-indigo-950/40 border border-fuchsia-500/30 p-6 rounded-2xl backdrop-blur-md">
            <p className="text-fuchsia-400 text-[10px] font-black uppercase tracking-widest mb-1">Active Jobs</p>
            <h3 className="text-3xl font-black text-white">{jobs.length}</h3>
          </div>
        </div>

        {/* Jobs List Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold uppercase tracking-tight text-white/50 mb-4">Your Active Listings</h2>
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <div key={job.id} className="group bg-white/5 border border-white/10 p-5 rounded-2xl flex justify-between items-center hover:bg-white/10 transition-all">
                <div>
                  <h4 className="text-lg font-bold text-white group-hover:text-fuchsia-400 transition-colors">{job.title}</h4>
                  <p className="text-xs text-white/40 uppercase tracking-widest mt-1">{job.location} • {job.job_type || 'Full Time'}</p>
                </div>
                <div className="flex items-center gap-6">
 
                   <button   onClick={() => handleDelete(job.id)} className="border  px-4 py-2 rounded-lg  text-red-500/50 hover:text-red-500 text-[10px] font-black uppercase transition" >
                      Delete
                   </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl">
              <p className="text-white/30 font-bold uppercase tracking-widest">No jobs posted yet</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}