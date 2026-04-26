/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Calendar, User, ShieldCheck, Mail, Lock, ArrowRight } from 'lucide-react';

interface LoginProps {
  onLogin: (role: 'patient' | 'admin') => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [role, setRole] = useState<'patient' | 'admin'>('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Simulate login
    onLogin(role);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-white rounded-[32px] shadow-2xl border border-slate-200 overflow-hidden flex flex-col md:flex-row"
      >
        {/* Left Side: Illustration / Branding */}
        <div className="w-full md:w-48 bg-blue-600 p-8 flex flex-col items-center justify-center text-white text-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-md border border-white/30">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">MedSync</h1>
            <p className="text-[10px] font-bold opacity-70 tracking-widest uppercase mt-1">Gestão de Saúde</p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="flex-1 p-8 md:p-12">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Portal Clínica</h2>
            <p className="text-sm text-slate-500 font-medium mt-2">Escolha seu tipo de acesso para continuar</p>
          </div>

          <div className="flex p-1 bg-slate-100 rounded-2xl mb-8">
            <button 
              onClick={() => setRole('patient')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${role === 'patient' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <User className="w-4 h-4" />
              Paciente
            </button>
            <button 
              onClick={() => setRole('admin')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${role === 'admin' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
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
          </form>

          <p className="mt-8 text-center text-xs text-slate-400 font-medium">
            Não tem uma conta? <button className="text-blue-600 font-bold hover:underline">Cadastre-se</button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
