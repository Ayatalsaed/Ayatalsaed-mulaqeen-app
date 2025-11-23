
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Play, RefreshCw, RotateCcw, Terminal, LayoutTemplate, FileCode, 
  MonitorPlay, Trash2, Cpu, Battery, Thermometer, Settings, X, 
  MousePointerClick, Box, Zap, Eye, GripHorizontal, Speaker, Wifi,
  ArrowRight, Plus, Footprints, Flag, Layers, CheckCircle, AlertTriangle,
  Sun, BatteryCharging, Radar, Compass, MapPin, SunMedium, CircleDot, FileText,
  Save, FolderOpen, Undo, Redo, RotateCw, AlertOctagon, Code, Activity
} from 'lucide-react';
import { RobotState, RobotSchema, SensorReadings } from '../types';
import { translateCommands } from '../services/geminiService';
import { SimulationEngine } from '../services/simulationEngine';
import { jsPDF } from "jspdf";

// --- Types ---
type Tab = 'designer' | 'editor' | 'simulator';

interface ComponentItem {
  id: string;
  type: 'cpu' | 'motor' | 'sensor-dist' | 'sensor-heat' | 'sensor-light' | 'camera' | 'gripper' | 'speaker' | 'wifi' | 'battery' | 'lidar' | 'gyro' | 'gps' | 'solar' | 'bumper';
  name: string;
  nameEn: string;
  icon: React.ReactNode;
  powerConsumption: number; // Positive = Consumes, Negative = Generates
  description: string;
  snippet?: string; // Code snippet for this component
}

interface RobotSlot {
  id: 'center' | 'front' | 'back' | 'left' | 'right';
  label: string;
  labelEn: string;
  component: ComponentItem | null;
  allowedTypes: string[];
  rotation: number; // 0, 90, 180, 270
}

interface SimState extends RobotState {
  battery: number;
  temperature: number;
  isRunning: boolean;
}

interface SimConfig {
  gridW: number;
  gridH: number;
  startX: number;
  startY: number;
  startDir: 0 | 90 | 180 | 270;
}

interface SavedDesign {
  name: string;
  date: string;
  chassis: RobotSlot[];
}

// --- Constants ---
const SCENARIOS = {
  empty: { name: 'ساحة فارغة', obstacles: [] },
  maze: { name: 'المتاهة', obstacles: [[2,2],[2,3],[2,4],[3,4],[4,4],[5,4],[5,3],[5,2]] },
  box: { name: 'الصندوق المغلق', obstacles: [[1,1],[1,8],[8,1],[8,8],[2,1],[3,1],[4,1],[5,1],[6,1],[7,1],[2,8],[3,8],[4,8],[5,8],[6,8],[7,8],[1,2],[1,3],[1,4],[1,5],[1,6],[1,7],[8,2],[8,3],[8,4],[8,5],[8,6],[8,7]] }
};

const DEFAULT_CONFIG: SimConfig = {
  gridW: 10,
  gridH: 10,
  startX: 0,
  startY: 0,
  startDir: 90
};

const INITIAL_ROBOT_STATE_BASE = { 
  battery: 100, 
  temperature: 35, 
  isRunning: false 
};

const AVAILABLE_COMPONENTS: ComponentItem[] = [
  { id: 'cpu-1', type: 'cpu', name: 'وحدة معالجة مركزية', nameEn: 'Main CPU Unit', icon: <Cpu size={20} />, powerConsumption: 0.5, description: 'عقل الروبوت الأساسي. لا يعمل الروبوت بدونه.', snippet: '// CPU Initialized' },
  { id: 'motor-1', type: 'motor', name: 'محرك دفع', nameEn: 'DC Motor', icon: <Settings size={20} />, powerConsumption: 5.0, description: 'يسمح بالحركة. يحتاج إلى طاقة عالية.', snippet: '["FORWARD", "WAIT"]' },
  { id: 'sensor-d', type: 'sensor-dist', name: 'حساس مسافة', nameEn: 'Distance Sensor', icon: <Wifi size={20} className="rotate-90" />, powerConsumption: 0.5, description: 'يقيس المسافة لتجنب الاصطدام.', snippet: '// Check distance logic here' },
  { id: 'sensor-t', type: 'sensor-heat', name: 'حساس حرارة', nameEn: 'Heat Sensor', icon: <Thermometer size={20} />, powerConsumption: 0.2, description: 'يراقب درجة حرارة البيئة.', snippet: '// Read Temp' },
  { id: 'sensor-l', type: 'sensor-light', name: 'حساس ضوء', nameEn: 'Light Sensor', icon: <Sun size={20} />, powerConsumption: 0.2, description: 'يستشعر شدة الإضاءة.', snippet: '// Read Light Level' },
  { id: 'cam-1', type: 'camera', name: 'كاميرا AI', nameEn: 'AI Camera', icon: <Eye size={20} />, powerConsumption: 3.5, description: 'تحليل الصور والتعرف على الأجسام.', snippet: '// Analyze Image' },
  { id: 'lidar-1', type: 'lidar', name: 'ليدار 360', nameEn: 'Lidar Scanner', icon: <Radar size={20} />, powerConsumption: 4.0, description: 'رسم خريطة دقيقة للمحيط.', snippet: '// Scan Environment' },
  { id: 'grip-1', type: 'gripper', name: 'ذراع قبض', nameEn: 'Gripper Arm', icon: <GripHorizontal size={20} />, powerConsumption: 3.0, description: 'الإمساك ونقل الأجسام.', snippet: '// Toggle Gripper' },
  { id: 'wifi-1', type: 'wifi', name: 'وحدة WiFi', nameEn: 'WiFi Module', icon: <Wifi size={20} />, powerConsumption: 1.5, description: 'إرسال البيانات عن بعد.', snippet: '// Connect to Server' },
  { id: 'batt-xl', type: 'battery', name: 'بطارية إضافية', nameEn: 'Extra Battery', icon: <BatteryCharging size={20} />, powerConsumption: -5.0, description: 'تزيد سعة الطاقة وتقلل الحمل.', snippet: '' },
  { id: 'solar-1', type: 'solar', name: 'لوح شمسي', nameEn: 'Solar Panel', icon: <SunMedium size={20} />, powerConsumption: -2.0, description: 'توليد طاقة مستمرة.', snippet: '' },
  { id: 'bump-1', type: 'bumper', name: 'مصد اصطدام', nameEn: 'Bumper Switch', icon: <CircleDot size={20} />, powerConsumption: 0.1, description: 'توقف طارئ عند اللمس.', snippet: '// On Collision' },
];

