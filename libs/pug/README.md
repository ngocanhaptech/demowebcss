
Puck + Semi Design + Google Sheets + GitHub Actions
Đây là hệ thống No-Server Page Builder cho phép admin kéo thả tạo landing page → lưu JSON vào Google Sheets → GitHub Actions build thành static site.

🏗️ TỔNG QUAN KIẾN TRÚC
text
Admin (localhost)          Google Sheets           Static Website
┌─────────────────┐       ┌──────────────┐        ┌─────────────────┐
│  /admin/builder │  →    │ Layout_Data  │  →     │  Puck <Render>  │
│  Puck Editor    │ JSON  │  (cột JSON)  │ Build  │  Semi Design    │
│  Semi Blocks    │       │              │        │  Components     │
└─────────────────┘       └──────────────┘        └─────────────────┘
                                                   ↑
                                            GitHub Actions
                                            (kéo JSON về, build)
BƯỚC 1: KHỞI TẠO DỰ ÁN NEXT.JS
1.1 Tạo project Next.js mới
bash
npx create-next-app@latest my-landing-builder \
  --typescript \
  --tailwind \
  --app \
  --src-dir

cd my-landing-builder
1.2 Cài đặt Puck và Semi Design
bash
# Cài Puck editor
npm install @puckeditor/core

# Cài Semi Design
npm install @douyinfe/semi-ui @douyinfe/semi-icons

# Cài thư viện hỗ trợ Google Sheets
npm install googleapis

# Cài thư viện utility
npm install axios
1.3 Cấu hình next.config.ts
ts
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',        // Static export cho GitHub Pages
  trailingSlash: true,
  images: {
    unoptimized: true,     // Bắt buộc khi static export
  },
};

export default nextConfig;
1.4 Cấu hình Semi Design trong app/layout.tsx
tsx
// app/layout.tsx
import '@douyinfe/semi-ui/dist/css/semi.min.css';
import '@puckeditor/core/dist/index.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
BƯỚC 2: TẠO CÁC SEMI DESIGN BLOCKS CHO PUCK
Mỗi block là một React Component bình thường bọc Semi Design, sau đó đăng ký vào Puck config.
​

2.1 Tạo cấu trúc thư mục
text
src/
├── blocks/
│   ├── HeroBlock.tsx        ← Block Hero
│   ├── PricingBlock.tsx     ← Block Pricing
│   ├── FeatureBlock.tsx     ← Block Features
│   ├── CTABlock.tsx         ← Block CTA
│   └── index.ts             ← Export tất cả
├── puck/
│   ├── config.tsx           ← Puck config tổng
│   └── types.ts             ← TypeScript types
└── app/
    ├── admin/
    │   └── builder/
    │       └── page.tsx     ← Trang editor (localhost only)
    ├── [slug]/
    │   └── page.tsx         ← Trang viewer (static)
    └── page.tsx
2.2 Tạo HeroBlock.tsx
tsx
// src/blocks/HeroBlock.tsx
import { Typography, Button, Space } from '@douyinfe/semi-ui';
import type { ComponentConfig } from '@puckeditor/core';

const { Title, Text } = Typography;

type HeroProps = {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  backgroundColor: string;
  backgroundImage: string;
};

