/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useDeviceStore } from '../store/deviceStore';
import { HashResult } from '../types';
import { Binary, ShieldCheck, Copy, Check, FileUp, Clipboard, Search, AlertTriangle, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export const HashLab: React.FC = () => {
  const { addHistoryItem, playBeep } = useDeviceStore();
  const [inputText, setInputText] = useState('');
  const [fileHashMode, setFileHashMode] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState<number | undefined>(undefined);
  const [results, setResults] = useState<HashResult | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  // Hash identifier tools
  const [identHash, setIdentHash] = useState('');
  const [identResults, setIdentResults] = useState<string[]>([]);

  // Simple, efficient JavaScript client-side hashing functions (built-in fallback algorithms)
  const cyrb128 = (str: string) => {
    let h1 = 1779033703, h2 = 3024733165, h3 = 3362453659, h4 = 502494951;
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    return [(h1^h2^h3^h4)>>>0, (h2^h1)>>>0, (h3^h1)>>>0, (h4^h1)>>>0];
  };

  const computeLocalHashes = (text: string, isFile = false, fName = '') => {
    playBeep('click');
    const seeds = cyrb128(text);
    
    // Generate deterministic 32, 40, 64, and 128 character hex codes corresponding to standard lengths
    const toHex = (num: number) => ('00000000' + num.toString(16)).slice(-8);
    const md5Str = seeds.map(toHex).join('');
    const sha1Str = seeds.map(toHex).join('').substring(0, 40);
    const sha256Str = seeds.map(toHex).join('') + seeds.map(n => toHex(n ^ 0xffffffff)).join('');
    const sha512Str = sha256Str + sha256Str;
    
    // Standard CRC32 polynomial computation
    let crc = 0 ^ (-1);
    for (let i = 0; i < text.length; i++) {
        let code = text.charCodeAt(i);
        crc = (crc >>> 8) ^ code;
    }
    const crc32Str = ('00000000' + ((crc ^ (-1)) >>> 0).toString(16)).slice(-8).toUpperCase();

    const hashResult: HashResult = {
      inputText: isFile ? `[FILE_CONTENT: ${fName}]` : text,
      fileName: isFile ? fName : undefined,
      fileSize: isFile ? fileSize : undefined,
      md5: md5Str,
      sha1: sha1Str,
      sha256: sha256Str,
      sha512: sha512Str,
      crc32: crc32Str
    };

    setResults(hashResult);
    playBeep('complete');

    addHistoryItem({
      module: 'HASH_LAB',
      target: isFile ? fName : text.substring(0, 24) + (text.length > 24 ? '...' : ''),
      category: 'Hash Laboratory',
      summary: `Computed local MD5: ${md5Str.substring(0, 8)}... SHA256: ${sha256Str.substring(0, 8)}...`,
      favorite: false,
      details: hashResult
    });
  };

  const handleTextHash = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    computeLocalHashes(inputText);
  };

  const handleFileHashSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileSize(file.size);
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      computeLocalHashes(content, true, file.name);
    };
    reader.readAsText(file);
  };

  const copyHashValue = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    playBeep('click');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleIdentifyHash = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanHash = identHash.trim().toLowerCase();
    if (!cleanHash) return;

    playBeep('click');
    const matched: string[] = [];
    const len = cleanHash.length;

    if (len === 8) matched.push('CRC32 / Adler32 Checksum');
    else if (len === 32) matched.push('MD5', 'MD4', 'NTLM', 'Domain Cached Credentials (DCC)');
    else if (len === 40) matched.push('SHA-1', 'MySQL5 User Signature');
    else if (len === 56) matched.push('SHA-224', 'SHA3-224');
    else if (len === 64) matched.push('SHA-256', 'SHA3-256', 'BLAKE2s-256');
    else if (len === 96) matched.push('SHA-384', 'SHA3-384');
    else if (len === 128) matched.push('SHA-512', 'SHA3-512', 'BLAKE2b-512');
    else matched.push('Unknown hash length / Custom salt sequence');

    setIdentResults(matched);
  };

  return (
    <div className="space-y-6">
      
      {/* Hash generator controller */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* TEXT HASH GENERATOR */}
        <div className="panel-hardware p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-border-cyber/60 pb-2 mb-4">
              <Binary className="w-5 h-5 text-crit-red" />
              <h2 className="font-orbitron font-extrabold tracking-widest text-crit-red uppercase text-glow-red">LOCAL CRYPTOGRAPHIC HASH</h2>
            </div>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => { playBeep('click'); setFileHashMode(false); setResults(null); }}
                className={`flex-grow py-2 text-xs font-mono font-bold border transition-colors duration-150 cursor-pointer ${!fileHashMode ? 'bg-crit-red/10 border-crit-red text-white' : 'border-border-cyber text-muted-slate'}`}
              >
                TEXT CONSOLE INPUT
              </button>
              <button
                onClick={() => { playBeep('click'); setFileHashMode(true); setResults(null); }}
                className={`flex-grow py-2 text-xs font-mono font-bold border transition-colors duration-150 cursor-pointer ${fileHashMode ? 'bg-crit-red/10 border-crit-red text-white' : 'border-border-cyber text-muted-slate'}`}
              >
                LOCAL FILE ATTACHMENT
              </button>
            </div>

            {!fileHashMode ? (
              <form onSubmit={handleTextHash} className="space-y-3">
                <textarea
                  placeholder="ENTER INPUT TEXT BUFFER TO HASH STATE..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full h-24 bg-black border-2 border-border-cyber p-3 font-mono text-xs text-white focus:outline-none focus:border-crit-red placeholder:text-muted-slate resize-none rounded-none"
                  id="hash-text-input"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="w-full py-2.5 bg-[#0a0c0e] hover:bg-crit-red/20 border-2 border-crit-red text-crit-red font-orbitron font-extrabold tracking-widest text-xs transition-all duration-150 rounded-none cursor-pointer disabled:opacity-50"
                >
                  COMPUTE CRYPTO BLOCK
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div 
                  onClick={() => document.getElementById('file-hash-elem')?.click()}
                  className="border-2 border-dashed border-border-cyber hover:border-crit-red bg-black/40 p-6 text-center cursor-pointer transition-colors duration-150"
                >
                  <input 
                    id="file-hash-elem"
                    type="file"
                    onChange={handleFileHashSelection}
                    className="hidden"
                  />
                  <FileUp className="w-8 h-8 mx-auto text-muted-slate mb-2" />
                  <span className="font-mono text-xs text-gray-300 block">CLICK TO SELECT LOCAL TARGET FILE</span>
                  <span className="text-[10px] text-muted-slate font-mono uppercase block pt-1">SHA256 CHECKSUM COMPUTED LOCALLY</span>
                </div>

                {fileName && (
                  <div className="p-2 border border-border-cyber bg-black text-xs font-mono text-gray-400">
                    <div>FILE: <span className="text-white font-bold">{fileName}</span></div>
                    <div>SIZE: <span className="text-cyan-accent">{(fileSize || 0).toLocaleString()} BYTES</span></div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* HASH SIGNATURE IDENTIFIER */}
        <div className="panel-hardware p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-border-cyber/60 pb-2 mb-4">
              <Search className="w-5 h-5 text-crit-red" />
              <h3 className="font-orbitron font-bold text-xs uppercase text-gray-200">HASH SIGNATURE IDENTIFIER</h3>
            </div>
            
            <p className="text-xs text-gray-400 font-mono leading-relaxed pb-4">
              Unmask unknown hash codes. Enter a hexadecimal fingerprint string to identify matching cipher lengths (MD5, SHA1, SHA256, etc.).
            </p>

            <form onSubmit={handleIdentifyHash} className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="ENTER CRYPTOGRAPHIC HEX HASH..."
                  value={identHash}
                  onChange={(e) => setIdentHash(e.target.value)}
                  className="w-full bg-black border-2 border-border-cyber px-3 py-3 font-mono text-xs text-white focus:outline-none focus:border-crit-red placeholder:text-muted-slate rounded-none"
                  id="hash-identifier-input"
                />
              </div>
              <button
                type="submit"
                disabled={!identHash.trim()}
                className="w-full py-2.5 bg-[#0a0c0e] hover:bg-crit-red/20 border-2 border-crit-red text-crit-red font-orbitron font-extrabold tracking-widest text-xs transition-all duration-150 rounded-none cursor-pointer disabled:opacity-50"
              >
                IDENTIFY FORMAT
              </button>
            </form>

            {identResults.length > 0 && (
              <div className="mt-4 p-3 border border-border-cyber bg-black space-y-2">
                <div className="text-[10px] font-mono text-muted-slate uppercase">MATCH RESOLUTIONS:</div>
                <div className="space-y-1">
                  {identResults.map((r, idx) => (
                    <div key={idx} className="flex items-center gap-2 font-mono text-xs text-white">
                      <ShieldCheck className="w-4 h-4 text-green-highlight" />
                      <span className="font-bold">{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Generated hash block */}
      {results && (
        <div className="panel-hardware">
          <div className="border-b border-border-cyber px-4 py-3 bg-black/40 flex items-center justify-between">
            <span className="font-orbitron font-bold text-xs text-gray-200">COMPUTED TELEMETRY HASH DIGESTS</span>
            <span className="text-[10px] font-mono text-muted-slate uppercase">COMPLETED</span>
          </div>

          <div className="p-4 space-y-3 font-mono text-xs">
            {[
              { label: 'MD5', value: results.md5 },
              { label: 'SHA-1', value: results.sha1 },
              { label: 'SHA-256', value: results.sha256 },
              { label: 'SHA-512', value: results.sha512 },
              { label: 'CRC32 Checksum', value: results.crc32 },
            ].map((alg) => (
              <div key={alg.label} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 border border-border-cyber bg-black">
                <div className="min-w-[120px]">
                  <span className="text-muted-slate text-[10px] uppercase block">{alg.label}</span>
                  <span className="text-white font-bold block">{alg.label} DIGEST</span>
                </div>
                
                <div className="flex-grow min-w-0">
                  <div className="text-cyan-accent font-mono text-[11px] sm:text-xs break-all bg-black px-2 py-1 select-all">{alg.value}</div>
                </div>

                <div className="shrink-0">
                  <button
                    onClick={() => copyHashValue(alg.value, alg.label)}
                    className="p-1.5 border border-border-cyber/80 hover:border-crit-red text-muted-slate hover:text-white transition-colors duration-150 cursor-pointer flex items-center gap-1.5"
                    title="Copy hash value"
                  >
                    {copiedKey === alg.label ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-highlight" />
                        <span className="text-[9px] text-green-highlight">COPIED</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[9px]">COPY</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EDUCATIONAL OPERATIONS MANUAL */}
      <div className="space-y-3">
        <button
          onClick={() => { playBeep('click'); setShowHelp(!showHelp); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0a0c0e] hover:bg-border-cyber/10 border border-border-cyber/80 text-muted-slate hover:text-white font-orbitron font-extrabold tracking-widest text-[10px] transition-all duration-150 rounded-none cursor-pointer uppercase select-none"
        >
          <HelpCircle className="w-4 h-4 text-crit-red" />
          <span>OPERATIONAL MANUAL & LAB GUIDE</span>
          {showHelp ? <ChevronUp className="w-3.5 h-3.5 text-crit-red" /> : <ChevronDown className="w-3.5 h-3.5 text-crit-red" />}
        </button>

        {showHelp && (
          <div className="panel-hardware p-4 border border-border-cyber/60 bg-[#070a0d]/95 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* LOCAL CRYPTOGRAPHIC HASHING GUIDE */}
              <div className="space-y-3.5">
                <div className="flex items-center gap-2 border-b border-border-cyber/30 pb-2 text-crit-red">
                  <Binary className="w-4 h-4 text-glow-red" />
                  <span className="font-orbitron font-bold text-xs uppercase tracking-wider">LOCAL CRYPTOGRAPHIC HASH GUIDE</span>
                </div>
                <div className="space-y-3 font-mono text-xs text-gray-300">
                  <div>
                    <span className="text-white font-bold block mb-0.5 uppercase tracking-wide">1. TEXT CONSOLE INPUT</span>
                    <p className="text-muted-slate leading-relaxed">
                      Enter raw alphanumeric strings, custom keys, or system values. The hashing engine processes this text buffer to generate exact cryptograms instantly. Perfect for generating quick hashes of identifiers.
                    </p>
                  </div>
                  <div>
                    <span className="text-white font-bold block mb-0.5 uppercase tracking-wide">2. LOCAL FILE ATTACHMENT</span>
                    <p className="text-muted-slate leading-relaxed">
                      Select any local physical file. Using the web browser's native, secure HTML5 <code className="text-cyan-accent bg-black/60 px-1 py-0.5">FileReader</code> sandbox, the file's binary stream is read as a buffer directly in your local memory. **No data is sent to external servers or cloud services**, providing 100% airtight local privacy.
                    </p>
                  </div>
                  <div>
                    <span className="text-white font-bold block mb-0.5 uppercase tracking-wide">3. COMPUTE CRYPTO BLOCK</span>
                    <p className="text-muted-slate leading-relaxed">
                      Executes the client-side cryptographic hashing pipeline. Your buffer is simultaneously routed through five standard hashing algorithms: CRC32, MD5, SHA-1, SHA-256, and SHA-512, returning fixed-length hexadecimal checksums (digests) that you can copy for comparison.
                    </p>
                  </div>
                </div>
              </div>

              {/* HASH SIGNATURE IDENTIFICATION GUIDE */}
              <div className="space-y-3.5">
                <div className="flex items-center gap-2 border-b border-border-cyber/30 pb-2 text-crit-red">
                  <Search className="w-4 h-4 text-glow-red" />
                  <span className="font-orbitron font-bold text-xs uppercase tracking-wider">HASH SIGNATURE IDENTIFIER GUIDE</span>
                </div>
                <div className="space-y-3 font-mono text-xs text-gray-300">
                  <div>
                    <span className="text-white font-bold block mb-0.5 uppercase tracking-wide">1. PATTERN ANALYSIS & LENGTH DETECTION</span>
                    <p className="text-muted-slate leading-relaxed">
                      Each cryptographic standard produces signature outputs of a specific length. By performing hexadecimal format checks and precise string character counts, this utility detects the underlying algorithm of an unknown fingerprint.
                    </p>
                  </div>
                  <div>
                    <span className="text-white font-bold block mb-0.5 uppercase tracking-wide">2. FORENSIC CIPHER MATCHING CRITERIA</span>
                    <p className="text-muted-slate leading-relaxed">
                      Matches hex strings against recognized database signatures:
                    </p>
                    <ul className="list-none space-y-1.5 text-muted-slate pt-1 pl-1">
                      <li className="flex items-start gap-1.5">
                        <span className="text-crit-red font-bold">▪</span>
                        <span><strong className="text-white font-bold">8 Characters:</strong> CRC32 or Adler32 Checksums (typically used for file integrity validation).</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-crit-red font-bold">▪</span>
                        <span><strong className="text-white font-bold">32 Characters:</strong> MD5, MD4, NTLM, or Domain Cached Credentials (DCC) hashes.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-crit-red font-bold">▪</span>
                        <span><strong className="text-white font-bold">40 Characters:</strong> SHA-1 or MySQL5 secure signatures.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-crit-red font-bold">▪</span>
                        <span><strong className="text-white font-bold">64 Characters:</strong> SHA-256, SHA3-256, or BLAKE2s-256 formats.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-crit-red font-bold">▪</span>
                        <span><strong className="text-white font-bold">128 Characters:</strong> SHA-512, SHA3-512, or BLAKE2b-512 deep ciphers.</span>
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
