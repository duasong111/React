import type { User, Product } from '@/types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: '张三',
    email: 'zhangsan@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhang',
    role: 'admin',
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    name: '李四',
    email: 'lisi@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=li',
    role: 'user',
    createdAt: '2024-02-20T14:45:00Z',
  },
  {
    id: '3',
    name: '王五',
    email: 'wangwu@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wang',
    role: 'user',
    createdAt: '2024-03-10T09:00:00Z',
  },
];

export const mockProducts: Product[] = [
  {
    id: '1',
    name: '智能手表 Pro',
    description: '搭载最新健康监测技术，支持心率、血氧、睡眠质量监测',
    price: 1999,
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=smart%20watch%20product%20photo%20white%20background&image_size=square',
    category: '电子产品',
    stock: 150,
  },
  {
    id: '2',
    name: '无线蓝牙耳机',
    description: '主动降噪，40小时超长续航，Hi-Fi音质',
    price: 599,
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=wireless%20earbuds%20product%20photo%20white%20background&image_size=square',
    category: '电子产品',
    stock: 300,
  },
  {
    id: '3',
    name: '便携充电宝',
    description: '20000mAh大容量，支持快充，轻薄便携',
    price: 199,
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=power%20bank%20product%20photo%20white%20background&image_size=square',
    category: '电子产品',
    stock: 500,
  },
  {
    id: '4',
    name: '机械键盘',
    description: 'RGB背光，热插拔轴体，铝合金外壳',
    price: 899,
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=mechanical%20keyboard%20RGB%20product%20photo&image_size=square',
    category: '电子产品',
    stock: 80,
  },
];

export const navLinks = [
  { label: '首页', href: '/' },
  { label: '功能', href: '#features' },
  { label: '产品', href: '#products' },
  { label: '关于', href: '#about' },
];

export const features = [
  {
    id: '1',
    title: '极致性能',
    description: '服务端渲染 + 流式传输，首屏加载快如闪电',
    icon: 'Zap',
  },
  {
    id: '2',
    title: '安全可靠',
    description: '内置安全防护，CSRF、XSS 自动防御',
    icon: 'Shield',
  },
  {
    id: '3',
    title: '精美设计',
    description: 'Tailwind CSS + shadcn/ui，专业级 UI',
    icon: 'Palette',
  },
  {
    id: '4',
    title: '灵活扩展',
    description: '丰富的插件生态和 API，按需扩展',
    icon: 'Blocks',
  },
];