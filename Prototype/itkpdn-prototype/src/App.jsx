import { useMemo, useState } from 'react'
import { METODOLOGI_V1, TARGET_RENSTRA, KLASIFIKASI, hitungDaerah, prioritasPembinaan, semuaIndikator, normalisasi, rata, fmt } from './engine.js'
import { DAERAH, buatDataContoh, templateCSV } from './data.js'
import Ringkasan from './Ringkasan.jsx'
import { IconRingkasan, IconNasional, IconDaerah, IconUpload, IconSimulasi, IconMetodologi, IconAudit, IconKeluar } from './icons.jsx'

const IKON = { ringkasan: IconRingkasan, nasional: IconNasional, daerah: IconDaerah, upload: IconUpload, simulasi: IconSimulasi, metodologi: IconMetodologi, audit: IconAudit }
const inisial = (n) => n.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase()

const MENU = [
  ['ringkasan', 'Ringkasan Eksekutif'], ['nasional', 'Dashboard Nasional'], ['daerah', 'Profil Daerah'], ['upload', 'Upload & Validasi'],
  ['simulasi', 'Simulasi Target'], ['metodologi', 'Metodologi'], ['audit', 'Audit Trail'],
]

export default function App({ user, onLogout }) {
  const [hal, setHal] = useState('ringkasan')
  const [data, setData] = useState(buatDataContoh)
  const [tahun, setTahun] = useState(2026)
  const [status, setStatus] = useState({ 2026: 'Final', 2027: 'Sementara' })
  const [audit, setAudit] = useState([{ t: new Date().toLocaleString('id-ID'), user: 'sistem', aksi: 'Scoring run', detail: `Metodologi ${METODOLOGI_V1.versi}, ${DAERAH.length} daerah` }])
  const [pilihDaerah, setPilihDaerah] = useState(DAERAH[0].kode)
  const [tindakLanjut, setTindakLanjut] = useState({})
  const log = (aksi, detail) => setAudit((a) => [{ t: new Date().toLocaleString('id-ID'), user: user.username, aksi, detail }, ...a])

  const hasil = useMemo(() => Object.fromEntries(DAERAH.map((d) => [d.kode, hitungDaerah(data[tahun][d.kode])])), [data, tahun])
  const ctx = { data, setData, tahun, hasil, status, setStatus, log, audit, pilihDaerah, setPilihDaerah, setHal }

  return (
    <div className="app">
      <aside className="side">
        <div className="brand"><span className="brand-logo"><img src="/logo-bskdn.svg" alt="Logo BSKDN" width="40" height="40" /></span><div>Portal <span>ITKPDN</span><small>BSKDN Kemendagri</small></div></div>
        <nav className="nav" aria-label="Menu utama">
          <span className="nav-label">Menu</span>
          {MENU.map(([k, l]) => { const I = IKON[k]; return <button key={k} className={hal === k ? 'on' : ''} aria-current={hal === k ? 'page' : undefined} onClick={() => setHal(k)}><I />{l}</button> })}
        </nav>
        <div className="side-foot">
          <div className="who"><span className="avatar" aria-hidden="true">{inisial(user.nama)}</span><div><b>{user.nama}</b><span>{user.peran}</span></div></div>
          <button className="logout" onClick={onLogout}><IconKeluar size={18} />Keluar</button>
          <p>Data contoh, bukan data resmi.</p>
        </div>
      </aside>
      <main className="content">
        <header className="topbar">
          <div>
            <span className="crumb">Portal ITKPDN / {MENU.find((m) => m[0] === hal)[1]}</span>
            <h1>{MENU.find((m) => m[0] === hal)[1]}</h1>
          </div>
          <div className="row topbar-tools">
            <label className="year"><span>Tahun</span>
              <select value={tahun} onChange={(e) => setTahun(+e.target.value)}>
                {Object.keys(data).map((t) => <option key={t}>{t}</option>)}
              </select>
            </label>
            <span className={'badge ' + (status[tahun] === 'Final' ? 'final' : 'temp')}>{status[tahun] === 'Final' ? 'FINAL' : 'SEMENTARA'}</span>
          </div>
        </header>
        {hal === 'ringkasan' && <Ringkasan {...ctx} tindakLanjut={tindakLanjut} setTindakLanjut={setTindakLanjut} />}
        {hal === 'nasional' && <Nasional {...ctx} />}
        {hal === 'daerah' && <Daerah {...ctx} />}
        {hal === 'upload' && <Upload {...ctx} />}
        {hal === 'simulasi' && <Simulasi {...ctx} />}
        {hal === 'metodologi' && <Metodologi />}
        {hal === 'audit' && <Audit {...ctx} />}
      </main>
    </div>
  )
}

