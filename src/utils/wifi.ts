import * as childProcess from 'child_process';

interface WiFiNetwork {
  ssid: string;
  signalStrength: number;
  securityType: string;
  bssid?: string;
  isConnected: boolean;
}

export function getDummyNetworks(): WiFiNetwork[] {
  return [
    { ssid: 'LaundryNet_5G', signalStrength: 85, securityType: 'WPA2-Personal', isConnected: false },
    { ssid: 'LaundryNet_2.4G', signalStrength: 72, securityType: 'WPA2-Personal', isConnected: false },
    { ssid: 'Office_WiFi', signalStrength: 45, securityType: 'WPA2-Enterprise', isConnected: false },
    { ssid: 'Guest_Network', signalStrength: 30, securityType: 'Open', isConnected: false },
    { ssid: 'TP-LINK_1234', signalStrength: 60, securityType: 'WPA2-Personal', isConnected: false },
    { ssid: 'IndiHome_Fiber', signalStrength: 55, securityType: 'WPA2-Personal', isConnected: false },
  ];
}

export function parseNetshOutput(output: string): WiFiNetwork[] | null {
  const networks: WiFiNetwork[] = [];
  const lines = output.split('\n');
  let currentSsid: string | null = null;
  let currentSignal = 0;
  let currentSecurity = 'Unknown';
  let currentBssid: string = '';

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      if (currentSsid && currentSignal > 0) {
        networks.push({ ssid: currentSsid, signalStrength: currentSignal, securityType: currentSecurity, bssid: currentBssid, isConnected: false });
        currentSsid = null;
      }
      continue;
    }
    if (line.startsWith('SSID') && !line.includes('BSSID') && line.includes(':')) {
      currentSsid = line.split(':').slice(1).join(':').trim();
    } else if (line.includes('Signal') && line.includes(':') && currentSsid) {
      try { currentSignal = parseInt(line.split(':')[1]!.replace('%', '').trim(), 10); } catch { currentSignal = 50; }
    } else if (line.includes('Authentication') && line.includes(':') && currentSsid) {
      currentSecurity = line.split(':').slice(1).join(':').trim();
    } else if (line.includes('BSSID') && line.includes(':')) {
      currentBssid = line.split(':').slice(1).join(':').trim();
    }
  }
  if (currentSsid && currentSignal > 0) {
    networks.push({ ssid: currentSsid, signalStrength: currentSignal, securityType: currentSecurity, bssid: currentBssid, isConnected: false });
  }
  return networks.length > 0 ? networks : null;
}

export function scanWifiNetsh(): WiFiNetwork[] | null {
  try {
    const check = childProcess.execSync('> netsh wlan show interfaces', { encoding: 'utf-8', timeout: 5000 });
    if (check.includes('There is no wireless interface')) return null;
    const output = childProcess.execSync('> netsh wlan show networks mode=Bssid', { encoding: 'utf-8', timeout: 10000 });
    return parseNetshOutput(output);
  } catch {
    return null;
  }
}

export function scanWifiWindows(): WiFiNetwork[] {
  return scanWifiNetsh() ?? getDummyNetworks();
}

export function getCurrentWifi(): [string | null, number] {
  try {
    const output = childProcess.execSync('> netsh wlan show interfaces', { encoding: 'utf-8', timeout: 5000 });
    if (output.includes('There is no wireless interface')) return [null, 0];
    let ssid: string | null = null;
    let signal = 0;
    for (const rawLine of output.split('\n')) {
      const line = rawLine.trim();
      if (line.includes('SSID') && !line.includes('BSSID')) {
        ssid = line.split(':').slice(1).join(':').trim();
      } else if (line.includes('Signal') && line.includes(':')) {
        try { signal = parseInt(line.split(':')[1]!.replace('%', '').trim(), 10); } catch { signal = 0; }
      }
    }
    return [ssid, signal];
  } catch {
    return [null, 0];
  }
}

export function getSignalBars(percentage: number): number {
  if (percentage >= 75) return 4;
  if (percentage >= 50) return 3;
  if (percentage >= 25) return 2;
  return 1;
}