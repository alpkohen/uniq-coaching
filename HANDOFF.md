# UNIQ Coaching — Handoff Notu

## Proje Özeti

Alp (manager) ile Sibel (learner) arasındaki koçluk sürecini yöneten web uygulaması.
Stack: **React + TypeScript + Supabase + Netlify**

---

## Tamamlananlar

### Altyapı
- Vite + React 18 + TypeScript projesi kuruldu
- Git repo: `https://github.com/alpkohen/uniq-coaching` (`feature/ai-chat` branch)
- Netlify deploy: `https://uniq-coaching.netlify.app`
- Supabase projesi: `uniq-coaching` (eu-west-1)

### Veritabanı (Supabase)
Migration uygulandı: `supabase/migrations/20260410000000_initial_schema.sql`

| Tablo | Açıklama |
|-------|----------|
| `profiles` | Kullanıcı rolleri (manager / learner) |
| `tasks` | Alp'in Sibel'e atadığı görevler |
| `notes` | Sibel'in görev notları |
| `chat_sessions` | Claude sohbet oturumları |
| `chat_messages` | Sohbet mesajları |

RLS politikaları aktif: manager geniş okuma, learner yalnızca kendi verisi.

### Kullanıcılar
| Kişi | E-posta | Şifre | Rol |
|------|---------|-------|-----|
| Alp | `akohen@uniq-tr.com` | `coach1234` | manager |
| Sibel | `scebeci@uniq-tr.com` | `learn1234` | learner |

### Uygulama
- **Login**: Rol bazlı yönlendirme (manager → ManagerDashboard, learner → LearnerDashboard)
- **Manager**: Görev oluşturma, Sibel'in durumu + notları, Claude chat logları
- **Learner**: Görev listesi, status güncelleme (pending → in_progress → completed), not ekleme, Claude chat
- **Netlify Function** (`netlify/functions/claude-chat.ts`): Claude API proxy — görev bağlamını sistem mesajına ekler

### Environment Variables (Netlify)
| Değişken | Açıklama |
|----------|----------|
| `VITE_SUPABASE_URL` | `https://njavzxkulbnymzublezv.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon public key |
| `ANTHROPIC_API_KEY` | Claude API key (eklendi) |

---

## Kalan Adımlar

### Öncelikli
- [x] **Uçtan uca test**: Alp görev oluştursun → Sibel görsün, not eklesin, Claude'a sorsun → Alp chat logunu görsün — `npm run test:e2e` ile API/RLS doğrulandı (2026-04-10)
- [ ] **`main` branch**: `feature/ai-chat` → `main`'e merge edip Netlify'ı `main`'e bağla
- [ ] **Şifre değiştirme**: Test şifrelerini (`coach1234`, `learn1234`) Supabase Auth üzerinden güvenli şifrelerle değiştir

### İyileştirmeler
- [ ] **Görev silme / düzenleme**: Manager tarafından
- [ ] **Not düzenleme / silme**: Learner tarafından
- [ ] **Bildirim**: Sibel'e yeni görev atandığında e-posta (Supabase Edge Function + Resend/SendGrid)
- [ ] **Gerçek zamanlı güncellemeler**: Supabase Realtime ile task/note değişikliklerini canlı yansıt
- [ ] **Chat geçmişi başlıkları**: Otomatik başlık yerine daha anlamlı özetler
- [ ] **Mobil uyum**: Mevcut layout masaüstü odaklı, responsive düzenleme yapılabilir
- [ ] **Loading/error states**: Daha iyi kullanıcı geri bildirimi

### Teknik Borç
- [ ] `react-router-dom` kurulu ama henüz kullanılmıyor — sayfa sayısı artarsa URL routing ekle
- [ ] Supabase `service_role` key gereken admin işlemler için ayrı bir Netlify Function yazılabilir (şu an doğrudan SQL ile yapıldı)

---

## Geliştirme Ortamı

```bash
# Bağımlılıkları yükle
npm install

# Lokal dev (Vite — Claude chat çalışmaz)
npm run dev

# Lokal dev (Netlify — Claude chat dahil tam test)
netlify dev

# Build
npm run build
```

`.env.local` dosyası gerekli (`.env.local.example`'dan kopyala, değerleri doldur).
