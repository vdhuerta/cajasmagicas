import React from 'react';
import { ReinforcementPlan } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { DocumentReportIcon } from './icons/DocumentReportIcon';
import { DownloadIcon } from './icons/DownloadIcon';

interface ReinforcementPlanModalProps {
  plan: ReinforcementPlan | null;
  onClose: () => void;
}

const PrintIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6 18.25m.72-4.421c.168.354.36.69.59 1.006m-.59-1.006A9.753 9.753 0 0112 12c1.453 0 2.848.358 4.098.986m-4.098-.986c.23.316.422.662.59 1.006m0 0l2.062 4.382m-2.062-4.382L12 18.25m0 0l2.062 4.382M12 18.25l-2.062 4.382m2.062 4.382L12 12m0 0L9.938 7.618m2.062 4.382L14.062 7.618m.002 10.632L12 12m0 0l2.062-4.382M12 12l-2.062-4.382" />
    </svg>
);


const ReinforcementPlanModal: React.FC<ReinforcementPlanModalProps> = ({ plan, onClose }) => {
    
    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        if (!plan) return;

        const filename = `Plan_de_Refuerzo_${plan.studentName.replace(/ /g, '_')}.html`;
        
        const styles = `
            @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700&display=swap');
            body { 
                font-family: 'Nunito', sans-serif;
                background-color: #f1f5f9;
                color: #1e293b;
                margin: 0;
                padding: 2rem;
            }
            .report-container {
                max-width: 800px;
                margin: auto;
                background-color: white;
                border-radius: 0.5rem;
                box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
                padding: 2rem;
            }
            h1, h2, h3 { font-weight: 700; }
            h1 { font-size: 1.5rem; text-align: center; color: #0f172a; }
            h2 { font-size: 1.25rem; color: #0369a1; margin-top: 1.5rem; margin-bottom: 0.75rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem; }
            h3 { font-size: 1.125rem; color: #be123c; margin-top: 1rem; margin-bottom: 0.5rem; }
            p, li { line-height: 1.6; color: #334155; }
            ul { list-style-position: inside; padding-left: 0; }
            li { margin-bottom: 0.5rem; }
            strong { font-weight: 700; color: #1e293b; }
            em { font-style: italic; color: #475569; }
            .header-info { display: flex; justify-content: space-between; font-size: 0.875rem; color: #475569; margin-top: 0.5rem; margin-bottom: 1rem; }
            .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
            .summary-item { padding: 1rem; border-radius: 0.5rem; }
            .summary-item strong { display: block; margin-bottom: 0.25rem; font-size: 0.875rem; color: inherit; }
            .bg-sky-50 { background-color: #f0f9ff; color: #0c4a6e; }
            .bg-green-50 { background-color: #f0fdf4; color: #14532d; }
            .bg-amber-50 { background-color: #fffbeb; color: #78350f; }
            .bg-purple-50 { background-color: #faf5ff; color: #581c87; }
            .progress-container { display: flex; align-items: center; gap: 0.5rem; margin-top: 0.25rem; }
            .progress-bar-bg { width: 100%; background-color: #e9d5ff; border-radius: 9999px; height: 0.625rem; }
            .progress-bar { background-color: #9333ea; height: 0.625rem; border-radius: 9999px; }
            .diagnosis-box { background-color: #f8fafc; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem; border-left: 4px solid #0284c7; }
            .focus-area { color: #be123c; font-weight: 700; margin-top: 0.75rem; }
            .conclusion { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; font-size: 0.875rem; color: #475569; }
        `;

        const htmlContent = `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${filename.replace('.html', '')}</title>
                <style>${styles}</style>
            </head>
            <body>
                <div class="report-container">
                    <h1>Informe de Desempeño y Plan de Refuerzo</h1>
                    <div class="header-info">
                        <span><strong>Estudiante:</strong> ${plan.studentName}</span>
                        <span><strong>Fecha:</strong> ${plan.date}</span>
                    </div>
                    <h2>1. Resumen de Desempeño</h2>
                    <div class="summary-grid">
                        <div class="summary-item bg-sky-50"><strong>Sesiones Analizadas</strong>${plan.summary.totalSessions}</div>
                        <div class="summary-item bg-green-50"><strong>Precisión (Clasif.)</strong>${plan.summary.accuracy}%</div>
                        <div class="summary-item bg-amber-50"><strong>Tiempo Promedio</strong>${plan.summary.avgTimePerTask}</div>
                        <div class="summary-item bg-purple-50">
                            <strong>Progreso General</strong>
                            <div class="progress-container">
                                <span style="font-weight: 700;">${plan.summary.overallProgress}%</span>
                                <div class="progress-bar-bg">
                                    <div class="progress-bar" style="width: ${plan.summary.overallProgress}%;"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p><strong>Dificultad Principal Observada:</strong> ${plan.summary.mainDifficulty}</p>
                    <h2>2. Diagnóstico Pedagógico</h2>
                    <div class="diagnosis-box">
                        <p><strong>Categoría:</strong> ${plan.category}</p>
                        <p style="margin-top: 0.5rem;">${plan.categoryDescription}</p>
                        <p class="focus-area">Área de Enfoque Principal: ${plan.focusArea}</p>
                    </div>
                    <h2>3. Plan de Refuerzo</h2>
                    <h3>A. Contexto Matemático (El "Porqué")</h3>
                    <ul>${plan.context.matematico.map(p => `<li>${p}</li>`).join('')}</ul>
                    <h3>B. Estrategias Didácticas Sugeridas (El "Cómo")</h3>
                    <div style="margin-top: 1rem;">
                        <strong>Estrategias Basadas en el Diálogo:</strong>
                        <ul>${plan.context.didactico.dialogo.map(item => `<li><strong>${item.title}:</strong> <em>${item.example}</em></li>`).join('')}</ul>
                    </div>
                    <div style="margin-top: 1rem;">
                        <strong>Actividades Manipulativas (Fuera de Pantalla):</strong>
                        <ul>${plan.context.didactico.manipulativas.map(item => `<li><strong>${item.title}:</strong> ${item.description}</li>`).join('')}</ul>
                    </div>
                    <div style="margin-top: 1rem;">
                        <strong>Integración en Rutinas Diarias:</strong>
                        <ul>${plan.context.didactico.rutinas.map(item => `<li><strong>${item.title}:</strong> <em>${item.example}</em></li>`).join('')}</ul>
                    </div>
                    <h2>4. Indicadores de Avance a Observar</h2>
                    <ul>${plan.indicators.map(p => `<li>${p}</li>`).join('')}</ul>
                    <div class="conclusion">
                        <p><strong>Conclusión:</strong> ${plan.conclusion}</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (!plan) {
        return (
             <div className="fixed inset-0 bg-slate-800 bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
                <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
                    <h3 className="text-2xl font-bold text-sky-800 mb-4">Datos Insuficientes</h3>
                    <p className="text-slate-600 mb-6">No hay suficientes datos de juego para generar un informe. ¡Juega algunas partidas más y vuelve a intentarlo!</p>
                    <button onClick={onClose} className="px-6 py-2 bg-sky-500 text-white font-bold rounded-lg shadow-md hover:bg-sky-600">Entendido</button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="fixed inset-0 bg-slate-800 bg-opacity-60 flex items-center justify-center z-50 p-4 printable-area">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col relative animate-fade-in-up">
                <div className="p-6 border-b border-slate-200 print:hidden">
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-800 transition z-10 rounded-full hover:bg-slate-200" aria-label="Cerrar">
                        <CloseIcon className="w-7 h-7"/>
                    </button>
                    <div className="flex items-center justify-between pr-16">
                        <div className="flex items-center gap-3">
                            <DocumentReportIcon className="w-10 h-10 text-sky-600" />
                            <div>
                                <h2 className="text-2xl font-bold text-sky-800">Plan de Refuerzo Pedagógico</h2>
                                <p className="text-slate-500">Informe de desempeño generado desde Cajas Mágicas</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition">
                                <DownloadIcon className="w-5 h-5" />
                                Descargar
                            </button>
                            <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white font-semibold rounded-lg shadow-md hover:bg-sky-600 transition">
                                <PrintIcon className="w-5 h-5" />
                                Imprimir
                            </button>
                        </div>
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
                     <p className="mb-6"><strong className="font-semibold">Dificultad Principal Observada:</strong> {plan.summary.mainDifficulty}</p>

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
                                {plan.context.didactico.dialogo.map((item, i) => <li key={i}><strong>{item.title}:</strong> <em>{item.example}</em></li>)}
                            </ul>
                        </div>
                        <div>
                            <strong>Actividades Manipulativas (Fuera de Pantalla):</strong>
                             <ul className="list-[circle] list-inside ml-4 mt-1 space-y-2 text-sm">
                                {plan.context.didactico.manipulativas.map((item, i) => <li key={i}><strong>{item.title}:</strong> {item.description}</li>)}
                            </ul>
                        </div>
                         <div>
                            <strong>Integración en Rutinas Diarias:</strong>
                             <ul className="list-[circle] list-inside ml-4 mt-1 space-y-2 text-sm">
                                {plan.context.didactico.rutinas.map((item, i) => <li key={i}><strong>{item.title}:</strong> <em>{item.example}</em></li>)}
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