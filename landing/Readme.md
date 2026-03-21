 PRD V2.0 – Aleric: The Silicon Valley Standard cho MVP 1 homepage, viết theo mindset PM FAANG, dùng được trực tiếp cho dev/design/QA.

1. Thông tin chung
Sản phẩm: Aleric – Premium Creative Portfolio (HTML, 1 homepage chuẩn FAANG)
Mục tiêu V2.0 (MVP):

Build 1 homepage duy nhất nhưng đạt chuẩn cao nhất về UI, performance, a11y, DevEx.

Dùng làm “golden template” để nhân bản thành các biến thể home khác về sau.

Audience chính:

Frontend dev / freelancer mua template để làm web cho client.

Creative agency muốn landing hiện đại, animation đẹp, dễ custom.

Designer muốn có nền tảng code sạch để học UI + motion.

2. Phạm vi & Out‑of‑scope
2.1. In‑scope (V2.0 – MVP)
01 file index.html (homepage) với kiến trúc Atomic Design.

1 bộ CSS (tokens + components) + JS (main + animation).

Hệ thống design token (CSS variables).

Motion bằng GSAP (chỉ cho một số organism).

Performance, A11y, QA theo budget ở dưới.

DevEx: cấu trúc /src + script Vite dev build.

2.2. Out‑of‑scope
Không làm thêm page (About, Blog, Portfolio detail…) ở V2.0.

Không có backend (contact form chỉ là UI, chưa cần gửi mail).

Không tích hợp CMS/WordPress/React (chỉ HTML + Vite dev server).

Không làm dark/light toggle ở V2.0 (sẽ giữ theme dark chủ đạo, thiết kế token sẵn để V2.1 thêm).

3. Kiến trúc: Atomic Design System
3.1. Design Tokens (Atoms)
Mục tiêu: Đổi theme, spacing, radius… trong vài phút mà không đụng HTML.

Color tokens (prefix --clr-):

--clr-bg, --clr-bg-elevated, --clr-fg, --clr-muted,

--clr-accent, --clr-accent-soft, --clr-border.

Typography tokens:

Font families: --font-display (Space Grotesk/Serif), --font-body (Inter).

Fluid scale (clamp) cho h1–h6, body, caption (dùng CSS clamp()).

Spacing & Radius:

Spacing scale: --space-1…--space-8.

Radius: --radius-sm, --radius-md, --radius-lg, --radius-pill.

Layout tokens:

Container width: --layout-max-width (ví dụ 1200–1320px).

Grid: 12‑column via CSS grid-template-columns: repeat(12, minmax(0,1fr));.

AC:

Tất cả màu, font‑size, spacing, radius, shadow không được hard‑code trong component; chỉ dùng var(--token-name).

Thay đổi palette trong file tokens.css phải đổi toàn site mà không đụng HTML.

3.2. Molecules
Phạm vi Molecule cho homepage:

Navigation Link (text + underline hover).

Social Icon (link + icon + aria-label).

Magnetic / Primary Button (CTA).

Section Badge (nhãn nhỏ trên section: “Selected Work”, “About Studio”…).

Yêu cầu:

Mỗi molecule có class reuse được: .nav-link, .cta-button, .social-link, .section-tag.

Hover/active states default + variants (primary / ghost).

Icon dùng SVG inline hoặc Font Awesome Free, mỗi icon có aria-label hoặc text ẩn.

3.3. Organisms (Section‑level)
Homepage gồm các Organism sau:

Sticky Navigation Bar

Logo trái, menu giữa, CTA “Start Project” phải.

Behavior:

Sticky trên scroll.

Shrink nhẹ (height, background blur) khi scroll xuống.

A11y:

<nav role="navigation" aria-label="Main">, skip link “Skip to content”.

Split‑Text Hero

Bố cục 2 cột:

Trái: heading lớn (split text animation), subtext, 1–2 CTA (primary “View Work”, secondary “Contact”).

Phải: hình bento (ảnh/video/gradient).

Motion:

GSAP SplitText/clip animation khi vào viewport.

Performance:

Chỉ chạy GSAP trên viewport đầu tiên, không loop vô nghĩa.

Bento Grid Services / Capabilities

Layout kiểu bento: 3–5 ô với kích thước khác nhau (services, tools, values).

Hover: scale nhẹ, overlay gradient, text slide in.

Featured Projects (Project Cards)

Grid 2–3 cột:

Card: thumbnail lớn (img), category, title, short caption, link “View case”.

Optional: hover effect (parallax nhẹ hoặc scale) dùng CSS hoặc GSAP tối giản.

Studio / About Block

2 cột: hình team/studio + copy “We partner with…”.

Stat block (số project, clients, timezones).

Minimal Footer

Brand, small nav (Work / Studio / Contact), social, copyright.

AC Organisms:

Mỗi organism đóng gói trong 1 <section> với ID rõ: #hero, #services, #projects, #studio, #contact.

