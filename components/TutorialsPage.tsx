import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    ArrowLeft, BookOpen, Bot, Layers, Users, Image as ImageIcon, 
    Combine, Scan, Zap, Sparkles, Layout, MousePointer2, Settings, Download,
    CheckCircle2
} from 'lucide-react';
import { useAppStore } from '../store';

const SECTIONS = [
    { id: 'intro', label: '产品概览', icon: BookOpen },
    { id: 'interface', label: '界面指南', icon: Layout },
    { id: 'agent_batch', label: 'Agent 智造', icon: Bot },
    { id: 'fission', label: '姿势裂变', icon: Layers },
    { id: 'bg_swap', label: '场景重构', icon: ImageIcon },
    { id: 'face_swap', label: '虚拟模特', icon: Users },
    { id: 'fusion', label: '人台融合', icon: Combine },
    { id: 'extraction', label: '商品提取', icon: Scan },
    { id: 'planting', label: '一键种草', icon: Sparkles },
    { id: 'creative', label: '创意生图', icon: Zap },
];

export const TutorialsPage: React.FC = () => {
    const { setWorkflow } = useAppStore();
    const [activeSection, setActiveSection] = useState('intro');

    const scrollToSection = (id: string) => {
        setActiveSection(id);
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] text-studio-900 font-sans flex flex-col">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-studio-100 h-16 flex items-center px-6 lg:px-12 justify-between">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setWorkflow('home')}
                        className="p-2 hover:bg-studio-100 rounded-lg text-studio-500 hover:text-studio-900 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-lg font-bold text-studio-900">LUMA 使用指南</h1>
                </div>
                <div className="text-sm text-studio-500 font-medium">Documentation v2.1</div>
            </div>

            <div className="flex flex-1 max-w-7xl mx-auto w-full">
                {/* Sidebar Navigation */}
                <aside className="w-64 hidden lg:block sticky top-16 h-[calc(100vh-64px)] overflow-y-auto border-r border-studio-100 p-6">
                    <div className="space-y-1">
                        <div className="px-3 py-2 text-xs font-bold text-studio-400 uppercase tracking-wider mb-2">目录 Contents</div>
                        {SECTIONS.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => scrollToSection(section.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                                    ${activeSection === section.id 
                                        ? 'bg-studio-900 text-white shadow-md' 
                                        : 'text-studio-600 hover:bg-studio-100 hover:text-studio-900'}`}
                            >
                                <section.icon size={16} />
                                {section.label}
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-8 lg:p-12 space-y-20 max-w-4xl">
                    
                    {/* Intro Section */}
                    <section id="intro" className="scroll-mt-24 space-y-6">
                        <div className="space-y-4">
                            <h2 className="text-4xl font-bold tracking-tight text-studio-900">欢迎使用 LUMA 视觉引擎</h2>
                            <p className="text-lg text-studio-500 leading-relaxed">
                                LUMA 是一款专为跨境电商（Amazon, Shein, TikTok）打造的 AI 视觉生产力工具。
                                我们将复杂的 AI 模型（Gemini Pro, Imagen, Veo）封装为简单的工作流，帮助您在几秒钟内生成好莱坞级别的商业摄影作品。
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                            <div className="p-6 bg-white border border-studio-200 rounded-2xl shadow-sm">
                                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-4"><Zap size={20}/></div>
                                <h3 className="font-bold mb-2">效率至上</h3>
                                <p className="text-sm text-studio-500">批量处理能力，一次生成多张素材，告别传统拍摄的漫长周期。</p>
                            </div>
                            <div className="p-6 bg-white border border-studio-200 rounded-2xl shadow-sm">
                                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-4"><CheckCircle2 size={20}/></div>
                                <h3 className="font-bold mb-2">商业级质感</h3>
                                <p className="text-sm text-studio-500">内置大师级摄影 Prompt，确保光影、构图和纹理达到 4K 商业标准。</p>
                            </div>
                            <div className="p-6 bg-white border border-studio-200 rounded-2xl shadow-sm">
                                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mb-4"><Bot size={20}/></div>
                                <h3 className="font-bold mb-2">AI 智能调度</h3>
                                <p className="text-sm text-studio-500">从模特选择到场景搭建，AI 自动理解商品并匹配最佳视觉方案。</p>
                            </div>
                        </div>
                    </section>

                    <hr className="border-studio-100" />

                    {/* Interface Guide */}
                    <section id="interface" className="scroll-mt-24 space-y-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Layout className="text-studio-400" size={32} />
                            <h2 className="text-3xl font-bold text-studio-900">界面指南</h2>
                        </div>
                        <p className="text-studio-500">熟悉 LUMA 的“三栏式”高效工作区。</p>
                        
                        <div className="bg-studio-50 border border-studio-200 rounded-2xl p-8 space-y-8">
                            <div className="flex gap-4 items-start">
                                <div className="w-8 h-8 rounded-full bg-studio-900 text-white flex items-center justify-center font-bold shrink-0">1</div>
                                <div>
                                    <h4 className="font-bold text-lg mb-1">左侧导航栏 (Sidebar)</h4>
                                    <p className="text-sm text-studio-500">核心功能入口。点击图标切换不同的 AI 工作流（如换脸、换背景）。底部包含个人中心和设置。</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="w-8 h-8 rounded-full bg-studio-900 text-white flex items-center justify-center font-bold shrink-0">2</div>
                                <div>
                                    <h4 className="font-bold text-lg mb-1">中间操作区 (Operation Panel)</h4>
                                    <p className="text-sm text-studio-500">参数配置中心。在这里上传参考图、选择模特/场景预设、输入 Prompt 提示词以及调整生成数量。不同工作流会显示不同的控件。</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="w-8 h-8 rounded-full bg-studio-900 text-white flex items-center justify-center font-bold shrink-0">3</div>
                                <div>
                                    <h4 className="font-bold text-lg mb-1">右侧智能画布 (Canvas)</h4>
                                    <p className="text-sm text-studio-500">
                                        不仅仅是图片预览。这是一个无限画布，支持拖拽、缩放、多层级编辑。
                                        <br/>• <b>空格 + 拖拽</b>：移动画布视野。
                                        <br/>• <b>滚轮缩放</b>：放大查看细节。
                                        <br/>• <b>右键菜单</b>：复制、锁定、层级调整。
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <hr className="border-studio-100" />

                    {/* Agent Batch */}
                    <section id="agent_batch" className="scroll-mt-24 space-y-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Bot size={24} /></div>
                            <h2 className="text-3xl font-bold text-studio-900">Agent 智造模式</h2>
                        </div>
                        <p className="text-studio-500 text-lg">全自动化的流水线生产模式。一次性解决选品、选人、选景难题。</p>
                        
                        <div className="prose prose-studio max-w-none text-studio-600">
                            <h4 className="text-studio-900 font-bold">使用步骤：</h4>
                            <ol className="list-decimal list-outside pl-5 space-y-2">
                                <li><b>上传商品</b>：支持批量上传多张产品图（平铺图或白底图）。</li>
                                <li><b>选择模特</b>：从预设库中选择一位符合品牌调性的模特（如“亚洲温婉”或“欧美酷感”）。</li>
                                <li><b>选择姿势</b>：勾选多个展示姿势（如“站姿”、“特写”、“行走”）。</li>
                                <li><b>选择场景</b>：勾选多个背景风格（如“商业摄影棚”、“街头外景”）。</li>
                                <li><b>一键生成</b>：点击生成，AI 将自动计算所有组合（商品 x 姿势 x 场景），批量产出全套素材。</li>
                            </ol>
                            <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 my-4 text-sm text-indigo-700">
                                <strong>提示：</strong> 此模式适合新品上新时，需要快速产出主图、详情页配图和社交媒体推广图的全套物料。
                            </div>
                        </div>
                    </section>

                    {/* Fission */}
                    <section id="fission" className="scroll-mt-24 space-y-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-violet-100 text-violet-600 rounded-lg"><Layers size={24} /></div>
                            <h2 className="text-3xl font-bold text-studio-900">姿势裂变</h2>
                        </div>
                        <p className="text-studio-500 text-lg">单张图裂变出无限姿势。解决模特图姿势单一、甚至只有一张图的尴尬。</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h4 className="text-studio-900 font-bold mb-2">核心功能</h4>
                                <ul className="list-disc list-inside space-y-2 text-studio-600 text-sm">
                                    <li><b>骨架控制</b>：支持上传自定义骨架图（OpenPose），精准控制生成图的动作。</li>
                                    <li><b>预设动作库</b>：内置数十种电商常用姿势（叉腰、行走、坐姿等）。</li>
                                    <li><b>防拼图机制</b>：优化算法，确保每次生成都是单张完整的高清大图，而非拼贴画。</li>
                                </ul>
                            </div>
                            <div className="bg-studio-100 rounded-xl p-4 flex items-center justify-center">
                                <div className="text-center text-studio-400 text-sm">
                                    [ 输入: 1张站立图 ] <br/>
                                    ↓ <br/>
                                    [ 输出: 站姿 / 坐姿 / 侧身 / 行走 ]
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Scene Swap */}
                    <section id="bg_swap" className="scroll-mt-24 space-y-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-cyan-100 text-cyan-600 rounded-lg"><ImageIcon size={24} /></div>
                            <h2 className="text-3xl font-bold text-studio-900">场景重构</h2>
                        </div>
                        <p className="text-studio-500 text-lg">无需外拍，将产品瞬间置入全球各地的顶级场景中。</p>
                        <div className="prose prose-studio max-w-none text-studio-600 text-sm">
                            <p>我们内置了 8 大类、超过 80 种高定场景预设：</p>
                            <div className="grid grid-cols-2 gap-4 my-4">
                                <ul className="list-disc list-inside">
                                    <li><b>商业摄影棚</b>：纯白无影、莫兰迪灰、几何置景。</li>
                                    <li><b>自然风光</b>：雪山、湖泊、森林、海滩。</li>
                                    <li><b>室内家居</b>：极简客厅、温馨卧室、法式窗边。</li>
                                    <li><b>节日限定</b>：圣诞树、万圣节南瓜、春节红韵。</li>
                                </ul>
                            </div>
                            <p><b>光影融合技术</b>：AI 会根据新背景自动调整模特/产品的光照方向和色温，确保合成效果逼真自然。</p>
                        </div>
                    </section>

                    {/* Face Swap */}
                    <section id="face_swap" className="scroll-mt-24 space-y-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-rose-100 text-rose-600 rounded-lg"><Users size={24} /></div>
                            <h2 className="text-3xl font-bold text-studio-900">虚拟模特 (AI 换脸)</h2>
                        </div>
                        <p className="text-studio-500 text-lg">实现营销素材的全球化与本地化。一套图适配全球市场。</p>
                        
                        <div className="space-y-4">
                            <div className="border border-studio-200 rounded-xl p-4">
                                <h4 className="font-bold text-studio-900 mb-2">三种模式</h4>
                                <ul className="space-y-3 text-sm text-studio-600">
                                    <li><strong>1. 换模特 (Model Swap)</strong>: 保留服装和背景，彻底更换模特（包括肤色、发型、体型）。适合将亚洲模特图转为欧美模特图。</li>
                                    <li><strong>2. 换头 (Head Swap)</strong>: 保留身体姿态和服装，仅更换头部。适合修正模特表情或更换面孔。</li>
                                    <li><strong>3. 换脸 (Face Swap)</strong>: 保留发型和头型，仅更换五官。适合微调面部特征。</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Fusion */}
                    <section id="fusion" className="scroll-mt-24 space-y-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><Combine size={24} /></div>
                            <h2 className="text-3xl font-bold text-studio-900">人台融合 (Mannequin Fusion)</h2>
                        </div>
                        <p className="text-studio-500 text-lg">低成本实现真人上身效果。将“隐形模特图”(Ghost Mannequin) 转化为真人实拍图。</p>
                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 text-sm text-emerald-800">
                            <strong>核心优势：</strong>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>自动补全：AI 自动根据衣服轮廓补全模特缺失的四肢和头部。</li>
                                <li>面料锁定：严格保持服装的纹理、褶皱和 Logo 不变。</li>
                                <li>多角度支持：支持上传多张角度的人台图，生成更立体的效果。</li>
                            </ul>
                        </div>
                    </section>

                    {/* Extraction */}
                    <section id="extraction" className="scroll-mt-24 space-y-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Scan size={24} /></div>
                            <h2 className="text-3xl font-bold text-studio-900">商品提取</h2>
                        </div>
                        <p className="text-studio-500 text-lg">专为配饰（头纱、手套、鞋包）设计的高精度抠图工具。</p>
                        <p className="text-sm text-studio-600">
                            不同于传统的去除背景，LUMA 的提取功能能够智能识别半透明材质（如婚纱蕾丝），并将其完美迁移到纯白背景或新场景中，保留通透质感。
                        </p>
                    </section>

                    {/* Planting */}
                    <section id="planting" className="scroll-mt-24 space-y-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-green-100 text-green-600 rounded-lg"><Sparkles size={24} /></div>
                            <h2 className="text-3xl font-bold text-studio-900">一键种草 (Social Media)</h2>
                        </div>
                        <p className="text-studio-500 text-lg">生成适合 Instagram / 小红书 / TikTok 的生活化“种草图”。</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="p-3 border rounded-lg text-center text-sm font-bold text-studio-700">City Walk 街拍</div>
                            <div className="p-3 border rounded-lg text-center text-sm font-bold text-studio-700">探店打卡</div>
                            <div className="p-3 border rounded-lg text-center text-sm font-bold text-studio-700">居家慵懒</div>
                            <div className="p-3 border rounded-lg text-center text-sm font-bold text-studio-700">艺术看展</div>
                            <div className="p-3 border rounded-lg text-center text-sm font-bold text-studio-700">度假风</div>
                            <div className="p-3 border rounded-lg text-center text-sm font-bold text-studio-700">公园野餐</div>
                        </div>
                    </section>

                    {/* Creative */}
                    <section id="creative" className="scroll-mt-24 space-y-6 mb-20">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg"><Zap size={24} /></div>
                            <h2 className="text-3xl font-bold text-studio-900">创意生图</h2>
                        </div>
                        <p className="text-studio-500 text-lg">自由度最高的模式。通过文字描述（Prompt）从零生成创意海报。</p>
                        <p className="text-sm text-studio-600">
                            支持“图生图”参考。您可以上传一张草图或参考图，结合文字描述，让 AI 帮您把灵感变为现实。适合制作 Banner 背景、营销海报素材等。
                        </p>
                    </section>

                </main>
            </div>
        </div>
    );
};