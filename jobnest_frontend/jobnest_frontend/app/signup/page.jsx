"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import API from "../../lib/api";
import Loader from "../components/Loader";

export default function SignupPage() {
  const router = useRouter();

  // Form state
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // 🔹 New Field
  const [showPassword, setShowPassword] = useState(false);   // 🔹 Toggle state
  const [role, setRole] = useState("job_seeker"); 
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setMessage("");

    // 🔹 Password Confirmation Check
    if (password !== confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      const signupRes = await API.post("/signup/", {
        username: username.trim(),
        full_name: fullName.trim(),
        email: email.trim(),
        password,
        role,
      });

      if (signupRes.status !== 201 && signupRes.status !== 200) {
        throw new Error("Signup failed");
      }

      const loginRes = await API.post("/token/", {
        username: username.trim(),
        password,
      });

      const { access, refresh } = loginRes.data;
      localStorage.setItem("access", access); 
      localStorage.setItem("refresh", refresh);
      localStorage.setItem("role", role);
      localStorage.setItem("full_name", fullName.trim()); 
      localStorage.setItem("username", username.trim());
      localStorage.setItem("email", email.trim());

      // Redirect logic
      if (role === "employer") {
        router.push("/");
      } else {
        router.push("/joblist");
      }
      
      // Force a refresh to update Header state
      setTimeout(() => window.location.reload(), 100);

    } catch (err) {
      console.log("Signup/Login error:", err.response?.data);
      const data = err.response?.data;
      if (data?.username) setMessage(data.username[0]);
      else if (data?.email) setMessage(data.email[0]);
      else if (data?.password) setMessage(data.password[0]);
      else setMessage("Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-white via-blue-100 to-blue-300 animate-gradient">
      <h1 className="text-3xl font-bold mb-6 text-center">Sign Up</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-full max-w-sm"
      >

        <input
  type="text"
  placeholder="Full Name (e.g. Miles Morales)"
  value={fullName}
  onChange={(e) => setFullName(e.target.value)}
  className="border p-2 w-full mb-4 rounded outline-none focus:ring-2 focus:ring-blue-200"
  required
/>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 w-full mb-4 rounded outline-none focus:ring-2 focus:ring-blue-200"
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full mb-4 rounded outline-none focus:ring-2 focus:ring-blue-200"
          required
        />

        {/* 🔹 Password Field with "Eye" Toggle */}
        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 w-full rounded outline-none focus:ring-2 focus:ring-blue-200"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-xs font-bold text-gray-400 hover:text-blue-500"
          >
            {showPassword ? "HIDE" : "SHOW"}
          </button>
        </div>

        {/* 🔹 Confirm Password Field */}
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="border p-2 w-full mb-4 rounded outline-none focus:ring-2 focus:ring-blue-200"
          required
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border p-2 w-full mb-4 rounded bg-white"
          required
        >
          <option value="job_seeker">Job Seeker</option>
          <option value="employer">Employer</option>
        </select>

        <button
          type="submit"
          className="bg-teal-500 text-white py-2 px-4 rounded w-full font-bold hover:bg-teal-600 transition"
          disabled={loading}
        >
          Sign Up
        </button>
      </form>

      {message && (
        <p className="mt-4 text-center text-red-600 font-medium">{message}</p>
      )}
    </div>
  );
}