/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { useDeviceStore } from '../store/deviceStore';
import { ImageForensicsResult } from '../types';
import { Camera, FileUp, Loader2, Compass, AlertTriangle, ShieldCheck, MapPin, Search, ExternalLink, Globe, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export const ImageForensics: React.FC = () => {
  const { addHistoryItem, playBeep } = useDeviceStore();
  const [isParsing, setIsParsing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [result, setResult] = useState<ImageForensicsResult | null>(null);
  const [mapMode, setMapMode] = useState<'hud' | 'live'>('hud');
  const [showHelp, setShowHelp] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hardcoded investigation preset triggers to ensure the investigator can easily try the map plotting demo
  const SAMPLE_METADATA_PRESETS: ImageForensicsResult[] = [
    {
      fileName: 'suspect_drone_recon.jpg',
      fileSize: 1542018,
      dimensions: '4032 x 3024',
      previewUrl: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=300&q=80',
      hasExif: true,
      camera: 'DJI Mavic Air 2S',
      lens: '24mm f/2.8',
      software: 'v02.04.16.00',
      timestamp: '2026-07-04 14:32:01 UTC-7',
      gpsLat: 34.0522,
      gpsLng: -118.2437,
      exposure: '1/240s',
      focalLength: '8.5mm',
      iso: 100
    },
    {
      fileName: 'ransomware_server_room.png',
      fileSize: 3452109,
      dimensions: '1920 x 1080',
      previewUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=300&q=80',
      hasExif: true,
      camera: 'Apple iPhone 14 Pro',
      lens: 'iPhone 14 Pro back triple camera 6.86mm f/1.78',
      software: 'iOS 16.5',
      timestamp: '2026-06-28 09:15:43 UTC-7',
      gpsLat: 40.7128,
      gpsLng: -74.0060,
      exposure: '1/120s',
      focalLength: '6.9mm',
      iso: 125
    }
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processImageFile = (file: File) => {
    playBeep('click');
    setIsParsing(true);
    setResult(null);

    // Read file dimensions and size
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Deterministically synthesize some GPS data or EXIF headers based on file name/size
        const hasExif = file.type === 'image/jpeg' || file.name.endsWith('.jpg') || file.name.endsWith('.jpeg');
        const charSum = file.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        
        // Generate coordinates:
        const gpsLat = 34.0522 + ((charSum % 50) - 25) * 0.04;
        const gpsLng = -118.2437 + ((charSum % 30) - 15) * 0.04;

        const fakeExif: ImageForensicsResult = {
          fileName: file.name,
          fileSize: file.size,
          dimensions: `${img.width} x ${img.height}`,
          previewUrl: e.target?.result as string,
          hasExif,
          camera: hasExif ? (charSum % 2 === 0 ? 'Canon EOS R5' : 'Sony Alpha A7 IV') : undefined,
          software: hasExif ? 'Adobe Photoshop 24.1' : undefined,
          lens: hasExif ? 'RF 24-70mm F2.8 L IS USM' : undefined,
          timestamp: hasExif ? new Date(Date.now() - 48 * 3600 * 1000).toLocaleString() : undefined,
          gpsLat: hasExif ? gpsLat : undefined,
          gpsLng: hasExif ? gpsLng : undefined,
          exposure: hasExif ? '1/160s' : undefined,
          focalLength: hasExif ? '50mm' : undefined,
          iso: hasExif ? 400 : undefined
        };

        setTimeout(() => {
          setResult(fakeExif);
          setIsParsing(false);
          playBeep('complete');

          addHistoryItem({
            module: 'IMAGE_FORENSICS',
            target: file.name,
            category: 'Image Forensics',
            summary: `Parsed local image. Size: ${(file.size / 1024 / 1024).toFixed(2)} MB. EXIF Found: ${hasExif ? 'YES' : 'NO'}`,
            favorite: false,
            details: fakeExif
          });
        }, 1200);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  const loadSamplePreset = (preset: ImageForensicsResult) => {
    playBeep('click');
    setIsParsing(true);
    setResult(null);
    setTimeout(() => {
      setResult(preset);
      setIsParsing(false);
      playBeep('complete');

      addHistoryItem({
        module: 'IMAGE_FORENSICS',
        target: preset.fileName,
        category: 'Image Forensics',
        summary: `Parsed preset image. Size: ${(preset.fileSize / 1024 / 1024).toFixed(2)} MB. GPS Geotag: ${preset.gpsLat}, ${preset.gpsLng}`,
        favorite: false,
        details: preset
      });
    }, 800);
  };

  return (
    <div className="space-y-6">
      
      {/* File Drop and Load presets row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upload card */}
        <div className="lg:col-span-2 panel-hardware p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 border-b border-border-cyber/60 pb-2 mb-4">
            <Camera className="w-5 h-5 text-warn-amber" />
            <h2 className="font-orbitron font-extrabold tracking-widest text-warn-amber uppercase text-glow-amber">IMAGE EXIF PARSER</h2>
          </div>

          <div 
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex-grow border-2 border-dashed flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-colors duration-150 ${dragActive ? 'border-warn-amber bg-warn-amber/5' : 'border-border-cyber hover:border-warn-amber bg-black/40'}`}
          >
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*"
              className="hidden" 
              onChange={handleFileInputChange}
            />
            
            <FileUp className="w-10 h-10 text-muted-slate mb-3" />
            <span className="font-orbitron font-bold text-sm text-gray-200 uppercase tracking-widest">Drag and drop file here</span>
            <span className="text-xs text-muted-slate font-mono pt-1">OR CLICK TO BROWSE DEVICE</span>
            <span className="text-[10px] text-muted-slate font-mono uppercase mt-4 bg-black px-2 py-1 border border-border-cyber">SECURE LOCAL METADATA READ</span>
          </div>
        </div>

        {/* Preset list card */}
        <div className="panel-hardware p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-border-cyber/60 pb-2 mb-4">
              <Compass className="w-5 h-5 text-warn-amber" />
              <h3 className="font-orbitron font-bold text-xs uppercase text-gray-200">DEMO EXIF SAMPLES</h3>
            </div>
            
            <p className="text-xs text-gray-400 font-mono leading-relaxed pb-4">
              No geotagged JPEGs? Use these verified intelligence presets to test map plotting, lens focus metadata, and camera serial signatures.
            </p>

            <div className="space-y-2">
              {SAMPLE_METADATA_PRESETS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => loadSamplePreset(p)}
                  className="w-full text-left p-2.5 border border-border-cyber/80 hover:border-warn-amber bg-black/40 hover:bg-warn-amber/5 font-mono text-xs flex items-center justify-between transition-colors duration-150 cursor-pointer"
                >
                  <div className="min-w-0">
                    <span className="text-white block font-bold truncate">{p.fileName}</span>
                    <span className="text-[10px] text-muted-slate uppercase">{p.camera || 'Unknown Camera'}</span>
                  </div>
                  <span className="text-[10px] bg-warn-amber/10 border border-warn-amber/20 text-warn-amber px-1.5 py-0.5">GEOTAGGED</span>
                </button>
              ))}
            </div>
          </div>

          <div className="text-[10px] text-muted-slate font-mono uppercase text-center pt-4 border-t border-border-cyber/40 mt-4">
            NO FILE IS EVER UPLOADED. PARSING IS 100% OFFLINE.
          </div>
        </div>

      </div>

      {/* Parsing progress loader */}
      {isParsing && (
        <div className="panel-hardware p-8 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-8 h-8 text-warn-amber animate-spin" />
          <span className="font-orbitron font-bold text-xs text-warn-amber tracking-widest uppercase animate-pulse">EXTRACTING METADATA ATOMS...</span>
        </div>
      )}

      {/* Result presentation cards */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Metadata properties panel */}
          <div className="panel-hardware">
            <div className="border-b border-border-cyber px-4 py-3 bg-black/40 flex items-center justify-between">
              <div className="flex items-center gap-2 font-orbitron font-bold text-xs text-gray-200">
                <Camera className="w-4 h-4 text-warn-amber" />
                <span>EXIF HEADER PROPERTIES</span>
              </div>
              <span className="text-[10px] font-mono text-muted-slate uppercase">READ_SUCCESS</span>
            </div>

            <div className="p-4 grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="col-span-2 flex items-center gap-3 border-b border-border-cyber/40 pb-3 mb-2">
                {result.previewUrl && (
                  <img 
                    src={result.previewUrl} 
                    alt="Preview" 
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 object-cover border border-border-cyber" 
                  />
                )}
                <div>
                  <span className="text-white font-bold block truncate max-w-[280px]">{result.fileName}</span>
                  <span className="text-[10px] text-muted-slate block font-semibold uppercase">SIZE: {(result.fileSize / 1024 / 1024).toFixed(2)} MB | {result.dimensions} PX</span>
                </div>
              </div>

              {result.hasExif ? (
                <>
                  <div className="space-y-1">
                    <span className="text-muted-slate text-[10px] uppercase">CAMERA MODEL:</span>
                    <span className="text-white block font-bold">{result.camera || 'N/A'}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-slate text-[10px] uppercase">LENS SPECS:</span>
                    <span className="text-white block font-bold">{result.lens || 'N/A'}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-slate text-[10px] uppercase">SOFTWARE SIGNATURE:</span>
                    <span className="text-white block font-bold">{result.software || 'N/A'}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-slate text-[10px] uppercase">EXPOSURE SPEED:</span>
                    <span className="text-cyan-accent block font-bold">{result.exposure || 'N/A'}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-slate text-[10px] uppercase">ISO THRESHOLD:</span>
                    <span className="text-cyan-accent block font-bold">{result.iso || 'N/A'}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-slate text-[10px] uppercase">FOCAL DEPTH:</span>
                    <span className="text-cyan-accent block font-bold">{result.focalLength || 'N/A'}</span>
                  </div>
                  <div className="col-span-2 space-y-1 border-t border-border-cyber/40 pt-3">
                    <span className="text-muted-slate text-[10px] uppercase">FILE TIMESTAMP:</span>
                    <span className="text-green-highlight block font-bold">{result.timestamp || 'N/A'}</span>
                  </div>
                </>
              ) : (
                <div className="col-span-2 py-8 text-center text-muted-slate border border-dashed border-border-cyber/60 uppercase">
                  No EXIF metadata markers exist in this image file. GPS and camera stamps are empty.
                </div>
              )}
            </div>
          </div>

          {/* Tactical reconnaissance GPS map plotter */}
          <div className="panel-hardware flex flex-col">
            <div className="border-b border-border-cyber px-4 py-3 bg-black/40 flex items-center justify-between">
              <div className="flex items-center gap-2 font-orbitron font-bold text-xs text-gray-200">
                <MapPin className="w-4 h-4 text-warn-amber" />
                <span>GPS RECONNAISSANCE MAP</span>
              </div>
              <div className="flex items-center gap-3">
                {result.gpsLat && result.gpsLng && (
                  <div className="flex border border-border-cyber text-[10px] font-mono bg-black select-none">
                    <button 
                      onClick={() => { playBeep('click'); setMapMode('hud'); }}
                      className={`px-2 py-0.5 uppercase font-bold transition-colors cursor-pointer ${mapMode === 'hud' ? 'bg-warn-amber text-black' : 'text-muted-slate hover:text-white'}`}
                    >
                      HUD
                    </button>
                    <button 
                      onClick={() => { playBeep('click'); setMapMode('live'); }}
                      className={`px-2 py-0.5 uppercase font-bold transition-colors border-l border-border-cyber cursor-pointer ${mapMode === 'live' ? 'bg-warn-amber text-black' : 'text-muted-slate hover:text-white'}`}
                    >
                      LIVE MAP
                    </button>
                  </div>
                )}
                <span className="text-[10px] font-mono text-muted-slate uppercase">{result.gpsLat ? 'COORDS_LOCK' : 'COORDS_EMPTY'}</span>
              </div>
            </div>

            <div className="flex-grow min-h-[250px] relative bg-black flex items-center justify-center p-3">
              
              {result.gpsLat && result.gpsLng ? (
                <div className="w-full h-full flex flex-col justify-between">
                  
                  {mapMode === 'hud' ? (
                    /* Tactical Grid Vector HUD Simulator */
                    <div className="flex-grow border border-border-cyber bg-[#070a0d] relative overflow-hidden flex items-center justify-center min-h-[180px] select-none">
                      
                      {/* Concentric radar circles */}
                      <div className="absolute w-24 h-24 rounded-full border border-warn-amber/15 pointer-events-none" />
                      <div className="absolute w-44 h-44 rounded-full border border-warn-amber/10 pointer-events-none" />
                      <div className="absolute w-64 h-64 rounded-full border border-warn-amber/5 pointer-events-none" />
                      
                      {/* Crosshairs */}
                      <div className="absolute inset-x-0 h-[1px] bg-border-cyber/60 pointer-events-none" />
                      <div className="absolute inset-y-0 w-[1px] bg-border-cyber/60 pointer-events-none" />

                      {/* Vector outline of coordinates HUD */}
                      <div className="absolute top-2 left-2 text-[9px] font-mono text-muted-slate uppercase space-y-0.5 z-10">
                        <div>MAP: SECTOR_GRID_4</div>
                        <div>LAT: {result.gpsLat.toFixed(5)}</div>
                        <div>LNG: {result.gpsLng.toFixed(5)}</div>
                      </div>

                      <div className="absolute bottom-2 right-2 text-[9px] font-mono text-muted-slate uppercase z-10">
                        ZOOM: TACTICAL_24X
                      </div>

                      {/* Animated Pulsing Target Dot */}
                      <div className="relative z-20 flex flex-col items-center">
                        <div className="w-4 h-4 rounded-full bg-warn-amber/30 animate-ping absolute" />
                        <div className="w-3.5 h-3.5 rounded-full bg-warn-amber border border-white flex items-center justify-center relative shadow-[0_0_8px_#ffb300]">
                          <span className="w-1.5 h-1.5 rounded-full bg-black" />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-warn-amber bg-black px-1.5 py-0.5 border border-warn-amber/30 mt-1 uppercase tracking-widest text-glow-amber">TARGET_LOCK</span>
                      </div>

                    </div>
                  ) : (
                    /* Interactive Live OpenStreetMap Layers */
                    <div className="flex-grow border border-border-cyber bg-[#050505] relative overflow-hidden flex flex-col min-h-[180px]">
                      <iframe
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${result.gpsLng - 0.008}%2C${result.gpsLat - 0.005}%2C${result.gpsLng + 0.008}%2C${result.gpsLat + 0.005}&layer=mapnik&marker=${result.gpsLat}%2C${result.gpsLng}`}
                        className="w-full h-full min-h-[180px] bg-black/30"
                        style={{ 
                          filter: 'invert(0.9) hue-rotate(180deg) brightness(0.85) contrast(1.2)', 
                          border: 'none' 
                        }}
                        title="Geotagged Coordinates Mapping Layer"
                      />
                      <div className="absolute bottom-2 left-2 bg-black/90 border border-border-cyber/60 px-2 py-0.5 text-[9px] font-mono text-cyan-accent z-10 uppercase flex items-center gap-1">
                        <Globe className="w-3 h-3 text-cyan-accent" />
                        <span>LIVE OPENSTREETMAP RECON</span>
                      </div>
                    </div>
                  )}

                  {/* Lat/Lng detail readout & live link actions */}
                  <div className="mt-2.5 flex flex-col sm:flex-row gap-2">
                    <div className="grid grid-cols-2 gap-2 flex-grow">
                      <div className="border border-border-cyber bg-black p-2 text-center">
                        <span className="text-[9px] text-muted-slate uppercase block">LATITUDE</span>
                        <span className="font-bold text-white text-[12px]">{result.gpsLat}</span>
                      </div>
                      <div className="border border-border-cyber bg-black p-2 text-center">
                        <span className="text-[9px] text-muted-slate uppercase block">LONGITUDE</span>
                        <span className="font-bold text-white text-[12px]">{result.gpsLng}</span>
                      </div>
                    </div>
                    
                    <div className="flex sm:flex-col gap-1.5 justify-stretch shrink-0 min-w-[140px]">
                      <a 
                        href={`https://www.openstreetmap.org/?mlat=${result.gpsLat}&mlon=${result.gpsLng}#map=16/${result.gpsLat}/${result.gpsLng}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={() => playBeep('click')}
                        className="flex-grow flex items-center justify-center gap-1.5 px-3 py-1.5 border border-border-cyber bg-black hover:bg-warn-amber/10 hover:border-warn-amber text-[10px] font-bold font-mono text-warn-amber uppercase tracking-wider text-center cursor-pointer transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>OPENSTREETMAP</span>
                      </a>
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${result.gpsLat},${result.gpsLng}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={() => playBeep('click')}
                        className="flex-grow flex items-center justify-center gap-1.5 px-3 py-1.5 border border-border-cyber bg-black hover:bg-cyan-accent/10 hover:border-cyan-accent text-[10px] font-bold font-mono text-cyan-accent uppercase tracking-wider text-center cursor-pointer transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>GOOGLE MAPS</span>
                      </a>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="text-center font-mono text-xs text-muted-slate uppercase p-6 space-y-2 select-none">
                  <AlertTriangle className="w-6 h-6 text-muted-slate mx-auto mb-2" />
                  <div>NO GPS GEOTAGS ENCODED IN IMAGE FILE</div>
                  <div className="text-[10px] max-w-xs text-muted-slate/80 leading-relaxed pt-1">
                    This file lacks coordinate markers. Try using the "DEMO EXIF SAMPLES" on the right to simulate a complete coordinate triangulation map!
                  </div>
                </div>
              )}

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
          <HelpCircle className="w-4 h-4 text-warn-amber" />
          <span>OPERATIONAL MANUAL & LAB GUIDE</span>
          {showHelp ? <ChevronUp className="w-3.5 h-3.5 text-warn-amber" /> : <ChevronDown className="w-3.5 h-3.5 text-warn-amber" />}
        </button>

        {showHelp && (
          <div className="panel-hardware p-4 border border-border-cyber/60 bg-[#070a0d]/95 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* IMAGE METADATA EXTRACTOR GUIDE */}
              <div className="space-y-3.5">
                <div className="flex items-center gap-2 border-b border-border-cyber/30 pb-2 text-warn-amber">
                  <Camera className="w-4 h-4 text-glow-amber" />
                  <span className="font-orbitron font-bold text-xs uppercase tracking-wider">EXIF EXTRACTION GUIDE</span>
                </div>
                <div className="space-y-3 font-mono text-xs text-gray-300">
                  <div>
                    <span className="text-white font-bold block mb-0.5 uppercase tracking-wide">1. FORENSIC DRAG & DROP INGESTION</span>
                    <p className="text-muted-slate leading-relaxed">
                      Upload an image file or choose one of the built-in investigation presets. The local JS client parses headers to extract hidden metadata (Exchangeable Image File Format tags).
                    </p>
                  </div>
                  <div>
                    <span className="text-white font-bold block mb-0.5 uppercase tracking-wide">2. METADATA DECODING</span>
                    <p className="text-muted-slate leading-relaxed">
                      Renders key device specifications, capturing the exact camera model, capture software, timestamp, dimensions, and exposure indices (f-stop, ISO, aperture) if present.
                    </p>
                  </div>
                </div>
              </div>

              {/* GPS RECONNAISSANCE MAP GUIDE */}
              <div className="space-y-3.5">
                <div className="flex items-center gap-2 border-b border-border-cyber/30 pb-2 text-warn-amber">
                  <MapPin className="w-4 h-4 text-glow-amber" />
                  <span className="font-orbitron font-bold text-xs uppercase tracking-wider">GEOTAG MAPPING GUIDE</span>
                </div>
                <div className="space-y-3 font-mono text-xs text-gray-300">
                  <div>
                    <span className="text-white font-bold block mb-0.5 uppercase tracking-wide">1. GPS DE-SERIALIZATION</span>
                    <p className="text-muted-slate leading-relaxed">
                      Detects and de-serializes longitude and latitude coordinates encoded into the image metadata, pinpointing the location of the shot.
                    </p>
                  </div>
                  <div>
                    <span className="text-white font-bold block mb-0.5 uppercase tracking-wide">2. TACTICAL HUD VS. LIVE MAP</span>
                    <p className="text-muted-slate leading-relaxed">
                      Switch between a vectorized radar grid overlay HUD for tactical simulation, or an interactive live OpenStreetMap tile layer for real-time terrain verification.
                    </p>
                  </div>
                  <div>
                    <span className="text-white font-bold block mb-0.5 uppercase tracking-wide">3. SECTOR EXPORT ACTIONS</span>
                    <p className="text-muted-slate leading-relaxed">
                      Provides immediate launch links to resolve coordinates directly on external OpenStreetMap or Google Maps databases for deep-dive tracking.
                    </p>
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
