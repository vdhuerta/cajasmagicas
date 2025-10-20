// utils/tts.ts
export const speakText = (text: string, lang: string = 'es-ES'): void => {
  if (!window.speechSynthesis) {
    console.error('Text-to-speech no es compatible con este navegador.');
    alert('La función de lectura de audio no es compatible con tu navegador.');
    return;
  }
  
  // Detener cualquier locución en curso para evitar superposiciones
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9; // Un poco más lento para mayor claridad
  utterance.pitch = 1.1; // Ligeramente más alto para un tono amigable
  
  window.speechSynthesis.speak(utterance);
};
