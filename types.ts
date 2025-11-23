
export enum RobotCommand {
  FORWARD = 'FORWARD',
  BACKWARD = 'BACKWARD',
  TURN_LEFT = 'TURN_LEFT',
  TURN_RIGHT = 'TURN_RIGHT',
  WAIT = 'WAIT'
}

export interface RobotState {
  x: number;
  y: number;
  direction: 0 | 90 | 180 | 270; // 0: Up, 90: Right, 180: Down, 270: Left
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'kit' | 'part' | 'sensor';
}

export interface Trainer {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
}

export interface Testimonial {
  id: string;
  name: string;
  text: string;
  role: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  lessons: number;
  image: string;
  price: number | 'free';
}

// --- SIMULATION ENGINE TYPES ---

export interface ComponentSchema {
  id: string;
  type: string;
  name: string;
  powerConsumption: number;
}

export interface RobotSchema {
  processor: {
    type: string;
    position: string;
  } | null;
  slots: {
    front: ComponentSchema | null;
    back: ComponentSchema | null;
    left: ComponentSchema | null;
    right: ComponentSchema | null;
  };
  power: {
    totalCapacity: number;
    current: number;
    consumptionPerTick: number;
  };
}

export interface SensorReadings {
  distance: number; // cm
  temperature: number; // Celsius
  light: number; // Lux/Percentage
  collision: boolean;
}

export interface SimulationStepResult {
  x: number;
  y: number;
  direction: 0 | 90 | 180 | 270;
  battery: number;
  temperature: number;
  sensors: SensorReadings;
  logs: string[];
  moved: boolean;
}
