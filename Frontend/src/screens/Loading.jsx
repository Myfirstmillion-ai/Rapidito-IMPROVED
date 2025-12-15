import { Spinner } from '../components'

/**
 * Premium Loading Screen - Dark Gradient with Radar Pulse
 * Replaces solid green screen with professional loading feedback
 */
function Loading() {
    return (
        <div className='w-full h-dvh flex flex-col justify-center items-center bg-gradient-to-br from-slate-900 via-slate-950 to-black relative overflow-hidden'>
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, rgb(16 185 129) 1px, transparent 0)`,
                    backgroundSize: '50px 50px',
                    animation: 'pulse 3s ease-in-out infinite'
                }}></div>
            </div>
            
            {/* Radar Pulse Spinner */}
            <div className="relative z-10">
                <Spinner variant="radar" size="xl" />
            </div>
            
            {/* Loading Text */}
            <div className="mt-8 text-center z-10">
                <h2 className="text-2xl font-bold text-white mb-2 animate-pulse">
                    Cargando...
                </h2>
                <p className="text-sm text-emerald-400/80 whitespace-nowrap">
                    Preparando tu experiencia
                </p>
            </div>
            
            {/* Bottom glow effect */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        </div>
    )
}

export default Loading