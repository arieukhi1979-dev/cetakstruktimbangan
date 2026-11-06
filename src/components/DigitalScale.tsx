import React, { useState } from 'react';
import { WeightUnit } from '../types';
import { Scale, RotateCcw, ArrowDownToLine, Zap, CheckCircle2 } from 'lucide-react';
import { soundManager } from '../utils/audioEffects';

interface DigitalScaleProps {
  grossWeight: number;
  tareWeight: number;
  netWeight: number;
  unit: WeightUnit;
  soundEnabled: boolean;
  onGrossChange: (val: number) => void;
  onTareChange: (val: number) => void;
  onUnitChange: (val: WeightUnit) => void;
}

export const DigitalScale: React.FC<DigitalScaleProps> = ({
  grossWeight,
  tareWeight,
  netWeight,
  unit,
  soundEnabled,
  onGrossChange,
  onTareChange,
  onUnitChange,
}) => {
  const [isStable, setIsStable] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);

  // Quick increment buttons
  const addWeight = (delta: number) => {
    if (soundEnabled) soundManager.playBeep(600, 0.04);
    const newVal = Math.max(0, Number((grossWeight + delta).toFixed(2)));
    onGrossChange(newVal);
  };

  // Zero function
  const handleZero = () => {
    if (soundEnabled) soundManager.playBeep(450, 0.08);
    onGrossChange(0);
    onTareChange(0);
  };

  // Tare function
  const handleTare = () => {
    if (soundEnabled) soundManager.playBeep(700, 0.08);
    onTareChange(grossWeight);
  };

  // Simulate scale stabilization
  const handleSimulateWeigh = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setIsStable(false);
    if (soundEnabled) soundManager.playBeep(500, 0.05);

    // Random target weight between 85kg and 175kg (realistic for ballpress bales)
    const target = Number((Math.random() * 90 + 85).toFixed(2));
    let current = 0;
    const steps = 6;
    let stepCount = 0;

    const interval = setInterval(() => {
      stepCount++;
      // Fluctuate before settling
      const noise = (Math.random() - 0.5) * 3;
      current = (target * (stepCount / steps)) + noise;
      onGrossChange(Math.max(0, Number(current.toFixed(2))));

      if (stepCount >= steps) {
        clearInterval(interval);
        onGrossChange(target);
        setIsStable(true);
        setIsSimulating(false);
        if (soundEnabled) soundManager.playBeep(900, 0.12);
      }
    }, 120);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header of Scale Indicator */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Indikator Timbangan Digital
            </h2>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className={`inline-flex items-center gap-1 ${isStable ? 'text-emerald-400' : 'text-amber-400 animate-pulse'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isStable ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                {isStable ? 'STABIL (READY)' : 'MENIMBANG...'}
              </span>
            </div>
          </div>
        </div>

        {/* Unit Selector */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          {(['kg', 'g', 'ton'] as WeightUnit[]).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => onUnitChange(u)}
              className={`px-2.5 py-1 rounded-lg uppercase transition cursor-pointer ${
                unit === u
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      {/* Main Digital Display (Industrial LED Look) */}
      <div className="bg-black/90 border-2 border-slate-800 rounded-xl p-4 sm:p-5 relative shadow-inner">
        {/* Subtle LED segment grid background */}
        <div className="flex items-baseline justify-between">
          <div className="text-[10px] sm:text-xs font-mono uppercase text-slate-500 tracking-wider">
            NETTO (BERSIH)
          </div>
          {isStable && (
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
              <CheckCircle2 className="w-3 h-3" />
              HOLD
            </span>
          )}
        </div>

        {/* Giant Weight Digits */}
        <div className="flex items-baseline justify-center sm:justify-end gap-2 my-1">
          <span className="text-4xl sm:text-5xl md:text-6xl font-mono font-extrabold tracking-tight text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.35)]">
            {netWeight.toFixed(2)}
          </span>
          <span className="text-xl sm:text-2xl font-mono font-bold text-emerald-500 uppercase">
            {unit}
          </span>
        </div>

        {/* Sub-readout info for Label Hasil Press */}
        <div className="pt-2.5 mt-2 border-t border-slate-900/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>STATUS: <strong className="text-emerald-400">LANGSUNG NETTO (BERAT BERSIH)</strong></span>
          <span className="text-slate-500">Label Bal Press</span>
        </div>
      </div>

      {/* Scale Operator Hardware Buttons: ZERO & AUTO-SIMULATE */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        <button
          type="button"
          onClick={handleZero}
          className="flex items-center justify-center gap-1.5 py-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition cursor-pointer shadow-sm"
          title="Reset indikator kembali ke nol"
        >
          <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
          <span>ZERO (RESET 0)</span>
        </button>

        <button
          type="button"
          onClick={handleSimulateWeigh}
          disabled={isSimulating}
          className="flex items-center justify-center gap-1.5 py-2.5 bg-blue-900/50 hover:bg-blue-800/60 active:bg-blue-900 border border-blue-700/50 text-blue-200 font-semibold rounded-xl text-xs transition cursor-pointer disabled:opacity-50 shadow-sm"
          title="Simulasi beban timbangan naik otomatis"
        >
          <Zap className="w-3.5 h-3.5 text-blue-400" />
          <span>{isSimulating ? 'Menimbang...' : 'SIMULASI'}</span>
        </button>
      </div>

      {/* Quick Adder Chips for fast manual operations */}
      <div className="mt-3 pt-3 border-t border-slate-800/60">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] text-slate-400 font-medium">Tambah Cepat Berat (Gross):</span>
          <span className="text-[10px] text-slate-500">Sentuh untuk +kg</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[+0.5, +1, +5, +10, +25, +50, +100].map((inc) => (
            <button
              key={inc}
              type="button"
              onClick={() => addWeight(inc)}
              className="px-2.5 py-1 bg-slate-800/70 hover:bg-slate-700 active:bg-slate-900 border border-slate-700/70 rounded-lg text-xs font-mono text-slate-200 hover:text-white transition cursor-pointer"
            >
              +{inc}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
