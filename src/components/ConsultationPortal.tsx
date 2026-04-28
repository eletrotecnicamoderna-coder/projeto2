import React, { useState, useEffect } from 'react';
import { FileText, Clipboard, Upload, Download, Trash2, X, Check, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreService';
import { Appointment, Patient, UserProfile, MedicalDocument, MedicalDocumentType, UserRole } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ConsultationPortalProps {
  appointment: Appointment;
  patient: Patient | UserProfile | null;
  userRole: UserRole | null;
  onClose: () => void;
  onComplete: () => void;
  onViewFullHistory: () => void;
}

const ConsultationPortal: React.FC<ConsultationPortalProps> = ({ appointment, patient, userRole, onClose, onComplete, onViewFullHistory }) => {
  const [activeSegment, setActiveSegment] = useState<'record' | 'prescription' | 'exams'>('record');
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form states
  const [recordText, setRecordText] = useState('');
  const [prescriptionText, setPrescriptionText] = useState('');
  const [examTitle, setExamTitle] = useState('');
  const [examUrl, setExamUrl] = useState('');

  useEffect(() => {
    if (!appointment.id || !auth.currentUser) return;

    // To satisfy Firestore security rules for list operations, 
    // non-admins MUST include an explicit ownership filter (allowedViewerIds).
    const isAdmin = userRole === 'admin' || auth.currentUser?.email === 'eletrotecnicamoderna@gmail.com';
    let q = query(
      collection(db, 'medical_documents'), 
      where('appointmentId', '==', appointment.id)
    );

    if (!isAdmin) {
      q = query(q, where('allowedViewerIds', 'array-contains', auth.currentUser.uid));
    }

    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as MedicalDocument[];
      setDocuments(docs);
      
      // Auto-fill form if existing
      const record = docs.find(d => d.type === 'clinical_record');
      if (record) setRecordText(record.content || '');
      
      const prescription = docs.find(d => d.type === 'prescription');
      if (prescription) setPrescriptionText(prescription.content || '');
    }, (error) => {
      // If we get a permission error on the broad query, it might be because the rules require 
      // an explicit authorship filter for non-admins. 
      handleFirestoreError(error, OperationType.LIST, 'medical_documents');
    });

    return () => unsub();
  }, [appointment.id, appointment.patientId, auth.currentUser?.uid]);

  const handleSaveDocument = async (type: MedicalDocumentType, title: string, content?: string, fileUrl?: string, fileName?: string) => {
    setIsLoading(true);
    try {
      // For records and prescriptions, we update if exists, or create new
      const existing = documents.find(d => d.type === type);
      const docId = existing ? existing.id : Math.random().toString(36).substr(2, 9);
      
      const allowedViewerIds = [appointment.patientId];
      if (appointment.doctorId && appointment.doctorId !== 'external') {
        allowedViewerIds.push(appointment.doctorId);
      }

      const newDoc: MedicalDocument = {
        id: docId,
        appointmentId: appointment.id,
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        allowedViewerIds,
        type,
        title,
        content: content || '',
        fileUrl: fileUrl || '',
        fileName: fileName || '',
        createdAt: existing ? existing.createdAt : new Date().toISOString()
      };

      await setDoc(doc(db, 'medical_documents', docId), newDoc);
      
      // Also update the appointment fields for legacy/easier access
      if (type === 'clinical_record') {
        await updateDoc(doc(db, 'appointments', appointment.id), { diagnosis: content });
      } else if (type === 'prescription') {
        await updateDoc(doc(db, 'appointments', appointment.id), { prescription: content });
      }

    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'medical_documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteConsultation = async () => {
    if (window.confirm('Deseja concluir esta consulta?')) {
      setIsLoading(true);
      try {
        // Auto-save current states before completing
        if (recordText) {
          await handleSaveDocument('clinical_record', 'Prontuário da Consulta', recordText);
        }
        if (prescriptionText) {
          await handleSaveDocument('prescription', 'Receita Médica', prescriptionText);
        }
        
        await updateDoc(doc(db, 'appointments', appointment.id), { status: 'completed' });

        // Notificar o paciente
        const notifId = Math.random().toString(36).substr(2, 9);
        await setDoc(doc(db, 'notifications', notifId), {
          id: notifId,
          userId: appointment.patientId,
          title: 'Consulta Concluída',
          message: 'Sua consulta foi finalizada com sucesso. Você já pode visualizar o prontuário no seu histórico.',
          date: new Date().toISOString(),
          isNew: true
        });

        onComplete();
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `appointments/${appointment.id}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este documento?')) {
      try {
        await deleteDoc(doc(db, 'medical_documents', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `medical_documents/${id}`);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-5xl h-[85vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-100">
               <FileText className="w-6 h-6" />
             </div>
             <div>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">Atendimento Clínico</h2>
                <p className="text-xs text-slate-500 font-medium">Paciente: <span className="font-bold text-slate-700">{patient?.name}</span> • #{appointment.id}</p>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <button 
              onClick={handleCompleteConsultation}
              className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-green-700 transition-all flex items-center gap-2"
             >
               <Check className="w-4 h-4" />
               Concluir Consulta
             </button>
             <button onClick={onClose} className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
               <X className="w-6 h-6" />
             </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-64 border-r border-slate-100 p-4 space-y-2 bg-slate-50/30">
            <button 
              onClick={() => setActiveSegment('record')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold transition-all text-sm ${activeSegment === 'record' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:bg-white hover:text-slate-800'}`}
            >
              <Clipboard className="w-5 h-5" />
              Prontuário
            </button>
            <button 
              onClick={() => setActiveSegment('prescription')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold transition-all text-sm ${activeSegment === 'prescription' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:bg-white hover:text-slate-800'}`}
            >
              <FileText className="w-5 h-5" />
              Receita Médica
            </button>
            <button 
              onClick={() => setActiveSegment('exams')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold transition-all text-sm ${activeSegment === 'exams' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:bg-white hover:text-slate-800'}`}
            >
              <Upload className="w-5 h-5" />
              Exames / Docs
            </button>
            <div className="pt-4 mt-4 border-t border-slate-100">
               <button 
                onClick={onViewFullHistory}
                className="w-full flex items-center gap-3 p-3 rounded-xl font-bold transition-all text-sm text-slate-500 hover:bg-white hover:text-blue-600 hover:shadow-sm"
               >
                 <Clipboard className="w-5 h-5" />
                 Histórico Completo
               </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-8">
            <AnimatePresence mode="wait">
              {activeSegment === 'record' && (
                <motion.div
                  key="record"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-6 h-full flex flex-col"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-slate-800 text-lg">Evolução Clínica</h3>
                    <button 
                      onClick={() => handleSaveDocument('clinical_record', 'Prontuário da Consulta', recordText)}
                      disabled={isLoading}
                      className="text-blue-600 flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:underline"
                    >
                      <Save className="w-4 h-4" />
                      {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                  </div>
                  <textarea 
                    value={recordText}
                    onChange={(e) => setRecordText(e.target.value)}
                    placeholder="Descreva aqui o estado clínico do paciente, sintomas, anamnese e conduta..."
                    className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 text-slate-700 font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none resize-none"
                  />
                </motion.div>
              )}

              {activeSegment === 'prescription' && (
                <motion.div
                  key="prescription"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-6 h-full flex flex-col"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-slate-800 text-lg">Receituário</h3>
                    <button 
                      onClick={() => handleSaveDocument('prescription', 'Receita Médica', prescriptionText)}
                      disabled={isLoading}
                      className="text-blue-600 flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:underline"
                    >
                      <Save className="w-4 h-4" />
                      {isLoading ? 'Salvando...' : 'Gerar Receita'}
                    </button>
                  </div>
                  <div className="bg-blue-50/30 border-2 border-dashed border-blue-100 rounded-3xl p-8 flex flex-col flex-1">
                    <textarea 
                      value={prescriptionText}
                      onChange={(e) => setPrescriptionText(e.target.value)}
                      placeholder="Liste as medicações, dosagens e orientações de uso..."
                      className="flex-1 w-full bg-transparent p-0 text-slate-700 font-bold text-lg placeholder:text-slate-300 outline-none resize-none"
                    />
                    <div className="border-t border-blue-100 pt-6 mt-6 flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Paciente</p>
                        <p className="font-bold text-slate-800">{patient?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</p>
                        <p className="font-bold text-slate-800">{format(new Date(), 'dd/MM/yyyy')}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSegment === 'exams' && (
                <motion.div
                  key="exams"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-8"
                >
                  <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8">
                    <h3 className="font-bold text-slate-800 text-lg mb-6">Anexar Documento / Exame</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Título do Documento</label>
                        <input 
                          type="text"
                          value={examTitle}
                          onChange={(e) => setExamTitle(e.target.value)}
                          placeholder="Ex: Hemograma Completo"
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold shadow-sm focus:ring-2 focus:ring-blue-100 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Link do Arquivo (Mock Up)</label>
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            value={examUrl}
                            onChange={(e) => setExamUrl(e.target.value)}
                            placeholder="https://..."
                            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold shadow-sm focus:ring-2 focus:ring-blue-100 outline-none"
                          />
                          <button 
                            onClick={async () => {
                              if (!examTitle || !examUrl) {
                                alert('Preencha o título e o link do documento.');
                                return;
                              }
                              await handleSaveDocument('exam', examTitle, '', examUrl, examTitle + '.pdf');
                              setExamTitle('');
                              setExamUrl('');
                            }}
                            className="bg-blue-600 text-white px-6 rounded-xl font-bold text-xs uppercase"
                          >
                            Anexar
                          </button>
                        </div>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-4 leading-relaxed italic">NOTA: Em ambiente de demonstração, utilize um link de arquivo público ou imagem. No sistema real, utilize o Firebase Storage.</p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-xs uppercase tracking-widest text-slate-500">Documentos Anexados</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {documents.filter(d => d.type === 'exam').map(doc => (
                        <div key={doc.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 text-sm tracking-tight">{doc.title}</p>
                              <p className="text-[10px] text-slate-400 uppercase font-black">{format(new Date(doc.createdAt), 'dd/MM/yyyy HH:mm')}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                             <a 
                              href={doc.fileUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                             >
                               <Download className="w-4 h-4" />
                             </a>
                             <button 
                              onClick={() => handleDeleteDocument(doc.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                             >
                               <Trash2 className="w-4 h-4" />
                             </button>
                          </div>
                        </div>
                      ))}
                      {documents.filter(d => d.type === 'exam').length === 0 && (
                        <div className="col-span-full p-12 text-center text-slate-300 italic border-2 border-dashed border-slate-100 rounded-3xl">
                          Nenhum documento anexado ainda.
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Info */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 px-8 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sessão Ativa: {format(new Date(), 'HH:mm')}</span>
            </div>
            <p className="text-[10px] font-bold text-slate-400">Todos os dados são salvos em tempo real no prontuário eletrônico.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default ConsultationPortal;
