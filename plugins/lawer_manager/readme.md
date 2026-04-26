lawyer-manager/
├─ includes/
│  ├─ class-lm-cpt-base.php
│  ├─ class-lm-cpt-lawyer.php
│  ├─ class-lm-shortcode-base.php
│  ├─ class-lm-shortcode-lawyer-list.php
│  ├─ class-lm-ux-element-base.php
│  ├─ class-lm-assets-manager.php
│  ├─ ajax-quickview-handler.php        (lawyer)
│  ├─ class-lm-cpt-document.php             <-- doc
│  ├─ class-lm-shortcode-document-list.php  <-- doc
│  ├─ class-lm-ux-element-document-list.php <-- doc (dùng UX Builder)
│  ├─ ajax-document-quickview.php       <-- doc
│
├─ templates/
│  ├─ lawyer/
│  │   ├─ lawyer-badge.php
│  │   └─ ...
│  ├─ document/
│      ├─ document-list.php             <-- doc
│      └─ (sau này thêm document-card.php, v.v.)
│
├─ assets/
│  ├─ css/
│  │   ├─ lm-frontend.css               
│  │   └─ document-frontend.css         <-- optional
│  ├─ js/
│      ├─ lm-relay.js                   
│      ├─ lm-quickview.js               (cho lawyer)
│      ├─ document-quickview.js         <-- doc
│      └─ document-relay.js             <-- doc relay riêng
│
├─ lawyer-manager.php (bootstrap)
└── docs/
    ├── developer-guide.md
    └── diagrams.mmd


# Law Manager – Developer Guide

## Cấu trúc
- CPT: `lawyer`
- Taxonomy: `lawyer_category`
- Shortcode: `[ux_lawyers]`
- UX Builder element: "Lawyer List"
- Quickview dùng meta `_lm_bio_shortcode`

## Mở rộng
- Thay đổi giao diện: override file `class-shortcode-lawyer-list.php`, phần render.
- Thêm field mới: dùng `LM_Meta_Box_Helper`.