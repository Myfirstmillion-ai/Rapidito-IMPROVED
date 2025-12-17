import { useState, useRef, useEffect } from "react";
import { cn } from "../../utils/cn";
import { Check, AlertCircle, X } from "lucide-react";

/**
 * Premium Input Component - Uber-style Design
 *
 * Features:
 * - Clean, modern design
 * - Floating label animation
 * - Clear button when input has value
 * - Validation states with icons
 * - Optional left icon
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

  useEffect(() => {
    if (defaultValue !== undefined && defaultValue !== inputValue) {
      setInputValue(defaultValue);
      setHasValue(!!defaultValue);
    }
  }, [defaultValue]);

  // Inline styles for consistent rendering (fixes Tailwind dynamic class issue)
  const getInputStyle = () => ({
    width: '100%',
    outline: 'none',
    fontSize: '16px',
    fontWeight: '400',
    backgroundColor: '#F7F7F7',
    color: '#000000',
    border: error ? '2px solid #EF4444' : isFocused ? '2px solid #000000' : '2px solid transparent',
    borderRadius: '12px',
    padding: floatingLabel ? '24px 16px 8px 16px' : '16px',
    paddingLeft: Icon ? '48px' : '16px',
    paddingRight: (clearable && hasValue) ? '44px' : '16px',
    transition: 'all 0.2s ease',
    opacity: disabled ? 0.5 : 1,
    cursor: disabled ? 'not-allowed' : 'text',
  });

  const getLabelStyle = () => ({
    position: floatingLabel ? 'absolute' : 'relative',
    left: floatingLabel ? (Icon ? '48px' : '16px') : '0',
    top: floatingLabel ? ((isFocused || hasValue) ? '8px' : '50%') : '0',
    transform: floatingLabel && !(isFocused || hasValue) ? 'translateY(-50%)' : 'none',
    fontSize: floatingLabel && (isFocused || hasValue) ? '12px' : '16px',
    fontWeight: '500',
    color: error ? '#EF4444' : isFocused ? '#000000' : '#6B7280',
    pointerEvents: 'none',
    transition: 'all 0.2s ease',
    marginBottom: floatingLabel ? '0' : '8px',
    display: 'block',
  });

  const handleChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setHasValue(value.length > 0);
    if (onChange) onChange(e);
  };

  const handleClear = () => {
    setInputValue("");
    setHasValue(false);
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus();
    }
    if (onClear) onClear();
  };

  if (type === "select") {
    return (
      <div style={{ margin: '12px 0' }}>
        {!floatingLabel && <label style={getLabelStyle()}>{label}</label>}
        <div style={{ position: 'relative' }}>
          {floatingLabel && <label style={getLabelStyle()}>{label}</label>}
          <select
            {...register(name)}
            defaultValue={defaultValue}
            style={{
              ...getInputStyle(),
              appearance: 'none',
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
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
              >
                {typeof option === 'object' ? option.label : option}
              </option>
            ))}
          </select>
          <div style={{
            position: 'absolute',
            right: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: '#6B7280',
          }}>
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
              <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        {error && (
          <p style={{
            fontSize: '13px',
            color: '#EF4444',
            marginTop: '8px',
            marginLeft: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <AlertCircle size={14} />
            {error.message}
          </p>
        )}
      </div>
    );
  }

  return (
    <div style={{ margin: '12px 0' }}>
      {!floatingLabel && <label style={getLabelStyle()}>{label}</label>}
      <div style={{ position: 'relative' }}>
        {Icon && (
          <div style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: isFocused ? '#000000' : '#6B7280',
            transition: 'color 0.2s ease',
          }}>
            <Icon size={20} strokeWidth={2} />
          </div>
        )}

        {floatingLabel && <label style={getLabelStyle()}>{label}</label>}

        <input
          {...(register ? register(name) : { name })}
          type={type || "text"}
          placeholder={floatingLabel ? "" : (placeholder || label)}
          style={getInputStyle()}
          disabled={disabled}
          value={register ? undefined : inputValue}
          defaultValue={register ? defaultValue : undefined}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={handleChange}
          ref={(e) => {
            inputRef.current = e;
            if (register && name) {
              const registerRef = register(name).ref;
              if (typeof registerRef === 'function') registerRef(e);
            }
          }}
        />

        {clearable && hasValue && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              padding: '4px',
              borderRadius: '50%',
              backgroundColor: '#E5E7EB',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s ease',
            }}
          >
            <X size={14} color="#6B7280" />
          </button>
        )}

        {success && !error && !hasValue && (
          <div style={{
            position: 'absolute',
            right: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
          }}>
            <Check size={20} color="#22C55E" />
          </div>
        )}

        {error && !hasValue && (
          <div style={{
            position: 'absolute',
            right: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
          }}>
            <AlertCircle size={20} color="#EF4444" />
          </div>
        )}
      </div>

      {error && (
        <p style={{
          fontSize: '13px',
          color: '#EF4444',
          marginTop: '8px',
          marginLeft: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <AlertCircle size={14} />
          {error.message}
        </p>
      )}
    </div>
  );
}

export default Input;

