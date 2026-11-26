"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import useAPI from "../../../lib/useAPI";
import { API_ENDPOINTS, STORAGE_KEYS, ROLES, APP_STATUSES } from "../../../lib/constants";
import toast from "react-hot-toast";
import Swal from "sweetalert2"
import Loader from "../../components/Loader";

export default function ChatWindow() {
  const { id } = useParams();
  const router = useRouter();
  
  // State Management
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [prevCount, setPrevCount] = useState(0);
  const [currentStatus, setCurrentStatus] = useState("");
  const [userRole, setUserRole] = useState("");
  
  const scrollRef = useRef(null);

  // 1. Initialize User Role
  useEffect(() => {
    const role = localStorage.getItem(STORAGE_KEYS.ROLE);
    if (role) setUserRole(role);
  }, []);

  const fetchChatData = useCallback(async () => {
    try {
      const data = await useAPI.get(API_ENDPOINTS.CHAT(id));
      const { messages: newMessages, application_status } = data;
      
      const activeRole = userRole || localStorage.getItem(STORAGE_KEYS.ROLE);

      if (application_status !== currentStatus) {
        if (activeRole?.toLowerCase() === ROLES.JOB_SEEKER) {
          const statusLower = application_status?.toLowerCase();
          const storageKey = `celebrated_${id}_${statusLower}`;
          const hasCelebrated = localStorage.getItem(storageKey);

          if (statusLower === APP_STATUSES.ACCEPTED && !hasCelebrated) {
            toast.success("CONGRATULATIONS! You have been accepted!", { 
              id: 'status-toast', 
              duration: 6000,
              icon: '🎉' 
            });
            localStorage.setItem(storageKey, 'true');
          } else if (statusLower === APP_STATUSES.REJECTED && !hasCelebrated) {
            toast.error("Update: Your application was declined.", { duration: 6000 });
            localStorage.setItem(storageKey, 'true');
          }
        }
        setCurrentStatus(application_status);
      }

      // ✅ B. NEW MESSAGE NOTIFICATION
      if (prevCount > 0 && newMessages.length > prevCount) {
        const lastMsg = newMessages[newMessages.length - 1];
        if (lastMsg.is_me === false) {
          const sender = lastMsg.sender_name || "the Employer";
          toast.success(`New message from ${sender}`, {
            id: `msg-${lastMsg.id}`,
            icon: '💬',
            position: 'bottom-right',
            style: { borderRadius: '12px', background: '#1e293b', color: '#fff' }
          });
        }
      }

      setMessages(newMessages || []);
      setPrevCount(newMessages?.length || 0);
      setLoading(false);
    } catch (err) {
      // We throw the error so the interval's try/catch can see the status code
      throw err; 
    }
  }, [id, userRole]);

// 3. Polling Interval (MODIFIED TO STOP 401 SPAM AND REDIRECT)
  useEffect(() => {
    const runFetch = async () => {
      try {
        await fetchChatData();
      } catch (err) {
        if (err.response?.status === 401) {
          clearInterval(interval); 
          console.warn("Token expired, redirecting...");
          
          // Clear tokens so the app knows we are logged out
          localStorage.removeItem(STORAGE_KEYS.ACCESS);
          localStorage.removeItem(STORAGE_KEYS.REFRESH);
          
          // Redirect to login
          window.location.href = "/login"; 
        }
        console.error("Chat sync error:", err);
      }
    };

    runFetch();
    const interval = setInterval(runFetch, 4000);
    
    return () => clearInterval(interval);
  }, [fetchChatData]);

  // 4. Auto-Scroll to Bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      await useAPI.post(API_ENDPOINTS.SEND_MESSAGE(id), { content: newMessage });
      setNewMessage("");
      fetchChatData(); 
    } catch (err) {
      toast.error("Failed to send message");
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await useAPI.post(API_ENDPOINTS.UPDATE_STATUS(id), { status: newStatus });
      setCurrentStatus(res.status);
      toast.success(`Application marked as ${newStatus}`);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteMessage = async (messageId) => {
    // SweetAlert2 Confirmation Popup
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      // icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444", // Tailwind red-500
      cancelButtonColor: "#6366f1",  // Tailwind indigo-500
      confirmButtonText: "Yes, delete it!",
      background: "#1e293b",         // Optional: Dark theme to match your UI
      color: "#fff"                  // Optional: Text color for dark theme
    }).then(async (result) => {
      // ONLY run if the user clicked "Yes"
      if (result.isConfirmed) {
        try {
          await useAPI.del(API_ENDPOINTS.DELETE_MESSAGE(messageId));
          
          // Optimistic UI Update
          setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
          toast.success("Message deleted");
        } catch (err) {
          toast.error("Could not delete message");
          console.error("Delete error:", err);
        }
      }
    });
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen w-full flow-root md:py-8 bg-gradient-to-t from-indigo-400/30 via-fuchsia-800/60 to-blue-800/50 animate-gradient">
      <div className="w-[95%] rounded-2xl max-w-4xl mx-auto h-[90vh] flex flex-col bg-blue-800 md:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
        
        {/* Header Section */}
        <div className="p-5 bg-cyan-800/10 border-b flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500">
              ←
            </button>
            <div>
                <h2 className="font-bold text-gray-900 text-lg text-white">
                  {userRole === ROLES.EMPLOYER ? 'Applicant Chat' : 'Employer Chat'}
                </h2>
              <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${currentStatus === APP_STATUSES.ACCEPTED ? 'bg-green-500 animate-pulse' : 'bg-blue-400'}`}></span>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-gray-200">{currentStatus || 'Pending'}</span>
              </div>
            </div>
          </div>

          {userRole === ROLES.EMPLOYER && (
            <div className="flex gap-2">
              {currentStatus !== APP_STATUSES.ACCEPTED && currentStatus !== APP_STATUSES.REJECTED ? (
                <>
                  <button onClick={() => handleStatusChange(APP_STATUSES.ACCEPTED)} className="bg-green-600 text-white text-xs px-5 py-2.5 rounded-2xl font-bold hover:bg-green-700 transition">Hire Applicant</button>
                  <button onClick={() => handleStatusChange(APP_STATUSES.REJECTED)} className="bg-red-500 text-zinc-100 text-xs px-5 py-2.5 rounded-2xl font-bold hover:bg-red-800/60 transition">Reject</button>
                </>
              ) : (
                <div className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border-2 ${currentStatus === APP_STATUSES.ACCEPTED ? 'border-green-500 text-green-500 bg-green-500/10' : 'border-red-500 text-red-500 bg-red-500/10'}`}>
                  Decision: {currentStatus}
                </div>
              )}
            </div>
          )}
        </div>

    {/* Messages Feed */}
