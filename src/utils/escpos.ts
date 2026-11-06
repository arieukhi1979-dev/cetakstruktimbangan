import { WeighRecord, PrinterSettings } from '../types';

export class EscPosBuilder {
  private buffer: number[] = [];
  private maxChars: number;

  constructor(paperWidth: '58mm' | '80mm' = '58mm') {
    this.maxChars = paperWidth === '58mm' ? 32 : 48;
  }

  // Initialize printer
  init(): this {
    this.buffer.push(0x1B, 0x40); // ESC @
    return this;
  }

  // Alignment
  alignLeft(): this {
    this.buffer.push(0x1B, 0x61, 0x00);
    return this;
  }

  alignCenter(): this {
    this.buffer.push(0x1B, 0x61, 0x01);
    return this;
  }

  alignRight(): this {
    this.buffer.push(0x1B, 0x61, 0x02);
    return this;
  }

  // Text formatting
  bold(enable: boolean = true): this {
    this.buffer.push(0x1B, 0x45, enable ? 0x01 : 0x00);
    return this;
  }

  textSize(width: 1 | 2 | 3 | 4 = 1, height: 1 | 2 | 3 | 4 = 1): this {
    const size = ((width - 1) << 4) | (height - 1);
    this.buffer.push(0x1D, 0x21, size); // GS ! n
    return this;
  }

  normal(): this {
    this.buffer.push(0x1B, 0x21, 0x00); // ESC ! 0
    this.buffer.push(0x1B, 0x45, 0x00); // Bold off
    this.buffer.push(0x1D, 0x21, 0x00); // GS ! 0
    return this;
  }

  invert(enable: boolean = true): this {
    this.buffer.push(0x1D, 0x42, enable ? 0x01 : 0x00); // GS B n
    return this;
  }

  // Text writing
  text(str: string): this {
    // Convert string to ASCII/Latin1 bytes
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      this.buffer.push(code > 255 ? 0x3F : code);
    }
    return this;
  }

  newLine(): this {
    this.buffer.push(0x0A);
    return this;
  }

  line(str: string = ''): this {
    this.text(str);
    this.newLine();
    return this;
  }

  // Divider lines
  divider(char: string = '-'): this {
    const repeated = char.repeat(this.maxChars).slice(0, this.maxChars);
    return this.line(repeated);
  }

  doubleDivider(): this {
    return this.divider('=');
  }

  // Two column row with padding (e.g., "Jenis Barang" ... "Beras Super")
  row(left: string, right: string): this {
    const leftLen = left.length;
    const rightLen = right.length;
    const spaceNeeded = this.maxChars - leftLen - rightLen;

    if (spaceNeeded >= 1) {
      const lineStr = left + ' '.repeat(spaceNeeded) + right;
      return this.line(lineStr);
    } else {
      // If combined length is too long, wrap
      this.line(left);
      const pad = Math.max(0, this.maxChars - rightLen);
      return this.line(' '.repeat(pad) + right);
    }
  }

  // Feed lines
  feed(lines: number = 2): this {
    this.buffer.push(0x1B, 0x64, lines);
    return this;
  }

  // Paper cut (full cut or partial cut with feed)
  cut(): this {
    this.buffer.push(0x1D, 0x56, 0x41, 0x10); // GS V 65 16
    return this;
  }

  // Generate binary Uint8Array
  toBytes(): Uint8Array {
    return new Uint8Array(this.buffer);
  }
}

/**
 * Generate formatted plain text representation of the receipt
 */
export function generateReceiptPlainText(record: WeighRecord, settings: PrinterSettings): string {
  const maxChars = settings.paperWidth === '58mm' ? 32 : 48;
  const divider = '-'.repeat(maxChars);
  const doubleDivider = '='.repeat(maxChars);

  const padRow = (left: string, right: string): string => {
    const space = maxChars - left.length - right.length;
    if (space >= 1) {
      return left + ' '.repeat(space) + right;
    }
    return `${left}\n` + ' '.repeat(Math.max(0, maxChars - right.length)) + right;
  };

  const center = (str: string): string => {
    const pad = Math.max(0, Math.floor((maxChars - str.length) / 2));
    return ' '.repeat(pad) + str;
  };

  const lines: string[] = [];

  // Header
  lines.push(center(settings.namaUsaha.toUpperCase()));
  if (settings.subJudul) lines.push(center(settings.subJudul));
  if (settings.alamat) lines.push(center(settings.alamat));
  if (settings.telepon) lines.push(center(`Telp: ${settings.telepon}`));
  lines.push(doubleDivider);

  // Struk / Label Title
  lines.push(center('LABEL HASIL PRESS'));
  lines.push(divider);

  // Metadata
  lines.push(padRow('No. Bal', record.receiptNumber));
  lines.push(padRow('Tgl Proses', formatDate(record.tanggalProses)));
  lines.push(padRow('Waktu', formatTime(record.tanggalProses)));
  if (record.shift) {
    lines.push(padRow('Shift', record.shift));
  }
  if (record.nomorLot) {
    lines.push(padRow('No. Batch/Lot', record.nomorLot));
  }

  lines.push(divider);

  // Main Item Details
  lines.push(`JENIS BARANG:`);
  lines.push(`>> ${record.jenisBarang.toUpperCase()}`);
  if (record.kodeBarang) {
    lines.push(`   Kode: ${record.kodeBarang}`);
  }

  lines.push(doubleDivider);

  // BERAT NETTO - 3X BESAR (JUMBO)
  lines.push(center('BERAT BERSIH (NETTO):'));
  lines.push('');
  lines.push(center(`>>>  ${record.beratNetto.toFixed(2)} ${record.satuan.toUpperCase()}  <<<`));
  lines.push('');

  if (record.catatan) {
    lines.push(divider);
    lines.push(`Ket: ${record.catatan}`);
  }

  lines.push(doubleDivider);

  // Footer
  if (settings.footerPesan) {
    lines.push(center(settings.footerPesan));
  }
  lines.push(center(`Cetak: ${record.printCount > 1 ? `Ulang ke-${record.printCount}` : 'Asli'} ${new Date().toLocaleTimeString('id-ID')}`));

  lines.push('\n'.repeat(settings.feedLines));

  return lines.join('\n');
}