export const HeroBlock: ComponentConfig<HeroProps> = {
  label: '🦸 Hero Section',

  // Khai báo các fields có thể edit trong Puck sidebar
  fields: {
    title: {
      type: 'text',
      label: 'Tiêu đề chính',
    },
    subtitle: {
      type: 'textarea',
      label: 'Mô tả phụ',
    },
    ctaText: {
      type: 'text',
      label: 'Text nút CTA',
    },
    ctaLink: {
      type: 'text',
      label: 'Link nút CTA',
    },
    backgroundColor: {
      type: 'select',
      label: 'Màu nền',
      options: [
        { label: 'Trắng', value: '#ffffff' },
        { label: 'Xanh nhạt', value: '#e8f4f8' },
        { label: 'Tối', value: '#1c1e21' },
      ],
    },
    backgroundImage: {
      type: 'text',
      label: 'URL ảnh nền (để trống nếu không dùng)',
    },
  },

  // Default values khi block được kéo vào
  defaultProps: {
    title: 'Tiêu đề Landing Page',
    subtitle: 'Mô tả ngắn gọn về sản phẩm/dịch vụ của bạn',
    ctaText: 'Bắt đầu ngay',
    ctaLink: '#',
    backgroundColor: '#ffffff',
    backgroundImage: '',
  },

  // Render UI dùng Semi Design
  render: ({ title, subtitle, ctaText, ctaLink, backgroundColor, backgroundImage }) => {
    const style: React.CSSProperties = {
      padding: '80px 40px',
      textAlign: 'center',
      backgroundColor,
      backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };

    return (
      <div style={style}>
        <Title heading={1} style={{ marginBottom: 16 }}>
          {title}
        </Title>
        <Text size="large" style={{ display: 'block', marginBottom: 32, maxWidth: 600, margin: '0 auto 32px' }}>
          {subtitle}
        </Text>
        <Button
          theme="solid"
          type="primary"
          size="large"
          onClick={() => window.location.href = ctaLink}
        >
          {ctaText}
        </Button>
      </div>
    );
  },
};
2.3 Tạo PricingBlock.tsx
tsx
// src/blocks/PricingBlock.tsx
import { Card, Tag, Button, Typography, Divider } from '@douyinfe/semi-ui';
import type { ComponentConfig } from '@puckeditor/core';

const { Title, Text } = Typography;

type Plan = {
  name: string;
  price: string;
  period: string;
  features: string;   // Puck chưa hỗ trợ array field → dùng string phân cách bởi dấu \n
  isHighlighted: boolean;
  ctaText: string;
};

type PricingProps = {
  sectionTitle: string;
  plan1: Plan;
  plan2: Plan;
  plan3: Plan;
};

const PlanCard = ({ plan }: { plan: Plan }) => {
  const features = plan.features.split('\n').filter(Boolean);
  
  return (
    <Card
      style={{
        flex: 1,
        minWidth: 260,
        border: plan.isHighlighted ? '2px solid var(--semi-color-primary)' : undefined,
        position: 'relative',
      }}
    >
      {plan.isHighlighted && (
        <Tag color="blue" style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)' }}>
          Phổ biến nhất
        </Tag>
      )}
      <Title heading={3}>{plan.name}</Title>
      <div style={{ margin: '16px 0' }}>
        <Title heading={2} style={{ display: 'inline' }}>{plan.price}</Title>
        <Text type="secondary">/{plan.period}</Text>
      </div>
      <Divider />
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {features.map((f, i) => (
          <li key={i} style={{ padding: '4px 0' }}>✓ {f}</li>
        ))}
      </ul>
      <Button
        block
        theme={plan.isHighlighted ? 'solid' : 'light'}
        type="primary"
        style={{ marginTop: 16 }}
      >
        {plan.ctaText}
      </Button>
    </Card>
  );
};

