"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import API from "../lib/api";
import Link from "next/link";
import toast from "react-hot-toast"
import Swal from "sweetalert2"
import Loader from "./components/Loader";
export default function HomePage() {
  const router = useRouter();

  const [username, setUsername] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const syncAuth = () => {
      const storedUsername = localStorage.getItem("username");
      const storedRole = localStorage.getItem("role")?.toLowerCase().trim();
      const access = localStorage.getItem("access"); // 1. Get the token

      if (storedUsername && access) {
        setUsername(storedUsername);
        setRole(storedRole);
        
        // 🔹 Combined Fetch Logic here
        if (storedRole === "employer") {
          fetchMyJobs();
        } else if (storedRole === "job_seeker") {
          fetchAllJobs();
        }
      } else {
        setUsername(null);
        setRole(null);
      }
      setLoading(false);
    };

    syncAuth();
  }, []);

  useEffect(() => {
  const handleRefresh = () => {
    console.log("New message detected! Refreshing job list...");
    // 🔹 This calls the functions you already wrote below
    if (role === "employer") {
      fetchMyJobs();
    } else if (role === "job_seeker") {
      fetchAllJobs();
    }
  };

  // 1. Start listening for the Header's "shout"
  window.addEventListener("refreshJobs", handleRefresh);

  // 2. Clean up when the user leaves the page
  return () => {
    window.removeEventListener("refreshJobs", handleRefresh);
  };
}, [role]); // Runs whenever the role is determined

const fetchMyJobs = async () => {
    try {
      const access = localStorage.getItem("access");
      if (!access) return;
      const res = await API.get("/jobs/", {
        headers: { Authorization: `Bearer ${access}` },
      });
      setJobs(res.data);
    } catch (err) {

// 1. Check if it's specifically a 401 from Axios
  if (err.response && err.response.status === 401) {
    console.log("Token expired. Cleaning up...");
    localStorage.removeItem("access");
    window.location.href = "/login";
    return; // Stop execution here
  }
  
// 2. Otherwise, log the error normally
  console.error("Fetch error:", err.response?.data || err.message);
}
  }

  // const fetchAllJobs = async () => {
  //   try {
  //     const res = await API.get("/jobs/"); 
  //     setJobs(res.data);
  //   } catch (error) {
  //     console.error("Seeker fetch error:", error?.response || error);
  //   }
  // };

  const fetchAllJobs = async () => {
  try {
    // 1. Grab the token from storage
    const access = localStorage.getItem("access");

    // 2. Send the token in the headers
    const res = await API.get("/jobs/", {
      headers: { 
        Authorization: `Bearer ${access}` 
      },
    });

    setJobs(res.data);
  } catch (err) {
  // 1. Check if it's specifically a 401 from Axios
  if (err.response && err.response.status === 401) {
    console.log("Token expired. Cleaning up...");
    localStorage.removeItem("access");
    window.location.href = "/login";
    return; // Stop execution here
  }
  
  // 2. Otherwise, log the error normally
  console.error("Fetch error:", err.response?.data || err.message);
}
}

  const deleteJob = async (jobId) => {
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
      fetchMyJobs(); 
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete job.");
    }
  };
}

  const viewMessages = (jobId) => {
    router.push(`/messages/${jobId}`);
  };

  if (!isClient || loading) return <Loader />;

  if (username) {
    return (
<main className="relative min-h-screen w-full overflow-hidden">
    <div 
  className="absolute inset-0 z-0 animate-kenburns bg-cover bg-center"
  style={{ backgroundImage: `url('/images/spiderverse-concept-art-05.jpg')` }}
/>

      <div    className="flex flex-col items-center justify-center min-h-screen relative z-10"
  >
        <h1 className="text-5xl font-bold mb-6 text-center mt-12 text-teal-300/70">
          Welcome, {username}!
        </h1>

        {/* 🔹 FIXED: Changed '&&' to '?' to match the ':' later */}
        {role === "employer" ? (
          <div className="mt-10 w-full max-w-7xl px-4 md:px-10">
            <div className="text-center mb-10">
              <button 
                onClick={() => router.push("/post-job")}
                className="bg-teal-500 text-white py-3 px-6 rounded-lg font-bold hover:bg-teal-600 transition"
              >
                Post a New Job
              </button>
            </div>

            <h2 className="text-xl font-bold mb-4 text-white/70">Your Posted Jobs</h2>
            <div className="grid md:grid-cols-2 gap-6 border-t pt-10 m-3">
              {jobs.map((job) => (
                <div key={job.id} className="max-w-2xl w-full border p-4  rounded-xl shadow-lg flex flex-col justify-between  bg-blue-900/70">
                  <div>
                    <div>
  <h2 className="text-2xl font-black text-white mb-2 drop-shadow-md uppercase tracking-tight leading-relaxed line-clamp-2">
    Job Title: {job.title}
  </h2>
  <p className="text-slate-200 text-sm mb-2 leading-relaxed line-clamp-4 pb-2 break-words">
    Description: {job.description}
  </p>
  
  <div className="flex flex-wrap gap-2 mb-4">
    <span className="bg-fuchsia-500/20 text-fuchsia-300 text-xs px-2 py-1 rounded border border-fuchsia-500/30 font-bold">
    Salary: {job.salary ? `$${Number(job.salary).toLocaleString('en-US')}` : "Negotiable"}
    </span>
    <span className="bg-cyan-500/20 text-cyan-300 text-xs px-2 py-1 rounded border border-cyan-500/30 font-bold">
       {job.location}
    </span>
    <p></p>
  </div>
</div>
                   
                    <p className="text-sm text-white mb-2">Skills: {job.skills}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                        onClick={() => router.push('/messages')} 
                      className="bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700"
                    >
                      
                      View Messages
                    </button>


                    <button 
                      onClick={() => router.push(`/edit_job/${job.id}`)}
                      className="bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => deleteJob(job.id)}
                      className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center mt-10">
             <button 
               onClick={() => router.push("/joblist")} 
               className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
             >
               View Job Listings
             </button>
          </div>
        )}
      </div>
          </main>
    );
  }

  return (

  <main className="relative min-h-screen w-full overflow-hidden">  
 
     <div 
  className="absolute inset-0 z-0 animate-kenburns bg-cover bg-center"
  style={{ backgroundImage: `url('/images/spiderverse-concept-art-05.jpg')` }}
/>

  <div 
    className="relative z-10 flex flex-col items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat"
   
  >
      <h1 className="text-4xl font-bold mb-8 text-white">Welcome to JobNest</h1>
      <Link href="/joblist" className="px-6 py-3 bg-indigo-950 text-white rounded hover:bg-indigo-600 transition">
        View Job Listings
      </Link>
    </div>
    </main>

  );
}