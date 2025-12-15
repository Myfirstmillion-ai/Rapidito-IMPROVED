import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Users,
  CheckCircle2,
  XCircle,
  Calendar,
  Mail,
  Phone,
  Car,
  ArrowLeft,
  Shield,
  Loader2,
  AlertCircle,
  X,
  Bike,
} from "lucide-react";
import axios from "axios";

// Plan configuration with durations
const MEMBERSHIP_PLANS = [
  { id: "Weekly", label: "Semanal", days: 7 },
  { id: "Bi-Weekly", label: "Quincenal", days: 15 },
  { id: "Monthly", label: "Mensual", days: 30 },
  { id: "2-Months", label: "2 Meses", days: 60 },
  { id: "3-Months", label: "3 Meses", days: 90 },
];

function AdminDashboard() {
  const [captains, setCaptains] = useState([]);
  const [filteredCaptains, setFilteredCaptains] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [updateError, setUpdateError] = useState("");
  
  // Plan selection modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState("Monthly");
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchCaptains();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCaptains(captains);
    } else {
      const filtered = captains.filter((captain) => {
        const fullName = `${captain.fullname.firstname} ${captain.fullname.lastname || ""}`.toLowerCase();
        const email = captain.email.toLowerCase();
        const query = searchQuery.toLowerCase();
        return fullName.includes(query) || email.includes(query);
      });
      setFilteredCaptains(filtered);
    }
  }, [searchQuery, captains]);

  const fetchCaptains = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/admin/captains`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCaptains(response.data.captains);
      setFilteredCaptains(response.data.captains);
    } catch (error) {
      console.error("Error fetching captains:", error);
      setError(error.response?.data?.message || "Error al cargar conductores");
      if (error.response?.status === 401 || error.response?.status === 403) {
        setTimeout(() => navigate("/"), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleCaptainStatus = async (captainId, currentStatus) => {
    // If activating (currently inactive), open the plan selection modal
    if (!currentStatus) {
      const captain = captains.find(c => c._id === captainId);
      setSelectedDriver(captain);
      setIsModalOpen(true);
      return;
    }
    
    // If deactivating, proceed directly
    await updateCaptainMembership(captainId, false, null, null);
  };

  const updateCaptainMembership = async (captainId, isActive, planType, expiryDate) => {
    try {
      setUpdatingId(captainId);
      setUpdateError("");
      const token = localStorage.getItem("token");

      const response = await axios.patch(
        `${import.meta.env.VITE_SERVER_URL}/admin/captain/${captainId}/status`,
        {
          isMembershipActive: isActive,
          membershipPlan: planType,
          membershipExpiresAt: expiryDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update local state
      setCaptains((prev) =>
        prev.map((captain) =>
          captain._id === captainId
            ? {
                ...captain,
                isMembershipActive: response.data.captain.isMembershipActive,
                membershipPlan: response.data.captain.membershipPlan,
                membershipExpiresAt: response.data.captain.membershipExpiresAt,
              }
            : captain
        )
      );
    } catch (error) {
      console.error("Error updating captain status:", error);
      setUpdateError(error.response?.data?.message || "Error al actualizar estado");
      setTimeout(() => setUpdateError(""), 5000);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConfirmPlan = async () => {
    if (!selectedDriver || !selectedPlan) return;

    const plan = MEMBERSHIP_PLANS.find(p => p.id === selectedPlan);
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + plan.days);

    await updateCaptainMembership(
      selectedDriver._id,
      true,
      selectedPlan,
      expiryDate.toISOString()
    );

    // Close modal and reset
    setIsModalOpen(false);
    setSelectedDriver(null);
    setSelectedPlan("Monthly");
  };

  const handleCancelModal = () => {
    setIsModalOpen(false);
    setSelectedDriver(null);
    setSelectedPlan("Monthly");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-20 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800"
      >
        <div className="px-6 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center"
            >
              <ArrowLeft size={20} className="text-gray-900 dark:text-white" />
            </button>
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                <Shield size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Panel Admin
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Gestión de conductores
                </p>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-2xl p-4 border border-emerald-200 dark:border-emerald-800 mb-4">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-emerald-500" />
              <div>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                  Total Conductores
                </p>
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                  {captains.length}
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 flex items-center gap-3 text-sm"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Update Error Message */}
          {updateError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl text-orange-600 dark:text-orange-400 flex items-center gap-3 text-sm"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{updateError}</span>
            </motion.div>
          )}

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-gray-100 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 focus:border-emerald-500 dark:focus:border-emerald-500 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 outline-none transition-colors"
            />
          </div>
        </div>
      </motion.div>

      {/* Captains Grid */}
      <div className="px-6 py-6 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredCaptains.map((captain) => (
          <motion.div
            key={captain._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-3xl p-6 hover:border-gray-300 dark:hover:border-gray-700 transition-all"
          >
            {/* Header with Toggle */}
            <div className="flex items-start justify-between mb-4 gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 break-words">
                  {captain.fullname.firstname} {captain.fullname.lastname || ""}
                </h3>
                {captain.isMembershipActive ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    Activo
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-900/30 rounded-full text-xs text-red-600 dark:text-red-400 font-medium">
                    <XCircle className="w-3 h-3" />
                    Inactivo
                  </span>
                )}
              </div>

              {/* Toggle Switch */}
              <button
                onClick={() =>
                  toggleCaptainStatus(captain._id, captain.isMembershipActive)
                }
                disabled={updatingId === captain._id}
                className={`relative w-14 h-7 rounded-full transition-colors flex-shrink-0 ${
                  captain.isMembershipActive
                    ? "bg-emerald-500"
                    : "bg-gray-300 dark:bg-gray-700"
                } ${updatingId === captain._id ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <motion.div
                  animate={{
                    x: captain.isMembershipActive ? 28 : 2,
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg"
                />
                {updatingId === captain._id && (
                  <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-white animate-spin" />
                )}
              </button>
            </div>

            {/* Details */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 min-w-0">
                <Mail className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span className="truncate">{captain.email}</span>
              </div>
              {captain.phone && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Phone className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span className="break-words">{captain.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 min-w-0">
                {captain.vehicle?.type === 'bike' ? (
                  <Bike className="w-4 h-4 text-purple-500 flex-shrink-0" />
                ) : (
                  <Car className="w-4 h-4 text-purple-500 flex-shrink-0" />
                )}
                <span className="truncate">
                  {captain.vehicle?.brand || "N/A"} {captain.vehicle?.model || ""} -{" "}
                  {captain.vehicle?.number || "N/A"}
                </span>
              </div>
              {captain.membershipPlan && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  <span className="text-xs break-words">
                    {captain.membershipPlan} - Expira:{" "}
                    {formatDate(captain.membershipExpiresAt)}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCaptains.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            {searchQuery ? "No se encontraron conductores" : "No hay conductores registrados"}
          </p>
        </div>
      )}

      {/* Plan Selection Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={handleCancelModal}
            />

            {/* Modal Container */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", duration: 0.4 }}
                className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 max-h-[85vh] flex flex-col"
              >
                {/* Close Button */}
                <button
                  onClick={handleCancelModal}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors z-10"
                >
                  <X size={20} className="text-gray-900 dark:text-white" />
                </button>

                {/* Header */}
                <div className="px-6 pt-6 pb-4 flex-shrink-0">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                      <Calendar size={28} className="text-white" />
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold text-center mb-2 text-gray-900 dark:text-white">
                    Seleccionar plan
                  </h2>

                  {selectedDriver && (
                    <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
                      Activando para:{" "}
                      <span className="font-bold text-gray-900 dark:text-white">
                        {selectedDriver.fullname.firstname} {selectedDriver.fullname.lastname || ""}
                      </span>
                    </p>
                  )}
                </div>

                {/* Scrollable Plan Selection */}
                <div className="flex-1 overflow-y-auto px-6 py-2">
                  <div className="space-y-3 pb-4">
                    {MEMBERSHIP_PLANS.map((plan, index) => (
                      <motion.button
                        key={plan.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelectedPlan(plan.id)}
                        className={`w-full p-4 rounded-2xl border-2 transition-all ${
                          selectedPlan === plan.id
                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                            : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-left flex-1">
                            <p className="font-bold text-base text-gray-900 dark:text-white">
                              {plan.label}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                              {plan.days} días de acceso
                            </p>
                          </div>
                          <div className="flex-shrink-0 ml-3">
                            <div
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                selectedPlan === plan.id
                                  ? "border-emerald-500 bg-emerald-500"
                                  : "border-gray-300 dark:border-gray-600 bg-transparent"
                              }`}
                            >
                              {selectedPlan === plan.id && (
                                <CheckCircle2 className="w-4 h-4 text-white" strokeWidth={3} />
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Footer with Action Buttons */}
                <div className="px-6 pb-6 pt-4 flex-shrink-0 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancelModal}
                      className="flex-1 h-12 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-2xl transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleConfirmPlan}
                      disabled={updatingId !== null}
                      className="flex-1 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-2xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {updatingId !== null ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Activando...</span>
                        </>
                      ) : (
                        <>
                          <span>Activar</span>
                          <CheckCircle2 className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdminDashboard;