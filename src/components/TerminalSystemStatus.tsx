/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Database, Network, Activity, ArrowUpRight, ArrowDownLeft, Sliders, ChevronUp, ChevronDown } from 'lucide-react';

interface PeerConnection {
  id: string;
  host: string;
  port: number;
  protocol: 'WSS' | 'HTTPS' | 'TCP';
  status: 'ESTABLISHED' | 'ACTIVE' | 'LISTENING' | 'SYNCING';
  bytesSent: number;
  bytesReceived: number;
  latency: number;
}

export const TerminalSystemStatus: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [txCount, setTxCount] = useState(14820);
  const [rxCount, setRxCount] = useState(41295);
  const [activePeers, setActivePeers] = useState<PeerConnection[]>([
    { id: 'GW_NODE_01', host: '10.0.8.1', port: 443, protocol: 'HTTPS', status: 'ESTABLISHED', bytesSent: 2048, bytesReceived: 8192, latency: 12 },
    { id: 'SEC_OSINT_SRV', host: '185.190.140.23', port: 3000, protocol: 'WSS', status: 'ACTIVE', bytesSent: 12048, bytesReceived: 28192, latency: 45 },
    { id: 'LOCAL_SUBNET', host: '192.168.1.104', port: 80, protocol: 'TCP', status: 'LISTENING', bytesSent: 0, bytesReceived: 0, latency: 0 },
    { id: 'RESOLVER_PRIMARY', host: '8.8.8.8', port: 53, protocol: 'TCP', status: 'SYNCING', bytesSent: 712, bytesReceived: 1420, latency: 18 }
  ]);
  const [memoryStats, setMemoryStats] = useState({
    used: 42.4,
    total: 128.0,
    limit: 256.0,
    percent: 33
  });

  useEffect(() => {
    const timer = setInterval(() => {
      // 1. Simulate packet tx/rx increases
      const txDelta = Math.floor(Math.random() * 24) + 1;
      const rxDelta = Math.floor(Math.random() * 85) + 5;
      setTxCount(prev => prev + txDelta);
      setRxCount(prev => prev + rxDelta);

      // 2. Simulate fluctuating latency and bytes on active peers
      setActivePeers(prevPeers => 
        prevPeers.map(peer => {
          if (peer.status === 'LISTENING') return peer;
          
          const sentAdd = Math.floor(Math.random() * 150);
          const recvAdd = Math.floor(Math.random() * 550);
          const newLatency = Math.max(8, Math.min(180, peer.latency + (Math.floor(Math.random() * 11) - 5)));
          
          // Randomly fluctuate status for flair
          let newStatus = peer.status;
          if (Math.random() > 0.95) {
            newStatus = peer.status === 'ACTIVE' ? 'ESTABLISHED' : 'ACTIVE';
          }

          return {
            ...peer,
            bytesSent: peer.bytesSent + sentAdd,
            bytesReceived: peer.bytesReceived + recvAdd,
            latency: newLatency,
            status: newStatus
          };
        })
      );

      // 3. Update memory values to match chrome heap or perfectly simulate
      if (typeof window !== 'undefined' && (window.performance as any)?.memory) {
        const mem = (window.performance as any).memory;
        const usedMB = +(mem.usedJSHeapSize / (1024 * 1024)).toFixed(1);
        const totalMB = +(mem.totalJSHeapSize / (1024 * 1024)).toFixed(1);
        const limitMB = +(mem.jsHeapSizeLimit / (1024 * 1024)).toFixed(1);
        setMemoryStats({
          used: usedMB,
          total: totalMB,
          limit: limitMB,
          percent: Math.round((mem.usedJSHeapSize / mem.jsHeapSizeLimit) * 100)
        });
      } else {
        // Safe, clean fluctuating fallback simulations
        setMemoryStats(prev => {
          const delta = (Math.random() * 1.6 - 0.8);
          const nextUsed = Math.max(35, Math.min(85, prev.used + delta));
          return {
            ...prev,
            used: +nextUsed.toFixed(1),
            percent: Math.round((nextUsed / prev.limit) * 100)
          };
        });
      }
    }, 1500);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full md:w-[280px] shrink-0 border border-border-cyber/60 bg-black/60 p-3 flex flex-col justify-between font-mono text-[11px] relative select-none">
      
      {/* Header telemetry band */}
      <div className="flex justify-between items-center text-[10px] border-b border-border-cyber/40 pb-1 mb-2">
        <span className="text-muted-slate uppercase font-bold tracking-wider flex items-center gap-1">
          <Activity className="w-3.5 h-3.5 text-cyan-accent" />
          <span>SYSTEM TELEMETRY</span>
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-accent"></span>
          </span>
          <span className="text-[9px] font-orbitron font-extrabold tracking-widest text-cyan-accent">LIVE</span>
        </div>
      </div>

      <div className="space-y-3">
        
        {/* Memory Allocation Details */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-cyan-accent border-b border-border-cyber/20 pb-0.5">
            <div className="flex items-center gap-1">
              <Database className="w-3 h-3 text-cyan-accent" />
              <span className="font-bold uppercase">Memory Allocation</span>
            </div>
            <span className="text-[8px] text-muted-slate">VIRTUAL_VM</span>
          </div>

          <div className="space-y-1 text-[10px]">
            <div className="flex justify-between text-gray-400">
              <span>HEAP USE:</span>
              <span className="text-white font-bold">{memoryStats.percent}% ({memoryStats.used} MB)</span>
            </div>
            
            {/* Visual Segmented Progress Bar */}
            <div className="w-full h-2 bg-black border border-border-cyber/40 p-[1px] flex gap-[2px]">
              {Array.from({ length: 15 }).map((_, idx) => {
                const fillThreshold = (idx / 15) * 100;
                const isFilled = memoryStats.percent >= fillThreshold;
                return (
                  <div
                    key={idx}
                    className={`flex-grow h-full ${
                      isFilled 
                        ? idx < 10 
                          ? 'bg-cyan-accent' 
                          : idx < 13 
                            ? 'bg-warn-amber' 
                            : 'bg-crit-red' 
                        : 'bg-transparent'
                    }`}
                  />
                );
              })}
            </div>

            <div className="flex justify-between text-muted-slate text-[9px]">
              <span>ALLOC: {memoryStats.total} MB</span>
              <span>LIMIT: {memoryStats.limit} MB</span>
            </div>
          </div>
        </div>

        {/* Network Connections */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-cyan-accent border-b border-border-cyber/20 pb-0.5">
            <div className="flex items-center gap-1">
              <Network className="w-3 h-3 text-cyan-accent" />
              <span className="font-bold uppercase">Secure Socket Peers</span>
            </div>
            <span className="text-[8px] text-muted-slate">ACTIVE: {activePeers.filter(p => p.status !== 'LISTENING').length}</span>
          </div>

          {/* Peer Socket list */}
          <div className="space-y-1 max-h-24 overflow-y-auto pr-1 select-text scrollbar-thin">
            {activePeers.map(peer => (
              <div key={peer.id} className="text-[9px] p-1 border border-border-cyber/20 bg-black/40 flex flex-col gap-0.5">
                <div className="flex justify-between items-center">
                  <span className="text-white font-bold tracking-wide truncate max-w-[110px]">{peer.id}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className={`w-1 h-1 rounded-full ${
                      peer.status === 'ACTIVE' 
                        ? 'bg-green-highlight' 
                        : peer.status === 'ESTABLISHED' 
                          ? 'bg-cyan-accent' 
                          : peer.status === 'SYNCING' 
                            ? 'bg-warn-amber animate-pulse' 
                            : 'bg-muted-slate'
                    }`} />
                    <span className="text-muted-slate font-bold text-[8px] uppercase">{peer.status}</span>
                  </div>
                </div>

                <div className="flex justify-between text-muted-slate text-[8px]">
                  <span>{peer.host}:{peer.port}</span>
                  {peer.latency > 0 && <span className="text-cyan-accent font-bold">{peer.latency}ms</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Realtime Socket Throughput */}
      <div className="border-t border-border-cyber/30 mt-3 pt-2 flex items-center justify-between text-[9px] text-muted-slate">
        <div className="flex items-center gap-1">
          <ArrowUpRight className="w-3 h-3 text-cyan-accent" />
          <span>TX: <strong className="text-white font-bold">{txCount.toLocaleString()}</strong> PKTS</span>
        </div>
        <div className="flex items-center gap-1">
          <ArrowDownLeft className="w-3 h-3 text-green-highlight" />
          <span>RX: <strong className="text-white font-bold">{rxCount.toLocaleString()}</strong> PKTS</span>
        </div>
      </div>

    </div>
  );
};
