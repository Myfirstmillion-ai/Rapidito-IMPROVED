/**
 * Vehicle Color Utility
 * Maps Spanish color names to their corresponding hex values
 */

const vehicleColorMap = {
  rojo: '#EF4444',
  azul: '#3B82F6',
  negro: '#1F2937',
  blanco: '#F3F4F6',
  gris: '#9CA3AF',
  verde: '#10B981',
  amarillo: '#F59E0B',
  plateado: '#D1D5DB',
};

/**
 * Get the hex color for a vehicle color name
 * @param {string} colorName - Spanish color name (e.g., 'rojo', 'azul')
 * @returns {string} Hex color code
 */
export function getVehicleColor(colorName) {
  if (!colorName) return vehicleColorMap.gris;
  
  const normalizedColor = colorName.toLowerCase().trim();
  return vehicleColorMap[normalizedColor] || vehicleColorMap.gris;
}
