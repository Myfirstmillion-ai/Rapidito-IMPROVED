import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Button, Input } from '../components';
import { useState } from 'react';
import { useForm } from "react-hook-form";
import Console from '../utils/console';
import axios from 'axios';
import { useAlert } from '../hooks/useAlert';
import { Alert } from '../components';
import { Lock, Eye, EyeOff, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const allowedParams = ["user", "captain"];

function ResetPassword() {
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const { userType } = useParams();
    const navigate = useNavigate();
    const {
        handleSubmit,
        register,
        formState: { errors },
    } = useForm();

    const { alert, showAlert, hideAlert } = useAlert();

    // Password strength validation
    const getPasswordStrength = () => {
        if (!password) return { strength: 0, label: '', checks: [] };
        
        const checks = [
            { test: password.length >= 8, label: 'Mínimo 8 caracteres' },
            { test: /[A-Z]/.test(password), label: 'Una mayúscula' },
            { test: /[a-z]/.test(password), label: 'Una minúscula' },
            { test: /[0-9]/.test(password), label: 'Un número' },
            { test: /[^A-Za-z0-9]/.test(password), label: 'Un carácter especial' }
        ];

        const passed = checks.filter(c => c.test).length;
        const strength = (passed / checks.length) * 100;
        
        let label = 'Muy débil';
        if (strength >= 80) label = 'Muy fuerte';
        else if (strength >= 60) label = 'Fuerte';
        else if (strength >= 40) label = 'Media';
        else if (strength >= 20) label = 'Débil';

        return { strength, label, checks };
    };

    const passwordStrength = getPasswordStrength();

    if (!allowedParams.includes(userType)) {
        return <Navigate to={'/not-found'} replace />
    }

    const resetPassword = async (data) => {
        if(data.password.length < 8 || data.confirmPassword.length < 8 ){
            showAlert("Contraseña muy corta", "La contraseña debe tener al menos 8 caracteres", 'failure')
            return;
        }
        if (data.password !== data.confirmPassword) {
            showAlert("Las contraseñas no coinciden", "La contraseña y la confirmación deben ser iguales. Por favor vuelve a ingresarlas", 'failure')
            return;
        }
        try {
            setLoading(true)
            const response = await axios.post(
                `${import.meta.env.VITE_SERVER_URL}/${userType}/reset-password`,
                {
                    token: token,
                    password: data.password
                }
            );
            showAlert('¡Contraseña actualizada!', 'Tu contraseña ha sido restablecida exitosamente', 'success');
            Console.log(response);
            setTimeout(() => {
                navigate('/')
            }, 3000)
        } catch (error) {
            showAlert('Ocurrió un error', error.response?.data?.message || 'Error al restablecer', 'failure');
            setTimeout(() => {
                navigate('/' + userType + '/forgot-password')
            }, 5000);
            Console.log(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-emerald-950 relative overflow-x-hidden">
            {/* Animated Grid Background */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle, rgb(16 185 129) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }} />
            </div>

            {/* Back Button */}
            <div className="absolute top-4 left-4 z-50">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all active:scale-95 border border-white/20 backdrop-blur-xl"
                >
                    <ArrowLeft strokeWidth={2.5} size={24} className="text-white" />
                </button>
            </div>

            {/* Content */}
            <div className="relative min-h-screen flex items-center justify-center p-4 pb-safe">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    {/* Alert */}
                    <Alert
                        heading={alert.heading}
                        text={alert.text}
                        isVisible={alert.isVisible}
                        onClose={hideAlert}
                        type={alert.type}
                    />

                    {/* Glassmorphism Card */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                        {/* Lock Icon */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center"
                        >
                            <Lock size={40} className="text-white" />
                        </motion.div>

                        {/* Title */}
                        <motion.h1
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent"
                        >
                            Nueva Contraseña
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-center text-slate-400 mb-8 text-sm"
                        >
                            Crea una contraseña segura para tu cuenta
                        </motion.p>

                        {/* Form */}
                        <form onSubmit={handleSubmit(resetPassword)} className="space-y-6">
                            {/* New Password */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <label className="block text-sm font-medium text-white mb-2">
                                    Nueva Contraseña
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        {...register('password', { required: true })}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 transition-all"
                                        placeholder="Ingresa tu nueva contraseña"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>

                                {/* Password Strength Indicator */}
                                {password && (
                                    <div className="mt-3 space-y-2">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-400">Fortaleza:</span>
                                            <span className={`font-semibold ${
                                                passwordStrength.strength >= 80 ? 'text-green-400' :
                                                passwordStrength.strength >= 60 ? 'text-emerald-400' :
                                                passwordStrength.strength >= 40 ? 'text-yellow-400' :
                                                'text-red-400'
                                            }`}>
                                                {passwordStrength.label}
                                            </span>
                                        </div>
                                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-300 ${
                                                    passwordStrength.strength >= 80 ? 'bg-green-500' :
                                                    passwordStrength.strength >= 60 ? 'bg-emerald-500' :
                                                    passwordStrength.strength >= 40 ? 'bg-yellow-500' :
                                                    'bg-red-500'
                                                }`}
                                                style={{ width: `${passwordStrength.strength}%` }}
                                            />
                                        </div>
                                        <div className="space-y-1 mt-2">
                                            {passwordStrength.checks.map((check, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-xs">
                                                    {check.test ? (
                                                        <CheckCircle2 size={14} className="text-green-400" />
                                                    ) : (
                                                        <XCircle size={14} className="text-slate-500" />
                                                    )}
                                                    <span className={check.test ? 'text-slate-300' : 'text-slate-500'}>
                                                        {check.label}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>

                            {/* Confirm Password */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 }}
                            >
                                <label className="block text-sm font-medium text-white mb-2">
                                    Confirmar Contraseña
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        {...register('confirmPassword', { required: true })}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 transition-all"
                                        placeholder="Confirma tu contraseña"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                {confirmPassword && password !== confirmPassword && (
                                    <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                                        <XCircle size={14} />
                                        Las contraseñas no coinciden
                                    </p>
                                )}
                                {confirmPassword && password === confirmPassword && (
                                    <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                                        <CheckCircle2 size={14} />
                                        Las contraseñas coinciden
                                    </p>
                                )}
                            </motion.div>

                            {/* Submit Button */}
                            <motion.button
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Restableciendo...
                                    </>
                                ) : (
                                    <>
                                        <Lock size={20} />
                                        Restablecer Contraseña
                                    </>
                                )}
                            </motion.button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default ResetPassword