Có thể copy nguyên <section> sang HTML khác mà không bị vỡ CSS.

4. Performance Budget
Mục tiêu: Lighthouse 100/100 cho Performance, A11y, Best Practices, SEO trên homepage (desktop & mobile).

4.1. JS Budget
Không jQuery.

Chỉ 2 file JS:

main.js (navigation, scroll, misc interactions).

animations.js (GSAP setup).

Tổng JS trước minify ≤ 80–100 KB; sau build ≤ 40 KB gzip.

Import GSAP theo module, chỉ plugin cần dùng (vd: gsap/core, ScrollTrigger).

4.2. Loading Strategy
Tất cả script: type="module" + defer.

Critical CSS inline (nhỏ) cho above‑the‑fold; phần còn lại trong 1 file styles.css.

Không dùng font‑loader nặng; dùng Google Fonts với display=swap.

4.3. Image Strategy
Tất cả ảnh: .webp hoặc .avif.

Dùng srcset + sizes để phục vụ ảnh theo viewport.

Mọi block có aspect-ratio cố định để tránh layout shift (Cumulative Layout Shift ~ 0).
​

AC Performance:

Lighthouse:

Perf ≥ 95 (mobile), 100 (desktop).

CLS ~ 0.00–0.02, LCP < 1.8s trên 4G giả lập.

Không có request chéo domain trừ: Google Fonts (nếu cần).

5. Accessibility & Globalization
5.1. Keyboard Navigation
Thứ tự tab rõ, không “bẫy focus”.

Thêm link “Skip to main content” xuất hiện khi focus đầu trang.

Focus state: border/outline custom nhưng không bị tắt.

5.2. Screen Reader
```<h1> duy nhất trong hero.```

Mỗi section có aria-label/aria-labelledby đúng nghĩa.

Icon (menu, social, arrow) có:

```<button aria-label="Open navigation">

<a aria-label="Follow on Dribbble">…</a>.```

5.3. RTL Ready
Dùng logical properties:

margin-inline, padding-inline, border-inline-start.

Test nhanh với dir="rtl" trên <html>:

Layout không vỡ, text align phù hợp.

Không hard‑code float: left/right, text-align: left nếu không bắt buộc.

AC A11y:

Lighthouse Accessibility ≥ 100.

Tab through homepage không bị kẹt; NVDA/VoiceOver đọc được cấu trúc hợp lý.

6. Testing & QA
6.1. Browsers & Devices
Latest: Chrome, Safari, Firefox, Edge.

Device targets:

iPhone 13/15 (Safari).

Pixel/Android Chrome.

iPad Mini / iPad Pro.

Desktop 1440p, Ultrawide 2560x1080 / 3440x1440.

6.2. Test Cases chính
Visual regression eyeball: hero, grid, footer ở 4 breakpoint.

Motion:

GSAP không crash nếu JS disabled (fallback graceful).

Performance:

Lighthouse run từ CI (hoặc manual) trước khi release.

AC QA:

0 critical bugs (layout vỡ, JS error).

Known issues (nếu có) được ghi rõ trong docs.

7. Developer Experience (DevEx)
7.1. Tooling
Vite cho dev:

npm run dev → HMR.

npm run build → output /dist static.

Cấu trúc:

text
/src
  /assets
    /images
    /fonts
  /scripts
    main.js
    animations.js
  /styles
    tokens.css
    base.css
    components.css
    layout.css
index.html
vite.config.js
7.2. Coding Guidelines
CSS:

BEM hoặc utility‑first cấp thấp, tránh class “spaghetti”.

Không lặp style – phải tách thành component hoặc utility.

JS:

Module ES6, không biến global lung tung.

Comment block cho từng organism (Hero, Projects,…).

Comment:

/* === Hero Section === */, /* === Project Cards === */ trước mỗi đoạn lớn.

7.3. DX Acceptance
Dev lần đầu clone repo:

Chạy npm install && npm run dev trong < 5 phút.

Đọc README hiểu ngay cách đổi màu, font, ảnh hero.

8. Deliverables V2.0
index.html – homepage “Aleric – The Silicon Valley Standard”.

/src/styles/* với tokens + components rõ ràng.

/src/scripts/main.js, /src/scripts/animations.js (GSAP).

Vite config + npm scripts.

Quickstart README:

Setup.

Đổi logo/màu.

Bật/tắt animation/custom cursor.

2–3 screenshot (desktop + mobile) để dùng làm preview.

9. Success Metrics cho PRD V2.0
Kỹ thuật

Lighthouse (mobile/desktop): 100/100/100/100.

A11y audit: pass WCAG AA cho text chính.

DX

2 dev độc lập (internal) setup & đổi màu trong < 30 phút, không cần support.

Sản phẩm

Homepage được chọn làm base duy nhất cho tất cả homepage còn lại (no fork khác biệt).