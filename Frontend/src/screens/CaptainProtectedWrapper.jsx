import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCaptain } from "../contexts/CaptainContext";
import VerifyEmail from "../components/VerifyEmail";
import Loading from "./Loading";

function CaptainProtectedWrapper({ children }) {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const { captain, setCaptain } = useCaptain();

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
      setShouldRedirect("/captain/login");
      setLoading(false);
      return;
    }

    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (mountedRef.current) {
        console.error("Captain profile fetch timeout - redirecting to login");
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        setShouldRedirect("/captain/login");
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    setLoading(true);
    axios
      .get(`${import.meta.env.VITE_SERVER_URL}/captain/profile`, {
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
          const captainData = response.data.captain;
          setCaptain(captainData);
          localStorage.setItem(
            "userData",
            JSON.stringify({ type: "captain", data: captainData })
          );
          setIsVerified(captainData.emailVerified);

          // CRITICAL-FIX: Check profile completion and set redirect state
          if (captainData.isProfileComplete === false) {
            setShouldRedirect("/complete-profile");
          } else {
            setIsProfileComplete(true);
          }
        }
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        if (!mountedRef.current) return;

        console.error("Error fetching captain profile:", err.message || err);
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        setShouldRedirect("/captain/login");
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
  }, [token, setCaptain]);

  // Show loading while redirecting or fetching
  if (loading || shouldRedirect) return <Loading />;

  if (isVerified === false) {
    return <VerifyEmail user={captain} role={"captain"} />;
  }

  return <>{children}</>;
}

export default CaptainProtectedWrapper;
