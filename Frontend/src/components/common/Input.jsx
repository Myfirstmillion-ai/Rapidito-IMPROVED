import { useState, useRef, useEffect } from "react";
import { cn } from "../../utils/cn";
import { Check, AlertCircle, X } from "lucide-react";
import { colors, borderRadius, shadows, animation } from "../../styles/designSystem";

/**
 * iOS Deluxe Input Component
 * 
 * Features:
 * - Floating label animation when focused
 * - Glassmorphism background and subtle borders
 * - Clear button (X) when input has a value
 * - Premium iOS-style focus state with accent glow
 * - Validation states with custom icons (error/success)
 * - Optional icon support (left)
 * - Error message display with premium styling
 * - Spring physics animations for label movement
 * 
 * @param {Object} props
 * @param {string} props.label - Input label
 * @param {string} props.type - Input type
 * @param {string} props.name - Input name
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.defaultValue - Default value
 * @param {Function} props.register - React Hook Form register
 * @param {Object} props.error - Error object from validation
 * @param {Array} props.options - Options for select
 * @param {boolean} props.disabled - Disabled state
 * @param {Component} props.icon - Icon component (lucide-react)
 * @param {boolean} props.floatingLabel - Use floating label (default: true)
 * @param {boolean} props.success - Success state
 * @param {boolean} props.clearable - Show clear button when input has value
 * @param {Function} props.onChange - Custom onChange handler
 * @param {Function} props.onClear - Function to call when clear button is clicked
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
  icon: Icon,
  floatingLabel = true,
  success = false,
  clearable = true,
  onChange,
  onClear
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!defaultValue);
  const [inputValue, setInputValue] = useState(defaultValue || "");
  const inputRef = useRef(null);

  // Handle outside registration if needed
  useEffect(() => {
    if (defaultValue !== undefined && defaultValue !== inputValue) {
      setInputValue(defaultValue);
      setHasValue(!!defaultValue);
    }
  }, [defaultValue]);

  // Base input classes with iOS Deluxe styling
  const inputClasses = cn(
    // Base styles
    "w-full outline-none text-[17px]",
    
    // Colors and background
    `bg-[${colors.card}] text-[${colors.textPrimary}]`,
    
    // Border and radius
    `border border-[${colors.border}] rounded-[${borderRadius.small}]`,
    
    // Padding based on floating label and icon
    floatingLabel ? "pt-6 pb-3 px-4" : "py-4 px-4",
    
    // Transition with premium spring physics
    "transition-all duration-300 ease-out",
    
    // Focus states
    `focus:border-[${colors.accent}] focus:ring-2 focus:ring-[${colors.accent}]/20`,
    
    // State-based styling
    disabled && "opacity-50 cursor-not-allowed",
    error && `border-[${colors.error}] ring-2 ring-[${colors.error}]/20 focus:border-[${colors.error}] focus:ring-[${colors.error}]/20`,
    success && !error && `border-[${colors.success}] ring-2 ring-[${colors.success}]/20 focus:border-[${colors.success}] focus:ring-[${colors.success}]/20`,
    
    // Adjust padding for icons
    Icon && "pl-12",
    (clearable && hasValue) && "pr-10"
  );

  // Premium floating label with iOS animation
  const labelClasses = cn(
    // Base label styling
    "font-medium transition-all pointer-events-none",
    
    // iOS smooth animations
    "duration-300 ease-out",
    
    // Position and state styling
    floatingLabel && "absolute left-4",
    
    // Label position and size based on state
    floatingLabel && (isFocused || hasValue) 
      ? `text-[13px] top-2 text-[${isFocused ? colors.accent : colors.textSecondary}]` 
      : `text-[17px] top-[50%] -translate-y-[50%] text-[${colors.textSecondary}]`,
      
    // Non-floating label styling
    !floatingLabel && `text-[${colors.textSecondary}] mb-2 block`
  );

  // Handle input changes with external callback support
  const handleChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setHasValue(value.length > 0);
    
    if (onChange) {
      onChange(e);
    }
  };
  
  // Handle clear button click
  const handleClear = () => {
    setInputValue("");
    setHasValue(false);
    
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus();
    }
    
    if (onClear) {
      onClear();
    }
  };

  if (type === "select") {
    return (
      <div className="my-3">
        {!floatingLabel && <label className={labelClasses}>{label}</label>}
        <div className="relative">
          {floatingLabel && <label className={labelClasses}>{label}</label>}
          <select
            {...register(name)}
            defaultValue={defaultValue}
            className={inputClasses}
            disabled={disabled}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={handleChange}
            ref={inputRef}
          >
            {options?.map((option, index) => (
              <option 
                key={index} 
                value={typeof option === 'object' ? option.value : option.toLowerCase()} 
                className="w-full bg-[#141414] text-white py-2"
              >
                {typeof option === 'object' ? option.label : option}
              </option>
            ))}
          </select>
          
          {/* Custom select arrow */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          {/* Validation icons */}
          {success && !error && (
            <div className="absolute right-10 top-1/2 -translate-y-1/2">
              <Check size={18} className={`text-[${colors.success}]`} />
            </div>
          )}
          {error && (
            <div className="absolute right-10 top-1/2 -translate-y-1/2">
              <AlertCircle size={18} className={`text-[${colors.error}]`} />
            </div>
          )}
        </div>
        
        {/* Error message with iOS styling */}
        {error && (
          <p className={`text-[13px] text-[${colors.error}] mt-2 ml-1 flex items-center gap-1.5`}>
            <AlertCircle size={12} />
            {error.message}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="my-3">
      {!floatingLabel && <label className={labelClasses}>{label}</label>}
      <div className="relative">
        {/* Left icon */}
        {Icon && (
          <div className={`absolute left-4 top-1/2 -translate-y-1/2 text-[${colors.textSecondary}]`}>
            <Icon size={18} strokeWidth={2} />
          </div>
        )}
        
        {/* Floating label */}
        {floatingLabel && <label className={labelClasses}>{label}</label>}
        
        {/* Input field */}
        <input
          {...(register ? register(name) : { name })}
          type={type || "text"}
          placeholder={floatingLabel ? "" : (placeholder || label)}
          className={inputClasses}
          disabled={disabled}
          value={register ? undefined : inputValue}
          defaultValue={register ? defaultValue : undefined}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={handleChange}
          ref={(e) => {
            inputRef.current = e;
            if (register && name) {
              // For React Hook Form compatibility
              const registerRef = register(name).ref;
              if (typeof registerRef === 'function') registerRef(e);
            }
          }}
        />
        
        {/* Clear button */}
        {clearable && hasValue && !disabled && (
          <button 
            type="button" 
            onClick={handleClear}
            className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full bg-[${colors.border}] hover:bg-white/20 transition-colors`}
          >
            <X size={14} className={`text-[${colors.textSecondary}]`} />
          </button>
        )}
        
        {/* Validation icons */}
        {success && !error && !hasValue && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Check size={18} className={`text-[${colors.success}]`} />
          </div>
        )}
        
        {error && !hasValue && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <AlertCircle size={18} className={`text-[${colors.error}]`} />
          </div>
        )}
      </div>
      
      {/* Error message with iOS styling */}
      {error && (
        <p className={`text-[13px] text-[${colors.error}] mt-2 ml-1 flex items-center gap-1.5`}>
          <AlertCircle size={12} />
          {error.message}
        </p>
      )}
    </div>
  );
}

export default Input;

