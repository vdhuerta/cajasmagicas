import React from 'react';
import { ReinforcementPlan } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { DocumentReportIcon } from './icons/DocumentReportIcon';

interface ReinforcementPlanModalProps {
  plan: ReinforcementPlan | null;
  onClose: () => void;
}

const PrintIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6 18.25m.72-4.421c.168.354.36.69.59 1.006m-.59-1.006A9.753 9.753 0 0112 12c1.453 0 2.848.358 4.098.986m-4.098-.986c.23.316.422.662.59 1.006m0 0l2.062 4.382m-2.062-4.382L12 18.25m0 0l2.062 4.382M12 18.25l-2.062 4.382m2.062 4.382L12 12m0 0L9.938 7.618m2.062 4.382L14.062 7.618m.002 10.632L12 12m0 0l2.062-4.382M12 12l-2.062-4.382" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75l-2.489-2.489m0 0a3.375 3.375 0 10-4.773-4.773 3.375 3.375 0 004.774 4.774zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


const ReinforcementPlanModal: React.FC<ReinforcementPlanModalProps> = ({ plan, onClose }) => {
    
    const handlePrint = () => {
        window.print();
    };

    if (!plan) {
        // This case is handled by the alert in App.tsx, but as a fallback:
        return (
             <div className="fixed inset-0 bg-slate-800 bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
                <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
                    <h3 className="text-2xl font-bold text-sky-800 mb-4">Datos Insuficientes</h3>
                    <p className="text-slate-600 mb-6">No hay suficientes datos de juego para generar un informe. ¡Juega algunas partidas más en los Bloques Lógicos y vuelve a intentarlo!</p>
                    <button onClick={onClose} className="px-6 py-2 bg-sky-500 text-white font-bold rounded-lg shadow-md hover:bg-sky-600">Entendido</button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="fixed inset-0 bg-slate-800 bg-opacity-60 flex items-center justify-center z-50 p-4 printable-area">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col relative animate-fade-in-up">
                <div className="p-6 border-b border-slate-200 print:hidden">
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-800 transition z-10" aria-label="Cerrar"><CloseIcon /></button>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <DocumentReportIcon className="w-10 h-10 text-sky-600" />
                            <div>
                                <h2 className="text-2xl font-bold text-sky-800">Plan de Refuerzo Pedagógico</h2>
                                <p className="text-slate-500">Informe de desempeño generado a partir de la app Cajas Mágicas</p>
                            </div>
                        </div>
                        <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white font-semibold rounded-lg shadow-md hover:bg-sky-600 transition">
                            <PrintIcon className="w-5 h-5" />
                            Imprimir
                        </button>
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto p-8 text-slate-800 report-content">
                    <div className="mb-6 pb-4 border-b">
                        <h1 className="text-2xl font-bold text-center">Informe de Desempeño y Plan de Refuerzo</h1>
                        <div className="flex justify-between text-sm text-slate-600 mt-2">
                            <span><strong>Estudiante:</strong> {plan.studentName}</span>
                            <span><strong>Fecha:</strong> {plan.date}</span>
                        </div>
                    </div>

                    <h2 className="text-xl font-bold text-sky-700 mb-3">1. Resumen de Desempeño</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-sky-50 p-4 rounded-lg"><strong className="block">Sesiones Analizadas</strong>{plan.summary.totalSessions}</div>
                        <div className="bg-green-50 p-4 rounded-lg"><strong className="block">Precisión (Clasif.)</strong>{plan.summary.accuracy}%</div>
                        <div className="bg-amber-50 p-4 rounded-lg"><strong className="block">Tiempo Promedio</strong>{plan.summary.avgTimePerTask}</div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <strong className="block">Progreso General</strong>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="font-bold text-purple-700">{plan.summary.overallProgress}%</span>
                                <div className="w-full bg-purple-200 rounded-full h-2.5">
                                    <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${plan.summary.overallProgress}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                     <p className="mb-6"><strong className="font-semibold">Dificultad Principal Observada (en Clasificación):</strong> {plan.summary.mainDifficulty}</p>

                    <h2 className="text-xl font-bold text-sky-700 mb-3">2. Diagnóstico Pedagógico</h2>
                    <div className="bg-slate-50 p-4 rounded-lg mb-6">
                        <p className="font-bold">Categoría: <span className="font-normal">{plan.category}</span></p>
                        <p className="mt-2">{plan.categoryDescription}</p>
                        <p className="mt-3 font-semibold text-rose-700">Área de Enfoque Principal: {plan.focusArea}</p>
                    </div>

                    <h2 className="text-xl font-bold text-sky-700 mb-3">3. Plan de Refuerzo</h2>
                    
                    <h3 className="font-bold text-lg text-rose-600 mb-2">A. Contexto Matemático (El "Porqué")</h3>
                    <ul className="list-disc list-inside space-y-2 mb-6">
                        {plan.context.matematico.map((point, i) => <li key={i}>{point}</li>)}
                    </ul>

                    <h3 className="font-bold text-lg text-rose-600 mb-2">B. Estrategias Didácticas Sugeridas (El "Cómo")</h3>
                    <div className="space-y-4 mb-6">
                        <div>
                            <strong>Estrategias Basadas en el Diálogo:</strong>
                            <ul className="list-[circle] list-inside ml-4 mt-1 space-y-2 text-sm">
                                {plan.context.didactico.dialogo.map((item, i) => <li key={i}><strong>{item.title}</strong> <em>{item.example}</em></li>)}
                            </ul>
                        </div>
                        <div>
                            <strong>Actividades Manipulativas (Fuera de Pantalla):</strong>
                             <ul className="list-[circle] list-inside ml-4 mt-1 space-y-2 text-sm">
                                {plan.context.didactico.manipulativas.map((item, i) => <li key={i}><strong>{item.title}</strong> {item.description}</li>)}
                            </ul>
                        </div>
                         <div>
                            <strong>Integración en Rutinas Diarias:</strong>
                             <ul className="list-[circle] list-inside ml-4 mt-1 space-y-2 text-sm">
                                {plan.context.didactico.rutinas.map((item, i) => <li key={i}><strong>{item.title}</strong> <em>{item.example}</em></li>)}
                            </ul>
                        </div>
                    </div>

                    <h2 className="text-xl font-bold text-sky-700 mb-3">4. Indicadores de Avance a Observar</h2>
                     <ul className="list-disc list-inside space-y-2 mb-6">
                        {plan.indicators.map((point, i) => <li key={i}>{point}</li>)}
                    </ul>

                    <div className="mt-8 pt-4 border-t">
                        <p className="text-sm text-slate-600"><strong>Conclusión:</strong> {plan.conclusion}</p>
                    </div>

                </div>
            </div>
             <style>{`
                @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } 
                .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
                @media print {
                    body * { visibility: hidden; }
                    .printable-area, .printable-area * { visibility: visible; }
                    .printable-area { position: absolute; left: 0; top: 0; width: 100%; height: auto; padding: 0; margin: 0; }
                    .report-content {
                        overflow-y: visible;
                        height: auto;
                    }
                    .print-hidden, .print-hidden * { display: none !important; }
                }
             `}</style>
        </div>
    );
};

export default ReinforcementPlanModal;