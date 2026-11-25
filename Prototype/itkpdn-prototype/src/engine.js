// Scoring engine ITKPDN — logika murni tanpa UI, siap dipindah ke Spring Boot (ScoringService).
// Acuan: BRD v1.5 bab 8 (BRULE), 18.2 (struktur), 18.3 (formula & klasifikasi).

// Metodologi versi 1 (BR-005). Bobot indikator di dalam dimensi yang belum ditetapkan BRD
// diasumsikan sama rata — ditandai `asumsi: true` dan wajib dikonfirmasi di pedoman teknis.
export const METODOLOGI_V1 = {
  versi: 'v1.0-2026',
  catatan: 'Bobot indikator D1, D2, D4 diasumsikan sama rata (belum ditetapkan BRD).',
  dimensi: [
    { kode: 'D1', nama: 'Perencanaan Pembangunan', bobot: 20, indeks: 'IPPD', wali: 'Ditjen Bina Bangda', indikator: [
      { kode: 'D1.1', nama: 'Keselarasan perencanaan', bobot: 25, min: 0, max: 100, arah: 'positif', asumsi: true },
      { kode: 'D1.2', nama: 'Kepatuhan regulasi perencanaan', bobot: 25, min: 0, max: 100, arah: 'positif', asumsi: true },
      { kode: 'D1.3', nama: 'Keterisian data perencanaan SIPD', bobot: 25, min: 0, max: 100, arah: 'positif', asumsi: true },
      { kode: 'D1.4', nama: 'Partisipasi masyarakat', bobot: 25, min: 0, max: 100, arah: 'positif', asumsi: true },
    ]},
    { kode: 'D2', nama: 'Pengelolaan Keuangan Daerah', bobot: 20, indeks: 'IPKD', wali: 'Ditjen Bina Keuda / BSKDN', indikator: [
      { kode: 'D2.1', nama: 'Kesesuaian perencanaan & penganggaran', bobot: 20, min: 0, max: 100, arah: 'positif', asumsi: true },
      { kode: 'D2.2', nama: 'Alokasi belanja', bobot: 20, min: 0, max: 100, arah: 'positif', asumsi: true },
      { kode: 'D2.3', nama: 'Transparansi', bobot: 20, min: 0, max: 100, arah: 'positif', asumsi: true },
      { kode: 'D2.4', nama: 'Penyerapan anggaran', bobot: 20, min: 0, max: 100, arah: 'positif', asumsi: true },
      { kode: 'D2.5', nama: 'Kondisi keuangan', bobot: 20, min: 0, max: 100, arah: 'positif', asumsi: true },
    ]},
    { kode: 'D3', nama: 'Penatalaksanaan', bobot: 20, indeks: 'IID, IKD', wali: 'BSKDN / Ditjen Otda', indikator: [
      { kode: 'D3.1', nama: 'Inovasi daerah (IID)', bobot: 50, min: 0, max: 100, arah: 'positif' },
      { kode: 'D3.2', nama: 'Kepatuhan pembentukan perda (IKD)', bobot: 50, min: 1, max: 5, arah: 'positif' },
    ]},
    { kode: 'D4', nama: 'Pengawasan', bobot: 20, indeks: 'Indeks Pengawasan', wali: 'Itjen', indikator: [
      { kode: 'D4.1', nama: 'Evaluasi KDH/WKDH dalam PSN', bobot: 33.34, min: 0, max: 100, arah: 'positif', asumsi: true },
      { kode: 'D4.2', nama: 'Tindak lanjut hasil pemeriksaan Itjen', bobot: 33.33, min: 0, max: 100, arah: 'positif', asumsi: true },
      { kode: 'D4.3', nama: 'Kapasitas inspektorat daerah', bobot: 33.33, min: 1, max: 5, arah: 'positif', asumsi: true },
    ]},
    { kode: 'D5', nama: 'Capaian Penyelenggaraan Urusan', bobot: 20, indeks: 'EPPD', wali: 'Ditjen Otda', indikator: [
      { kode: 'D5.1', nama: 'Capaian kinerja makro', bobot: 10, min: 0, max: 4, arah: 'positif' },
      { kode: 'D5.2', nama: 'Capaian kinerja urusan pemerintahan', bobot: 90, min: 0, max: 4, arah: 'positif' },
    ]},
  ],
}

export const TARGET_RENSTRA = { 2026: 61, 2027: 64, 2028: 67, 2029: 70 }

export const KLASIFIKASI = [
  { label: 'Sangat Baik', min: 85, warna: '#1b7f4d' },
  { label: 'Baik', min: 70, warna: '#4f9d3a' },
  { label: 'Cukup', min: 55, warna: '#c99a06' },
  { label: 'Kurang', min: 40, warna: '#d9661f' },
  { label: 'Sangat Kurang', min: 0, warna: '#c0392b' },
]

export const klasifikasi = (skor) => (skor == null ? null : KLASIFIKASI.find((k) => skor >= k.min))

export const semuaIndikator = (m) => m.dimensi.flatMap((d) => d.indikator.map((i) => ({ ...i, dimensi: d.kode })))

// BRULE-03: normalisasi min-max ke 0–100, dibalik bila arah negatif. NA tetap NA (BRULE-06).
export function normalisasi(raw, ind) {
  if (raw == null || raw === '' || Number.isNaN(raw)) return null
  const v = Math.min(Math.max(raw, ind.min), ind.max)
  const s = ((v - ind.min) / (ind.max - ind.min)) * 100
  return ind.arah === 'negatif' ? 100 - s : s
}

// Di = Σ(Iij × βij); ITKPDN = Σ(Di × αi). Indikator NA dikeluarkan dan bobot sisa
// diproporsikan ulang, dengan flag `lengkap=false` agar terlihat di dashboard (BRULE-06/09).
export function hitungDaerah(nilaiRaw, m = METODOLOGI_V1) {
  let total = 0, bobotTotal = 0, lengkap = true
  const dimensi = m.dimensi.map((d) => {
    let s = 0, b = 0
    const indikator = d.indikator.map((ind) => {
      const raw = nilaiRaw[ind.kode]
      const norm = normalisasi(raw, ind)
      if (norm != null) { s += norm * ind.bobot; b += ind.bobot } else lengkap = false
      return { ...ind, raw: raw ?? null, norm }
    })
    const skor = b > 0 ? s / b : null
    if (skor != null) { total += skor * d.bobot; bobotTotal += d.bobot }
    return { kode: d.kode, nama: d.nama, bobot: d.bobot, skor, indikator }
  })
  const nilai = bobotTotal > 0 ? total / bobotTotal : null
  return { dimensi, nilai, lengkap, klas: klasifikasi(nilai) }
}

// BRULE-10: prioritas pembinaan = bobot efektif tinggi × gap besar terhadap 100.
export function prioritasPembinaan(hasil, m = METODOLOGI_V1, n = 3) {
  return hasil.dimensi.flatMap((d) => d.indikator
    .filter((i) => i.norm != null)
    .map((i) => {
      const bobotEfektif = (d.bobot / 100) * (i.bobot / 100) // kontribusi ke nilai akhir
      return { ...i, dimensiNama: d.nama, bobotEfektif, gap: 100 - i.norm, potensi: bobotEfektif * (100 - i.norm) }
    }))
    .sort((a, b) => b.potensi - a.potensi)
    .slice(0, n)
}

export const rata = (arr) => { const v = arr.filter((x) => x != null); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null }
export const fmt = (x, d = 2) => (x == null ? 'NA' : x.toLocaleString('id-ID', { minimumFractionDigits: d, maximumFractionDigits: d }))
