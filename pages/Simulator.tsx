
import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, RefreshCw, RotateCcw, Terminal, LayoutTemplate, FileCode, 
  PlayCircle, List, Trash2, Cpu, Download, CheckCircle, Box, 
  Zap, Thermometer, Move, Eye, Wifi, Speaker, Battery, GripHorizontal,
  AlertCircle, Settings, Save, X, RotateCw, MousePointerClick, Code,
  ArrowRight, Plus, Footprints, Flag, MonitorPlay, Layers, Sun, MapPin, Monitor
} from 'lucide-react';
import { RobotCommand, RobotState } from '../types';
import { translateCommands } from '../services/geminiService';

// --- Types ---
type Tab = 'designer' | 'editor' | 'simulator';

interface ComponentItem {
  id: string;
  type: 'cpu' | 'motor' | 'sensor-dist' | 'sensor-heat' | 'sensor-light' | 'camera' | 'gripper' | 'speaker' | 'wifi' | 'battery' | 'gps' | 'display';
  name: string;
  icon: React.ReactNode;
  powerConsumption: number; // % per tick
  description: string;
}

interface RobotSlot {
  id: 'center' | 'front' | 'back' | 'left' | 'right';
  label: string;
  component: ComponentItem | null;
  allowedTypes: string[];
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

// --- Constants ---
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
  { id: 'cpu-1', type: 'cpu', name: 'وحدة معالجة مركزية', icon: <Cpu size={20} />, powerConsumption: 0.1, description: 'عقل الروبوت الأساسي' },
  { id: 'motor-1', type: 'motor', name: 'محرك دفع', icon: <Settings size={20} />, powerConsumption: 2.5, description: 'يسمح بالحركة والدوران' },
  { id: 'sensor-d', type: 'sensor-dist', name: 'حساس مسافة', icon: <Wifi size={20} />, powerConsumption: 0.5, description: 'قياس البعد عن العوائق' },
  { id: 'sensor-t', type: 'sensor-heat', name: 'حساس حرارة', icon: <Thermometer size={20} />, powerConsumption: 0.2, description: 'مراقبة درجة الحرارة' },
  { id: 'cam-1', type: 'camera', name: 'كاميرا AI', icon: <Eye size={20} />, powerConsumption: 1.5, description: 'التعرف على البيئة' },
  { id: 'grip-1', type: 'gripper', name: 'ذراع قبض', icon: <GripHorizontal size={20} />, powerConsumption: 3.0, description: 'الإمساك بالأجسام' },
  { id: 'spk-1', type: 'speaker', name: 'مكبر صوت', icon: <Speaker size={20} />, powerConsumption: 0.8, description: 'إصدار تنبيهات صوتية' },
  { id: 'wifi-1', type: 'wifi', name: 'وحدة اتصال WiFi', icon: <Wifi size={20} />, powerConsumption: 1.2, description: 'إرسال البيانات سحابياً' },
  { id: 'light-1', type: 'sensor-light', name: 'حساس ضوء', icon: <Sun size={20} />, powerConsumption: 0.3, description: 'اكتشاف مصادر الضوء' },
  { id: 'bat-1', type: 'battery', name: 'بطارية إضافية', icon: <Battery size={20} />, powerConsumption: 0, description: 'زيادة سعة الطاقة' },
  { id: 'gps-1', type: 'gps', name: 'وحدة GPS', icon: <MapPin size={20} />, powerConsumption: 1.0, description: 'تحديد الموقع الجغرافي' },
  { id: 'disp-1', type: 'display', name: 'شاشة OLED', icon: <Monitor size={20} />, powerConsumption: 0.5, description: 'عرض البيانات' },
];

