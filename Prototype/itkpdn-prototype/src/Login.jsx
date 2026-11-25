import { useState } from 'react'

// Akun demo untuk prototipe — bukan autentikasi sungguhan.
export const AKUN_DEMO = [
  { username: 'admin.bskdn', password: 'demo123', nama: 'Admin BSKDN', peran: 'Administrator' },
  { username: 'analis', password: 'demo123', nama: 'Analis Kebijakan', peran: 'Analis' },
]

const Ic = ({ d, ...p }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...p}>{d}</svg>
)
const IUser = (p) => <Ic {...p} d={<><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" /></>} />
const ILock = (p) => <Ic {...p} d={<><rect x="4.5" y="10.5" width="15" height="10.5" rx="2.5" /><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" /><path d="M12 15v2.5" /></>} />
const IEye = (p) => <Ic {...p} d={<><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>} />
const IEyeOff = (p) => <Ic {...p} d={<><path d="M10.6 5.1A10.4 10.4 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.1 4M6.6 6.6A17 17 0 0 0 2 12s3.6 7 10 7a9.6 9.6 0 0 0 5.4-1.6" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /><path d="M2 2l20 20" /></>} />
const IMasuk = (p) => <Ic {...p} d={<><circle cx="12" cy="12" r="9" /><path d="M8 12h8M13 8.5 16.5 12 13 15.5" /></>} />
const IChart = (p) => <Ic {...p} d={<><path d="M3 21h18" /><rect x="4.5" y="13" width="3" height="6" /><rect x="10.5" y="9" width="3" height="10" /><rect x="16.5" y="5" width="3" height="14" /><path d="M4 9l5-4 4 3 7-5" /></>} />
const IPin = (p) => <Ic {...p} d={<><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></>} />
const IDoc = (p) => <Ic {...p} d={<><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" /><path d="M14 3v5h5M9 13h6M9 17h6M9 9h2" /></>} />
const IInfo = (p) => <Ic {...p} d={<><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>} />

export default function Login({ onLogin }) {
  const [u, setU] = useState('')
  const [p, setP] = useState('')
  const [lihat, setLihat] = useState(false)
  const [err, setErr] = useState('')
  const [proses, setProses] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    setErr('')
    if (!u.trim() || !p) return setErr('Nama pengguna dan kata sandi wajib diisi.')
    setProses(true)
    setTimeout(() => {
      const akun = AKUN_DEMO.find((a) => a.username === u.trim() && a.password === p)
      setProses(false)
      if (!akun) return setErr('Nama pengguna atau kata sandi salah.')
      onLogin({ username: akun.username, nama: akun.nama, peran: akun.peran })
    }, 400)
  }

  return (
    <div className="login">
      <aside className="login-brand" aria-label="Identitas instansi">
        <div className="lb-photo" aria-hidden="true" />
        <svg className="lb-curve" viewBox="0 0 200 1000" preserveAspectRatio="none" aria-hidden="true">
          <path d="M120 0 C 40 300, 40 650, 150 1000 L200 1000 L200 0 Z" fill="var(--login-right)" />
          <path d="M120 0 C 40 300, 40 650, 150 1000" fill="none" stroke="url(#lbGold)" strokeWidth="7" vectorEffect="non-scaling-stroke" />
          <defs><linearGradient id="lbGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e8c46a" /><stop offset=".45" stopColor="#c9a227" stopOpacity=".15" /><stop offset=".8" stopColor="#c9a227" stopOpacity="0" /></linearGradient></defs>
        </svg>
        <div className="lb-content">
          <div className="lb-top">
            <span className="lb-logo"><img src="/logo-bskdn.svg" alt="Logo Badan Strategi Kebijakan Dalam Negeri" width="64" height="64" /></span>
            <div className="lb-orgs">
              <span className="lb-org">Badan Strategi Kebijakan Dalam Negeri</span>
              <span className="lb-sub">Kementerian Dalam Negeri Republik Indonesia</span>
            </div>
          </div>
          <div className="lb-body">
            <span className="lb-rule" aria-hidden="true" />
            <h1>Portal <span>ITKPDN</span></h1>
            <p className="lb-desc">Indeks Tata Kelola Pemerintahan Dalam Negeri: pemantauan skor, profil daerah, dan rekomendasi pembinaan dalam satu portal.</p>
            <ul className="lb-features">
              <li><IChart width="30" height="30" /><span>Pemantauan<br />Kinerja</span></li>
              <li><IPin width="30" height="30" /><span>Profil Daerah</span></li>
              <li><IDoc width="30" height="30" /><span>Rekomendasi<br />Pembinaan</span></li>
            </ul>
          </div>
          <p className="lb-tagline">Kebijakan berbasis data untuk tata kelola yang lebih baik.</p>
        </div>
      </aside>
      <main className="login-main">
        <form className="login-card" onSubmit={submit} noValidate aria-labelledby="login-title">
          <div className="lc-mobile-brand">
            <img src="/logo-bskdn.svg" alt="" width="44" height="44" />
            <div><b>Portal ITKPDN</b><span>BSKDN Kemendagri</span></div>
          </div>
          <span className="lc-badge" aria-hidden="true"><ILock width="30" height="30" strokeWidth="2.2" /></span>
          <h2 id="login-title">Masuk</h2>
          <p className="lc-hint">Gunakan akun yang terdaftar untuk mengakses portal.</p>
          {err && <div className="lc-error" role="alert" id="login-err">{err}</div>}
          <div className="field">
            <label htmlFor="u"><IUser width="18" height="18" />Nama pengguna</label>
            <div className="input-ic">
              <IUser className="in-ic" />
              <input id="u" autoComplete="username" value={u} onChange={(e) => setU(e.target.value)} autoFocus aria-invalid={!!err} aria-describedby={err ? 'login-err' : undefined} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="p"><ILock width="18" height="18" />Kata sandi</label>
            <div className="input-ic pw">
              <ILock className="in-ic" />
              <input id="p" type={lihat ? 'text' : 'password'} autoComplete="current-password" value={p} onChange={(e) => setP(e.target.value)} aria-invalid={!!err} aria-describedby={err ? 'login-err' : undefined} />
              <button type="button" className="pw-eye" onClick={() => setLihat(!lihat)} aria-label={lihat ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'} aria-pressed={lihat} aria-controls="p">{lihat ? <IEye /> : <IEyeOff />}</button>
            </div>
            <span className="pw-hint" aria-hidden="true">{lihat ? 'Sembunyikan' : 'Tampilkan'}</span>
          </div>
          <button type="submit" className="lc-submit" disabled={proses} aria-busy={proses}><IMasuk width="22" height="22" />{proses ? 'Memproses…' : 'Masuk'}</button>
          <div className="lc-demo">
            <span className="lc-demo-title"><IInfo width="16" height="16" />Akun demo (prototipe)</span>
            <div className="lc-demo-list">
              {AKUN_DEMO.map((a) => (
                <button type="button" key={a.username} className="chip" onClick={() => { setU(a.username); setP(a.password); setErr('') }}>
                  <b>{a.username}</b><span>{a.peran}</span>
                </button>
              ))}
            </div>
            <span className="lc-demo-pw">Kata sandi: <b>demo123</b></span>
          </div>
        </form>
        <p className="login-foot">© {new Date().getFullYear()} BSKDN Kemendagri · Data contoh, bukan data resmi.</p>
      </main>
    </div>
  )
}
