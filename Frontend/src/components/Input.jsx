/**
 * Swiss Minimalist Premium Input Component
 * 
 * Design Philosophy:
 * - Glassmorphism: bg-white/10 with backdrop-blur
 * - NO DEFAULT BORDERS: Clean minimal design
 * - FOCUS STATE: ring-2 ring-emerald-500 (Swiss brand color)
 * - HEIGHT: h-14 (56px) for massive touch targets
 * - Smooth transitions with cubic-bezier
 * - Dark mode native support
 * 
 * @param {string} label - Input label
 * @param {string} type - Input type
 * @param {string} name - Input name
 * @param {string} placeholder - Placeholder text
 * @param {string} defaultValue - Default value
 * @param {Function} register - React Hook Form register
 * @param {Object} error - Error object from validation
 * @param {Array} options - Options for select
 * @param {boolean} disabled - Disabled state
 * @param {string} className - Additional classes
 */
function Input({ 
  label, 
  type, 
  name, 
  placeholder, 
  defaultValue, 
  register, 
  error, 
  options, 
  disabled,
  className
}) {
  // Base input classes - Swiss Minimalist Premium
  const inputBaseClasses = `
    w-full h-14
    bg-white/10 dark:bg-white/10
    backdrop-blur-sm
    px-5 py-4
    rounded-2xl
    border-0 outline-none
    text-base text-gray-900 dark:text-white
    placeholder:text-gray-400 dark:placeholder:text-gray-500
    transition-all duration-200 ease-out
    focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400
    focus:bg-white/20 dark:focus:bg-white/20
    hover:bg-white/15 dark:hover:bg-white/15
    ${disabled ? "cursor-not-allowed select-none opacity-60 bg-gray-100 dark:bg-white/5" : ""}
    ${error ? "ring-2 ring-red-500 dark:ring-red-400 focus:ring-red-500 dark:focus:ring-red-400 bg-red-50/50 dark:bg-red-900/20" : ""}
    ${className || ""}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className="my-3">
      {label && (
        <label 
          htmlFor={name} 
          className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
      )}
      
      {type === "select" ? (
        <select
          id={name}
          {...register(name)}
          defaultValue={defaultValue}
          disabled={disabled}
          className={inputBaseClasses}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${name}-error` : undefined}
        >
          {options?.map((option) => (
            <option 
              key={option} 
              value={option.toLowerCase()} 
              className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            >
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={name}
          {...register(name)}
          type={type || "text"}
          placeholder={placeholder || label}
          disabled={disabled}
          defaultValue={defaultValue}
          className={inputBaseClasses}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${name}-error` : undefined}
        />
      )}
      
      {error && (
        <p 
          id={`${name}-error`} 
          className="mt-2 text-sm font-medium text-red-500 dark:text-red-400 flex items-center gap-1"
          role="alert"
        >
          <svg 
            className="w-4 h-4 flex-shrink-0" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path 
              fillRule="evenodd" 
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
              clipRule="evenodd" 
            />
          </svg>
          <span>{error.message}</span>
        </p>
      )}
    </div>
  );
}

export default Input;