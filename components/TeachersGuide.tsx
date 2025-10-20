import React from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';

interface TeachersGuideProps {
  onClose: () => void;
}

const TeachersGuide: React.FC<TeachersGuideProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-800 bg-opacity-60 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-4xl h-[90vh] flex flex-col relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-800 transition z-10" aria-label="Cerrar"><CloseIcon /></button>
        
        <div className="text-center mb-6">
            <BookOpenIcon className="w-12 h-12 mx-auto text-sky-600 mb-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-sky-800">Guía Didáctica: Descubriendo el Orden</h2>
        </div>
        
        <div className="flex-grow overflow-y-auto pr-4 text-slate-700">
            <div className="space-y-6">
                <div>
                    <h3 className="text-2xl font-bold text-rose-700 mb-2">A. ¿Qué es la Clasificación?</h3>
                    <p className="mb-2">La clasificación es una operación mental fundamental que nos permite organizar la información de nuestro entorno. Consiste en reunir objetos por semejanzas y separarlos por diferencias.</p>
                    <p className="mb-2">Para clasificar un grupo de objetos, usted debe reconocer un atributo (una cualidad o propiedad particular) que ciertos objetos tienen en común. La clasificación puede realizarse utilizando un criterio (atributo) o, a medida que la noción se consolida, utilizando dos o más criterios de manera simultánea, como el color, la forma o el tamaño.</p>
                    <p>La clasificación es una de las operaciones lógicas más importantes en el desarrollo del pensamiento lógico-matemático. Cuando clasificamos, estamos definiendo la pertenencia del objeto a una clase e incluso su inclusión en subclases.</p>
                </div>

                <div>
                    <h3 className="text-2xl font-bold text-amber-700 mb-2">B. Bondades y Beneficios de la Clasificación</h3>
                    <p className="mb-3">Las actividades de clasificación son cruciales para el desarrollo del pensamiento matemático infantil. A través de ellas, el niño desarrolla habilidades esenciales:</p>
                    <ol className="list-decimal list-inside space-y-2">
                        <li><strong>Desarrollo del Pensamiento Lógico y Analítico:</strong> Clasificar fomenta el desarrollo de un pensamiento claro y lógico que es la base del buen razonamiento matemático. Requiere observar semejanzas y diferencias, y hacer comparaciones de tamaño, forma, color y detalle.</li>
                        <li><strong>Adquisición de Vocabulario:</strong> Al clasificar, los niños aprenden a usar vocabulario y a pensar en términos de categorías, lo cual favorece la comprensión y la interiorización de los conceptos. Es fundamental describir los atributos con palabras, nombrando los grupos formados.</li>
                        <li><strong>Habilidades Operativas:</strong> La clasificación ayuda a desarrollar la capacidad de agrupar o clasificar espontáneamente atributos en el mundo real. También promueve habilidades como la resolución de problemas al identificar patrones.</li>
                        <li><strong>Aprendizaje Significativo:</strong> Estas nociones se construyen de manera paulatina y significativa si el niño experimenta, manipula y explora directamente los objetos de su entorno.</li>
                    </ol>
                </div>
                
                <div>
                    <h3 className="text-2xl font-bold text-green-700 mb-2">C. La Clasificación como Base del Concepto de Número</h3>
                    <p className="mb-2">La clasificación es una noción prenumérica indispensable para la adquisición del concepto de número. El desarrollo adecuado de la clasificación, junto con la seriación y la correspondencia, es fundamental para que el niño pueda apropiarse del concepto de número.</p>
                    <p className="mb-3">Se espera que, mediante el desarrollo de la clasificación, el niño logre consolidar dos aspectos clave para la matemática futura:</p>
                     <ol className="list-decimal list-inside space-y-2">
                        <li><strong>La Lógica de Clases (Inclusión):</strong> Para construir el concepto de número, el niño debe alcanzar la relación de inclusión de clases. Esto significa que, por ejemplo, debe comprender que el número "1" está incluido en el "2", el "2" en el "3", y así sucesivamente. También debe entender que una clase (ej. "flores") tiene más elementos que una subclase (ej. "rosas").</li>
                        <li><strong>La Estructura Lógica para Razonar:</strong> Si el niño no logra construir las nociones de clasificación y seriación en la etapa preescolar, es probable que más adelante, al resolver problemas, deba elaborar procedimientos para cada uno de ellos sin utilizar el razonamiento lógico, recurriendo en cambio al uso intensivo de la memoria. La clasificación, al ser parte de las operaciones concretas del pensamiento, prepara al niño para que posteriormente pueda operar con números.</li>
                    </ol>
                    <p className="mt-4 bg-sky-50 p-3 rounded-lg border border-sky-200">En resumen, la clasificación sienta las bases para que el niño pueda establecer las relaciones no observables (la cantidad abstracta) entre los objetos, facilitando que el número sea comprendido como una cantidad y no solo como un "nombre" dado al último objeto contado.</p>
                </div>
            </div>
        </div>

      </div>
      <style>{`@keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }`}</style>
    </div>
  );
};

export default TeachersGuide;
