import axios from "axios";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.error("Profile fetch timeout - redirecting to login");
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      navigate("/login");
    }, 10000); // 10 second timeout

    setLoading(true);
    axios
      .get(`${import.meta.env.VITE_SERVER_URL}/user/profile`, {
        headers: {
          token: token,
        },
        withCredentials: true, // CRITICAL-006: Send cookies with request
        timeout: 8000, // 8 second request timeout
      })
      .then((response) => {
        clearTimeout(timeoutId); // Clear timeout on success
        if (response.status === 200) {
          const user = response.data.user;
          setUser(user);
          localStorage.setItem(
            "userData",
            JSON.stringify({ type: "user", data: user })
          );
          setIsVerified(user.emailVerified);
          setIsProfileComplete(user.isProfileComplete !== false);
        }
      })
      .catch((error) => {
        clearTimeout(timeoutId); // Clear timeout on error
        console.error("Profile fetch error:", error.message);
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        navigate("/login");
      })
      .finally(() => {
        setLoading(false);
      });

    // Cleanup
    return () => clearTimeout(timeoutId);
  }, [token]);

  if (loading) return <Loading />;

  if (isVerified === false) {
    return <VerifyEmail user={user} role={"user"} />;
  }

  // Redirect to complete profile if OAuth user hasn't completed profile
  if (isProfileComplete === false) {
    navigate("/complete-profile");
    return <Loading />;
  }

  return <>{children}</>;
}


export default UserProtectedWrapper;
