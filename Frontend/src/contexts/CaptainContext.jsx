import { createContext, useContext, useState, useMemo } from "react";

export const captainDataContext = createContext();

// MEDIUM-014: Safe localStorage parsing with error handling
const getCaptainData = () => {
  try {
    const data = localStorage.getItem("userData");
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error("Error parsing userData from localStorage:", error);
    localStorage.removeItem("userData");
    return null;
  }
};

function CaptainContext({ children }) {
  const userData = getCaptainData();

  const [captain, setCaptain] = useState(
    userData?.type === "captain"
      ? userData.data
      : {
          email: "",
          fullname: {
            firstname: "",
            lastname: "",
          },
          vehicle: {
            color: "",
            number: "",
            capacity: 0,
            type: "",
          },
          rides: [],
          status: "inactive",
        }
  );

  // PERF-010: Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({ captain, setCaptain }), [captain]);

  return (
    <captainDataContext.Provider value={value}>
      {children}
    </captainDataContext.Provider>
  );
}

export const useCaptain = () => {
  const context = useContext(captainDataContext);

  // CRITICAL-FIX: Null guard to prevent crash if hook used outside provider
  if (!context) {
    throw new Error("useCaptain must be used within a CaptainContext provider");
  }

  return { captain: context.captain, setCaptain: context.setCaptain };
};

export default CaptainContext;