const INITIAL_CHASSIS: RobotSlot[] = [
    { id: 'center', label: 'المعالج (الوسط)', labelEn: 'Center', component: AVAILABLE_COMPONENTS[0], allowedTypes: ['cpu', 'gyro'], rotation: 0 }, 
    { id: 'front', label: 'الجهة الأمامية', labelEn: 'Front', component: null, allowedTypes: ['sensor-dist', 'camera', 'gripper', 'sensor-light', 'lidar', 'bumper'], rotation: 0 },
    { id: 'left', label: 'الجانب الأيسر', labelEn: 'Left', component: null, allowedTypes: ['motor', 'sensor-heat', 'speaker', 'battery', 'solar'], rotation: 0 },
    { id: 'right', label: 'الجانب الأيمن', labelEn: 'Right', component: AVAILABLE_COMPONENTS[1], allowedTypes: ['motor', 'sensor-heat', 'speaker', 'battery', 'solar'], rotation: 0 },
    { id: 'back', label: 'الجهة الخلفية', labelEn: 'Back', component: null, allowedTypes: ['sensor-dist', 'wifi', 'battery', 'gps', 'bumper'], rotation: 0 },
];

const PREBUILT_DESIGNS: SavedDesign[] = [
    {
        name: 'مستكشف المتاهة',
        date: 'قالب جاهز',
        chassis: [
            { id: 'center', label: 'المعالج (الوسط)', labelEn: 'Center', component: AVAILABLE_COMPONENTS[0], allowedTypes: ['cpu', 'gyro'], rotation: 0 },
            { id: 'front', label: 'الجهة الأمامية', labelEn: 'Front', component: AVAILABLE_COMPONENTS[2], allowedTypes: ['sensor-dist', 'camera', 'gripper', 'sensor-light', 'lidar', 'bumper'], rotation: 0 }, // Distance Sensor
            { id: 'left', label: 'الجانب الأيسر', labelEn: 'Left', component: AVAILABLE_COMPONENTS[1], allowedTypes: ['motor', 'sensor-heat', 'speaker', 'battery', 'solar'], rotation: 0 },
            { id: 'right', label: 'الجانب الأيمن', labelEn: 'Right', component: AVAILABLE_COMPONENTS[1], allowedTypes: ['motor', 'sensor-heat', 'speaker', 'battery', 'solar'], rotation: 0 },
            { id: 'back', label: 'الجهة الخلفية', labelEn: 'Back', component: AVAILABLE_COMPONENTS[9], allowedTypes: ['sensor-dist', 'wifi', 'battery', 'gps', 'bumper'], rotation: 0 }, // Battery
        ]
    },
    {
        name: 'متتبع الخطوط',
        date: 'قالب جاهز',
        chassis: [
            { id: 'center', label: 'المعالج (الوسط)', labelEn: 'Center', component: AVAILABLE_COMPONENTS[0], allowedTypes: ['cpu', 'gyro'], rotation: 0 },
            { id: 'front', label: 'الجهة الأمامية', labelEn: 'Front', component: AVAILABLE_COMPONENTS[4], allowedTypes: ['sensor-dist', 'camera', 'gripper', 'sensor-light', 'lidar', 'bumper'], rotation: 0 }, // Light Sensor
            { id: 'left', label: 'الجانب الأيسر', labelEn: 'Left', component: AVAILABLE_COMPONENTS[1], allowedTypes: ['motor', 'sensor-heat', 'speaker', 'battery', 'solar'], rotation: 0 },
            { id: 'right', label: 'الجانب الأيمن', labelEn: 'Right', component: AVAILABLE_COMPONENTS[1], allowedTypes: ['motor', 'sensor-heat', 'speaker', 'battery', 'solar'], rotation: 0 },
            { id: 'back', label: 'الجهة الخلفية', labelEn: 'Back', component: null, allowedTypes: ['sensor-dist', 'wifi', 'battery', 'gps', 'bumper'], rotation: 0 },
        ]
    },
    {
        name: 'الذراع الآلية',
        date: 'قالب جاهز',
        chassis: [
            { id: 'center', label: 'المعالج (الوسط)', labelEn: 'Center', component: AVAILABLE_COMPONENTS[0], allowedTypes: ['cpu', 'gyro'], rotation: 0 },
            { id: 'front', label: 'الجهة الأمامية', labelEn: 'Front', component: AVAILABLE_COMPONENTS[7], allowedTypes: ['sensor-dist', 'camera', 'gripper', 'sensor-light', 'lidar', 'bumper'], rotation: 0 }, // Gripper
            { id: 'left', label: 'الجانب الأيسر', labelEn: 'Left', component: AVAILABLE_COMPONENTS[1], allowedTypes: ['motor', 'sensor-heat', 'speaker', 'battery', 'solar'], rotation: 0 },
            { id: 'right', label: 'الجانب الأيمن', labelEn: 'Right', component: AVAILABLE_COMPONENTS[1], allowedTypes: ['motor', 'sensor-heat', 'speaker', 'battery', 'solar'], rotation: 0 },
            { id: 'back', label: 'الجهة الخلفية', labelEn: 'Back', component: AVAILABLE_COMPONENTS[10], allowedTypes: ['sensor-dist', 'wifi', 'battery', 'gps', 'bumper'], rotation: 0 }, // Solar
        ]
    }
];

