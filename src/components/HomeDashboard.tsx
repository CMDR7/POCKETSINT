/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useDeviceStore } from '../store/deviceStore';
import { ModuleId, ScanHistoryItem } from '../types';
import { 
  Terminal, 
  Play, 
  Activity, 
  Bookmark, 
  Trash2, 
  Heart,
  ExternalLink,
  ShieldAlert,
  ServerCrash,
  UserCheck,
  Globe,
  FileCheck,
  Lock,
  Compass,
  Cpu
} from 'lucide-react';

interface HomeDashboardProps {
  onNavigate: (module: ModuleId) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({ onNavigate }) => {
  const { history, toggleFavorite, deleteHistoryItem, clearHistory, systemStatus, playBeep } = useDeviceStore();
  const [pinnedFilter, setPinnedFilter] = useState<boolean>(false);
  const [logText, setLogText] = useState<string>('POCKETSINT kernel loaded successfully. Standing by for investigator target telemetry...\nSYSTEM: Operational integrity secure.\nGPS: Position calibrated to local sector.');
  const [showRecommendedUse, setShowRecommendedUse] = useState<boolean>(false);

  const displayedHistory = pinnedFilter 
    ? history.filter(h => h.favorite) 
    : history.slice(0, 8);

  const stats = [
    { label: 'Active Targets', value: history.length, desc: 'Logged locally', icon: ShieldAlert, color: 'text-cyan-accent' },
    { label: 'Investigated domains', value: history.filter(h => h.module === 'DOMAIN_INTEL').length, desc: 'Collapsible WHOIS/DNS', icon: Globe, color: 'text-green-highlight' },
    { label: 'Profiles Searched', value: history.filter(h => h.module === 'USER_RECON').length, desc: 'URL patterns resolved', icon: UserCheck, color: 'text-blue-accent' },
    { label: 'Image Exif Checks', value: history.filter(h => h.module === 'IMAGE_FORENSICS').length, desc: 'GPS & Metadata read', icon: FileCheck, color: 'text-warn-amber' },
  ];

  const handleLaunchTarget = (item: ScanHistoryItem) => {
    playBeep('click');
    onNavigate(item.module);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. TACTICAL OVERVIEW HERO PANEL */}
      <div className="panel-hardware p-4 flex flex-col md:flex-row items-stretch gap-6 relative overflow-hidden">
        
        {/* Holographic Signal Waveform & Calibration */}
        <div className="flex-grow space-y-4">
          <div className="flex items-center justify-between border-b border-border-cyber/60 pb-2">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-cyan-accent" />
              <h2 className="font-orbitron font-extrabold tracking-widest text-cyan-accent uppercase text-glow-cyan">OSINT OPERATIVE COMMAND</h2>
            </div>
            <span className="text-[10px] font-mono bg-cyan-accent/10 text-cyan-accent px-2 py-0.5 border border-cyan-accent/20">STATUS: STANDBY</span>
          </div>

          <p className="text-sm leading-relaxed text-gray-300">
            Welcome to <span className="text-cyan-accent font-bold">POCKETSINT Handheld Terminal</span>. 
            This device performs live local passive scanning, domain intelligence audits, physical image forensics parsing, and advanced search operators formulation directly from your sandboxed sandbox browser environment.
          </p>

          {/* Quick Launch Buttons Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
            {[
              { id: 'USER_RECON' as ModuleId, label: 'USER RECON', color: 'border-blue-accent/50 text-blue-accent hover:bg-blue-accent/10' },
              { id: 'DOMAIN_INTEL' as ModuleId, label: 'DOMAIN SCAN', color: 'border-green-highlight/50 text-green-highlight hover:bg-green-highlight/10' },
              { id: 'IMAGE_FORENSICS' as ModuleId, label: 'IMAGE EXIF', color: 'border-warn-amber/50 text-warn-amber hover:bg-warn-amber/10' },
              { id: 'HASH_LAB' as ModuleId, label: 'HASH LAB', color: 'border-crit-red/50 text-crit-red hover:bg-crit-red/10' },
              { id: 'SEARCH_BUILDER' as ModuleId, label: 'DORK BUILDER', color: 'border-cyan-accent/50 text-cyan-accent hover:bg-cyan-accent/10' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => { playBeep('click'); onNavigate(m.id); }}
                className={`px-2 py-2.5 border text-center font-orbitron font-bold text-[10px] sm:text-xs transition-all duration-150 rounded-none cursor-pointer ${m.color}`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Recommended Use Policy and Information disclosure */}
          <div className="pt-2">
            <button
              onClick={() => { playBeep('click'); setShowRecommendedUse(!showRecommendedUse); }}
              className={`w-full py-2 border text-center font-orbitron font-extrabold tracking-widest text-[10px] sm:text-xs transition-all duration-150 rounded-none cursor-pointer uppercase flex items-center justify-center gap-2 ${showRecommendedUse ? 'bg-cyan-accent/15 border-cyan-accent text-white' : 'border-border-cyber/80 text-muted-slate hover:text-white hover:bg-border-cyber/10'}`}
              id="recommended-use-btn"
            >
              <Lock className="w-3.5 h-3.5 text-cyan-accent" />
              <span>RECOMMENDED USE & LEGAL DISCLAIMER</span>
              <span className="text-[9px] font-mono bg-cyan-accent/10 px-1.5 py-0.2 text-cyan-accent border border-cyan-accent/20">NOTICE</span>
            </button>

            {showRecommendedUse && (
              <div className="mt-3 p-4 border border-border-cyber/60 bg-[#070a0d]/95 animate-fadeIn font-mono text-xs space-y-3 text-gray-300">
                <div className="flex items-center gap-2 border-b border-border-cyber/30 pb-2 text-cyan-accent">
                  <Lock className="w-4 h-4 text-glow-cyan" />
                  <span className="font-orbitron font-bold uppercase tracking-wider">POCKETSINT OPERATIONAL CHARTER</span>
                </div>
                <div className="space-y-3 leading-relaxed">
                  <p>
                    <strong className="text-white">1. EDUCATIONAL PURPOSES ONLY:</strong> This application is developed solely for training, academic research, and interactive defense simulation purposes. It must <span className="text-crit-red font-bold">never</span> be used to infringe upon the privacy, safety, or legal rights of any individual or organization.
                  </p>
                  <p>
                    <strong className="text-white">2. PUBLIC INFORMATION SCOPE:</strong> Any scanning or search queries generated within this system access exclusively <strong className="text-white">publicly available index data</strong> and open databases. No private, internal, or unauthorized networks are targeted.
                  </p>
                  <p>
                    <strong className="text-white">3. LOCAL CLIENT-SIDE SANDBOX:</strong> The application runs fully sandboxed within your local web browser. It accesses only local, browser-exposed system parameters such as the <strong className="text-white">Battery Status API</strong>, the JavaScript virtual machine's heap memory footprint (<strong className="text-white">RAM utilization</strong>), and file uploads loaded directly into secure memory buffers.
                  </p>
                  <p>
                    <strong className="text-white">4. ABSOLUTE PRIVACY:</strong> All target histories, search formulations, EXIF details, and generated diagnostic reports are saved purely inside your browser's local sandbox storage. <strong className="text-cyan-accent">We do not collect, maintain, store, transmit, or modify any user data or query results.</strong> Your research remains 100% confidential and localized.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tactical Signal Waveform Graphic & System Health Graph */}
        <div className="w-full md:w-[280px] shrink-0 border border-border-cyber/60 bg-black/60 p-3 flex flex-col justify-between font-mono text-[11px] relative">
          <div className="flex justify-between items-center text-[10px] border-b border-border-cyber/40 pb-1 mb-2">
            <span className="text-muted-slate uppercase font-bold">WAVEFORM MONITOR</span>
            <span className="text-green-highlight animate-pulse">● LIVE_FEED</span>
          </div>
          
          {/* Animated Visual Canvas simulation for electronic warfare / signal */}
          <div className="h-20 flex items-center justify-center gap-1 bg-black border border-border-cyber/40 overflow-hidden relative">
            <div className="absolute inset-x-0 h-[1px] bg-cyan-accent/20" />
            {[20, 45, 90, 30, 15, 60, 80, 50, 20, 75, 40, 95, 20, 60, 85, 30, 40, 10].map((h, i) => (
              <div 
                key={i} 
                className="w-[3px] bg-cyan-accent transition-all duration-150" 
                style={{ 
                  height: `${Math.max(10, Math.min(95, h + (Math.floor(Math.random() * 30) - 15)))}%`,
                  opacity: i % 2 === 0 ? 0.9 : 0.6
                }} 
              />
            ))}
          </div>

          <div className="mt-3 space-y-1 text-[10px] text-gray-400">
            <div className="flex justify-between">
              <span>SATELLITE POSITION:</span>
              <span className="text-white font-bold">148.91° W / 32.70° N</span>
            </div>
            <div className="flex justify-between">
              <span>OSINT SECTOR:</span>
              <span className="text-cyan-accent font-bold">SEC-ALPHA-9</span>
            </div>
            <div className="flex justify-between">
              <span>ENCRYPTION DECK:</span>
              <span className="text-green-highlight font-bold">AES-256-MIL</span>
            </div>
          </div>
        </div>

      </div>

      {/* 2. REALTIME HARDWARE COUNTERS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="panel-hardware p-3 flex items-center gap-4 relative">
              <div className="p-2 border border-border-cyber/80 bg-black/40">
                <Icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div className="min-w-0">
                <span className="text-muted-slate text-[10px] font-mono block uppercase tracking-wider">{s.label}</span>
                <span className="font-orbitron font-black text-xl text-white block leading-none pt-0.5">{s.value}</span>
                <span className="text-[10px] text-gray-400 block truncate pt-0.5">{s.desc}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. LOG TELEMETRY AND INVESTIGATION LOG TABLE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Pinned Targets / Log History */}
        <div className="lg:col-span-2 panel-hardware p-4 flex flex-col space-y-3">
          <div className="flex items-center justify-between border-b border-border-cyber pb-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-accent" />
              <h3 className="font-orbitron font-bold text-xs uppercase tracking-wider text-gray-200">Local Mission Registry</h3>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => { playBeep('click'); setPinnedFilter(!pinnedFilter); }}
                className={`px-2 py-1 text-[10px] border font-bold font-mono transition-colors duration-150 cursor-pointer ${pinnedFilter ? 'bg-cyan-accent/20 border-cyan-accent text-cyan-accent' : 'border-border-cyber text-muted-slate hover:text-white'}`}
              >
                {pinnedFilter ? 'SHOW ALL' : 'PINNED TARGETS ONLY'}
              </button>
              {history.length > 0 && (
                <button 
                  onClick={() => { if(confirm('Wipe local device logs?')) clearHistory(); }}
                  className="p-1 border border-border-cyber hover:bg-crit-red/20 hover:border-crit-red hover:text-crit-red text-muted-slate transition-colors duration-150 cursor-pointer"
                  title="Wipe local history"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* List items */}
          <div className="space-y-2 overflow-y-auto max-h-[300px] pr-1">
            {displayedHistory.length === 0 ? (
              <div className="py-12 text-center text-xs font-mono text-muted-slate border border-dashed border-border-cyber/60">
                NO TARGETS ACQUIRED YET. USE THE TOOLS BELOW TO SCAN.
              </div>
            ) : (
              displayedHistory.map((item) => (
                <div 
                  key={item.id}
                  className="border border-border-cyber/60 bg-black/40 hover:border-cyan-accent/60 p-2.5 flex items-center justify-between gap-4 transition-all duration-150"
                >
                  <div className="min-w-0 flex-grow">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono bg-border-cyber px-1.5 py-0.5 text-gray-400 font-bold uppercase">{item.module.replace('_', ' ')}</span>
                      <span className="text-[11px] font-mono text-muted-slate">{new Date(item.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="font-mono text-sm font-bold text-white truncate pt-1">{item.target}</div>
                    <div className="text-[11px] text-gray-400 truncate">{item.summary}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => toggleFavorite(item.id)}
                      className="p-1.5 border border-border-cyber/60 hover:border-warn-amber text-muted-slate hover:text-warn-amber transition-colors duration-150 cursor-pointer"
                    >
                      <Heart className={`w-3.5 h-3.5 ${item.favorite ? 'fill-warn-amber text-warn-amber' : ''}`} />
                    </button>
                    <button 
                      onClick={() => handleLaunchTarget(item)}
                      className="p-1.5 border border-border-cyber/60 hover:border-cyan-accent hover:text-cyan-accent text-muted-slate transition-colors duration-150 cursor-pointer"
                      title="Load telemetry in panel"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => deleteHistoryItem(item.id)}
                      className="p-1.5 border border-border-cyber/60 hover:border-crit-red hover:text-crit-red text-muted-slate transition-colors duration-150 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Cyber terminal mission logs */}
        <div className="panel-hardware p-4 flex flex-col space-y-3">
          <div className="flex items-center justify-between border-b border-border-cyber pb-2">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-accent" />
              <h3 className="font-orbitron font-bold text-xs uppercase tracking-wider text-gray-200">Terminal Mission Log</h3>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-green-highlight animate-ping" />
          </div>

          <div className="flex-grow flex flex-col justify-between bg-black/80 border border-border-cyber/80 p-3 font-mono text-[10.5px] leading-relaxed text-green-highlight/90 overflow-y-auto max-h-[250px]">
            <pre className="whitespace-pre-wrap font-mono">{logText}</pre>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => {
                playBeep('click');
                setLogText(prev => prev + `\nINFO: Manual system audit compiled at ${new Date().toLocaleTimeString()} UTC.`);
              }}
              className="w-full py-1.5 border border-border-cyber hover:border-green-highlight hover:text-green-highlight bg-black/20 text-[10px] font-bold tracking-widest font-mono text-center uppercase transition-all duration-150 cursor-pointer"
            >
              RUN DIAGNOSTIC CHECK
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
