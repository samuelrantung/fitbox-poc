# FitBox Manado — POC Implementation Plan

Proof-of-concept website for a premium healthy-food catering subscription in Manado (benchmark: YellowFit Kitchen Jakarta). Built for an investor pitch: investors will open the site **hands-on on their own devices** and must understand the business model by clicking through it. **No backend. Static site only. Deploy target: Vercel.**

## Hard constraints

- **Stack:** Plain HTML + CSS + vanilla JavaScript. No frameworks, no build step, no npm. One folder, deployable to Vercel as-is.
- **Language:** All UI copy in **Bahasa Indonesia** (English brand/plan terms OK, e.g. "FitBox", "Paket Mingguan").
- **Responsive:** Must work well on mobile — investors may open it on phones.
- **State:** localStorage + in-page JS only. All data is hardcoded mock data.
- **Robust for hands-on use:** every button must do something sensible; no dead links, no console errors, no broken states if steps are skipped (redirect back to step 1 if wizard state missing).

## Files

```
/index.html      Landing page
/order.html      Subscription wizard (5 steps in one page, JS-driven)
/styles.css      Shared styles
/app.js          Wizard logic + shared JS
/logo.jpeg       Brand logo (already provided — do not regenerate)
```

(Other images not required — use CSS gradients/emoji/placeholder food photos via solid-color cards with text. Do NOT hotlink external images that may fail.)

## Logo

Use the provided `logo.jpeg` as the brand logo: navbar (both pages) and footer, plus as favicon (`<link rel="icon" href="logo.jpeg">`). The file is a square lime-green (#B5C97A-ish) background with a black "fitbox" wordmark and tagline "MEAL BETTER. LIVE BETTER." Since the JPEG background is opaque lime, place it on matching or complementary surfaces (e.g. give it rounded corners, or set navbar/footer surfaces so the lime square looks intentional). In the navbar render it small (~40–48px tall) next to the text "FitBox Manado".

## Design language (premium, not home-cooking)

- Palette: anchor on the logo — deep green (#1B3A2D-ish) + lime accent (#B5C97A, matching the logo background) + cream/off-white + black. Dark hero. Use the logo's tagline "Meal Better. Live Better." as brand tagline where an English tagline fits.
- Typography: elegant serif for headings (e.g. Google Fonts "Playfair Display" or "Fraunces"), clean sans for body ("Inter" / "Plus Jakarta Sans"). Loading Google Fonts is allowed.
- Generous whitespace, rounded cards, soft shadows, subtle hover transitions. Should feel like a high-end brand site, not a template.

## Page 1 — Landing (`index.html`)

Sections in order:

1. **Navbar:** FitBox Manado logotype + CTA button "Mulai Langganan" → order.html.
2. **Hero:** headline positioning premium healthy catering khas Manado, sub-copy, CTA "Mulai Langganan", secondary "Lihat Menu" (anchor scroll).
3. **Cara Kerja (3 langkah):**
   1. Pilih menu **sehari sebelumnya (H-1)** lewat website.
   2. Dimasak segar oleh dapur FitBox — resep Manado yang disehatkan.
   3. **Diantar panas** oleh mobil delivery ber-microwave, atau **pickup sendiri** di dapur kami.
4. **Keunggulan / differentiator:** highlight card for the hot-delivery car with built-in microwave ("Satu-satunya katering di Manado yang mengantar makanan dalam kondisi panas"). Plus: fokus kesehatan, bahan lokal segar, porsi terukur (kalori/protein).
5. **Sample menu (6 items)**, each a card with nama, deskripsi singkat, kalori & protein badges, tag tujuan (Diet/Olahraga/Maintenance):
   - Tinutuan Power Bowl (bubur Manado, telur, sayur) — ±320 kkal / 14g protein
   - Ikan Woku Panggang + nasi merah — ±450 kkal / 35g
   - Gohu Fresh Salad + dabu-dabu dressing — ±280 kkal / 8g
   - Ayam Rica Tanpa Minyak + sayur kukus — ±420 kkal / 38g
   - Cakalang Fufu Bowl + quinoa — ±480 kkal / 40g
   - Sayur Garo + tahu panggang — ±300 kkal / 18g
6. **Pricing (2 cards):**
   - **Paket Mingguan** — mulai Rp400.000 / minggu (5 hari kerja, 1 makan siang + 1 makan malam per hari = 10 porsi; mulai Rp40.000/porsi)
   - **Paket Bulanan** — mulai Rp1.440.000 / bulan (4 minggu, badge "Hemat 10%", tandai "Terpopuler")
   - Both list: pilih menu H-1, konsultasi tujuan, antar panas / pickup, pause kapan saja. CTA on each card → order.html (preselect plan via query param `?plan=mingguan|bulanan`).
7. **Footer:** alamat dapur fiktif di Manado, WhatsApp fiktif, tagline. Small note "Proof of Concept".

## Page 2 — Wizard (`order.html`)

Single page, 5 steps shown one at a time with a progress bar. State object kept in JS + mirrored to localStorage. "Kembali" and "Lanjut" navigation; "Lanjut" disabled until the step's required choice is made.

- **Step 1 — Pilih Paket:** Mingguan vs Bulanan cards (respect `?plan=` preselect).
- **Step 2 — Tujuan & Aktivitas:** pick one: Turun Berat Badan (Diet) / Olahraga & Otot / Hidup Sehat (Maintenance) / Kebutuhan Khusus. Copy notes menus are curated to the goal.
- **Step 3 — Pilih Menu untuk Besok:** show tomorrow's date (JS-computed, Indonesian format). Reuse the 6 menu items; user picks 1 makan siang + 1 makan malam. Prominent info banner: "Pemesanan menu ditutup H-1 pukul 18.00 WITA."
- **Step 4 — Pengiriman:** two options:
  - **FitBox Hot Delivery** — diantar panas oleh mobil ber-microwave, badge "Rekomendasi", + field alamat (free text).
  - **Pickup Sendiri** — ambil di dapur FitBox (show mock address), gratis.
- **Step 5 — Data Diri:** required: Nama, No. WhatsApp. Clearly-marked **opsional** section ("bantu kami mengenal Anda — untuk riset & program yang lebih personal"): usia, berat/tinggi badan, alergi, target berat badan, tingkat aktivitas harian. Simple client-side validation on required fields only.
- **Konfirmasi screen:** recap all selections (paket, tujuan, menu besok, pengiriman, harga), then a mock CTA "Konfirmasi via WhatsApp" (a `wa.me` link with prefilled order text is fine) + note "Pembayaran & aktivasi dilakukan via WhatsApp — POC". Button "Kembali ke Beranda".

Edge case: if user opens order.html mid-flow after refresh, restore from localStorage; if state is corrupt/missing, start at step 1.

## Acceptance checklist

- [ ] Landing renders premium and correct on mobile (375px) and desktop.
- [ ] All CTAs route correctly; `?plan=` preselect works.
- [ ] Wizard cannot advance without required selections; back/forward preserves choices.
- [ ] Optional fields can be entirely skipped and flow still completes.
- [ ] Confirmation recap matches actual selections, prices correct.
- [ ] No console errors; no external resources besides Google Fonts.
- [ ] Deployable by dragging the folder into Vercel (no config files needed).
