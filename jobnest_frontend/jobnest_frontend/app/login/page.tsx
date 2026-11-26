"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import API from "../../lib/api";
import toast from "react-hot-toast"
import Loader from "../components/Loader";
export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (token) {
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);
const handleSubmit = async (e) => {
  e.preventDefault();

  // 🔹 Create the request promise
  const loginPromise = API.post("/api/token/", { username, password });

  // 🔹 Link the promise to react-hot-toast
  toast.promise(loginPromise, {
    loading: "Verifying...",
    success: (res) => {
      localStorage.clear();
      // Logic for successful login
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("username", res.data.username);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("full_name", res.data.full_name);

  
if (res.data.email) {
  localStorage.setItem("email", res.data.email);
} else {
  // If your API doesn't return email on login yet, 
  // at least set it to an empty string so it's not 'null'
  localStorage.setItem("email", ""); 
}
      
      // Delay redirect slightly so user can see the success toast
     setTimeout(() => {
  router.push("/");
}, 800);
      
      return `Welcome back, ${res.data.username}!`;
    },
    error: (err) => {
      // If profile is missing or creds are wrong, this shows immediately
      return err.response?.data?.detail || "Invalid username or password";
    }, },
 {
    // 🔹 THIS SECTION STYLES THE TOAST 🔹
    style: {
      borderRadius: '16px',
      background: '#ffffff', // Slate-900
      color: '#020f1d',      // Slate-50 text
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
    },
    success: {
      duration: 3000,
      iconTheme: {
        primary: '#33ee22b6', 
        secondary: '#0f172aa4',
      },
   
    },
    error: {
      duration: 4000,
      iconTheme: {
        primary: '#f43f5dbe', // Rose-500 (Red)
        secondary: '#ffffffb6',
      },
      className: 'shadow-[0_0_15px_rgba(244,63,94,0.3)]',
    },
  }
);
}


  if (loading) return <Loader />;

  return (
    <main className="relative min-h-screen w-full overflow-hidden">
    <div 
  className="absolute inset-0 z-0 animate-kenburns bg-cover bg-center"
  style={{ backgroundImage: `url('/images/spiderverse-concept-art-05.jpg')` }}
/>
      <div 
    className=" relative z-10 flex flex-col items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat">
      <h1 className="text-3xl font-bold mb-6 text-white">Login</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-indigo-800/50 p-6 rounded shadow-md w-full max-w-sm"
      >
        <div className="mb-4">
          <label className="block text-white text-sm font-bold mb-2">Username</label>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-teal-200 text-zinc-50"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-white text-sm font-bold mb-2">Password</label>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-teal-500 text-zinc-50"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-teal-500 text-white py-2 px-4 rounded w-full font-bold hover:bg-teal-600 transition"
        >
          Login
        </button>

         <p className="mt-4 text-center text-sm text-white">
            Don't have an account? <span onClick={() => router.push('/signup')} className="text-teal-600 font-bold cursor-pointer relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:transition-all after:delay-300 after:duration-300 hover:after:w-full after:bg-sky-600">Sign up</span>
          </p>

      </form>
    </div>
    </main>
  );
}