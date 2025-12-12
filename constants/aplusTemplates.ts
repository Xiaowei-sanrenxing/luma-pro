import { AmazonAplusTemplate } from '../types';

/**
 * 亚马逊 A+ 模板库
 * MVP 版本：提供 3 种基础模板
 */
export const APLUS_TEMPLATES: AmazonAplusTemplate[] = [
  // === 对比图模板 ===
  {
    id: 'comparison_before_after',
    name: '对比展示 - 前后对照',
    category: 'comparison',
    description: '左右对比布局,展示使用前后效果差异,适合美妆、清洁、修复类产品',
    thumbnail: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=300&h=200&fit=crop',
    modules: [
      {
        id: 'title',
        type: 'text',
        position: { x: 0, y: 0, width: 1464, height: 100 },
        textSlot: { type: 'title', placeholder: '核心卖点标题', maxLength: 50 }
      },
      {
        id: 'before_image',
        type: 'image',
        position: { x: 50, y: 120, width: 680, height: 450 },
        imageSlot: true
      },
      {
        id: 'after_image',
        type: 'image',
        position: { x: 734, y: 120, width: 680, height: 450 },
        imageSlot: true
      }
    ]
  },

  // === 场景图模板 ===
  {
    id: 'scene_lifestyle',
    name: '场景展示 - 生活方式',
    category: 'scene',
    description: '大图展示产品在真实生活场景中的使用效果',
    thumbnail: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=300&h=200&fit=crop',
    modules: [
      {
        id: 'main_scene',
        type: 'image',
        position: { x: 0, y: 0, width: 1464, height: 450 },
        imageSlot: true
      },
      {
        id: 'subtitle',
        type: 'text',
        position: { x: 100, y: 470, width: 1264, height: 130 },
        textSlot: { type: 'subtitle', placeholder: '场景描述文案', maxLength: 100 }
      }
    ]
  },

  // === 功能说明模板 ===
  {
    id: 'feature_icon_list',
    name: '功能说明 - 图标列表',
    category: 'feature',
    description: '左侧产品图 + 右侧5-7个功能卖点列表',
    thumbnail: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=300&h=200&fit=crop',
    modules: [
      {
        id: 'product_image',
        type: 'image',
        position: { x: 50, y: 50, width: 664, height: 500 },
        imageSlot: true
      },
      {
        id: 'features_list',
        type: 'text',
        position: { x: 750, y: 50, width: 664, height: 500 },
        textSlot: { type: 'feature', placeholder: '卖点列表 (每行一个)', maxLength: 500 }
      }
    ]
  }
];

// 模板分类
export const APLUS_CATEGORIES = [
  { id: 'comparison', label: '对比展示', icon: 'ArrowLeftRight', count: 1 },
  { id: 'scene', label: '场景图', icon: 'Image', count: 1 },
  { id: 'detail', label: '细节图', icon: 'ZoomIn', count: 0 },
  { id: 'feature', label: '功能说明', icon: 'Star', count: 1 },
  { id: 'step', label: '使用步骤', icon: 'ListOrdered', count: 0 }
];