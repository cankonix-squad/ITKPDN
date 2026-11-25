// Data contoh (dummy) — BUKAN data resmi. Dibangkitkan deterministik agar rata-rata nasional
// mendekati hasil exercise BRD (≈62,7 pada 2026).
import { METODOLOGI_V1, semuaIndikator } from './engine.js'

export const DAERAH = [
  ['11', 'Aceh', 'Provinsi'], ['12', 'Sumatera Utara', 'Provinsi'], ['13', 'Sumatera Barat', 'Provinsi'],
  ['31', 'DKI Jakarta', 'Provinsi'], ['32', 'Jawa Barat', 'Provinsi'], ['33', 'Jawa Tengah', 'Provinsi'],
  ['34', 'DI Yogyakarta', 'Provinsi'], ['35', 'Jawa Timur', 'Provinsi'], ['51', 'Bali', 'Provinsi'],
  ['53', 'Nusa Tenggara Timur', 'Provinsi'], ['64', 'Kalimantan Timur', 'Provinsi'], ['73', 'Sulawesi Selatan', 'Provinsi'],
  ['91', 'Papua', 'Provinsi'], ['3273', 'Kota Bandung', 'Kota'], ['3374', 'Kota Semarang', 'Kota'],
  ['3578', 'Kota Surabaya', 'Kota'], ['3471', 'Kota Yogyakarta', 'Kota'], ['1371', 'Kota Padang', 'Kota'],
  ['7371', 'Kota Makassar', 'Kota'], ['5171', 'Kota Denpasar', 'Kota'], ['3201', 'Kab. Bogor', 'Kabupaten'],
  ['3301', 'Kab. Cilacap', 'Kabupaten'], ['3501', 'Kab. Pacitan', 'Kabupaten'], ['3404', 'Kab. Sleman', 'Kabupaten'],
  ['5103', 'Kab. Badung', 'Kabupaten'], ['5301', 'Kab. Sumba Barat', 'Kabupaten'], ['9101', 'Kab. Merauke', 'Kabupaten'],
  ['6401', 'Kab. Paser', 'Kabupaten'], ['1101', 'Kab. Simeulue', 'Kabupaten'], ['7301', 'Kab. Kepulauan Selayar', 'Kabupaten'],
].map(([kode, nama, jenis]) => ({ kode, nama, jenis }))

function rng(seed) { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647) }

export function buatDataContoh() {
  const r = rng(42)
  const inds = semuaIndikator(METODOLOGI_V1)
  const data = {} // data[tahun][kode_daerah][kode_indikator] = { raw, status }
  for (const tahun of [2026, 2027]) {
    data[tahun] = {}
    DAERAH.forEach((d, idx) => {
      const kapasitas = 0.40 + 0.5 * ((idx * 37) % 30) / 30 + (tahun - 2026) * 0.02
      data[tahun][d.kode] = {}
      for (const ind of inds) {
        const p = Math.min(1, Math.max(0, kapasitas + (r() - 0.5) * 0.35))
        let raw = ind.min + p * (ind.max - ind.min)
        raw = ind.max <= 5 ? Math.round(raw * 100) / 100 : Math.round(raw * 10) / 10
        // IPPD indeks baru: sebagian daerah belum dinilai → NA (BRULE-06)
        if (ind.dimensi === 'D1' && tahun === 2026 && idx % 11 === 10) raw = null
        data[tahun][d.kode][ind.kode] = raw
      }
    })
  }
  return data
}

export const templateCSV = () => {
  const head = 'kode_daerah,nama_daerah,jenis_daerah,tahun_penilaian,kode_indikator,nilai_raw,sumber_data,tanggal_cut_off,validator,keterangan'
  return head + '\n3273,Kota Bandung,Kota,2027,D3.2,4.2,e-Perda,2027-03-31,Ditjen Otda,\n3201,Kab. Bogor,Kabupaten,2027,D3.2,3.6,e-Perda,2027-03-31,Ditjen Otda,\n'
}
