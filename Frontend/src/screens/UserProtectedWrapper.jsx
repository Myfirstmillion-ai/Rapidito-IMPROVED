import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import VerifyEmail from "../components/VerifyEmail";
import Loading from "./Loading";

function UserProtectedWrapper({ children }) {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const { user, setUser } = useUser();

  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(null);
  const [isProfileComplete, setIsProfileComplete] = useState(null);
  // CRITICAL-FIX: Track redirect needs to avoid navigate() during render
  const [shouldRedirect, setShouldRedirect] = useState(null);
  const mountedRef = useRef(true);

  // CRITICAL-FIX: Handle redirects in useEffect, not during render
  useEffect(() => {
    if (shouldRedirect) {
      navigate(shouldRedirect, { replace: true });
    }
  }, [shouldRedirect, navigate]);

  useEffect(() => {
    mountedRef.current = true;

    if (!token) {
      setShouldRedirect("/login");
      setLoading(false);
      return;
    }

    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (mountedRef.current) {
        console.error("Profile fetch timeout - redirecting to login");
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        setShouldRedirect("/login");
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    setLoading(true);
    axios
      .get(`${import.meta.env.VITE_SERVER_URL}/user/profile`, {
        headers: {
          token: token,
        },
        withCredentials: true,
        timeout: 8000,
      })
      .then((response) => {
        clearTimeout(timeoutId);
        if (!mountedRef.current) return;

        if (response.status === 200) {
          const userData = response.data.user;
          setUser(userData);
          localStorage.setItem(
            "userData",
            JSON.stringify({ type: "user", data: userData })
          );
          setIsVerified(userData.emailVerified);

          // CRITICAL-FIX: Check profile completion and set redirect state
          if (userData.isProfileComplete === false) {
            setShouldRedirect("/complete-profile");
          } else {
            setIsProfileComplete(true);
          }
        }
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        if (!mountedRef.current) return;

        console.error("Profile fetch error:", error.message);
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        setShouldRedirect("/login");
      })
      .finally(() => {
        if (mountedRef.current) {
          setLoading(false);
        }
      });

    // Cleanup
    return () => {
      mountedRef.current = false;
      clearTimeout(timeoutId);
    };
  }, [token, setUser]);

  // Show loading while redirecting or fetching
  if (loading || shouldRedirect) return <Loading />;

  if (isVerified === false) {
    return <VerifyEmail user={user} role={"user"} />;
  }

  return <>{children}</>;
}


export default UserProtectedWrapper;