const Simulator: React.FC = () => {
  // Tabs & Layout
  const [activeTab, setActiveTab] = useState<Tab>('designer');
  
  // --- Robot Builder State (Advanced) ---
  const [chassis, setChassis] = useState<RobotSlot[]>(JSON.parse(JSON.stringify(INITIAL_CHASSIS)));
  const [history, setHistory] = useState<RobotSlot[][]>([JSON.parse(JSON.stringify(INITIAL_CHASSIS))]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  const [draggedComponent, setDraggedComponent] = useState<ComponentItem | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [savedDesigns, setSavedDesigns] = useState<SavedDesign[]>([]);
  const [showLoadModal, setShowLoadModal] = useState(false);

  // Power Modeling
  const totalPowerConsumption = chassis.reduce((sum, slot) => sum + (slot.component?.powerConsumption || 0), 0);
  const isPowerCritical = totalPowerConsumption > 8;

  // Real-time Design Validation
  const designStatus = useMemo(() => {
      const errors: string[] = [];
      const cpu = chassis.find(s => s.component?.type === 'cpu');
      const motors = chassis.filter(s => s.component?.type === 'motor');
      
      if (!cpu) errors.push("يجب إضافة وحدة معالجة (CPU) في المركز");
      if (motors.length === 0) errors.push("يجب إضافة محركات للحركة (يمين/يسار)");
      if (totalPowerConsumption > 20) errors.push("تحذير: استهلاك الطاقة مرتفع جداً!");

      return { isValid: errors.length === 0 || (errors.length === 1 && errors[0].includes("تحذير")), errors };
  }, [chassis, totalPowerConsumption]);

  // Editor State
  const [code, setCode] = useState<string>('// اكتب المنطق البرمجي هنا\n["FORWARD", "FORWARD", "TURN_LEFT", "WAIT", "FORWARD"]');
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Configuration State
  const [simConfig, setSimConfig] = useState<SimConfig>(DEFAULT_CONFIG);
  const [selectedScenario, setSelectedScenario] = useState<keyof typeof SCENARIOS>('empty');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [tempConfig, setTempConfig] = useState<SimConfig>(DEFAULT_CONFIG);

  // Simulation State
  const [simState, setSimState] = useState<SimState>({
    ...INITIAL_ROBOT_STATE_BASE,
    x: DEFAULT_CONFIG.startX,
    y: DEFAULT_CONFIG.startY,
    direction: DEFAULT_CONFIG.startDir
  });
  
  const [gridMap, setGridMap] = useState<('empty' | 'obstacle')[][]>([]);
  const [logs, setLogs] = useState<{time: string, msg: string, type: 'info'|'error'|'success'}[]>([]);
  const [visitedCells, setVisitedCells] = useState<string[]>([]);
  const [showPath, setShowPath] = useState(true);
  const [componentStatus, setComponentStatus] = useState<Record<string, 'active' | 'error'>>({});
  
  // Live Telemetry from Engine
  const [sensorData, setSensorData] = useState<SensorReadings>({ distance: 0, temperature: 0, light: 0, collision: false });
  
  // Deployment
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [generatedPyCode, setGeneratedPyCode] = useState('');

  // --- Initialization ---
  useEffect(() => {
    initGrid();
    loadSavedDesigns();
  }, []);

  useEffect(() => {
      initGrid();
  }, [simConfig, selectedScenario]);

  // Keyboard Shortcuts for Undo/Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (activeTab === 'designer') {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                handleUndo();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
                e.preventDefault();
                handleRedo();
            }
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history, activeTab]);

  const initGrid = () => {
    const newMap = Array(simConfig.gridH).fill(null).map(() => Array(simConfig.gridW).fill('empty'));
    // Apply Scenario Obstacles
    const scenario = SCENARIOS[selectedScenario];
    if (scenario) {
        scenario.obstacles.forEach(([x, y]) => {
            if (x < simConfig.gridW && y < simConfig.gridH) {
                newMap[y][x] = 'obstacle';
            }
        });
    }
    setGridMap(newMap);
    setVisitedCells([`${simConfig.startX},${simConfig.startY}`]);
  };

  const loadSavedDesigns = () => {
      const saved = localStorage.getItem('mulaqqen_designs');
      if (saved) setSavedDesigns(JSON.parse(saved));
  };

  // --- Helper Functions ---
  const addLog = (msg: string, type: 'info'|'error'|'success' = 'info') => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' });
    setLogs(prev => [...prev, { time, msg, type }]);
  };

  // --- Designer Logic (Undo/Redo/History) ---
  const updateChassisWithHistory = (newChassis: RobotSlot[]) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newChassis);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      setChassis(newChassis);
  };

  const handleUndo = () => {
      if (historyIndex > 0) {
          setHistoryIndex(historyIndex - 1);
          setChassis(history[historyIndex - 1]);
          addLog('تم التراجع عن آخر إجراء', 'info');
      }
  };

  const handleRedo = () => {
      if (historyIndex < history.length - 1) {
          setHistoryIndex(historyIndex + 1);
          setChassis(history[historyIndex + 1]);
          addLog('تم إعادة الإجراء', 'info');
      }
  };

  const handleSaveDesign = () => {
      const name = prompt("أدخل اسم التصميم:");
      if (!name) return;
      
      // Strip icons (React Nodes) to allow JSON serialization
      const chassisForSave = chassis.map(slot => ({
          ...slot,
          component: slot.component ? { id: slot.component.id } : null
      }));
      
      const newDesign: any = {
          name,
          date: new Date().toLocaleDateString(),
          chassis: chassisForSave
      };
      
      const updatedDesigns = [...savedDesigns, newDesign];
      setSavedDesigns(updatedDesigns);
      localStorage.setItem('mulaqqen_designs', JSON.stringify(updatedDesigns));
      addLog(`تم حفظ التصميم: ${name}`, 'success');
  };

  const handleLoadDesign = (design: SavedDesign) => {
      // Re-hydrate components from the library using IDs
      const hydratedChassis = design.chassis.map((slot: any) => {
          if (slot.component && slot.component.id) {
              const fullComp = AVAILABLE_COMPONENTS.find(c => c.id === slot.component.id);
              if (fullComp) {
                  return { ...slot, component: fullComp };
              }
          }
          return { ...slot, component: null };
      });

      updateChassisWithHistory(hydratedChassis as RobotSlot[]);
      setShowLoadModal(false);
      addLog(`تم تحميل التصميم: ${design.name}`, 'success');
  };

  const deleteSavedDesign = (index: number, e: React.MouseEvent) => {
      e.stopPropagation();
      const updatedDesigns = savedDesigns.filter((_, i) => i !== index);
      setSavedDesigns(updatedDesigns);
      localStorage.setItem('mulaqqen_designs', JSON.stringify(updatedDesigns));
      addLog('تم حذف التصميم المحفوظ', 'info');
  };

  // --- Drag & Drop Logic ---
  const handleDragStart = (e: React.DragEvent, component: ComponentItem) => {
    setDraggedComponent(component);
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDragOver = (e: React.DragEvent, slot: RobotSlot) => {
    e.preventDefault(); 
    if (draggedComponent && slot.allowedTypes.includes(draggedComponent.type)) {
      e.dataTransfer.dropEffect = "copy";
    } else {
      e.dataTransfer.dropEffect = "none";
    }
  };

  const handleComponentPlacement = (slotId: string) => {
    if (!draggedComponent) return;
    
    const newChassis = chassis.map(s => {
      if (s.id === slotId && s.allowedTypes.includes(draggedComponent.type)) {
        return { ...s, component: draggedComponent };
      }
      return s;
    });
    
    if (JSON.stringify(newChassis) !== JSON.stringify(chassis)) {
        updateChassisWithHistory(newChassis);
        addLog(`تم تركيب ${draggedComponent.name}`, 'success');
    } else {
        addLog('لا يمكن تركيب هذا المكون هنا', 'error');
    }
    setDraggedComponent(null);
  };

  const handleRotateComponent = (slotId: string) => {
      const newChassis = chassis.map(s => {
          if (s.id === slotId && s.component) {
              return { ...s, rotation: (s.rotation + 90) % 360 };
          }
          return s;
      });
      updateChassisWithHistory(newChassis);
  };

  const handleRemoveComponent = (slotId: string) => {
      const newChassis = chassis.map(s => s.id === slotId ? { ...s, component: null, rotation: 0 } : s);
      updateChassisWithHistory(newChassis);
      setSelectedSlotId(null);
  };

  const insertCodeSnippet = (slot: RobotSlot) => {
      if (slot.component?.snippet) {
          setCode(prev => prev + '\n' + slot.component?.snippet);
          setActiveTab('editor');
          addLog('تم إدراج كود المكون في المحرر', 'success');
      }
  };

  // --- Simulation Engine Mapping & Execution ---
  const mapChassisToSchema = (): RobotSchema => {
      const findComp = (id: string) => {
          const slot = chassis.find(s => s.id === id);
          if (!slot || !slot.component) return null;
          return {
              id: slot.component.id,
              type: slot.component.type,
              name: slot.component.name,
              powerConsumption: slot.component.powerConsumption
          };
      };

      const processorSlot = chassis.find(s => s.id === 'center');
      const processor = processorSlot?.component ? {
          type: processorSlot.component.type,
          position: 'center'
      } : null;

      return {
          processor,
          slots: {
              front: findComp('front'),
              back: findComp('back'),
              left: findComp('left'),
              right: findComp('right')
          },
          power: {
              totalCapacity: 100,
              current: simState.battery,
              consumptionPerTick: totalPowerConsumption
          }
      };
  };

  const runSimulation = async () => {
    if (simState.isRunning) return;

    if (!designStatus.isValid) {
        addLog("فشل التحقق من التصميم. يرجى مراجعة التنبيهات.", "error");
        return;
    }

    setActiveTab('simulator');
    setSimState(prev => ({ ...prev, isRunning: true }));
    addLog('بدء تشغيل نظام المحاكاة...', 'success');

    // Parse Commands
    let commands: string[] = [];
    try {
      const jsonStr = code.replace(/\/\/.*$/gm, '').trim();
      commands = JSON.parse(jsonStr);
    } catch (e) {
      addLog('خطأ في تحليل الكود البرمجي. تأكد من صيغة JSON.', 'error');
      setSimState(prev => ({ ...prev, isRunning: false }));
      return;
    }

    // Initialize Engine
    const robotSchema = mapChassisToSchema();
    const engine = new SimulationEngine(robotSchema, gridMap, {
        x: simState.x, 
        y: simState.y, 
        direction: simState.direction,
        battery: 100, 
        temperature: 35
    });

    // Local Battery Tracking
    let currentBattery = 100;

    // Execution Loop
    for (const cmd of commands) {
      if (currentBattery <= 0) {
          addLog("نفاذ البطارية! توقف النظام.", "error");
          break;
      }

      await new Promise(r => setTimeout(r, 800)); 

      // Execute Step in Engine
      const result = engine.step(cmd);
      currentBattery = result.battery;

      // Update React State from Engine Result
      setSimState(prev => ({ 
          ...prev, 
          x: result.x, 
          y: result.y, 
          direction: result.direction, 
          battery: result.battery, 
          temperature: result.temperature 
      }));
      
      setSensorData(result.sensors);
      
      // Handle Logs from Engine
      result.logs.forEach(log => {
          const type = log.includes("ERROR") ? 'error' : log.includes("WARNING") ? 'error' : 'info';
          addLog(log, type);
      });
      
      if (result.moved) {
          addLog(`نفذ الأمر: ${cmd}`, 'info');
          const posKey = `${result.x},${result.y}`;
          setVisitedCells(prev => prev.includes(posKey) ? prev : [...prev, posKey]);
      }

      // --- VISUAL FEEDBACK LOGIC ---
      const currentStatus: Record<string, 'active' | 'error'> = {};
      
      // 1. Motor Activity
      if (['FORWARD', 'BACKWARD', 'TURN_LEFT', 'TURN_RIGHT'].includes(cmd)) {
          if (chassis.find(s => s.id === 'left')?.component?.type === 'motor') currentStatus['left'] = 'active';
          if (chassis.find(s => s.id === 'right')?.component?.type === 'motor') currentStatus['right'] = 'active';
      }

      // 2. Sensor Activity (Front/Back)
      if (result.logs.some(l => l.includes("Obstacle") || l.includes("Impact") || l.includes("WARNING"))) {
          const frontSensor = chassis.find(s => s.id === 'front' && ['sensor-dist', 'lidar', 'bumper'].includes(s.component?.type || ''));
          if (frontSensor) currentStatus['front'] = 'error';
      } else {
          const frontSensor = chassis.find(s => s.id === 'front');
          if (frontSensor?.component) currentStatus['front'] = 'active';
      }

      setComponentStatus(currentStatus);
      setTimeout(() => setComponentStatus({}), 600);
    }

    setSimState(prev => ({ ...prev, isRunning: false }));
    addLog('اكتمل تنفيذ البرنامج.', 'success');
  };

  // --- Other Handlers (PDF, AI, Reset) ---
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Robot Design Specification", 10, 10);
    let y = 20;
    chassis.forEach(s => {
        if(s.component) doc.text(`${s.labelEn}: ${s.component.nameEn}`, 10, y+=10);
    });
    doc.save("robot.pdf");
  };

  const handleAiGenerate = async () => {
    if (!aiInput.trim()) return;
    setAiLoading(true);
    const cmds = await translateCommands(aiInput);
    if (cmds.length > 0) setCode(JSON.stringify(cmds, null, 2));
    setAiLoading(false);
  };

  const resetSim = () => {
    setSimState({ ...INITIAL_ROBOT_STATE_BASE, x: simConfig.startX, y: simConfig.startY, direction: simConfig.startDir });
    setVisitedCells([`${simConfig.startX},${simConfig.startY}`]);
    setLogs([]);
    setSensorData({ distance: 0, temperature: 0, light: 0, collision: false });
    setComponentStatus({});
    initGrid();
  };

  const saveSettings = () => {
      const validatedConfig = {
          ...tempConfig,
          startX: Math.min(Math.max(0, tempConfig.startX), tempConfig.gridW - 1),
          startY: Math.min(Math.max(0, tempConfig.startY), tempConfig.gridH - 1),
      };
      
      setSimConfig(validatedConfig);
      setSimState(prev => ({
          ...prev,
          x: validatedConfig.startX,
          y: validatedConfig.startY,
          direction: validatedConfig.startDir,
          isRunning: false
      }));
      setVisitedCells([`${validatedConfig.startX},${validatedConfig.startY}`]);
      setLogs([]);
      setShowSettingsModal(false);
      addLog('تم تحديث الإعدادات.', 'success');
  };

  const TabButton = ({ id, icon: Icon, label }: { id: Tab, icon: any, label: string }) => (
    <button onClick={() => setActiveTab(id)} className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 ${activeTab === id ? 'bg-highlight/10 text-highlight border border-highlight/30' : 'text-gray-400 hover:text-white'}`}>
        <Icon size={24} className="mb-1" />
        <span className="text-[10px] font-bold">{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-5rem)] overflow-hidden bg-primary font-['Tajawal']">
      
      {/* SIDEBAR */}
      <div className="w-full lg:w-80 bg-secondary border-l border-white/5 flex flex-col flex-shrink-0 z-20 shadow-2xl">
          <div className="p-3 grid grid-cols-3 gap-2 border-b border-white/5 bg-secondary">
             <TabButton id="designer" icon={LayoutTemplate} label="بناء" />
             <TabButton id="editor" icon={FileCode} label="كود" />
             <TabButton id="simulator" icon={MonitorPlay} label="محاكاة" />
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar flex flex-col bg-secondary/50">
             {activeTab === 'designer' && (
                 <div className="p-4">
                     <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-bold flex items-center gap-2 text-sm"><Box size={16} className="text-accent" /> مكتبة المكونات</h3>
                        <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-1 rounded">اسحب للإضافة</span>
                     </div>
                     <div className="space-y-3">
                         {AVAILABLE_COMPONENTS.map(comp => (
                            <div key={comp.id} draggable onDragStart={(e) => handleDragStart(e, comp)} onDragEnd={() => setDraggedComponent(null)}
                                className="group relative p-3 rounded-xl border bg-primary border-white/5 hover:border-accent hover:bg-white/5 cursor-grab active:cursor-grabbing transition flex items-center gap-3"
                            >
                                <div className="p-2 rounded-lg bg-white/5 text-gray-400 group-hover:text-accent">{comp.icon}</div>
                                <div>
                                    <div className="font-bold text-white text-sm">{comp.name}</div>
                                    <div className="text-[10px] text-gray-500 flex items-center gap-1">
                                        <Zap size={10} className={comp.powerConsumption > 0 ? 'text-yellow-500' : 'text-green-500'} />
                                        {comp.powerConsumption > 0 ? `-${comp.powerConsumption} طاقة` : `+${Math.abs(comp.powerConsumption)} طاقة`}
                                    </div>
                                </div>
                                {/* Tooltip */}
                                <div className="absolute right-full top-0 mr-2 w-48 bg-slate-800 p-3 rounded-lg shadow-xl border border-white/10 opacity-0 group-hover:opacity-100 pointer-events-none transition z-50">
                                    <h4 className="font-bold text-white text-xs mb-1">{comp.name}</h4>
                                    <p className="text-[10px] text-gray-400 leading-relaxed">{comp.description}</p>
                                    <div className="mt-2 text-[10px] text-highlight font-mono bg-black/30 p-1 rounded">منافذ: {['center','front'].join(', ')}</div>
                                </div>
                            </div>
                         ))}
                     </div>
                 </div>
             )}

             {activeTab === 'editor' && (
                 <div className="p-4">
                     <div className="bg-primary p-3 rounded-xl border border-white/5 mb-4">
                         <h4 className="text-xs font-bold text-gray-400 mb-2">مولد الكود الذكي</h4>
                         <textarea value={aiInput} onChange={(e) => setAiInput(e.target.value)} placeholder="مثال: تحرك للأمام مرتين ثم در يميناً" className="w-full bg-transparent text-sm text-white focus:outline-none resize-none h-20 mb-2"/>
                         <button onClick={handleAiGenerate} disabled={aiLoading} className="w-full bg-accent hover:bg-indigo-600 text-white py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2">
                             {aiLoading ? <RefreshCw className="animate-spin" size={12} /> : <Zap size={12} />} توليد
                         </button>
                     </div>
                 </div>
             )}

            {activeTab === 'simulator' && (
                 <div className="p-4 space-y-4">
                    {!designStatus.isValid && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                            <h4 className="text-red-400 font-bold text-xs mb-2 flex items-center gap-1"><AlertOctagon size={12}/> تنبيهات التصميم</h4>
                            <ul className="list-disc list-inside text-[10px] text-red-300 space-y-1">
                                {designStatus.errors.map((err, i) => <li key={i}>{err}</li>)}
                            </ul>
                            <button onClick={() => setActiveTab('designer')} className="mt-2 w-full py-1 bg-red-500/20 text-red-400 text-xs rounded hover:bg-red-500/30">تصحيح في المصمم</button>
                        </div>
                    )}
                     <div className="bg-primary p-3 rounded-xl border border-white/5">
                        <label className="text-xs text-gray-400 font-bold mb-2 block">سيناريو المحاكاة</label>
                        <select value={selectedScenario} onChange={(e) => setSelectedScenario(e.target.value as any)} className="w-full bg-secondary border border-white/10 text-white text-xs rounded p-2 outline-none">
                            {Object.entries(SCENARIOS).map(([key, val]) => (
                                <option key={key} value={key}>{val.name}</option>
                            ))}
                        </select>
                     </div>
                     
                     {/* Live Telemetry Panel */}
                     <div className="bg-primary rounded-xl border border-white/5 overflow-hidden">
                        <div className="bg-white/5 p-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"><Activity size={12}/> Live Telemetry</div>
                        <div className="p-3 space-y-2">
                           <div className="flex justify-between items-center text-xs">
                              <span className="text-gray-400">Distance</span>
                              <span className="text-white font-mono">{sensorData.distance > 100 ? '>100' : Math.round(sensorData.distance)} cm</span>
                           </div>
                           <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                               <div className="h-full bg-highlight" style={{width: `${Math.min(100, (sensorData.distance/100)*100)}%`}}></div>
                           </div>
                           
                           <div className="flex justify-between items-center text-xs pt-1">
                              <span className="text-gray-400">Light</span>
                              <span className="text-white font-mono">{Math.round(sensorData.light)}%</span>
                           </div>
                           
                           <div className="flex justify-between items-center text-xs pt-1">
                              <span className="text-gray-400">Temp</span>
                              <span className="text-white font-mono">{Math.round(sensorData.temperature)}°C</span>
                           </div>
                        </div>
                     </div>

                     <button onClick={resetSim} className="w-full bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg text-xs font-bold border border-white/5 flex items-center justify-center gap-2">
                        <RotateCcw size={14} /> إعادة ضبط
                     </button>
                 </div>
             )}
          </div>
          
          {/* Console Logs */}
          <div className="h-1/3 border-t border-white/10 bg-[#0f172a] flex flex-col">
             <div className="p-2 px-3 bg-secondary border-b border-white/5 flex justify-between items-center">
                 <span className="text-[10px] font-bold text-gray-400 flex items-center gap-2"><Terminal size={12}/> سجل النظام</span>
                 <button onClick={() => setLogs([])} className="text-gray-600 hover:text-red-400"><Trash2 size={12}/></button>
             </div>
             <div className="flex-1 overflow-y-auto p-3 font-mono text-[10px] space-y-1 custom-scrollbar">
                {logs.map((l, i) => (
                    <div key={i} className={`flex gap-2 ${l.type === 'error' ? 'text-red-400' : l.type === 'success' ? 'text-green-400' : 'text-gray-500'}`}>
                        <span className="opacity-30">[{l.time}]</span> {l.msg}
                    </div>
                ))}
             </div>
          </div>
      </div>

      {/* MAIN WORKSPACE */}
      <div className="flex-1 relative bg-[#020617] flex flex-col overflow-hidden">
          
          {/* TOOLBAR (DESIGNER) */}
          {activeTab === 'designer' && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-secondary/80 backdrop-blur border border-white/10 p-1.5 rounded-xl flex gap-1 shadow-xl">
                  <button onClick={handleUndo} disabled={historyIndex === 0} className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-30 text-white" title="تراجع (Ctrl+Z)"><Undo size={18}/></button>
                  <button onClick={handleRedo} disabled={historyIndex === history.length - 1} className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-30 text-white" title="إعادة (Ctrl+Y)"><Redo size={18}/></button>
                  <div className="w-px bg-white/10 mx-1"></div>
                  <button onClick={handleSaveDesign} className="p-2 rounded-lg hover:bg-white/10 text-white" title="حفظ التصميم"><Save size={18}/></button>
                  <button onClick={() => setShowLoadModal(true)} className="p-2 rounded-lg hover:bg-white/10 text-white" title="تحميل تصميم"><FolderOpen size={18}/></button>
                  <div className="w-px bg-white/10 mx-1"></div>
                  <button onClick={() => setChassis(JSON.parse(JSON.stringify(INITIAL_CHASSIS)))} className="p-2 rounded-lg hover:bg-red-500/20 text-red-400" title="مسح الكل"><Trash2 size={18}/></button>
                  
                  <div className="w-px bg-white/10 mx-1"></div>
                  
                  {/* Validation Status */}
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border backdrop-blur-md ${designStatus.isValid ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400 animate-pulse'}`} title={designStatus.isValid ? "التصميم سليم" : "يوجد أخطاء في التصميم"}>
                      {designStatus.isValid ? <CheckCircle size={16}/> : <AlertOctagon size={16}/>}
                      <span className="text-xs font-bold hidden sm:inline">{designStatus.isValid ? "جاهز" : "غير مكتمل"}</span>
                  </div>
              </div>
          )}

          {/* MAIN CONTROLS (SIMULATOR) */}
          <div className="absolute top-4 right-4 z-30 flex flex-col gap-2">
              {activeTab === 'simulator' && (
                 <button onClick={runSimulation} disabled={simState.isRunning || !designStatus.isValid} className={`bg-highlight hover:bg-sky-500 text-white px-6 py-2 rounded-xl font-bold shadow-lg transition flex items-center gap-2 disabled:opacity-50 ${!designStatus.isValid ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {simState.isRunning ? <RefreshCw className="animate-spin" size={18} /> : <Play size={18} />} تشغيل
                 </button>
              )}
              <button onClick={() => setShowSettingsModal(true)} className="bg-secondary p-2 rounded-xl border border-white/10 text-white hover:bg-white/10"><Settings size={20}/></button>
          </div>

          {/* POWER STATS (DESIGNER) */}
          {activeTab === 'designer' && (
              <div className="absolute top-4 right-4 z-30 bg-secondary/80 backdrop-blur border border-white/10 p-3 rounded-xl shadow-xl flex flex-col items-end">
                  <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">استهلاك الطاقة</div>
                  <div className={`text-lg font-mono font-bold flex items-center gap-2 ${isPowerCritical ? 'text-red-500' : 'text-emerald-400'}`}>
                      {Math.abs(totalPowerConsumption).toFixed(1)}% 
                      {isPowerCritical ? <AlertTriangle size={18} className="animate-pulse"/> : <Zap size={18}/>}
                  </div>
                  <div className="text-[10px] text-gray-500">{totalPowerConsumption > 0 ? 'استهلاك / دورة' : 'توليد / دورة'}</div>
              </div>
          )}

          {/* DESIGNER CANVAS */}
          {activeTab === 'designer' && (
              <div className="flex-1 relative flex items-center justify-center bg-grid-pattern" onClick={() => setSelectedSlotId(null)}>
                   <div className="relative w-full max-w-2xl aspect-square max-h-[70vh]">
                        {/* Connection Lines */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[55%] h-[2px] bg-white/5"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[55%] w-[2px] bg-white/5"></div>

                        {chassis.map(slot => {
                            // Positions
                            let pos = '';
                            if (slot.id === 'center') pos = 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40';
                            else if (slot.id === 'front') pos = 'top-[12%] left-1/2 -translate-x-1/2 w-28 h-28';
                            else if (slot.id === 'back') pos = 'bottom-[12%] left-1/2 -translate-x-1/2 w-28 h-28';
                            else if (slot.id === 'left') pos = 'left-[12%] top-1/2 -translate-y-1/2 w-28 h-28';
                            else if (slot.id === 'right') pos = 'right-[12%] top-1/2 -translate-y-1/2 w-28 h-28';

                            const isTarget = draggedComponent && slot.allowedTypes.includes(draggedComponent.type);
                            const isSelected = selectedSlotId === slot.id;

                            return (
                                <div key={slot.id}
                                    onClick={(e) => { e.stopPropagation(); setSelectedSlotId(slot.id); }}
                                    onDragOver={(e) => handleDragOver(e, slot)}
                                    onDrop={() => handleComponentPlacement(slot.id)}
                                    className={`absolute ${pos} rounded-2xl flex flex-col items-center justify-center transition-all duration-300 relative
                                        ${slot.component ? 'bg-secondary border-2 border-accent shadow-lg' : 'bg-white/5 border-2 border-dashed border-white/10'}
                                        ${isTarget ? 'border-highlight bg-highlight/20 scale-110 shadow-[0_0_20px_rgba(56,189,248,0.4)] ring-4 ring-highlight/30 z-20' : ''}
                                        ${isSelected ? 'ring-2 ring-offset-2 ring-offset-black ring-accent z-30' : ''}
                                    `}
                                >
                                    <span className="absolute -top-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">{slot.labelEn}</span>
                                    
                                    {slot.component ? (
                                        <>
                                            <div className="text-accent mb-2 transform scale-125 transition-transform" style={{ transform: `rotate(${slot.rotation}deg) scale(1.25)` }}>
                                                {slot.component.icon}
                                            </div>
                                            <span className="text-xs font-bold text-white text-center px-1 line-clamp-1">{slot.component.name}</span>
                                            
                                            {/* Selected Component Menu */}
                                            {isSelected && (
                                                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-slate-800 rounded-lg p-1 flex gap-1 shadow-xl border border-white/10 animate-scale-up z-50">
                                                    <button onClick={() => handleRotateComponent(slot.id)} className="p-1.5 hover:bg-white/10 rounded text-gray-300 hover:text-white" title="تدوير"><RotateCw size={14}/></button>
                                                    <button onClick={() => insertCodeSnippet(slot)} className="p-1.5 hover:bg-white/10 rounded text-gray-300 hover:text-highlight" title="إدراج كود"><Code size={14}/></button>
                                                    <div className="w-px bg-white/10 my-1"></div>
                                                    <button onClick={() => handleRemoveComponent(slot.id)} className="p-1.5 hover:bg-red-500/20 rounded text-gray-300 hover:text-red-400" title="حذف"><Trash2 size={14}/></button>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        isTarget ? <div className="text-highlight animate-bounce"><MousePointerClick size={24}/></div> : <Plus size={24} className="text-gray-700 opacity-50"/>
                                    )}
                                </div>
                            );
                        })}
                   </div>
              </div>
          )}

          {/* EDITOR CANVAS */}
          {activeTab === 'editor' && (
             <div className="flex-1 p-8 bg-[#020617]">
                 <div className="h-full bg-[#0f172a] rounded-2xl border border-white/10 shadow-2xl overflow-hidden relative">
                     <div className="absolute top-0 left-0 right-0 bg-[#1e293b] h-9 border-b border-white/5 px-4 flex items-center gap-2">
                         <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div><div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div></div>
                         <span className="text-[10px] font-mono text-gray-400 ml-2">logic.json</span>
                     </div>
                     <textarea value={code} onChange={e => setCode(e.target.value)} className="w-full h-full bg-transparent p-6 pt-12 text-green-400 font-mono text-sm resize-none focus:outline-none" spellCheck={false} />
                 </div>
             </div>
          )}

          {/* SIMULATOR CANVAS */}
          {activeTab === 'simulator' && (
              <div className="flex-1 relative flex items-center justify-center bg-[#020617] overflow-auto custom-scrollbar p-8">
                  {/* HUD */}
                  <div className="absolute top-6 left-6 z-30 bg-secondary/90 backdrop-blur p-3 rounded-xl border border-white/10 shadow-2xl flex gap-4 pointer-events-none">
                      <div><div className="text-[10px] text-gray-500 font-bold">POS</div><div className="font-mono text-white">{simState.x}, {simState.y}</div></div>
                      <div className="w-px bg-white/10"></div>
                      <div><div className="text-[10px] text-gray-500 font-bold">DIR</div><div className="font-mono text-white">{simState.direction}°</div></div>
                  </div>

                  {/* Grid */}
                  <div className="grid gap-[2px] bg-[#1e293b] p-2 rounded-xl shadow-2xl border border-white/5" style={{ gridTemplateColumns: `repeat(${simConfig.gridW}, minmax(0, 1fr))` }}>
                      {Array(simConfig.gridH).fill(0).map((_, y) => Array(simConfig.gridW).fill(0).map((_, x) => {
                          const isRobot = simState.x === x && simState.y === y;
                          const isObstacle = gridMap[y][x] === 'obstacle';
                          const isVisited = showPath && visitedCells.includes(`${x},${y}`);
                          
                          return (
                              <div key={`${x}-${y}`} className={`w-12 h-12 sm:w-14 sm:h-14 rounded-md relative flex items-center justify-center
                                  ${isObstacle ? 'bg-red-900/20 border border-red-500/20' : 'bg-[#0f172a]'}
                                  ${isVisited && !isRobot && !isObstacle ? 'bg-highlight/5' : ''}
                              `}>
                                  {isObstacle && <Box size={20} className="text-red-500/30"/>}
                                  {isVisited && !isRobot && !isObstacle && <div className="w-1.5 h-1.5 rounded-full bg-highlight/50 shadow-[0_0_8px_rgba(56,189,248,0.8)]"></div>}
                                  {isRobot && (
                                      <div className="relative z-10 transition-all duration-500 ease-out" style={{ transform: `rotate(${simState.direction}deg)` }}>
                                          
                                          {/* Floating Status Indicator (Temp & Battery) */}
                                          <div className="absolute -top-14 left-1/2 -translate-x-1/2 w-max pointer-events-none transition-transform duration-500" style={{ transform: `rotate(-${simState.direction}deg)` }}>
                                              <div className="flex items-center gap-2 px-2 py-1 rounded-md text-[10px] font-bold border border-white/10 bg-slate-900/90 backdrop-blur shadow-xl">
                                                  <div className={`flex items-center gap-1 ${simState.temperature > 60 ? 'text-red-400' : 'text-sky-400'}`}>
                                                      <Thermometer size={10} />
                                                      <span>{Math.round(simState.temperature)}°C</span>
                                                  </div>
                                                  <div className="w-px h-3 bg-white/20"></div>
                                                  <div className={`flex items-center gap-1 ${simState.battery < 20 ? 'text-red-400' : 'text-emerald-400'}`}>
                                                      <Battery size={10} />
                                                      <span>{Math.round(simState.battery)}%</span>
                                                  </div>
                                              </div>
                                          </div>

                                          {/* Main Body */}
                                          <div className={`w-10 h-10 bg-secondary rounded-lg border-2 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.3)] relative
                                             ${simState.temperature > 80 ? 'border-red-500 animate-pulse' : 'border-accent'}
                                          `}>
                                             {/* Center Indicator (CPU) */}
                                             <div className="w-2 h-2 bg-highlight rounded-full shadow-[0_0_10px_#38bdf8] relative z-10"></div>
                                             
                                             {/* Direction Arrow */}
                                             <div className="absolute -top-3 text-accent"><ArrowRight size={12} className="-rotate-90"/></div>

                                             {/* --- COMPONENT VISUALS --- */}
                                             
                                             {/* Left Motor/Wheel */}
                                             <div className={`absolute -left-1.5 top-1 bottom-1 w-1.5 rounded-l-md transition-all duration-300 
                                                 ${componentStatus['left'] === 'active' ? 'bg-highlight shadow-[0_0_8px_#38bdf8]' : 'bg-gray-700'}
                                             `}></div>

                                             {/* Right Motor/Wheel */}
                                             <div className={`absolute -right-1.5 top-1 bottom-1 w-1.5 rounded-r-md transition-all duration-300 
                                                 ${componentStatus['right'] === 'active' ? 'bg-highlight shadow-[0_0_8px_#38bdf8]' : 'bg-gray-700'}
                                             `}></div>

                                             {/* Front Sensor/Tool */}
                                             <div className={`absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-1.5 rounded-full transition-all duration-300
                                                 ${componentStatus['front'] === 'active' ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 
                                                   componentStatus['front'] === 'error' ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-gray-700'}
                                             `}></div>

                                             {/* Back Component */}
                                             <div className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-1.5 rounded-full transition-all duration-300
                                                 ${componentStatus['back'] === 'active' ? 'bg-purple-400 shadow-[0_0_8px_#c084fc]' : 'bg-gray-700'}
                                             `}></div>

                                          </div>
                                      </div>
                                  )}
                              </div>
                          );
                      }))}
                  </div>
              </div>
          )}
      </div>

      {/* --- MODALS --- */}
      
      {/* Load Design Modal */}
      {showLoadModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-secondary w-full max-w-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                  <div className="p-4 border-b border-white/5 flex justify-between items-center bg-primary">
                      <h3 className="text-white font-bold">تحميل تصميم</h3>
                      <button onClick={() => setShowLoadModal(false)} className="text-gray-400 hover:text-white"><X size={20}/></button>
                  </div>
                  <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                      
                      {/* Pre-built Designs */}
                      <div>
                          <h4 className="text-xs font-bold text-accent uppercase tracking-wider mb-2">قوالب جاهزة</h4>
                          <div className="space-y-2">
                              {PREBUILT_DESIGNS.map((d, i) => (
                                  <div key={`pre-${i}`} className="w-full p-3 rounded-xl border border-white/5 bg-primary hover:border-highlight hover:bg-highlight/5 flex items-center justify-between group transition cursor-pointer" onClick={() => handleLoadDesign(d)}>
                                      <div className="text-right flex-1">
                                          <div className="text-white font-bold text-sm group-hover:text-highlight">{d.name}</div>
                                          <div className="text-[10px] text-gray-500">{d.date}</div>
                                      </div>
                                      <Layers size={18} className="text-gray-600 group-hover:text-highlight"/>
                                  </div>
                              ))}
                          </div>
                      </div>

                      {/* User Saved Designs */}
                      <div>
                          <h4 className="text-xs font-bold text-accent uppercase tracking-wider mb-2">تصاميمك المحفوظة</h4>
                          {savedDesigns.length === 0 ? (
                              <div className="text-center py-4 text-gray-500 text-sm border border-dashed border-white/10 rounded-xl">لا توجد تصاميم محفوظة بعد.</div>
                          ) : (
                              <div className="space-y-2">
                                  {savedDesigns.map((d, i) => (
                                      <div key={i} className="w-full p-3 rounded-xl border border-white/5 bg-primary hover:border-accent flex items-center justify-between group transition cursor-pointer" onClick={() => handleLoadDesign(d)}>
                                          <div className="text-right flex-1">
                                              <div className="text-white font-bold text-sm group-hover:text-accent">{d.name}</div>
                                              <div className="text-[10px] text-gray-500">{d.date}</div>
                                          </div>
                                          <div className="flex items-center gap-2">
                                              <button onClick={(e) => deleteSavedDesign(i, e)} className="p-1.5 rounded hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition">
                                                  <Trash2 size={16}/>
                                              </button>
                                              <FolderOpen size={18} className="text-gray-600 group-hover:text-white"/>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          )}
                      </div>

                  </div>
              </div>
          </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-secondary border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
                  <div className="bg-primary p-4 border-b border-white/5 flex justify-between items-center rounded-t-2xl">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2"><Settings size={18} className="text-accent"/> إعدادات البيئة</h3>
                      <button onClick={() => setShowSettingsModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
                  </div>
                  <div className="p-6 space-y-6">
                      <div>
                          <label className="block text-sm font-bold text-white mb-3">أبعاد الشبكة</label>
                          <div className="grid grid-cols-2 gap-4">
                              <div><span className="block text-xs text-gray-400 mb-1">W</span><input type="number" min="5" max="20" value={tempConfig.gridW} onChange={e => setTempConfig({...tempConfig, gridW: +e.target.value})} className="w-full bg-primary border border-white/10 rounded-lg p-2 text-white text-center"/></div>
                              <div><span className="block text-xs text-gray-400 mb-1">H</span><input type="number" min="5" max="20" value={tempConfig.gridH} onChange={e => setTempConfig({...tempConfig, gridH: +e.target.value})} className="w-full bg-primary border border-white/10 rounded-lg p-2 text-white text-center"/></div>
                          </div>
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-white mb-3">نقطة البداية</label>
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <span className="block text-xs text-gray-400 mb-1">X</span>
                                  <input 
                                    type="number" min="0" max={tempConfig.gridW - 1}
                                    value={tempConfig.startX}
                                    onChange={e => setTempConfig({...tempConfig, startX: Math.min(Math.max(0, parseInt(e.target.value) || 0), tempConfig.gridW - 1)})}
                                    className="w-full bg-primary border border-white/10 rounded-lg p-2 text-white text-center focus:border-highlight focus:outline-none"
                                  />
                              </div>
                              <div>
                                  <span className="block text-xs text-gray-400 mb-1">Y</span>
                                  <input 
                                    type="number" min="0" max={tempConfig.gridH - 1}
                                    value={tempConfig.startY}
                                    onChange={e => setTempConfig({...tempConfig, startY: Math.min(Math.max(0, parseInt(e.target.value) || 0), tempConfig.gridH - 1)})}
                                    className="w-full bg-primary border border-white/10 rounded-lg p-2 text-white text-center focus:border-highlight focus:outline-none"
                                  />
                              </div>
                          </div>
                      </div>

                      <div>
                          <label className="block text-sm font-bold text-white mb-3">الاتجاه الأولي</label>
                          <div className="grid grid-cols-4 gap-2">
                              {[0, 90, 180, 270].map(dir => (
                                  <button 
                                      key={dir}
                                      onClick={() => setTempConfig({...tempConfig, startDir: dir as any})}
                                      className={`py-2 rounded-lg text-xs font-bold border transition flex items-center justify-center hover:border-accent
                                          ${tempConfig.startDir === dir 
                                              ? 'bg-highlight/20 border-highlight text-highlight shadow-inner' 
                                              : 'bg-primary border-white/10 text-gray-400 hover:bg-white/5'
                                          }
                                      `}
                                  >
                                      {dir === 0 ? '↑' : dir === 90 ? '→' : dir === 180 ? '↓' : '←'}
                                  </button>
                              ))}
                          </div>
                      </div>
                      <button onClick={saveSettings} className="w-full bg-accent text-white py-2 rounded-lg font-bold shadow-lg">حفظ التغييرات</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Simulator;