export const PricingBlock: ComponentConfig<PricingProps> = {
  label: '💰 Pricing Table',

  fields: {
    sectionTitle: { type: 'text', label: 'Tiêu đề mục' },
    plan1: {
      type: 'object',
      label: 'Gói 1',
      objectFields: {
        name: { type: 'text', label: 'Tên gói' },
        price: { type: 'text', label: 'Giá' },
        period: { type: 'text', label: 'Chu kỳ (tháng/năm)' },
        features: { type: 'textarea', label: 'Tính năng (mỗi dòng 1 tính năng)' },
        isHighlighted: { type: 'radio', label: 'Nổi bật?', options: [
          { label: 'Có', value: true },
          { label: 'Không', value: false },
        ]},
        ctaText: { type: 'text', label: 'Text nút' },
      },
    },
    plan2: { /* tương tự plan1 */ type: 'object', label: 'Gói 2', objectFields: {} },
    plan3: { /* tương tự plan1 */ type: 'object', label: 'Gói 3', objectFields: {} },
  },

  defaultProps: {
    sectionTitle: 'Bảng giá của chúng tôi',
    plan1: { name: 'Starter', price: '199.000đ', period: 'tháng', features: 'Tính năng 1\nTính năng 2\nTính năng 3', isHighlighted: false, ctaText: 'Chọn gói này' },
    plan2: { name: 'Pro', price: '499.000đ', period: 'tháng', features: 'Tất cả gói Starter\nTính năng Pro 1\nTính năng Pro 2\nSupport ưu tiên', isHighlighted: true, ctaText: 'Bắt đầu ngay' },
    plan3: { name: 'Enterprise', price: 'Liên hệ', period: 'tháng', features: 'Tất cả gói Pro\nCustom integration\nSLA 99.9%\nDedicated support', isHighlighted: false, ctaText: 'Liên hệ ngay' },
  },

  render: ({ sectionTitle, plan1, plan2, plan3 }) => (
    <div style={{ padding: '60px 40px' }}>
      <Title heading={2} style={{ textAlign: 'center', marginBottom: 40 }}>
        {sectionTitle}
      </Title>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
        <PlanCard plan={plan1} />
        <PlanCard plan={plan2} />
        <PlanCard plan={plan3} />
      </div>
    </div>
  ),
};
2.4 Export tất cả blocks
ts
// src/blocks/index.ts
export { HeroBlock } from './HeroBlock';
export { PricingBlock } from './PricingBlock';
// Thêm các block khác ở đây sau
BƯỚC 3: CẤU HÌNH PUCK CONFIG
tsx
// src/puck/config.tsx
import type { Config } from '@puckeditor/core';
import { HeroBlock, PricingBlock } from '../blocks';

export type PageData = {
  // Nếu cần thêm metadata chung cho toàn page
};

// Config này dùng CHUNG cho cả Editor và Renderer
// → Đảm bảo output JSON luôn render đúng
export const puckConfig: Config = {
  components: {
    Hero: HeroBlock,
    Pricing: PricingBlock,
    // Thêm block mới → thêm vào đây
  },
};
BƯỚC 4: TẠO TRANG ADMIN EDITOR
Trang này chỉ chạy ở localhost, không build vào static export.
​

tsx
// src/app/admin/builder/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Puck, type Data } from '@puckeditor/core';
import { Button, Toast, Modal, Input } from '@douyinfe/semi-ui';
import { puckConfig } from '@/puck/config';

// Dữ liệu rỗng cho trang mới
const INITIAL_DATA: Data = {
  content: [],
  root: { props: {} },
};

export default function BuilderPage() {
  const [pageData, setPageData] = useState<Data>(INITIAL_DATA);
  const [isSaving, setIsSaving] = useState(false);
  const [jsonOutput, setJsonOutput] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Load JSON từ localStorage nếu có (để tiếp tục edit)
  useEffect(() => {
    const saved = localStorage.getItem('puck_draft');
    if (saved) {
      try {
        setPageData(JSON.parse(saved));
      } catch (e) {
        console.error('Lỗi parse draft:', e);
      }
    }
  }, []);

  // Xử lý khi bấm nút "Lưu / Publish"
  const handlePublish = async (data: Data) => {
    setIsSaving(true);

    // 1. Lưu draft vào localStorage
    localStorage.setItem('puck_draft', JSON.stringify(data));

    // 2. Convert sang JSON string để paste vào Google Sheets
    const jsonString = JSON.stringify(data);
    setJsonOutput(jsonString);

    // 3. (Tùy chọn) Tự động ghi vào Google Sheets qua API route
    // await saveToGoogleSheets(jsonString);

    setIsSaving(false);
    setShowModal(true);

    Toast.success('Layout đã được xuất JSON thành công!');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonOutput);
    Toast.success('Đã copy JSON vào clipboard! Paste vào cột Layout_Data trên Google Sheets.');
  };

  return (
    <div style={{ height: '100vh' }}>
      <Puck
        config={puckConfig}
        data={pageData}
        onPublish={handlePublish}
        // Tùy chỉnh nút Publish trong header của Puck
        overrides={{
          headerActions: ({ children }) => (
            <>
              {children}
              <Button
                loading={isSaving}
                theme="solid"
                type="primary"
                onClick={() => {
                  // Trigger publish từ ngoài nếu cần
                }}
              >
                💾 Lưu & Xuất JSON
              </Button>
            </>
          ),
        }}
      />

      {/* Modal hiển thị JSON output */}
      <Modal
        title="📋 JSON Layout Data"
        visible={showModal}
        onCancel={() => setShowModal(false)}
        width={800}
        footer={
          <Button theme="solid" type="primary" onClick={copyToClipboard}>
            📋 Copy JSON
          </Button>
        }
      >
        <p style={{ marginBottom: 12, color: 'var(--semi-color-text-2)' }}>
          Copy đoạn JSON bên dưới và paste vào cột <code>Layout_Data</code> trong Google Sheets:
        </p>
        <Input.TextArea
          value={jsonOutput}
          rows={15}
          style={{ fontFamily: 'monospace', fontSize: 12 }}
          readOnly
        />
      </Modal>
    </div>
  );
}
4.1 Loại trừ /admin khỏi static export
ts
// next.config.ts (cập nhật)
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },

  // Khi build tĩnh, không generate trang /admin
  // Chạy file này chỉ khi DEV (localhost)
  exportPathMap: async function (defaultPathMap) {
    const paths = { ...defaultPathMap };
    // Xóa trang admin khỏi build tĩnh
    delete paths['/admin/builder'];
    return paths;
  },
};
BƯỚC 5: SETUP GOOGLE SHEETS LÀM "DATABASE"
5.1 Tạo Google Sheets
Tạo sheet với cấu trúc:

