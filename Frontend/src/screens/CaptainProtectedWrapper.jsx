import axios from "axios";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (!token) {
      navigate("/captain/login");
      return;
    }

    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.error("Captain profile fetch timeout - redirecting to login");
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      navigate("/captain/login");
    }, 10000); // 10 second timeout

    axios
      .get(`${import.meta.env.VITE_SERVER_URL}/captain/profile`, {
        headers: {
          token: token,
        },
        withCredentials: true, // CRITICAL-006: Send cookies with request
        timeout: 8000, // 8 second request timeout
      })
      .then((response) => {
        clearTimeout(timeoutId); // Clear timeout on success
        if (response.status === 200) {
          const captainData = response.data.captain;
          setCaptain(captainData);
          localStorage.setItem(
            "userData",
            JSON.stringify({ type: "captain", data: captainData })
          );
          setIsVerified(captainData.emailVerified);
          setIsProfileComplete(captainData.isProfileComplete !== false);
        }
      })
      .catch((err) => {
        clearTimeout(timeoutId); // Clear timeout on error
        console.error("Error fetching captain profile:", err.message || err);
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        navigate("/captain/login");
      })
      .finally(() => {
        setLoading(false);
      });

    // Cleanup
    return () => clearTimeout(timeoutId);
  }, [token, navigate, setCaptain]);

  if (loading) return <Loading />;

  if (isVerified === false) {
    return <VerifyEmail user={captain} role={"captain"} />;
  }

  // Redirect to complete profile if OAuth captain hasn't completed profile
  if (isProfileComplete === false) {
    navigate("/complete-profile");
    return <Loading />;
  }

  return <>{children}</>;
}

export default CaptainProtectedWrapper;