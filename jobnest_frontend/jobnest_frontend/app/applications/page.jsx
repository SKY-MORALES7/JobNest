"use client";
import { useEffect, useState } from "react";
import API from "../../lib/api";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Swal from "sweetalert2"
import Loader from "../components/Loader";

export default function ApplicationsPage() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchMyApps = async () => {
      try {
        const res = await API.get("/my-applications/");
        setApps(res.data);
      } catch (err) {
        toast.error("Could not load your applications.");
      } finally {
        setLoading(false);
      }
    };
    fetchMyApps();
  }, []);

   const handleDelete = async (e, appId) => {
    e.stopPropagation(); // Prevent opening the profile/chat
    
   const result = await Swal.fire({
      title: 'Withdraw Application?',
      text: "This will remove your application for this job.",

      showCancelButton: true,
      confirmButtonColor: '#ef4444', 
      cancelButtonColor: '#6b7280', 
      confirmButtonText: 'Yes, remove it!',
      customClass: {
        popup: 'rounded-2xl',
      }
    });

    if (result.isConfirmed) {
      try {
        
        await API.delete(`/applications/${appId}/`); 
        
        toast.success("Application removed.");
        
        // Refresh the list locally
        setApps(apps.filter(app => app.id !== appId));
      } catch (err) {
        console.error(err);
        toast.error("Failed to remove application.");
      }
    }
  };



  if (loading) return <Loader />;

  return (
    <main className="relative min-h-screen p-6">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/spiderverse-concept-art-05.jpg')" }}
      />
      <div aria-hidden="true" className="absolute inset-0 bg-slate-950/50" />
      <div className="relative z-10">
      <h1 className="text-3xl font-bold mb-8 text-fuchsia-300">My Job Applications</h1>
      
      {apps.length === 0 ? (
        <div className=" p-10 rounded-xl text-center border-2 bg-gradient-to-r from-white/80 via-fuchsia-200/40 to-white/50 animate-gradient">
          <p className="text-black font-bold">You haven't applied for any jobs yet.</p>
          <button onClick={() => router.push('/joblist')} className="text-blue-600/50 font-bold mt-2">Browse Jobs</button>
        </div>
      ) : (
        <div className="grid gap-6">
          {apps.map((app) => (
            <div key={app.id} className=" p-5 rounded-2xl shadow-sm border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-white/80 via-fuchsia-200/40 to-white/50 animate-gradient">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{app.job_title}</h3>
                <p className="text-fuchsia-600/90 font-medium">{app.company_name}</p>
                <span className="text-xs text-sky-800 font-semibold uppercase tracking-wider">Status: {app.status}</span>
              </div>

              <div className="flex gap-3 w-full md:w-auto">
                {/* ✅ This is the correct use of app.id */}
                <button 
                  onClick={() => router.push(`/chat/${app.id}`)}
                  className="flex-1 md:flex-none bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition "
                >
                  Contact Employer
                </button>

                   <button 
                  onClick={(e) => handleDelete(e, app.id)}
                  className="p-2 bg-gray-50 text-gray-400 border border-gray-200 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all"
                  title="Delete"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>


              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </main>
  );
}