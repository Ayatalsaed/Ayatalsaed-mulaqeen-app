
import { RobotSchema, RobotState, SimulationStepResult, SensorReadings, RobotCommand } from '../types';

export class SimulationEngine {
  private robot: RobotSchema;
  private gridMap: ('empty' | 'obstacle')[][];
  private gridW: number;
  private gridH: number;
  private state: RobotState & { battery: number; temperature: number };

  constructor(
    robotConfig: RobotSchema,
    gridMap: ('empty' | 'obstacle')[][],
    initialState: RobotState & { battery: number; temperature: number }
  ) {
    this.robot = robotConfig;
    this.gridMap = gridMap;
    this.gridH = gridMap.length;
    this.gridW = gridMap[0].length;
    this.state = { ...initialState };
  }

  /**
   * Simulates one tick of the engine
   */
  public step(command: string): SimulationStepResult {
    const logs: string[] = [];
    let moved = false;

    // 1. Power Consumption Logic
    const drain = this.robot.power.consumptionPerTick;
    // Allow recharging if negative drain (solar), but clamp max battery to 100
    this.state.battery = Math.min(100, Math.max(0, this.state.battery - drain));
    
    // Simulate ambient heat rise + operational heat
    this.state.temperature += (Math.random() * 0.5) + (drain > 5 ? 0.5 : 0.1);

    if (this.state.battery <= 0) {
      logs.push("CRITICAL: Battery depleted. System shutdown.");
      return this.generateResult(moved, logs);
    }

    // 2. Movement Logic
    if (command === RobotCommand.FORWARD || command === RobotCommand.BACKWARD) {
       // Check if motors exist (checking left/right slots for motors)
       const hasMotor = this.robot.slots.left?.type === 'motor' || this.robot.slots.right?.type === 'motor';
       
       if (!hasMotor) {
         logs.push("ERROR: No motors detected. Movement failed.");
       } else {
         let dx = 0, dy = 0;
         const dir = this.state.direction;
         
         if (dir === 0) dy = -1;       // Up
         else if (dir === 90) dx = 1;  // Right
         else if (dir === 180) dy = 1; // Down
         else if (dir === 270) dx = -1;// Left

         if (command === RobotCommand.BACKWARD) {
           dx = -dx;
           dy = -dy;
         }

         const nextX = this.state.x + dx;
         const nextY = this.state.y + dy;

         if (this.isValidPosition(nextX, nextY)) {
           if (this.gridMap[nextY][nextX] === 'obstacle') {
             logs.push("WARNING: Obstacle detected! Impact!");
             this.state.battery -= 5; // Impact penalty
           } else {
             this.state.x = nextX;
             this.state.y = nextY;
             moved = true;
           }
         } else {
           logs.push("WARNING: Boundary reached.");
         }
       }
    } else if (command === RobotCommand.TURN_RIGHT) {
       this.state.direction = (this.state.direction + 90) % 360 as any;
    } else if (command === RobotCommand.TURN_LEFT) {
       this.state.direction = (this.state.direction - 90 + 360) % 360 as any;
    } else if (command === RobotCommand.WAIT) {
       logs.push("System waiting...");
    }

    // 3. Sensor Update (After movement)
    const sensors = this.readSensors();

    return {
      x: this.state.x,
      y: this.state.y,
      direction: this.state.direction,
      battery: this.state.battery,
      temperature: this.state.temperature,
      sensors,
      logs,
      moved
    };
  }

  private isValidPosition(x: number, y: number): boolean {
    return x >= 0 && x < this.gridW && y >= 0 && y < this.gridH;
  }

  private readSensors(): SensorReadings {
    // Basic Ray Casting for Distance Sensor
    let distance = 999; // Default infinity
    const hasDistSensor = this.robot.slots.front?.type === 'sensor-dist' || this.robot.slots.front?.type === 'lidar';
    
    if (hasDistSensor) {
      distance = 0;
      let checkX = this.state.x;
      let checkY = this.state.y;
      let dx = 0, dy = 0;
      
      if (this.state.direction === 0) dy = -1;
      else if (this.state.direction === 90) dx = 1;
      else if (this.state.direction === 180) dy = 1;
      else if (this.state.direction === 270) dx = -1;

      // Cast ray up to 10 blocks
      for(let i=1; i<=10; i++) {
         checkX += dx;
         checkY += dy;
         if (!this.isValidPosition(checkX, checkY) || this.gridMap[checkY][checkX] === 'obstacle') {
           distance = i * 10; // Convert blocks to simulated cm (1 block = 10cm)
           break;
         }
         if (i === 10) distance = 100; // Max range
      }
    }

    return {
      distance,
      temperature: 24 + (Math.random() * 2), // Ambient 24C + variation
      light: 80 - (Math.random() * 10), // Ambient Light
      collision: false // To be implemented with bumpers
    };
  }

  private generateResult(moved: boolean, logs: string[]): SimulationStepResult {
    return {
      x: this.state.x,
      y: this.state.y,
      direction: this.state.direction,
      battery: this.state.battery,
      temperature: this.state.temperature,
      sensors: this.readSensors(),
      logs,
      moved
    };
  }
}
