import { AmazonAplusTemplate } from '../types';

/**
 * 亚马逊 A+ 模板库 - 婚礼配饰专业版
 * 针对头纱、披肩、手套、衬裙、腰带、头饰等婚礼配饰产品
 * 优化：采用极简设计原则，减少文字，增加留白
 */
export const APLUS_TEMPLATES: AmazonAplusTemplate[] = [
  // === 简洁对比模板 ===
  {
    id: 'minimal_comparison',
    name: '极简对比 - 效果对比',
    category: 'comparison',
    description: '干净简洁的对比展示，突出产品使用前后的变化',
    thumbnail: 'https://placehold.co/300x200/F472B6/FFFFFF/png?text=Before+%2F+After',
    modules: [
      {
        id: 'before_image',
        type: 'image',
        position: { x: 50, y: 100, width: 680, height: 400 },
        imageSlot: true
      },
      {
        id: 'after_image',
        type: 'image',
        position: { x: 734, y: 100, width: 680, height: 400 },
        imageSlot: true
      },
      {
        id: 'simple_title',
        type: 'text',
        position: { x: 0, y: 0, width: 1464, height: 80 },
        textSlot: { type: 'title', placeholder: 'BEAUTIFUL TRANSFORMATION', maxLength: 30 }
      }
    ]
  },
  // === 对比图模板 ===
  {
    id: 'comparison_before_after',
    name: '产品对比 - 戴用前后',
    category: 'comparison',
    description: '展示新娘配饰戴用前后的变化效果，突出产品的装饰性和提升气质效果',
    thumbnail: 'https://placehold.co/300x200/F472B6/FFFFFF/png?text=Before+%2F+After',
    modules: [
      {
        id: 'title',
        type: 'text',
        position: { x: 0, y: 0, width: 1464, height: 100 },
        textSlot: { type: 'title', placeholder: '优雅新娘，完美婚礼', maxLength: 50 }
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

  // === 大图场景模板 ===
  {
    id: 'hero_scene',
    name: '主角场景 - 浪漫时刻',
    category: 'scene',
    description: '大图展示配饰在婚礼场景中的应用，简洁标题',
    thumbnail: 'https://placehold.co/300x200/60A5FA/FFFFFF/png?text=Hero+Scene',
    modules: [
      {
        id: 'main_scene',
        type: 'image',
        position: { x: 0, y: 0, width: 1464, height: 520 },
        imageSlot: true
      },
      {
        id: 'short_title',
        type: 'text',
        position: { x: 100, y: 540, width: 1264, height: 60 },
        textSlot: { type: 'title', placeholder: 'YOUR PERFECT DAY', maxLength: 25 }
      }
    ]
  },

  // === 极简功能模板 ===
  {
    id: 'minimal_features',
    name: '核心卖点 - 精简要点',
    category: 'feature',
    description: '产品左图，右侧3个核心卖点，配合图标',
    thumbnail: 'https://placehold.co/300x200/FBBF24/FFFFFF/png?text=Key+Features',
    modules: [
      {
        id: 'product_image',
        type: 'image',
        position: { x: 50, y: 100, width: 664, height: 400 },
        imageSlot: true
      },
      {
        id: 'three_benefits',
        type: 'text',
        position: { x: 750, y: 100, width: 664, height: 400 },
        textSlot: { type: 'feature', placeholder: '✓ Premium Quality\n✓ Comfortable Fit\n✓ Elegant Design', maxLength: 200 }
      }
    ]
  },

  // === 特写细节模板 ===
  {
    id: 'macro_detail',
    name: '特写细节 - 一眼看穿',
    category: 'detail',
    description: '大图特写展示一个关键细节，简短说明',
    thumbnail: 'https://placehold.co/300x200/34D399/FFFFFF/png?text=Detail',
    modules: [
      {
        id: 'detail_main',
        type: 'image',
        position: { x: 0, y: 0, width: 1464, height: 560 },
        imageSlot: true
      },
      {
        id: 'detail_tag',
        type: 'text',
        position: { x: 100, y: 570, width: 1264, height: 50 },
        textSlot: { type: 'description', placeholder: 'HANDCRAFTED DETAIL', maxLength: 30 }
      }
    ]
  },

  // === 模特展示模板 ===
  {
    id: 'model_showcase',
    name: '模特展示 - 风格搭配',
    category: 'scene',
    description: '专业模特展示不同风格的婚礼配饰搭配效果',
    thumbnail: 'https://placehold.co/300x200/60A5FA/FFFFFF/png?text=Model+Style',
    modules: [
      {
        id: 'model_main',
        type: 'image',
        position: { x: 0, y: 0, width: 1464, height: 550 },
        imageSlot: true
      },
      {
        id: 'model_desc',
        type: 'text',
        position: { x: 80, y: 570, width: 1304, height: 80 },
        textSlot: { type: 'description', placeholder: '简约优雅风格，适合各种婚礼场合', maxLength: 80 }
      }
    ]
  },

  // === 使用场景模板 ===
  {
    id: 'usage_scenarios',
    name: '使用场景 - 多场合适用',
    category: 'scene',
    description: '展示婚礼配饰在不同场合的应用效果',
    thumbnail: 'https://placehold.co/300x200/60A5FA/FFFFFF/png?text=Usage+Scenes',
    modules: [
      {
        id: 'scene_main',
        type: 'image',
        position: { x: 0, y: 0, width: 1464, height: 500 },
        imageSlot: true
      },
      {
        id: 'scene_desc',
        type: 'text',
        position: { x: 80, y: 520, width: 1304, height: 100 },
        textSlot: { type: 'description', placeholder: '适用于：婚礼仪式、拍照留念、晚宴派对等多种场合', maxLength: 100 }
      }
    ]
  },

  // === 产品组合模板 ===
  {
    id: 'product_collection',
    name: '产品组合 - 套装展示',
    category: 'feature',
    description: '展示相关婚礼配饰的搭配组合效果',
    thumbnail: 'https://placehold.co/300x200/FBBF24/FFFFFF/png?text=Product+Set',
    modules: [
      {
        id: 'collection_main',
        type: 'image',
        position: { x: 0, y: 0, width: 1464, height: 480 },
        imageSlot: true
      },
      {
        id: 'collection_desc',
        type: 'text',
        position: { x: 80, y: 500, width: 1304, height: 120 },
        textSlot: { type: 'description', placeholder: '婚礼配饰套装：头纱+手套+披肩，完美搭配，一体展现', maxLength: 120 }
      }
    ]
  },

  // === 数字展示模板 ===
  {
    id: 'number_showcase',
    name: '数据亮点 - 数字说话',
    category: 'feature',
    description: '用大号数字展示核心优势，极简设计',
    thumbnail: 'https://placehold.co/300x200/FBBF24/FFFFFF/png?text=Data',
    modules: [
      {
        id: 'product_center',
        type: 'image',
        position: { x: 482, y: 50, width: 500, height: 350 },
        imageSlot: true
      },
      {
        id: 'three_numbers',
        type: 'text',
        position: { x: 0, y: 420, width: 1464, height: 200 },
        textSlot: { type: 'feature', placeholder: '100%\nHANDMADE\n\n24h\nFAST SHIPPING\n\n50K+\nHAPPY BRIDES', maxLength: 100 }
      }
    ]
  },

  // === 材质展示模板 ===
  {
    id: 'material_quality',
    name: '材质展示 - 品质保证',
    category: 'detail',
    description: '特写展示婚礼配饰的优质材质',
    thumbnail: 'https://placehold.co/300x200/34D399/FFFFFF/png?text=Material+Quality',
    modules: [
      {
        id: 'material_main',
        type: 'image',
        position: { x: 0, y: 0, width: 1464, height: 550 },
        imageSlot: true
      },
      {
        id: 'material_desc',
        type: 'text',
        position: { x: 80, y: 570, width: 1304, height: 80 },
        textSlot: { type: 'description', placeholder: '进口高档蕾丝，柔软亲肤，透气舒适', maxLength: 80 }
      }
    ]
  }
];

// 模板分类
export const APLUS_CATEGORIES = [
  { id: 'comparison', label: '对比展示', icon: 'ArrowLeftRight', count: 2 },
  { id: 'scene', label: '场景图', icon: 'Image', count: 4 },
  { id: 'detail', label: '细节图', icon: 'ZoomIn', count: 2 },
  { id: 'feature', label: '功能说明', icon: 'Star', count: 3 },
  { id: 'step', label: '使用步骤', icon: 'ListOrdered', count: 0 }
];