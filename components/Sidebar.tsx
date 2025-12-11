
import React, { useState } from 'react';
import { 
  Users, Image as ImageIcon, Layers, Combine, 
  Settings, List,
  Bot, Aperture, Scan, ZoomIn, Sprout, Sun, Moon, LogOut
} from 'lucide-react';
import { useAppStore } from '../store';
import { WorkflowType } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

// Expanded Tool Definition for Rich Tooltips
const TOOLS = [
    { 
        id: 'agent_batch', 
        icon: <Bot size={20} />, 
        label: 'Agent 智造',
        desc: '全流程批量生产模式。一键整合模特选择、姿势控制与场景适配，自动化生成全套电商图。',
        preview: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=400&h=250&fit=crop'
    },
    { 
        id: 'fission', 
        icon: <Layers size={20} />, 
        label: '姿势裂变',
        desc: '单图裂变多姿态，一键生成全套展示图。支持上传骨架或选择预设姿势。',
        preview: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=250&fit=crop'
    },
    { 
        id: 'bg_swap', 
        icon: <ImageIcon size={20} />, 
        label: '场景重构',
        desc: '保持模特和服装不变，一键替换背景为商业摄影棚、自然风光或节日场景。',
        preview: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=250&fit=crop'
    },
    { 
        id: 'face_swap', 
        icon: <Users size={20} />, 
        label: 'AI 虚拟模特',
        desc: '保留服装，自由更换模特的脸部、发型、肤色，适配全球不同市场。',
        preview: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=250&fit=crop'
    },
    { 
        id: 'fusion', 
        icon: <Combine size={20} />, 
        label: '人台融合',
        desc: '上传人台图或Ghost假模图，自动生成真人模特穿戴效果。',
        preview: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=250&fit=crop&q=80'
    },
    { 
        id: 'extraction', 
        icon: <Scan size={20} />, 
        label: '商品提取',
        desc: '上传手机拍摄或杂乱背景图，AI 智能识别并提取高清商品。支持头纱、手套等婚礼配饰一键生成白底图。',
        preview: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=250&fit=crop&q=80'
    },
    { 
        id: 'detail', 
        icon: <ZoomIn size={20} />, 
        label: '细节放大',
        desc: '上传产品图，智能生成指定部位（面料/工艺/纹理）的高清特写图，还原真实质感。',
        preview: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400&h=250&fit=crop&q=80'
    },
    { 
        id: 'planting', 
        icon: <Sprout size={20} />, 
        label: '一键种草',
        desc: '只需上传1张服装图，即可生成相同穿搭、多种模特姿势与场景的“种草”展示图。轻松满足商品主图、详情页、社交媒体等多场景出图需求！',
        preview: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=250&fit=crop&q=80'
    },
    { 
        id: 'layer_management', 
        icon: <List size={20} />, 
        label: '图层管理',
        desc: '管理画布上的所有图层，调整顺序、锁定或隐藏。',
        preview: null
    },
    {
        id: 'settings',
        icon: <Settings size={20} />,
        label: '设置',
        desc: '配置 API Key 和系统偏好设置。',
        preview: null
    }
];

interface TooltipProps {
  item: typeof TOOLS[0];
  top: number;
}

