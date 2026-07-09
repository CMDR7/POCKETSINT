/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useDeviceStore } from '../store/deviceStore';
import { ModuleId } from '../types';
import { 
  Radio, 
  Battery, 
  Compass, 
  Clock, 
  Cpu, 
  Database, 
  HardDrive, 
  Wifi, 
  Lock, 
  Unlock, 
  AlertTriangle,
  User,
  ShieldAlert,
  Sliders,
  FileText,
  Home,
  Binary,
  Globe,
  Camera,
  Search,
  Volume2,
  VolumeX,
  Menu,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface DeviceShellProps {
  children: React.ReactNode;
}

export const getDetectedDeviceName = (): string => {
  if (typeof navigator === 'undefined') return 'STANDALONE_NODE';
  const ua = navigator.userAgent;
  let os = 'UNKNOWN_DEVICE';
  let browser = 'UNKNOWN_BROWSER';

  if (/Windows/i.test(ua)) os = 'WINDOWS_PC';
  else if (/Macintosh/i.test(ua)) os = 'MACOS_WORKSTATION';
  else if (/iPhone/i.test(ua)) os = 'IPHONE_DEVICE';
  else if (/iPad/i.test(ua)) os = 'IPAD_TABLET';
  else if (/Android/i.test(ua)) os = 'ANDROID_TERMINAL';
  else if (/Linux/i.test(ua)) os = 'LINUX_WORKSTATION';
  else if (/CrOS/i.test(ua)) os = 'CHROMEBOOK';

  if (/Edg/i.test(ua)) browser = 'EDGE';
  else if (/Chrome/i.test(ua)) browser = 'CHROME';
  else if (/Firefox/i.test(ua)) browser = 'FIREFOX';
  else if (/Safari/i.test(ua)) browser = 'SAFARI';
  else if (/MSIE|Trident/i.test(ua)) browser = 'IE';

  return `${os}_${browser}`;
};

export const DeviceShell: React.FC<DeviceShellProps> = ({ children }) => {
  const { 
    activeModule, 
    setActiveModule, 
    settings, 
    updateSettings, 
    systemStatus, 
    updateSystemStatus, 
    playBeep 
  } = useDeviceStore();

  const [timeStr, setTimeStr] = useState('');
  const [leds, setLeds] = useState({ sys: true, net: false, gps: true, mem: false });
  const [navOpen, setNavOpen] = useState(false);

  // Update clock and simulate CPU/RAM micro-fluctuations
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false }) + ' UTC-7');
      updateSystemStatus();
    }, 1000);

    // Initial power on audio effect
    setTimeout(() => {
      playBeep('powerOn');
    }, 500);

    return () => clearInterval(timer);
  }, [updateSystemStatus]);

  // Connect to actual Web Battery Status API if available in the client browser
  useEffect(() => {
    let batteryInstance: any = null;

    const handleBatteryUpdate = () => {
      if (batteryInstance) {
        useDeviceStore.setState((prev) => ({
          systemStatus: {
            ...prev.systemStatus,
            batteryLevel: Math.round(batteryInstance.level * 100),
            batteryCharging: batteryInstance.charging
          }
        }));
      }
    };

    if (typeof navigator !== 'undefined' && (navigator as any).getBattery) {
      (navigator as any).getBattery().then((battery: any) => {
        batteryInstance = battery;
        handleBatteryUpdate();
        battery.addEventListener('levelchange', handleBatteryUpdate);
        battery.addEventListener('chargingchange', handleBatteryUpdate);
      }).catch((err: any) => {
        console.warn('Battery status API error:', err);
      });
    }

    return () => {
      if (batteryInstance) {
        batteryInstance.removeEventListener('levelchange', handleBatteryUpdate);
        batteryInstance.removeEventListener('chargingchange', handleBatteryUpdate);
      }
    };
  }, []);

  // Alternate blinking LEDs for micro-forensic simulation
  useEffect(() => {
    const ledTimer = setInterval(() => {
      setLeds(prev => ({
        sys: !prev.sys,
        net: Math.random() > 0.4 ? !prev.net : prev.net,
        gps: Math.random() > 0.85 ? !prev.gps : prev.gps,
        mem: Math.random() > 0.3 ? !prev.mem : prev.mem,
      }));
    }, 400);
    return () => clearInterval(ledTimer);
  }, []);

  const menuItems = [
    { id: 'HOME' as ModuleId, label: 'HOME', icon: Home, color: 'border-cyan-accent text-cyan-accent' },
    { id: 'USER_RECON' as ModuleId, label: 'TOOLS', icon: Binary, color: 'border-blue-accent text-blue-accent' },
    { id: 'DOMAIN_INTEL' as ModuleId, label: 'SCAN', icon: Search, color: 'border-green-highlight text-green-highlight' },
    { id: 'REPORTS' as ModuleId, label: 'REPORTS', icon: FileText, color: 'border-warn-amber text-warn-amber' },
    { id: 'SETTINGS' as ModuleId, label: 'SETTINGS', icon: Sliders, color: 'border-muted-slate text-muted-slate' },
  ];

  return (
    <div className={`min-h-screen bg-[#050505] flex items-center justify-center p-2 sm:p-4 text-text-gray font-sans selection:bg-cyan-accent selection:text-black ${settings.theme === 'monochrome' ? 'theme-monochrome' : ''}`}>
      
      {/* Outer Tactical Hardware Case Frame */}
      <div className="relative w-full max-w-[1280px] bg-[#101214] border-[12px] border-[#101214] outline outline-1 outline-[#1E252C] rounded-none shadow-[0_0_30px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col border-glow-cyan">
        
        {/* Rubberized side panel grips (Industrial styling) */}
        <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black via-[#1E252C] to-transparent opacity-60 pointer-events-none hidden sm:block">
          <div className="h-full w-full bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,#000_8px,#000_16px)]"></div>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-l from-black via-[#1E252C] to-transparent opacity-60 pointer-events-none hidden sm:block">
          <div className="h-full w-full bg-[repeating-linear-gradient(-45deg,transparent,transparent_8px,#000_8px,#000_16px)]"></div>
        </div>

        {/* Outer Screws / Hardware Detailing */}
        <div className="absolute top-2 left-2 w-3 h-3 rounded-full border border-border-cyber bg-[#1E252C] flex items-center justify-center text-[8px] text-black font-bold select-none">+</div>
        <div className="absolute top-2 right-2 w-3 h-3 rounded-full border border-border-cyber bg-[#1E252C] flex items-center justify-center text-[8px] text-black font-bold select-none">+</div>
        <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full border border-border-cyber bg-[#1E252C] flex items-center justify-center text-[8px] text-black font-bold select-none">+</div>
        <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full border border-border-cyber bg-[#1E252C] flex items-center justify-center text-[8px] text-black font-bold select-none">+</div>

        {/* 1. PHYSICAL DEVICE TOP STATUS BAR */}
        <div className="bg-[#0a0c0e] border-b-2 border-border-cyber px-4 py-2.5 flex flex-wrap items-center justify-between text-xs font-mono select-none relative z-10">
          
          {/* Brand & Firmware */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-pulse shadow-[0_0_8px_#00f0ff]" />
              <span className="font-orbitron font-extrabold tracking-widest text-cyan-accent text-sm text-glow-cyan">POCKETSINT</span>
            </div>
            <div className="hidden md:flex items-center gap-2 border-l border-border-cyber pl-3 text-muted-slate text-[10px]">
              <span>FW v4.9.0-CYBER</span>
              <span>•</span>
              <span className="text-[#39ff14]">OPERATIONAL_MODE: HIGH_SEC</span>
            </div>
          </div>

          {/* Blink LEDs Panel (Physical simulation) */}
          <div className="flex items-center gap-3 bg-[#111316] px-3 py-1 border border-border-cyber rounded-none">
            <div className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${leds.sys ? 'bg-[#39ff14] shadow-[0_0_6px_#39ff14]' : 'bg-[#39ff14]/20'}`} />
              <span className="text-[9px] text-muted-slate font-bold">SYS</span>
            </div>
            <div className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${leds.net ? 'bg-[#00f0ff] shadow-[0_0_6px_#00f0ff]' : 'bg-[#00f0ff]/20'}`} />
              <span className="text-[9px] text-muted-slate font-bold">NET</span>
            </div>
            <div className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${leds.gps ? 'bg-[#ffb300] shadow-[0_0_6px_#ffb300]' : 'bg-[#ffb300]/20'}`} />
              <span className="text-[9px] text-muted-slate font-bold">GPS</span>
            </div>
            <div className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${leds.mem ? 'bg-[#ff3b30] shadow-[0_0_6px_#ff3b30]' : 'bg-[#ff3b30]/20'}`} />
              <span className="text-[9px] text-muted-slate font-bold">RX</span>
            </div>
          </div>

          {/* Live Device Hardware Telemetry Metrics */}
          <div className="flex items-center gap-4 text-xs">
            {/* GPS Signal */}
            <div className="flex items-center gap-1 text-muted-slate">
              <Compass className={`w-3.5 h-3.5 ${systemStatus.gpsLocked ? 'text-[#39ff14]' : 'text-[#ff3b30] animate-pulse'}`} />
              <span className="hidden sm:inline text-[10px] uppercase font-bold text-gray-400">
                {systemStatus.gpsLocked ? 'GPS: LOCK' : 'GPS: SEARCH'}
              </span>
            </div>

            {/* Signal Strength bars */}
            <div className="flex items-center gap-0.5 text-muted-slate">
              <Wifi className="w-3.5 h-3.5 text-[#00f0ff]" />
              <div className="flex items-end gap-[1px] h-2.5">
                <div className="w-[2px] h-1.5 bg-[#00f0ff]" />
                <div className="w-[2px] h-2 bg-[#00f0ff]" />
                <div className="w-[2px] h-2.5 bg-[#00f0ff]" />
                <div className="w-[2px] h-3 bg-[#00f0ff]" />
              </div>
            </div>

            {/* Battery Level */}
            <div className="flex items-center gap-1.5 border-l border-border-cyber pl-3">
              {systemStatus.batteryCharging && (
                <span className="text-[#39ff14] text-[9px] font-bold animate-pulse">▲ CHARG •</span>
              )}
              <span className="text-gray-300 font-mono text-[11px] font-bold">{systemStatus.batteryLevel}%</span>
              <div className="relative w-7 h-3.5 border border-gray-500 p-[1px] flex items-center bg-black/40">
                <div 
                  className={`h-full bg-[#39ff14] shadow-[0_0_4px_#39ff14] ${systemStatus.batteryCharging ? 'animate-pulse' : ''}`} 
                  style={{ width: `${systemStatus.batteryLevel}%` }}
                />
                <div className="absolute right-[-2px] w-[2px] h-1.5 bg-gray-500 top-[3px]" />
              </div>
            </div>

            {/* Realtime Clock */}
            <div className="flex items-center gap-1.5 border-l border-border-cyber pl-3 font-bold text-cyan-accent text-[11px] tracking-wider text-glow-cyan">
              <Clock className="w-3.5 h-3.5" />
              <span>{timeStr || '00:00:00 UTC'}</span>
            </div>

            {/* Audio Toggle button */}
            <button 
              onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
              className="p-1 text-muted-slate hover:text-white transition-colors duration-150 border border-border-cyber/60 bg-black/30 cursor-pointer"
              title={settings.soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
            >
              {settings.soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-green-highlight" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-crit-red" />
              )}
            </button>
          </div>
        </div>

        {/* 2. INNER SCREEN CONSOLE BEHIND GLASS OVERLAYS */}
        <div className="relative flex-grow flex flex-col bg-bg-cyber min-h-[580px] screen-glow text-text-gray relative">
          
          {/* Grid Overlay Texture */}
          <div className="absolute inset-0 grid-overlay pointer-events-none opacity-40 z-0"></div>
          <div className="absolute inset-0 hex-pattern pointer-events-none opacity-10 z-0"></div>

          {/* Scanline Layer if enabled */}
          {settings.scanlinesEnabled && (
            <div className="absolute inset-0 scanlines pointer-events-none z-50 crt-flicker-effect"></div>
          )}

          {/* Active Operating Header in OLED screen */}
          <div className="bg-panel-cyber/90 border-b border-border-cyber px-4 py-2 z-10 flex flex-wrap gap-2 justify-between items-center text-[10px] font-mono select-none">
            <div className="flex items-center gap-3">
              <span className="text-muted-slate">DEVICE_USER:</span>
              <div className="w-40 sm:w-48 h-6 bg-black border border-border-cyber rounded-none dot-matrix-screen relative flex items-center">
                <div 
                  className="absolute whitespace-nowrap animate-ticker text-[#FF9E79] tracking-[0.1em] uppercase font-bold text-lg"
                  style={{ 
                    fontFamily: '"VT323", monospace',
                    textShadow: '0 0 6px rgba(255, 158, 121, 0.85)'
                  }}
                >
                  {settings.investigatorName || 'ANONYMOUS_AGENT'} @ {getDetectedDeviceName()} &nbsp;&nbsp;&nbsp;&nbsp; {settings.investigatorName || 'ANONYMOUS_AGENT'} @ {getDetectedDeviceName()}
                </div>
              </div>
              <span className="text-muted-slate hidden md:inline">|</span>
              <span className="text-muted-slate hidden md:inline">SYSTEM_TEMP:</span>
              <span className="text-warn-amber hidden md:inline font-bold">{systemStatus.temperature}°C</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Cpu className="w-3 h-3 text-cyan-accent" />
                <span className="text-muted-slate">CPU:</span>
                <span className="text-cyan-accent font-bold w-6 text-right">{systemStatus.cpuUsage}%</span>
              </div>
              <div className="flex items-center gap-1">
                <Database className="w-3 h-3 text-cyan-accent" />
                <span className="text-muted-slate">RAM:</span>
                <span className="text-cyan-accent font-bold w-6 text-right">{systemStatus.ramUsage}%</span>
              </div>
              <div className="flex items-center gap-1">
                <HardDrive className="w-3 h-3 text-cyan-accent" />
                <span className="text-muted-slate">DB_USE:</span>
                <span className="text-green-highlight font-bold">{systemStatus.storageUsage}%</span>
              </div>

              {/* Vertical Menu Trigger Button */}
              <button
                onClick={() => { playBeep('click'); setNavOpen(!navOpen); }}
                className={`ml-2 px-2.5 py-1 border font-bold font-orbitron text-[9px] sm:text-[10px] tracking-wider transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${navOpen ? 'bg-cyan-accent/20 border-cyan-accent text-cyan-accent text-glow-cyan' : 'border-border-cyber text-muted-slate hover:text-white'}`}
                title="System Navigation Menu"
              >
                <Menu className="w-3.5 h-3.5" />
                <span>NAV_SYS</span>
                {navOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* Sliding Vertical Navigation Panel */}
          <AnimatePresence>
            {navOpen && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="absolute top-[41px] right-4 w-52 bg-[#0c0f12]/95 border border-border-cyber shadow-[0_10px_25px_rgba(0,0,0,0.8)] z-40 font-mono divide-y divide-border-cyber/30 overflow-hidden"
              >
                <div className="px-3 py-2 bg-black/60 text-muted-slate text-[9px] uppercase tracking-wider font-bold flex justify-between items-center">
                  <span>SYSTEM_NAVIGATION</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-accent animate-pulse" />
                </div>
                <div className="p-2 space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isSelected = (item.id === 'HOME' && activeModule === 'HOME') ||
                                       (item.id === 'USER_RECON' && ['USER_RECON', 'DOMAIN_INTEL', 'IMAGE_FORENSICS', 'HASH_LAB', 'SEARCH_BUILDER'].includes(activeModule)) ||
                                       (item.id === 'DOMAIN_INTEL' && activeModule === 'DOMAIN_INTEL') ||
                                       (item.id === activeModule);
                    
                    const handleHardwareKeyClick = () => {
                      playBeep('click');
                      if (item.id === 'USER_RECON') {
                        setActiveModule('USER_RECON');
                      } else if (item.id === 'DOMAIN_INTEL') {
                        setActiveModule('DOMAIN_INTEL');
                      } else {
                        setActiveModule(item.id);
                      }
                      setNavOpen(false); // Close menu on click
                    };

                    const selectedClass = isSelected 
                      ? `bg-cyan-accent/10 text-cyan-accent border-cyan-accent shadow-[0_0_8px_rgba(0,240,255,0.2)]` 
                      : `bg-black/40 text-muted-slate border-border-cyber/30 hover:text-white hover:border-gray-500`;

                    return (
                      <button
                        key={item.id}
                        onClick={handleHardwareKeyClick}
                        className={`relative w-full px-3 py-2 border rounded-none transition-all duration-150 flex items-center gap-3 font-orbitron font-bold text-[10px] sm:text-xs cursor-pointer group active:scale-98 ${selectedClass}`}
                      >
                        {/* Micro LED light indicator */}
                        <div className={`absolute left-1.5 top-1/2 -translate-y-1/2 w-1 h-3 rounded-full transition-colors duration-150 ${isSelected ? 'bg-cyan-accent shadow-[0_0_4px_#00f0ff]' : 'bg-transparent'}`} />
                        
                        <Icon className={`w-4 h-4 transition-transform duration-150 group-hover:scale-110 ml-2 ${isSelected ? 'text-cyan-accent text-glow-cyan' : 'text-muted-slate'}`} />
                        <span className="tracking-widest">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actual Viewport Container */}
          <main className="flex-grow flex flex-col p-3 sm:p-5 overflow-y-auto relative z-10 max-h-[calc(100vh-160px)]">
            {children}
          </main>
        </div>

        {/* 3. PHYSICAL HARDWARE BOTTOM NAVIGATION ROW */}
        <div className="bg-[#0a0c0e] border-t-2 border-border-cyber p-2.5 flex justify-between items-center px-6 select-none z-10 text-[9px] font-mono text-muted-slate">
          <span>PORT_B: DIRECT_COMMS</span>
          <div className="flex gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-border-cyber/50" />
            <span className="w-1.5 h-1.5 rounded-full bg-border-cyber/50" />
            <span className="w-1.5 h-1.5 rounded-full bg-border-cyber/50" />
          </div>
          <span>SECURE_CHASSIS_v4</span>
        </div>

      </div>

    </div>
  );
};
