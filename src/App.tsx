/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { useDeviceStore } from './store/deviceStore';
import { ModuleId } from './types';
import { DeviceShell } from './components/DeviceShell';
import { HomeDashboard } from './components/HomeDashboard';
import { UsernameRecon } from './components/UsernameRecon';
import { DomainIntelligence } from './components/DomainIntelligence';
import { ImageForensics } from './components/ImageForensics';
import { HashLab } from './components/HashLab';
import { SearchBuilder } from './components/SearchBuilder';
import { ReportGenerator } from './components/ReportGenerator';
import { SettingsPanel } from './components/SettingsPanel';
import { Binary, Globe, Camera, Hash, Search } from 'lucide-react';

export default function App() {
  const { activeModule, setActiveModule, playBeep } = useDeviceStore();

  const isToolActive = [
    'USER_RECON',
    'DOMAIN_INTEL',
    'IMAGE_FORENSICS',
    'HASH_LAB',
    'SEARCH_BUILDER'
  ].includes(activeModule);

  const toolTabs = [
    { id: 'USER_RECON' as ModuleId, label: 'USER_RECON [M-1]', icon: Binary, color: 'text-blue-accent border-blue-accent' },
    { id: 'DOMAIN_INTEL' as ModuleId, label: 'DOMAIN_INTEL [M-2]', icon: Globe, color: 'text-green-highlight border-green-highlight' },
    { id: 'IMAGE_FORENSICS' as ModuleId, label: 'IMAGE_FORENSICS [M-3]', icon: Camera, color: 'text-warn-amber border-warn-amber' },
    { id: 'HASH_LAB' as ModuleId, label: 'HASH_LAB [M-4]', icon: Hash, color: 'text-crit-red border-crit-red' },
    { id: 'SEARCH_BUILDER' as ModuleId, label: 'SEARCH_BUILDER [M-5]', icon: Search, color: 'text-cyan-accent border-cyan-accent' },
  ];

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'HOME':
        return <HomeDashboard onNavigate={setActiveModule} />;
      case 'USER_RECON':
        return <UsernameRecon />;
      case 'DOMAIN_INTEL':
        return <DomainIntelligence />;
      case 'IMAGE_FORENSICS':
        return <ImageForensics />;
      case 'HASH_LAB':
        return <HashLab />;
      case 'SEARCH_BUILDER':
        return <SearchBuilder />;
      case 'REPORTS':
        return <ReportGenerator />;
      case 'SETTINGS':
        return <SettingsPanel />;
      default:
        return <HomeDashboard onNavigate={setActiveModule} />;
    }
  };

  return (
    <DeviceShell>
      
      {/* 1. SECONDARY TOOLBAR FOR OSINT CHANNELS */}
      {isToolActive && (
        <div className="flex flex-wrap gap-2 mb-6 border-b border-border-cyber/60 pb-4 select-none">
          {toolTabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeModule === tab.id;
            const selectedStyle = isSelected 
              ? `bg-[#131d25] text-white border-2 font-black shadow-[0_0_8px_rgba(0,240,255,0.2)]`
              : `bg-black/40 text-muted-slate border border-border-cyber/60 hover:text-white hover:border-gray-500`;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  playBeep('click');
                  setActiveModule(tab.id);
                }}
                className={`flex items-center gap-2 px-3 py-2 text-[10px] sm:text-xs font-mono tracking-wider transition-all duration-150 rounded-none cursor-pointer ${selectedStyle} ${tab.color.split(' ')[0]}`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* 2. RENDER THE PRIMARY ACTIVE VIEWPORT */}
      <motion.div
        key={activeModule}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="flex-grow flex flex-col"
      >
        {renderActiveModule()}
      </motion.div>

    </DeviceShell>
  );
}