const Klas = ({ k }) => k ? <span className="klas" style={{ background: k.warna }}>{k.label}</span> : <span className="klas na">NA</span>

function Bar({ v, max = 100, color = 'var(--accent)', mark }) {
  return <div className="bar"><div style={{ width: `${Math.max(0, (v ?? 0) / max * 100)}%`, background: color }} />{mark != null && <i style={{ left: `${mark}%` }} />}</div>
}

function Nasional({ hasil, tahun, data, status, setStatus, log, setHal, setPilihDaerah }) {
  const nilai = DAERAH.map((d) => hasil[d.kode].nilai)
  const nas = rata(nilai)
  const target = TARGET_RENSTRA[tahun]
  const tidakLengkap = DAERAH.filter((d) => !hasil[d.kode].lengkap).length
  const distribusi = KLASIFIKASI.map((k) => ({ ...k, n: DAERAH.filter((d) => hasil[d.kode].klas?.label === k.label).length }))
  const dimNas = METODOLOGI_V1.dimensi.map((dm, i) => ({ ...dm, skor: rata(DAERAH.map((d) => hasil[d.kode].dimensi[i].skor)) }))
  const tren = Object.keys(data).map((t) => ({ t, v: rata(DAERAH.map((d) => hitungDaerah(data[t][d.kode]).nilai)), target: TARGET_RENSTRA[t] }))
  const ew = DAERAH.map((d) => ({ ...d, h: hasil[d.kode] })).filter((d) => d.h.nilai != null && d.h.nilai < 55).sort((a, b) => a.h.nilai - b.h.nilai)
  const finalisasi = () => { setStatus((s) => ({ ...s, [tahun]: 'Final' })); log('Finalisasi', `Hasil ${tahun} ditetapkan final (berita acara BA-${tahun}-01)`) }

  return <>
    {status[tahun] !== 'Final' && <div className="note">Nilai {tahun} masih <b>sementara</b> dan belum boleh dipakai untuk pelaporan IKU (BRULE-09). <button onClick={finalisasi}>Tetapkan final</button></div>}
    <div className="kpis">
      <div className="kpi"><span>Rata-rata nasional</span><b>{fmt(nas)}</b><Klas k={KLASIFIKASI.find((k) => nas >= k.min)} /></div>
      <div className="kpi"><span>Target Renstra {tahun}</span><b>{fmt(target, 0)}</b><em className={nas - target >= 0 ? 'up' : 'down'}>Gap {nas - target >= 0 ? '+' : ''}{fmt(nas - target)}</em></div>
      <div className="kpi"><span>Daerah dinilai</span><b>{DAERAH.length}</b><em>{tidakLengkap} dengan data NA</em></div>
      <div className="kpi"><span>Early warning</span><b>{ew.length}</b><em>nilai di bawah 55</em></div>
    </div>
    <div className="grid2">
      <section><h2>Skor per dimensi (nasional)</h2>
        {dimNas.map((d) => <div className="lrow" key={d.kode}><span>{d.kode} {d.nama}</span><Bar v={d.skor} /><b>{fmt(d.skor)}</b></div>)}
      </section>
      <section><h2>Distribusi klasifikasi</h2>
        {distribusi.map((k) => <div className="lrow" key={k.label}><span>{k.label}</span><Bar v={k.n} max={DAERAH.length} color={k.warna} /><b>{k.n}</b></div>)}
      </section>
      <section><h2>Tren vs target Renstra</h2>
        <table><thead><tr><th>Tahun</th><th>Nilai</th><th>Target</th><th>Gap</th></tr></thead><tbody>
          {[2026, 2027, 2028, 2029].map((t) => { const r = tren.find((x) => +x.t === t); return <tr key={t}><td>{t}{r && status[t] !== 'Final' && <span className="tag-temp">sementara</span>}</td><td>{r ? fmt(r.v) : '—'}</td><td>{TARGET_RENSTRA[t]}</td><td className={r ? (r.v - TARGET_RENSTRA[t] >= 0 ? 'up' : 'down') : ''}>{r ? fmt(r.v - TARGET_RENSTRA[t]) : '—'}</td></tr> })}
        </tbody></table>
      </section>
      <section><h2>Early warning (nilai &lt; 55)</h2>
        {ew.length === 0 ? <p className="muted">Tidak ada.</p> : <table><tbody>{ew.map((d) => <tr key={d.kode} className="click" onClick={() => { setPilihDaerah(d.kode); setHal('daerah') }}><td>{d.nama}</td><td>{fmt(d.h.nilai)}</td><td><Klas k={d.h.klas} /></td></tr>)}</tbody></table>}
      </section>
    </div>
    <section><h2>Peringkat daerah {tahun}</h2>
      <table><thead><tr><th>#</th><th>Daerah</th><th>Jenis</th>{METODOLOGI_V1.dimensi.map((d) => <th key={d.kode}>{d.kode}</th>)}<th>ITKPDN</th><th>Klasifikasi</th></tr></thead><tbody>
        {DAERAH.map((d) => ({ ...d, h: hasil[d.kode] })).sort((a, b) => (b.h.nilai ?? -1) - (a.h.nilai ?? -1)).map((d, i) =>
          <tr key={d.kode} className="click" onClick={() => { setPilihDaerah(d.kode); setHal('daerah') }}>
            <td>{i + 1}</td><td>{d.nama}{!d.h.lengkap && <sup title="Ada indikator NA"> NA</sup>}</td><td>{d.jenis}</td>
            {d.h.dimensi.map((x) => <td key={x.kode}>{fmt(x.skor, 1)}</td>)}<td><b>{fmt(d.h.nilai)}</b></td><td><Klas k={d.h.klas} /></td></tr>)}
      </tbody></table>
    </section>
  </>
}

