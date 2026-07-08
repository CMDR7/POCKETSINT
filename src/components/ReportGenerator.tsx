/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useDeviceStore } from '../store/deviceStore';
import { FileText, Download, Printer, Shield, Eye, HelpCircle, FileCheck, Check } from 'lucide-react';
import { getDetectedDeviceName } from './DeviceShell';

export const ReportGenerator: React.FC = () => {
  const { history, settings, playBeep } = useDeviceStore();
  const [reportCopied, setReportCopied] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'json' | 'markdown' | 'print' | 'html'>('markdown');

  // Compile a comprehensive HTML standalone briefing report
  const compileHtmlReport = () => {
    const timestampStr = new Date().toLocaleString();
    const itemsHtml = history.length === 0 
      ? `<div class="text-center py-12 text-gray-500 font-mono text-xs border border-[#1E252C] bg-black/20">NO FORENSIC SCANS RECORDED DURING THIS SESSION</div>`
      : history.map((item, idx) => `
        <div class="bg-[#101214] border border-[#1E252C] p-5 relative" style="border-radius: 0; margin-bottom: 1.5rem;">
          <!-- Corner hardware details -->
          <div style="position: absolute; top: 0; left: 0; width: 4px; height: 4px; border-top: 1px solid #00f2ff; border-left: 1px solid #00f2ff;"></div>
          <div style="position: absolute; bottom: 0; right: 0; width: 4px; height: 4px; border-bottom: 1px solid #00f2ff; border-right: 1px solid #00f2ff;"></div>
          
          <div class="absolute top-3 right-4 text-[10px] font-mono font-bold text-gray-600">
            ATOM RECORD #${idx + 1}
          </div>
          
          <div class="flex items-center gap-2.5 mb-4">
            <span class="px-2.5 py-0.5 bg-[#00f2ff]/10 border border-[#00f2ff]/40 text-[#00f2ff] text-[10px] font-mono tracking-widest font-bold uppercase" style="border-radius: 0;">
              ${item.module.replace('_', ' ')}
            </span>
            <span class="text-[10px] font-mono text-gray-500">${new Date(item.timestamp).toLocaleString()}</span>
          </div>

          <div class="space-y-3 text-xs font-mono">
            <div class="grid grid-cols-1 sm:grid-cols-4 gap-2 py-1.5 border-b border-[#1E252C]/40">
              <span class="text-gray-500 font-bold uppercase">TARGET ENTITY:</span>
              <span class="sm:col-span-3 text-white font-bold tracking-wider">${item.target}</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-4 gap-2 py-1.5 border-b border-[#1E252C]/40">
              <span class="text-gray-500 font-bold uppercase">SUMMARY FINDING:</span>
              <span class="sm:col-span-3 text-[#39ff14] font-bold">${item.summary}</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-4 gap-2 py-1.5 border-b border-[#1E252C]/40">
              <span class="text-gray-500 font-bold uppercase">FORENSIC CATEGORY:</span>
              <span class="sm:col-span-3 text-amber-500 font-semibold">${item.category}</span>
            </div>
            
            <div class="mt-4 pt-2">
              <span class="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1.5">RAW DATA ATOM PAYLOAD</span>
              <pre class="bg-[#050505] border border-[#1E252C] p-3 text-[10px] text-[#39ff14]/90 overflow-x-auto leading-relaxed" style="border-radius: 0; max-height: 200px;">${JSON.stringify(item.details, null, 2)}</pre>
            </div>
          </div>
        </div>
      `).join('');

    return `<!doctype html>
<html lang="en" style="height: 100%; margin: 0;">
  <head>
    <meta charset="utf-8">
    <title>POCKETSINT Portable Briefing Report</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@500;700&family=VT323&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
    <style>
      body {
        margin: 0;
        background-color: #050505;
        color: #d1d5db;
        font-family: 'Rajdhani', sans-serif;
      }
      .font-orbitron { font-family: 'Orbitron', sans-serif; }
      .font-mono { font-family: 'JetBrains Mono', monospace; }
      .font-dotmatrix { font-family: 'VT323', monospace; }
      
      .panel-hardware {
        background: #101214;
        border: 1px solid #1E252C;
        position: relative;
      }
      .panel-hardware::before {
        content: '';
        position: absolute;
        top: 0; left: 0; width: 6px; height: 6px;
        border-top: 2px solid #00f2ff;
        border-left: 2px solid #00f2ff;
        pointer-events: none;
      }
      .panel-hardware::after {
        content: '';
        position: absolute;
        bottom: 0; right: 0; width: 6px; height: 6px;
        border-bottom: 2px solid #00f2ff;
        border-right: 2px solid #00f2ff;
        pointer-events: none;
      }
      .glow-cyan {
        text-shadow: 0 0 8px rgba(0, 242, 255, 0.6);
      }
      .dot-matrix-screen {
        background-color: #000000;
        position: relative;
        overflow: hidden;
      }
      .dot-matrix-screen::after {
        content: "";
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background-image: radial-gradient(rgba(0, 0, 0, 0.5) 1px, transparent 1px);
        background-size: 2px 2px;
        z-index: 5;
        pointer-events: none;
      }
      @keyframes ticker-marquee {
        0% { transform: translate3d(100%, 0, 0); }
        100% { transform: translate3d(-100%, 0, 0); }
      }
      .animate-ticker {
        animation: ticker-marquee 15s linear infinite;
      }
    </style>
  </head>
  <body class="p-4 md:p-8 max-w-5xl mx-auto min-h-screen flex flex-col justify-between">
    
    <!-- Outer Main Hardware panel frame -->
    <div class="panel-hardware p-6 md:p-8 border-2 border-[#1E252C] shadow-[0_0_30px_rgba(0,242,255,0.15)] flex-grow" style="border-radius:0;">
      
      <!-- Top header strip -->
      <div class="flex flex-col md:flex-row md:items-center justify-between border-b border-[#1E252C] pb-4 mb-6">
        <div>
          <span class="text-[10px] tracking-widest text-gray-500 block font-mono">POCKETSINT DIRECT_LINK_EXPORT v4.9.0</span>
          <h1 class="text-3xl font-extrabold tracking-widest text-[#00f2ff] font-orbitron glow-cyan uppercase">INTELLIGENCE BRIEFING</h1>
        </div>
        
        <!-- Scrolling agent username in same neon peach dot matrix style -->
        <div class="mt-4 md:mt-0 flex items-center gap-3">
          <span class="text-xs text-gray-500 font-mono">DEVICE_USER:</span>
          <div class="w-48 h-7 bg-black border border-[#1E252C] rounded-none dot-matrix-screen relative flex items-center">
            <div class="absolute whitespace-nowrap animate-ticker text-[#FF9E79] tracking-[0.1em] uppercase font-bold text-lg" style="font-family: 'VT323', monospace; text-shadow: 0 0 6px rgba(255, 158, 121, 0.85);">
              \${settings.investigatorName || 'ANONYMOUS_AGENT'} @ \${getDetectedDeviceName()} &nbsp;&nbsp;&nbsp;&nbsp; \${settings.investigatorName || 'ANONYMOUS_AGENT'} @ \${getDetectedDeviceName()}
            </div>
          </div>
        </div>
      </div>

      <!-- Telemetry metric tags block -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 text-xs font-mono">
        <div class="bg-black/40 border border-[#1E252C] p-3">
          <span class="text-gray-500 block text-[9px]">COMPILED_AT</span>
          <span class="text-gray-200 font-bold">${timestampStr} UTC-7</span>
        </div>
        <div class="bg-black/40 border border-[#1E252C] p-3">
          <span class="text-gray-500 block text-[9px]">SCANS_RECORDED</span>
          <span class="text-[#39ff14] font-bold">${history.length} ACTIVE ATOMS</span>
        </div>
        <div class="bg-black/40 border border-[#1E252C] p-3">
          <span class="text-gray-500 block text-[9px]">SECURITY_LEVEL</span>
          <span class="text-[#39ff14] font-bold">AES_256 ENCRYPT</span>
        </div>
        <div class="bg-black/40 border border-[#1E252C] p-3">
          <span class="text-gray-500 block text-[9px]">INTEGRITY_INDEX</span>
          <span class="text-[#00f2ff] font-bold">100% SECURE</span>
        </div>
      </div>

      <!-- Forensics Log section header -->
      <div class="space-y-6">
        <h2 class="text-sm font-bold font-orbitron tracking-widest text-white uppercase border-b border-[#1E252C] pb-2 flex items-center gap-2">
          <span class="w-1.5 h-4 bg-[#00f2ff] inline-block"></span>
          RECONNAISSANCE SCANS REGISTERED
        </h2>
        
        <div class="space-y-2">
          ${itemsHtml}
        </div>
      </div>

      <!-- Standalone report bottom footer status -->
      <div class="border-t border-[#1E252C] pt-6 mt-10 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-gray-500">
        <div>POCKETSINT SECURE CRYPTO-GRAPHIC RECONNAISSANCE SYSTEM</div>
        <div class="mt-2 sm:mt-0 text-[#39ff14] tracking-wider font-bold">STATUS: BRIEFING_INTEGRITY_VERIFIED</div>
      </div>

    </div>

  </body>
</html>`;
  };

  // Compile a comprehensive investigative report string
  const compileMarkdownReport = () => {
    const timestampStr = new Date().toLocaleString();
    let md = `# POCKETSINT COMPREHENSIVE RECONNAISSANCE REPORT\n`;
    md += `Generated: ${timestampStr} UTC-7\n`;
    md += `Investigator: ${settings.investigatorName}\n`;
    md += `Agency Code: ${settings.agencyCode}\n`;
    md += `========================================================\n\n`;

    if (history.length === 0) {
      md += `* No forensic scans have been recorded during this session.\n`;
    } else {
      history.forEach((item, index) => {
        md += `## TARGET LOG ${index + 1}: [${item.id}]\n`;
        md += `- **Timestamp**: ${new Date(item.timestamp).toLocaleString()}\n`;
        md += `- **OSINT Module**: ${item.module.replace('_', ' ')}\n`;
        md += `- **Target Host/Entity**: ${item.target}\n`;
        md += `- **Summary**: ${item.summary}\n`;
        md += `- **Details Payload**:\n\`\`\`json\n${JSON.stringify(item.details || {}, null, 2)}\n\`\`\`\n`;
        md += `--------------------------------------------------------\n\n`;
      });
    }

    md += `\n[END OF REPORT - POCKETSINT CRYPTO-FORENSICS]`;
    return md;
  };

  const compileJsonReport = () => {
    return JSON.stringify({
      generator: 'POCKETSINT v4.9.0-CYBER',
      timestamp: new Date().toISOString(),
      investigator: settings.investigatorName,
      agency: settings.agencyCode,
      scansCount: history.length,
      history
    }, null, 2);
  };

  const copyToClipboard = () => {
    const text = selectedFormat === 'json' 
      ? compileJsonReport() 
      : selectedFormat === 'html'
      ? compileHtmlReport()
      : compileMarkdownReport();
    navigator.clipboard.writeText(text);
    setReportCopied(true);
    playBeep('click');
    setTimeout(() => setReportCopied(false), 2000);
  };

  const downloadReportFile = () => {
    playBeep('click');
    const content = selectedFormat === 'json' 
      ? compileJsonReport() 
      : selectedFormat === 'html'
      ? compileHtmlReport()
      : compileMarkdownReport();
    const ext = selectedFormat === 'json' ? 'json' : selectedFormat === 'html' ? 'html' : 'md';
    const blob = new Blob([content], { type: selectedFormat === 'html' ? 'text/html;charset=utf-8' : 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pocketsint_recon_report_${Date.now()}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const triggerPrintWindow = () => {
    playBeep('click');
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Configuration row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Report form parameters */}
        <div className="md:col-span-1 panel-hardware p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-border-cyber/60 pb-2 mb-4">
              <FileText className="w-5 h-5 text-warn-amber" />
              <h2 className="font-orbitron font-extrabold tracking-widest text-warn-amber uppercase text-glow-amber">REPORTS COMPILER</h2>
            </div>

            <p className="text-xs text-gray-400 font-mono leading-relaxed pb-4">
              Compile local scanner history into standard markdown, json objects, or system print states.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <span className="text-muted-slate font-bold uppercase block text-[10px]">EXPORT FORMAT:</span>
              
              <div className="space-y-2">
                {[
                  { id: 'markdown' as const, label: 'MARKDOWN RECORD (.md)' },
                  { id: 'json' as const, label: 'JSON INTELLIGENCE BUNDLE (.json)' },
                  { id: 'html' as const, label: 'SLEEK HTML BRIEFING (.html)' },
                  { id: 'print' as const, label: 'PRINTABLE TRANSCRIPT' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => { playBeep('click'); setSelectedFormat(f.id); }}
                    className={`w-full text-left p-2 border transition-colors duration-150 cursor-pointer ${selectedFormat === f.id ? 'bg-warn-amber/10 border-warn-amber text-white font-bold' : 'border-border-cyber text-muted-slate'}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-6 border-t border-border-cyber/40 mt-4">
            {selectedFormat === 'print' ? (
              <button
                onClick={triggerPrintWindow}
                className="w-full py-2.5 bg-[#0a0c0e] hover:bg-warn-amber/20 border-2 border-warn-amber text-warn-amber font-orbitron font-extrabold tracking-widest text-xs transition-all duration-150 rounded-none cursor-pointer flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>TRIGGER SYSTEM PRINT</span>
              </button>
            ) : (
              <>
                <button
                  onClick={downloadReportFile}
                  className="w-full py-2.5 bg-[#0a0c0e] hover:bg-warn-amber/20 border-2 border-warn-amber text-warn-amber font-orbitron font-extrabold tracking-widest text-xs transition-all duration-150 rounded-none cursor-pointer flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>EXPORT SYSTEM FILE</span>
                </button>

                <button
                  onClick={copyToClipboard}
                  className="w-full py-2 border border-border-cyber/80 hover:border-white hover:text-white font-mono text-[11px] transition-colors duration-150 cursor-pointer flex items-center justify-center gap-2 text-muted-slate"
                >
                  {reportCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-highlight" />
                      <span>COPIED TO CLIPBOARD</span>
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>COPY RAW TEXT</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Live preview console */}
        <div className="md:col-span-2 panel-hardware flex flex-col h-[380px]">
          <div className="border-b border-border-cyber px-4 py-2 bg-black/40 flex items-center justify-between font-mono text-[10px]">
            <span className="font-orbitron font-bold text-gray-200 uppercase tracking-widest flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-warn-amber" />
              LIVE TRANSCRIPT PREVIEW
            </span>
            <span className="text-muted-slate">{history.length} ACTIVE ATOMS</span>
          </div>

          <div className="flex-grow bg-black p-4 font-mono text-[11px] text-green-highlight/90 overflow-y-auto whitespace-pre-wrap select-text selection:bg-warn-amber selection:text-black leading-relaxed">
            {selectedFormat === 'json' 
              ? compileJsonReport() 
              : selectedFormat === 'html'
              ? compileHtmlReport()
              : compileMarkdownReport()}
          </div>
        </div>

      </div>

    </div>
  );
};
