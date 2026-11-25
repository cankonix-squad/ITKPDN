const Ic = ({ d, size = 20, ...p }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...p}>{d}</svg>
)
export const IconNasional = (p) => <Ic {...p} d={<><path d="M3 21h18" /><rect x="4.5" y="13" width="3" height="6" /><rect x="10.5" y="9" width="3" height="10" /><rect x="16.5" y="5" width="3" height="14" /></>} />
export const IconDaerah = (p) => <Ic {...p} d={<><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></>} />
export const IconUpload = (p) => <Ic {...p} d={<><path d="M12 15V4M7.5 8.5 12 4l4.5 4.5" /><path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" /></>} />
export const IconSimulasi = (p) => <Ic {...p} d={<><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" /><circle cx="16" cy="6" r="2" /><circle cx="10" cy="12" r="2" /><circle cx="18" cy="18" r="2" /></>} />
export const IconMetodologi = (p) => <Ic {...p} d={<><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5Z" /><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" /><path d="M9 8h7M9 12h5" /></>} />
export const IconAudit = (p) => <Ic {...p} d={<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>} />
export const IconKeluar = (p) => <Ic {...p} d={<><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" /><path d="M10 16l-4-4 4-4M6 12h10" /></>} />
export const IconRingkasan = (p) => <Ic {...p} d={<><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>} />