function Daerah({ hasil, pilihDaerah, setPilihDaerah, tahun, status, log }) {
  const d = DAERAH.find((x) => x.kode === pilihDaerah)
  const h = hasil[pilihDaerah]
  const [buka, setBuka] = useState('D1')
  const [sanggah, setSanggah] = useState([])
  const [form, setForm] = useState({ ind: 'D1.1', alasan: '' })
  const prio = prioritasPembinaan(h)
  const ajukan = () => {
    if (!form.alasan.trim()) return
    setSanggah((s) => [...s, { ...form, status: 'Diajukan' }]); log('Sanggah diajukan', `${d.nama} — ${form.ind}: ${form.alasan}`); setForm({ ...form, alasan: '' })
  }
  return <>
    <div className="row"><select value={pilihDaerah} onChange={(e) => setPilihDaerah(e.target.value)}>{DAERAH.map((x) => <option key={x.kode} value={x.kode}>{x.nama}</option>)}</select>
      <button onClick={() => { log('Export laporan', `Profil daerah ${d.nama} ${tahun} (PDF)`); window.print() }}>Export profil (PDF)</button></div>
    <div className="kpis">
      <div className="kpi"><span>Nilai ITKPDN {tahun}</span><b>{fmt(h.nilai)}</b><Klas k={h.klas} /></div>
      <div className="kpi"><span>Status data</span><b style={{ fontSize: 20 }}>{status[tahun]}</b><em>{h.lengkap ? 'Data lengkap' : 'Ada indikator NA, bobot diproporsikan ulang'}</em></div>
      <div className="kpi"><span>Jenis daerah</span><b style={{ fontSize: 20 }}>{d.jenis}</b><em>Kode {d.kode}</em></div>
    </div>
    <div className="grid2">
      <section><h2>Drill-down: dimensi → indikator → nilai raw</h2>
        {h.dimensi.map((dm) => <div key={dm.kode} className="drill">
          <div className="lrow click" onClick={() => setBuka(buka === dm.kode ? null : dm.kode)}><span>{buka === dm.kode ? '▾' : '▸'} {dm.kode} {dm.nama} <small>(bobot {dm.bobot})</small></span><Bar v={dm.skor} /><b>{fmt(dm.skor)}</b></div>
          {buka === dm.kode && <table className="sub"><thead><tr><th>Indikator</th><th>Bobot</th><th>Skala</th><th>Raw</th><th>Normalisasi</th></tr></thead><tbody>
            {dm.indikator.map((i) => <tr key={i.kode}><td>{i.kode} {i.nama}</td><td>{i.bobot}</td><td>{i.min}–{i.max}</td><td>{i.raw ?? 'NA'}</td><td>{fmt(i.norm)}</td></tr>)}</tbody></table>}
        </div>)}
      </section>
      <section><h2>Rekomendasi pembinaan</h2>
        <p className="muted">Indikator dengan kombinasi bobot efektif tinggi dan gap besar (BRULE-10). Draf AI dan penyempurnaan pakar menyusul di Fase 3.</p>
        <ol className="rek">{prio.map((p) => <li key={p.kode}><b>{p.nama}</b> ({p.dimensiNama})<br />
          Skor {fmt(p.norm)}, gap {fmt(p.gap)}. Menaikkan indikator ini ke 100 menambah nilai akhir sampai <b>+{fmt(p.potensi)}</b> poin.</li>)}</ol>
        <p><b>Arah tindak lanjut:</b> {h.nilai >= 70 ? 'Kandidat insentif.' : 'Pendampingan prioritas pada indikator di atas.'}</p>
        <h2 style={{ marginTop: 24 }}>Klarifikasi / sanggah</h2>
        <div className="row"><select value={form.ind} onChange={(e) => setForm({ ...form, ind: e.target.value })}>{semuaIndikator(METODOLOGI_V1).map((i) => <option key={i.kode} value={i.kode}>{i.kode} {i.nama}</option>)}</select></div>
        <textarea placeholder="Alasan dan rujukan bukti pendukung" value={form.alasan} onChange={(e) => setForm({ ...form, alasan: e.target.value })} disabled={status[tahun] === 'Final'} />
        <button onClick={ajukan} disabled={status[tahun] === 'Final'}>Ajukan sanggah</button>
        {status[tahun] === 'Final' && <p className="muted">Masa sanggah {tahun} sudah ditutup (BRULE-08).</p>}
        {sanggah.map((s, i) => <div key={i} className="note small">{s.ind}: {s.alasan} — <b>{s.status}</b></div>)}
      </section>
    </div>
  </>
}

