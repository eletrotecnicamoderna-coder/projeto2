import React, { useState, useEffect } from 'react';
import { FileText, Clipboard, Download, X, Eye, Calendar as CalendarIcon, Upload } from 'lucide-react';
import { motion } from 'motion/react';
import { 
  collection, 
  onSnapshot, 
  query, 
  where,
  getDocs,
  setDoc,
  doc
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreService';
import { Appointment, MedicalDocument, UserRole } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MedicalHistoryModalProps {
  appointment: Appointment;
  userRole: UserRole | null;
  onClose: () => void;
}

const MedicalHistoryModal: React.FC<MedicalHistoryModalProps> = ({ appointment, userRole, onClose }) => {
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
    }, (error) => {
      setLoading(false);
      handleFirestoreError(error, OperationType.LIST, 'medical_documents');
    });

    return () => unsub();
  }, [appointment.id, auth.currentUser?.uid]);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[70] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[40px] shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-6">
             <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm">
               <Clipboard className="w-7 h-7" />
             </div>
             <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {appointment.doctorId === 'external' ? 'Meus Exames Externos' : 'Registro de Consulta'}
                </h2>
                <div className="flex items-center gap-3 mt-1.5">
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{appointment.doctorId === 'external' ? 'Documentos enviados por você' : format(new Date(appointment.dateTime), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                   <div className="w-1 h-1 rounded-full bg-slate-200" />
                   <p className="text-[10px] text-blue-600 font-black uppercase tracking-[0.2em]">Cód: #{appointment.id}</p>
                </div>
             </div>
          </div>
          <button onClick={onClose} className="p-3 text-slate-400 hover:text-slate-600 hover:bg-white hover:shadow-sm rounded-2xl transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-12">
          {appointment.doctorId === 'external' && (
            <div className="bg-blue-50/30 border border-blue-200 rounded-3xl p-8">
               <h3 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-3">
                 <Upload className="w-5 h-5 text-blue-600" />
                 Enviar Novo Exame
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    id="extTitle"
                    type="text" 
                    placeholder="Título (ex: Raio-X Tórax)" 
                    className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold shadow-sm focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                  <div className="flex gap-2">
                    <input 
                      id="extUrl"
                      type="text" 
                      placeholder="Link do Arquivo (Mock Up)" 
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold shadow-sm focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                    <button 
                      onClick={async () => {
                        const titleEl = document.getElementById('extTitle') as HTMLInputElement;
                        const urlEl = document.getElementById('extUrl') as HTMLInputElement;
                        if (!titleEl.value || !urlEl.value) return alert('Preencha título e link');
                        
                        try {
                          const docId = Math.random().toString(36).substr(2, 9);
                          const allowedViewerIds = [appointment.patientId];
                          if (appointment.doctorId && appointment.doctorId !== 'external') {
                            allowedViewerIds.push(appointment.doctorId);
                          }

                          await setDoc(doc(db, 'medical_documents', docId), {
                            id: docId,
                            appointmentId: appointment.id,
                            patientId: appointment.patientId,
                            doctorId: 'external',
                            allowedViewerIds,
                            type: 'exam',
                            title: titleEl.value,
                            content: '',
                            fileUrl: urlEl.value,
                            fileName: titleEl.value + '.pdf',
                            createdAt: new Date().toISOString()
                          });
                          titleEl.value = '';
                          urlEl.value = '';
                        } catch (error) {
                          handleFirestoreError(error, OperationType.WRITE, 'medical_documents');
                        }
                      }}
                      className="bg-blue-600 text-white px-6 rounded-xl font-bold text-xs uppercase shadow-lg shadow-blue-100"
                    >
                      Anexar
                    </button>
                  </div>
               </div>
            </div>
          )}

          {loading ? (
             <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
             </div>
          ) : (
            <>
              {/* Clinical Note section */}
              {documents.find(d => d.type === 'clinical_record') && (
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                    <h3 className="font-bold text-slate-800 text-lg uppercase tracking-tight">Parecer Médico</h3>
                  </div>
                  <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 text-slate-700 leading-relaxed font-medium whitespace-pre-wrap italic">
                    "{documents.find(d => d.type === 'clinical_record')?.content}"
                  </div>
                </section>
              )}

              {/* Prescription section */}
              {documents.find(d => d.type === 'prescription') && (
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-6 bg-purple-600 rounded-full" />
                    <h3 className="font-bold text-slate-800 text-lg uppercase tracking-tight">Receita / Tratamento</h3>
                  </div>
                  <div className="bg-purple-50/30 p-8 rounded-[32px] border-2 border-purple-100/50 shadow-sm">
                    <div className="font-mono text-purple-900 leading-relaxed whitespace-pre-wrap">
                      {documents.find(d => d.type === 'prescription')?.content}
                    </div>
                    <div className="mt-8 pt-6 border-t border-purple-100 flex justify-between items-center opacity-40">
                       <p className="text-[10px] font-black uppercase tracking-widest">Documento Assinado Digitalmente</p>
                       <p className="text-[10px] font-black uppercase tracking-widest">{format(new Date(appointment.dateTime), 'dd/MM/yyyy')}</p>
                    </div>
                  </div>
                </section>
              )}

              {/* Exams section */}
              {documents.filter(d => d.type === 'exam').length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
                    <h3 className="font-bold text-slate-800 text-lg uppercase tracking-tight">Exames e Documentos</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {documents.filter(d => d.type === 'exam').map(doc => (
                      <div key={doc.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors border border-slate-100 group-hover:border-blue-100">
                            <FileText className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm tracking-tight">{doc.title}</p>
                            <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">{doc.fileName}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <a 
                            href={doc.fileUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="w-10 h-10 bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white rounded-xl transition-all flex items-center justify-center border border-slate-100"
                           >
                             <Eye className="w-4 h-4" />
                           </a>
                           <a 
                            href={doc.fileUrl} 
                            download 
                            className="w-10 h-10 bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white rounded-xl transition-all flex items-center justify-center border border-slate-100"
                           >
                             <Download className="w-4 h-4" />
                           </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {documents.length === 0 && (
                <div className="py-20 text-center text-slate-300">
                   <FileText className="w-16 h-16 mx-auto mb-4 opacity-5" />
                   <p className="font-bold text-xs uppercase tracking-[0.2em]">Nenhum documento anexado a esta consulta.</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">MedSync System • Prontuário Integrado</p>
        </div>
      </motion.div>
    </div>
  );
};

export default MedicalHistoryModal;
