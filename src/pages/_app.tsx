import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import "../styles/globals.css";
import { AppProps } from "next/app";
import axios from "axios";
import styles from "./AnnouncementBar.module.css";
type ExtendedAppProps = AppProps & {
  Component: AppProps["Component"] & {
    auth?: boolean;
  };
};

function App({ Component, pageProps }: ExtendedAppProps) {
  return (
    <>
      {Component.auth ? (
        <AuthGuard>
          <Component {...pageProps} />
        </AuthGuard>
      ) : (
        <Component {...pageProps} />
      )}
    </>
  );
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      console.log("No user found, redirecting to /login"); // Debug log
      router.push("/login");
    } else {
      const parsedUser = JSON.parse(user);
      if (parsedUser.role !== "admin") {
        console.log("User is not an admin, redirecting to /login"); // Debug log
        router.push("/login");
      } else {
        console.log("User is authenticated and is an admin"); // Debug log
        setIsAuthenticated(true);
      }
    }
  }, [router]);

  // Render children only if the user is authenticated and has the admin role
  if (!isAuthenticated) {
    return null; // Don't render anything until the redirect happens
  }

  return <>{children}</>;
}

export default App;