function parseCSV(text) {
  const [head, ...rows] = text.trim().split(/\r?\n/)
  const cols = head.split(',').map((c) => c.trim())
  return { cols, rows: rows.filter(Boolean).map((r) => Object.fromEntries(r.split(',').map((v, i) => [cols[i], v.trim()]))) }
}

function Upload({ data, setData, tahun, status, log }) {
  const [hasilVal, setHasilVal] = useState(null)
  const inds = Object.fromEntries(semuaIndikator(METODOLOGI_V1).map((i) => [i.kode, i]))
  const kodeDaerah = new Set(DAERAH.map((d) => d.kode))
  const WAJIB = ['kode_daerah', 'tahun_penilaian', 'kode_indikator', 'nilai_raw', 'sumber_data', 'tanggal_cut_off', 'validator']

  const unduhTemplate = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([templateCSV()], { type: 'text/csv' })); a.download = 'template_itkpdn.csv'; a.click() }

  const proses = async (file) => {
    const { cols, rows } = parseCSV(await file.text())
    const hilang = WAJIB.filter((c) => !cols.includes(c))
    if (hilang.length) { setHasilVal({ file: file.name, tolak: `Struktur file salah, kolom wajib tidak ada: ${hilang.join(', ')}` }); log('Upload ditolak', file.name); return }
    const seen = new Set()
    const baris = rows.map((r, i) => {
      const err = [], warn = []
      const ind = inds[r.kode_indikator]
      if (!kodeDaerah.has(r.kode_daerah)) err.push('Kode daerah tidak ada di master data')
      if (!ind) err.push('Kode indikator tidak dikenal')
      if (!data[r.tahun_penilaian]) err.push(`Tahun ${r.tahun_penilaian} belum dibuka`)
      else if (status[r.tahun_penilaian] === 'Final') err.push('Tahun sudah final, perlu koreksi resmi')
      const v = r.nilai_raw === '' ? null : Number(r.nilai_raw)
      if (v != null && Number.isNaN(v)) err.push('Nilai bukan angka')
      if (ind && v != null && (v < ind.min || v > ind.max)) err.push(`Di luar rentang ${ind.min}–${ind.max}`)
      for (const c of WAJIB) if (c !== 'nilai_raw' && !r[c]) err.push(`Kolom ${c} kosong`)
      const key = `${r.kode_daerah}|${r.tahun_penilaian}|${r.kode_indikator}`
      if (seen.has(key)) err.push('Duplikat dalam file'); seen.add(key)
      const lama = data[r.tahun_penilaian]?.[r.kode_daerah]?.[r.kode_indikator]
      if (ind && v != null && lama != null && Math.abs(normalisasi(v, ind) - normalisasi(lama, ind)) > 25) warn.push(`Anomali: berubah ekstrem dari ${lama}`)
      if (v == null) warn.push('Nilai kosong, dicatat NA')
      return { no: i + 2, r, v, lama, err, warn }
    })
    setHasilVal({ file: file.name, baris })
    log('Upload data', `${file.name}: ${baris.length} baris, ${baris.filter((b) => b.err.length).length} error`)
  }

  const terapkan = () => {
    const ok = hasilVal.baris.filter((b) => !b.err.length)
    setData((d) => { const n = structuredClone(d); ok.forEach((b) => { n[b.r.tahun_penilaian][b.r.kode_daerah][b.r.kode_indikator] = b.v }); return n })
    ok.forEach((b) => log('Perubahan data', `${b.r.kode_daerah} ${b.r.kode_indikator}: ${b.lama ?? 'NA'} → ${b.v ?? 'NA'} (validator ${b.r.validator})`))
    log('Scoring run', `Scoring ulang otomatis setelah ${ok.length} baris tervalidasi`)
    setHasilVal({ ...hasilVal, diterapkan: ok.length })
  }

  return <>
    <section>
      <h2>Unggah data indeks penyusun (CSV)</h2>
      <p className="muted">Kanal transisi untuk UKE I yang belum siap API (BR-007). Sistem memeriksa format, kode daerah, rentang, duplikasi, kelengkapan, dan anomali.</p>
      <div className="row"><button onClick={unduhTemplate}>Unduh template</button><input type="file" accept=".csv" onChange={(e) => e.target.files[0] && proses(e.target.files[0])} /></div>
    </section>
    {hasilVal?.tolak && <div className="note err">{hasilVal.tolak}</div>}
    {hasilVal?.baris && <section>
      <h2>Hasil validasi: {hasilVal.file}</h2>
      <p>{hasilVal.baris.filter((b) => !b.err.length).length} valid · {hasilVal.baris.filter((b) => b.err.length).length} ditolak · {hasilVal.baris.filter((b) => b.warn.length).length} perlu perhatian</p>
      <table><thead><tr><th>Baris</th><th>Daerah</th><th>Indikator</th><th>Lama</th><th>Baru</th><th>Status</th><th>Catatan</th></tr></thead><tbody>
        {hasilVal.baris.map((b) => <tr key={b.no}><td>{b.no}</td><td>{b.r.kode_daerah}</td><td>{b.r.kode_indikator}</td><td>{b.lama ?? 'NA'}</td><td>{b.v ?? 'NA'}</td>
          <td>{b.err.length ? <span className="klas" style={{ background: '#c0392b' }}>Rejected</span> : <span className="klas" style={{ background: '#1b7f4d' }}>Validated</span>}</td>
          <td>{[...b.err, ...b.warn].join('; ')}</td></tr>)}</tbody></table>
      {hasilVal.diterapkan != null ? <div className="note">{hasilVal.diterapkan} baris diterapkan dan nilai sudah dihitung ulang.</div>
        : <button onClick={terapkan} disabled={!hasilVal.baris.some((b) => !b.err.length)}>Terapkan baris valid ke staging</button>}
    </section>}
  </>
}

