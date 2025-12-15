import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Blog = () => {
  const navigate = useNavigate();

  const blogPosts = [
    {
      id: 1,
      title: '5 Consejos para Viajes Seguros en Rapidito',
      excerpt: 'Descubre las mejores prácticas para garantizar tu seguridad y comodidad en cada viaje con nuestra plataforma.',
      author: 'Equipo Rapidito',
      date: '15 Nov 2024',
      category: 'Seguridad',
      color: 'from-emerald-500 to-cyan-500'
    },
    {
      id: 2,
      title: 'Cómo Convertirse en Conductor Estrella',
      excerpt: 'Aprende los secretos de nuestros conductores mejor calificados y maximiza tus ganancias en la plataforma.',
      author: 'María González',
      date: '10 Nov 2024',
      category: 'Conductores',
      color: 'from-blue-500 to-purple-500'
    },
    {
      id: 3,
      title: 'Rapidito en San Antonio: Un Año de Éxito',
      excerpt: 'Celebramos nuestro primer aniversario conectando a la comunidad con transporte de calidad.',
      author: 'Camilo González',
      date: '5 Nov 2024',
      category: 'Noticias',
      color: 'from-pink-500 to-rose-500'
    },
    {
      id: 4,
      title: 'Tarifas Justas: Nuestro Compromiso Contigo',
      excerpt: 'Transparencia en precios y cómo calculamos las tarifas para garantizar equidad para todos.',
      author: 'Equipo Rapidito',
      date: '1 Nov 2024',
      category: 'Información',
      color: 'from-amber-500 to-orange-500'
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
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Volver</span>
            </button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Blog Rapidito
            </h1>
          </div>
        </motion.div>

        {/* Main content */}
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Hero post */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-12 p-8 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 backdrop-blur-xl border border-white/20 overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform duration-300"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-semibold">
                Destacado
              </span>
              <span className="text-gray-400 text-sm">Artículo más reciente</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 group-hover:text-emerald-400 transition-colors">
              {blogPosts[0].title}
            </h2>
            <p className="text-lg text-gray-300 mb-6 leading-relaxed">
              {blogPosts[0].excerpt}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{blogPosts[0].author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{blogPosts[0].date}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 font-semibold group-hover:gap-4 transition-all">
                <span>Leer más</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </motion.div>

          {/* Blog grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.slice(1).map((post, idx) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + idx * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all duration-300 h-full flex flex-col">
                  <div className={`w-full h-40 rounded-xl bg-gradient-to-br ${post.color} mb-4 flex items-center justify-center`}>
                    <span className="text-6xl">📝</span>
                  </div>
                  
                  <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-emerald-400 text-xs font-semibold mb-3 w-fit">
                    {post.category}
                  </span>
                  
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                    {post.title}
                  </h3>
                  
                  <p className="text-gray-400 text-sm mb-4 flex-grow leading-relaxed">
                    {post.excerpt}
                  </p>
                  
                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{post.date}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold group-hover:gap-3 transition-all">
                      <span>Leer artículo</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Newsletter signup */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-12 p-8 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-center"
          >
            <h3 className="text-2xl font-bold text-white mb-3">
              Suscríbete a Nuestro Newsletter
            </h3>
            <p className="text-emerald-50 mb-6">
              Recibe las últimas noticias, consejos y actualizaciones de Rapidito
            </p>
            <div className="max-w-md mx-auto flex gap-3">
              <input
                type="email"
                placeholder="tu@email.com"
                className="flex-1 px-4 py-3 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button className="px-6 py-3 rounded-xl bg-white text-emerald-600 font-semibold hover:bg-gray-100 transition-all duration-300">
                Suscribirse
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Blog;