const Simulator: React.FC = () => {
  // Tabs & Layout
  const [activeTab, setActiveTab] = useState<Tab>('designer');
  
  // Robot Builder State
  const [chassis, setChassis] = useState<RobotSlot[]>([
    { id: 'center', label: 'المعالج (الوسط)', component: AVAILABLE_COMPONENTS[0], allowedTypes: ['cpu'] }, // Default CPU installed
    { id: 'front', label: 'الجهة الأمامية', component: null, allowedTypes: ['sensor-dist', 'camera', 'gripper', 'sensor-light', 'display'] },
    { id: 'left', label: 'الجانب الأيسر', component: null, allowedTypes: ['motor', 'sensor-heat', 'speaker', 'sensor-light', 'battery'] },
    { id: 'right', label: 'الجانب الأيمن', component: null, allowedTypes: ['motor', 'sensor-heat', 'speaker', 'sensor-light', 'battery'] },
    { id: 'back', label: 'الجهة الخلفية', component: null, allowedTypes: ['sensor-dist', 'wifi', 'battery', 'gps'] },
  ]);
  const [draggedComponent, setDraggedComponent] = useState<ComponentItem | null>(null);
  const [selectedSidebarComponent, setSelectedSidebarComponent] = useState<ComponentItem | null>(null);
  const [configuringSlot, setConfiguringSlot] = useState<RobotSlot | null>(null);

  // Editor State
  const [code, setCode] = useState<string>('// اكتب المنطق البرمجي هنا\n["FORWARD", "FORWARD", "TURN_LEFT", "WAIT", "FORWARD"]');
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Configuration State
  const [simConfig, setSimConfig] = useState<SimConfig>(DEFAULT_CONFIG);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [tempConfig, setTempConfig] = useState<SimConfig>(DEFAULT_CONFIG);

  // Simulation State
  const [simState, setSimState] = useState<SimState>({
    ...INITIAL_ROBOT_STATE_BASE,
    x: DEFAULT_CONFIG.startX,
    y: DEFAULT_CONFIG.startY,
    direction: DEFAULT_CONFIG.startDir
  });
  
  const [gridMap, setGridMap] = useState<('empty' | 'obstacle')[][]>(
    Array(DEFAULT_CONFIG.gridH).fill(null).map(() => Array(DEFAULT_CONFIG.gridW).fill('empty'))
  );
  const [logs, setLogs] = useState<{time: string, msg: string, type: 'info'|'error'|'success'}[]>([]);
  const [visitedCells, setVisitedCells] = useState<string[]>([`${DEFAULT_CONFIG.startX},${DEFAULT_CONFIG.startY}`]);
  const [showPath, setShowPath] = useState(true);
  const [componentStatus, setComponentStatus] = useState<Record<string, 'active' | 'error' | null>>({});
  
  // Deployment
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [generatedPyCode, setGeneratedPyCode] = useState('');
  const [showExecutionLog, setShowExecutionLog] = useState(true);

  // --- Helpers ---
  const addLog = (msg: string, type: 'info'|'error'|'success' = 'info') => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' });
    setLogs(prev => [...prev, { time, msg, type }]);
  };

  // --- Designer Logic ---
  const handleDragStart = (e: React.DragEvent, component: ComponentItem) => {
    setDraggedComponent(component);
    e.dataTransfer.effectAllowed = "copy";
    // Optional: Set a custom drag image if needed
  };

  const handleDragOver = (e: React.DragEvent, slot: RobotSlot) => {
    e.preventDefault(); // Necessary to allow dropping
    if (draggedComponent && slot.allowedTypes.includes(draggedComponent.type)) {
      e.dataTransfer.dropEffect = "copy";
    } else {
      e.dataTransfer.dropEffect = "none";
    }
  };

  const handleComponentPlacement = (slotId: string) => {
    const componentToPlace = draggedComponent || selectedSidebarComponent;
    
    if (!componentToPlace) return;
    
    const slotIndex = chassis.findIndex(s => s.id === slotId);
    if (slotIndex === -1) return;

    const slot = chassis[slotIndex];

    // Validation
    if (!slot.allowedTypes.includes(componentToPlace.type)) {
        addLog(`خطأ: لا يمكن تركيب ${componentToPlace.name} في ${slot.label}. المكونات المسموحة: ${slot.allowedTypes.join(', ')}`, 'error');
        return;
    }

    setChassis(prev => prev.map(s => {
      if (s.id === slotId) {
        return { ...s, component: componentToPlace };
      }
      return s;
    }));
    
    setDraggedComponent(null);
    setSelectedSidebarComponent(null);
    addLog(`تم تركيب ${componentToPlace.name} في ${slot.label}`, 'success');
  };

  const handleSlotClick = (slotId: string) => {
    // Method 1: If a tool is selected from sidebar, try to place it (Quick mode)
    if (selectedSidebarComponent) {
        handleComponentPlacement(slotId);
        return;
    }
    
    // Method 2: Open configuration modal for this slot (Detail mode)
    const slot = chassis.find(s => s.id === slotId);
    if (slot) {
        setConfiguringSlot(slot);
    }
  };

  const selectComponentForSlot = (component: ComponentItem | null) => {
    if (!configuringSlot) return;
    
    setChassis(prev => prev.map(s => {
        if (s.id === configuringSlot.id) {
            return { ...s, component: component };
        }
        return s;
    }));
    
    if (component) {
        addLog(`تم تركيب ${component.name} في ${configuringSlot.label}`, 'success');
    } else {
        addLog(`تم إزالة المكون من ${configuringSlot.label}`, 'info');
    }
    setConfiguringSlot(null);
  };

  const removeComponent = (slotId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering placement if clicking delete
    setChassis(prev => prev.map(slot => slot.id === slotId ? { ...slot, component: null } : slot));
    addLog('تم إزالة المكون.', 'info');
  };

  // --- Simulation Engine ---
  const hasComponent = (type: string) => chassis.some(slot => slot.component?.type === type);

  const runSimulation = async () => {
    if (simState.isRunning) return;
    
    // Check Prerequisites
    if (!hasComponent('cpu')) {
      addLog('خطأ فادح: لا يوجد وحدة معالجة مركزية (CPU)!', 'error');
      return;
    }
    if (!hasComponent('motor')) {
      addLog('تنبيه: لا توجد محركات، الروبوت لن يتحرك.', 'error');
    }

    setActiveTab('simulator');
    
    // Initialize local simulation state
    let currentState = {
      x: simState.x,
      y: simState.y,
      direction: simState.direction,
      battery: simState.battery,
      temperature: simState.temperature
    };

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

    // Execution Loop
    for (const cmd of commands) {
      if (currentState.battery <= 0) {
        addLog('نفاذ البطارية! توقف النظام.', 'error');
        break;
      }

      await new Promise(r => setTimeout(r, 800)); // Simulation tick

      // Use currentState for logic
      let { x, y, direction, battery, temperature } = currentState;
      let moved = false;
      let currentStatus: Record<string, 'active' | 'error'> = {};
      
      // Consumables Calculation
      const powerDrain = chassis.reduce((sum, slot) => sum + (slot.component?.powerConsumption || 0), 0);
      battery = Math.max(0, battery - powerDrain);
      temperature += (Math.random() * 0.5);

      // Logic
      if (cmd === 'FORWARD' || cmd === 'BACKWARD') {
          if (!hasComponent('motor')) {
            addLog('فشل الحركة: المحرك غير موجود', 'error');
          } else {
             // Activate motors
             chassis.forEach(slot => {
                 if (slot.component?.type === 'motor') currentStatus[slot.id] = 'active';
             });

             let dx = 0, dy = 0;
             if (direction === 0) dy = -1;
             if (direction === 90) dx = 1;
             if (direction === 180) dy = 1;
             if (direction === 270) dx = -1;

             if (cmd === 'BACKWARD') { dx = -dx; dy = -dy; }

             const nextX = x + dx;
             const nextY = y + dy;

             // Obstacle Check
             if (nextX >= 0 && nextX < simConfig.gridW && nextY >= 0 && nextY < simConfig.gridH) {
               if (gridMap[nextY][nextX] === 'obstacle') {
                  if (hasComponent('sensor-dist')) {
                    addLog(`حساس المسافة: جسم غريب! توقف طارئ.`, 'error');
                    chassis.forEach(slot => {
                        if (slot.component?.type === 'sensor-dist') currentStatus[slot.id] = 'error';
                    });
                  } else {
                    addLog(`اصطدام!`, 'error');
                    battery -= 10;
                  }
               } else {
                 x = nextX;
                 y = nextY;
                 moved = true;
                 addLog(`تحرك الروبوت ${cmd === 'FORWARD' ? 'للأمام' : 'للخلف'} إلى (${x},${y})`, 'info');
               }
             } else {
               addLog('تنبيه: حدود المنطقة.', 'error');
             }
          }
      } else if (cmd === 'TURN_RIGHT') {
          direction = (direction + 90) % 360 as any;
          chassis.forEach(slot => { if (slot.component?.type === 'motor') currentStatus[slot.id] = 'active'; });
          addLog('دوران لليمين', 'info');
      } else if (cmd === 'TURN_LEFT') {
          direction = (direction - 90 + 360) % 360 as any;
          chassis.forEach(slot => { if (slot.component?.type === 'motor') currentStatus[slot.id] = 'active'; });
          addLog('دوران لليسار', 'info');
      } else if (cmd === 'WAIT') {
          addLog('انتظار...', 'info');
      }

      setComponentStatus(currentStatus);
      currentState = { x, y, direction, battery, temperature };
      setSimState(prev => ({ ...prev, x, y, direction, battery, temperature }));

      if (moved) {
        const posKey = `${x},${y}`;
        setVisitedCells(prev => prev.includes(posKey) ? prev : [...prev, posKey]);
      }
      
      setTimeout(() => setComponentStatus({}), 600);
    }

    setSimState(prev => ({ ...prev, isRunning: false }));
    addLog('اكتمل تنفيذ البرنامج.', 'success');
  };

  const handleAiGenerate = async () => {
    if (!aiInput.trim()) return;
    setAiLoading(true);
    addLog(`AI: جاري تحليل طلبك...`, 'info');
    const generatedCommands = await translateCommands(aiInput);
    if (generatedCommands.length > 0) {
      setCode(JSON.stringify(generatedCommands, null, 2));
      addLog('AI: تم توليد الكود بنجاح.', 'success');
    } else {
      addLog('AI: لم أتمكن من فهم التعليمات.', 'error');
    }
    setAiLoading(false);
  };

  const resetSim = () => {
    setSimState({
      ...INITIAL_ROBOT_STATE_BASE,
      x: simConfig.startX,
      y: simConfig.startY,
      direction: simConfig.startDir,
      isRunning: false
    });
    setVisitedCells([`${simConfig.startX},${simConfig.startY}`]);
    setComponentStatus({});
    setLogs([]);
    addLog('تم إعادة تعيين النظام.', 'info');
  };

  const toggleObstacle = (x: number, y: number) => {
    const newMap = [...gridMap];
    newMap[y][x] = newMap[y][x] === 'empty' ? 'obstacle' : 'empty';
    setGridMap(newMap);
  };

  const generateProductionCode = () => {
      let pyCode = `import robot_hal\nimport time\n\n# Robot Configuration\n`;
      chassis.forEach(slot => {
          if (slot.component) {
              pyCode += `robot_hal.attach('${slot.component.type}', position='${slot.id}')\n`;
          }
      });
      
      pyCode += `\ndef run():\n    bot = robot_hal.System()\n    bot.connect()\n    print("System Ready")\n\n`;
      
      try {
          const cmds = JSON.parse(code.replace(/\/\/.*$/gm, ''));
          cmds.forEach((cmd: string) => {
              if (cmd === 'FORWARD') pyCode += `    bot.motor.move(1) # Forward\n`;
              if (cmd === 'BACKWARD') pyCode += `    bot.motor.move(-1) # Backward\n`;
              if (cmd === 'TURN_RIGHT') pyCode += `    bot.motor.rotate(90)\n`;
              if (cmd === 'TURN_LEFT') pyCode += `    bot.motor.rotate(-90)\n`;
              if (cmd === 'WAIT') pyCode += `    time.sleep(1)\n`;
          });
      } catch {}
      
      pyCode += `\n    bot.disconnect()\n\nif __name__ == "__main__":\n    run()`;
      setGeneratedPyCode(pyCode);
      setShowDeployModal(true);
  }

  const openSettings = () => {
    setTempConfig(simConfig);
    setShowSettingsModal(true);
  };

  const saveSettings = () => {
    const validatedConfig = {
      ...tempConfig,
      startX: Math.min(Math.max(0, tempConfig.startX), tempConfig.gridW - 1),
      startY: Math.min(Math.max(0, tempConfig.startY), tempConfig.gridH - 1),
    };

    const newMap: ('empty' | 'obstacle')[][] = Array(validatedConfig.gridH)
        .fill(null)
        .map(() => Array(validatedConfig.gridW).fill('empty'));

    for (let y = 0; y < Math.min(simConfig.gridH, validatedConfig.gridH); y++) {
      for (let x = 0; x < Math.min(simConfig.gridW, validatedConfig.gridW); x++) {
        if (gridMap[y] && gridMap[y][x]) {
            newMap[y][x] = gridMap[y][x];
        }
      }
    }
    
    if (newMap[validatedConfig.startY][validatedConfig.startX] === 'obstacle') {
        newMap[validatedConfig.startY][validatedConfig.startX] = 'empty';
    }

    setSimConfig(validatedConfig);
    setGridMap(newMap);
    setSimState({
      ...INITIAL_ROBOT_STATE_BASE,
      x: validatedConfig.startX,
      y: validatedConfig.startY,
      direction: validatedConfig.startDir,
      isRunning: false
    });
    setVisitedCells([`${validatedConfig.startX},${validatedConfig.startY}`]);
    setShowSettingsModal(false);
    addLog('تم تحديث الإعدادات.', 'success');
  };

  const TabButton = ({ id, icon: Icon, label }: { id: Tab, icon: any, label: string }) => (
    <button 
        onClick={() => setActiveTab(id)} 
        className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 group
            ${activeTab === id ? 'bg-highlight/10 text-highlight border border-highlight/30' : 'text-gray-400 hover:text-white hover:bg-white/5'}
        `}
    >
        <Icon size={24} className={`mb-1 ${activeTab === id ? 'text-highlight' : 'text-gray-500 group-hover:text-white'}`} />
        <span className="text-[10px] font-bold">{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-5rem)] overflow-hidden bg-primary font-['Tajawal']">
      
      {/* SIDEBAR (Right Panel in RTL) */}
      <div className="w-full lg:w-80 bg-secondary border-l border-white/5 flex flex-col flex-shrink-0 z-20 shadow-2xl">
          {/* Tabs */}
          <div className="p-3 grid grid-cols-3 gap-2 border-b border-white/5 bg-secondary">
             <TabButton id="designer" icon={LayoutTemplate} label="بناء" />
             <TabButton id="editor" icon={Code} label="كود" />
             <TabButton id="simulator" icon={MonitorPlay} label="محاكاة" />
          </div>

          {/* Dynamic Sidebar Content */}
          <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar flex flex-col bg-secondary/50">
             {activeTab === 'designer' && (
                 <div className="p-4">
                     <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-sm">
                        <Box size={16} className="text-accent" />
                        مكتبة المكونات
                     </h3>
                     <p className="text-xs text-gray-400 mb-4">اسحب المكونات إلى هيكل الروبوت</p>
                     <div className="space-y-3">
                         {AVAILABLE_COMPONENTS.map(comp => (
                            <div 
                                key={comp.id} 
                                draggable
                                onDragStart={(e) => handleDragStart(e, comp)}
                                onDragEnd={() => setDraggedComponent(null)}
                                onClick={() => setSelectedSidebarComponent(comp)}
                                className={`p-3 rounded-xl border cursor-grab active:cursor-grabbing transition group flex items-center gap-3
                                  ${selectedSidebarComponent?.id === comp.id 
                                    ? 'bg-highlight/10 border-highlight shadow-[0_0_15px_rgba(56,189,248,0.2)]' 
                                    : 'bg-primary border-white/5 hover:border-accent/50 hover:bg-white/5'
                                  }
                                `}
                            >
                                <div className={`p-2 rounded-lg ${selectedSidebarComponent?.id === comp.id ? 'bg-highlight text-white' : 'bg-white/5 text-gray-400 group-hover:text-accent'}`}>
                                    {comp.icon}
                                </div>
                                <div>
                                    <div className="font-bold text-white text-sm">{comp.name}</div>
                                    <div className="text-[10px] text-gray-500">{comp.powerConsumption}% power</div>
                                </div>
                            </div>
                         ))}
                     </div>
                 </div>
             )}

             {activeTab === 'editor' && (
                 <div className="p-4">
                     <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-sm">
                        <Zap size={16} className="text-accent" />
                        مساعد الذكاء الاصطناعي
                     </h3>
                     <div className="bg-primary p-3 rounded-xl border border-white/5 mb-4">
                         <textarea 
                            value={aiInput}
                            onChange={(e) => setAiInput(e.target.value)}
                            placeholder="اطلب من المساعد كتابة كود (مثال: تحرك للأمام وتجنب العوائق)..."
                            className="w-full bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none resize-none h-24"
                         />
                         <button 
                             onClick={handleAiGenerate}
                             disabled={aiLoading}
                             className="w-full mt-2 bg-accent hover:bg-indigo-600 text-white py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2"
                         >
                             {aiLoading ? <RefreshCw className="animate-spin" size={14} /> : <Zap size={14} />}
                             توليد الكود
                         </button>
                     </div>
                     <div className="text-xs text-gray-500 leading-relaxed">
                        نصيحة: يمكنك استخدام أوامر مثل "تحرك للأمام" أو "لف يمين" وسيقوم النموذج بتحويلها إلى كود JSON.
                     </div>
                 </div>
             )}

             {activeTab === 'simulator' && (
                 <div className="p-4 space-y-6">
                     <h3 className="text-white font-bold mb-2 flex items-center gap-2 text-sm">
                        <MonitorPlay size={16} className="text-accent" />
                        حالة النظام
                     </h3>
                     
                     {/* Compact Stats */}
                     <div className="grid grid-cols-2 gap-3">
                         <div className={`bg-primary p-3 rounded-xl border ${simState.battery < 20 ? 'border-red-500/50' : 'border-white/5'}`}>
                             <span className="text-[10px] text-gray-400 block mb-1">البطارية</span>
                             <div className="flex items-center gap-2">
                                 <Battery size={18} className={simState.battery < 20 ? 'text-red-500' : 'text-emerald-400'} />
                                 <span className="font-mono font-bold text-white">{Math.round(simState.battery)}%</span>
                             </div>
                         </div>
                         <div className={`bg-primary p-3 rounded-xl border ${simState.temperature > 80 ? 'border-red-500/50' : 'border-white/5'}`}>
                             <span className="text-[10px] text-gray-400 block mb-1">الحرارة</span>
                             <div className="flex items-center gap-2">
                                 <Thermometer size={18} className={simState.temperature > 80 ? 'text-red-500' : 'text-blue-400'} />
                                 <span className="font-mono font-bold text-white">{Math.round(simState.temperature)}°C</span>
                             </div>
                         </div>
                     </div>

                     <div className="space-y-2">
                         <button onClick={resetSim} className="w-full bg-white/5 hover:bg-white/10 text-white py-2.5 rounded-lg text-xs font-bold border border-white/5 transition flex items-center justify-center gap-2">
                            <RotateCcw size={14} /> إعادة ضبط
                         </button>
                         <button onClick={() => { setGridMap(Array(simConfig.gridH).fill(null).map(() => Array(simConfig.gridW).fill('empty'))); addLog('تم مسح الخريطة', 'info'); }} className="w-full bg-white/5 hover:bg-red-900/20 text-white hover:text-red-400 py-2.5 rounded-lg text-xs font-bold border border-white/5 transition flex items-center justify-center gap-2">
                            <Trash2 size={14} /> مسح الخريطة
                         </button>
                     </div>
                 </div>
             )}
          </div>

          {/* Console Log Area */}
          <div className="h-1/3 border-t border-white/10 flex flex-col bg-[#0f172a]">
             <div className="p-3 border-b border-white/5 flex items-center justify-between bg-secondary">
                 <h3 className="text-xs font-bold text-gray-300 flex items-center gap-2">
                    <Terminal size={14} className="text-highlight" />
                    سجل العمليات
                 </h3>
                 <button onClick={() => setLogs([])} className="text-gray-600 hover:text-red-400"><Trash2 size={12} /></button>
             </div>
             <div className="flex-1 overflow-y-auto p-3 space-y-1.5 font-mono text-[10px] custom-scrollbar">
                {logs.length === 0 && <div className="text-center text-gray-700 mt-4">النظام جاهز...</div>}
                {logs.map((log, i) => (
                    <div key={i} className={`flex gap-2 ${log.type === 'error' ? 'text-red-400' : log.type === 'success' ? 'text-green-400' : 'text-gray-400'}`}>
                        <span className="opacity-30 select-none">[{log.time}]</span>
                        <span>{log.msg}</span>
                    </div>
                ))}
                <div id="log-end"></div>
             </div>
          </div>
      </div>

      {/* MAIN CONTENT (Left Panel in RTL) */}
      <div className="flex-1 relative bg-[#020617] flex flex-col overflow-hidden">
          {/* Workspace Toolbar */}
          <div className="absolute top-4 right-4 z-30 flex flex-col gap-3 simulator-controls">
               <div className="flex gap-3">
                   {activeTab === 'simulator' && (
                       <button 
                        onClick={runSimulation} 
                        disabled={simState.isRunning}
                        className="bg-highlight hover:bg-sky-500 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-highlight/20 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                       >
                           {simState.isRunning ? <RefreshCw className="animate-spin" size={18} /> : <Play size={18} />}
                           تشغيل
                       </button>
                   )}
                   {activeTab !== 'simulator' && (
                      <button 
                        onClick={generateProductionCode}
                        className="bg-secondary hover:bg-white/10 text-white px-4 py-2 rounded-xl font-bold border border-white/10 backdrop-blur-md transition flex items-center gap-2"
                      >
                          <Cpu size={18} className="text-accent" />
                          <span>تصدير</span>
                      </button>
                   )}
                   <button onClick={openSettings} className="bg-secondary hover:bg-white/10 text-white p-2 rounded-xl border border-white/10 backdrop-blur-md transition">
                       <Settings size={20} />
                   </button>
               </div>
               
               {/* Collapsible Execution Log Panel */}
               {activeTab === 'simulator' && (
                   <div className="bg-secondary/90 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl overflow-hidden w-80">
                       <button 
                           onClick={() => setShowExecutionLog(!showExecutionLog)}
                           className="w-full flex items-center justify-between p-3 bg-primary/50 border-b border-white/5 text-xs font-bold text-white hover:bg-white/5 transition"
                       >
                           <span className="flex items-center gap-2"><Terminal size={14} className="text-highlight"/> سجل التنفيذ</span>
                           {showExecutionLog ? <X size={14}/> : <Plus size={14}/>}
                       </button>
                       
                       {showExecutionLog && (
                           <div className="h-40 overflow-y-auto custom-scrollbar p-2 space-y-1 bg-[#0f172a]">
                               {logs.length === 0 && <div className="text-gray-600 text-[10px] text-center py-4">لا توجد سجلات</div>}
                               {logs.slice(-10).map((log, i) => (
                                   <div key={i} className={`text-[10px] px-2 py-1 rounded border-l-2 flex gap-2 items-start
                                       ${log.type === 'error' ? 'bg-red-900/20 border-red-500 text-red-200' : 
                                         log.type === 'success' ? 'bg-green-900/20 border-green-500 text-green-200' : 
                                         'bg-slate-800/50 border-slate-500 text-slate-300'}
                                   `}>
                                       <span className="opacity-50 shrink-0 font-mono">[{log.time}]</span>
                                       <span className="break-words">{log.msg}</span>
                                   </div>
                               ))}
                           </div>
                       )}
                   </div>
               )}
          </div>
          
          {/* HUD Overlay - New Status Indicators */}
          {activeTab === 'simulator' && (
              <div className="absolute top-8 left-8 z-30 bg-secondary/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-2xl flex gap-6 animate-fade-in pointer-events-none select-none">
                  <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${simState.battery < 20 ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/20 text-emerald-400'}`}>
                          <Battery size={20} />
                      </div>
                      <div>
                          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Energy</div>
                          <div className="text-lg font-bold text-white font-mono">{Math.round(simState.battery)}%</div>
                      </div>
                  </div>
                  <div className="w-px bg-white/10"></div>
                  <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${simState.temperature > 80 ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-400'}`}>
                          <Thermometer size={20} />
                      </div>
                      <div>
                          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Temp</div>
                          <div className="text-lg font-bold text-white font-mono">{Math.round(simState.temperature)}°C</div>
                      </div>
                  </div>
              </div>
          )}

          {/* --- DESIGNER CANVAS --- */}
          {activeTab === 'designer' && (
              <div className="flex-1 relative flex items-center justify-center bg-grid-pattern">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-[#020617] to-[#020617]"></div>
                  
                  <div className="relative w-full max-w-2xl aspect-square max-h-[80vh] flex items-center justify-center">
                        {/* Connection Lines */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[2px] bg-white/5"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[60%] w-[2px] bg-white/5"></div>

                        {chassis.map(slot => {
                            let posClass = '';
                            if (slot.id === 'center') posClass = 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 z-10';
                            if (slot.id === 'front') posClass = 'top-[10%] left-1/2 -translate-x-1/2 w-28 h-28';
                            if (slot.id === 'back') posClass = 'bottom-[10%] left-1/2 -translate-x-1/2 w-28 h-28';
                            if (slot.id === 'left') posClass = 'left-[10%] top-1/2 -translate-y-1/2 w-28 h-28';
                            if (slot.id === 'right') posClass = 'right-[10%] top-1/2 -translate-y-1/2 w-28 h-28';

                            const activeDrag = draggedComponent || selectedSidebarComponent;
                            const isAllowed = activeDrag && slot.allowedTypes.includes(activeDrag.type);
                            const isTarget = isAllowed;

                            return (
                                <div 
                                    key={slot.id}
                                    onDragOver={(e) => handleDragOver(e, slot)}
                                    onDrop={() => handleComponentPlacement(slot.id)}
                                    onClick={() => handleSlotClick(slot.id)}
                                    className={`absolute ${posClass} border-2 rounded-2xl flex flex-col items-center justify-center transition-all duration-300
                                        ${slot.component ? 'bg-secondary border-accent shadow-[0_0_30px_rgba(99,102,241,0.15)]' : 'bg-white/5 border-dashed border-white/10 hover:border-highlight hover:bg-white/10'}
                                        ${activeDrag ? (isTarget ? 'border-highlight bg-highlight/10 scale-105 cursor-pointer shadow-[0_0_20px_rgba(56,189,248,0.3)] animate-pulse' : 'opacity-30 grayscale') : ''}
                                        cursor-pointer
                                    `}
                                >
                                    <span className="absolute -top-8 text-xs text-gray-500 font-bold tracking-wider">{slot.label}</span>
                                    
                                    {slot.component ? (
                                        <>
                                            <div className="text-accent mb-2 transform scale-125">{slot.component.icon}</div>
                                            <span className="text-sm text-white font-bold text-center px-2">{slot.component.name}</span>
                                            {slot.id !== 'center' && (
                                                <button onClick={(e) => removeComponent(slot.id, e)} className="absolute -top-2 -right-2 bg-red-900/80 text-red-200 p-1.5 rounded-full hover:bg-red-700 z-20 border border-red-500/30 transition shadow-lg">
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            {isTarget ? (
                                                <div className="text-highlight animate-bounce"><MousePointerClick size={32} /></div>
                                            ) : (
                                                <Plus size={32} className="text-gray-700" />
                                            )}
                                        </>
                                    )}
                                </div>
                            );
                        })}
                  </div>
                  
                  <div className="absolute bottom-8 left-8 bg-secondary/80 backdrop-blur p-4 rounded-xl border border-white/10 max-w-sm">
                      <div className="flex items-start gap-3">
                          <div className="p-2 bg-accent/10 rounded-lg text-accent"><Layers size={20} /></div>
                          <div>
                              <h4 className="text-white font-bold text-sm mb-1">وضع المصمم</h4>
                              <p className="text-xs text-gray-400">اسحب المكونات من القائمة الجانبية وأفلتها في الأماكن المخصصة، أو انقر لتحديد المكون.</p>
                          </div>
                      </div>
                  </div>
              </div>
          )}

          {/* --- CODE EDITOR --- */}
          {activeTab === 'editor' && (
             <div className="flex-1 flex flex-col p-8 bg-[#020617]">
                 <div className="flex-1 relative rounded-2xl border border-white/10 overflow-hidden bg-[#0f172a] shadow-2xl">
                     <div className="absolute top-0 left-0 right-0 h-10 bg-[#1e293b] border-b border-white/5 flex items-center justify-between px-4">
                         <span className="text-xs font-mono text-gray-400 flex items-center gap-2">
                            <FileCode size={14} /> logic.json
                         </span>
                         <div className="flex gap-1.5">
                             <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                             <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                             <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                         </div>
                     </div>
                     <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="w-full h-full bg-transparent text-green-400 font-mono text-sm p-6 pt-14 focus:outline-none resize-none leading-relaxed"
                        spellCheck={false}
                     />
                 </div>
             </div>
          )}

          {/* --- SIMULATOR GRID --- */}
          {activeTab === 'simulator' && (
              <div className="flex-1 relative flex items-center justify-center overflow-auto bg-[#020617] custom-scrollbar p-10">
                  {/* Critical Warning Overlay */}
                  {(simState.battery < 20 || simState.temperature > 80) && (
                    <div className="absolute inset-0 pointer-events-none z-40 shadow-[inset_0_0_100px_rgba(220,38,38,0.2)] border-[8px] border-red-500/10 animate-pulse"></div>
                  )}
                  
                  <div className="relative z-10">
                      <div className="grid gap-[2px] p-2 bg-[#1e293b] border-4 border-secondary rounded-xl shadow-2xl"
                           style={{ gridTemplateColumns: `repeat(${simConfig.gridW}, minmax(0, 1fr))` }}
                      >
                          {Array(simConfig.gridH).fill(0).map((_, y) => 
                            Array(simConfig.gridW).fill(0).map((_, x) => {
                                const isRobot = simState.x === x && simState.y === y;
                                const isStartPos = simConfig.startX === x && simConfig.startY === y;
                                const isObstacle = gridMap[y] && gridMap[y][x] === 'obstacle';
                                const isVisited = showPath && visitedCells.includes(`${x},${y}`);

                                return (
                                    <div 
                                        key={`${x}-${y}`}
                                        onClick={() => toggleObstacle(x, y)}
                                        className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center cursor-pointer transition-all duration-300 relative rounded-md
                                            ${isObstacle ? 'bg-red-900/30 border border-red-500/20 shadow-inner' : 'bg-[#0f172a]'}
                                            ${isVisited && !isRobot && !isObstacle ? 'bg-highlight/20 border border-highlight/40 shadow-[inset_0_0_15px_rgba(56,189,248,0.1)]' : 'border border-transparent'}
                                            hover:bg-white/5
                                        `}
                                    >
                                        {/* Grid Content */}
                                        {!isRobot && !isObstacle && (
                                            <div className={`rounded-full transition-all duration-500 ${isVisited ? 'w-3 h-3 bg-highlight shadow-[0_0_12px_#38bdf8] animate-pulse' : 'w-0.5 h-0.5 bg-white/5'}`}></div>
                                        )}
                                        
                                        {isStartPos && !isRobot && <Flag size={14} className="text-gray-600 opacity-50" />}
                                        {isObstacle && <Box size={20} className="text-red-500/40" />}

                                        {/* ROBOT RENDER */}
                                        {isRobot && (
                                            <div 
                                                className="relative z-20 transition-transform duration-500 ease-in-out"
                                                style={{ transform: `rotate(${simState.direction}deg)` }}
                                            >
                                                {/* NEW: Floating Status Bars (Counter-rotated so they stay horizontal) */}
                                                <div 
                                                    className="absolute bottom-[130%] left-1/2 -translate-x-1/2 flex flex-col gap-1.5 pointer-events-none z-50 min-w-[80px]"
                                                    style={{ transform: `rotate(-${simState.direction}deg)` }} 
                                                >
                                                     {/* Battery Widget */}
                                                     <div className={`flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-sm px-2 py-1.5 rounded-lg border shadow-xl transition-colors duration-300 ${simState.battery < 20 ? 'border-red-500/50' : 'border-white/10'}`}>
                                                        <Battery size={12} className={simState.battery < 20 ? 'text-red-500 animate-pulse' : 'text-emerald-400'} />
                                                        <div className="flex-1 flex flex-col gap-0.5">
                                                            <div className="h-1.5 w-full bg-gray-700/50 rounded-full overflow-hidden">
                                                                <div 
                                                                    className={`h-full transition-all duration-500 ${simState.battery < 20 ? 'bg-red-500' : 'bg-emerald-400'}`} 
                                                                    style={{ width: `${simState.battery}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                     </div>
                                                     
                                                     {/* Temp Widget */}
                                                     <div className={`flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-sm px-2 py-1.5 rounded-lg border shadow-xl transition-colors duration-300 ${simState.temperature > 80 ? 'border-red-500/50' : 'border-white/10'}`}>
                                                        <Thermometer size={12} className={simState.temperature > 80 ? 'text-red-500 animate-pulse' : 'text-sky-400'} />
                                                         <div className="flex-1 flex flex-col gap-0.5">
                                                            <div className="h-1.5 w-full bg-gray-700/50 rounded-full overflow-hidden">
                                                                <div 
                                                                    className={`h-full transition-all duration-500 ${simState.temperature > 80 ? 'bg-red-500' : 'bg-sky-400'}`} 
                                                                    style={{ width: `${Math.min(simState.temperature, 100)}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                     </div>
                                                </div>

                                                {/* Main Body */}
                                                <div className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.4)] relative transition-all duration-300
                                                    ${Object.values(componentStatus).includes('error') ? 'border-red-500 bg-red-900/50 animate-shake' : 'border-accent bg-secondary'}
                                                `}>
                                                    <div className="w-2 h-2 bg-highlight rounded-full shadow-[0_0_10px_#38bdf8] animate-pulse"></div>
                                                    
                                                    {/* Wheels Visuals */}
                                                    <div className={`absolute -left-1.5 top-1 bottom-1 w-1.5 rounded-l-md transition-colors ${componentStatus['left'] === 'active' ? 'bg-highlight' : 'bg-gray-700'}`}></div>
                                                    <div className={`absolute -right-1.5 top-1 bottom-1 w-1.5 rounded-r-md transition-colors ${componentStatus['right'] === 'active' ? 'bg-highlight' : 'bg-gray-700'}`}></div>
                                                    
                                                    {/* Direction Indicator */}
                                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-accent opacity-80">
                                                        <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[8px] border-b-current"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                          )}
                      </div>
                  </div>
                  
                  <button onClick={() => setShowPath(!showPath)} className="absolute bottom-8 left-8 bg-secondary/90 backdrop-blur px-4 py-2 rounded-xl border border-white/10 text-xs text-white flex items-center gap-2 hover:bg-white/10 transition">
                      <Footprints size={16} className={showPath ? 'text-highlight' : 'text-gray-500'} />
                      {showPath ? 'إخفاء المسار' : 'إظهار المسار'}
                  </button>
              </div>
          )}
      </div>

      {/* Modals (Settings, Deploy, Config) */}
      {/* Settings Modal */}
      {showSettingsModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-secondary border border-white/10 rounded-2xl w-full max-w-md shadow-2xl animate-fade-in">
                  <div className="bg-primary p-4 border-b border-white/5 flex justify-between items-center rounded-t-2xl">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          <Settings size={18} className="text-accent" />
                          إعدادات البيئة
                      </h3>
                      <button onClick={() => setShowSettingsModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
                  </div>
                  <div className="p-6 space-y-6">
                      <div>
                          <label className="block text-sm font-bold text-white mb-3">أبعاد الشبكة (متر)</label>
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <span className="block text-xs text-gray-400 mb-1">العرض (X)</span>
                                  <input 
                                    type="number" min="5" max="20"
                                    value={tempConfig.gridW}
                                    onChange={e => setTempConfig({...tempConfig, gridW: parseInt(e.target.value) || 10})}
                                    className="w-full bg-primary border border-white/10 rounded-lg p-2 text-white text-center focus:border-highlight focus:outline-none"
                                  />
                              </div>
                              <div>
                                  <span className="block text-xs text-gray-400 mb-1">الارتفاع (Y)</span>
                                  <input 
                                    type="number" min="5" max="20"
                                    value={tempConfig.gridH}
                                    onChange={e => setTempConfig({...tempConfig, gridH: parseInt(e.target.value) || 10})}
                                    className="w-full bg-primary border border-white/10 rounded-lg p-2 text-white text-center focus:border-highlight focus:outline-none"
                                  />
                              </div>
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
                                      className={`py-2 rounded-lg text-xs font-bold border transition flex items-center justify-center
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

                      <div className="flex gap-3 pt-2">
                           <button onClick={saveSettings} className="flex-1 bg-accent hover:opacity-90 text-white py-2 rounded-lg font-bold shadow-lg">حفظ</button>
                      </div>
                  </div>
              </div>
          </div>
      )}

       {/* Component Config Modal */}
       {configuringSlot && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-secondary border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl animate-fade-in">
                  <div className="bg-primary p-4 border-b border-white/5 flex justify-between items-center rounded-t-2xl">
                      <h3 className="text-lg font-bold text-white">تكوين {configuringSlot.label}</h3>
                      <button onClick={() => setConfiguringSlot(null)} className="text-gray-400 hover:text-white"><X size={20} /></button>
                  </div>
                  <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button onClick={() => selectComponentForSlot(null)} className="p-3 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 transition text-right flex items-center gap-3">
                          <Trash2 className="text-red-400" /> <span className="text-white font-bold">إزالة المكون</span>
                      </button>
                      {AVAILABLE_COMPONENTS.filter(c => configuringSlot.allowedTypes.includes(c.type)).map(comp => (
                          <button 
                              key={comp.id}
                              onClick={() => selectComponentForSlot(comp)}
                              className={`p-3 rounded-xl border transition flex items-center gap-3 text-right
                                  ${configuringSlot.component?.id === comp.id ? 'bg-highlight/20 border-highlight' : 'bg-white/5 border-white/10 hover:border-accent/50'}
                              `}
                          >
                              <div className="text-accent">{comp.icon}</div>
                              <div className="font-bold text-white text-sm">{comp.name}</div>
                          </button>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {/* Deploy Modal */}
      {showDeployModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-secondary border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl">
                  <div className="bg-primary p-4 border-b border-white/5 flex justify-between items-center rounded-t-2xl">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2"><Cpu size={20} className="text-accent"/> تصدير الكود</h3>
                      <button onClick={() => setShowDeployModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
                  </div>
                  <div className="p-6 bg-[#0f172a]">
                      <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap bg-[#020617] p-4 rounded-lg border border-white/10">{generatedPyCode}</pre>
                      <div className="flex gap-4 mt-6">
                          <button onClick={() => setShowDeployModal(false)} className="flex-1 bg-accent text-white py-3 rounded-lg font-bold shadow-lg">تحميل .py</button>
                      </div>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default Simulator;