const Tooltip: React.FC<TooltipProps> = ({ item, top }) => (
    <div 
        className="fixed left-20 ml-2 z-[9999] pointer-events-none"
        style={{ top: top, transform: 'translateY(-50%)' }}
    >
        <motion.div 
            initial={{ opacity: 0, x: -10 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
            className="bg-zinc-900 border border-zinc-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.3)] rounded-xl p-3 w-64 text-left relative"
        >
            {/* Arrow */}
            <div className="absolute top-1/2 -translate-x-1/2 -left-1.5 w-3 h-3 bg-zinc-900 border-l border-b border-zinc-700/50 rotate-45" />
            
            <div className="flex items-center gap-2 mb-2">
                <span className="font-bold text-white text-sm tracking-wide">{item.label}</span>
            </div>
            
            <p className="text-[11px] text-zinc-400 leading-relaxed mb-3 border-b border-zinc-800 pb-2">
            {item.desc}
            </p>
            
            {item.preview ? (
                <div className="w-full h-32 rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700/50 relative group">
                    <img src={item.preview} alt={item.label} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    {/* Overlay for depth */}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2 text-[10px] text-white/90 font-medium">
                        效果预览
                    </div>
                </div>
            ) : (
            <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">实用工具</span>
            </div>
            )}
        </motion.div>
    </div>
);

interface NavItemProps {
  item: typeof TOOLS[0];
  active: boolean;
  onClick: () => void;
  onMouseEnter: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ item, active, onClick, onMouseEnter, onMouseLeave }) => (
  <button
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    className="relative w-12 h-12 flex items-center justify-center group mb-2 outline-none shrink-0"
  >
    {/* Active Indicator */}
    {active && (
      <motion.div
        layoutId="active-nav"
        className="absolute inset-2 bg-studio-900 dark:bg-white rounded-lg shadow-sm"
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
    )}

    {/* Icon */}
    <div className={`relative z-10 transition-colors duration-200 ${active ? 'text-white dark:text-studio-900' : 'text-studio-400 group-hover:text-studio-800 dark:text-studio-500 dark:group-hover:text-studio-300'}`}>
      {item.icon}
    </div>
  </button>
);

export const Sidebar: React.FC = () => {
  const { activeWorkflow, setWorkflow, theme, toggleTheme, user, logout } = useAppStore();
  const [hoveredTool, setHoveredTool] = useState<{ item: typeof TOOLS[0], top: number } | null>(null);

  return (
    <>
        <div className="w-20 h-full bg-white dark:bg-studio-900 border-r border-studio-200 dark:border-studio-800 flex flex-col items-center py-6 z-20 shadow-sm relative transition-colors duration-300">
        {/* Brand Logo - Click to go Home */}
        <button 
            onClick={() => setWorkflow('home')}
            className="mb-8 relative group"
            title="Back to Home"
        >
            <div className="w-12 h-12 bg-studio-900 dark:bg-white rounded-2xl flex items-center justify-center text-white dark:text-studio-900 shadow-xl shadow-studio-900/20 dark:shadow-white/10 transition-all group-hover:scale-105 group-hover:shadow-studio-900/40">
                <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.5 }}>
                    <Aperture size={26} strokeWidth={1.5} />
                </motion.div>
            </div>
        </button>

        <div className="flex-1 flex flex-col items-center w-full scrollbar-hide overflow-y-auto overflow-x-hidden">
            {TOOLS.map((item) => (
            <NavItem
                key={item.id}
                item={item}
                active={activeWorkflow === item.id}
                onClick={() => setWorkflow(item.id as WorkflowType)}
                onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredTool({ item, top: rect.top + rect.height / 2 });
                }}
                onMouseLeave={() => setHoveredTool(null)}
            />
            ))}
        </div>

        <div className="mt-auto pt-4 border-t border-studio-100 dark:border-studio-800 w-full flex flex-col items-center gap-3 shrink-0 pb-4">
            {/* Theme Toggle Button */}
            <button 
                onClick={toggleTheme}
                className="w-10 h-10 flex items-center justify-center text-studio-400 dark:text-studio-500 hover:text-studio-900 dark:hover:text-studio-100 hover:bg-studio-50 dark:hover:bg-studio-800 rounded-lg transition-colors"
                title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            
            {/* User Profile / Logout */}
            <div className="relative group">
                <button className="w-10 h-10 rounded-full overflow-hidden border border-studio-200 dark:border-studio-700 hover:border-studio-400 transition-colors">
                    {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-xs">
                            {user?.name?.[0] || 'U'}
                        </div>
                    )}
                </button>
                
                {/* Logout Button (Appears on hover) */}
                <button 
                    onClick={logout}
                    className="absolute inset-0 bg-red-500/90 flex items-center justify-center text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    title="退出登录"
                >
                    <LogOut size={16} />
                </button>
            </div>
        </div>
        </div>

        {/* Render Tooltip via Portal Strategy (Fixed Position) */}
        <AnimatePresence>
            {hoveredTool && (
                <Tooltip item={hoveredTool.item} top={hoveredTool.top} />
            )}
        </AnimatePresence>
    </>
  );
};