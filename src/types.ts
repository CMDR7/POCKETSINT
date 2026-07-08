/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SystemStatus {
  cpuUsage: number;
  ramUsage: number;
  storageUsage: number;
  batteryLevel: number;
  batteryCharging?: boolean;
  gpsLocked: boolean;
  temperature: number;
  signalStrength: number;
  activeModules: number;
}

export type ModuleId = 'HOME' | 'USER_RECON' | 'DOMAIN_INTEL' | 'IMAGE_FORENSICS' | 'HASH_LAB' | 'SEARCH_BUILDER' | 'REPORTS' | 'SETTINGS';

export interface ScanHistoryItem {
  id: string;
  timestamp: string; // ISO String
  module: ModuleId;
  target: string;
  category: string;
  summary: string;
  favorite: boolean;
  tags?: string[];
  details: any; // Module-specific detail payload
}

export interface UsernamePlatform {
  name: string;
  category: string;
  urlTemplate: string;
  checkUrlTemplate?: string;
}

export interface UsernameScanResult {
  platform: string;
  category: string;
  url: string;
  status: 'found' | 'possible' | 'unavailable' | 'manual' | 'checking';
  statusCode?: number;
}

export interface DnsRecord {
  type: string;
  name: string;
  value: string;
  ttl: number;
}

export interface DomainIntelResult {
  domain: string;
  ipAddress: string;
  resolved: boolean;
  dnsRecords: DnsRecord[];
  sslInfo?: {
    valid: boolean;
    subject?: string;
    issuer?: string;
    validFrom?: string;
    validTo?: string;
    serialNumber?: string;
  };
  whoisInfo?: {
    registrar?: string;
    created?: string;
    expires?: string;
    nameservers?: string[];
  };
}

export interface ImageForensicsResult {
  fileName: string;
  fileSize: number;
  dimensions: string;
  previewUrl: string | null;
  hasExif: boolean;
  camera?: string;
  lens?: string;
  software?: string;
  timestamp?: string;
  gpsLat?: number;
  gpsLng?: number;
  exposure?: string;
  focalLength?: string;
  iso?: number;
}

export interface HashResult {
  inputText: string;
  fileName?: string;
  fileSize?: number;
  md5: string;
  sha1: string;
  sha256: string;
  sha512: string;
  crc32: string;
}

export interface DorkOperator {
  id: string;
  name: string;
  placeholder: string;
  value: string;
  operator: string;
}

export interface UserSettings {
  soundEnabled: boolean;
  scanlinesEnabled: boolean;
  hologramEffect: boolean;
  lowPowerMode: boolean;
  investigatorName: string;
  agencyCode: string;
}
