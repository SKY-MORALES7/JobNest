"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import useAPI from "../../lib/useAPI";
import { API_ENDPOINTS, STORAGE_KEYS, ROLES } from "../../lib/constants";
import toast from "react-hot-toast";
import Loader from "./Loader";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false); // New state for dropdown
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const pathname = usePathname();
  const router = useRouter();
  const dropdownRef = useRef(null); // To detect clicks outside

  // 1. SYNC AUTH STATE
  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS);
    const rawRole = localStorage.getItem(STORAGE_KEYS.ROLE);
    const storedRole = rawRole ? rawRole.toLowerCase().trim() : null;

    setIsLoggedIn(!!token);
    setRole(storedRole);
    setIsInitialLoad(false);
  }, [pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDashboardOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  //
// 2. BACKGROUND MAIL CHECK
  useEffect(() => {
    if (!isLoggedIn || isInitialLoad) return;

    const checkMail = async () => {
      try {
        const data = await useAPI.get(API_ENDPOINTS.UNREAD_COUNT);
        const { unread_count, latest_sender } = data;

        if (unread_count > unreadCount && !pathname.includes("/chat/")) {
          toast.success(`New message from ${latest_sender || "someone"}`, {
            icon: "📩",
          });
        }

        setUnreadCount(unread_count);
      } catch (err) {
        if (err.response?.status === 401) {
          console.log("Header detected expired token. Logging out...");
          localStorage.removeItem(STORAGE_KEYS.ACCESS);
          localStorage.removeItem(STORAGE_KEYS.REFRESH);
          localStorage.removeItem(STORAGE_KEYS.ROLE);
          setIsLoggedIn(false);
          setRole(null);
          router.push("/login");
        } else if (err.message !== "Network Error") {
          console.error("Mail sync error:", err.message);
        }
      }
    };

    checkMail();
    const interval = setInterval(checkMail, 10000);
    return () => clearInterval(interval);
    
    // Add unreadCount to dependency array so the checkMail 
    // function has access to the most recent value.
  }, [isLoggedIn, pathname, isInitialLoad, unreadCount]);

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS);
    localStorage.removeItem(STORAGE_KEYS.REFRESH);
    localStorage.removeItem(STORAGE_KEYS.ROLE);
    localStorage.removeItem(STORAGE_KEYS.USERNAME);
    localStorage.removeItem(STORAGE_KEYS.FULL_NAME);
    localStorage.removeItem(STORAGE_KEYS.EMAIL);
    setIsLoggedIn(false);
    setRole(null);
    router.push("/login");
  };

  if (isInitialLoad)
    return <Loader />;

  return (
    <header className="bg-sky-800 text-white p-4 shadow-lg sticky top-0 z-50">
      <nav className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <Image
            src="/jobnest_logo.svg"
            alt=""
            aria-hidden="true"
            width={40}
            height={40}
            priority
            className="h-9 w-9 object-contain brightness-0 invert"
          />
          <span>JobNest</span>
        </Link>

        <button
          className="md:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMenuOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        <div
          className={`${isMenuOpen ? "flex" : "hidden"} absolute md:static top-16 left-0 w-full md:w-auto bg-indigo-500 md:bg-transparent px-8 md:px-0 flex-col md:flex-row items-center gap-6 p-6 md:p-0 md:flex transition-all`}
        >
          <Link
            href="/"
            onClick={() => setIsMenuOpen(false)}
            className="hover:underline"
          >
            Home
          </Link>

          {/* 🔹 SMART DASHBOARD DROPDOWN */}
          {isLoggedIn && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDashboardOpen(!isDashboardOpen)}
                className="text-teal-300 font-bold flex items-center gap-1 hover:text-white transition focus:outline-none"
              >
                Dashboard ▾
              </button>

              {isDashboardOpen && (
                <div className="absolute left-0 md:right-0 md:left-auto mt-2  w-48 bg-gradient-to-r from-blue-500 via-white/70 to-sky-700 bg-[length:200%_auto] animate-gradient-slow text-slate-800 rounded-lg shadow-xl py-2 z-50 border border-gray-200 animate-in fade-in zoom-in duration-150">
                  {role === ROLES.EMPLOYER ? (
                    <>
                      <Link
                        href="/posted-jobs"
                        onClick={() => setIsDashboardOpen(false)}
                        className="block px-4 py-2 hover:bg-indigo-50 transition"
                      >
                        Posted Jobs
                      </Link>
                      <Link
                        href="/messages"
                        onClick={() => setIsDashboardOpen(false)}
                        className="block px-4 py-2 hover:bg-indigo-50 transition flex justify-between"
                      >
                        Messages{" "}
                        {unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/applications"
                        onClick={() => setIsDashboardOpen(false)}
                        className="block px-4 py-2 hover:bg-indigo-50 transition"
                      >
                        Jobs Applied
                      </Link>
                      {/* <Link
                        href="/"
                        onClick={() => setIsDashboardOpen(false)}
                        className="block px-4 py-2 hover:bg-indigo-50 transition"
                      >
                        Application Status
                      </Link> */}
                      <Link
                        href="/messages"
                        onClick={() => setIsDashboardOpen(false)}
                        className="block px-4 py-2 hover:bg-indigo-50 transition flex justify-between"
                      >
                        Messages{" "}
                        {unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </Link>
                    </>
                  )}
                  <hr className="my-1 border-gray-100" />
                  <Link
                    href="/profile"
                    onClick={() => setIsDashboardOpen(false)}
                    className="block px-4 py-2 text-indigo-600 font-bold hover:bg-indigo-50 transition"
                  >
                    👤 Update Profile
                  </Link>
                </div>
              )}
            </div>
          )}

          {isLoggedIn && role === ROLES.EMPLOYER && (
            <Link
              href="/post-job"
              onClick={() => setIsMenuOpen(false)}
              className="hover:underline"
            >
              Post Job
            </Link>
          )}

          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600 transition w-full md:w-auto"
            >
              Logout
            </button>
          ) : (
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="hover:underline"
              >
                Login
              </Link>
              <Link
                href="/signup"
                onClick={() => setIsMenuOpen(false)}
                className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-bold"
              >
                Signup
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
    // backdrop-blur-sm: Blurs the image behind the bubble slightly so the text is super easy
  );
}
