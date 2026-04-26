/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Calendar, History, Bell, User, Plus, CheckCircle2, XCircle, Clock, ShieldCheck, LogOut, Users, Stethoscope, Search, FileText, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Types
import { Appointment, Patient, AppointmentStatus, UserRole, UserProfile, Doctor } from './types';
import Login from './components/Login';

// Mock Data
const INITIAL_USERS: (Patient | Doctor)[] = [
  {
    id: 'p1',
    name: 'Maria Oliveira',
    email: 'maria.oliveira@email.com',
    role: 'patient',
    phone: '(11) 98765-4321',
    cpf: '123.456.789-00',
    birthDate: '1985-05-20',
    address: 'Rua das Flores, 123 - São Paulo, SP',
    status: 'active',
  },
  {
    id: 'p2',
    name: 'João Silva',
    email: 'joao.silva@email.com',
    role: 'patient',
    phone: '(11) 91234-5678',
    cpf: '987.654.321-00',
    birthDate: '1990-10-15',
    address: 'Av. Paulista, 1000 - São Paulo, SP',
    status: 'active',
  },
  {
    id: 'd1',
    name: 'Dr. Cláudio Santos',
    email: 'claudio.santos@medsync.com',
    role: 'professional',
    phone: '(11) 99999-1111',
    cpf: '111.111.111-11',
    specialty: 'Cardiologia',
    crm: 'CRM-SP 123456',
    address: 'Av. Paulista, 500 - Consultório 10',
    status: 'active',
  }
];

const INITIAL_APPOINTMENTS: Appointment[] = [
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
  {
    id: 'a3',
    patientId: 'p2',
    doctorId: 'd1',
    dateTime: '2026-06-05T10:00:00Z',
    status: 'scheduled',
    notes: 'Primeira consulta de rotina.',
  },
];

import AppointmentModal from './components/AppointmentModal';
import Register from './components/Register';
import AddProfessionalModal from './components/AddProfessionalModal';

