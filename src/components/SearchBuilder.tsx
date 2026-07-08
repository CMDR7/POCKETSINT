/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useDeviceStore } from '../store/deviceStore';
import { Search, Copy, Check, ExternalLink, RefreshCw, FolderOpen, ShieldCheck, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface DorkPreset {
  category: string;
  label: string;
  query: string;
  description: string;
}

const DORK_PRESETS: DorkPreset[] = [
  {
    category: 'Sensitive Files',
    label: 'Exposed SQL Databases & Backups',
    query: 'filetype:sql "MySQL dump" OR "pg_dump" OR "backup.sql"',
    description: 'Finds exposed SQL backup configurations and database dumps.'
  },
  {
    category: 'Sensitive Files',
    label: 'Exposed Config Files & Secrets',
    query: 'filetype:env OR filetype:yaml "DB_PASSWORD" OR "JWT_SECRET"',
    description: 'Searches for configurations with sensitive credentials.'
  },
  {
    category: 'Index Directories',
    label: 'Open Directory File Indexes',
    query: 'intitle:"index of" "parent directory" "backup" OR "dump"',
    description: 'Uncovers index directories with parent file listings.'
  },
  {
    category: 'Documents Recon',
    label: 'Public Financial & Invoice Docs',
    query: 'filetype:pdf "invoice" OR "billing statement" "confidential"',
    description: 'Discovers public billing files, invoices, or budgets.'
  },
  {
    category: 'Surveillance / IoT',
    label: 'Live Exposed IP Webcam Feeds',
    query: 'inurl:"/view/index.shtml" OR inurl:"/view/view.shtml"',
    description: 'Finds unprotected network webcam visual feeds.'
  },
  {
    category: 'Public Servers',
    label: 'Exposed FTP / Storage Listings',
    query: 'site:ftp.*.com "index of /"',
    description: 'Lists exposed corporate subdomains on FTP servers.'
  }
];

export const SearchBuilder: React.FC = () => {
  const { addHistoryItem, playBeep } = useDeviceStore();
  const [copied, setCopied] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  
  // Custom builder fields
  const [site, setSite] = useState('');
  const [intitle, setIntitle] = useState('');
  const [inurl, setInurl] = useState('');
  const [filetype, setFiletype] = useState('');
  const [searchTerms, setSearchTerms] = useState('');
  const [filePhrase, setFilePhrase] = useState('');

  const [finalQuery, setFinalQuery] = useState('');

  const generateCustomQuery = (e: React.FormEvent) => {
    e.preventDefault();
    playBeep('click');

    const parts: string[] = [];
    if (searchTerms.trim()) parts.push(searchTerms.trim());
    if (filePhrase.trim()) parts.push(`"${filePhrase.trim()}"`);
    if (site.trim()) parts.push(`site:${site.trim()}`);
    if (intitle.trim()) parts.push(`intitle:"${intitle.trim()}"`);
    if (inurl.trim()) parts.push(`inurl:"${inurl.trim()}"`);
    if (filetype.trim()) parts.push(`filetype:${filetype.trim()}`);

    const q = parts.join(' ');
    setFinalQuery(q);

    if (q) {
      addHistoryItem({
        module: 'SEARCH_BUILDER',
        target: q.substring(0, 32) + (q.length > 32 ? '...' : ''),
        category: 'Advanced Dork',
        summary: `Assembled advanced search query operators: ${q}`,
        favorite: false,
        details: { query: q }
      });
    }
  };

  const loadPreset = (preset: DorkPreset) => {
    playBeep('click');
    setFinalQuery(preset.query);

    // Populate helper inputs to resemble active editing
    setSearchTerms('');
    setFilePhrase('');
    setSite('');
    setIntitle('');
    setInurl('');
    setFiletype('');

    addHistoryItem({
      module: 'SEARCH_BUILDER',
      target: preset.label,
      category: 'Dork Preset',
      summary: `Loaded preset: ${preset.label}`,
      favorite: false,
      details: { query: preset.query }
    });
  };

  const copyQuery = () => {
    if (!finalQuery) return;
    navigator.clipboard.writeText(finalQuery);
    setCopied(true);
    playBeep('click');
    setTimeout(() => setCopied(false), 2000);
  };

  const triggerGoogleSearch = () => {
    if (!finalQuery) return;
    playBeep('click');
    const url = `https://www.google.com/search?q=${encodeURIComponent(finalQuery)}`;
    window.open(url, '_blank', 'noreferrer');
  };

  return (
    <div className="space-y-6">
      
      {/* Visual query builder deck */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Advanced Input fields form */}
        <form onSubmit={generateCustomQuery} className="lg:col-span-2 panel-hardware p-4 space-y-3">
          <div className="flex items-center gap-2 border-b border-border-cyber/60 pb-2 mb-4">
            <Search className="w-5 h-5 text-cyan-accent" />
            <h2 className="font-orbitron font-extrabold tracking-widest text-cyan-accent uppercase text-glow-cyan">ADVANCED SEARCH OPERATORS BUILDER</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            
            <div className="space-y-1">
              <label className="text-muted-slate font-bold uppercase">Search terms (AND):</label>
              <input
                type="text"
                placeholder="e.g. corporate login audit"
                value={searchTerms}
                onChange={(e) => setSearchTerms(e.target.value)}
                className="w-full bg-black border border-border-cyber px-2.5 py-2 text-white focus:outline-none focus:border-cyan-accent placeholder:text-muted-slate/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-muted-slate font-bold uppercase">Quoted EXACT phrase:</label>
              <input
                type="text"
                placeholder="e.g. index of /"
                value={filePhrase}
                onChange={(e) => setFilePhrase(e.target.value)}
                className="w-full bg-black border border-border-cyber px-2.5 py-2 text-white focus:outline-none focus:border-cyan-accent placeholder:text-muted-slate/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-muted-slate font-bold uppercase">Target Site/Domain (site:):</label>
              <input
                type="text"
                placeholder="e.g. gov, .mil, target.com"
                value={site}
                onChange={(e) => setSite(e.target.value)}
                className="w-full bg-black border border-border-cyber px-2.5 py-2 text-white focus:outline-none focus:border-cyan-accent placeholder:text-muted-slate/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-muted-slate font-bold uppercase">Title keyword (intitle:):</label>
              <input
                type="text"
                placeholder="e.g. dashboard, confidential"
                value={intitle}
                onChange={(e) => setIntitle(e.target.value)}
                className="w-full bg-black border border-border-cyber px-2.5 py-2 text-white focus:outline-none focus:border-cyan-accent placeholder:text-muted-slate/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-muted-slate font-bold uppercase">URL Keyword (inurl:):</label>
              <input
                type="text"
                placeholder="e.g. admin, wp-content"
                value={inurl}
                onChange={(e) => setInurl(e.target.value)}
                className="w-full bg-black border border-border-cyber px-2.5 py-2 text-white focus:outline-none focus:border-cyan-accent placeholder:text-muted-slate/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-muted-slate font-bold uppercase">File Type (filetype:):</label>
              <input
                type="text"
                placeholder="e.g. xlsx, pdf, log, conf"
                value={filetype}
                onChange={(e) => setFiletype(e.target.value)}
                className="w-full bg-black border border-border-cyber px-2.5 py-2 text-white focus:outline-none focus:border-cyan-accent placeholder:text-muted-slate/50"
              />
            </div>

          </div>

          <button
            type="submit"
            className="w-full mt-4 py-2.5 bg-[#0a0c0e] hover:bg-cyan-accent/20 border-2 border-cyan-accent text-cyan-accent font-orbitron font-extrabold tracking-widest text-xs transition-all duration-150 rounded-none cursor-pointer"
          >
            ASSEMBLE OPERATOR CODE
          </button>
        </form>

        {/* Quick Presets Catalog */}
        <div className="panel-hardware p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-border-cyber/60 pb-2 mb-4">
              <FolderOpen className="w-5 h-5 text-cyan-accent" />
              <h3 className="font-orbitron font-bold text-xs uppercase text-gray-200">DORKING TARGET TEMPLATES</h3>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[220px] pr-1">
              {DORK_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => loadPreset(p)}
                  className="w-full text-left p-2 border border-border-cyber/60 hover:border-cyan-accent bg-black/40 hover:bg-cyan-accent/5 transition-all duration-150 cursor-pointer"
                >
                  <div className="flex justify-between items-center text-[10px] font-mono text-muted-slate">
                    <span>{p.category}</span>
                    <span className="text-cyan-accent">LOAD PRESET</span>
                  </div>
                  <div className="text-xs font-bold text-white pt-0.5 truncate">{p.label}</div>
                  <div className="text-[10px] text-gray-400 line-clamp-1">{p.description}</div>
                </button>
              ))}
            </div>
          </div>
          
          <div className="text-[10px] text-muted-slate font-mono uppercase text-center pt-3 border-t border-border-cyber/40 mt-4">
            ADVANCED GOOGLE SEARCH OPERATORS BUILDER
          </div>
        </div>

      </div>

      {/* Assembly output console */}
      {finalQuery && (
        <div className="panel-hardware">
          <div className="border-b border-border-cyber px-4 py-3 bg-black/40 flex items-center justify-between">
            <span className="font-orbitron font-bold text-xs text-gray-200">ASSEMBLED GOOGLE SEARCH OPERATORS CODE</span>
            <span className="text-[10px] font-mono text-muted-slate uppercase">GENERATION_SUCCESS</span>
          </div>

          <div className="p-4 space-y-4">
            <div className="border border-border-cyber bg-black p-3 font-mono text-sm text-green-highlight break-all">
              {finalQuery}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={copyQuery}
                className="flex-grow py-2.5 border-2 border-cyan-accent bg-[#0a0c0e] hover:bg-cyan-accent/25 text-cyan-accent font-orbitron font-extrabold tracking-widest text-xs transition-all duration-150 rounded-none cursor-pointer flex items-center justify-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-highlight" />
                    <span>COPIED TO CLIPBOARD</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>COPY DORK CODE</span>
                  </>
                )}
              </button>

              <button
                onClick={triggerGoogleSearch}
                className="flex-grow py-2.5 border-2 border-green-highlight bg-[#0a0c0e] hover:bg-green-highlight/25 text-green-highlight font-orbitron font-extrabold tracking-widest text-xs transition-all duration-150 rounded-none cursor-pointer flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>EXECUTE SEARCH</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDUCATIONAL OPERATIONS MANUAL */}
      <div className="space-y-3">
        <button
          onClick={() => { playBeep('click'); setShowHelp(!showHelp); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0a0c0e] hover:bg-border-cyber/10 border border-border-cyber/80 text-muted-slate hover:text-white font-orbitron font-extrabold tracking-widest text-[10px] transition-all duration-150 rounded-none cursor-pointer uppercase select-none"
        >
          <HelpCircle className="w-4 h-4 text-cyan-accent" />
          <span>OPERATIONAL MANUAL & LAB GUIDE</span>
          {showHelp ? <ChevronUp className="w-3.5 h-3.5 text-cyan-accent" /> : <ChevronDown className="w-3.5 h-3.5 text-cyan-accent" />}
        </button>

        {showHelp && (
          <div className="panel-hardware p-4 border border-border-cyber/60 bg-[#070a0d]/95 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* ADVANCED GOOGLE OPERATORS GUIDE */}
              <div className="space-y-3.5">
                <div className="flex items-center gap-2 border-b border-border-cyber/30 pb-2 text-cyan-accent">
                  <Search className="w-4 h-4 text-glow-cyan" />
                  <span className="font-orbitron font-bold text-xs uppercase tracking-wider">ADVANCED OPERATORS EXPLAINED</span>
                </div>
                <div className="space-y-3 font-mono text-xs text-gray-300">
                  <div>
                    <span className="text-white font-bold block mb-0.5 uppercase tracking-wide">1. SEARCH TERMS (AND)</span>
                    <p className="text-muted-slate leading-relaxed">
                      Standard text queries. Combines words dynamically (e.g. <code className="text-cyan-accent bg-black/60 px-1">corporate login</code>) so Google only retrieves index records containing all target keywords.
                    </p>
                  </div>
                  <div>
                    <span className="text-white font-bold block mb-0.5 uppercase tracking-wide">2. QUOTED EXACT PHRASE</span>
                    <p className="text-muted-slate leading-relaxed">
                      Wraps the string in strict double quotes (e.g. <code className="text-cyan-accent bg-black/60 px-1">"index of /"</code>). This overrides Google's fuzzy spelling algorithms to require a 100% exact character sequence match.
                    </p>
                  </div>
                  <div>
                    <span className="text-white font-bold block mb-0.5 uppercase tracking-wide">3. TARGET SITE/DOMAIN (<code className="text-cyan-accent font-bold">site:</code>)</span>
                    <p className="text-muted-slate leading-relaxed">
                      Restricts search results to a specific domain level, TLD, or subdomain structure (e.g. <code className="text-cyan-accent bg-black/60 px-1">site:gov</code> or <code className="text-cyan-accent bg-black/60 px-1">site:mil</code>), isolating target networks.
                    </p>
                  </div>
                  <div>
                    <span className="text-white font-bold block mb-0.5 uppercase tracking-wide">4. TITLE KEYWORD (<code className="text-cyan-accent font-bold">intitle:</code>)</span>
                    <p className="text-muted-slate leading-relaxed">
                      Scans the HTML page header titles specifically for the provided keyword (e.g. <code className="text-cyan-accent bg-black/60 px-1">intitle:"dashboard"</code> or <code className="text-cyan-accent bg-black/60 px-1">intitle:"confidential"</code>), targeting exposed administrator nodes.
                    </p>
                  </div>
                  <div>
                    <span className="text-white font-bold block mb-0.5 uppercase tracking-wide">5. URL KEYWORD (<code className="text-cyan-accent font-bold">inurl:</code>)</span>
                    <p className="text-muted-slate leading-relaxed">
                      Inspects the address path itself. Identifies directories, files, or parameters embedded within the URL (e.g. <code className="text-cyan-accent bg-black/60 px-1">inurl:wp-content</code> or <code className="text-cyan-accent bg-black/60 px-1">inurl:admin</code>).
                    </p>
                  </div>
                  <div>
                    <span className="text-white font-bold block mb-0.5 uppercase tracking-wide">6. FILE TYPE (<code className="text-cyan-accent font-bold">filetype:</code>)</span>
                    <p className="text-muted-slate leading-relaxed">
                      Filters specifically by file extension (e.g. <code className="text-cyan-accent bg-black/60 px-1">filetype:log</code>, <code className="text-cyan-accent bg-black/60 px-1">filetype:env</code>, <code className="text-cyan-accent bg-black/60 px-1">filetype:xlsx</code>), identifying raw configurations, backups, or private document caches.
                    </p>
                  </div>
                </div>
              </div>

              {/* DORKING TEMPLATES & ACTIONS GUIDE */}
              <div className="space-y-3.5">
                <div className="flex items-center gap-2 border-b border-border-cyber/30 pb-2 text-cyan-accent">
                  <FolderOpen className="w-4 h-4 text-glow-cyan" />
                  <span className="font-orbitron font-bold text-xs uppercase tracking-wider">TEMPLATES & CORE ACTIONS</span>
                </div>
                <div className="space-y-3 font-mono text-xs text-gray-300">
                  <div>
                    <span className="text-white font-bold block mb-0.5 uppercase tracking-wide">1. DORKING TARGET TEMPLATES</span>
                    <p className="text-muted-slate leading-relaxed">
                      A curated catalog of tactical presets developed to demonstrate standard OSINT reconnaissance methodologies:
                    </p>
                    <ul className="list-none space-y-1.5 text-muted-slate pt-1 pl-1">
                      <li className="flex items-start gap-1.5">
                        <span className="text-cyan-accent font-bold">▪</span>
                        <span><strong className="text-white font-bold">Sensitive Files:</strong> Targets exposed SQL databases and environmental variables (<code className="text-cyan-accent bg-black/60 px-1">.env</code>).</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-cyan-accent font-bold">▪</span>
                        <span><strong className="text-white font-bold">Index Directories:</strong> Identifies unindexed folder paths (<code className="text-cyan-accent bg-black/60 px-1">"index of"</code>) revealing backend server directories.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-cyan-accent font-bold">▪</span>
                        <span><strong className="text-white font-bold">Documents Recon:</strong> Targets leaked financial PDFs, billing statements, and confidential archives.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-cyan-accent font-bold">▪</span>
                        <span><strong className="text-white font-bold">Surveillance & IoT:</strong> Scans for unsecured camera streams (<code className="text-cyan-accent bg-black/60 px-1">view.shtml</code>) or FTP logs.</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <span className="text-white font-bold block mb-0.5 uppercase tracking-wide">2. CORE UTILITY ACTIONS</span>
                    <p className="text-muted-slate leading-relaxed">
                      Once a dork query has been assembled via custom parameters or presets, two critical operations become available:
                    </p>
                    <ul className="list-none space-y-1 text-muted-slate pt-1 pl-1">
                      <li className="flex items-start gap-1.5">
                        <span className="text-green-highlight font-bold">▪</span>
                        <span><strong className="text-white font-bold">Copy Dork Code:</strong> Saves the exact string with operators to clipboard.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-green-highlight font-bold">▪</span>
                        <span><strong className="text-white font-bold">Execute Search:</strong> Launches a live Google search query in a new window with parameters active, facilitating real-world reconnaissance.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

    </div>
  );
};
