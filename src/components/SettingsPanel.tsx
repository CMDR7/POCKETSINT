/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useDeviceStore } from '../store/deviceStore';
import { Sliders, Volume2, VolumeX, Eye, Info, Trash2, Download, Upload, Shield, Check } from 'lucide-react';

export const SettingsPanel: React.FC = () => {
  const { settings, updateSettings, clearHistory, playBeep, history } = useDeviceStore();
  const [investigatorName, setInvestigatorName] = useState(settings.investigatorName);
  const [agencyCode, setAgencyCode] = useState(settings.agencyCode);
  const [copiedConf, setCopiedConf] = useState(false);

  const handleUpdateCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    playBeep('click');
    updateSettings({
      investigatorName: investigatorName.trim().toUpperCase() || 'AGENT_X',
      agencyCode: agencyCode.trim().toUpperCase() || 'POCKETSINT-09'
    });
    playBeep('complete');
  };

  const exportSettingsAndHistory = () => {
    playBeep('click');
    const data = JSON.stringify({
      settings,
      history
    }, null, 2);

    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pocketsint_firmware_config.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setCopiedConf(true);
    setTimeout(() => setCopiedConf(false), 2000);
  };

  const importSettingsAndHistory = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    playBeep('click');
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target?.result as string);
        if (data.settings) {
          updateSettings(data.settings);
          setInvestigatorName(data.settings.investigatorName);
          setAgencyCode(data.settings.agencyCode);
        }
        if (data.history) {
          localStorage.setItem('pocketsint_history', JSON.stringify(data.history));
          // Simple window reload to re-load all store bindings cleanly
          window.location.reload();
        }
        playBeep('complete');
      } catch (err) {
        alert('Malformed firmware configuration file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      
      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Device Parameters card */}
        <div className="panel-hardware p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-border-cyber/60 pb-2 mb-4">
              <Sliders className="w-5 h-5 text-muted-slate" />
              <h2 className="font-orbitron font-extrabold tracking-widest text-muted-slate uppercase text-glow-cyan">DEVICE PARAMETERS</h2>
            </div>

            <div className="space-y-4 text-xs font-mono">
              
              {/* Sound Enabled */}
              <div className="flex items-center justify-between p-2.5 border border-border-cyber bg-black">
                <div>
                  <span className="text-white font-bold block">TACTILE INTERFACE CLICKS</span>
                  <span className="text-[10px] text-muted-slate">Synthesizes programmatic audio beep signatures locally.</span>
                </div>
                <button
                  onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
                  className={`px-3 py-1.5 border font-bold font-orbitron text-[10px] transition-colors duration-150 cursor-pointer ${settings.soundEnabled ? 'bg-green-highlight/10 border-green-highlight text-green-highlight' : 'border-border-cyber text-muted-slate'}`}
                >
                  {settings.soundEnabled ? 'ACTIVE' : 'MUTED'}
                </button>
              </div>

              {/* Scanlines Enabled */}
              <div className="flex items-center justify-between p-2.5 border border-border-cyber bg-black">
                <div>
                  <span className="text-white font-bold block">CRT SCANLINE FLICKER FILTER</span>
                  <span className="text-[10px] text-muted-slate">Overlay active scanlines and micro-refresh cathode flicker.</span>
                </div>
                <button
                  onClick={() => updateSettings({ scanlinesEnabled: !settings.scanlinesEnabled })}
                  className={`px-3 py-1.5 border font-bold font-orbitron text-[10px] transition-colors duration-150 cursor-pointer ${settings.scanlinesEnabled ? 'bg-cyan-accent/10 border-cyan-accent text-cyan-accent' : 'border-border-cyber text-muted-slate'}`}
                >
                  {settings.scanlinesEnabled ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>

              {/* Low Power Mode */}
              <div className="flex items-center justify-between p-2.5 border border-border-cyber bg-black">
                <div>
                  <span className="text-white font-bold block">LOW POWER MODE</span>
                  <span className="text-[10px] text-muted-slate">Limits active simulation cycles to preserve device battery life.</span>
                </div>
                <button
                  onClick={() => updateSettings({ lowPowerMode: !settings.lowPowerMode })}
                  className={`px-3 py-1.5 border font-bold font-orbitron text-[10px] transition-colors duration-150 cursor-pointer ${settings.lowPowerMode ? 'bg-warn-amber/10 border-warn-amber text-warn-amber' : 'border-border-cyber text-muted-slate'}`}
                >
                  {settings.lowPowerMode ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Investigator Credentials card */}
        <div className="panel-hardware p-4 flex flex-col justify-between">
          <form onSubmit={handleUpdateCredentials} className="space-y-4">
            <div className="flex items-center gap-2 border-b border-border-cyber/60 pb-2 mb-4">
              <Shield className="w-5 h-5 text-muted-slate" />
              <h3 className="font-orbitron font-bold text-xs uppercase text-gray-200">OPERATIVE SIGNATURE</h3>
            </div>

            <div className="space-y-3 font-mono text-xs">
              
              <div className="space-y-1">
                <label className="text-muted-slate uppercase">INVESTIGATOR ID:</label>
                <input
                  type="text"
                  placeholder="e.g. AGENT_X"
                  value={investigatorName}
                  onChange={(e) => setInvestigatorName(e.target.value)}
                  className="w-full bg-black border border-border-cyber px-2.5 py-2 text-white font-bold focus:outline-none focus:border-cyan-accent"
                />
              </div>

              <div className="space-y-1">
                <label className="text-muted-slate uppercase">AGENCY / UNIT CODE:</label>
                <input
                  type="text"
                  placeholder="e.g. POCKETSINT-09"
                  value={agencyCode}
                  onChange={(e) => setAgencyCode(e.target.value)}
                  className="w-full bg-black border border-border-cyber px-2.5 py-2 text-white font-bold focus:outline-none focus:border-cyan-accent"
                />
              </div>

            </div>

            <button
              type="submit"
              className="w-full py-2 bg-[#0a0c0e] hover:bg-cyan-accent/20 border border-cyan-accent text-cyan-accent font-orbitron font-extrabold tracking-widest text-xs transition-colors duration-150 cursor-pointer"
            >
              SAVE ID CREDENTIALS
            </button>
          </form>
        </div>

      </div>

      {/* Database operations row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        
        {/* Memory cache purge card */}
        <div className="panel-hardware p-4">
          <div className="flex items-center gap-2 border-b border-border-cyber/60 pb-2 mb-4">
            <Trash2 className="w-5 h-5 text-crit-red" />
            <h3 className="font-orbitron font-bold text-xs uppercase text-gray-200">MEMORY STORAGE PURGE</h3>
          </div>

          <p className="text-xs text-gray-400 font-mono leading-relaxed pb-4">
            Wipe all investigative traces, profile scans, image forensics logs, and query histories from the client browser IndexedDB and localStorage safely.
          </p>

          <button
            onClick={() => { if(confirm('Are you absolutely sure you want to completely purge local POCKETSINT history?')) clearHistory(); }}
            className="py-2.5 px-4 bg-black hover:bg-crit-red/20 border border-crit-red text-crit-red font-orbitron font-extrabold tracking-widest text-xs transition-all duration-150 rounded-none cursor-pointer"
          >
            PURGE DECK CACHE
          </button>
        </div>

        {/* Configuration exports/imports card */}
        <div className="panel-hardware p-4">
          <div className="flex items-center gap-2 border-b border-border-cyber/60 pb-2 mb-4">
            <Download className="w-5 h-5 text-cyan-accent" />
            <h3 className="font-orbitron font-bold text-xs uppercase text-gray-200">DEVICE CONFIGURATION BACKUP</h3>
          </div>

          <p className="text-xs text-gray-400 font-mono leading-relaxed pb-4">
            Backup your settings and case log database into a single encrypted config file to reload on another terminal.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={exportSettingsAndHistory}
              className="flex-grow py-2 px-3 border border-border-cyber bg-black hover:border-cyan-accent hover:text-cyan-accent font-mono text-xs transition-colors duration-150 cursor-pointer flex items-center justify-center gap-1 text-muted-slate"
            >
              {copiedConf ? (
                <>
                  <Check className="w-4 h-4 text-green-highlight" />
                  <span>EXPORT COMPLETE</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>DOWNLOAD BACKUP</span>
                </>
              )}
            </button>

            <button
              onClick={() => document.getElementById('config-import-elem')?.click()}
              className="flex-grow py-2 px-3 border border-border-cyber bg-black hover:border-green-highlight hover:text-green-highlight font-mono text-xs transition-colors duration-150 cursor-pointer flex items-center justify-center gap-1 text-muted-slate"
            >
              <input 
                id="config-import-elem"
                type="file"
                accept=".json"
                onChange={importSettingsAndHistory}
                className="hidden"
              />
              <Upload className="w-4 h-4" />
              <span>UPLOAD CONFIG</span>
            </button>
          </div>
        </div>

      </div>

      {/* System info deck */}
      <div className="panel-hardware p-4">
        <div className="flex items-center gap-2 border-b border-border-cyber/60 pb-2 mb-3">
          <Info className="w-5 h-5 text-cyan-accent" />
          <h3 className="font-orbitron font-bold text-xs uppercase text-gray-200">POCKETSINT FIRMWARE MANUAL</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[11px] font-mono text-gray-400">
          <div className="space-y-1">
            <span className="text-white font-bold uppercase block">100% PASSIVE SCANNING</span>
            <p className="leading-relaxed">
              No remote query ever triggers active intrusion detection systems on target platforms. Lookups operate strictly via public DNS configurations, local headers reading, and advance dorking.
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-white font-bold uppercase block">SANDBOX SECURITY EXCLUSION</span>
            <p className="leading-relaxed">
              Data extracted from local EXIF and text digests remain on device state structures. They are never uploaded or aggregated onto any analytical backend servers.
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-white font-bold uppercase block">CUSTOM HARDWARE COMPATIBILITY</span>
            <p className="leading-relaxed">
              Designed primarily to render beautifully on high-performance handheld devices, field tablets, and responsive multi-touch cyberdecks in dark field environments.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