type AuthView = 'login' | 'register';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [activeTab, setActiveTab] = useState<string>('appointments');
  const [users, setUsers] = useState<(Patient | Doctor)[]>(INITIAL_USERS);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdminProModalOpen, setIsAdminProModalOpen] = useState(false);

  const handleSaveAppointment = (data: any) => {
    if (!currentUser) return;
    const newAppointment: Appointment = {
      id: Math.random().toString(36).substr(2, 9),
      patientId: userRole === 'patient' ? currentUser.id : data.patientId || 'p1',
      doctorId: userRole === 'professional' ? currentUser.id : data.doctorId,
      dateTime: data.dateTime,
      status: 'scheduled',
      notes: data.notes,
    };
    setAppointments([newAppointment, ...appointments]);
  };

  const handleLogin = (role: UserRole, email?: string) => {
    if (role === 'admin') {
      setUserRole('admin');
      setCurrentUser({ id: 'admin1', name: 'Admin MedSync', email: 'admin@medsync.com', role: 'admin', phone: '', cpf: '', status: 'active' });
      setActiveTab('admin-dashboard');
    } else {
      const user = users.find(u => u.email === email && u.role === role);
      if (user) {
        if (user.role === 'professional' && user.status === 'pending') {
          alert('Seu cadastro profissional está em análise. Por favor, aguarde a aprovação do administrador.');
          return;
        }
        setUserRole(user.role);
        setCurrentUser(user);
        setActiveTab(user.role === 'professional' ? 'prof-dashboard' : 'appointments');
      } else {
        alert('Usuário não encontrado para este perfil. Verifique seu e-mail ou cadastre-se.');
      }
    }
  };

  const handleLogout = () => {
    setUserRole(null);
    setCurrentUser(null);
  };

  const statusMap: Record<AppointmentStatus, string> = {
    scheduled: 'Agendada',
    completed: 'Concluída',
    canceled: 'Cancelada',
    missed: 'Faltou',
  };

  const handleRegister = (data: any, selectedRole: 'patient' | 'professional') => {
    const newUser: Patient | Doctor = {
      id: `${selectedRole === 'patient' ? 'p' : 'd'}${users.length + 1}`,
      role: selectedRole,
      status: selectedRole === 'professional' ? 'pending' : 'active',
      ...data
    } as any;
    setUsers([...users, newUser]);
    setAuthView('login');
    if (selectedRole === 'professional') {
      alert('Cadastro realizado com sucesso! Sua conta profissional está em análise pelo administrador.');
    } else {
      alert('Cadastro realizado com sucesso! Agora você pode fazer login.');
    }
  };

  const handleApprovePro = (id: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: 'active' } : u));
    alert('Profissional aprovado com sucesso!');
  };

  const handleDeleteUser = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
      setUsers(users.filter(u => u.id !== id));
      // Also remove their appointments
      setAppointments(appointments.filter(a => a.patientId !== id && a.doctorId !== id));
      alert('Usuário removido com sucesso!');
    }
  };

  const NavItem = ({ id, icon: Icon, label }: { id: string, icon: any, label: string }) => (
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
    if (authView === 'register') {
      return <Register onBackToLogin={() => setAuthView('login')} onRegister={handleRegister} />;
    }
    return <Login onLogin={handleLogin} onShowRegister={() => setAuthView('register')} />;
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
          {userRole === 'patient' && (
            <>
              <NavItem id="appointments" icon={Calendar} label="Agenda" />
              <NavItem id="history" icon={History} label="Histórico" />
              <NavItem id="profile" icon={User} label="Meu Perfil" />
            </>
          )}
          {userRole === 'professional' && (
            <>
              <NavItem id="prof-dashboard" icon={ShieldCheck} label="Painel Médico" />
              <NavItem id="prof-patients" icon={Users} label="Meus Pacientes" />
            </>
          )}
          {userRole === 'admin' && (
            <>
              <NavItem id="admin-dashboard" icon={ShieldCheck} label="Painel Admin" />
              <NavItem id="admin-users" icon={Users} label="Gestão de Usuários" />
            </>
          )}
        </nav>

        <div className="p-6 border-t border-slate-100">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border shadow-sm ${
              userRole === 'admin' ? 'bg-amber-100' : 
              userRole === 'professional' ? 'bg-purple-100' : 'bg-blue-100'
            }`}>
              {userRole === 'admin' ? <ShieldCheck className="w-5 h-5 text-amber-600" /> : 
               userRole === 'professional' ? <Stethoscope className="w-5 h-5 text-purple-600" /> : 
               <User className="w-5 h-5 text-blue-600" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{currentUser?.name}</p>
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">
                {userRole === 'admin' ? 'Administrador' : userRole === 'professional' ? 'Médico' : 'Paciente'}
              </p>
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
              {activeTab === 'profile' && 'Perfil do Usuário'}
              {activeTab === 'prof-dashboard' && 'Painel de Consultas'}
              {activeTab === 'prof-patients' && 'Meus Pacientes'}
              {activeTab === 'admin-dashboard' && 'Visão Geral da Clínica'}
              {activeTab === 'admin-users' && 'Gestão de Usuários'}
            </h1>
            <p className="text-xs text-slate-500 font-medium tracking-tight">
              {userRole === 'admin' ? 'Área Administrativa' : userRole === 'professional' ? 'Espaço do Médico' : `Bem-vinda de volta, ${currentUser?.name.split(' ')[0]}`}
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

          <AddProfessionalModal 
            isOpen={isAdminProModalOpen}
            onClose={() => setIsAdminProModalOpen(false)}
            onSave={(data) => handleRegister(data, 'professional')}
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
                    <p className="text-3xl font-bold text-slate-800 mt-2">{appointments.filter(a => a.patientId === currentUser?.id && a.status === 'scheduled').length}</p>
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
                    {appointments.filter(a => a.patientId === currentUser?.id && a.status === 'scheduled').map((appointment) => (
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
                    {appointments.filter(a => a.patientId === currentUser?.id && a.status === 'scheduled').length === 0 && (
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
                        <h2 className="font-bold text-xl text-slate-900 tracking-tight">{currentUser?.name}</h2>
                        <div className="flex items-center gap-4 mt-1">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">CPF: {(currentUser as Patient).cpf}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Nascimento: {currentUser && 'birthDate' in currentUser ? format(new Date(currentUser.birthDate), 'dd/MM/yyyy') : ''}</p>
                        </div>
                      </div>
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-blue-700 transition-colors">
                      Baixar Relatório Completo
                    </button>
                  </div>
                  
                  <div className="divide-y divide-slate-100">
                    {appointments.filter(a => a.patientId === currentUser?.id && a.status !== 'scheduled').map((appointment) => (
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
                    {appointments.filter(a => a.patientId === currentUser?.id && a.status !== 'scheduled').length === 0 && (
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
              <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
                 <div className="bg-white rounded-[40px] border border-slate-200 p-12 text-center shadow-xl">
                    <div className="w-24 h-24 bg-slate-50 rounded-3xl mx-auto flex items-center justify-center border-2 border-slate-100 mb-8">
                       <User className="w-12 h-12 text-slate-300" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">{currentUser?.name}</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{userRole}</p>
                    
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                       <div className="p-5 bg-slate-50 rounded-2xl">
                          <p className="text-[9px] font-black text-slate-400 uppercase mb-1">E-mail</p>
                          <p className="text-xs font-bold text-slate-700">{currentUser?.email}</p>
                       </div>
                       <div className="p-5 bg-slate-50 rounded-2xl">
                          <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Telefone</p>
                          <p className="text-xs font-bold text-slate-700">{currentUser?.phone}</p>
                       </div>
                       {userRole === 'professional' && (
                         <>
                            <div className="p-5 bg-purple-50 rounded-2xl">
                               <p className="text-[9px] font-black text-purple-400 uppercase mb-1">Especialidade</p>
                               <p className="text-xs font-bold text-purple-700">{currentUser && 'specialty' in currentUser ? (currentUser as any).specialty : ''}</p>
                            </div>
                            <div className="p-5 bg-purple-50 rounded-2xl">
                               <p className="text-[9px] font-black text-purple-400 uppercase mb-1">CRM</p>
                               <p className="text-xs font-bold text-purple-700">{currentUser && 'crm' in currentUser ? (currentUser as any).crm : ''}</p>
                            </div>
                         </>
                       )}
                    </div>
                 </div>
              </motion.div>
            )}

            {/* PROFESSIONAL DASHBOARD */}
            {userRole === 'professional' && activeTab === 'prof-dashboard' && (
              <motion.div key="prof-dash" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Consultas Hoje</p>
                    <p className="text-3xl font-bold mt-2">4</p>
                  </div>
                  <div className="bg-purple-600 p-6 rounded-2xl text-white">
                    <p className="text-[9px] font-black opacity-70 uppercase tracking-widest text-white">Próxima Consulta</p>
                    <p className="text-xl font-bold mt-2">Maria Oliveira</p>
                    <p className="text-[10px] font-medium opacity-80">Em 15 minutos</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-xs uppercase tracking-widest text-slate-500">Agenda do Dia</h3>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {appointments.filter(a => a.doctorId === currentUser?.id).map(a => {
                      const patient = users.find(u => u.id === a.patientId);
                      return (
                        <div key={a.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-6">
                            <Clock className="w-5 h-5 text-purple-600" />
                            <div>
                              <p className="font-bold text-slate-800 text-sm">{patient?.name}</p>
                              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">{a.notes}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-slate-50">{format(new Date(a.dateTime), 'HH:mm')}</span>
                            <button className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Atender</button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'prof-patients' && (
               <motion.div key="prof-patients" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {users.filter(u => u.role === 'patient').map(u => (
                   <div key={u.id} className="bg-white p-6 rounded-2xl border border-slate-200">
                      <div className="flex items-center gap-4 mb-4">
                         <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><User className="w-5 h-5" /></div>
                         <h4 className="font-bold text-slate-800">{u.name}</h4>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{u.email}</p>
                      <button className="w-full py-2 border border-slate-100 rounded-xl text-[9px] font-black uppercase tracking-widest text-blue-600">Ver Prontuário</button>
                   </div>
                 ))}
               </motion.div>
            )}

            {activeTab === 'admin-users' && (
               <motion.div key="admin-users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                 <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg tracking-tight">Gestão de Usuários</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Aprovação e manutenção da base</p>
                    </div>
                    <button 
                      onClick={() => setIsAdminProModalOpen(true)}
                      className="bg-purple-600 text-white px-5 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-purple-700 transition-all shadow-md shadow-purple-50 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Novo Profissional
                    </button>
                 </div>
                 <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                   <div className="divide-y divide-slate-100">
                    {users.map(u => (
                      <div key={u.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                         <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm ${u.role === 'professional' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                              {u.role === 'professional' ? <Stethoscope className="w-5 h-5" /> : <User className="w-5 h-5" />}
                            </div>
                            <div>
                               <p className="font-bold text-slate-800 text-sm leading-none">{u.name}</p>
                               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">{u.email}</p>
                            </div>
                         </div>
                         <div className="flex items-center justify-between sm:justify-end gap-6">
                            <div className="flex flex-col items-end">
                              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{u.role === 'professional' ? 'Profissional' : 'Paciente'}</span>
                              <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full border mt-1 shadow-sm ${
                                u.status === 'active' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                              }`}>
                                {u.status === 'active' ? 'Ativo' : 'Pendente'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {u.role === 'professional' && u.status === 'pending' && (
                                <button 
                                  onClick={() => handleApprovePro(u.id)}
                                  className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-green-700 transition-all shadow-md shadow-green-100 hover:-translate-y-0.5 active:translate-y-0"
                                >
                                  Aprovar
                                </button>
                              )}
                              <button 
                                onClick={() => handleDeleteUser(u.id)}
                                className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                title="Excluir Usuário"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                         </div>
                      </div>
                    ))}
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
                        {appointments.map(a => {
                          const patient = users.find(u => u.id === a.patientId);
                          return (
                            <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4 font-bold text-slate-700 text-sm">{patient?.name || 'Sistema'}</td>
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
                          );
                        })}
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
                {users.map(user => (
                  <div key={user.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 tracking-tight">{user.name}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ID: #{user.id}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-[11px] font-bold">
                        <span className="text-slate-400 uppercase tracking-widest">E-mail</span>
                        <span className="text-slate-700 truncate max-w-[150px]">{user.email}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] font-bold">
                        <span className="text-slate-400 uppercase tracking-widest">Consultas</span>
                        <span className="text-blue-600">{appointments.filter(a => a.patientId === user.id).length}</span>
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
        {userRole === 'patient' && (
          [
            { id: 'appointments', icon: Calendar },
            { id: 'history', icon: History },
            { id: 'profile', icon: User },
          ].map(({ id, icon: Icon }) => (
            <button 
              key={id}
              onClick={() => setActiveTab(id)} 
              className={`p-2 transition-all relative ${activeTab === id ? 'text-blue-600 scale-110' : 'text-slate-300'}`}
            >
              <Icon className="w-6 h-6" />
            </button>
          ))
        )}
        {userRole === 'professional' && (
          [
            { id: 'prof-dashboard', icon: ShieldCheck },
            { id: 'prof-patients', icon: Users },
            { id: 'profile', icon: User },
          ].map(({ id, icon: Icon }) => (
            <button 
              key={id}
              onClick={() => setActiveTab(id)} 
              className={`p-2 transition-all relative ${activeTab === id ? 'text-blue-600 scale-110' : 'text-slate-300'}`}
            >
              <Icon className="w-6 h-6" />
            </button>
          ))
        )}
        {userRole === 'admin' && (
          [
            { id: 'admin-dashboard', icon: ShieldCheck },
            { id: 'admin-users', icon: Users },
            { id: 'profile', icon: User },
          ].map(({ id, icon: Icon }) => (
            <button 
              key={id}
              onClick={() => setActiveTab(id)} 
              className={`p-2 transition-all relative ${activeTab === id ? 'text-blue-600 scale-110' : 'text-slate-300'}`}
            >
              <Icon className="w-6 h-6" />
            </button>
          ))
        )}
      </footer>
    </div>
  );
}
