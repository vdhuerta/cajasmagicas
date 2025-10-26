import { DienesBlockType, Shape, Color, Size, Thickness, GameLevel, Achievement, TreasureObject, ObjectType, Pattern, Holes } from './types';

export const SHAPES = [Shape.Circle, Shape.Square, Shape.Triangle, Shape.Rectangle];
export const COLORS = [Color.Red, Color.Blue, Color.Yellow];
export const SIZES = [Size.Small, Size.Large];
export const THICKNESSES = [Thickness.Thick, Thickness.Thin];

export const ALL_DIENES_BLOCKS: DienesBlockType[] = [];
let idCounter = 0;
for (const shape of SHAPES) {
  for (const color of COLORS) {
    for (const size of SIZES) {
      for (const thickness of THICKNESSES) {
        ALL_DIENES_BLOCKS.push({
          id: `block-${idCounter++}`,
          shape,
          color,
          size,
          thickness,
        });
      }
    }
  }
}

export const ALL_TREASURE_OBJECTS: TreasureObject[] = [
  // Buttons
  { id: 'treasure-1', objectType: ObjectType.Button, color: Color.Red, size: Size.Small, holes: Holes.Two },
  { id: 'treasure-2', objectType: ObjectType.Button, color: Color.Red, size: Size.Large, holes: Holes.Four },
  { id: 'treasure-3', objectType: ObjectType.Button, color: Color.Blue, size: Size.Small, holes: Holes.Four },
  { id: 'treasure-4', objectType: ObjectType.Button, color: Color.Blue, size: Size.Large, holes: Holes.Two },
  { id: 'treasure-5', objectType: ObjectType.Button, color: Color.Yellow, size: Size.Small, holes: Holes.Two },
  { id: 'treasure-6', objectType: ObjectType.Button, color: Color.Yellow, size: Size.Large, holes: Holes.Four },
  // Spoons
  { id: 'treasure-7', objectType: ObjectType.Spoon, color: Color.Red, size: Size.Small },
  { id: 'treasure-8', objectType: ObjectType.Spoon, color: Color.Red, size: Size.Large },
  { id: 'treasure-9', objectType: ObjectType.Spoon, color: Color.Blue, size: Size.Small },
  { id: 'treasure-10', objectType: ObjectType.Spoon, color: Color.Blue, size: Size.Large },
  { id: 'treasure-11', objectType: ObjectType.Spoon, color: Color.Yellow, size: Size.Small },
  { id: 'treasure-12', objectType: ObjectType.Spoon, color: Color.Yellow, size: Size.Large },
  // Lids
  { id: 'treasure-13', objectType: ObjectType.Lid, color: Color.Red, size: Size.Small },
  { id: 'treasure-14', objectType: ObjectType.Lid, color: Color.Blue, size: Size.Large },
  { id: 'treasure-15', objectType: ObjectType.Lid, color: Color.Yellow, size: Size.Small },
  { id: 'treasure-16', objectType: ObjectType.Lid, color: Color.Red, size: Size.Large },
  // Socks
  { id: 'treasure-17', objectType: ObjectType.Sock, color: Color.Red, size: Size.Small, pattern: Pattern.Dots },
  { id: 'treasure-18', objectType: ObjectType.Sock, color: Color.Yellow, size: Size.Large, pattern: Pattern.Stripes },
  { id: 'treasure-19', objectType: ObjectType.Sock, color: Color.Yellow, size: Size.Small, pattern: Pattern.Stripes },
  { id: 'treasure-20', objectType: ObjectType.Sock, color: Color.Blue, size: Size.Large, pattern: Pattern.Solid },
  { id: 'treasure-21', objectType: ObjectType.Sock, color: Color.Blue, size: Size.Small, pattern: Pattern.Solid },
  { id: 'treasure-22', objectType: ObjectType.Sock, color: Color.Red, size: Size.Large, pattern: Pattern.Dots },
];

export const GAME_LEVELS: GameLevel[] = [
    {
        title: "¡Vamos a ordenar por COLOR!",
        name: "Nivel 1: Colores",
        description: "Clasifica por color: rojo, azul y amarillo.",
        boxes: [
            { id: 'box-red', label: 'Caja Roja', rule: { color: Color.Red } },
            { id: 'box-blue', label: 'Caja Azul', rule: { color: Color.Blue } },
            { id: 'box-yellow', label: 'Caja Amarilla', rule: { color: Color.Yellow } },
        ]
    },
    {
        title: "¡Ahora, a ordenar por FORMA!",
        name: "Nivel 2: Formas",
        description: "Clasifica por forma: círculo, cuadrado y más.",
        boxes: [
            { id: 'box-circle', label: 'Círculos', rule: { shape: Shape.Circle } },
            { id: 'box-square', label: 'Cuadrados', rule: { shape: Shape.Square } },
            { id: 'box-triangle', label: 'Triángulos', rule: { shape: Shape.Triangle } },
            { id: 'box-rectangle', label: 'Rectángulos', rule: { shape: Shape.Rectangle } },
        ]
    },
    {
        title: "Un desafío: ¡encuentra las figuras PEQUEÑAS!",
        name: "Nivel 3: Tamaños",
        description: "Clasifica por tamaño: grande y pequeño.",
        boxes: [
            { id: 'box-small', label: 'Figuras Pequeñas', rule: { size: Size.Small } },
            { id: 'box-large', label: 'Figuras Grandes', rule: { size: Size.Large } },
        ]
    },
    {
        title: "Súper desafío: ¡ordena los CUADRADOS AZULES!",
        name: "Nivel 4: Múltiples propiedades",
        description: "Clasifica por color y forma.",
        boxes: [
            { id: 'box-blue-squares', label: 'Cuadrados Azules', rule: { color: Color.Blue, shape: Shape.Square } },
            { id: 'box-others', label: 'Todo lo Demás', rule: {} }, // Note: This logic is handled specially in component
        ]
    },
    {
        title: "Modo Experto",
        name: "Nivel Experto: ¡Crea tu Regla!",
        description: "Elige una o más propiedades para crear tu propio desafío de clasificación.",
        isExpert: true,
        boxes: []
    }
];

