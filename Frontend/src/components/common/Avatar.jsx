import { User } from "lucide-react";
import { cn } from "../../utils/cn";

const avatarSizes = {
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base",
  lg: "w-12 h-12 text-lg",
  xl: "w-16 h-16 text-xl",
};

function Avatar({ src, alt, size = "md", className, fallbackText }) {
  const sizeClass = avatarSizes[size];

  if (src) {
    return (
      <img
        src={src}
        alt={alt || "Avatar"}
        className={cn(
          "rounded-full object-cover",
          sizeClass,
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full bg-gray-200 flex items-center justify-center text-gray-600",
        sizeClass,
        className
      )}
    >
      {fallbackText ? (
        <span className="font-medium">{fallbackText.charAt(0).toUpperCase()}</span>
      ) : (
        <User size={size === "sm" ? 16 : size === "md" ? 20 : size === "lg" ? 24 : 32} />
      )}
    </div>
  );
}

export default Avatar;