<div className="flex-1 overflow-y-auto p-6 space-y-5 bg-sky-900 bg-cover bg-[length:400px] bg-repeat" style={{ backgroundImage: `url('/images/google-messages-hero.jpg')`, backgroundAttachment: 'local' }}>
  {messages.map((msg, index) => (
    <div key={msg.id || index} className={`flex ${msg.is_me ? "justify-end" : "justify-start"}`}>
      
      {/* RESTORED YOUR ORIGINAL CLASSES: shadow-blue-100/10, border-gray-100, etc. */}
      <div className={`group relative max-w-[80%] px-5 py-3.5 shadow-sm transition-all ${msg.is_me ? "bg-blue-600 text-white rounded-3xl rounded-tr-none shadow-blue-100/10" : "bg-white text-gray-800 border border-gray-100 rounded-3xl rounded-tl-none shadow-sm"}`}>
        
        {/* DELETE BUTTON - Placed absolutely so it doesn't break your bubble shape */}
        {msg.is_me && (
          <button 
            onClick={() => handleDeleteMessage(msg.id)}
            className="absolute -left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/80 hover:bg-red-600 text-white p-1.5 rounded-full backdrop-blur-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
          </button>
        )}

        {!msg.is_me && <span className="block text-[10px] font-bold text-blue-500 mb-1 uppercase tracking-tighter">{msg.sender_name}</span>}
        
        <p className="text-[15px] leading-relaxed font-medium">{msg.content}</p>
        
        <div className={`text-[10px] mt-1.5 flex justify-end font-semibold opacity-70 ${msg.is_me ? "text-blue-100" : "text-gray-400"}`}>
          {msg.time}
        </div>
      </div>
    </div>
  ))}
  <div ref={scrollRef} />
</div>
        {/* Input Form */}
        <div className="p-5 bg-cyan-800 border-t border-gray-100">
          <form onSubmit={handleSend} className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-gray-50 p-4 rounded-2xl outline-none border border-transparent focus:border-blue-500 focus:bg-white transition-all text-[15px] placeholder:text-gray-400"
            />
            <button type="submit" className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition border border-white active:scale-95">Send</button>
          </form>
        </div>
      </div>
    </div>
  );
}