function Simulasi({ hasil, tahun }) {
  const [naik, setNaik] = useState(Object.fromEntries(METODOLOGI_V1.dimensi.map((d) => [d.kode, 0])))
  const base = rata(DAERAH.map((d) => hasil[d.kode].nilai))
  const sim = rata(DAERAH.map((d) => { const h = hasil[d.kode]; return h.nilai == null ? null : h.dimensi.reduce((s, x) => s + Math.min(100, (x.skor ?? 0) + naik[x.kode]) * x.bobot / 100, 0) }))
  return <section>
    <h2>Simulasi kenaikan skor dimensi (rata-rata semua daerah, {tahun})</h2>
    {METODOLOGI_V1.dimensi.map((d) => <div className="lrow" key={d.kode}><span>{d.kode} {d.nama}</span>
      <input type="range" min="0" max="20" step="0.5" value={naik[d.kode]} onChange={(e) => setNaik({ ...naik, [d.kode]: +e.target.value })} /><b>+{naik[d.kode]}</b></div>)}
    <div className="kpis">
      <div className="kpi"><span>Nilai saat ini</span><b>{fmt(base)}</b></div>
      <div className="kpi"><span>Nilai simulasi</span><b>{fmt(sim)}</b><em className="up">+{fmt(sim - base)}</em></div>
      {[2028, 2029].map((t) => <div className="kpi" key={t}><span>Target {t}</span><b>{TARGET_RENSTRA[t]}</b><em className={sim >= TARGET_RENSTRA[t] ? 'up' : 'down'}>{sim >= TARGET_RENSTRA[t] ? 'Tercapai' : `Kurang ${fmt(TARGET_RENSTRA[t] - sim)}`}</em></div>)}
    </div>
  </section>
}

