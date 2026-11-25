import { useState } from 'react'
import { METODOLOGI_V1, TARGET_RENSTRA, KLASIFIKASI, hitungDaerah, prioritasPembinaan, rata, fmt } from './engine.js'
import { DAERAH } from './data.js'

const TAHUN_RENSTRA = [2026, 2027, 2028, 2029]
const STATUS_TL = ['Belum', 'Dijadwalkan', 'Berjalan', 'Selesai']
const klasOf = (v) => (v == null ? null : KLASIFIKASI.find((k) => v >= k.min))
const Klas = ({ k }) => k ? <span className="klas" style={{ background: k.warna }}>{k.label}</span> : <span className="klas na">NA</span>
const sign = (x) => (x >= 0 ? '+' : '') + fmt(x)

export default function Ringkasan({ data, tahun, hasil, status, log, setHal, setPilihDaerah, tindakLanjut, setTindakLanjut }) {
  const [jenis, setJenis] = useState('Provinsi')
  const nas = rata(DAERAH.map((d) => hasil[d.kode].nilai))
  const target = TARGET_RENSTRA[tahun]
  const final = status[tahun] === 'Final'
  const dim = METODOLOGI_V1.dimensi.map((dm, i) => ({ ...dm, skor: rata(DAERAH.map((d) => hasil[d.kode].dimensi[i].skor)) })).sort((a, b) => a.skor - b.skor)
  const ew = DAERAH.map((d) => ({ ...d, h: hasil[d.kode] })).filter((d) => d.h.nilai != null && d.h.nilai < 55).sort((a, b) => a.h.nilai - b.h.nilai)
  const selesai = ew.filter((d) => tindakLanjut[`${tahun}|${d.kode}`] === 'Selesai').length

  const tren = TAHUN_RENSTRA.map((t) => ({ t, v: data[t] ? rata(DAERAH.map((d) => hitungDaerah(data[t][d.kode]).nilai)) : null, target: TARGET_RENSTRA[t], final: status[t] === 'Final' }))

  const prev = data[tahun - 1]
  const movers = prev ? DAERAH.map((d) => { const a = hitungDaerah(prev[d.kode]).nilai, b = hasil[d.kode].nilai; return { ...d, delta: a != null && b != null ? b - a : null, b } }).filter((d) => d.delta != null).sort((x, y) => y.delta - x.delta) : null

  const gapTarget = DAERAH.map((d) => ({ ...d, b: hasil[d.kode].nilai, delta: hasil[d.kode].nilai == null ? null : hasil[d.kode].nilai - target })).filter((d) => d.delta != null).sort((a, b) => b.delta - a.delta)
  const perJenis = DAERAH.filter((d) => d.jenis === jenis).map((d) => ({ ...d, h: hasil[d.kode] })).filter((d) => d.h.nilai != null).sort((a, b) => b.h.nilai - a.h.nilai)
  const buka = (kode) => { setPilihDaerah(kode); setHal('daerah') }
  const ubahTL = (d, v) => { setTindakLanjut((s) => ({ ...s, [`${tahun}|${d.kode}`]: v })); log('Tindak lanjut pembinaan', `${d.nama} ${tahun}: ${v}`) }

  return <div className="exec">
    {!final && <div className="note" role="note">Angka {tahun} masih <b>sementara</b> dan belum boleh dikutip untuk pelaporan IKU.</div>}

    <div className="kpis">
      <div className="kpi"><span>Nilai nasional</span><b>{fmt(nas)}</b><Klas k={klasOf(nas)} /></div>
      <div className="kpi"><span>Gap vs target {tahun}</span><b className={nas - target >= 0 ? 'up' : 'down'}>{sign(nas - target)}</b><em>Target {target}</em></div>
      <div className="kpi"><span>Early warning</span><b>{ew.length}</b><em>daerah nilai &lt; 55</em></div>
      <div className="kpi"><span>Tindak lanjut selesai</span><b>{selesai}/{ew.length}</b><div className="mini-bar" role="img" aria-label={`${selesai} dari ${ew.length} selesai`}><div style={{ width: `${ew.length ? selesai / ew.length * 100 : 0}%` }} /></div></div>
    </div>

    <div className="grid2">
      <section><h2>Tren nilai nasional vs target Renstra</h2><TrenChart rows={tren} /></section>
      <section><h2>Dimensi: terlemah ke terkuat</h2>
        {dim.map((d, i) => <div className="lrow" key={d.kode}><span>{d.kode} {d.nama}{i === 0 && <em className="tag-weak">terlemah</em>}</span>
          <div className="bar"><div style={{ width: `${d.skor}%`, background: 'var(--royal)' }} /></div><b>{fmt(d.skor)}</b></div>)}
        <p className="muted small-note">Fokus kebijakan pada dimensi terlemah memberi dampak terbesar ke nilai nasional (bobot tiap dimensi sama, 20%).</p>
      </section>
    </div>

    <div className="grid2">
      {movers ? <section><h2>Pergerakan terbesar vs {tahun - 1}</h2>
        <div className="movers">
          <div><h3>Naik</h3>{movers.slice(0, 5).map((d) => <MoverRow key={d.kode} d={d} onClick={() => buka(d.kode)} />)}</div>
          <div><h3>Turun</h3>{movers.slice(-5).reverse().map((d) => <MoverRow key={d.kode} d={d} onClick={() => buka(d.kode)} />)}</div>
        </div>
      </section> : <section><h2>Jarak ke target Renstra {tahun} ({target})</h2>
        <div className="movers">
          <div><h3>Paling jauh di atas</h3>{gapTarget.slice(0, 5).map((d) => <MoverRow key={d.kode} d={d} onClick={() => buka(d.kode)} />)}</div>
          <div><h3>Paling jauh di bawah</h3>{gapTarget.slice(-5).reverse().map((d) => <MoverRow key={d.kode} d={d} onClick={() => buka(d.kode)} />)}</div>
        </div>
        <p className="muted small-note">{tahun} adalah tahun dasar, belum ada data {tahun - 1}. Pergerakan antartahun tampil mulai {tahun + 1}. Di atas target: {gapTarget.filter((d) => d.delta >= 0).length} dari {gapTarget.length} daerah.</p>
      </section>}
      <section><h2>5 teratas & terbawah per jenis daerah</h2>
        <div className="seg" role="tablist" aria-label="Jenis daerah">
          {['Provinsi', 'Kabupaten', 'Kota'].map((j) => <button key={j} role="tab" aria-selected={jenis === j} className={jenis === j ? 'on' : ''} onClick={() => setJenis(j)}>{j}</button>)}
        </div>
        <div className="movers">
          <div><h3>Teratas</h3>{perJenis.slice(0, 5).map((d, i) => <RankRow key={d.kode} n={i + 1} d={d} onClick={() => buka(d.kode)} />)}</div>
          <div><h3>Terbawah</h3>{perJenis.slice(-5).reverse().map((d, i) => <RankRow key={d.kode} n={perJenis.length - i} d={d} onClick={() => buka(d.kode)} />)}</div>
        </div>
        {perJenis.length < 10 && <p className="muted small-note">Hanya {perJenis.length} {jenis.toLowerCase()} dalam data, sehingga daftar teratas dan terbawah bisa beririsan.</p>}
      </section>
    </div>

    <section><h2>Tindak lanjut pembinaan daerah early warning</h2>
      {ew.length === 0 ? <p className="muted">Tidak ada daerah di bawah 55.</p> :
        <table><thead><tr><th>Daerah</th><th>Nilai</th><th>Klasifikasi</th><th>Indikator prioritas</th><th>Status tindak lanjut</th></tr></thead><tbody>
          {ew.map((d) => { const p = prioritasPembinaan(d.h)[0]; const st = tindakLanjut[`${tahun}|${d.kode}`] ?? 'Belum'; return <tr key={d.kode}>
            <td><button className="link" onClick={() => buka(d.kode)}>{d.nama}</button></td><td>{fmt(d.h.nilai)}</td><td><Klas k={d.h.klas} /></td>
            <td>{p ? p.nama : '—'}</td>
            <td><select aria-label={`Status tindak lanjut ${d.nama}`} className={'tl tl-' + st.toLowerCase()} value={st} onChange={(e) => ubahTL(d, e.target.value)}>{STATUS_TL.map((s) => <option key={s}>{s}</option>)}</select></td></tr> })}
        </tbody></table>}
      <p className="muted small-note">Status diisi oleh tim pembina dan tercatat di Audit Trail.</p>
    </section>
  </div>
}

