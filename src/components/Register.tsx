/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent, ChangeEvent } from 'react';
import { motion } from 'motion/react';
import { Calendar, User, Mail, Lock, Phone, CreditCard, ArrowLeft, CheckCircle2, MapPin } from 'lucide-react';

interface RegisterProps {
  onBackToLogin: () => void;
  onRegister: (data: any) => void;
}

export default function Register({ onBackToLogin, onRegister }: RegisterProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    cpf: '',
    birthDate: '',
    address: '',
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (step < 2) {
      setStep(step + 1);
    } else {
      onRegister(formData);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-white rounded-[40px] shadow-2xl border border-slate-200 overflow-hidden flex flex-col md:flex-row h-full max-h-[800px]"
      >
        {/* Sidebar Info */}
        <div className="w-full md:w-64 bg-blue-600 p-10 flex flex-col justify-between text-white border-r border-blue-500">
          <div>
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-8 border border-white/30 backdrop-blur-md">
              <Calendar className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tighter leading-none mb-2">MedSync</h1>
            <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Cadastro do Paciente</p>
          </div>

          <div className="space-y-6">
            <div className={`flex items-center gap-4 transition-opacity ${step === 1 ? 'opacity-100' : 'opacity-40'}`}>
              <div className="w-8 h-8 rounded-full bg-white text-blue-600 flex items-center justify-center font-black text-xs">1</div>
              <p className="text-[10px] font-bold uppercase tracking-widest">Informações Básicas</p>
            </div>
            <div className={`flex items-center gap-4 transition-opacity ${step === 2 ? 'opacity-100' : 'opacity-40'}`}>
              <div className="w-8 h-8 rounded-full bg-white text-blue-600 flex items-center justify-center font-black text-xs">2</div>
              <p className="text-[10px] font-bold uppercase tracking-widest">Dados do Perfil</p>
            </div>
          </div>

          <p className="text-[10px] font-bold text-blue-200 leading-relaxed uppercase tracking-tight">
            Sua saúde conectada de forma inteligente e segura.
          </p>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 md:p-14 overflow-y-auto">
          <button 
            onClick={onBackToLogin}
            className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold text-[10px] uppercase tracking-widest mb-10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Login
          </button>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              {step === 1 ? 'Crie sua conta' : 'Complete seu perfil'}
            </h2>
            <p className="text-sm text-slate-400 font-medium mt-2">
              {step === 1 
                ? 'Insira seus dados de acesso principais' 
                : 'Precisamos de mais alguns dados para sua ficha médica'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 ? (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <input 
                    name="name"
                    required
                    placeholder="Nome Completo"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all font-medium text-sm text-slate-700 shadow-sm"
                  />
                </div>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <input 
                    name="email"
                    type="email"
                    required
                    placeholder="E-mail"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all font-medium text-sm text-slate-700 shadow-sm"
                  />
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <input 
                    name="password"
                    type="password"
                    required
                    placeholder="Senha"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all font-medium text-sm text-slate-700 shadow-sm"
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <input 
                    name="phone"
                    required
                    placeholder="Telefone (WhatsApp)"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all font-medium text-sm text-slate-700 shadow-sm"
                  />
                </div>
                <div className="relative group">
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <input 
                    name="cpf"
                    required
                    placeholder="CPF"
                    value={formData.cpf}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all font-medium text-sm text-slate-700 shadow-sm"
                  />
                </div>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <input 
                    name="birthDate"
                    type="date"
                    required
                    placeholder="Data de Nascimento"
                    value={formData.birthDate}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all font-medium text-sm text-slate-700 shadow-sm"
                  />
                </div>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <input 
                    name="address"
                    required
                    placeholder="Endereço Completo"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all font-medium text-sm text-slate-700 shadow-sm"
                  />
                </div>
              </motion.div>
            )}

            <div className="flex gap-4 pt-10">
              {step === 2 && (
                <button 
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-slate-100 text-slate-600 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-200 transition-all"
                >
                  Voltar
                </button>
              )}
              <button 
                type="submit"
                className="flex-[2] bg-blue-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                {step === 1 ? 'Próximo Passo' : 'Finalizar Cadastro'}
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </form>

          <p className="mt-12 text-center text-xs text-slate-400 font-bold uppercase tracking-widest border-t border-slate-100 pt-8 mt-12 mb-0">
            Segurança garantida pela MedSync Cloud
          </p>
        </div>
      </motion.div>
    </div>
  );
}
