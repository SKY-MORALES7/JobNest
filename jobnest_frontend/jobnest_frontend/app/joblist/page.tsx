"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import API from "../../lib/api";
import Loader from "../components/Loader";


export default function JobListPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

useEffect(() => {
  const token = localStorage.getItem("access");
  setIsLoggedIn(!!token);
  
  if (token) {
    fetchAllJobs(token);
  } else {
    setLoading(false); // Stop loading immediately if there's no token
  }
}, []);
  const fetchAllJobs = async (token) => {
    if (!token) {
      setLoading(false);
      setJobs([]);
      return;
    }
    try {
      setLoading(true);
      const res = await API.get("/jobs/");
      setJobs(res.data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const title = job.title?.toLowerCase() || "";
    const location = job.location?.toLowerCase() || "";
    const searchTerm = search.toLowerCase();
    return title.includes(searchTerm) || location.includes(searchTerm);
  });

  if (loading && isLoggedIn) return <Loader />;

  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      <div 
        className="absolute inset-0 z-0 animate-kenburns bg-cover bg-center"
        style={{ backgroundImage: `url('/images/wallpapercave-rnq3ljf.jpg')` }}
      />
      <div className="relative z-10 min-h-screen w-full max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold my-8 text-center text-fuchsia-300">Job Listings</h1>

        {/* 🔹 Search Bar Area */}
        <div className="mb-6 max-w-md mx-auto text-center">
          {isLoggedIn && (
            <input 
              type="text"
              placeholder="Search by title or location..."
              className="w-full p-3 border border-sky-800/90 rounded-lg shadow-sm outline-none focus:border-blue-500 text-white bg-slate-900/40"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          )}
          
          {!isLoggedIn && (
            <div className="mt-4 p-4 rounded-lg text-zinc-100">
              <p className="text-2xl font-bold">Please login or signup to access and apply for various job listings.</p>
            </div>
          )}
        </div>

        {/* 🔹 The Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {isLoggedIn ? (
            filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="border border-zinc-50 rounded-xl shadow-lg p-4 flex flex-col justify-between bg-blue-900/70"
                >
                  <div>
                    <h2 className="text-2xl font-black text-white mb-2 drop-shadow-md uppercase tracking-tight">
                      Job Title: {job.title}
                    </h2>
                    <p className="text-slate-200 text-sm mb-4 leading-relaxed line-clamp-2">
                      Description: {job.description}
                    </p>

                    <div className="flex gap-3 my-2">
                      <span className="bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">
                        {job.job_type}
                      </span>
                      <span className="bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">
                        {job.location_type}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="bg-fuchsia-500/20 text-fuchsia-300 text-xs px-2 py-1 rounded border border-fuchsia-500/30 font-bold">
                         ${Number(job.salary).toLocaleString()}
                      </span>
                      <span className="bg-cyan-500/20 text-cyan-300 text-xs px-2 py-1 rounded border border-cyan-500/30 font-bold">
                         {job.location}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {job.has_applied ? (
                      <button 
                        onClick={() => router.push('/applications')}
                        className="bg-green-800/70 text-white py-3 rounded-xl hover:bg-emerald-600 transition w-full font-bold"
                      >
                        Already Applied (View Status)
                      </button>
                    ) : (
                      <button 
                        onClick={() => router.push(`/apply/${job.id}`)}
                        className="w-full py-3 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white rounded-xl font-bold uppercase tracking-widest shadow-lg transition-all hover:brightness-110 hover:scale-[1.02] active:scale-95 shadow-fuchsia-900/20"
                      >
                        Apply now
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-white/70 text-2xl font-bold">There are no available jobs at the moment.</p>
              </div>
            )
          ) : null}
        </div>
      </div>
    </main>
  );
}