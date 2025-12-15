import { cn } from "../../utils/cn";

/**
 * Message Badge Component
 * Shows a notification badge with unread message count
 * 
 * @param {Object} props
 * @param {number} props.count - Number of unread messages
 * @param {string} props.className - Additional CSS classes
 */
function MessageBadge({ count, className }) {
  if (!count || count === 0) return null;

  const displayCount = count > 99 ? "99+" : count;

  return (
    <div
      className={cn(
        "absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full",
        "bg-uber-red text-white text-xs font-bold",
        "flex items-center justify-center",
        "shadow-uber-md animate-pulse",
        className
      )}
    >
      {displayCount}
    </div>
  );
}

export default MessageBadge;
