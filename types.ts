
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
