import { createContext, useContext, useState, useMemo } from "react";

export const userDataContext = createContext();

// MEDIUM-014: Safe localStorage parsing with error handling
const getUserData = () => {
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

const UserContext = ({ children }) => {
  const userData = getUserData();

  const [user, setUser] = useState(
    userData?.type === "user"
      ? userData.data
      : {
          email: "",
          fullname: {
            firstname: "",
            lastname: "",
          },
        }
  );

  // PERF-010: Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({ user, setUser }), [user]);

  return (
    <userDataContext.Provider value={value}>
      {children}
    </userDataContext.Provider>
  );
};

export const useUser = () => {
  const { user, setUser } = useContext(userDataContext);
  return { user, setUser };
};

export default UserContext;
