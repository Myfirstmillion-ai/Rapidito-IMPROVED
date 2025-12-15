import { cn } from "../../utils/cn";

function Skeleton({ className, variant = "default" }) {
  const baseClasses = "animate-pulse bg-gray-200 rounded";
  
  const variants = {
    default: "h-4 w-full",
    text: "h-4 w-full",
    title: "h-6 w-3/4",
    avatar: "h-12 w-12 rounded-full",
    card: "h-24 w-full rounded-lg",
  };

  return <div className={cn(baseClasses, variants[variant], className)} />;
}

export default Skeleton;
