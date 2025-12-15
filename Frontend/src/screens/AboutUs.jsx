import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Award, Users, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AboutUs = () => {
  const navigate = useNavigate();

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 overflow-x-hidden overflow-y-auto">
      {/* Animated grid background */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxNiwgMTg1LCAxMjksIDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

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
              Sobre Nosotros
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
            className="relative p-8 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 backdrop-blur-xl border border-white/20 overflow-hidden"
          >
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 mb-6">
                <MapPin className="w-5 h-5 text-white" />
                <span className="text-white font-semibold">Rapidito</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Tu compañero de viaje de confianza
              </h2>
              <p className="text-lg text-gray-300 leading-relaxed">
                Desde 2025, conectamos pasajeros y conductores en San Antonio del Táchira y la región fronteriza, 
                ofreciendo viajes rápidos, seguros y asequibles para toda la comunidad.
              </p>
            </div>
          </motion.div>

          {/* Mission & Vision */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid md:grid-cols-2 gap-6"
          >
            <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Nuestra Misión</h3>
              <p className="text-gray-300 leading-relaxed">
                Proporcionar transporte seguro, eficiente y accesible que mejore la movilidad urbana 
                y genere oportunidades económicas para conductores locales.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Nuestra Visión</h3>
              <p className="text-gray-300 leading-relaxed">
                Ser la plataforma de transporte líder en la región fronteriza, reconocida por su 
                compromiso con la seguridad, innovación y servicio al cliente.
              </p>
            </div>
          </motion.div>

          {/* Values */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">Nuestros Valores</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { title: 'Seguridad Primero', desc: 'La protección de pasajeros y conductores es nuestra máxima prioridad' },
                { title: 'Transparencia', desc: 'Precios justos y claros sin sorpresas ni tarifas ocultas' },
                { title: 'Comunidad', desc: 'Apoyamos el desarrollo económico de conductores locales' },
                { title: 'Innovación', desc: 'Tecnología de punta para mejorar la experiencia de usuario' },
              ].map((value, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h4 className="font-semibold text-emerald-400 mb-2">{value.title}</h4>
                  <p className="text-sm text-gray-400">{value.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-3 gap-4"
          >
            {[
              { number: '1000+', label: 'Viajes Diarios' },
              { number: '500+', label: 'Conductores' },
              { number: '4.9★', label: 'Calificación' },
            ].map((stat, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 text-center">
                <div className="text-3xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="p-8 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-center"
          >
            <h3 className="text-2xl font-bold text-white mb-3">
              ¿Listo para unirte a Rapidito?
            </h3>
            <p className="text-emerald-50 mb-6">
              Ya sea como pasajero o conductor, estamos aquí para ayudarte
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-8 py-3 rounded-xl bg-white text-emerald-600 font-semibold hover:bg-gray-100 transition-all duration-300 hover:scale-105"
            >
              Comenzar Ahora
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