function Metodologi() {
  return <section>
    <h2>Metodologi {METODOLOGI_V1.versi}</h2>
    <p>ITKPDN = Σ(Dᵢ × αᵢ), dengan Dᵢ = Σ(Iᵢⱼ × βᵢⱼ). Semua nilai dinormalisasi min-max ke 0–100 (dibalik untuk arah negatif). Indikator kosong dicatat NA, bukan 0.</p>
    <div className="note">{METODOLOGI_V1.catatan}</div>
    <table><thead><tr><th>Kode</th><th>Dimensi / Indikator</th><th>Bobot</th><th>Skala asal</th><th>Arah</th><th>Sumber / Wali data</th></tr></thead><tbody>
      {METODOLOGI_V1.dimensi.flatMap((d) => [
        <tr key={d.kode} className="dim"><td>{d.kode}</td><td>{d.nama}</td><td>{d.bobot}</td><td></td><td></td><td>{d.indeks} — {d.wali}</td></tr>,
        ...d.indikator.map((i) => <tr key={i.kode}><td>{i.kode}</td><td>{i.nama}{i.asumsi && <sup title="Bobot asumsi"> *</sup>}</td><td>{i.bobot}</td><td>{i.min}–{i.max}</td><td>{i.arah}</td><td></td></tr>)])}
    </tbody></table>
    <h2 style={{ marginTop: 24 }}>Klasifikasi</h2>
    <div className="row">{KLASIFIKASI.map((k) => <span key={k.label} className="klas" style={{ background: k.warna }}>{k.label} ≥ {k.min}</span>)}</div>
  </section>
}

function Audit({ audit }) {
  return <section><h2>Audit trail (hanya baca)</h2>
    <table><thead><tr><th>Waktu</th><th>Pengguna</th><th>Aktivitas</th><th>Detail</th></tr></thead><tbody>
      {audit.map((a, i) => <tr key={i}><td>{a.t}</td><td>{a.user}</td><td>{a.aksi}</td><td>{a.detail}</td></tr>)}</tbody></table></section>
}
