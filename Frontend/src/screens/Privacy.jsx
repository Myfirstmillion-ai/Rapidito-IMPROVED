import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Lock, Eye, Database, UserCheck, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Privacy = () => {
  const navigate = useNavigate();

  const sections = [
    {
      icon: Database,
      title: '1. Información que Recopilamos',
      content: 'Recopilamos información personal cuando te registras (nombre, email, teléfono), información de ubicación durante los viajes, datos de pago, y datos de uso de la aplicación para mejorar nuestros servicios.'
    },
    {
      icon: Eye,
      title: '2. Cómo Usamos tu Información',
      content: 'Utilizamos tus datos para conectar pasajeros con conductores, procesar pagos, mejorar la seguridad, personalizar tu experiencia, enviar notificaciones importantes y cumplir con requisitos legales.'
    },
    {
      icon: Lock,
      title: '3. Protección de Datos',
      content: 'Implementamos medidas de seguridad técnicas y organizativas para proteger tu información personal contra acceso no autorizado, pérdida o alteración. Todos los datos sensibles están encriptados.'
    },
    {
      icon: UserCheck,
      title: '4. Compartir Información',
      content: 'Solo compartimos tu información con conductores/pasajeros para coordinar viajes, procesadores de pago para transacciones, y autoridades cuando sea legalmente requerido. Nunca vendemos tus datos.'
    },
    {
      icon: Bell,
      title: '5. Tus Derechos',
      content: 'Tienes derecho a acceder, corregir o eliminar tu información personal. Puedes solicitar una copia de tus datos o la eliminación de tu cuenta en cualquier momento contactándonos.'
    },
    {
      icon: Shield,
      title: '6. Cookies y Tecnologías Similares',
      content: 'Utilizamos cookies y tecnologías similares para mejorar la funcionalidad de la plataforma, recordar tus preferencias y analizar el uso del servicio. Puedes gestionar las cookies en tu navegador.'
    }
  ];

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 overflow-x-hidden overflow-y-auto">
      {/* Animated grid background */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxNiwgMTg1LCAxMjksIDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>

      {/* Content */}
      <div className="relative z-10 min-h-screen pb-safe">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="sticky top-0 z-20 backdrop-blur-xl bg-white/5 border-b border-white/10"
        >
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Volver</span>
            </button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Política de Privacidad
            </h1>
          </div>
        </motion.div>

        {/* Main content */}
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
          {/* Hero section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="p-8 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 backdrop-blur-xl border border-white/20"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Tu Privacidad es Nuestra Prioridad</h2>
                <p className="text-gray-400 text-sm">Última actualización: 1 de enero de 2025</p>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed">
              En Rapidito, nos comprometemos a proteger tu privacidad y garantizar la seguridad de tu información personal. 
              Esta política explica cómo recopilamos, usamos y protegemos tus datos.
            </p>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-3 gap-4"
          >
            {[
              { icon: Shield, label: 'Datos Encriptados' },
              { icon: Lock, label: 'Conexión Segura' },
              { icon: UserCheck, label: 'Verificación 2FA' },
            ].map((badge, idx) => {
              const IconComponent = badge.icon;
              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-center"
                >
                  <IconComponent className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">{badge.label}</p>
                </div>
              );
            })}
          </motion.div>

          {/* Sections */}
          <div className="space-y-6">
            {sections.map((section, idx) => {
              const IconComponent = section.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + idx * 0.05 }}
                  className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-3">{section.title}</h3>
                      <p className="text-gray-300 leading-relaxed">{section.content}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* GDPR compliance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="p-6 rounded-2xl bg-blue-500/10 backdrop-blur-md border border-blue-500/30"
          >
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-blue-400 mb-2">Cumplimiento Legal</h3>
                <p className="text-sm text-gray-300 mb-3">
                  Cumplimos con las leyes de protección de datos aplicables, incluyendo GDPR (UE) y normativas locales venezolanas y colombianas.
                </p>
                <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
                  <li>Derecho de acceso y portabilidad de datos</li>
                  <li>Derecho al olvido (eliminación de cuenta)</li>
                  <li>Derecho a rectificación de información</li>
                  <li>Derecho a limitar el procesamiento</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-center"
          >
            <h3 className="text-xl font-bold text-white mb-2">
              ¿Tienes Preguntas sobre tu Privacidad?
            </h3>
            <p className="text-emerald-50 mb-4">
              Nuestro equipo de privacidad está aquí para ayudarte
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="mailto:privacy@rapidito.com"
                className="px-6 py-3 rounded-xl bg-white text-emerald-600 font-semibold hover:bg-gray-100 transition-all duration-300"
              >
                privacy@rapidito.com
              </a>
              <button className="px-6 py-3 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white font-semibold hover:bg-white/30 transition-all duration-300">
                Solicitar Mis Datos
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
