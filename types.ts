// types.ts

export enum Shape {
  Circle = 'circle',
  Square = 'square',
  Triangle = 'triangle',
  Rectangle = 'rectangle',
}

export enum Color {
  Red = 'red',
  Blue = 'blue',
  Yellow = 'yellow',
}

export enum Size {
  Small = 'small',
  Large = 'large',
}

export enum Thickness {
  Thick = 'thick',
  Thin = 'thin',
}

// NEW Enums for Treasure Objects
export enum ObjectType {
  Button = 'button',
  Lid = 'lid',
  Spoon = 'spoon',
  Sock = 'sock',
}

export enum Pattern {
  Solid = 'solid',
  Stripes = 'stripes',
  Dots = 'dots',
}

export enum Holes {
  Two = 'two',
  Four = 'four',
}


export interface DienesBlockType {
  id: string;
  shape: Shape;
  color: Color;
  size: Size;
  thickness: Thickness;
}

export type ClassificationRule = {
    [key in keyof Omit<DienesBlockType, 'id'>]?: DienesBlockType[key];
};

export interface MagicBoxDefinition {
    id: string;
    label: string;
    rule: ClassificationRule;
}

export interface GameLevel {
    id: string; // Unique identifier for the level
    title: string;
    name: string;
    description: string;
    boxes: MagicBoxDefinition[];
    isExpert?: boolean;
}

export type InventoryGameDifficulty = 'Básico' | 'Medio' | 'Experto';

export interface InventoryOrder {
    rule: ClassificationRule;
    count: number;
    description: string;
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
}

export interface Notification {
    id: number;
    message: string;
    achievementId: string;
}

export type ActivityLogType = 'game' | 'achievement' | 'win' | 'system';

export interface ActivityLogEntry {
  id: number;
  timestamp: string;
  message: string;
  type: ActivityLogType;
  seen: boolean;
  pointsEarned?: number;
}

export type CareerOption = 'Educación Parvularia' | 'Pedagogía en Educación Diferencial' | 'Pedagogía en Educación Básica';

export interface UserProfile {
  id: string; // From supabase.auth.users
  email: string;
  firstName: string;
  lastName: string;
  career: CareerOption;
  score: number;
  unlockedAchievements: Record<string, boolean>;
  // completed_levels is now deprecated and will be calculated from performance_logs
}

// NEW Interface for Treasure Objects
export interface TreasureObject {
  id: string;
  objectType: ObjectType;
  color: Color;
  size: Size;
  pattern?: Pattern; // optional, for socks
  holes?: Holes;     // optional, for buttons
}

// Classification rule for the new treasures
export type TreasureClassificationRule = {
    [key in keyof Omit<TreasureObject, 'id'>]?: TreasureObject[key];
};

export interface TreasureMagicBoxDefinition {
    id: string;
    label: string;
    rule: TreasureClassificationRule;
}

export interface PerformanceLog {
  id?: number;
  user_id: string;
  created_at?: string;
  game_name: string;
  level_name: string; // This will now correspond to an Activity ID
  incorrect_attempts: number;
  time_taken_ms: number;
  total_items?: number;
}

// NEW type for Cuisenaire Rods
export interface CuisenaireRodType {
  id: string;
  value: number;
  colorName: string;
  colorHex: string;
}

export type SeriationChallengeType = 'ascending' | 'descending' | 'abc-pattern' | 'growth-pattern';