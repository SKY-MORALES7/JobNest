"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import API from "../../../lib/api"; 
import toast from "react-hot-toast";
import Loader from "../../components/Loader";

export default function ApplicationDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFullDetails = async () => {
   
      try {
        const res = await API.get(`/applications/${id}/`);
           console.log(res.data)
           
        setApp(res.data);
      } catch (err) {
        toast.error("Could not load candidate details");
      } finally {
        setLoading(false);
      }
    };
    fetchFullDetails();
  }, [id]);

  if (loading) return <Loader />;
  if (!app) return <div className="p-10 text-center text-red-500">Application not found.</div>;

  return (
    <div 
  className="relative w-full min-h-screen bg-cover bg-center bg-fixed overflow-x-hidden"
  style={{ backgroundImage: "url('/images/alphacoders-976746.jpg')" }}
>
    <div className="max-w-3xl mx-auto my-9 p-6 bg-white/80 border border-gray-200 rounded-xl">
      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
        <button 
          onClick={() => router.back()} 
          className="text-sm font-medium text-gray-500 hover:text-blue-600 transition"
        >
          ← Back to Inbox
        </button>
        <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-700 rounded-full uppercase tracking-wider">
          {app.status || 'Pending Review'}
        </span>
      </div>

      {/* Profile Name & Title */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">{app.full_name}</h1>
        <p className="text-gray-500 text-lg">{app.job_title}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-10">
        {/* Main Details (Spans 2 columns) */}
        <div className="md:col-span-2 space-y-8">
          <div>
            <h3 className="text-xs font-bold text-black uppercase tracking-widest mb-2">Experience</h3>
            <p className="text-2xl font-semibold text-gray-800"> {app.experience_years} Years</p>
          </div>

          <div>
            <h3 className="text-xs font-bold text-black uppercase tracking-widest mb-2">Previous Roles & Experience Summary</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {app.previous_roles || "No details provided."}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold text-black uppercase tracking-widest mb-2">Contact Number</h3>
            <p className="text-gray-800 font-medium">{app.phone || "Not provided"}</p>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-4">
          <div className="p-5 bg-gray-50 rounded-lg border border-fuchsia-300/80 /text-center">
            <p className="text-sm font-semibold text-gray-700 mb-4">Documents</p>
            {app.resume ? (
              <a 
                href={app.resume} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full py-2 px-4 bg-white border border-blue-600 text-blue-600 rounded font-medium hover:bg-blue-50 transition text-sm"
              >
                View Resume PDF
              </a>
            ) : (
              <p className="text-xs text-red-500 italic">No resume uploaded</p>
            )}
          </div>

          <button 
            onClick={() => router.push(`/chat/${id}`)}
            className="w-full py-3 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition shadow-sm"
          >
            Send Message
          </button>
        </div>
      </div>
    </div>
    </div>
  );
}