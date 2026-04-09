export const SECTION_REGISTRY = [

  /* ── Navigation ─────────────────────────────────────────────── */
  {
    name: 'top-bar-basic',
    label: 'Top Bar',
    icon: '▬',
    category: 'Navigation',
    defaultProps: {
      'html-nav': '<a href="home" style="color:#fff;text-decoration:none;">Home</a><a href="about" style="color:#fff;text-decoration:none;">About</a><a href="contact" style="color:#fff;text-decoration:none;">Contact</a>'
    },
    propSchema: [
      { key: 'html-nav', label: 'Nav HTML', type: 'html' }
    ]
  },
  {
    name: 'header-main',
    label: 'Header',
    icon: '🏷',
    category: 'Navigation',
    defaultProps: { title: 'Home  About  Contact' },
    propSchema: [
      { key: 'title', label: 'Nav Links', type: 'text' }
    ]
  },

  /* ── Hero ────────────────────────────────────────────────────── */
  {
    name: 'hero-ceramic',
    label: 'Hero (Ceramic)',
    icon: '🖼',
    category: 'Hero',
    defaultProps: {
      'html-content': '<a href="#s1" style="color:#8B4513;font-weight:600;">Slider 1</a>  <a href="#s2" style="color:#8B4513;font-weight:600;">Slider 2</a>'
    },
    propSchema: [
      { key: 'html-content', label: 'Content HTML', type: 'html' }
    ]
  },
  {
    name: 'banner-overlay',
    label: 'Banner Overlay',
    icon: '🌄',
    category: 'Hero',
    defaultProps: {
      title: 'Welcome to Our Website',
      subtitle: 'Discover amazing products and services tailored for you.',
      'btn-text': 'Get Started',
      'btn-link': '#',
      'btn2-text': 'Learn More',
      'btn2-link': '#',
      'bg-color': '#1e293b',
      'text-color': '#ffffff'
    },
    propSchema: [
      { key: 'title',      label: 'Heading',      type: 'text' },
      { key: 'subtitle',   label: 'Subtitle',     type: 'text' },
      { key: 'btn-text',   label: 'Button 1 Text',type: 'text' },
      { key: 'btn-link',   label: 'Button 1 Link',type: 'text' },
      { key: 'btn2-text',  label: 'Button 2 Text',type: 'text' },
      { key: 'btn2-link',  label: 'Button 2 Link',type: 'text' },
      { key: 'bg-color',   label: 'Background',   type: 'color' },
      { key: 'text-color', label: 'Text Color',   type: 'color' }
    ]
  },
  {
    name: 'banner-split',
    label: 'Banner Split',
    icon: '◫',
    category: 'Hero',
    defaultProps: {
      heading: 'Powerful Features',
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      'btn-text': 'Learn More',
      'btn-link': '#',
      'accent-color': '#3b82f6',
      'img-src': '',
      reverse: 'false'
    },
    propSchema: [
      { key: 'heading',      label: 'Heading',      type: 'text' },
      { key: 'text',         label: 'Body Text',    type: 'html' },
      { key: 'btn-text',     label: 'Button Text',  type: 'text' },
      { key: 'btn-link',     label: 'Button Link',  type: 'text' },
      { key: 'img-src',      label: 'Image URL',    type: 'text' },
      { key: 'accent-color', label: 'Accent Color', type: 'color' },
      { key: 'reverse',      label: 'Image Left',   type: 'select', options: [{value:'false',label:'No (default)'},{value:'true',label:'Yes'}] }
    ]
  },

  /* ── Content ─────────────────────────────────────────────────── */
  {
    name: 'intro-studio',
    label: 'Intro / Text',
    icon: '📝',
    category: 'Content',
    defaultProps: { 'html-main': 'S Media <i>Studio</i>' },
    propSchema: [
      { key: 'html-main', label: 'Main HTML', type: 'html' }
    ]
  },
  {
    name: 'text-block',
    label: 'Text Block',
    icon: '¶',
    category: 'Content',
    defaultProps: {
      heading: 'About Our Story',
      content: 'Write your content here. This block supports <strong>bold</strong>, <em>italic</em>, <a href="#">links</a>, and other inline HTML.',
      align: 'left',
      'max-width': '780px'
    },
    propSchema: [
      { key: 'heading',    label: 'Heading',    type: 'text' },
      { key: 'content',    label: 'Content',    type: 'html' },
      { key: 'align',      label: 'Alignment',  type: 'select', options: [{value:'left',label:'Left'},{value:'center',label:'Center'},{value:'right',label:'Right'}] },
      { key: 'max-width',  label: 'Max Width',  type: 'text' }
    ]
  },
  {
    name: 'title-divider',
    label: 'Title + Divider',
    icon: '⎯',
    category: 'Content',
    defaultProps: {
      title: 'Section Title',
      subtitle: 'A short description for this section goes here.',
      align: 'center',
      'line-color': '#3b82f6'
    },
    propSchema: [
      { key: 'title',       label: 'Title',      type: 'text' },
      { key: 'subtitle',    label: 'Subtitle',   type: 'text' },
      { key: 'align',       label: 'Alignment',  type: 'select', options: [{value:'center',label:'Center'},{value:'left',label:'Left'},{value:'right',label:'Right'}] },
      { key: 'line-color',  label: 'Line Color', type: 'color' }
    ]
  },

  /* ── Layout ──────────────────────────────────────────────────── */
  {
    name: 'columns-2col',
    label: '2 Columns',
    icon: '⬛⬛',
    category: 'Layout',
    defaultProps: {
      heading: '',
      'col1-title': 'Column One',
      'col1-text': 'Content for the first column goes here. Add your text, lists, or descriptions.',
      'col2-title': 'Column Two',
      'col2-text': 'Content for the second column goes here. Keep it balanced with the left.'
    },
    propSchema: [
      { key: 'heading',    label: 'Section Heading', type: 'text' },
      { key: 'col1-title', label: 'Col 1 Title',     type: 'text' },
      { key: 'col1-text',  label: 'Col 1 Text',      type: 'html' },
      { key: 'col2-title', label: 'Col 2 Title',     type: 'text' },
      { key: 'col2-text',  label: 'Col 2 Text',      type: 'html' }
    ]
  },
  {
    name: 'columns-3col',
    label: '3 Columns',
    icon: '⬛⬛⬛',
    category: 'Layout',
    defaultProps: {
      heading: '',
      items: [
        { title: 'Column One',   text: 'Description for the first column.' },
        { title: 'Column Two',   text: 'Description for the second column.' },
        { title: 'Column Three', text: 'Description for the third column.' }
      ]
    },
    propSchema: [
      { key: 'heading', label: 'Section Heading', type: 'text' },
      { key: 'items',   label: 'Items [{title,text}]', type: 'json-array' }
    ]
  },
  {
    name: 'columns-4col',
    label: '4 Columns',
    icon: '||||',
    category: 'Layout',
    defaultProps: {
      heading: '',
      items: [
        { title: 'Col 1', text: 'Short description here.' },
        { title: 'Col 2', text: 'Short description here.' },
        { title: 'Col 3', text: 'Short description here.' },
        { title: 'Col 4', text: 'Short description here.' }
      ]
    },
    propSchema: [
      { key: 'heading', label: 'Section Heading', type: 'text' },
      { key: 'items',   label: 'Items [{title,text}]', type: 'json-array' }
    ]
  },

  /* ── Media ───────────────────────────────────────────────────── */
  {
    name: 'image-single',
    label: 'Image',
    icon: '🖼',
    category: 'Media',
    defaultProps: {
      src: '',
      alt: 'Image',
      caption: '',
      'max-width': '800px',
      align: 'center'
    },
    propSchema: [
      { key: 'src',       label: 'Image URL',  type: 'text' },
      { key: 'alt',       label: 'Alt Text',   type: 'text' },
      { key: 'caption',   label: 'Caption',    type: 'text' },
      { key: 'max-width', label: 'Max Width',  type: 'text' },
      { key: 'align',     label: 'Align',      type: 'select', options: [{value:'center',label:'Center'},{value:'left',label:'Left'},{value:'right',label:'Right'}] }
    ]
  },
  {
    name: 'image-box',
    label: 'Image Box Cards',
    icon: '🃏',
    category: 'Media',
    defaultProps: {
      title: '',
      items: [
        { src: '', heading: 'Feature One',   text: 'Short description here.', link: '#' },
        { src: '', heading: 'Feature Two',   text: 'Short description here.', link: '#' },
        { src: '', heading: 'Feature Three', text: 'Short description here.', link: '#' }
      ]
    },
    propSchema: [
      { key: 'title', label: 'Section Title', type: 'text' },
      { key: 'items', label: 'Items [{src,heading,text,link}]', type: 'json-array' }
    ]
  },
  {
    name: 'gallery-grid',
    label: 'Gallery Grid',
    icon: '⊞',
    category: 'Media',
    defaultProps: {
      title: '',
      cols: '3',
      items: [
        { src: '', caption: 'Photo 1' },
        { src: '', caption: 'Photo 2' },
        { src: '', caption: 'Photo 3' },
        { src: '', caption: 'Photo 4' },
        { src: '', caption: 'Photo 5' },
        { src: '', caption: 'Photo 6' }
      ]
    },
    propSchema: [
      { key: 'title', label: 'Title',   type: 'text' },
      { key: 'cols',  label: 'Columns', type: 'select', options: [{value:'2',label:'2'},{value:'3',label:'3'},{value:'4',label:'4'}] },
      { key: 'items', label: 'Items [{src,caption}]', type: 'json-array' }
    ]
  },
  {
    name: 'video-embed',
    label: 'Video',
    icon: '▶',
    category: 'Media',
    defaultProps: {
      title: '',
      'embed-url': '',
      caption: ''
    },
    propSchema: [
      { key: 'title',     label: 'Section Title',        type: 'text' },
      { key: 'embed-url', label: 'Embed URL (YouTube…)', type: 'text' },
      { key: 'caption',   label: 'Caption',              type: 'text' }
    ]
  },

  /* ── Interactive ─────────────────────────────────────────────── */
  {
    name: 'tabs-section',
    label: 'Tabs',
    icon: '⊡',
    category: 'Interactive',
    defaultProps: {
      title: '',
      tabs: [
        { label: 'Overview',  content: 'Overview content goes here. Add your text, lists, or HTML.' },
        { label: 'Features',  content: 'Feature highlights and details go here.' },
        { label: 'FAQ',       content: 'Frequently asked questions and answers.' }
      ]
    },
    propSchema: [
      { key: 'title', label: 'Section Title', type: 'text' },
      { key: 'tabs',  label: 'Tabs [{label,content}]', type: 'json-array' }
    ]
  },
  {
    name: 'accordion-faq',
    label: 'Accordion / FAQ',
    icon: '▾',
    category: 'Interactive',
    defaultProps: {
      title: 'Frequently Asked Questions',
      items: [
        { question: 'What is this product?',     answer: 'This is a flexible, easy-to-use solution for your needs.' },
        { question: 'How do I get started?',     answer: 'Sign up for an account and follow the onboarding guide.' },
        { question: 'Is there a free trial?',    answer: 'Yes, we offer a 14-day free trial with no credit card required.' },
        { question: 'Can I cancel at any time?', answer: 'Absolutely. You can cancel your subscription at any time.' }
      ]
    },
    propSchema: [
      { key: 'title', label: 'Section Title', type: 'text' },
      { key: 'items', label: 'Items [{question,answer}]', type: 'json-array' }
    ]
  },

  /* ── Cards ───────────────────────────────────────────────────── */
  {
    name: 'features-3col',
    label: 'Features 3 Col',
    icon: '✦',
    category: 'Cards',
    defaultProps: {
      contents: ['Fast Performance', 'Easy to Use', 'Secure & Reliable']
    },
    propSchema: [
      { key: 'contents', label: 'Items (JSON array)', type: 'json-array' }
    ]
  },
  {
    name: 'icon-box-grid',
    label: 'Icon Box Grid',
    icon: '❖',
    category: 'Cards',
    defaultProps: {
      title: '',
      items: [
        { icon: '⚡', heading: 'Fast Performance', text: 'Optimized for speed and efficiency.' },
        { icon: '🛡️', heading: 'Secure & Reliable', text: 'Built with security in mind.' },
        { icon: '🎯', heading: 'Easy to Use',       text: 'Intuitive interface for everyone.' },
        { icon: '📊', heading: 'Analytics',         text: 'Insights to grow your business.' },
        { icon: '🌐', heading: 'Global Reach',      text: 'Serve customers worldwide.' },
        { icon: '💬', heading: '24/7 Support',      text: 'Always here when you need us.' }
      ]
    },
    propSchema: [
      { key: 'title', label: 'Section Title', type: 'text' },
      { key: 'items', label: 'Items [{icon,heading,text}]', type: 'json-array' }
    ]
  },
  {
    name: 'testimonials-grid',
    label: 'Testimonials',
    icon: '💬',
    category: 'Cards',
    defaultProps: {
      title: 'What Our Customers Say',
      items: [
        { quote: 'This product changed our workflow completely. Highly recommend it to any team.', name: 'Alice Johnson', role: 'CEO at Acme Corp', stars: 5 },
        { quote: 'Incredible support and a beautiful product. Best investment we made this year.',  name: 'Bob Smith',     role: 'CTO at TechStart',  stars: 5 },
        { quote: 'Simple, powerful and reliable. We scaled from 0 to 10k users without a hitch.',  name: 'Carol White',   role: 'Founder, NovaCo',   stars: 5 }
      ]
    },
    propSchema: [
      { key: 'title', label: 'Section Title', type: 'text' },
      { key: 'items', label: 'Items [{quote,name,role,stars}]', type: 'json-array' }
    ]
  },
  {
    name: 'team-members',
    label: 'Team Members',
    icon: '👥',
    category: 'Cards',
    defaultProps: {
      title: 'Meet the Team',
      items: [
        { name: 'Alice Johnson', role: 'CEO & Co-Founder',   bio: 'Visionary leader with 15 years in product strategy.' },
        { name: 'Bob Smith',     role: 'Head of Design',     bio: 'Award-winning designer crafting delightful experiences.' },
        { name: 'Carol White',   role: 'Lead Engineer',      bio: 'Full-stack expert who loves clean, scalable code.' },
        { name: 'David Lee',     role: 'Marketing Director', bio: 'Growth hacker with a passion for data-driven campaigns.' }
      ]
    },
    propSchema: [
      { key: 'title', label: 'Section Title', type: 'text' },
      { key: 'items', label: 'Items [{name,role,bio,photo}]', type: 'json-array' }
    ]
  },
  {
    name: 'pricing-table',
    label: 'Pricing Table',
    icon: '💲',
    category: 'Cards',
    defaultProps: {
      title: 'Simple, Transparent Pricing',
      subtitle: 'Choose the plan that works for you.',
      items: [
        { name: 'Starter',  price: '0',  period: 'mo', features: ['5 projects','1 GB storage','Email support'],                                            'btn-text': 'Get started', featured: false },
        { name: 'Pro',      price: '29', period: 'mo', features: ['Unlimited projects','50 GB storage','Priority support','Custom domain'],                 'btn-text': 'Get Pro',     featured: true  },
        { name: 'Business', price: '79', period: 'mo', features: ['Everything in Pro','500 GB storage','SLA guarantee','Dedicated manager'],                'btn-text': 'Contact us',  featured: false }
      ]
    },
    propSchema: [
      { key: 'title',    label: 'Title',    type: 'text' },
      { key: 'subtitle', label: 'Subtitle', type: 'text' },
      { key: 'items',    label: 'Tiers [{name,price,period,features,btn-text,featured}]', type: 'json-array' }
    ]
  },
  {
    name: 'blog-posts-grid',
    label: 'Blog Posts',
    icon: '📰',
    category: 'Cards',
    defaultProps: {
      title: 'Latest Articles',
      items: [
        { title: 'Getting Started with Modern Design',     date: 'Jan 10, 2026', category: 'Design',      excerpt: "A beginner's guide to design principles and tools.", img: '', link: '#' },
        { title: 'How to Build Scalable Web Applications', date: 'Jan 18, 2026', category: 'Development', excerpt: 'Best practices for building apps that grow.',         img: '', link: '#' },
        { title: 'Growing Your Business with Content',     date: 'Feb 2, 2026',  category: 'Marketing',   excerpt: 'Strategies to attract and retain customers.',       img: '', link: '#' }
      ]
    },
    propSchema: [
      { key: 'title', label: 'Section Title', type: 'text' },
      { key: 'items', label: 'Posts [{title,date,category,excerpt,img,link}]', type: 'json-array' }
    ]
  },

  /* ── CTA ─────────────────────────────────────────────────────── */
  {
    name: 'cta-html-1',
    label: 'CTA Button',
    icon: '🔘',
    category: 'CTA',
    defaultProps: {
      'cta-link': '#',
      'cta-text': 'Xem chi tiết'
    },
    propSchema: [
      { key: 'cta-link', label: 'Link URL',    type: 'text' },
      { key: 'cta-text', label: 'Button Text', type: 'text' }
    ]
  },
  {
    name: 'cta-full-banner',
    label: 'CTA Banner',
    icon: '📢',
    category: 'CTA',
    defaultProps: {
      heading: 'Ready to Get Started?',
      subtext: 'Join thousands of happy customers. No credit card required.',
      'btn-text':  'Start Free Trial',
      'btn-link':  '#',
      'btn2-text': 'Learn More',
      'btn2-link': '#',
      'bg-color':   '#1e40af',
      'text-color': '#ffffff'
    },
    propSchema: [
      { key: 'heading',     label: 'Heading',      type: 'text' },
      { key: 'subtext',     label: 'Sub Text',     type: 'text' },
      { key: 'btn-text',    label: 'Btn 1 Text',   type: 'text' },
      { key: 'btn-link',    label: 'Btn 1 Link',   type: 'text' },
      { key: 'btn2-text',   label: 'Btn 2 Text',   type: 'text' },
      { key: 'btn2-link',   label: 'Btn 2 Link',   type: 'text' },
      { key: 'bg-color',    label: 'Background',   type: 'color' },
      { key: 'text-color',  label: 'Text Color',   type: 'color' }
    ]
  },
  {
    name: 'buttons-row',
    label: 'Buttons',
    icon: '⬚',
    category: 'CTA',
    defaultProps: {
      title: '',
      align: 'center',
      items: [
        { text: 'Primary',   link: '#', style: 'primary'   },
        { text: 'Secondary', link: '#', style: 'secondary' },
        { text: 'Outline',   link: '#', style: 'outline'   },
        { text: 'Ghost',     link: '#', style: 'ghost'     },
        { text: 'Danger',    link: '#', style: 'danger'    }
      ]
    },
    propSchema: [
      { key: 'title', label: 'Title',     type: 'text' },
      { key: 'align', label: 'Alignment', type: 'select', options: [{value:'center',label:'Center'},{value:'left',label:'Left'},{value:'right',label:'Right'}] },
      { key: 'items', label: 'Buttons [{text,link,style}]', type: 'json-array' }
    ]
  },

  /* ── Form ────────────────────────────────────────────────────── */
  {
    name: 'contact-form',
    label: 'Contact Form',
    icon: '📨',
    category: 'Form',
    defaultProps: { 'form-title': 'Liên hệ với chúng tôi' },
    propSchema: [
      { key: 'form-title', label: 'Form Title', type: 'text' }
    ]
  },
  {
    name: 'newsletter-form',
    label: 'Newsletter',
    icon: '📧',
    category: 'Form',
    defaultProps: {
      heading: 'Stay in the Loop',
      subtext: 'Get the latest news, updates and tips delivered straight to your inbox.',
      placeholder: 'Enter your email address',
      'btn-text': 'Subscribe',
      'bg-color': '#f8fafc'
    },
    propSchema: [
      { key: 'heading',     label: 'Heading',     type: 'text' },
      { key: 'subtext',     label: 'Sub Text',    type: 'text' },
      { key: 'placeholder', label: 'Placeholder', type: 'text' },
      { key: 'btn-text',    label: 'Button Text', type: 'text' },
      { key: 'bg-color',    label: 'Background',  type: 'color' }
    ]
  },

  /* ── Stats ───────────────────────────────────────────────────── */
  {
    name: 'stats-counter',
    label: 'Stats / Counter',
    icon: '📈',
    category: 'Stats',
    defaultProps: {
      title: '',
      'bg-color': '#1e293b',
      'text-color': '#ffffff',
      items: [
        { number: '10K+', label: 'Happy Customers' },
        { number: '98%',  label: 'Satisfaction Rate' },
        { number: '500+', label: 'Projects Delivered' },
        { number: '24/7', label: 'Support Available' }
      ]
    },
    propSchema: [
      { key: 'title',       label: 'Title',      type: 'text' },
      { key: 'bg-color',    label: 'Background', type: 'color' },
      { key: 'text-color',  label: 'Text Color', type: 'color' },
      { key: 'items',       label: 'Stats [{number,label}]', type: 'json-array' }
    ]
  },

  /* ── Decorative ──────────────────────────────────────────────── */
  {
    name: 'divider-section',
    label: 'Divider',
    icon: '─',
    category: 'Decorative',
    defaultProps: {
      style: 'line',
      text: '',
      color: '#e2e8f0'
    },
    propSchema: [
      { key: 'style', label: 'Style', type: 'select', options: [{value:'line',label:'Line'},{value:'dots',label:'Dots'},{value:'double',label:'Double'},{value:'with-text',label:'With Text'}] },
      { key: 'text',  label: 'Text (for with-text)', type: 'text' },
      { key: 'color', label: 'Color', type: 'color' }
    ]
  },
  {
    name: 'message-box',
    label: 'Message Box',
    icon: '💬',
    category: 'Decorative',
    defaultProps: {
      type: 'info',
      title: '',
      message: 'This is an informational message. Use this to highlight important content.'
    },
    propSchema: [
      { key: 'type',    label: 'Type',    type: 'select', options: [{value:'info',label:'Info'},{value:'success',label:'Success'},{value:'warning',label:'Warning'},{value:'error',label:'Error'}] },
      { key: 'title',   label: 'Title',   type: 'text' },
      { key: 'message', label: 'Message', type: 'html' }
    ]
  },

  /* ── Social ──────────────────────────────────────────────────── */
  {
    name: 'social-links',
    label: 'Social Links',
    icon: '🔗',
    category: 'Social',
    defaultProps: {
      title: 'Follow Us',
      align: 'center',
      items: [
        { platform: 'Facebook',  url: '#', color: '#1877f2' },
        { platform: 'Twitter',   url: '#', color: '#1da1f2' },
        { platform: 'Instagram', url: '#', color: '#e1306c' },
        { platform: 'YouTube',   url: '#', color: '#ff0000' },
        { platform: 'LinkedIn',  url: '#', color: '#0a66c2' }
      ]
    },
    propSchema: [
      { key: 'title', label: 'Label',    type: 'text' },
      { key: 'align', label: 'Align',    type: 'select', options: [{value:'center',label:'Center'},{value:'left',label:'Left'},{value:'right',label:'Right'}] },
      { key: 'items', label: 'Links [{platform,url,color}]', type: 'json-array' }
    ]
  },
  {
    name: 'logo-grid',
    label: 'Logo Grid',
    icon: '🏢',
    category: 'Social',
    defaultProps: {
      title: 'Trusted by Leading Brands',
      items: [
        { name: 'Acme Corp' }, { name: 'Globex' }, { name: 'Initech' },
        { name: 'Umbrella' }, { name: 'Dunder M' }, { name: 'Pied Piper' }
      ]
    },
    propSchema: [
      { key: 'title', label: 'Label', type: 'text' },
      { key: 'items', label: 'Logos [{name,src?}]', type: 'json-array' }
    ]
  },

  /* ── Portfolio ───────────────────────────────────────────────── */
  {
    name: 'portfolio-grid',
    label: 'Portfolio Grid',
    icon: '🗂',
    category: 'Portfolio',
    defaultProps: {
      title: 'Our Work',
      cols: '3',
      items: [
        { title: 'Brand Identity',    category: 'Design',      color: '#8b5cf6', src: '' },
        { title: 'E-commerce App',    category: 'Development', color: '#3b82f6', src: '' },
        { title: 'SEO Campaign',      category: 'Marketing',   color: '#f59e0b', src: '' },
        { title: 'Mobile App',        category: 'Development', color: '#10b981', src: '' },
        { title: 'Logo Design',       category: 'Design',      color: '#ec4899', src: '' },
        { title: 'Content Strategy',  category: 'Marketing',   color: '#f97316', src: '' }
      ]
    },
    propSchema: [
      { key: 'title', label: 'Title',   type: 'text' },
      { key: 'cols',  label: 'Columns', type: 'select', options: [{value:'2',label:'2'},{value:'3',label:'3'},{value:'4',label:'4'}] },
      { key: 'items', label: 'Items [{title,category,color,src?}]', type: 'json-array' }
    ]
  },

  /* ── Footer ──────────────────────────────────────────────────── */
  {
    name: 'footer-basic',
    label: 'Footer',
    icon: '▬',
    category: 'Footer',
    defaultProps: {
      'footer-text': '© 2026 My Company. All rights reserved.'
    },
    propSchema: [
      { key: 'footer-text', label: 'Footer Text', type: 'text' }
    ]
  }
];

export function getSectionMeta(name) {
  return SECTION_REGISTRY.find((s) => s.name === name) || null;
}

export function createSectionFromRegistry(name) {
  const meta = getSectionMeta(name);
  if (!meta) return { name };
  return { name, ...meta.defaultProps };
}
