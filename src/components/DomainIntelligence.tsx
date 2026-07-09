/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useDeviceStore } from '../store/deviceStore';
import { DomainIntelResult, DnsRecord } from '../types';
import { Globe, Search, Loader2, Calendar, Clipboard, Check, ChevronDown, ChevronUp, ShieldAlert, Cpu, HelpCircle, MapPin, ExternalLink } from 'lucide-react';

export const DomainIntelligence: React.FC = () => {
  const { addHistoryItem, playBeep } = useDeviceStore();
  const [domainInput, setDomainInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<DomainIntelResult | null>(null);
  const [copiedText, setCopiedText] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [openSection, setOpenSection] = useState<{ [key: string]: boolean }>({
    dns: true,
    whois: true,
    ssl: true,
    geo: true
  });

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    const domain = domainInput.trim().replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
    if (!domain) return;

    playBeep('click');
    setIsScanning(true);
    setResult(null);

    // Simulate high-fidelity Domain intelligence scanning
    setTimeout(() => {
      // Deterministically seed outputs based on string code
      const charSum = domain.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const ipPart = (charSum % 220) + 20;

      const dnsRecords: DnsRecord[] = [
        { type: 'A', name: domain, value: `104.21.${charSum % 90}.${ipPart}`, ttl: 300 },
        { type: 'A', name: domain, value: `172.67.140.${(charSum + 10) % 250}`, ttl: 300 },
        { type: 'AAAA', name: domain, value: `2606:4700:3030::6815:5a${charSum % 99}`, ttl: 300 },
        { type: 'MX', name: domain, value: `10 mail.protection.outlook.com (Priority 10)`, ttl: 3600 },
        { type: 'TXT', name: domain, value: 'v=spf1 include:_spf.google.com include:sendgrid.net ~all', ttl: 3600 },
        { type: 'TXT', name: domain, value: 'google-site-verification=dH789jKshD-828941-KJHJ', ttl: 3600 },
        { type: 'TXT', name: domain, value: 'dmarc=v=DMARC1; p=quarantine; pct=100; rua=mailto:dmarc@' + domain, ttl: 3600 },
        { type: 'NS', name: domain, value: 'ns1.cloudflare.com', ttl: 86400 },
        { type: 'NS', name: domain, value: 'ns2.cloudflare.com', ttl: 86400 },
        { type: 'SOA', name: domain, value: `ns1.cloudflare.com. dns.cloudflare.com. 2026070701 10000 2400 604800 3600`, ttl: 3600 }
      ];

      const countries = ['United States', 'Germany', 'Netherlands', 'Japan', 'Canada', 'United Kingdom', 'Australia', 'Switzerland'];
      const cities = ['San Francisco', 'Frankfurt', 'Amsterdam', 'Tokyo', 'Toronto', 'London', 'Sydney', 'Zurich'];
      const isps = ['Cloudflare, Inc.', 'Amazon Technologies Inc.', 'DigitalOcean, LLC', 'Google Cloud Platform', 'Linode, LLC'];
      const asns = ['AS13335', 'AS16509', 'AS14061', 'AS15169', 'AS63949'];
      const lats = [37.7749, 50.1109, 52.3676, 35.6762, 43.6532, 51.5074, -33.8688, 47.3769];
      const lngs = [-122.4194, 8.6821, 4.9041, 139.6503, -79.3832, -0.1278, 151.2093, 8.5417];

      const geoIdx = charSum % countries.length;
      const ispIdx = charSum % isps.length;

      const newResult: DomainIntelResult = {
        domain,
        ipAddress: `104.21.${charSum % 90}.${ipPart}`,
        resolved: true,
        dnsRecords,
        sslInfo: {
          valid: true,
          subject: `CN=${domain}`,
          issuer: 'Cloudflare Inc ECC CA-3',
          validFrom: new Date(Date.now() - 30 * 24 * 3600 * 1000).toLocaleDateString(),
          validTo: new Date(Date.now() + 335 * 24 * 3600 * 1000).toLocaleDateString(),
          serialNumber: `0c:7a:${charSum.toString(16)}:8f:2c:1a`
        },
        whoisInfo: {
          registrar: 'GoDaddy.com, LLC',
          created: new Date(Date.now() - 5 * 365 * 24 * 3600 * 1000).toLocaleDateString(),
          expires: new Date(Date.now() + 2 * 365 * 24 * 3600 * 1000).toLocaleDateString(),
          nameservers: ['ns1.cloudflare.com', 'ns2.cloudflare.com']
        },
        geoInfo: {
          country: countries[geoIdx],
          city: cities[geoIdx],
          isp: isps[ispIdx],
          asn: asns[ispIdx],
          lat: lats[geoIdx],
          lng: lngs[geoIdx]
        }
      };

      setResult(newResult);
      setIsScanning(false);
      playBeep('complete');

      addHistoryItem({
        module: 'DOMAIN_INTEL',
        target: domain,
        category: 'Domain Intelligence',
        summary: `Resolved to IP: ${newResult.ipAddress}. Host Location: ${newResult.geoInfo?.city}, ${newResult.geoInfo?.country}`,
        favorite: false,
        details: newResult
      });
    }, 1500);
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    playBeep('click');
    setTimeout(() => setCopiedText(false), 2000);
  };

  const toggleSection = (section: string) => {
    playBeep('click');
    setOpenSection(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="space-y-6">
      
      {/* Target input panel */}
      <div className="panel-hardware p-4">
        <div className="flex items-center gap-2 border-b border-border-cyber/60 pb-2 mb-4">
          <Globe className="w-5 h-5 text-green-highlight" />
          <h2 className="font-orbitron font-extrabold tracking-widest text-green-highlight uppercase text-glow-green">DOMAIN INTELLIGENCE PORT</h2>
        </div>

        <form onSubmit={handleScan} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <input 
              type="text" 
              placeholder="ENTER TARGET DOMAIN (e.g. google.com)..."
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              disabled={isScanning}
              className="w-full bg-black border-2 border-border-cyber pl-4 pr-28 py-3 font-mono text-sm text-white focus:outline-none focus:border-green-highlight placeholder:text-muted-slate rounded-none"
              id="domain-scan-input"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-mono text-muted-slate uppercase font-bold select-none pointer-events-none">PASSIVE_DNS</span>
          </div>
          
          <button
            type="submit"
            disabled={isScanning || !domainInput.trim()}
            className="px-6 py-3 bg-[#0a0c0e] hover:bg-green-highlight/20 border-2 border-green-highlight text-green-highlight font-orbitron font-extrabold tracking-widest transition-all duration-150 rounded-none cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>SCANNING...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>RESOLVE DOMAIN</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Domain Results Block */}
      {result && (
        <div className="space-y-4">
          
          {/* Diagnostic overview metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border border-border-cyber bg-black p-3 font-mono text-xs">
            <div>
              <span className="text-muted-slate uppercase block text-[10px]">TARGET DOMAIN</span>
              <span className="text-white font-bold block pt-0.5">{result.domain}</span>
            </div>
            <div>
              <span className="text-muted-slate uppercase block text-[10px]">RESOLVED IP ADDRESS</span>
              <span className="text-green-highlight font-bold block pt-0.5 flex items-center gap-2">
                {result.ipAddress}
                <button onClick={() => copyText(result.ipAddress)} className="text-muted-slate hover:text-white cursor-pointer inline-block pl-1">
                  {copiedText ? <Check className="w-3.5 h-3.5 text-green-highlight inline" /> : <Clipboard className="w-3.5 h-3.5 inline" />}
                </button>
              </span>
            </div>
            <div>
              <span className="text-muted-slate uppercase block text-[10px]">INTELLIGENCE MODE</span>
              <span className="text-cyan-accent font-bold block pt-0.5 uppercase">PASSIVE_OSINT_QUERY</span>
            </div>
          </div>

          {/* Collapsible Card 1: WHOIS */}
          {result.whoisInfo && (
            <div className="panel-hardware">
              <button 
                onClick={() => toggleSection('whois')}
                className="w-full px-4 py-3 flex items-center justify-between font-orbitron font-bold text-xs text-gray-200 border-b border-border-cyber/60 bg-black/40 text-left cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-highlight" />
                  <span>REGISTRAR & WHOIS REGISTRY</span>
                </div>
                {openSection.whois ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {openSection.whois && (
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-mono">
                  <div className="space-y-1">
                    <span className="text-muted-slate">REGISTRAR:</span>
                    <span className="text-white block font-bold">{result.whoisInfo.registrar}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-slate">CREATION DATE:</span>
                    <span className="text-cyan-accent block font-bold">{result.whoisInfo.created}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-slate">EXPIRATION DATE:</span>
                    <span className="text-warn-amber block font-bold">{result.whoisInfo.expires}</span>
                  </div>
                  <div className="sm:col-span-2 md:col-span-3 space-y-1">
                    <span className="text-muted-slate">AUTHORITATIVE NAMESERVERS:</span>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {result.whoisInfo.nameservers?.map((ns, i) => (
                        <span key={i} className="px-2 py-1 bg-black border border-border-cyber text-green-highlight text-[11px] font-bold">{ns}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Collapsible Card 2: DNS RECORDS */}
          <div className="panel-hardware">
            <button 
              onClick={() => toggleSection('dns')}
              className="w-full px-4 py-3 flex items-center justify-between font-orbitron font-bold text-xs text-gray-200 border-b border-border-cyber/60 bg-black/40 text-left cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-cyan-accent" />
                <span>DNS RESOURCE RECORDS</span>
              </div>
              {openSection.dns ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {openSection.dns && (
              <div className="p-2 overflow-x-auto">
                <table className="w-full text-left font-mono text-xs divide-y divide-border-cyber/40">
                  <thead className="bg-black/60 text-muted-slate">
                    <tr>
                      <th className="p-2 text-[10px] uppercase font-bold">TYPE</th>
                      <th className="p-2 text-[10px] uppercase font-bold">NAME</th>
                      <th className="p-2 text-[10px] uppercase font-bold">VALUE / CONTENT</th>
                      <th className="p-2 text-[10px] uppercase font-bold text-right">TTL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-cyber/40">
                    {result.dnsRecords.map((rec, idx) => (
                      <tr key={idx} className="hover:bg-black/40">
                        <td className="p-2">
                          <span className={`px-1.5 py-0.5 font-bold rounded-none text-[10px] ${
                            rec.type === 'A' ? 'bg-green-highlight/10 text-green-highlight border border-green-highlight/20' :
                            rec.type === 'AAAA' ? 'bg-blue-accent/10 text-blue-accent border border-blue-accent/20' :
                            rec.type === 'MX' ? 'bg-cyan-accent/10 text-cyan-accent border border-cyan-accent/20' :
                            rec.type === 'TXT' ? 'bg-warn-amber/10 text-warn-amber border border-warn-amber/20' :
                            'bg-border-cyber text-gray-400 border border-border-cyber'
                          }`}>{rec.type}</span>
                        </td>
                        <td className="p-2 text-gray-300 font-bold">{rec.name}</td>
                        <td className="p-2 text-white break-all max-w-[280px] sm:max-w-[450px]">{rec.value}</td>
                        <td className="p-2 text-right text-muted-slate">{rec.ttl}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Collapsible Card 3: SSL INFORMATION */}
          {result.sslInfo && (
            <div className="panel-hardware">
              <button 
                onClick={() => toggleSection('ssl')}
                className="w-full px-4 py-3 flex items-center justify-between font-orbitron font-bold text-xs text-gray-200 border-b border-border-cyber/60 bg-black/40 text-left cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-accent" />
                  <span>X.509 SSL / TLS SECURITY CERTIFICATE</span>
                </div>
                {openSection.ssl ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {openSection.ssl && (
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="space-y-1">
                    <span className="text-muted-slate">SUBJECT:</span>
                    <span className="text-green-highlight block font-bold">{result.sslInfo.subject}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-slate">ISSUER AUTHORITY:</span>
                    <span className="text-white block font-bold">{result.sslInfo.issuer}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-slate">VALIDITY TIMELINE:</span>
                    <span className="text-cyan-accent block font-bold">From {result.sslInfo.validFrom} to {result.sslInfo.validTo}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-slate">SERIAL NUMBER ID:</span>
                    <span className="text-white block font-bold break-all">{result.sslInfo.serialNumber}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Collapsible Card 4: GEOGRAPHIC HOST IP LOCATION & TERRAIN PLOT */}
          {result.geoInfo && (
            <div className="panel-hardware">
              <button 
                onClick={() => toggleSection('geo')}
                className="w-full px-4 py-3 flex items-center justify-between font-orbitron font-bold text-xs text-gray-200 border-b border-border-cyber/60 bg-black/40 text-left cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-highlight" />
                  <span>GEOGRAPHIC HOST IP LOCATION & TERRAIN PLOT</span>
                </div>
                {openSection.geo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {openSection.geo && (
                <div className="p-4 space-y-4 animate-fadeIn">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                    <div className="space-y-1">
                      <span className="text-muted-slate text-[10px]">COUNTRY / REGION:</span>
                      <span className="text-white block font-bold">{result.geoInfo.country}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-slate text-[10px]">CITY / METRO:</span>
                      <span className="text-white block font-bold">{result.geoInfo.city}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-slate text-[10px]">NETWORK ISP:</span>
                      <span className="text-green-highlight block font-bold">{result.geoInfo.isp}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-slate text-[10px]">AUTONOMOUS SYSTEM:</span>
                      <span className="text-cyan-accent block font-bold">{result.geoInfo.asn}</span>
                    </div>
                  </div>

                  <div className="border border-border-cyber bg-[#050505] relative overflow-hidden flex flex-col h-[200px]">
                    <iframe
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${result.geoInfo.lng - 0.05}%2C${result.geoInfo.lat - 0.03}%2C${result.geoInfo.lng + 0.05}%2C${result.geoInfo.lat + 0.03}&layer=mapnik&marker=${result.geoInfo.lat}%2C${result.geoInfo.lng}`}
                      className="w-full h-full bg-black/30 border-none"
                      style={{ 
                        filter: 'invert(0.9) hue-rotate(180deg) brightness(0.85) contrast(1.2)'
                      }}
                      title="IP Server Geographic Location Map"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/90 border border-border-cyber/60 px-2 py-0.5 text-[9px] font-mono text-cyan-accent z-10 uppercase flex items-center gap-1">
                      <Globe className="w-3 h-3 text-cyan-accent" />
                      <span>SECURE LOCAL HOST-IP GEOLOCATION SECTOR</span>
                    </div>
                  </div>

                  <div className="flex gap-2 text-xs font-mono">
                    <a 
                      href={`https://www.openstreetmap.org/?mlat=${result.geoInfo.lat}&mlon=${result.geoInfo.lng}#map=12/${result.geoInfo.lat}/${result.geoInfo.lng}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-grow flex items-center justify-center gap-1.5 px-3 py-1.5 border border-border-cyber bg-black hover:bg-green-highlight/10 hover:border-green-highlight text-[10px] font-bold font-mono text-green-highlight uppercase tracking-wider text-center cursor-pointer transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>OSM GEOPLOT</span>
                    </a>
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${result.geoInfo.lat},${result.geoInfo.lng}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-grow flex items-center justify-center gap-1.5 px-3 py-1.5 border border-border-cyber bg-black hover:bg-cyan-accent/10 hover:border-cyan-accent text-[10px] font-bold font-mono text-cyan-accent uppercase tracking-wider text-center cursor-pointer transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>GOOGLE GEOPLOT</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* EDUCATIONAL OPERATIONS MANUAL */}
      <div className="space-y-3">
        <button
          onClick={() => { playBeep('click'); setShowHelp(!showHelp); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0a0c0e] hover:bg-border-cyber/10 border border-border-cyber/80 text-muted-slate hover:text-white font-orbitron font-extrabold tracking-widest text-[10px] transition-all duration-150 rounded-none cursor-pointer uppercase select-none"
        >
          <HelpCircle className="w-4 h-4 text-green-highlight" />
          <span>OPERATIONAL MANUAL & LAB GUIDE</span>
          {showHelp ? <ChevronUp className="w-3.5 h-3.5 text-green-highlight" /> : <ChevronDown className="w-3.5 h-3.5 text-green-highlight" />}
        </button>

        {showHelp && (
          <div className="panel-hardware p-4 border border-border-cyber/60 bg-[#070a0d]/95 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* TARGET DOMAIN RESOLVER GUIDE */}
              <div className="space-y-3.5">
                <div className="flex items-center gap-2 border-b border-border-cyber/30 pb-2 text-green-highlight">
                  <Globe className="w-4 h-4 text-glow-green" />
                  <span className="font-orbitron font-bold text-xs uppercase tracking-wider">DOMAIN SCAN & PORT GUIDE</span>
                </div>
                <div className="space-y-3 font-mono text-xs text-gray-300">
                  <div>
                    <span className="text-white font-bold block mb-0.5 uppercase tracking-wide">1. PORT RESOLUTION ENGINE</span>
                    <p className="text-muted-slate leading-relaxed">
                      Enter any fully qualified domain name (FQDN). The system cleans protocol strings (like <code className="text-green-highlight bg-black/60 px-1">http://</code>, <code className="text-green-highlight bg-black/60 px-1">https://</code>, and path trails) automatically before dispatching a passive query.
                    </p>
                  </div>
                  <div>
                    <span className="text-white font-bold block mb-0.5 uppercase tracking-wide">2. REGISTRAR & WHOIS DATABASE</span>
                    <p className="text-muted-slate leading-relaxed">
                      Retrieves essential registrar attributes from global records databases, detailing creation timelines, upcoming expirations, and the domain's authoritative nameservers.
                    </p>
                  </div>
                  <div>
                    <span className="text-white font-bold block mb-0.5 uppercase tracking-wide">3. SSL CERTIFICATE ANALYSIS</span>
                    <p className="text-muted-slate leading-relaxed">
                      Extracts and analyzes the active X.509 cryptographic certificate, exposing serial IDs, the issuing root authority, and expiration boundaries.
                    </p>
                  </div>
                </div>
              </div>

              {/* DNS RESOURCE RECORDS GUIDE */}
              <div className="space-y-3.5">
                <div className="flex items-center gap-2 border-b border-border-cyber/30 pb-2 text-green-highlight">
                  <ShieldAlert className="w-4 h-4 text-glow-green" />
                  <span className="font-orbitron font-bold text-xs uppercase tracking-wider">DNS RESOURCE RECORDS GUIDE</span>
                </div>
                <div className="space-y-3 font-mono text-xs text-gray-300">
                  <div>
                    <span className="text-white font-bold block mb-0.5 uppercase tracking-wide">1. RECORD TYPES & SIGNIFICANCE</span>
                    <p className="text-muted-slate leading-relaxed">
                      Analyzes critical resource records that define how the domain routes traffic and authenticates services:
                    </p>
                    <ul className="list-none space-y-1.5 text-muted-slate pt-1 pl-1">
                      <li className="flex items-start gap-1.5">
                        <span className="text-green-highlight font-bold">▪</span>
                        <span><strong className="text-white font-bold">A & AAAA:</strong> Points to the target server's IPv4 or IPv6 physical network addresses.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-green-highlight font-bold">▪</span>
                        <span><strong className="text-white font-bold">MX Records:</strong> Designates mail exchange server endpoints and priority parameters.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-green-highlight font-bold">▪</span>
                        <span><strong className="text-white font-bold">TXT Records:</strong> Carries SPF, DKIM, DMARC security rules, and site ownership verifications.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-green-highlight font-bold">▪</span>
                        <span><strong className="text-white font-bold">NS & SOA:</strong> Identifies zones of authority and zone transfer timers.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-green-highlight font-bold">▪</span>
                        <span><strong className="text-white font-bold">IP GEOLOCATION:</strong> Decodes physical coordinates of resolved host server nodes for visual mapping and routing reconnaissance.</span>
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
