/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Calendar, History, Bell, User, Plus, CheckCircle2, XCircle, Clock, ShieldCheck, LogOut, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Types
import { Appointment, Patient, AppointmentStatus } from './types';
import Login from './components/Login';

// Mock Data
const MOCK_PATIENT: Patient = {
  id: 'p1',
  name: 'Maria Oliveira',
  email: 'maria.oliveira@email.com',
  phone: '(11) 98765-4321',
  cpf: '123.456.789-00',
  birthDate: '1985-05-20',
};

const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'a1',
    patientId: 'p1',
    doctorId: 'd1',
    dateTime: '2026-05-10T14:30:00Z',
    status: 'scheduled',
    notes: 'Retorno para avaliação de exames de sangue.',
  },
  {
    id: 'a2',
    patientId: 'p1',
    doctorId: 'd2',
    dateTime: '2026-04-15T09:00:00Z',
    status: 'completed',
    notes: 'Check-up anual.',
    diagnosis: 'Paciente saudável, leve deficiência de Vitamina D.',
    prescription: 'Vitamina D 2000 UI - 1 gota ao dia.',
  },
];

import AppointmentModal from './components/AppointmentModal';

type UserRole = 'patient' | 'admin' | null;

export default function App() {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [activeTab, setActiveTab] = useState<'appointments' | 'history' | 'notifications' | 'profile' | 'admin-dashboard' | 'admin-patients'>('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSaveAppointment = (data: any) => {
    const newAppointment: Appointment = {
      id: Math.random().toString(36).substr(2, 9),
      patientId: MOCK_PATIENT.id,
      doctorId: data.doctorId,
      dateTime: data.dateTime,
      status: 'scheduled',
      notes: data.notes,
    };
    setAppointments([newAppointment, ...appointments]);
  };

  const handleLogin = (role: 'patient' | 'admin') => {
    setUserRole(role);
    setActiveTab(role === 'admin' ? 'admin-dashboard' : 'appointments');
  };

  const handleLogout = () => {
    setUserRole(null);
  };

  const statusMap: Record<AppointmentStatus, string> = {
    scheduled: 'Agendada',
    completed: 'Concluída',
    canceled: 'Cancelada',
    missed: 'Faltou',
  };

  const NavItem = ({ id, icon: Icon, label }: { id: typeof activeTab, icon: any, label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 p-3 rounded-xl font-medium transition-all ${
        activeTab === id 
          ? 'bg-blue-50 text-blue-700 shadow-sm' 
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <Icon className={`w-5 h-5 ${activeTab === id ? 'text-blue-600' : 'text-slate-400'}`} />
      <span className="text-sm">{label}</span>
      {activeTab === id && <motion.div layoutId="active" className="ml-auto w-1 h-4 bg-blue-600 rounded-full" />}
    </button>
  );

  if (!userRole) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-72 bg-white border-r border-slate-200 flex-col shrink-0">
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Calendar className="w-6 h-6" />
            </div>
            <span className="font-bold text-xl tracking-tight text-blue-900 uppercase">MedSync</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {userRole === 'patient' ? (
            <>
              <NavItem id="appointments" icon={Calendar} label="Agenda" />
              <NavItem id="history" icon={History} label="Histórico" />
              <NavItem id="notifications" icon={Bell} label="Notificações" />
              <NavItem id="profile" icon={User} label="Meu Perfil" />
            </>
          ) : (
            <>
              <NavItem id="admin-dashboard" icon={ShieldCheck} label="Painel Admin" />
              <NavItem id="admin-patients" icon={Users} label="Gestão de Pacientes" />
            </>
          )}
        </nav>

        <div className="p-6 border-t border-slate-100">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center gap-3 group cursor-pointer hover:bg-white transition-colors mb-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border overflow-hidden shadow-sm ${userRole === 'admin' ? 'bg-amber-100 border-amber-200' : 'bg-blue-100 border-blue-200'}`}>
              {userRole === 'admin' ? <ShieldCheck className="w-6 h-6 text-amber-600" /> : <User className="w-6 h-6 text-blue-600" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{userRole === 'admin' ? 'Claudio Admin' : MOCK_PATIENT.name}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{userRole === 'admin' ? 'Administrador' : 'Paciente'}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-all text-sm"
          >
            <LogOut className="w-5 h-5 text-red-400" />
            Sair do Sistema
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 z-10">
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              {activeTab === 'appointments' && 'Gestão de Agenda'}
              {activeTab === 'history' && 'Histórico Médico'}
              {activeTab === 'notifications' && 'Centro de Mensagens'}
              {activeTab === 'profile' && 'Perfil do Paciente'}
              {activeTab === 'admin-dashboard' && 'Visão Geral da Clínica'}
              {activeTab === 'admin-patients' && 'Base de Pacientes'}
            </h1>
            <p className="text-xs text-slate-500 font-medium tracking-tight">
              {userRole === 'admin' ? 'Área Restrita Administrativa' : `Bem-vinda de volta, ${MOCK_PATIENT.name.split(' ')[0]}`}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative p-2 text-slate-400 hover:text-slate-600 cursor-pointer hidden sm:block">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white font-bold">2</span>
            </div>
            {userRole === 'patient' && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-md shadow-blue-100 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Novo Agendamento
              </button>
            )}
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-32 md:pb-8">
          <AppointmentModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onSave={handleSaveAppointment}
          />

          <AnimatePresence mode="wait">
            {activeTab === 'appointments' && (
              <motion.div
                key="appointments"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Total Agendado</p>
                    <p className="text-3xl font-bold text-slate-800 mt-2">{appointments.filter(a => a.status === 'scheduled').length}</p>
                    <p className="text-blue-600 text-[10px] mt-2 font-bold uppercase">Consultas pendentes</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Próxima Consulta</p>
                    <p className="text-xl font-bold text-slate-800 mt-2">10 de Maio</p>
                    <p className="text-slate-500 text-xs mt-1 font-medium tracking-tight">Às 14:30 hs</p>
                  </div>
                  <div className="bg-blue-900 p-6 rounded-2xl shadow-lg text-white border border-blue-800">
                    <p className="text-blue-200 text-[10px] font-black uppercase tracking-[0.2em]">Status Geral</p>
                    <p className="text-xl font-bold mt-2 tracking-tight">Saúde em Dia</p>
                    <div className="mt-4 w-full bg-blue-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-400 h-full w-[85%]" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 text-xs uppercase tracking-[0.15em]">Meus Agendamentos</h3>
                    <span className="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer uppercase tracking-widest">Ver calendário →</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {appointments.filter(a => a.status === 'scheduled').map((appointment) => (
                      <div key={appointment.id} className="p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-6">
                          <div className="w-14 h-14 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center shadow-inner">
                            <span className="text-blue-600 font-black text-xl leading-none">{format(new Date(appointment.dateTime), 'dd')}</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-1">{format(new Date(appointment.dateTime), 'MMM', { locale: ptBR })}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                              <User className="w-5 h-5 text-slate-400" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 text-base tracking-tight">Dr. Cláudio Santos</h4>
                              <p className="text-xs text-slate-500 font-medium tracking-tight">Cardiologia • {format(new Date(appointment.dateTime), "HH:mm 'hs'", { locale: ptBR })}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100 shadow-sm">CONFIRMADO</span>
                          <button 
                            onClick={() => setAppointments(appointments.filter(a => a.id !== appointment.id))}
                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {appointments.filter(a => a.status === 'scheduled').length === 0 && (
                      <div className="p-20 text-center text-slate-400">
                        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-10" />
                        <p className="font-bold text-xs uppercase tracking-widest">Nenhuma consulta pendente.</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-sm">
                  <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-slate-200 shadow-sm">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="font-bold text-xl text-slate-900 tracking-tight">{MOCK_PATIENT.name}</h2>
                        <div className="flex items-center gap-4 mt-1">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">CPF: {MOCK_PATIENT.cpf}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Nascimento: {format(new Date(MOCK_PATIENT.birthDate), 'dd/MM/yyyy')}</p>
                        </div>
                      </div>
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-blue-700 transition-colors">
                      Baixar Relatório Completo
                    </button>
                  </div>
                  
                  <div className="divide-y divide-slate-100">
                    {appointments.filter(a => a.status !== 'scheduled').map((appointment) => (
                      <div key={appointment.id} className="p-8 hover:bg-slate-50 transition-colors">
                        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                               <Plus className="w-4 h-4 text-slate-400" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 tracking-tight">Dr. Roberto Lima</h4>
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{format(new Date(appointment.dateTime), "dd 'de' MMMM, yyyy", { locale: ptBR })}</p>
                            </div>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] self-start border shadow-sm ${
                            appointment.status === 'completed' 
                              ? 'bg-green-50 text-green-700 border-green-100' 
                              : 'bg-slate-50 text-slate-500 border-slate-200'
                          }`}>
                            {statusMap[appointment.status]}
                          </span>
                        </div>

                        {appointment.diagnosis && (
                          <div className="mb-6 pl-4 border-l-4 border-blue-100">
                            <div className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                Diagnóstico Médico
                            </div>
                            <p className="text-slate-700 leading-relaxed font-medium text-sm">{appointment.diagnosis}</p>
                          </div>
                        )}

                        {appointment.prescription && (
                          <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 flex items-center gap-4 shadow-sm">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-50">
                              <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-0.5">Tratamento Prescrito</p>
                              <p className="text-sm font-bold text-slate-800 tracking-tight">{appointment.prescription}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    {appointments.filter(a => a.status !== 'scheduled').length === 0 && (
                      <div className="p-20 text-center text-slate-400 italic text-sm">Nenhum registro histórico encontrado.</div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-3xl mx-auto space-y-4"
              >
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex gap-5 relative group transition-all hover:bg-slate-50">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0 border border-blue-100 shadow-inner group-hover:bg-white transition-colors">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-slate-900 tracking-tight">Exame Disponível</h4>
                      <span className="text-[9px] bg-red-100 text-red-600 font-black uppercase tracking-wider px-1.5 py-0.5 rounded">NOVO</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">O resultado do seu exame de sangue já está disponível no sistema para visualização imediata.</p>
                    <button className="mt-3 text-blue-600 text-[10px] font-black uppercase tracking-widest hover:underline tracking-[0.1em]">Ver Resultados</button>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex gap-5 opacity-60 grayscale hover:grayscale-0 transition-all cursor-default">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0 border border-slate-100 shadow-inner">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-slate-900 tracking-tight">Agendamento Confirmado</h4>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">há 2 dias</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">Sua consulta com Dr. Roberto Lima foi confirmada pelo sistema da clínica.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-2xl mx-auto space-y-6"
              >
                {/* ... (existing profile content) */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 flex flex-col items-center">
                  <div className="relative group">
                    <div className="w-28 h-28 rounded-[2rem] bg-slate-50 flex items-center justify-center border-2 border-slate-100 group-hover:bg-white transition-all overflow-hidden cursor-pointer shadow-inner">
                      <User className="w-14 h-14 text-slate-300 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white border-4 border-white shadow-lg">
                      <Plus className="w-4 h-4" />
                    </div>
                  </div>
                  
                  <div className="mt-8 text-center">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{MOCK_PATIENT.name}</h2>
                    <div className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-1.5 flex items-center justify-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                        Paciente Verificado
                    </div>
                  </div>

                  <div className="w-full mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 bg-slate-50/50 rounded-xl border border-slate-100 group hover:bg-white transition-colors">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Canal de E-mail</p>
                      <p className="text-xs font-bold text-slate-700">{MOCK_PATIENT.email}</p>
                    </div>
                    <div className="p-5 bg-slate-50/50 rounded-xl border border-slate-100 group hover:bg-white transition-colors">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 mt-0">Telefone Contato</p>
                      <p className="text-xs font-bold text-slate-700">{MOCK_PATIENT.phone}</p>
                    </div>
                    <div className="p-5 bg-slate-50/50 rounded-xl border border-slate-100 group hover:bg-white transition-colors">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">CPF / Documento</p>
                      <p className="text-xs font-bold text-slate-700">{MOCK_PATIENT.cpf}</p>
                    </div>
                    <div className="p-5 bg-slate-50/50 rounded-xl border border-slate-100 group hover:bg-white transition-colors">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Seguro Saúde</p>
                      <p className="text-xs font-bold text-slate-700 uppercase tracking-tight">Premium Health Plus</p>
                    </div>
                  </div>
                  
                  <div className="w-full mt-8 flex flex-col sm:flex-row gap-4">
                    <button className="flex-1 bg-slate-900 text-white py-4 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all transform hover:-translate-y-0.5">
                      Configurações de Conta
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="flex-1 bg-white text-slate-900 py-4 border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all transform hover:-translate-y-0.5"
                    >
                      Sair da Sessão
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'admin-dashboard' && (
              <motion.div
                key="admin-dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Total de Consultas</p>
                    <p className="text-3xl font-bold text-slate-800 mt-2">{appointments.length}</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Agendadas Hoje</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">12</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Novos Pacientes</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">+5</p>
                  </div>
                  <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200 shadow-sm">
                    <p className="text-amber-500 text-[10px] font-black uppercase tracking-[0.2em]">Faturamento</p>
                    <p className="text-2xl font-bold text-amber-900 mt-2">R$ 15.420</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 text-xs uppercase tracking-[0.15em]">Todas as Atividades</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Paciente</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Especialista</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data/Hora</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {appointments.map(a => (
                          <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-bold text-slate-700 text-sm">{MOCK_PATIENT.name}</td>
                            <td className="px-6 py-4 text-slate-500 text-sm">Dr. Cláudio Santos</td>
                            <td className="px-6 py-4 text-slate-500 text-sm font-medium">{format(new Date(a.dateTime), "dd/MM/yy HH:mm", { locale: ptBR })}</td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                a.status === 'scheduled' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                                a.status === 'completed' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
                              }`}>
                                {statusMap[a.status]}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'admin-patients' && (
              <motion.div
                key="admin-patients"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 tracking-tight">Paciente Exemplo {i}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ID: #4321-{i}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-[11px] font-bold">
                        <span className="text-slate-400 uppercase tracking-widest">Última Visita</span>
                        <span className="text-slate-700">12/04/2026</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] font-bold">
                        <span className="text-slate-400 uppercase tracking-widest">Pendências</span>
                        <span className="text-red-500">Exames Atrasados</span>
                      </div>
                    </div>
                    <button className="w-full mt-6 py-3 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 transition-colors">
                      Ver Prontuário →
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <footer className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-between z-20 shadow-[0_-10px_20px_-15px_rgba(0,0,0,0.1)]">
        {userRole === 'patient' ? (
          [
            { id: 'appointments', icon: Calendar },
            { id: 'history', icon: History },
            { id: 'notifications', icon: Bell },
            { id: 'profile', icon: User },
          ].map(({ id, icon: Icon }) => (
            <button 
              key={id}
              onClick={() => setActiveTab(id as any)} 
              className={`p-2 transition-all relative ${activeTab === id ? 'text-blue-600 scale-110' : 'text-slate-300 hover:text-slate-500'}`}
            >
              <Icon className="w-6 h-6" />
              {activeTab === id && (
                  <motion.div 
                      layoutId="mobileActive" 
                      className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full"
                  />
              )}
            </button>
          ))
        ) : (
          [
            { id: 'admin-dashboard', icon: ShieldCheck },
            { id: 'admin-patients', icon: Users },
          ].map(({ id, icon: Icon }) => (
            <button 
              key={id}
              onClick={() => setActiveTab(id as any)} 
              className={`p-2 transition-all relative ${activeTab === id ? 'text-blue-600 scale-110' : 'text-slate-300 hover:text-slate-500'}`}
            >
              <Icon className="w-6 h-6" />
              {activeTab === id && (
                  <motion.div 
                      layoutId="mobileActive" 
                      className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full"
                  />
              )}
            </button>
          ))
        )}
      </footer>
    </div>
  );
}
