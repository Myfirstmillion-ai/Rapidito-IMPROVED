import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  HelpCircle,
  ChevronDown,
  MessageCircle,
  Mail,
  Phone,
  Shield,
  MapPin,
  CreditCard,
  User,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

function Help() {
  const navigate = useNavigate();
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", label: "Todas", icon: HelpCircle },
    { id: "account", label: "Cuenta", icon: User },
    { id: "rides", label: "Viajes", icon: MapPin },
    { id: "payment", label: "Pagos", icon: CreditCard },
    { id: "safety", label: "Seguridad", icon: Shield },
  ];

  const faqs = [
    {
      category: "account",
      question: "¿Cómo creo una cuenta?",
      answer:
        "Para crear una cuenta, descarga la aplicación Rapi-dito y selecciona 'Registrarse'. Ingresa tu nombre completo, correo electrónico, número de teléfono y crea una contraseña segura. Recibirás un código de verificación por correo electrónico para activar tu cuenta.",
    },
    {
      category: "account",
      question: "¿Cómo cambio mi contraseña?",
      answer:
        "Ve a 'Perfil' > 'Configuración' > 'Seguridad' > 'Cambiar contraseña'. Ingresa tu contraseña actual y luego tu nueva contraseña dos veces para confirmar. Si olvidaste tu contraseña, usa la opción 'Olvidé mi contraseña' en la pantalla de inicio de sesión.",
    },
    {
      category: "account",
      question: "¿Puedo tener múltiples cuentas?",
      answer:
        "Cada usuario debe tener solo una cuenta asociada a su número de teléfono y correo electrónico. Tener múltiples cuentas puede resultar en la suspensión de todas las cuentas relacionadas.",
    },
    {
      category: "rides",
      question: "¿Cómo solicito un viaje?",
      answer:
        "Abre la app, ingresa tu destino en el buscador, confirma tu ubicación de origen (o ajústala manualmente), selecciona el tipo de vehículo (carro o moto) y presiona 'Solicitar viaje'. El sistema buscará el conductor más cercano disponible.",
    },
    {
      category: "rides",
      question: "¿Puedo cancelar un viaje?",
      answer:
        "Sí, puedes cancelar un viaje antes de que el conductor llegue. Sin embargo, si cancelas después de que el conductor haya aceptado y esté en camino, puede aplicarse una tarifa de cancelación dependiendo del tiempo transcurrido.",
    },
    {
      category: "rides",
      question: "¿Cómo sé quién es mi conductor?",
      answer:
        "Una vez que un conductor acepte tu solicitud, verás su nombre, foto de perfil, calificación, tipo de vehículo, marca, modelo, color y placa. También podrás ver su ubicación en tiempo real en el mapa mientras se dirige hacia ti.",
    },
    {
      category: "rides",
      question: "¿Qué hago si olvido algo en el vehículo?",
      answer:
        "Ve a tu historial de viajes, selecciona el viaje correspondiente y usa la opción 'Reportar objeto perdido'. El sistema te conectará con el conductor o nuestro equipo de soporte para ayudarte a recuperar tu pertenencia.",
    },
    {
      category: "payment",
      question: "¿Qué métodos de pago aceptan?",
      answer:
        "Aceptamos efectivo, tarjetas de crédito y débito (Visa, Mastercard), y métodos de pago digital como PSE. Puedes agregar y administrar tus métodos de pago en la sección 'Pagos' de tu perfil.",
    },
    {
      category: "payment",
      question: "¿Cómo funcionan las tarifas?",
      answer:
        "Las tarifas se calculan en base a la distancia del viaje, tiempo estimado, demanda actual y tipo de vehículo seleccionado. Verás una estimación de la tarifa antes de confirmar tu solicitud. La tarifa final puede variar ligeramente si cambias la ruta durante el viaje.",
    },
    {
      category: "payment",
      question: "¿Puedo obtener un recibo de mi viaje?",
      answer:
        "Sí, después de cada viaje recibirás un recibo digital por correo electrónico con todos los detalles: fecha, hora, origen, destino, distancia recorrida y monto cobrado. También puedes acceder a todos tus recibos desde el historial de viajes.",
    },
    {
      category: "safety",
      question: "¿Cómo garantizan mi seguridad?",
      answer:
        "Todos nuestros conductores pasan por verificación de antecedentes, capacitación de seguridad y sus vehículos son inspeccionados regularmente. Puedes compartir tu viaje en tiempo real con contactos de confianza, y contamos con un botón de emergencia integrado en la app.",
    },
    {
      category: "safety",
      question: "¿Qué es el botón de emergencia?",
      answer:
        "El botón de emergencia te conecta directamente con nuestro equipo de seguridad y las autoridades locales. Al activarlo, tu ubicación en tiempo real se comparte automáticamente. Úsalo solo en situaciones de emergencia real.",
    },
    {
      category: "safety",
      question: "¿Puedo compartir mi viaje con alguien?",
      answer:
        "Sí, antes o durante el viaje puedes compartir tu ubicación en tiempo real con hasta 5 contactos de confianza. Ellos recibirán un enlace para seguir tu viaje en el mapa hasta que llegues a tu destino.",
    },
  ];

  const filteredFaqs =
    selectedCategory === "all"
      ? faqs
      : faqs.filter((faq) => faq.category === selectedCategory);

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

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
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <HelpCircle size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Centro de ayuda
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Estamos aquí para ayudarte
                </p>
              </div>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 h-10 rounded-2xl whitespace-nowrap font-medium text-sm transition-all flex-shrink-0 ${
                    selectedCategory === category.id
                      ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg"
                      : "bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-900 dark:text-white"
                  }`}
                >
                  <Icon size={16} />
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      <div className="px-6 py-6">
        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.a
            href="mailto:support@rapidito.com"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="group bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800 rounded-3xl p-6 hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center">
                <Mail size={24} className="text-white" />
              </div>
              <ExternalLink
                size={16}
                className="text-blue-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
              />
            </div>
            <h3 className="font-bold text-blue-700 dark:text-blue-300 mb-1">
              Email
            </h3>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              support@rapidito.com
            </p>
          </motion.a>

          <motion.a
            href="tel:+573001234567"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="group bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border border-emerald-200 dark:border-emerald-800 rounded-3xl p-6 hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center">
                <Phone size={24} className="text-white" />
              </div>
              <ExternalLink
                size={16}
                className="text-emerald-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
              />
            </div>
            <h3 className="font-bold text-emerald-700 dark:text-emerald-300 mb-1">
              Teléfono
            </h3>
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              +57 300 123 4567
            </p>
          </motion.a>

          <motion.button
            onClick={() => navigate("/chat-support")}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="group bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800 rounded-3xl p-6 hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center">
                <MessageCircle size={24} className="text-white" />
              </div>
              <ExternalLink
                size={16}
                className="text-purple-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
              />
            </div>
            <h3 className="font-bold text-purple-700 dark:text-purple-300 mb-1">
              Chat en vivo
            </h3>
            <p className="text-sm text-purple-600 dark:text-purple-400">
              Disponible 24/7
            </p>
          </motion.button>
        </div>

        {/* FAQs Section */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
            Preguntas frecuentes
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {filteredFaqs.length}{" "}
            {filteredFaqs.length === 1 ? "pregunta" : "preguntas"}
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3">
          {filteredFaqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden hover:border-gray-300 dark:hover:border-gray-700 transition-all"
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1 break-words">
                    {faq.question}
                  </h3>
                  {expandedFaq !== index && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                      {faq.answer}
                    </p>
                  )}
                </div>
                <motion.div
                  animate={{ rotate: expandedFaq === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown
                    size={20}
                    className="text-gray-400 dark:text-gray-500"
                  />
                </motion.div>
              </button>

              <AnimatePresence>
                {expandedFaq === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 pt-0 border-t border-gray-200 dark:border-gray-800">
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed pt-4">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredFaqs.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              No hay preguntas
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No se encontraron preguntas en esta categoría
            </p>
          </motion.div>
        )}

        {/* Additional Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-800 rounded-3xl p-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0">
              <HelpCircle size={24} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                ¿No encuentras lo que buscas?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Nuestro equipo de soporte está disponible para ayudarte con
                cualquier pregunta o problema que tengas.
              </p>
              <button
                onClick={() => navigate("/chat-support")}
                className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle size={20} />
                Contactar soporte
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Help;