Cột A	Cột B	Cột C	Cột D
Page_ID	Page_Slug	Page_Title	Layout_Data
1	home	Trang chủ	{"content":[...],"root":{}}
2	pricing	Bảng giá	{"content":[...],"root":{}}
5.2 Lấy Google Sheets API Key
Vào Google Cloud Console

Tạo project mới → Enable Google Sheets API

Vào Credentials → Create API Key

Restrict key chỉ cho Sheets API

Copy API Key

5.3 Lấy Spreadsheet ID
URL Google Sheets: https://docs.google.com/spreadsheets/d/**SPREADSHEET_ID**/edit

5.4 Lưu vào .env.local
bash
# .env.local (KHÔNG commit file này lên GitHub)
GOOGLE_SHEETS_API_KEY=AIzaSy...........
GOOGLE_SPREADSHEET_ID=1BxiMVs0XRA5nFMd...........
GOOGLE_SHEET_NAME=Pages

# Cũng cần cho GitHub Actions
BƯỚC 6: TẠO UTILITY FETCH DỮ LIỆU TỪ GOOGLE SHEETS
ts
// src/lib/googleSheets.ts

export type PageRecord = {
  pageId: string;
  slug: string;
  title: string;
  layoutData: string; // JSON string từ Puck
};

export async function getAllPages(): Promise<PageRecord[]> {
  const apiKey = process.env.GOOGLE_SHEETS_API_KEY!;
  const sheetId = process.env.GOOGLE_SPREADSHEET_ID!;
  const sheetName = process.env.GOOGLE_SHEET_NAME || 'Pages';

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}?key=${apiKey}`;

  const res = await fetch(url, {
    // Cache control cho build time
    next: { revalidate: 0 }
  });

  if (!res.ok) {
    throw new Error(`Lỗi fetch Google Sheets: ${res.statusText}`);
  }

  const json = await res.json();
  const rows: string[][] = json.values || [];

  // Bỏ header row (row đầu tiên)
  return rows.slice(1).map((row) => ({
    pageId: row[0] || '',
    slug: row[1] || '',
    title: row[2] || '',
    layoutData: row[3] || '{"content":[],"root":{}}',
  }));
}

export async function getPageBySlug(slug: string): Promise<PageRecord | null> {
  const pages = await getAllPages();
  return pages.find((p) => p.slug === slug) || null;
}
BƯỚC 7: TẠO TRANG VIEWER (STATIC RENDERER)
Đây là trang hiển thị cho người xem, hoàn toàn static, chỉ đọc JSON và render.

tsx
// src/app/[slug]/page.tsx

import { Render } from '@puckeditor/core';
import '@puckeditor/core/dist/index.css';
import { puckConfig } from '@/puck/config';
import { getAllPages, getPageBySlug } from '@/lib/googleSheets';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

type Props = {
  params: { slug: string };
};

// Bước này chạy khi GitHub Actions build
// Nó kéo tất cả slugs từ Google Sheets và pre-render
export async function generateStaticParams() {
  const pages = await getAllPages();
  return pages.map((page) => ({
    slug: page.slug,
  }));
}

// SEO metadata động từ Google Sheets
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getPageBySlug(params.slug);
  if (!page) return { title: 'Không tìm thấy trang' };

  return {
    title: page.title,
    // Có thể thêm description từ Sheets nếu cần
  };
}

// Component render trang
export default async function LandingPage({ params }: Props) {
  const page = await getPageBySlug(params.slug);

  if (!page) {
    notFound();
  }

  // Parse JSON từ Google Sheets
  let layoutData;
  try {
    layoutData = JSON.parse(page.layoutData);
  } catch (e) {
    console.error('Lỗi parse layout data:', e);
    layoutData = { content: [], root: {} };
  }

  return (
    // Puck Render chỉ nhận data + config, render ra HTML tĩnh
    // Không cần server, không cần JS runtime cho phần này
    <Render
      config={puckConfig}
      data={layoutData}
    />
  );
}
BƯỚC 8: TẠO GITHUB ACTIONS WORKFLOW
File này tự động pull JSON từ Google Sheets và build website mỗi khi có thay đổi.

text
# .github/workflows/deploy.yml

name: Build & Deploy Static Site

on:
  push:
    branches: [main]
  
  # Trigger thủ công từ GitHub UI
  workflow_dispatch:
  
  # Tự động build mỗi ngày lúc 7h sáng (UTC+7 = 0h UTC)
  schedule:
    - cron: '0 0 * * *'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      # 1. Checkout source code
      - name: Checkout
        uses: actions/checkout@v4
      
      # 2. Setup Node.js
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      # 3. Install dependencies
      - name: Install dependencies
        run: npm ci
      
      # 4. Build Next.js static export
      # GitHub Secrets được inject vào đây như env variables
      - name: Build static site
        run: npm run build
        env:
          GOOGLE_SHEETS_API_KEY: ${{ secrets.GOOGLE_SHEETS_API_KEY }}
          GOOGLE_SPREADSHEET_ID: ${{ secrets.GOOGLE_SPREADSHEET_ID }}
          GOOGLE_SHEET_NAME: ${{ secrets.GOOGLE_SHEET_NAME }}
      
      # 5. Deploy lên GitHub Pages
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./out    # Thư mục output của next export
          cname: yourdomain.com # Custom domain (nếu có)
8.1 Setup GitHub Secrets
Vào GitHub Repo → Settings → Secrets and variables → Actions → New repository secret:

Secret Name	Giá trị
GOOGLE_SHEETS_API_KEY	API Key từ Google Cloud
GOOGLE_SPREADSHEET_ID	ID của Google Sheets
GOOGLE_SHEET_NAME	Tên sheet (vd: Pages)
BƯỚC 9: HOÀN THIỆN WORKFLOW THỰC TẾ
9.1 Quy trình Admin (Bạn)
bash
# 1. Chạy dev server
npm run dev

# 2. Mở browser: http://localhost:3000/admin/builder
# 3. Kéo thả blocks trong Puck
# 4. Bấm "Lưu & Xuất JSON" → Copy JSON từ popup
# 5. Mở Google Sheets → Paste JSON vào cột Layout_Data
# 6. Push code lên GitHub → Actions tự động build
9.2 Kích hoạt build thủ công (không cần push code)
bash
# Cách 1: Qua GitHub UI
# Vào Actions tab → Chọn workflow → Run workflow

# Cách 2: Qua GitHub CLI
gh workflow run deploy.yml

# Cách 3: Tạo API endpoint để trigger từ admin page
# Thêm nút "Publish to Live" trong /admin/builder
9.3 Thêm nút "Trigger Build" vào Admin page
tsx
// Thêm vào BuilderPage component

const triggerGitHubBuild = async () => {
  // Gọi GitHub API để trigger workflow_dispatch
  const response = await fetch('/api/trigger-build', { 
    method: 'POST' 
  });
  if (response.ok) {
    Toast.success('🚀 Đã gửi lệnh build! Website sẽ cập nhật trong ~2-3 phút.');
  }
};

// Tạo API route: src/app/api/trigger-build/route.ts
// (Chỉ dùng khi dev, không ảnh hưởng static export)
ts
// src/app/api/trigger-build/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
  const GITHUB_TOKEN = process.env.GITHUB_PERSONAL_TOKEN!;
  const REPO_OWNER = process.env.GITHUB_REPO_OWNER!;
  const REPO_NAME = process.env.GITHUB_REPO_NAME!;

  const res = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/deploy.yml/dispatches`,
    {
      method: 'POST',
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({ ref: 'main' }),
    }
  );

  if (!res.ok) {
    return NextResponse.json({ error: 'Build trigger failed' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
BƯỚC 10: THÊM BLOCKS MỚI (MỞ RỘNG)
Khi cần thêm block mới, chỉ cần làm 2 việc:
​

tsx
// 1. Tạo file block mới: src/blocks/TeamBlock.tsx
import { Avatar, Typography } from '@douyinfe/semi-ui';
import type { ComponentConfig } from '@puckeditor/core';

type TeamProps = {
  title: string;
  members: string; // JSON string của array
};

export const TeamBlock: ComponentConfig<TeamProps> = {
  label: '👥 Team Section',
  fields: {
    title: { type: 'text', label: 'Tiêu đề' },
    members: { type: 'textarea', label: 'Members (JSON array)' },
  },
  defaultProps: {
    title: 'Đội ngũ của chúng tôi',
    members: '[{"name":"Nguyễn Văn A","role":"CEO","avatar":"https://..."}]',
  },
  render: ({ title, members }) => {
    const team = JSON.parse(members || '[]');
    return (
      <div style={{ padding: '60px 40px', textAlign: 'center' }}>
        <Typography.Title heading={2}>{title}</Typography.Title>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}>
          {team.map((m: any, i: number) => (
            <div key={i}>
              <Avatar src={m.avatar} size="extra-large" />
              <Typography.Text strong style={{ display: 'block' }}>{m.name}</Typography.Text>
              <Typography.Text type="secondary">{m.role}</Typography.Text>
            </div>
          ))}
        </div>
      </div>
    );
  },
};
ts
// 2. Đăng ký vào config: src/puck/config.tsx
import { TeamBlock } from '../blocks/TeamBlock'; // Thêm import

export const puckConfig: Config = {
  components: {
    Hero: HeroBlock,
    Pricing: PricingBlock,
    Team: TeamBlock,   // ← Thêm 1 dòng là xong!
  },
};
📁 PACKAGE.JSON SCRIPTS
json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "build:static": "next build && next export"
  }
}
✅ CHECKLIST HOÀN THÀNH
Setup (1 lần duy nhất)
 Init Next.js project + cài Puck + Semi Design

 Tạo blocks HeroBlock, PricingBlock

 Tạo puck/config.tsx import tất cả blocks

 Tạo trang /admin/builder với Puck editor

 Tạo Google Sheets với đúng cấu trúc cột

 Tạo Google Cloud project + lấy API Key

 Tạo src/lib/googleSheets.ts

 Tạo trang [slug]/page.tsx (viewer)

 Tạo .github/workflows/deploy.yml

 Thêm GitHub Secrets (API key, Sheet ID)

 Enable GitHub Pages trong repo settings

Mỗi khi tạo trang mới
 Chạy npm run dev

 Mở localhost:3000/admin/builder

 Kéo thả blocks tạo layout

 Bấm "Lưu & Xuất JSON" → Copy JSON

 Paste vào cột Layout_Data trong Google Sheets

 Trigger GitHub Actions build

 Kiểm tra trang live sau 2-3 phút