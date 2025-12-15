import { motion } from 'framer-motion';
import { ArrowLeft, Briefcase, MapPin, Heart, TrendingUp, Users, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Careers = () => {
  const navigate = useNavigate();

  const positions = [
    {
      id: 1,
      title: 'Ingeniero de Software Senior',
      department: 'Tecnología',
      location: 'San Antonio del Táchira',
      type: 'Tiempo Completo',
      icon: '💻',
      color: 'from-emerald-500 to-cyan-500'
    },
    {
      id: 2,
      title: 'Especialista en Atención al Cliente',
      department: 'Soporte',
      location: 'Remoto',
      type: 'Tiempo Completo',
      icon: '🎧',
      color: 'from-blue-500 to-purple-500'
    },
    {
      id: 3,
      title: 'Analista de Datos',
      department: 'Analytics',
      location: 'San Antonio del Táchira',
      type: 'Tiempo Completo',
      icon: '📊',
      color: 'from-pink-500 to-rose-500'
    },
    {
      id: 4,
      title: 'Conductor Partner',
      department: 'Operaciones',
      location: 'Región Fronteriza',
      type: 'Flexible',
      icon: '🚗',
      color: 'from-amber-500 to-orange-500'
    }
  ];

  const benefits = [
    { icon: Heart, title: 'Salud', desc: 'Seguro médico completo para ti y tu familia' },
    { icon: TrendingUp, title: 'Crecimiento', desc: 'Oportunidades de desarrollo profesional continuo' },
    { icon: Users, title: 'Equipo', desc: 'Ambiente colaborativo con gente apasionada' },
    { icon: Award, title: 'Bonos', desc: 'Incentivos por desempeño excepcional' },
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
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Volver</span>
            </button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Carreras
            </h1>
          </div>
        </motion.div>

        {/* Main content */}
        <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
          {/* Hero section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="p-8 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 backdrop-blur-xl border border-white/20 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 mb-6">
              <Briefcase className="w-5 h-5 text-white" />
              <span className="text-white font-semibold">Únete a Nuestro Equipo</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Construye el Futuro del Transporte
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              En Rapidito, estamos revolucionando la movilidad en la región fronteriza. 
              Únete a nosotros y sé parte de algo extraordinario.
            </p>
          </motion.div>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-2xl font-bold text-white mb-6 text-center">
              ¿Por qué trabajar con nosotros?
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, idx) => {
                const IconComponent = benefit.icon;
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-center group hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-white mb-2">{benefit.title}</h4>
                    <p className="text-sm text-gray-400">{benefit.desc}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Open positions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-2xl font-bold text-white mb-6">
              Posiciones Abiertas
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {positions.map((position, idx) => (
                <div
                  key={position.id}
                  className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all duration-300 group cursor-pointer"
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${position.color} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>
                    {position.icon}
                  </div>
                  
                  <h4 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                    {position.title}
                  </h4>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Briefcase className="w-4 h-4" />
                      <span>{position.department}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <MapPin className="w-4 h-4" />
                      <span>{position.location}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold">
                      {position.type}
                    </span>
                    <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm font-semibold hover:scale-105 transition-transform">
                      Aplicar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="p-8 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-center"
          >
            <h3 className="text-2xl font-bold text-white mb-3">
              ¿No encuentras la posición ideal?
            </h3>
            <p className="text-emerald-50 mb-6">
              Envíanos tu CV y te contactaremos cuando surjan nuevas oportunidades
            </p>
            <button className="px-8 py-3 rounded-xl bg-white text-emerald-600 font-semibold hover:bg-gray-100 transition-all duration-300 hover:scale-105">
              Enviar Currículum
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Careers;
