"use client";
import { useEffect, useState } from "react";
import API from "../../lib/api";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import Loader from "../components/Loader";

export default function MessagesPage() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null); // Track role for UI display
  const router = useRouter();

  useEffect(() => {
    const userRole = localStorage.getItem("role")?.toLowerCase();
    setRole(userRole);

    // Determine correct endpoint
    const endpoint = userRole === 'employer' 
      ? 'employer-conversations/' 
      : 'jobseeker-conversations/';
    
    const loadData = async () => {
      try {
        const res = await API.get(endpoint);
        setConversations(res.data);
      } catch (err) {
        console.error("Failed to load conversations:", err);
        toast.error("Could not load messages.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleDelete = async (e, convId) => {
    e.stopPropagation();
    
    const result = await Swal.fire({
      title: 'Remove Conversation?',
      text: "This will remove this message from your inbox.",
      color: 'white',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      background: '#1e293b',
      confirmButtonText: 'Yes, delete it!',
      customClass: { popup: 'rounded-2xl' }
    });

    if (result.isConfirmed) {
      try {
        // Use the generic delete endpoint if you have one, 
        // otherwise check role for the specific path
        const deletePath = role === 'employer' 
          ? `/employer/conversations/${convId}/` 
          : `/jobseeker/conversations/${convId}/`; // Ensure this exists in backend

        await API.delete(deletePath);
        setConversations(conversations.filter(c => c.id !== convId));
        toast.success("Deleted successfully");
      } catch (err) {
        toast.error("Failed to delete");
      }
    }
  };

  if (loading) return <Loader />;

  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      <div 
        className="absolute inset-0 z-0 animate-kenburns bg-cover bg-center"
        style={{ backgroundImage: `url('/images/squarespace-345-810-B057.jpg')` }}
      />

      <div className="relative z-10 max-w-4xl mx-auto my-12 p-6 bg-amber-200/30 shadow-lg rounded-2xl border border-gray-100">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Inbox</h1>
        
        {conversations.length === 0 ? (
          <div className="text-center py-20 bg-white/60 rounded-xl">
            <p className="text-sky-800 text-lg">Your inbox is empty.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {conversations.map((conv, index) => (
              <div 
                key={`${conv.id}-${index}`}
                className="flex items-center justify-between p-5 bg-sky-400/30 border rounded-xl hover:border-teal-900 hover:shadow-sm transition-all group relative"
              >
                <div 
                  onClick={() => router.push(`/chat/${conv.id}`)}
                  className="flex-1 cursor-pointer pr-4"
                >
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-white group-hover:text-sky-100">
                      {/* Show Company Name for Jobseekers, Applicant Name for Employers */}
                      {role === 'employer' ? conv.applicant_name : conv.company_name}
                    </span>
                    <span className="text-sm text-gray-900 font-medium">
                      Job: {conv.job_title}
                    </span>
                    <p className="text-sm text-white/90 mt-2 italic truncate max-w-xs">
                      "{conv.last_message_preview}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/application/${conv.id}`); 
                    }}
                    className="px-4 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg text-xs font-bold hover:bg-blue-600/40 hover:text-white transition-all"
                  >
                    View Details
                  </button>

                  <button 
                    onClick={(e) => handleDelete(e, conv.id)}
                    className="p-2 bg-gray-50 text-gray-400 border border-gray-200 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>

                  <div className="w-12 flex justify-end">
                    {conv.unread_count > 0 && (
                      <span className="bg-red-500 text-white text-[10px] px-2 py-1 rounded-full font-black">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}