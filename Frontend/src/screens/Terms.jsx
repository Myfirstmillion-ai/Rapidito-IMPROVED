import { motion } from 'framer-motion';
import { ArrowLeft, Shield, FileText, Scale } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Terms = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: '1. Aceptación de los Términos',
      content: 'Al acceder y utilizar la plataforma Rapidito, usted acepta estar sujeto a estos términos y condiciones de uso. Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestros servicios.'
    },
    {
      title: '2. Descripción del Servicio',
      content: 'Rapidito es una plataforma tecnológica que conecta pasajeros con conductores independientes para servicios de transporte. No somos un servicio de taxi ni un transportador común. Actuamos únicamente como intermediarios tecnológicos.'
    },
    {
      title: '3. Registro y Cuenta de Usuario',
      content: 'Para utilizar nuestros servicios, debe crear una cuenta proporcionando información precisa y actualizada. Usted es responsable de mantener la confidencialidad de su cuenta y contraseña, y de todas las actividades que ocurran bajo su cuenta.'
    },
    {
      title: '4. Uso Aceptable',
      content: 'Los usuarios se comprometen a utilizar la plataforma únicamente para fines legales. Queda prohibido el acoso, comportamiento inapropiado, fraude o cualquier actividad que viole las leyes locales o estos términos de servicio.'
    },
    {
      title: '5. Tarifas y Pagos',
      content: 'Las tarifas se calculan en base a la distancia, tiempo y demanda del servicio. Los pasajeros aceptan pagar las tarifas mostradas en la aplicación. Los conductores recibirán su compensación según lo establecido en su acuerdo de socio conductor.'
    },
    {
      title: '6. Cancelaciones y Reembolsos',
      content: 'Los pasajeros pueden cancelar un viaje sin cargo antes de que el conductor inicie el viaje hacia la ubicación de recogida. Las cancelaciones posteriores pueden estar sujetas a una tarifa de cancelación.'
    },
    {
      title: '7. Responsabilidad',
      content: 'Rapidito no es responsable de daños, pérdidas o lesiones que puedan ocurrir durante el uso del servicio. Los conductores son contratistas independientes responsables de su propio seguro y cumplimiento legal.'
    },
    {
      title: '8. Privacidad y Datos',
      content: 'El uso de sus datos personales está sujeto a nuestra Política de Privacidad. Al utilizar Rapidito, usted consiente la recopilación y uso de información según lo descrito en dicha política.'
    },
    {
      title: '9. Modificaciones',
      content: 'Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigencia inmediatamente después de su publicación en la plataforma. El uso continuado del servicio constituye su aceptación de los términos modificados.'
    },
    {
      title: '10. Terminación',
      content: 'Podemos suspender o terminar su acceso a la plataforma en cualquier momento, sin previo aviso, por violación de estos términos o por cualquier otra razón a nuestra discreción.'
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
              Términos y Condiciones
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
            className="p-8 rounded-3xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-white/20"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <Scale className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Términos de Servicio</h2>
                <p className="text-gray-400 text-sm">Última actualización: 1 de enero de 2025</p>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Estos Términos y Condiciones regulan el uso de la plataforma Rapidito. 
              Por favor, léalos cuidadosamente antes de utilizar nuestros servicios.
            </p>
          </motion.div>

          {/* Important notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-6 rounded-2xl bg-emerald-500/10 backdrop-blur-md border border-emerald-500/30"
          >
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-emerald-400 mb-2">Aviso Importante</h3>
                <p className="text-sm text-gray-300">
                  Al utilizar la plataforma Rapidito, usted acepta automáticamente estos términos y condiciones. 
                  Si no está de acuerdo, por favor absténgase de usar nuestros servicios.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Sections */}
          <div className="space-y-6">
            {sections.map((section, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + idx * 0.05 }}
                className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10"
              >
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">{section.title}</h3>
                    <p className="text-gray-300 leading-relaxed">{section.content}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-center"
          >
            <h3 className="text-xl font-bold text-white mb-2">
              ¿Preguntas sobre los Términos?
            </h3>
            <p className="text-emerald-50 mb-4">
              Contáctanos en legal@rapidito.com
            </p>
            <p className="text-sm text-emerald-100">
              Nuestro equipo legal está disponible para aclarar cualquier duda
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
