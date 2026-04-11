/**
 * sectionTemplates.js — pre-built section templates for the Sections panel.
 *
 * Each template is a plain tree that matches ElementNode schema.
 * Clicking a template inserts it at the bottom of the _root (after last section).
 *
 * Categories mirror common page builder conventions:
 *  Hero, Features, Testimonials, Pricing, CTA, Content, Footer
 */

export const SECTION_TEMPLATES = [
  // ─── HERO ──────────────────────────────────────────────────────────────────
  {
    category: 'Hero',
    items: [
      {
        id: 'hero-centered',
        label: 'Hero Centered',
        desc: 'Tiêu đề + mô tả + 2 nút CTA căn giữa',
        icon: '🎯',
        preview: 'Tiêu đề lớn · Mô tả · 2 Button',
        tree: {
          tag: 'section',
          options: { bgColor: 'var(--color-bg-dark)', paddingY: 120, textAlign: 'center',
            $responsive: { paddingY: [60, 80, 120] } },
          children: [{
            tag: 'container', options: {}, children: [
              { tag: 'heading', content: 'Tiêu Đề Trang Chính', options: {
                level: 'h1', color: 'var(--color-text-inverse)',
                fontSize: 'var(--font-size-5xl)', fontWeight: 'var(--font-weight-bold)',
                textAlign: 'center', marginBottom: 20,
                $responsive: { fontSize: ['var(--font-size-3xl)', 'var(--font-size-4xl)', 'var(--font-size-5xl)'] }
              }},
              { tag: 'paragraph', content: 'Mô tả ngắn gọn về sản phẩm hoặc dịch vụ của bạn. Tạo ấn tượng đầu tiên mạnh mẽ.', options: {
                color: 'var(--color-text-muted)', fontSize: 'var(--font-size-lg)',
                textAlign: 'center', maxWidth: '600px', marginBottom: 40
              }},
              { tag: 'row', options: { justify: 'center', gap: 16, flexDirection: 'row',
                $responsive: { flexDirection: ['column', 'row', 'row'] } }, children: [
                { tag: 'button', content: 'Bắt Đầu Ngay', options: { variant: 'primary', size: 'lg' }},
                { tag: 'button', content: 'Tìm Hiểu Thêm', options: { variant: 'outline-light', size: 'lg' }},
              ]},
            ]
          }]
        }
      },
      {
        id: 'hero-split',
        label: 'Hero Split',
        desc: 'Text bên trái, ảnh bên phải',
        icon: '↔️',
        preview: 'Text | Ảnh',
        tree: {
          tag: 'section',
          options: { bgColor: 'var(--color-bg)', paddingY: 80,
            $responsive: { paddingY: [48, 64, 80] } },
          children: [{
            tag: 'container', options: {}, children: [{
              tag: 'row', options: { gap: 48, align: 'center', flexDirection: 'row',
                $responsive: { flexDirection: ['column', 'row', 'row'] } }, children: [
                { tag: 'column', options: { flex: '1' }, children: [
                  { tag: 'heading', content: 'Giải Pháp Tốt Nhất Cho Bạn', options: {
                    level: 'h1', fontSize: 'var(--font-size-4xl)',
                    fontWeight: 'var(--font-weight-bold)', marginBottom: 16,
                    $responsive: { fontSize: ['var(--font-size-2xl)', 'var(--font-size-3xl)', 'var(--font-size-4xl)'] }
                  }},
                  { tag: 'paragraph', content: 'Chúng tôi cung cấp dịch vụ chất lượng cao với giá cả hợp lý. Hơn 10 năm kinh nghiệm trong ngành.', options: {
                    color: 'var(--color-text-muted)', fontSize: 'var(--font-size-lg)', marginBottom: 32
                  }},
                  { tag: 'button', content: 'Liên Hệ Ngay', options: { variant: 'primary', size: 'lg' }},
                ]},
                { tag: 'column', options: { flex: '1' }, children: [
                  { tag: 'image', options: { src: '', alt: 'Hero image', width: '100%', height: 'auto', objectFit: 'cover', borderRadius: 'var(--radius-lg)' }},
                ]},
              ]
            }]
          }]
        }
      },
    ]
  },

  // ─── FEATURES ──────────────────────────────────────────────────────────────
  {
    category: 'Features',
    items: [
      {
        id: 'features-3col',
        label: 'Features 3 Cột',
        desc: '3 card tính năng với icon',
        icon: '⚡',
        preview: '3 Card · Icon + Tiêu đề + Mô tả',
        tree: {
          tag: 'section',
          options: { bgColor: 'var(--color-bg-alt)', paddingY: 80 },
          children: [{
            tag: 'container', options: {}, children: [
              { tag: 'heading', content: 'Tính Năng Nổi Bật', options: {
                level: 'h2', textAlign: 'center', marginBottom: 12,
                fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text)'
              }},
              { tag: 'paragraph', content: 'Khám phá những điểm mạnh giúp chúng tôi khác biệt', options: {
                textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: 48
              }},
              { tag: 'row', options: { gap: 24, align: 'stretch', flexDirection: 'row',
                $responsive: { flexDirection: ['column', 'row', 'row'] } }, children: [
                ...[
                  ['⚡', 'Tốc Độ Nhanh', 'Hiệu suất tối ưu, tải trang chưa đến 1 giây.'],
                  ['🔒', 'Bảo Mật Cao', 'Dữ liệu được mã hóa và bảo vệ 24/7.'],
                  ['📱', 'Responsive', 'Tương thích hoàn hảo trên mọi thiết bị.'],
                ].map(([icon, title, desc]) => ({
                  tag: 'card',
                  options: { shadow: 'var(--shadow-md)', radius: 'var(--radius-lg)', bgColor: 'var(--color-bg)', padding: 'var(--card-padding)', flex: '1' },
                  children: [
                    { tag: 'heading', content: `${icon} ${title}`, options: { level: 'h3', fontSize: 'var(--font-size-lg)', marginBottom: 8, color: 'var(--color-text)' }},
                    { tag: 'paragraph', content: desc, options: { color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }},
                  ]
                }))
              ]},
            ]
          }]
        }
      },
      {
        id: 'features-2col',
        label: 'Features 2 Cột',
        desc: 'Ảnh trái, danh sách tính năng phải',
        icon: '📋',
        preview: 'Ảnh | 4 Feature items',
        tree: {
          tag: 'section',
          options: { bgColor: 'var(--color-bg)', paddingY: 80 },
          children: [{
            tag: 'container', options: {}, children: [{
              tag: 'row', options: { gap: 64, align: 'center', flexDirection: 'row',
                $responsive: { flexDirection: ['column', 'row', 'row'] } }, children: [
                { tag: 'column', options: { flex: '1' }, children: [
                  { tag: 'image', options: { src: '', alt: '', width: '100%', objectFit: 'cover', borderRadius: 'var(--radius-lg)' }}
                ]},
                { tag: 'column', options: { flex: '1' }, children: [
                  { tag: 'heading', content: 'Vì Sao Chọn Chúng Tôi?', options: {
                    level: 'h2', fontWeight: 'var(--font-weight-bold)', marginBottom: 32
                  }},
                  ...['✅ Hỗ trợ 24/7', '✅ Không cam kết dài hạn', '✅ Cập nhật miễn phí', '✅ Bảo hành 12 tháng'].map(txt => ({
                    tag: 'paragraph', content: txt,
                    options: { fontSize: 'var(--font-size-base)', marginBottom: 16, color: 'var(--color-text)' }
                  })),
                  { tag: 'button', content: 'Xem Chi Tiết', options: { variant: 'primary', size: 'md' }}
                ]},
              ]
            }]
          }]
        }
      },
    ]
  },

  // ─── TESTIMONIALS ──────────────────────────────────────────────────────────
  {
    category: 'Testimonials',
    items: [
      {
        id: 'testimonials-3',
        label: 'Testimonials 3 Card',
        desc: '3 testimonial card dạng quote',
        icon: '💬',
        preview: '3 Quote cards',
        tree: {
          tag: 'section',
          options: { bgColor: 'var(--color-bg-alt)', paddingY: 80 },
          children: [{
            tag: 'container', options: {}, children: [
              { tag: 'heading', content: 'Khách Hàng Nói Gì?', options: {
                level: 'h2', textAlign: 'center', marginBottom: 48,
                fontWeight: 'var(--font-weight-bold)'
              }},
              { tag: 'row', options: { gap: 24, align: 'stretch', flexDirection: 'row',
                $responsive: { flexDirection: ['column', 'row', 'row'] } }, children: [
                ...[
                  ['Sản phẩm tuyệt vời! Đã giúp chúng tôi tăng doanh thu 40% chỉ trong 3 tháng.', 'Nguyễn Văn A · CEO Công ty X'],
                  ['Dịch vụ hỗ trợ rất nhiệt tình. Tôi sẽ giới thiệu cho tất cả đối tác của mình.', 'Trần Thị B · Marketing Manager'],
                  ['Giao diện đẹp, dễ dùng. Đây là giải pháp tốt nhất tôi từng dùng.', 'Lê Văn C · Founder Startup Y'],
                ].map(([quote, author]) => ({
                  tag: 'card',
                  options: { shadow: 'var(--shadow-md)', radius: 'var(--radius-lg)', bgColor: 'var(--color-bg)', padding: 'var(--card-padding)', flex: '1' },
                  children: [
                    { tag: 'paragraph', content: `"${quote}"`, options: {
                      color: 'var(--color-text)', fontSize: 'var(--font-size-sm)',
                      lineHeight: '1.7', marginBottom: 16,
                    }},
                    { tag: 'paragraph', content: `— ${author}`, options: {
                      color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)',
                      fontWeight: 'var(--font-weight-medium)'
                    }},
                  ]
                }))
              ]},
            ]
          }]
        }
      },
    ]
  },

  // ─── PRICING ───────────────────────────────────────────────────────────────
  {
    category: 'Pricing',
    items: [
      {
        id: 'pricing-3col',
        label: 'Pricing 3 Gói',
        desc: '3 gói giá với highlight gói trung bình',
        icon: '💰',
        preview: 'Free · Pro (nổi bật) · Enterprise',
        tree: {
          tag: 'section',
          options: { bgColor: 'var(--color-bg)', paddingY: 80 },
          children: [{
            tag: 'container', options: {}, children: [
              { tag: 'heading', content: 'Bảng Giá', options: {
                level: 'h2', textAlign: 'center', marginBottom: 12, fontWeight: 'var(--font-weight-bold)'
              }},
              { tag: 'paragraph', content: 'Chọn gói phù hợp với nhu cầu của bạn', options: {
                textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: 48
              }},
              { tag: 'row', options: { gap: 24, align: 'stretch', flexDirection: 'row',
                $responsive: { flexDirection: ['column', 'row', 'row'] } }, children: [
                // Free
                { tag: 'card', options: { shadow: 'var(--shadow-sm)', radius: 'var(--radius-lg)', bgColor: 'var(--color-bg-alt)', padding: 'var(--card-padding)', flex: '1' }, children: [
                  { tag: 'heading', content: 'Free', options: { level: 'h3', marginBottom: 8 }},
                  { tag: 'heading', content: '$0 / tháng', options: { level: 'h2', color: 'var(--color-text)', fontWeight: 'var(--font-weight-bold)', marginBottom: 16 }},
                  { tag: 'paragraph', content: '• 5 trang\n• 1GB lưu trữ\n• Hỗ trợ email', options: { color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: 24 }},
                  { tag: 'button', content: 'Bắt Đầu Miễn Phí', options: { variant: 'ghost', size: 'md' }},
                ]},
                // Pro (highlighted)
                { tag: 'card', options: { shadow: 'var(--shadow-lg)', radius: 'var(--radius-lg)', bgColor: 'var(--color-primary)', padding: 'var(--card-padding)', flex: '1' }, children: [
                  { tag: 'heading', content: '⭐ Pro', options: { level: 'h3', color: '#fff', marginBottom: 8 }},
                  { tag: 'heading', content: '$29 / tháng', options: { level: 'h2', color: '#fff', fontWeight: 'var(--font-weight-bold)', marginBottom: 16 }},
                  { tag: 'paragraph', content: '• Không giới hạn trang\n• 50GB lưu trữ\n• Hỗ trợ ưu tiên', options: { color: 'rgba(255,255,255,0.8)', fontSize: 'var(--font-size-sm)', marginBottom: 24 }},
                  { tag: 'button', content: 'Dùng Thử 14 Ngày', options: { variant: 'inverse', size: 'md' }},
                ]},
                // Enterprise
                { tag: 'card', options: { shadow: 'var(--shadow-sm)', radius: 'var(--radius-lg)', bgColor: 'var(--color-bg-alt)', padding: 'var(--card-padding)', flex: '1' }, children: [
                  { tag: 'heading', content: 'Enterprise', options: { level: 'h3', marginBottom: 8 }},
                  { tag: 'heading', content: 'Liên Hệ', options: { level: 'h2', color: 'var(--color-text)', fontWeight: 'var(--font-weight-bold)', marginBottom: 16 }},
                  { tag: 'paragraph', content: '• Không giới hạn\n• 1TB lưu trữ\n• Dedicated support', options: { color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: 24 }},
                  { tag: 'button', content: 'Liên Hệ Sales', options: { variant: 'primary', size: 'md' }},
                ]},
              ]},
            ]
          }]
        }
      },
    ]
  },

  // ─── CTA ───────────────────────────────────────────────────────────────────
  {
    category: 'CTA',
    items: [
      {
        id: 'cta-centered',
        label: 'CTA Centered',
        desc: 'Call-to-action nền màu với nút',
        icon: '🚀',
        preview: 'Nền màu · Tiêu đề · Nút CTA',
        tree: {
          tag: 'section',
          options: { bgColor: 'var(--color-primary)', paddingY: 80, textAlign: 'center' },
          children: [{
            tag: 'container', options: {}, children: [
              { tag: 'heading', content: 'Sẵn Sàng Bắt Đầu?', options: {
                level: 'h2', color: '#fff', textAlign: 'center',
                fontWeight: 'var(--font-weight-bold)', marginBottom: 16
              }},
              { tag: 'paragraph', content: 'Tham gia cùng hàng nghìn khách hàng đang sử dụng dịch vụ của chúng tôi.', options: {
                color: 'rgba(255,255,255,0.8)', textAlign: 'center',
                fontSize: 'var(--font-size-lg)', marginBottom: 32
              }},
              { tag: 'row', options: { justify: 'center', gap: 16, flexDirection: 'row' }, children: [
                { tag: 'button', content: 'Đăng Ký Ngay', options: { variant: 'inverse', size: 'lg' }},
                { tag: 'button', content: 'Tìm Hiểu Thêm', options: { variant: 'outline-light', size: 'lg' }},
              ]},
            ]
          }]
        }
      },
      {
        id: 'cta-newsletter',
        label: 'Newsletter CTA',
        desc: 'Section đăng ký email newsletter',
        icon: '📧',
        preview: 'Tiêu đề · Mô tả · Button đăng ký',
        tree: {
          tag: 'section',
          options: { bgColor: 'var(--color-bg-alt)', paddingY: 64 },
          children: [{
            tag: 'container', options: {}, children: [{
              tag: 'row', options: { align: 'center', justify: 'space-between', gap: 32, flexDirection: 'row',
                $responsive: { flexDirection: ['column', 'row', 'row'] } }, children: [
                { tag: 'column', options: {}, children: [
                  { tag: 'heading', content: 'Nhận Tin Tức Mới Nhất', options: {
                    level: 'h2', fontWeight: 'var(--font-weight-bold)', marginBottom: 8
                  }},
                  { tag: 'paragraph', content: 'Đăng ký để nhận cập nhật sản phẩm và ưu đãi đặc biệt.', options: {
                    color: 'var(--color-text-muted)'
                  }},
                ]},
                { tag: 'column', options: {}, children: [
                  { tag: 'button', content: '📧 Đăng Ký Ngay', options: { variant: 'primary', size: 'lg' }}
                ]},
              ]
            }]
          }]
        }
      },
    ]
  },

  // ─── CONTENT ───────────────────────────────────────────────────────────────
  {
    category: 'Content',
    items: [
      {
        id: 'content-text-img',
        label: 'Text + Ảnh',
        desc: 'Nội dung văn bản bên cạnh ảnh',
        icon: '📝',
        preview: 'Heading + Text | Ảnh',
        tree: {
          tag: 'section',
          options: { bgColor: 'var(--color-bg)', paddingY: 80 },
          children: [{
            tag: 'container', options: {}, children: [{
              tag: 'row', options: { gap: 64, align: 'center', flexDirection: 'row',
                $responsive: { flexDirection: ['column', 'row', 'row'] } }, children: [
                { tag: 'column', options: { flex: '1' }, children: [
                  { tag: 'heading', content: 'Câu Chuyện Của Chúng Tôi', options: {
                    level: 'h2', fontWeight: 'var(--font-weight-bold)', marginBottom: 16
                  }},
                  { tag: 'paragraph', content: 'Được thành lập năm 2010, chúng tôi đã phục vụ hơn 10,000 khách hàng trên toàn quốc. Sứ mệnh của chúng tôi là mang lại giải pháp tốt nhất.', options: {
                    color: 'var(--color-text-muted)', marginBottom: 16, lineHeight: '1.8'
                  }},
                  { tag: 'paragraph', content: 'Đội ngũ của chúng tôi gồm những chuyên gia giàu kinh nghiệm, luôn sẵn sàng hỗ trợ bạn 24/7.', options: {
                    color: 'var(--color-text-muted)', marginBottom: 24, lineHeight: '1.8'
                  }},
                  { tag: 'button', content: 'Về Chúng Tôi', options: { variant: 'primary', size: 'md' }},
                ]},
                { tag: 'column', options: { flex: '1' }, children: [
                  { tag: 'image', options: { src: '', alt: '', width: '100%', objectFit: 'cover', borderRadius: 'var(--radius-lg)' }}
                ]},
              ]
            }]
          }]
        }
      },
      {
        id: 'stats-row',
        label: 'Statistics Row',
        desc: '4 số liệu thống kê ngang',
        icon: '📊',
        preview: '4 stat cards: số + label',
        tree: {
          tag: 'section',
          options: { bgColor: 'var(--color-primary)', paddingY: 60 },
          children: [{
            tag: 'container', options: {}, children: [{
              tag: 'row', options: { gap: 24, justify: 'space-around', flexDirection: 'row',
                $responsive: { flexDirection: ['column', 'row', 'row'] } }, children: [
                ...[ ['10K+', 'Khách Hàng'], ['99%', 'Hài Lòng'], ['50+', 'Nhân Viên'], ['10', 'Năm Kinh Nghiệm'] ].map(([num, label]) => ({
                  tag: 'column',
                  options: {},
                  children: [
                    { tag: 'heading', content: num, options: { level: 'h2', color: '#fff', textAlign: 'center', fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-4xl)', marginBottom: 4 }},
                    { tag: 'paragraph', content: label, options: { color: 'rgba(255,255,255,0.8)', textAlign: 'center', fontSize: 'var(--font-size-sm)' }},
                  ]
                }))
              ]},
            ]
          }]
        }
      },
    ]
  },

  // ─── FOOTER ────────────────────────────────────────────────────────────────
  {
    category: 'Footer',
    items: [
      {
        id: 'footer-simple',
        label: 'Footer Đơn Giản',
        desc: 'Footer với logo + copyright',
        icon: '🔻',
        preview: 'Logo · Links · Copyright',
        tree: {
          tag: 'section',
          options: { bgColor: 'var(--color-bg-dark)', paddingY: 40 },
          children: [{
            tag: 'container', options: {}, children: [
              { tag: 'row', options: { align: 'center', justify: 'space-between', flexDirection: 'row',
                $responsive: { flexDirection: ['column', 'row', 'row'] }, gap: 16, marginBottom: 32 }, children: [
                { tag: 'heading', content: 'Thương Hiệu', options: { level: 'h3', color: '#fff', fontWeight: 'var(--font-weight-bold)' }},
                { tag: 'row', options: { gap: 24 }, children: [
                  { tag: 'button', content: 'Về Chúng Tôi', options: { variant: 'ghost', size: 'sm' }},
                  { tag: 'button', content: 'Dịch Vụ', options: { variant: 'ghost', size: 'sm' }},
                  { tag: 'button', content: 'Liên Hệ', options: { variant: 'ghost', size: 'sm' }},
                ]},
              ]},
              { tag: 'paragraph', content: '© 2026 Thương Hiệu. Bảo lưu mọi quyền.', options: {
                color: 'var(--color-text-muted)', textAlign: 'center', fontSize: 'var(--font-size-sm)'
              }},
            ]
          }]
        }
      },
      {
        id: 'footer-4col',
        label: 'Footer 4 Cột',
        desc: 'Footer đầy đủ với 4 cột links',
        icon: '📑',
        preview: 'Logo col + 3 link columns',
        tree: {
          tag: 'section',
          options: { bgColor: 'var(--color-bg-dark)', paddingY: 60 },
          children: [{
            tag: 'container', options: {}, children: [
              { tag: 'row', options: { gap: 32, flexDirection: 'row', marginBottom: 40,
                $responsive: { flexDirection: ['column', 'row', 'row'] } }, children: [
                { tag: 'column', options: { flex: '2' }, children: [
                  { tag: 'heading', content: 'Thương Hiệu', options: { level: 'h3', color: '#fff', marginBottom: 12 }},
                  { tag: 'paragraph', content: 'Cung cấp giải pháp tốt nhất cho doanh nghiệp của bạn từ năm 2010.', options: {
                    color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', lineHeight: '1.7'
                  }},
                ]},
                ...[ ['Sản Phẩm', ['Tính Năng', 'Bảng Giá', 'Cập Nhật']],
                     ['Công Ty', ['Về Chúng Tôi', 'Blog', 'Tuyển Dụng']],
                     ['Hỗ Trợ', ['Tài Liệu', 'Liên Hệ', 'FAQ']] ].map(([title, links]) => ({
                  tag: 'column', options: { flex: '1' }, children: [
                    { tag: 'heading', content: title, options: { level: 'h4', color: '#fff', marginBottom: 12, fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-bold)' }},
                    ...links.map(link => ({
                      tag: 'paragraph', content: link,
                      options: { color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: 8 }
                    }))
                  ]
                })),
              ]},
              { tag: 'paragraph', content: '© 2026 Thương Hiệu · Chính sách bảo mật · Điều khoản sử dụng', options: {
                color: 'var(--color-text-muted)', textAlign: 'center',
                fontSize: 'var(--font-size-xs)', borderTop: '1px solid rgba(255,255,255,0.1)',
                paddingTop: 24
              }},
            ]
          }]
        }
      },
    ]
  },
]
