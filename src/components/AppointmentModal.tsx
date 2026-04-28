/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { X, Calendar as CalendarIcon, Clock, User, AlertCircle, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, addDays } from 'date-fns';
import { useState, FormEvent, useEffect } from 'react';
import { Doctor } from '../types';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  doctors: Doctor[];
}

export default function AppointmentModal({ isOpen, onClose, onSave, doctors }: AppointmentModalProps) {
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [notes, setNotes] = useState('');

  // Set initial doctor when doctors list loads
  useEffect(() => {
    if (doctors && doctors.length > 0 && !selectedDoctor) {
      setSelectedDoctor(doctors[0].id);
    }
  }, [doctors, selectedDoctor]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor) {
      alert('Por favor, selecione um especialista.');
      return;
    }
    onSave({
      doctorId: selectedDoctor,
      dateTime: `${selectedDate}T${selectedTime}:00Z`,
      notes,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl relative z-10 border border-slate-200"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-800">Novo Agendamento</h2>
                <p className="text-xs text-slate-500 font-medium tracking-tight">Reserve seu horário com nossos especialistas</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white rounded-lg transition-colors text-slate-400 hover:text-slate-600 border border-transparent hover:border-slate-100 shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Especialista Responsável</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <select 
                      value={selectedDoctor}
                      onChange={(e) => setSelectedDoctor(e.target.value)}
                      className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl appearance-none focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all font-bold text-sm text-slate-700 shadow-sm"
                    >
                      {doctors.length === 0 && <option value="">Carregando especialistas...</option>}
                      {doctors.map(doc => (
                        <option key={doc.id} value={doc.id}>{doc.name} • {doc.specialty}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Data da Consulta</label>
                    <div className="relative group">
                      <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                      <input 
                        type="date" 
                        min={format(new Date(), 'yyyy-MM-dd')}
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all font-bold text-sm text-slate-700 shadow-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Horário Disponível</label>
                    <div className="relative group">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                      <select 
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl appearance-none focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all font-bold text-sm text-slate-700 shadow-sm"
                      >
                        {Array.from({ length: 12 }).map((_, i) => {
                          const hour = 8 + i;
                          const time = `${hour.toString().padStart(2, '0')}:00`;
                          return <option key={time} value={time}>{time} hs</option>;
                        })}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Observações Adicionais</label>
                  <textarea 
                    rows={3}
                    placeholder="Descreva brevemente o motivo da sua visita..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all font-medium text-sm text-slate-600 resize-none shadow-sm placeholder:text-slate-300"
                  />
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <AlertCircle className="w-5 h-5 shrink-0 text-blue-600 mt-0.5" />
                <p className="text-[11px] leading-relaxed text-blue-700 font-medium">
                  Informamos que cancelamentos devem ser realizados com no mínimo 12h de antecedência para evitar taxas administrativas.
                </p>
              </div>

              <button 
                type="submit"
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                Confirmar Agendamento
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
