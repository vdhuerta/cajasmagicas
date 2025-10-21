import React, { useState } from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';

interface TeachersGuideProps {
  onClose: () => void;
}

type ActiveTab = 'clasificacion' | 'seriacion' | 'conservacion';

const TeachersGuide: React.FC<TeachersGuideProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('clasificacion');

  const renderContent = () => {
    switch (activeTab) {
      case 'clasificacion':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-rose-700 mb-2">A. ¿Qué es la Clasificación?</h3>
              <p className="mb-2">La clasificación es una operación mental fundamental que nos permite organizar la información de nuestro entorno. Consiste en reunir objetos por semejanzas y separarlos por diferencias.</p>
              <p className="mb-2">Para clasificar un grupo de objetos, usted debe reconocer un atributo (una cualidad o propiedad particular) que ciertos objetos tienen en común. La clasificación puede realizarse utilizando un criterio (atributo) o, a medida que la noción se consolida, utilizando dos o más criterios de manera simultánea, como el color, la forma o el tamaño.</p>
              <p>La clasificación es una de las operaciones lógicas más importantes en el desarrollo del pensamiento lógico-matemático. Cuando clasificamos, estamos definiendo la pertenencia del objeto a una clase e incluso su inclusión en subclases.</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-rose-700 mb-2">B. Bondades y Beneficios de la Clasificación</h3>
              <p className="mb-3">Las actividades de clasificación son cruciales para el desarrollo del pensamiento matemático infantil. A través de ellas, el niño desarrolla habilidades esenciales:</p>
              <ol className="list-decimal list-inside space-y-2">
                <li><strong>Desarrollo del Pensamiento Lógico y Analítico:</strong> Clasificar fomenta el desarrollo de un pensamiento claro y lógico que es la base del buen razonamiento matemático. Requiere observar semejanzas y diferencias, y hacer comparaciones de tamaño, forma, color y detalle.</li>
                <li><strong>Adquisición de Vocabulario:</strong> Al clasificar, los niños aprenden a usar vocabulario y a pensar en términos de categorías, lo cual favorece la comprensión y la interiorización de los conceptos. Es fundamental describir los atributos con palabras, nombrando los grupos formados.</li>
                <li><strong>Habilidades Operativas:</strong> La clasificación ayuda a desarrollar la capacidad de agrupar o clasificar espontáneamente atributos en el mundo real. También promueve habilidades como la resolución de problemas al identificar patrones.</li>
                <li><strong>Aprendizaje Significativo:</strong> Estas nociones se construyen de manera paulatina y significativa si el niño experimenta, manipula y explora directamente los objetos de su entorno.</li>
              </ol>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-rose-700 mb-2">C. La Clasificación como Base del Concepto de Número</h3>
              <p className="mb-2">La clasificación es una noción prenumérica indispensable para la adquisición del concepto de número. El desarrollo adecuado de la clasificación, junto con la seriación y la correspondencia, es fundamental para que el niño pueda apropiarse del concepto de número.</p>
              <p className="mb-3">Se espera que, mediante el desarrollo de la clasificación, el niño logre consolidar dos aspectos clave para la matemática futura:</p>
              <ol className="list-decimal list-inside space-y-2">
                <li><strong>La Lógica de Clases (Inclusión):</strong> Para construir el concepto de número, el niño debe alcanzar la relación de inclusión de clases. Esto significa que, por ejemplo, debe comprender que el número "1" está incluido en el "2", el "2" en el "3", y así sucesivamente. También debe entender que una clase (ej. "flores") tiene más elementos que una subclase (ej. "rosas").</li>
                <li><strong>La Estructura Lógica para Razonar:</strong> Si el niño no logra construir las nociones de clasificación y seriación en la etapa preescolar, es probable que más adelante, al resolver problemas, deba elaborar procedimientos para cada uno de ellos sin utilizar el razonamiento lógico, recurriendo en cambio al uso intensivo de la memoria. La clasificación, al ser parte de las operaciones concretas del pensamiento, prepara al niño para que posteriormente pueda operar con números.</li>
              </ol>
              <p className="mt-4 bg-rose-50 p-3 rounded-lg border border-rose-200">En resumen, la clasificación sienta las bases para que el niño pueda establecer las relaciones no observables (la cantidad abstracta) entre los objetos, facilitando que el número sea comprendido como una cantidad y no solo como un "nombre" dado al último objeto contado.</p>
            </div>
          </div>
        );
      case 'seriacion':
        return (
           <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-sky-700 mb-2">A. ¿Qué es la Seriación?</h3>
              <p className="mb-2">La seriación es una operación mental fundamental en el desarrollo del pensamiento lógico-matemático. Consiste en ordenar un conjunto de objetos de manera sistematizada. Esta ordenación se establece en función de las diferencias existentes relativas a una característica o cualidad determinada del objeto.</p>
              <p className="mb-2">Al seriar, se establece un ordenamiento según diferencias crecientes o decrecientes. Por ejemplo, los elementos pueden ordenarse por tamaño, grosor, color, altura o longitud. Esta operación le permite al niño o niña realizar un análisis de las diferencias entre los objetos, además del análisis de las semejanzas que se emplea en la clasificación.</p>
              <p>La seriación implica que el niño o niña es capaz de establecer relaciones lógicas al considerar que un elemento cualquiera es a la vez mayor que los precedentes y menor que los siguientes.</p>
            </div>
            <div>
                <h3 className="text-2xl font-bold text-sky-700 mb-2">B. Bondades y Beneficios de la Seriación</h3>
                <p className="mb-3">La seriación es una de las nociones prenuméricas más importantes que el niño debe construir de manera paulatina a través de la experimentación y manipulación de objetos de su entorno. El desarrollo adecuado de esta noción proporciona beneficios cruciales para el pensamiento:</p>
                <ol className="list-decimal list-inside space-y-3">
                    <li>
                        <strong>Desarrollo del Pensamiento Lógico y Variacional:</strong> El desarrollo de la seriación es fundamental para la apropiación del concepto de número. Lograr que el niño desarrolle esta noción le permitirá desarrollar el pensamiento variacional. Este tipo de pensamiento le ayuda al niño a pronosticar el comportamiento de una serie inicial y, por lo tanto, a anticipar resultados.
                    </li>
                    <li>
                        <strong>Construcción de Relaciones Lógicas:</strong> La seriación es importante porque su adquisición implica la construcción de dos propiedades o relaciones fundamentales en el pensamiento lógico:
                        <ul className="list-[circle] list-inside ml-4 mt-2 space-y-1">
                            <li><strong>Reversibilidad:</strong> El niño puede concebir que una operación comporta una operación inversa. Por ejemplo, si puede ordenar los elementos de mayor a menor, también puede ordenarlos de menor a mayor.</li>
                            <li><strong>Transitividad:</strong> El niño puede establecer, por deducción, la relación que existe entre dos elementos que no han sido comparados previamente, basándose en las relaciones establecidas con un tercer elemento. Por ejemplo: si 2 es mayor que 1, y 3 es mayor que 2, entonces puede deducir que 3 es mayor que 1.</li>
                        </ul>
                    </li>
                    <li>
                        <strong>Prevención de Aprendizajes Mecánicos:</strong> Si el niño o niña no logra adquirir las nociones de clasificación y seriación, cuando deba resolver problemas en grados posteriores, elaborará procedimientos desconectados para cada uno de ellos, haciendo un uso intensivo de la memoria en lugar de recurrir al razonamiento lógico.
                    </li>
                </ol>
            </div>
            <div>
                <h3 className="text-2xl font-bold text-sky-700 mb-2">C. La Seriación como Aporte a la Construcción del Concepto de Número</h3>
                <p className="mb-3">Las nociones de seriación y clasificación, junto con la correspondencia, son consideradas nociones prenuméricas indispensables para la conceptualización del número. El concepto de número se considera una síntesis de las operaciones de clasificación (inclusión de clases) y seriación (relación de orden).</p>
                <p className="mb-3">La seriación contribuye específicamente al componente ordinal del número. Se espera que, al seriar, el niño logre:</p>
                <ol className="list-decimal list-inside space-y-2">
                    <li><strong>Establecer la Relación de Orden:</strong> La noción de número, lejos de ser elemental, se apoya en otras nociones, entre las que destaca la relación de orden. La seriación le permite al niño distinguir cada elemento de un conjunto de forma ordenada.</li>
                    <li><strong>Necesidad de un Ordenamiento:</strong> La seriación introduce la necesidad de un ordenamiento para que el niño pueda distinguir cada elemento de un conjunto y evitar contarlo dos veces o dejar de contarlo.</li>
                    <li><strong>Acceso a Operaciones Posteriores:</strong> Las relaciones de transitividad y reversibilidad, implícitas en la seriación, son elementos fundamentales que le permitirán al niño operar con los números en el futuro.</li>
                </ol>
                <p className="mt-4">La apropiación de la seriación demuestra que el niño ha organizado las operaciones concretas del pensamiento y está preparado para estructuras cognitivas más complejas</p>
            </div>
          </div>
        );
       case 'conservacion':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-amber-700 mb-2">A. ¿Qué es la Noción de Conservación?</h3>
              <p className="mb-2">La conservación es una operación mental esencial y se refiere a la conciencia de que dos cosas que son iguales en cantidad permanecen iguales si su forma se altera, siempre y cuando no se les añada o quite nada.</p>
              <p className="mb-2">En el ámbito de las nociones prenuméricas, la noción de conservación del número es la capacidad de mantener la equivalencia numérica de dos colecciones de elementos, aun cuando haya habido transformaciones en la disposición espacial de alguno de ellos o los elementos de cada conjunto ya no estén en correspondencia visual uno a uno.</p>
              <p className="mb-2">Por ejemplo, si un niño no ha desarrollado esta noción, y usted distribuye una hilera de fichas más separadas (ocupando más espacio) que otra hilera con el mismo número de fichas, el niño afirmará intuitivamente que la hilera más larga tiene más elementos. La conservación permite al niño ir más allá de la percepción inmediata, lo que la convierte en una noción prenumérica indispensable.</p>
              <p>Cuando un niño asegura que la cantidad se conserva, utiliza argumentos lógicos que demuestran su razonamiento, como:</p>
              <ol className="list-decimal list-inside space-y-2 mt-2">
                <li><strong>Identidad:</strong> Si nadie puso ni quitó ningún elemento, y solo fueron movidos, la cantidad permanece constante.</li>
                <li><strong>Reversibilidad:</strong> Si se revierten las transformaciones y se regresa a la disposición inicial, se verá que la cantidad es la misma.</li>
                <li><strong>Compensación:</strong> A pesar de que una fila o recipiente parezca tener más porque ocupa más espacio (o es más alto), el hecho de que sus elementos estén más separados o sea más angosto compensa, manteniendo la cantidad original.</li>
              </ol>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-amber-700 mb-2">B. Bondades y Beneficios de la Conservación</h3>
              <p className="mb-3">La conservación de la cantidad es un logro cognitivo que indica que el niño ha comenzado a organizar las operaciones concretas del pensamiento. Sus beneficios principales incluyen:</p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Superación de Limitaciones Perceptuales:</strong> La conservación le permite al niño superar las características del pensamiento pre-lógico, como el centraje (enfocarse en un solo aspecto, como la altura de un objeto o la longitud de una fila). Al adquirir la conservación, el niño aprende a descentralizar y a tomar en cuenta varios aspectos de una situación a la vez.</li>
                <li><strong>Desarrollo del Razonamiento Lógico:</strong> La adquisición de la conservación es fundamental porque, junto con la reversibilidad, permite la integración de datos aparentemente contradictorios. Este logro impulsa al niño a justificar sus respuestas con argumentos lógicos (identidad, reversibilidad, compensación).</li>
                <li><strong>Preparación para la Abstracción:</strong> Al superar el egocentrismo, el centraje y la irreversibilidad, el niño está preparado para construir conceptos abstractos y operaciones. La conservación de número es una de las operaciones lógicas más importantes al respecto.</li>
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-amber-700 mb-2">C. La Conservación como Aporte a la Construcción del Concepto de Número</h3>
              <p className="mb-3">El desarrollo de las nociones prenuméricas de clasificación, seriación y correspondencia son requisitos primordiales para la construcción del concepto de número. Específicamente, la conservación aporta la solidez lógica necesaria para que el niño pueda operar con las cantidades:</p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Síntesis de Operaciones:</strong> La noción de número se considera una síntesis de las operaciones de clasificación (inclusión de clases) y seriación (relación de orden). Para que esta noción de número se estructure completamente, es necesario que se elabore a su vez la noción de conservación de número.</li>
                <li><strong>Transición de lo Perceptual a lo Lógico:</strong> Durante la primera infancia, el niño basa sus juicios sobre la cantidad en la percepción, no en el razonamiento lógico. La conservación es la evidencia de que el niño ha pasado de basar sus juicios en la intuición perceptual (como el espacio ocupado) a basarlos en el razonamiento racional (la cantidad no cambia si no se agrega ni se quita).</li>
                <li><strong>Entendimiento de las Operaciones:</strong> La conservación es crucial porque, al asegurar la equivalencia numérica independientemente de los cambios espaciales, permite que el número sea entendido como una cantidad fija y no solo como un "nombre". Esto es la base para que, después de los 7 años, el niño pueda acceder a operaciones formales como la suma y la resta. Un niño que no ha desarrollado la noción de conservación puede tener dificultades en la comprensión numérica y el pensamiento lógico.</li>
              </ul>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-800 bg-opacity-60 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-4xl h-[90vh] flex flex-col relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-800 transition z-10" aria-label="Cerrar"><CloseIcon /></button>
        
        <div className="text-center mb-4">
            <BookOpenIcon className="w-12 h-12 mx-auto text-sky-600 mb-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-sky-800">Guía Didáctica: Descubriendo el Orden</h2>
        </div>
        
        <div className="mb-6 flex justify-center">
            <div className="p-1 bg-slate-100 rounded-xl flex items-center space-x-1" role="tablist" aria-orientation="horizontal">
                <button
                    onClick={() => setActiveTab('clasificacion')}
                    role="tab"
                    id="tab-clasificacion"
                    aria-controls="panel-clasificacion"
                    aria-selected={activeTab === 'clasificacion'}
                    className={`px-5 py-2 text-base font-bold rounded-lg transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-opacity-75
                        ${activeTab === 'clasificacion' ? 'bg-white text-rose-700 shadow-md' : 'text-slate-600 hover:bg-slate-200/70'}`}
                >
                    Clasificación
                </button>
                <button
                    onClick={() => setActiveTab('seriacion')}
                    role="tab"
                    id="tab-seriacion"
                    aria-controls="panel-seriacion"
                    aria-selected={activeTab === 'seriacion'}
                    className={`px-5 py-2 text-base font-bold rounded-lg transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-opacity-75
                        ${activeTab === 'seriacion' ? 'bg-white text-sky-700 shadow-md' : 'text-slate-600 hover:bg-slate-200/70'}`}
                >
                    Seriación
                </button>
                <button
                    onClick={() => setActiveTab('conservacion')}
                    role="tab"
                    id="tab-conservacion"
                    aria-controls="panel-conservacion"
                    aria-selected={activeTab === 'conservacion'}
                    className={`px-5 py-2 text-base font-bold rounded-lg transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-opacity-75
                        ${activeTab === 'conservacion' ? 'bg-white text-amber-700 shadow-md' : 'text-slate-600 hover:bg-slate-200/70'}`}
                >
                    Conservación
                </button>
            </div>
        </div>

        <div 
          id={`panel-${activeTab}`} 
          role="tabpanel" 
          aria-labelledby={`tab-${activeTab}`}
          className="flex-grow overflow-y-auto pr-4 text-slate-700"
        >
          {renderContent()}
        </div>

      </div>
      <style>{`@keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }`}</style>
    </div>
  );
};

export default TeachersGuide;