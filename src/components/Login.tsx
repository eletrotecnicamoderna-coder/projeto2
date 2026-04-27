/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Calendar, User, ShieldCheck, Mail, Lock, ArrowRight, Stethoscope } from 'lucide-react';

interface LoginProps {
  onLogin: (role: 'patient' | 'admin' | 'professional', email: string, password: string) => void;
  onGoogleLogin: () => void;
  onShowRegister: () => void;
}

export default function Login({ onLogin, onGoogleLogin, onShowRegister }: LoginProps) {
  const [role, setRole] = useState<'patient' | 'admin' | 'professional'>('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onLogin(role, email, password);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-white rounded-[32px] shadow-2xl border border-slate-200 overflow-hidden flex flex-col md:flex-row"
      >
        {/* Left Side: Illustration / Branding */}
        <div className="w-full md:w-48 bg-blue-600 p-8 flex flex-col items-center justify-center text-white text-center gap-4 shrink-0">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-md border border-white/30">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">MedSync</h1>
            <p className="text-[10px] font-bold opacity-70 tracking-widest uppercase mt-1">Gestão de Saúde</p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="flex-1 p-8 md:p-10">
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Portal Clínica</h2>
            <p className="text-sm text-slate-500 font-medium mt-2">Escolha seu tipo de acesso para continuar</p>
          </div>

          <div className="flex p-1 bg-slate-100 rounded-2xl mb-8">
            <button 
              onClick={() => setRole('patient')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${role === 'patient' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <User className="w-4 h-4" />
              Paciente
            </button>
            <button 
              onClick={() => setRole('professional')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${role === 'professional' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Stethoscope className="w-4 h-4" />
              Médico
            </button>
            <button 
              onClick={() => setRole('admin')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${role === 'admin' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <ShieldCheck className="w-4 h-4" />
              Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input 
                  type="email"
                  required
                  placeholder="Seu e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all font-medium text-sm text-slate-700 placeholder:text-slate-300"
                />
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input 
                  type="password"
                  required
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all font-medium text-sm text-slate-700 placeholder:text-slate-300"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1">
              <label className="flex items-center gap-2 cursor-pointer hover:text-slate-600">
                <input type="checkbox" className="rounded-md border-slate-200" />
                Lembrar-me
              </label>
              <button type="button" className="text-blue-600 hover:underline">Esqueci minha senha</button>
            </div>

            <button 
              type="submit"
              className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
            >
              Entrar no Sistema
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-black text-slate-400">
                <span className="bg-white px-4 tracking-widest leading-none">Ou</span>
              </div>
            </div>

            <button 
              type="button"
              onClick={onGoogleLogin}
              className="w-full bg-slate-50 text-slate-600 py-5 rounded-2xl font-bold text-xs uppercase tracking-widest border border-slate-200 hover:bg-white hover:border-blue-400 hover:text-blue-600 transition-all flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Entrar com Google
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400 font-medium">
            Não tem uma conta? <button onClick={onShowRegister} className="text-blue-600 font-bold hover:underline">Cadastre-se</button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
