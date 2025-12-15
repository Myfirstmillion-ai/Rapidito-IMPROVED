import { Home, Map, Activity, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "../../utils/cn";

/**
 * Bottom Navigation Bar for Mobile
 * 
 * Features:
 * - Visible only on mobile (< 768px)
 * - 4-5 items with icons
 * - Active item indicator
 * - Fixed bottom positioning
 * - Touch targets 44x44px minimum
 * - High z-index
 * 
 * @param {Object} props
 * @param {string} props.userType - 'user' or 'captain'
 */
function BottomNav({ userType = "user" }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Define navigation items based on user type
  const userItems = [
    {
      id: "home",
      label: "Inicio",
      icon: Home,
      path: "/user/home",
    },
    {
      id: "rides",
      label: "Viajes",
      icon: Map,
      path: "/user/rides",
    },
    {
      id: "activity",
      label: "Actividad",
      icon: Activity,
      path: "/user/history",
    },
    {
      id: "account",
      label: "Cuenta",
      icon: User,
      path: "/user/profile",
    },
  ];

  const captainItems = [
    {
      id: "home",
      label: "Inicio",
      icon: Home,
      path: "/captain/home",
    },
    {
      id: "rides",
      label: "Viajes",
      icon: Map,
      path: "/captain/rides",
    },
    {
      id: "earnings",
      label: "Ganancias",
      icon: Activity,
      path: "/captain/earnings",
    },
    {
      id: "account",
      label: "Cuenta",
      icon: User,
      path: "/captain/profile",
    },
  ];

  const items = userType === "captain" ? captainItems : userItems;

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-uber-gray-200 z-50">
      <div className="flex items-center justify-around px-2 py-2 pb-safe">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-all duration-200",
                "min-w-[44px] min-h-[44px] px-3 py-2 rounded-uber-md", // 44x44px touch target
                active 
                  ? "text-uber-black" 
                  : "text-uber-gray-500 hover:text-uber-gray-700"
              )}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
            >
              <Icon 
                size={24} 
                className={cn(
                  "transition-all duration-200",
                  active && "scale-110"
                )}
                strokeWidth={active ? 2.5 : 2}
              />
              <span 
                className={cn(
                  "text-xs font-medium transition-all duration-200",
                  active && "font-bold"
                )}
              >
                {item.label}
              </span>
              {/* Active indicator */}
              {active && (
                <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-uber-black rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
