import './index.css'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  document.getElementById('root')!.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f9fafb;padding:24px;box-sizing:border-box;font-family:system-ui,sans-serif">
      <div style="max-width:420px;background:#fff;border-radius:12px;padding:28px;box-shadow:0 1px 3px rgba(0,0,0,.1)">
        <h1 style="margin:0 0 12px;font-size:18px;color:#1e293b">Yapılandırma eksik</h1>
        <p style="margin:0;color:#64748b;font-size:14px;line-height:1.55">
          Production build için Netlify’da <strong>Site configuration → Environment variables</strong> bölümünde
          <code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;font-size:13px">VITE_SUPABASE_URL</code> ve
          <code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;font-size:13px">VITE_SUPABASE_ANON_KEY</code>
          tanımlı olmalı. Kaydettikten sonra <strong>Deploys → Trigger deploy</strong> ile yeniden derleyin (Vite bu değişkenleri build sırasında gömer).
        </p>
      </div>
    </div>`
} else {
  void import('./bootstrap')
    .then(({ mount }) => mount())
    .catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err)
      const root = document.getElementById('root')
      if (root) {
        root.innerHTML = `
          <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;font-family:system-ui,sans-serif;background:#f9fafb">
            <div style="max-width:420px;background:#fff;border-radius:12px;padding:28px;box-shadow:0 1px 3px rgba(0,0,0,.1)">
              <h1 style="margin:0 0 12px;font-size:18px;color:#1e293b">Uygulama yüklenemedi</h1>
              <p style="margin:0;color:#64748b;font-size:14px;line-height:1.55">Ağ veya önbellek sorunu olabilir. Sayfayı yenileyin; devam ederse Netlify deploy loglarına bakın.</p>
              <pre style="margin-top:16px;padding:12px;background:#f1f5f9;border-radius:8px;font-size:12px;overflow:auto">${msg.replace(/</g, '&lt;')}</pre>
            </div>
          </div>`
      }
    })
}