export const TAILWIND_COLORS: Record<Color, { bg: string; border: string; svg: string; stroke: string; edge: string; }> = {
    [Color.Red]: { bg: 'bg-red-400', border: 'border-red-600', svg: 'fill-red-400', stroke: 'stroke-red-600', edge: 'fill-red-700' },
    [Color.Blue]: { bg: 'bg-blue-400', border: 'border-blue-600', svg: 'fill-blue-400', stroke: 'stroke-blue-600', edge: 'fill-blue-700' },
    [Color.Yellow]: { bg: 'bg-yellow-400', border: 'border-yellow-600', svg: 'fill-yellow-400', stroke: 'stroke-yellow-600', edge: 'fill-yellow-700' },
};

export const TRANSLATIONS: Record<string, string> = {
    shape: 'Forma', color: 'Color', size: 'Tamaño', thickness: 'Grosor',
    [Shape.Circle]: 'Círculo', [Shape.Square]: 'Cuadrado', [Shape.Triangle]: 'Triángulo', [Shape.Rectangle]: 'Rectángulo',
    [Color.Red]: 'Rojo', [Color.Blue]: 'Azul', [Color.Yellow]: 'Amarillo',
    [Size.Small]: 'Pequeño', [Size.Large]: 'Grande',
    [Thickness.Thick]: 'Grueso', [Thickness.Thin]: 'Delgado',
    // New translations
    objectType: 'Tipo',
    pattern: 'Patrón',
    holes: 'Agujeros',
    [ObjectType.Button]: 'Botones',
    [ObjectType.Lid]: 'Tapas',
    [ObjectType.Spoon]: 'Cucharas',
    [ObjectType.Sock]: 'Calcetines',
    [Pattern.Solid]: 'Liso',
    [Pattern.Stripes]: 'Rayas',
    [Pattern.Dots]: 'Puntos',
    [Holes.Two]: '2 Agujeros',
    [Holes.Four]: '4 Agujeros',
};

export const ALL_ACHIEVEMENTS: Achievement[] = [
    { id: 'CLASSIFICATION_LVL_1', name: 'Aprendiz de Colores', description: 'Completa el Nivel 1 de Clasificación.' },
    { id: 'CLASSIFICATION_LVL_2', name: 'Maestro de las Formas', description: 'Completa el Nivel 2 de Clasificación.' },
    { id: 'CLASSIFICATION_LVL_3', name: 'Pequeño Gigante', description: 'Completa el Nivel 3 de Clasificación.' },
    { id: 'CLASSIFICATION_LVL_4', name: 'Detective de Figuras', description: 'Completa el Nivel 4 de Clasificación.' },
    { id: 'CLASSIFICATION_EXPERT', name: 'Creador de Desafíos', description: 'Juega una partida en el Nivel Experto.' },
    { id: 'MATCHING_GAME_WIN', name: 'Memoria Prodigiosa', description: 'Gana una partida en el Juego de Parejas.' },
    { id: 'ODD_ONE_OUT_WIN', name: 'Ojo de Águila', description: 'Gana una partida en El Duende Despistado.' },
    { id: 'ODD_ONE_OUT_PERFECT', name: 'Perfeccionista', description: 'Consigue una puntuación perfecta en El Duende Despistado.' },
    { id: 'VENN_DIAGRAM_WIN', name: 'Explorador de Pozas', description: 'Completa el juego El Cruce Mágico.' },
    { id: 'INVENTORY_BASIC_WIN', name: 'Ayudante de Duende', description: 'Completa el Nivel Básico del Inventario.' },
    { id: 'INVENTORY_MEDIUM_WIN', name: 'Artesano Habilidoso', description: 'Completa el Nivel Medio del Inventario.' },
    { id: 'INVENTORY_EXPERT_WIN', name: 'Maestro Inventor', description: 'Completa el Nivel Experto del Inventario.' },
    { id: 'TREASURE_SORT_WIN', name: 'Coleccionista de Tesoros', description: 'Completa una ronda en El Baúl de los Tesoros.' },
    { id: 'GEMINI_NAME', name: '¡Poder Mágico!', description: 'Usa la magia de la IA para nombrar una caja.' },
];