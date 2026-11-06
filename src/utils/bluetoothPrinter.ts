import { PrinterDeviceState } from '../types';

// Standard UUIDs for Bluetooth Thermal Printers
export const COMMON_PRINTER_SERVICES = [
  '000018f0-0000-1000-8000-00805f9b34fb', // Standard ESC/POS Service
  'e7810a06-736b-483d-a506-1654aaf1bb9d', // Popular Chinese Mini Printer Service
  '49535343-fe7d-4ae5-8fa9-9fafd205e455', // ISSC Transparent Serial Service
  '0000ff00-0000-1000-8000-00805f9b34fb', // POS-58 / Zjiang Service
  '0000ae30-0000-1000-8000-00805f9b34fb', // GOOJPRT / MPT Service
  '6e400001-b5a3-f393-e0a9-e50e24dcca9e', // Nordic UART Serial
  '0000ffe0-0000-1000-8000-00805f9b34fb', // Generic SPP over BLE
];

class BluetoothPrinterService {
  private device: any = null;
  private server: any = null;
  private writeCharacteristic: any = null;
  private serialPort: any = null;
  private state: PrinterDeviceState = {
    type: 'none',
    deviceName: null,
    connected: false,
    connecting: false,
    lastError: null,
  };
  private listeners: ((state: PrinterDeviceState) => void)[] = [];

  constructor() {
    // Check if previous mock or saved connection exists
    const savedName = localStorage.getItem('cetakstruk_last_printer');
    if (savedName) {
      this.state.deviceName = savedName;
    }
  }

  public subscribe(callback: (state: PrinterDeviceState) => void): () => void {
    this.listeners.push(callback);
    callback(this.state);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private notifyState(patch: Partial<PrinterDeviceState>) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((l) => l(this.state));
  }

  public getState(): PrinterDeviceState {
    return { ...this.state };
  }

  public isWebBluetoothAvailable(): boolean {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  }

  public isWebSerialAvailable(): boolean {
    return typeof navigator !== 'undefined' && 'serial' in navigator;
  }

  /**
   * Connect to Bluetooth Thermal Printer via Web Bluetooth API (Supported on Android Chrome/Edge)
   */
  public async connectBluetooth(): Promise<boolean> {
    if (!this.isWebBluetoothAvailable()) {
      this.notifyState({
        lastError: 'Web Bluetooth tidak didukung pada browser ini. Gunakan Google Chrome di Android atau gunakan mode Cetak Android / RawBT.',
        connecting: false,
      });
      return false;
    }

    try {
      this.notifyState({ connecting: true, lastError: null });

      const nav = navigator as any;

      // Request device with optional services
      const device = await nav.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: COMMON_PRINTER_SERVICES,
      });

      if (!device) {
        this.notifyState({ connecting: false });
        return false;
      }

      this.device = device;
      this.notifyState({ deviceName: device.name || 'Printer Bluetooth' });

      // Handle disconnection
      device.addEventListener('gattserverdisconnected', () => {
        this.device = null;
        this.server = null;
        this.writeCharacteristic = null;
        this.notifyState({
          connected: false,
          connecting: false,
          lastError: 'Koneksi printer terputus.',
        });
      });

      // Connect to GATT Server
      const server = await device.gatt.connect();
      this.server = server;

      // Scan available services to find writable characteristic
      let characteristicFound = null;

      // Try known services first
      for (const serviceUuid of COMMON_PRINTER_SERVICES) {
        try {
          const service = await server.getPrimaryService(serviceUuid);
          const characteristics = await service.getCharacteristics();
          for (const char of characteristics) {
            if (char.properties.write || char.properties.writeWithoutResponse) {
              characteristicFound = char;
              break;
            }
          }
          if (characteristicFound) break;
        } catch {
          // Continue to next service
        }
      }

      // If not found in primary list, try getting all primary services if permitted
      if (!characteristicFound) {
        try {
          const services = await server.getPrimaryServices();
          for (const service of services) {
            try {
              const chars = await service.getCharacteristics();
              for (const char of chars) {
                if (char.properties.write || char.properties.writeWithoutResponse) {
                  characteristicFound = char;
                  break;
                }
              }
              if (characteristicFound) break;
            } catch {
              // Ignore
            }
          }
        } catch {
          // Ignore
        }
      }

      if (!characteristicFound) {
        throw new Error(
          'Printer ditemukan, namun karakteristik cetak tidak dapat diakses. Pastikan printer tidak terhubung ke aplikasi lain.'
        );
      }