/**
 * Generate binary ESC/POS byte commands for Bluetooth / Serial / USB printers
 */
export function buildEscPosPayload(record: WeighRecord, settings: PrinterSettings): Uint8Array {
  const builder = new EscPosBuilder(settings.paperWidth);

  builder.init();

  // Header Center
  builder.alignCenter();
  builder.textSize(2, 2);
  builder.bold(true);
  builder.line(settings.namaUsaha.toUpperCase());

  builder.normal();
  builder.alignCenter();
  if (settings.subJudul) builder.line(settings.subJudul);
  if (settings.alamat) builder.line(settings.alamat);
  if (settings.telepon) builder.line(`Telp: ${settings.telepon}`);

  builder.doubleDivider();

  // Title
  builder.bold(true);
  builder.textSize(1, 2);
  builder.line('LABEL HASIL PRESS');
  builder.normal();
  builder.divider();

  // Meta Left & Right
  builder.alignLeft();
  builder.row('No. Bal', record.receiptNumber);
  builder.row('Tgl Proses', formatDate(record.tanggalProses));
  builder.row('Waktu', formatTime(record.tanggalProses));
  if (record.shift) builder.row('Shift', record.shift);
  if (record.nomorLot) builder.row('No. Batch/Lot', record.nomorLot);

  builder.divider();

  // Jenis Barang (Emphasized)
  builder.line('JENIS BARANG:');
  builder.bold(true);
  builder.textSize(2, 2);
  builder.line(record.jenisBarang.toUpperCase());
  builder.normal();
  if (record.kodeBarang) {
    builder.line(`Kode Item: ${record.kodeBarang}`);
  }

  builder.doubleDivider();

  // BERAT NETTO / BERSIH - 3X BESAR (JUMBO FONT)
  builder.alignCenter();
  builder.bold(true);
  builder.line('BERAT BERSIH (NETTO):');
  builder.newLine();
  builder.textSize(3, 3); // 3x Lebar & 3x Tinggi!
  builder.line(`${record.beratNetto.toFixed(2)} ${record.satuan.toUpperCase()}`);
  builder.normal();
  builder.newLine();

  if (record.catatan) {
    builder.divider();
    builder.alignLeft();
    builder.line(`Ket: ${record.catatan}`);
  }

  builder.doubleDivider();

  // Footer
  builder.alignCenter();
  if (settings.footerPesan) {
    builder.line(settings.footerPesan);
  }
  builder.line(`Cetak: ${record.printCount > 1 ? `Ulang ke-${record.printCount}` : 'Asli'} ${new Date().toLocaleTimeString('id-ID')}`);

  // Paper Feed & Cut
  builder.feed(settings.feedLines || 3);
  if (settings.cutPaper) {
    builder.cut();
  }

  return builder.toBytes();
}

/**
 * Generate a test receipt payload
 */
export function buildTestPrintPayload(settings: PrinterSettings): Uint8Array {
  const builder = new EscPosBuilder(settings.paperWidth);
  builder.init();
  builder.alignCenter();
  builder.bold(true);
  builder.textSize(2, 2);
  builder.line('TEST PRINT BERHASIL');
  builder.normal();
  builder.alignCenter();
  builder.line(settings.namaUsaha);
  builder.line('Koneksi Bluetooth OK');
  builder.line(new Date().toLocaleString('id-ID'));
  builder.divider();
  builder.line('Printer Thermal Siap Dipakai');
  builder.line('Paper Width: ' + settings.paperWidth);
  builder.feed(settings.feedLines || 3);
  if (settings.cutPaper) builder.cut();
  return builder.toBytes();
}

function formatDate(isoStr: string): string {
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoStr;
  }
}

function formatTime(isoStr: string): string {
  try {
    const d = new Date(isoStr);
    return d.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return '';
  }
}
