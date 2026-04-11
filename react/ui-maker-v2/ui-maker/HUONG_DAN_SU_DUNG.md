# ui-maker v2 — Hướng Dẫn Sử Dụng

> Phiên bản: 2.0 | Cập nhật: Tháng 4/2026

---

## Mục Lục

1. [Giới thiệu](#1-giới-thiệu)
2. [Cài đặt & Khởi động](#2-cài-đặt--khởi-động)
3. [Giao diện tổng quan](#3-giao-diện-tổng-quan)
4. [Thêm phần tử vào trang](#4-thêm-phần-tử-vào-trang)
5. [Chỉnh sửa Properties](#5-chỉnh-sửa-properties)
6. [Làm việc với Ảnh](#6-làm-việc-với-ảnh)
7. [Responsive Design](#7-responsive-design)
8. [Drag & Drop — Sắp xếp phần tử](#8-drag--drop--sắp-xếp-phần-tử)
9. [Layers Panel — Quản lý cây phần tử](#9-layers-panel--quản-lý-cây-phần-tử)
10. [Lưu & Mở trang (JSON)](#10-lưu--mở-trang-json)
11. [Xuất HTML](#11-xuất-html)
12. [Undo / Redo](#12-undo--redo)
13. [Phím tắt](#13-phím-tắt)
14. [Cấu trúc phần tử được hỗ trợ](#14-cấu-trúc-phần-tử-được-hỗ-trợ)
15. [Câu hỏi thường gặp](#15-câu-hỏi-thường-gặp)

---

## 1. Giới Thiệu

**ui-maker v2** là một trình chỉnh sửa giao diện trực quan (visual page builder) chạy hoàn toàn trên trình duyệt — không cần server, không cần đăng nhập.

### Tính năng chính

| Tính năng | Mô tả |
|-----------|-------|
| Drag & Drop | Kéo phần tử từ panel trái vào canvas hoặc sắp xếp lại |
| Responsive | Xem trước và tùy chỉnh riêng cho Mobile / Tablet / Desktop |
| Media Manager | Upload ảnh lên Cloudinary, quản lý thư viện ảnh |
| Lưu / Mở JSON | Lưu toàn bộ trang thành file `.json`, mở lại bất cứ lúc nào |
| Xuất HTML | Tạo file `.html` tĩnh hoàn chỉnh với inline styles |
| Undo / Redo | 50 bước lịch sử thao tác |
| Theme CSS Vars | Hệ thống màu sắc qua CSS custom properties |

---

## 2. Cài Đặt & Khởi Động

### Yêu cầu

- Node.js ≥ 18
- npm ≥ 9

### Các bước

```bash
# 1. Cài dependencies
npm install

# 2. Chạy development server
npm run dev

# 3. Mở trình duyệt tại
# http://localhost:5173
```

### Build production

```bash
npm run build
# Output tại: dist/
```

---

## 3. Giao Diện Tổng Quan

```
┌─────────────────────────────────────────────────────────────────────┐
│  Header                                                              │
│  [ui-maker v2] [◧] │ [📱Mobile] [⬜Tablet] [🖥Desktop] │           │
│                     │ [💾Lưu JSON] [📂Mở JSON] [🌐Xuất HTML]      │
│                     │                             │ [Undo] [Redo] [◨]│
├──────────────┬──────────────────────────┬──────────────────────────┤
│ Left Panel   │  Canvas (vùng thiết kế)  │  Properties Panel        │
│              │                           │                          │
│ [Elements]   │  ┌─────────────────────┐ │  Element Options         │
│ [Layers]     │  │  Page viewport      │ │  - Spacing               │
│              │  │  (Mobile/Tablet/    │ │  - Colors                │
│  Danh sách   │  │   Desktop frame)    │ │  - Typography            │
│  phần tử     │  │                     │ │  - Border                │
│  kéo thả     │  │  [Section]          │ │  - Image src             │
│              │  │    [Container]      │ │  - Responsive            │
│              │  │      [Row]          │ │                          │
│              │  │        [Column]     │ │                          │
│              │  └─────────────────────┘ │                          │
└──────────────┴──────────────────────────┴──────────────────────────┘
```

### Header

- **Logo ui-maker v2** — bên trái
- **◧** — ẩn/hiện Left Panel
- **📱 / ⬜ / 🖥** — chuyển viewport Mobile / Tablet / Desktop
- **💾 Lưu JSON** — lưu trang thành file JSON
- **📂 Mở JSON** — mở file JSON đã lưu
- **🌐 Xuất HTML** — xuất file HTML tĩnh
- **↩ Undo / ↪ Redo** — lịch sử thao tác
- **◨** — ẩn/hiện Properties Panel

---

## 4. Thêm Phần Tử Vào Trang

### Bước 1 — Mở Elements Panel

Chọn tab **Elements** ở Left Panel (mặc định đang mở).

### Bước 2 — Kéo phần tử vào Canvas

Kéo phần tử từ danh sách và thả vào vị trí mong muốn trên canvas. Các **DropZone** (vùng thả xanh lam) sẽ hiện ra để chỉ vị trí hợp lệ.

### Cấu trúc phân cấp (bắt buộc tuân theo)

```
_root
 └── section / navbar
      └── container / row
           └── column / card
                └── heading / paragraph / button / image
```

> **Lưu ý:** Không thể thả `heading` trực tiếp vào `section` mà không có `container` hoặc `row` ở giữa. Hệ thống sẽ từ chối nếu cấu trúc không hợp lệ.

### Các phần tử có sẵn

| Icon | Tên | Mô tả |
|------|-----|-------|
| 📐 | Section | Khối ngoài cùng chiều rộng 100% |
| 🔲 | Container | Wrapper giới hạn max-width, căn giữa |
| ➡ | Row | Flexbox hàng ngang |
| ⬜ | Column | Cột flex |
| 🃏 | Card | Khối có shadow, padding |
| 🔤 | Heading | Tiêu đề h1-h6 |
| 📝 | Paragraph | Đoạn văn bản |
| 🔘 | Button | Nút bấm |
| 🖼 | Image | Ảnh |
| 🔝 | Navbar | Thanh điều hướng |

---

## 5. Chỉnh Sửa Properties

### Chọn phần tử

Click vào bất kỳ phần tử nào trên canvas. Phần tử được chọn sẽ có **viền xanh lam** (2px solid blue). Properties Panel bên phải sẽ hiển thị các tùy chọn tương ứng.

### Breadcrumb

Thanh breadcrumb phía trên Properties Panel hiển thị đường dẫn từ root đến phần tử đang chọn (ví dụ: `_root > section > container > row > column`). Click vào tên cha để chọn phần tử cha.

### Các nhóm options phổ biến

#### Spacing (Khoảng cách)
- **Padding** — khoảng cách bên trong
- **Padding X / Y** — trái-phải / trên-dưới riêng biệt
- **Margin Top / Bottom** — khoảng cách bên ngoài

#### Colors (Màu sắc)
- **Background Color** — màu nền (hex, rgb, hoặc CSS var)
- **Text Color** — màu chữ

#### Typography (Chữ)
- **Font Size** — kích thước chữ (ví dụ: `16px`, `1.2rem`)
- **Font Weight** — độ đậm (400, 600, 700...)
- **Text Align** — căn lề (left / center / right)
- **Line Height** — chiều cao dòng

#### Layout
- **Width / Max Width** — chiều rộng
- **Height / Min Height** — chiều cao
- **Display** — `flex`, `block`, `inline-block`
- **Flex Direction** — `row` / `column`
- **Justify / Align** — căn chỉnh flex items
- **Gap** — khoảng cách giữa các flex items

#### Border
- **Border Radius** — bo góc
- **Border** — đường viền (ví dụ: `1px solid #e2e8f0`)
- **Box Shadow** — đổ bóng

---

## 6. Làm Việc Với Ảnh

### Thêm phần tử Image

Kéo phần tử **🖼 Image** từ Elements Panel vào canvas (cần đặt trong `column`, `card`, `row`, `container`, hoặc `section`).

### Chọn ảnh

Sau khi chọn phần tử Image, trong Properties Panel sẽ có widget **Image Source**:

#### Cách 1: Chọn từ thư viện / Upload

1. Click nút **🖼 Chọn từ thư viện / Tải lên**
2. Modal **Media Manager** sẽ mở ra với 2 tab:
   - **Tab "Tải lên"**: Kéo ảnh vào vùng drop hoặc click để chọn file → nhập tiêu đề → click **Tải lên & Lưu vào thư viện**
   - **Tab "Thư viện"**: Xem tất cả ảnh đã upload, tìm kiếm, phân trang → click ảnh để chọn → click **Dùng ảnh này**

#### Cách 2: Nhập URL trực tiếp

Nhập URL ảnh vào ô **"Hoặc nhập URL trực tiếp"** và nhấn Enter hoặc click ra ngoài.

### Tại sao ảnh hiển thị ngay lập tức?

> **Giải thích kỹ thuật:** ui-maker v2 render ảnh trên canvas bằng `div` với `background-image` CSS thay vì thẻ `<img>` thực sự. Cách này đảm bảo ảnh hiển thị ngay lập tức khi bạn cập nhật URL — không cần chờ browser load xong mới thấy.
>
> Khi **Xuất HTML**, ảnh sẽ được chuyển thành thẻ `<img>` đúng chuẩn HTML semantic.

### Các tùy chọn ảnh

| Option | Mô tả |
|--------|-------|
| **Width** | Chiều rộng (ví dụ: `100%`, `400px`) |
| **Height** | Chiều cao cố định (để trống = auto 200px minimum) |
| **Object Fit** | `cover` (lấp đầy) / `contain` (vừa khung) |
| **Alt Text** | Văn bản thay thế (SEO, accessibility) |
| **Border Radius** | Bo góc ảnh |
| **Margin Top/Bottom** | Khoảng cách trên/dưới |

---

## 7. Responsive Design

### Chuyển viewport

Click các nút trên Header:
- **📱 Mobile** — 375px
- **⬜ Tablet** — 768px
- **🖥 Desktop** — 1280px (mặc định)

### Thiết lập giá trị responsive

1. Chọn phần tử trên canvas
2. Chuyển sang viewport **Mobile** hoặc **Tablet**
3. Thay đổi giá trị trong Properties Panel
4. Giá trị sẽ được lưu **riêng cho viewport đó** — không ảnh hưởng Desktop

### Cách hoạt động

- **Desktop** = giá trị mặc định (base)
- **Tablet / Mobile** = override riêng, chỉ áp dụng khi màn hình nhỏ hơn ngưỡng

Khi xuất HTML, các giá trị responsive được compile thành `@media` CSS block trong thẻ `<style>`.

---

## 8. Drag & Drop — Sắp Xếp Phần Tử

### Kéo từ Elements Panel

Kéo icon phần tử từ Left Panel vào canvas. Các **DropZone màu xanh** sẽ hiện ra tại các vị trí hợp lệ.

### Kéo để sắp xếp lại

Khi hover hoặc chọn một phần tử, **handle ⠿** màu xanh xuất hiện ở góc trên-trái. Kéo handle này để di chuyển phần tử sang vị trí khác trong cùng cấp cha.

### Kéo trên Layers Panel

Trong tab **Layers**, mỗi node có icon kéo (≡). Kéo để sắp xếp lại thứ tự — hỗ trợ cả việc chuyển node sang cha khác.

---

## 9. Layers Panel — Quản Lý Cây Phần Tử

### Mở Layers Panel

Click tab **Layers** ở Left Panel.

### Các thao tác

| Thao tác | Cách thực hiện |
|----------|----------------|
| **Chọn phần tử** | Click vào tên node |
| **Mở rộng / Thu gọn** | Click icon ▶ / ▼ |
| **Kéo sắp xếp** | Kéo icon ≡ bên trái |
| **Xóa phần tử** | Chọn → nhấn **Delete** / **Backspace** |

---

## 10. Lưu & Mở Trang (JSON)

### Lưu trang

Click nút **💾 Lưu JSON** trên Header.

Trình duyệt sẽ tự động tải file **`page.json`** về máy của bạn.

#### Format file JSON

```json
{
  "version": "2",
  "savedAt": "2026-04-10T09:30:00.000Z",
  "tree": {
    "$id": "root",
    "tag": "_root",
    "children": [
      {
        "$id": "sec_abc123",
        "tag": "section",
        "options": { "bgColor": "#fff", "paddingY": 80 },
        "children": [ ... ]
      }
    ]
  }
}
```

### Mở trang từ file JSON

1. Click nút **📂 Mở JSON** trên Header
2. Hộp thoại chọn file xuất hiện
3. Chọn file `.json` đã lưu trước đó
4. Trang sẽ được load ngay lập tức, toàn bộ canvas làm mới

> **Lưu ý:** Thao tác Mở JSON sẽ **thay thế hoàn toàn** trang hiện tại. Hãy lưu trước nếu cần.

---

## 11. Xuất HTML

Click nút **🌐 Xuất HTML** trên Header.

Trình duyệt sẽ tải file **`page.html`** về máy — đây là file HTML tĩnh hoàn chỉnh, có thể mở trực tiếp bằng bất kỳ trình duyệt nào mà không cần server.

### Nội dung file HTML xuất ra

```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Page — ui-maker v2</title>
  <style>
    /* Reset cơ bản */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; line-height: 1.6; }
    img { display: block; max-width: 100%; }
  </style>
  <style>
    /* Responsive overrides (nếu có) */
    @media (max-width: 1279px) { ... }
    @media (max-width: 767px)  { ... }
  </style>
</head>
<body>
  <section data-uid="sec_abc" style="padding-top:80px;...">
    <div data-uid="cnt_xyz" style="max-width:1200px;margin:auto;...">
      ...
    </div>
  </section>
</body>
</html>
```

### Đặc điểm file HTML xuất

- **Inline styles** trên mọi phần tử — tự chứa, không cần CSS file ngoài
- **Ảnh** được chuyển thành thẻ `<img>` semantic với `src`, `alt`, `object-fit`
- **Responsive** được compile vào `@media` block trong `<style>`
- **data-uid** attribute trên mỗi phần tử — giúp debug và tham chiếu
- Có thể upload trực tiếp lên hosting tĩnh (GitHub Pages, Netlify, Vercel...)

---

## 12. Undo / Redo

| Hành động | Phím tắt | Nút Header |
|-----------|----------|------------|
| Undo | `Ctrl + Z` | ↩ Undo |
| Redo | `Ctrl + Y` hoặc `Ctrl + Shift + Z` | ↪ Redo |

### Các thao tác được ghi lịch sử

- Thêm phần tử
- Xóa phần tử
- Di chuyển / sắp xếp phần tử
- Thay đổi options (debounce 250ms — các thay đổi liên tiếp gộp thành 1 bước)
- Thay đổi nội dung text

> **Tối đa 50 bước** undo. Thao tác cũ nhất sẽ bị xóa khi vượt quá giới hạn.

---

## 13. Phím Tắt

| Phím | Hành động |
|------|-----------|
| `Ctrl + Z` | Undo |
| `Ctrl + Y` | Redo |
| `Ctrl + Shift + Z` | Redo (alternative) |
| `Delete` / `Backspace` | Xóa phần tử đang chọn |
| `Escape` | Bỏ chọn phần tử |

> **Lưu ý:** Phím `Delete` / `Backspace` sẽ không xóa phần tử khi con trỏ đang ở trong ô input hoặc textarea.

---

## 14. Cấu Trúc Phần Tử Được Hỗ Trợ

### Bảng cha → con hợp lệ

| Phần tử cha | Có thể chứa |
|-------------|-------------|
| `_root` | `section`, `navbar` |
| `navbar` | `container`, `row` |
| `section` | `container`, `row`, `card`, `heading`, `paragraph`, `button`, `image` |
| `container` | `row`, `column`, `card`, `heading`, `paragraph`, `button`, `image` |
| `row` | `column`, `card`, `heading`, `paragraph`, `button`, `image` |
| `column` | `heading`, `paragraph`, `button`, `card`, `row`, `image` |
| `card` | `heading`, `paragraph`, `button`, `row`, `column`, `image` |

### Phần tử lá (không có con)

`heading`, `paragraph`, `button`, `image` — không thể chứa phần tử con.

---

## 15. Câu Hỏi Thường Gặp

### Ảnh không hiển thị sau khi chọn?

**Nguyên nhân có thể:**
1. URL ảnh không hợp lệ hoặc ảnh bị xóa khỏi server
2. CORS policy của server ảnh chặn
3. Kết nối mạng gián đoạn khi tải từ thư viện

**Giải pháp:**
- Kiểm tra URL trong ô nhập URL trực tiếp
- Thử upload lại ảnh qua tab "Tải lên" của Media Manager
- Kiểm tra kết nối mạng

---

### Tôi có thể mở file JSON cũ hơn không?

Có, miễn là file có cấu trúc `{ "tree": { ... } }` hoặc là plain tree object với field `tag`. Tuy nhiên nếu file được tạo từ phiên bản rất cũ với cấu trúc khác, có thể cần chỉnh sửa thủ công.

---

### File HTML xuất ra có dùng được trên mọi trình duyệt không?

File HTML sử dụng **inline CSS** chuẩn, không dùng JavaScript, tương thích với mọi trình duyệt hiện đại (Chrome, Firefox, Safari, Edge). Các tính năng như `flexbox`, `object-fit`, CSS custom properties được hỗ trợ rộng rãi.

---

### Làm sao thêm loại phần tử mới?

1. Tạo file `src/controllers/MyController.js` kế thừa `BaseController`
2. Đăng ký trong `src/controllers/registry.js`
3. Thêm định nghĩa vào `src/data/elementDefs.js`
4. (Tùy chọn) Tạo `src/components/options/OptionMyField.jsx` cho custom option

---

### Dữ liệu có được lưu tự động không?

Hiện tại **không có auto-save**. Dữ liệu chỉ tồn tại trong bộ nhớ trình duyệt khi đang làm việc. Hãy click **💾 Lưu JSON** thường xuyên để tránh mất dữ liệu khi refresh trang.

---

### Tôi có thể dùng CSS variable trong options không?

Có. Nhập giá trị dạng `var(--color-primary)` vào bất kỳ ô màu sắc nào. Hệ thống theme của ui-maker v2 định nghĩa các biến CSS này trong file `public/data/themes/default.json` và apply lên `:root`.

---

## Thông Tin Kỹ Thuật

| Thành phần | Công nghệ |
|-----------|-----------|
| Framework | React 18 + Vite |
| State management | Zustand (fine-grained subscriptions) |
| Drag & Drop | @dnd-kit/core |
| Image hosting | Cloudinary |
| Image library | Google Sheets + Apps Script |
| Build output | Vanilla HTML/CSS/JS (no runtime deps) |

---

*Tài liệu này được tạo bởi ui-maker v2 development team.*
