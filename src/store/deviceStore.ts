/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { ModuleId, ScanHistoryItem, UserSettings, SystemStatus } from '../types';

interface DeviceState {
  // Navigation & Screen
  activeModule: ModuleId;
  setActiveModule: (module: ModuleId) => void;

  // Settings
  settings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => void;

  // System Stats (simulated live telemetry)
  systemStatus: SystemStatus;
  updateSystemStatus: () => void;

  // Search/Investigative History
  history: ScanHistoryItem[];
  addHistoryItem: (item: Omit<ScanHistoryItem, 'id' | 'timestamp'>) => void;
  toggleFavorite: (id: string) => void;
  deleteHistoryItem: (id: string) => void;
  clearHistory: () => void;

  // Audio engine
  playBeep: (type: 'click' | 'powerOn' | 'complete' | 'warning') => void;
}

const defaultSettings: UserSettings = {
  soundEnabled: true,
  scanlinesEnabled: true,
  hologramEffect: true,
  lowPowerMode: false,
  investigatorName: 'AGENT_X',
  agencyCode: 'POCKETSINT-09',
  theme: 'neon-cyan'
};

// Simple synthesize audio engine using browser Web Audio API
const triggerAudioSynth = (type: 'click' | 'powerOn' | 'complete' | 'warning') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1500, ctx.currentTime + 0.05);
      
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } else if (type === 'powerOn') {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(110, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
      
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(220, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      
      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.4);
      osc2.stop(ctx.currentTime + 0.4);
    } else if (type === 'complete') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
      
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'warning') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(330, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(220, ctx.currentTime + 0.25);
      
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch (e) {
    console.warn('Web Audio API not supported or blocked by policy', e);
  }
};

const getSavedHistory = (): ScanHistoryItem[] => {
  try {
    const raw = localStorage.getItem('pocketsint_history');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

const getSavedSettings = (): UserSettings => {
  try {
    const raw = localStorage.getItem('pocketsint_settings');
    return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings;
  } catch (e) {
    return defaultSettings;
  }
};

export const useDeviceStore = create<DeviceState>((set, get) => ({
  activeModule: 'HOME',
  setActiveModule: (module) => {
    get().playBeep('click');
    set({ activeModule: module });
  },

  settings: getSavedSettings(),
  updateSettings: (newSettings) => {
    const updated = { ...get().settings, ...newSettings };
    try {
      localStorage.setItem('pocketsint_settings', JSON.stringify(updated));
    } catch (e) {}
    set({ settings: updated });
  },

  systemStatus: {
    cpuUsage: 12,
    ramUsage: 42,
    storageUsage: 14,
    batteryLevel: 98,
    batteryCharging: false,
    gpsLocked: true,
    temperature: 24,
    signalStrength: 4,
    activeModules: 5,
  },
  
  updateSystemStatus: () => {
    set((state) => {
      // 1. Dynamic CPU usage simulation with rapid decay if spiked
      const currentCpu = state.systemStatus.cpuUsage;
      let cpu = currentCpu;
      if (currentCpu > 32) {
        cpu = Math.max(12, Math.round(currentCpu - (Math.random() * 18 + 10)));
      } else {
        const deltaCpu = Math.floor(Math.random() * 5) - 2;
        cpu = Math.max(6, Math.min(28, currentCpu + deltaCpu));
      }

      // 2. Query actual chrome heap memory RAM utilization or simulate
      let ram = state.systemStatus.ramUsage;
      if (typeof window !== 'undefined' && (window.performance as any)?.memory) {
        const mem = (window.performance as any).memory;
        ram = Math.round((mem.usedJSHeapSize / mem.jsHeapSizeLimit) * 100);
        ram = Math.max(25, Math.min(85, ram));
      } else {
        const deltaRam = Math.floor(Math.random() * 3) - 1;
        ram = Math.max(38, Math.min(48, state.systemStatus.ramUsage + deltaRam));
      }

      // 3. Compute actual physical LocalStorage database footprint percentage as "DB_USE"
      let storage = 14;
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          let totalBytes = 0;
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
              const val = localStorage.getItem(key);
              totalBytes += (key.length + (val ? val.length : 0)) * 2;
            }
          }
          // Scale it so that it ranges naturally. Baseline is 12%, and every 1KB of data adds ~1% of DB_USE
          storage = Math.min(99, 12 + Math.round(totalBytes / 1024));
        } catch (e) {}
      }

      // 4. Smooth slow-draining battery if live battery API is unavailable
      let battery = state.systemStatus.batteryLevel;
      if (!state.systemStatus.batteryCharging) {
        battery = Math.max(1, battery - (Math.random() > 0.99 ? 1 : 0));
      }

      return {
        systemStatus: {
          ...state.systemStatus,
          cpuUsage: cpu,
          ramUsage: ram,
          storageUsage: storage,
          temperature: +(24.0 + (Math.random() * 0.6 - 0.3)).toFixed(1),
          batteryLevel: battery,
        }
      };
    });
  },

  history: getSavedHistory(),
  
  addHistoryItem: (item) => {
    // Spike CPU to simulate database write & heavy crypto/search processing
    set((state) => ({
      systemStatus: {
        ...state.systemStatus,
        cpuUsage: Math.floor(Math.random() * 20) + 75
      }
    }));

    const newItem: ScanHistoryItem = {
      ...item,
      id: `SCAN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString()
    };
    const updated = [newItem, ...get().history];
    try {
      localStorage.setItem('pocketsint_history', JSON.stringify(updated));
    } catch (e) {}
    set({ history: updated });
  },

  toggleFavorite: (id) => {
    const updated = get().history.map((h) => 
      h.id === id ? { ...h, favorite: !h.favorite } : h
    );
    try {
      localStorage.setItem('pocketsint_history', JSON.stringify(updated));
    } catch (e) {}
    set({ history: updated });
    get().playBeep('click');
  },

  deleteHistoryItem: (id) => {
    const updated = get().history.filter((h) => h.id !== id);
    try {
      localStorage.setItem('pocketsint_history', JSON.stringify(updated));
    } catch (e) {}
    set({ history: updated });
    get().playBeep('warning');
  },

  clearHistory: () => {
    try {
      localStorage.removeItem('pocketsint_history');
    } catch (e) {}
    set({ history: [] });
    get().playBeep('warning');
  },

  playBeep: (type) => {
    if (get().settings.soundEnabled) {
      triggerAudioSynth(type);
    }
  }
}));
