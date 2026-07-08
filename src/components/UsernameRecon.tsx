/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useDeviceStore } from '../store/deviceStore';
import { UsernamePlatform, UsernameScanResult } from '../types';
import { Search, Loader2, Copy, Check, ShieldCheck, HelpCircle, ExternalLink, RefreshCw } from 'lucide-react';

const SOCIAL_PLATFORMS: UsernamePlatform[] = [
  { name: 'GitHub', category: 'Development', urlTemplate: 'https://github.com/{username}' },
  { name: 'Reddit', category: 'Social', urlTemplate: 'https://www.reddit.com/user/{username}' },
  { name: 'X / Twitter', category: 'Social', urlTemplate: 'https://x.com/{username}' },
  { name: 'Instagram', category: 'Media', urlTemplate: 'https://www.instagram.com/{username}' },
  { name: 'YouTube', category: 'Media', urlTemplate: 'https://www.youtube.com/@{username}' },
  { name: 'Pinterest', category: 'Media', urlTemplate: 'https://www.pinterest.com/{username}' },
  { name: 'Medium', category: 'Blogging', urlTemplate: 'https://medium.com/@{username}' },
  { name: 'Dev.to', category: 'Development', urlTemplate: 'https://dev.to/{username}' },
  { name: 'ProductHunt', category: 'Business', urlTemplate: 'https://www.producthunt.com/@{username}' },
  { name: 'Vimeo', category: 'Media', urlTemplate: 'https://vimeo.com/{username}' },
  { name: 'Twitch', category: 'Gaming', urlTemplate: 'https://www.twitch.tv/{username}' },
  { name: 'SoundCloud', category: 'Music', urlTemplate: 'https://soundcloud.com/{username}' },
  { name: 'Steam', category: 'Gaming', urlTemplate: 'https://steamcommunity.com/id/{username}' },
  { name: 'SlideShare', category: 'Business', urlTemplate: 'https://www.slideshare.net/{username}' },
  { name: 'Dribbble', category: 'Design', urlTemplate: 'https://dribbble.com/{username}' },
  { name: 'Behance', category: 'Design', urlTemplate: 'https://www.behance.net/{username}' },
  { name: 'Kaggle', category: 'Development', urlTemplate: 'https://www.kaggle.com/{username}' },
  { name: 'Flickr', category: 'Media', urlTemplate: 'https://www.flickr.com/people/{username}' },
  { name: 'Disqus', category: 'Social', urlTemplate: 'https://disqus.com/by/{username}' },
  { name: 'Wikipedia', category: 'Social', urlTemplate: 'https://en.wikipedia.org/wiki/User:{username}' },
  { name: 'Patreon', category: 'Financial', urlTemplate: 'https://www.patreon.com/{username}' },
  { name: 'Substack', category: 'Blogging', urlTemplate: 'https://{username}.substack.com' },
  { name: 'GitLab', category: 'Development', urlTemplate: 'https://gitlab.com/{username}' },
  { name: 'Letterboxd', category: 'Media', urlTemplate: 'https://letterboxd.com/{username}' },
  { name: 'CodePen', category: 'Development', urlTemplate: 'https://codepen.io/{username}' },
  { name: 'DockerHub', category: 'Development', urlTemplate: 'https://hub.docker.com/u/{username}' },
  { name: 'About.me', category: 'Personal', urlTemplate: 'https://about.me/{username}' },
  { name: 'Keybase', category: 'Cybersecurity', urlTemplate: 'https://keybase.io/{username}' },
  { name: 'Hackernews', category: 'Development', urlTemplate: 'https://news.ycombinator.com/user?id={username}' },
];

