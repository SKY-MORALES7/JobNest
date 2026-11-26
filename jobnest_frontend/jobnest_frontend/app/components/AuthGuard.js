"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Loader from "./Loader";

export default function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access");
    const publicPaths = ["/", "/login", "/signup", "/joblist"];
    const protectedPaths = [
      /^\/application\/[^/]+$/,
      /^\/applications$/,
      /^\/apply\/[^/]+$/,
      /^\/chat\/[^/]+$/,
      /^\/edit_job\/[^/]+$/,
      /^\/messages$/,
      /^\/post-job$/,
      /^\/posted-jobs$/,
      /^\/profile$/,
    ];
    const normalizedPath = pathname.replace(/\/+$/, "") || "/";
    const isProtectedPath = protectedPaths.some((path) =>
      path.test(normalizedPath),
    );

    if (!token && isProtectedPath && !publicPaths.includes(normalizedPath)) {
      // If we are redirecting, we NEVER set authorized to true
      setAuthorized(false);
      router.replace("/login");
    } else if (
      token &&
      (normalizedPath === "/login" || normalizedPath === "/signup")
    ) {
      setAuthorized(false);
      router.replace("/");
    } else {
      // ONLY set to true if they are allowed to be here
      setAuthorized(true);
    }
  }, [pathname, router]);

  // 🔹 THIS PREVENTS THE FLASH ON ALL PAGES
  // If authorized is false, the code below (the actual page) is never reached.
  if (!authorized) {
    return <Loader />;
  }

  return <>{children}</>;
}