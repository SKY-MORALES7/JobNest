// app/layout.tsx
import './globals.css';
import Header from "./components/Header";
import { Toaster } from 'react-hot-toast'; 
import AuthGuard from "./components/AuthGuard"
import StyledComponentsRegistry from "./components/StyledComponentsRegistry";

export const metadata = {
  title: "JobNest",
  icons: {
    icon: "/jobnest_logo.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <StyledComponentsRegistry>
        <Toaster position="top-right" reverseOrder={false} /> 
        <AuthGuard>
        <Header/>  {/* <-- This will show on every page */}
        {children}
        </AuthGuard>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}



