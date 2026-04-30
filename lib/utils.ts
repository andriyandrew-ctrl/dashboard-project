import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Fungsi bawaan template untuk menggabungkan class Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// FUNGSI BARU: Format angka dengan pemisah ribuan titik (Indonesian style)
export function formatIndonesianNumber(num: number) {
  return new Intl.NumberFormat('id-ID').format(num);
}

// FUNGSI BARU: Format Target Produksi (Ton/kTon)
export function formatTargetProduksi(val: string | number | undefined) {
  if (val === undefined || val === null || val === "" || val === "-") return "-";
  
  // Ambil angkanya saja
  const num = typeof val === 'string' ? parseFloat(val.replace(/[^0-9.-]+/g, "")) : val;
  if (isNaN(num)) return val.toString();
  
  if (num >= 1000) {
    const kTon = num / 1000;
    return `${formatIndonesianNumber(kTon)} kTon`;
  }
  return `${formatIndonesianNumber(num)} Ton`;
}

// FUNGSI BARU: Format Target Revenue (Miliar)
export function formatTargetRevenue(val: string | number | undefined) {
  if (val === undefined || val === null || val === "" || val === "-") return "-";
  
  const num = typeof val === 'string' ? parseFloat(val.replace(/[^0-9.-]+/g, "")) : val;
  if (isNaN(num)) return val.toString();
  
  return `${formatIndonesianNumber(num)} Miliar`;
}