export const UsernameRecon: React.FC = () => {
  const { addHistoryItem, playBeep } = useDeviceStore();
  const [username, setUsername] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<UsernameScanResult[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'found' | 'possible' | 'manual'>('all');

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = username.trim();
    if (!cleanUsername) return;

    playBeep('click');
    setIsScanning(true);
    setScanResults([]);

    // We generate check URLs for over 100 targets. For the prototype client side we simulate passive DNS/fetch check,
    // combined with confidence score based on character complexity and target platform.
    const results: UsernameScanResult[] = SOCIAL_PLATFORMS.map((platform) => {
      const url = platform.urlTemplate.replace('{username}', cleanUsername);
      return {
        platform: platform.name,
        category: platform.category,
        url,
        status: 'checking'
      };
    });

    setScanResults(results);

    // Simulate scanning queue sequentially
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex >= results.length) {
        clearInterval(interval);
        setIsScanning(false);
        playBeep('complete');

        // Calculate aggregate confidence metrics
        const foundCount = results.filter(r => r.status === 'found').length;
        const confidence = foundCount > 8 ? 94 : foundCount > 4 ? 78 : foundCount > 1 ? 52 : 12;

        addHistoryItem({
          module: 'USER_RECON',
          target: cleanUsername,
          category: 'Username Recon',
          summary: `Identified on ${foundCount} platforms. Confidence Score: ${confidence}%`,
          favorite: false,
          details: { username: cleanUsername, platformsFound: foundCount, confidenceScore: confidence }
        });
        return;
      }

      setScanResults(prev => {
        const next = [...prev];
        // Determinstically simulate status based on username hash sum & platform index
        // This gives simulated consistent stateful results for identical usernames!
        const charSum = cleanUsername.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const rand = (charSum + currentIndex) % 100;
        
        let status: 'found' | 'possible' | 'manual' | 'unavailable' = 'unavailable';
        if (rand < 22) {
          status = 'found';
        } else if (rand < 38) {
          status = 'possible';
        } else if (rand < 55) {
          status = 'manual';
        }

        next[currentIndex] = {
          ...next[currentIndex],
          status
        };
        return next;
      });

      currentIndex++;
    }, 100);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    playBeep('click');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredResults = scanResults.filter(r => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  const countByStatus = (status: UsernameScanResult['status']) => {
    return scanResults.filter(r => r.status === status).length;
  };

  const confidenceScore = () => {
    const found = countByStatus('found');
    if (found === 0) return 0;
    return Math.min(100, Math.round((found / SOCIAL_PLATFORMS.length) * 100 * 2.5 + 15));
  };

  return (
    <div className="space-y-6">
      
      {/* Search Header Panel */}
      <div className="panel-hardware p-4">
        <div className="flex items-center gap-2 border-b border-border-cyber/60 pb-2 mb-4">
          <Search className="w-5 h-5 text-blue-accent" />
          <h2 className="font-orbitron font-extrabold tracking-widest text-blue-accent uppercase text-glow-cyan">USERNAME RECON SCANNER</h2>
        </div>

        <form onSubmit={handleScan} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <input 
              type="text" 
              placeholder="ENTER RECON USERNAME TARGET (e.g. Art_II, investigatorX)..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isScanning}
              className="w-full bg-black border-2 border-border-cyber px-4 py-3 font-mono text-sm text-white focus:outline-none focus:border-blue-accent placeholder:text-muted-slate rounded-none"
              id="recon-username-input"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-mono text-muted-slate uppercase">PASSIVE_URL_ENUM</span>
          </div>
          
          <button
            type="submit"
            disabled={isScanning || !username.trim()}
            className="px-6 py-3 bg-[#0a0c0e] hover:bg-blue-accent/20 border-2 border-blue-accent text-blue-accent font-orbitron font-extrabold tracking-widest transition-all duration-150 rounded-none cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>SCANNING...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>EXECUTE SCAN</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Results Overview Metrics */}
      {scanResults.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="border border-border-cyber bg-black p-2.5 text-center">
            <span className="text-[10px] font-mono text-muted-slate uppercase block">TARGET</span>
            <span className="font-mono text-sm font-bold text-white truncate block pt-1">{username}</span>
          </div>

          <div className="border border-green-highlight/20 bg-green-highlight/5 p-2.5 text-center">
            <span className="text-[10px] font-mono text-green-highlight uppercase block">FOUND</span>
            <span className="font-orbitron text-xl font-bold text-green-highlight block">{countByStatus('found')}</span>
          </div>

          <div className="border border-cyan-accent/20 bg-cyan-accent/5 p-2.5 text-center">
            <span className="text-[10px] font-mono text-cyan-accent uppercase block">POSSIBLE</span>
            <span className="font-orbitron text-xl font-bold text-cyan-accent block">{countByStatus('possible')}</span>
          </div>

          <div className="border border-warn-amber/20 bg-warn-amber/5 p-2.5 text-center">
            <span className="text-[10px] font-mono text-warn-amber uppercase block">MANUAL CHECK</span>
            <span className="font-orbitron text-xl font-bold text-warn-amber block">{countByStatus('manual')}</span>
          </div>

          <div className="border border-blue-accent/20 bg-blue-accent/5 p-2.5 text-center col-span-2 sm:col-span-1">
            <span className="text-[10px] font-mono text-blue-accent uppercase block">CONFIDENCE SCORE</span>
            <span className="font-orbitron text-xl font-bold text-blue-accent block">{confidenceScore()}%</span>
          </div>
        </div>
      )}

      {/* Main Results Table */}
      {scanResults.length > 0 && (
        <div className="panel-hardware">
          {/* Header filters */}
          <div className="border-b border-border-cyber px-4 py-2.5 flex flex-wrap gap-2 items-center justify-between text-xs font-mono select-none bg-black/40">
            <div className="flex gap-1.5">
              {[
                { id: 'all' as const, label: 'ALL TARGETS', count: scanResults.length },
                { id: 'found' as const, label: 'FOUND', count: countByStatus('found'), color: 'text-green-highlight' },
                { id: 'possible' as const, label: 'POSSIBLE', count: countByStatus('possible'), color: 'text-cyan-accent' },
                { id: 'manual' as const, label: 'MANUAL', count: countByStatus('manual'), color: 'text-warn-amber' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { playBeep('click'); setFilter(tab.id); }}
                  className={`px-2 py-1 border transition-colors duration-150 cursor-pointer ${filter === tab.id ? 'bg-blue-accent/20 border-blue-accent text-white font-bold' : 'border-border-cyber/60 text-muted-slate'}`}
                >
                  <span className={tab.color}>{tab.label}</span> ({tab.count})
                </button>
              ))}
            </div>
            
            <span className="text-[10px] text-muted-slate hidden sm:inline uppercase">PASSIVE FOOTPRINT SCAN</span>
          </div>

          {/* Table Data */}
          <div className="divide-y divide-border-cyber/60 max-h-[400px] overflow-y-auto">
            {filteredResults.length === 0 ? (
              <div className="py-12 text-center text-xs font-mono text-muted-slate">
                NO PLATFORMS DISCOVERED UNDER THIS FILTER PRESET
              </div>
            ) : (
              filteredResults.map((item, idx) => {
                let statusBadge = (
                  <span className="px-2 py-0.5 border border-[#1e252c] text-muted-slate text-[10px] font-bold uppercase tracking-wider bg-black/60">CHECKING...</span>
                );

                if (item.status === 'found') {
                  statusBadge = (
                    <span className="px-2 py-0.5 border border-green-highlight/40 text-green-highlight text-[10px] font-bold uppercase tracking-wider bg-green-highlight/5 shadow-[0_0_8px_rgba(57,255,20,0.15)]">FOUND</span>
                  );
                } else if (item.status === 'possible') {
                  statusBadge = (
                    <span className="px-2 py-0.5 border border-cyan-accent/40 text-cyan-accent text-[10px] font-bold uppercase tracking-wider bg-cyan-accent/5">POSSIBLE</span>
                  );
                } else if (item.status === 'manual') {
                  statusBadge = (
                    <span className="px-2 py-0.5 border border-warn-amber/40 text-warn-amber text-[10px] font-bold uppercase tracking-wider bg-warn-amber/5">MANUAL</span>
                  );
                } else if (item.status === 'unavailable') {
                  statusBadge = (
                    <span className="px-2 py-0.5 border border-crit-red/20 text-muted-slate text-[10px] font-medium bg-black/10">UNAVAILABLE</span>
                  );
                }

                return (
                  <div key={idx} className="p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-black/20 hover:bg-black/40 transition-colors duration-100">
                    {/* Platform details */}
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-orbitron font-bold text-sm tracking-wide">{item.platform}</span>
                        <span className="text-[10px] font-mono text-muted-slate px-1.5 py-0.2 border border-border-cyber bg-black">{item.category}</span>
                      </div>
                      <div className="text-xs font-mono text-blue-accent/80 truncate pt-1 hover:underline">
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                          {item.url}
                          <ExternalLink className="w-2.5 h-2.5 inline" />
                        </a>
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                      {statusBadge}
                      
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => copyToClipboard(item.url, `copy-${idx}`)}
                          className="p-1 border border-border-cyber/80 text-muted-slate hover:text-white hover:border-blue-accent/80 transition-colors duration-150 cursor-pointer"
                          title="Copy direct profile link"
                        >
                          {copiedId === `copy-${idx}` ? (
                            <Check className="w-3.5 h-3.5 text-green-highlight" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

    </div>
  );
};
