import React, { useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, QrCode } from "lucide-react";
import { springs } from "../utils/animationUtils";

/**
 * PaymentMethodSelector - Componente para seleccionar método de pago con estilo iOS Deluxe
 * 
 * @param {Object} props - Props del componente
 * @param {string} props.selectedMethod - Método actualmente seleccionado ('cash' o 'nequi')
 * @param {Function} props.onMethodChange - Función llamada al cambiar de método
 */
function PaymentMethodSelector({ selectedMethod = "cash", onMethodChange }) {
  const handleSelectMethod = (method) => {
    onMethodChange(method);
  };
  
  return (
    <div className="w-full">
      <div className="flex flex-col mb-4">
        <label className="text-sm text-white/70 mb-2 font-medium">
          Método de pago
        </label>
        <div className="grid grid-cols-2 gap-3">
          {/* Opción Efectivo */}
          <PaymentOption
            id="cash"
            title="Efectivo"
            icon={<DollarSign size={24} className="text-emerald-500" />}
            isSelected={selectedMethod === "cash"}
            onClick={() => handleSelectMethod("cash")}
          />
          
          {/* Opción Nequi */}
          <PaymentOption
            id="nequi"
            title="Nequi"
            icon={
              <img 
                src="/payment-icons/nequi-logo.svg" 
                alt="Nequi" 
                className="w-6 h-6"
                onError={(e) => {
                  // Fallback en caso de error con la imagen
                  e.target.onerror = null;
                  e.target.style.display = "none";
                  e.target.nextElementSibling.style.display = "block";
                }}
              />
            }
            fallbackIcon={<QrCode size={24} className="text-[#61108C] hidden" />}
            isSelected={selectedMethod === "nequi"}
            onClick={() => handleSelectMethod("nequi")}
            accentColor="#61108C" // Color morado de Nequi
          />
        </div>
      </div>
      
      <div className="text-xs text-white/50 text-center mt-1 px-4">
        Pagarás directamente al conductor al finalizar el viaje
      </div>
    </div>
  );
}

/**
 * PaymentOption - Componente para una opción de pago individual
 */
function PaymentOption({ id, title, icon, fallbackIcon, isSelected, onClick, accentColor = "#10B981" }) {
  return (
    <motion.div
      className={`
        flex flex-col items-center justify-center p-4 rounded-2xl cursor-pointer
        backdrop-blur-md border transition-all duration-300
        ${isSelected 
          ? `border-2 border-[${accentColor}] bg-[${accentColor}]/10` 
          : 'border border-white/20 bg-white/5'}
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={springs.snappy}
      onClick={onClick}
    >
      <div className={`
        w-12 h-12 rounded-full mb-2 flex items-center justify-center
        ${isSelected ? `bg-[${accentColor}]/20` : 'bg-white/10'}
      `}>
        {icon}
        {fallbackIcon}
      </div>
      <span className={`
        font-medium
        ${isSelected ? `text-[${accentColor}]` : 'text-white'}
      `}>
        {title}
      </span>
    </motion.div>
  );
}

export default PaymentMethodSelector;