      this.writeCharacteristic = characteristicFound;
      localStorage.setItem('cetakstruk_last_printer', device.name || 'Printer Bluetooth');

      this.notifyState({
        type: 'bluetooth',
        connected: true,
        connecting: false,
        deviceName: device.name || 'Thermal POS Printer',
        lastError: null,
      });

      return true;
    } catch (err: any) {
      console.warn('Bluetooth connection error:', err);
      const isCancelled = err.name === 'NotFoundError' || err.message?.includes('User cancelled');
      this.notifyState({
        connecting: false,
        lastError: isCancelled ? null : (err.message || 'Gagal menyambung ke printer Bluetooth'),
      });
      return false;
    }
  }

  /**
   * Connect via USB OTG cable with Web Serial API
   */
  public async connectSerial(): Promise<boolean> {
    if (!this.isWebSerialAvailable()) {
      this.notifyState({
        lastError: 'Web Serial tidak didukung pada browser ini.',
        connecting: false,
      });
      return false;
    }

    try {
      this.notifyState({ connecting: true, lastError: null });
      const nav = navigator as any;
      const port = await nav.serial.requestPort();
      await port.open({ baudRate: 9600 });
      this.serialPort = port;

      this.notifyState({
        type: 'serial',
        connected: true,
        connecting: false,
        deviceName: 'USB Thermal Printer',
        lastError: null,
      });
      return true;
    } catch (err: any) {
      console.warn('Serial connection error:', err);
      this.notifyState({
        connecting: false,
        lastError: err.name === 'NotFoundError' ? null : (err.message || 'Gagal menyambung via USB'),
      });
      return false;
    }
  }

  /**
   * Set Virtual Simulation Mode for instant preview and testing
   */
  public setSimulationMode(name: string = 'Simulasi POS-58 (Virtual)') {
    this.notifyState({
      type: 'none',
      connected: true,
      connecting: false,
      deviceName: name,
      lastError: null,
    });
  }

  /**
   * Disconnect active printer
   */
  public disconnect() {
    if (this.device && this.device.gatt && this.device.gatt.connected) {
      this.device.gatt.disconnect();
    }
    if (this.serialPort) {
      try {
        this.serialPort.close();
      } catch {
        // Ignore
      }
    }
    this.device = null;
    this.server = null;
    this.writeCharacteristic = null;
    this.serialPort = null;
    this.notifyState({
      type: 'none',
      connected: false,
      connecting: false,
      lastError: null,
    });
  }

  /**
   * Send binary ESC/POS payload to printer with reliable chunking
   */
  public async printBytes(payload: Uint8Array): Promise<boolean> {
    // 1. Bluetooth Connection
    if (this.state.type === 'bluetooth' && this.writeCharacteristic) {
      try {
        const chunkSize = 64; // Standard BLE MTU safe size
        for (let i = 0; i < payload.length; i += chunkSize) {
          const chunk = payload.slice(i, i + chunkSize);
          if (this.writeCharacteristic.writeValueWithoutResponse) {
            await this.writeCharacteristic.writeValueWithoutResponse(chunk);
          } else {
            await this.writeCharacteristic.writeValue(chunk);
          }
          // Short delay between chunks for hardware buffer handling
          await new Promise((r) => setTimeout(r, 20));
        }
        return true;
      } catch (err: any) {
        console.error('Print over bluetooth failed:', err);
        this.notifyState({ lastError: 'Gagal mencetak: ' + (err.message || 'Hardware error') });
        return false;
      }
    }

    // 2. USB Serial Connection
    if (this.state.type === 'serial' && this.serialPort && this.serialPort.writable) {
      try {
        const writer = this.serialPort.writable.getWriter();
        await writer.write(payload);
        writer.releaseLock();
        return true;
      } catch (err: any) {
        console.error('Print over serial failed:', err);
        this.notifyState({ lastError: 'Gagal kirim via USB: ' + (err.message || 'Error') });
        return false;
      }
    }

    // If connected in simulation mode
    if (this.state.connected && this.state.type === 'none') {
      return true;
    }

    return false;
  }

  /**
   * Open Android RawBT print intent with Base64 payload
   */
  public printViaRawBT(payload: Uint8Array): void {
    let binary = '';
    const bytes = new Uint8Array(payload);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    // RawBT URI scheme
    const url = `rawbt:data:base64,${base64}`;
    window.location.href = url;
  }
}

export const printerService = new BluetoothPrinterService();
