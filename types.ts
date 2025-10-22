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
  completedLevels: Record<string, boolean>;
}