function MoverRow({ d, onClick }) {
  return <button className="rrow" onClick={onClick}><span>{d.nama}<small>{d.jenis}</small></span><b className={d.delta >= 0 ? 'up' : 'down'}>{d.delta >= 0 ? '▲' : '▼'} {sign(d.delta)}</b></button>
}
function RankRow({ n, d, onClick }) {
  return <button className="rrow" onClick={onClick}><span><i>{n}</i>{d.nama}</span><b>{fmt(d.h.nilai)}</b></button>
}

function TrenChart({ rows }) {
  const [hover, setHover] = useState(null)
  const W = 520, H = 300, L = 36, R = 28, T = 28, B = 34
  const vals = rows.flatMap((r) => [r.v, r.target]).filter((x) => x != null)
  const lo = Math.floor((Math.min(...vals) - 3) / 5) * 5, hi = Math.ceil((Math.max(...vals) + 3) / 5) * 5
  const x = (i) => L + 28 + i * (W - L - R - 56) / (rows.length - 1)
  const y = (v) => T + (hi - v) / (hi - lo) * (H - T - B)
  const ticks = []; for (let v = lo; v <= hi; v += 5) ticks.push(v)
  const ada = rows.map((r, i) => ({ ...r, i })).filter((r) => r.v != null)
  const path = (pts, k) => pts.map((p, j) => `${j ? 'L' : 'M'}${x(p.i)},${y(p[k])}`).join(' ')
  const h = hover != null ? rows[hover] : null
  return <div className="chart">
    <div className="legend" aria-hidden="true"><span><i className="sw-nilai" />Nilai nasional</span><span><i className="sw-target" />Target Renstra</span><span><i className="sw-temp" />Sementara</span></div>
    <div className="chart-box">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={'Tren nilai nasional: ' + rows.map((r) => `${r.t} ${r.v != null ? fmt(r.v) : 'belum ada'} (target ${r.target})`).join('; ')}>
        {ticks.map((v) => <g key={v}><line x1={L} x2={W - R} y1={y(v)} y2={y(v)} className="grid" /><text x={L - 8} y={y(v) + 4} className="axis" textAnchor="end">{v}</text></g>)}
        {rows.map((r, i) => <text key={r.t} x={x(i)} y={H - 10} className="axis" textAnchor="middle">{r.t}</text>)}
        <path d={path(rows.map((r, i) => ({ ...r, i })), 'target')} className="ln-target" />
        {rows.map((r, i) => <text key={'t' + r.t} x={x(i)} y={y(r.target) + 18} className="lbl-target" textAnchor="middle">{r.target}</text>)}
        {ada.length > 1 && <path d={path(ada, 'v')} className="ln-nilai" />}
        {ada.map((r) => <circle key={'p' + r.t} cx={x(r.i)} cy={y(r.v)} r="5" className={r.final ? 'pt-final' : 'pt-temp'} />)}
        {ada.map((r) => <text key={'v' + r.t} x={x(r.i)} y={y(r.v) - 12} className="lbl-nilai" textAnchor="middle">{fmt(r.v)}</text>)}
        {hover != null && <line x1={x(hover)} x2={x(hover)} y1={T} y2={H - B} className="xhair" />}
        {rows.map((r, i) => <rect key={'h' + r.t} x={x(i) - (W - L - R) / (rows.length - 1) / 2} y={T} width={(W - L - R) / (rows.length - 1)} height={H - T - B} fill="transparent" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} />)}
      </svg>
      {h && <div className="tip" style={{ left: `${x(hover) / W * 100}%` }}>
        <b>{h.t}</b>{h.v != null ? <> · {h.final ? 'final' : 'sementara'}</> : ''}
        <span>Nilai: {h.v != null ? fmt(h.v) : 'belum ada'}</span><span>Target: {h.target}</span>
        {h.v != null && <span className={h.v - h.target >= 0 ? 'up' : 'down'}>Gap {sign(h.v - h.target)}</span>}
      </div>}
    </div>
  </div>
}
