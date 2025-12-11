# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

Luma Pro 是一个基于 React + Vite 的 AI 图片编辑工具，集成了 Google Gemini AI 模型，用于电商场景的图片生成和编辑。

## 常用命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 环境配置

- 在 `.env.local` 文件中设置 `GEMINI_API_KEY` 为你的 Gemini API Key
- 支持三种 API Key 来源：
  1. 用户手动输入（存储在 Zustand store）
  2. 环境变量 `process.env.API_KEY`（Vercel 部署）
  3. AI Studio 环境 (`window.aistudio`)

## 架构概览

### 技术栈
- **框架**: React 19 + TypeScript
- **构建**: Vite 6
- **状态管理**: Zustand
- **画布引擎**: react-konva（基于 Konva.js）
- **动画**: Framer Motion
- **AI**: @google/genai (Gemini SDK)

### 核心模块

**状态管理 (`store.ts`)**
- 单一 store 管理所有应用状态
- 包含：导航、主题、缩放、页面/图层、历史记录（撤销/重做）、认证、AI 遮罩模式
- 图层操作都作用于当前激活页面 (`activePageIndex`)

**AI 服务 (`services/geminiService.ts`)**
- `analyzeImage`: 使用 gemini-2.5-flash 分析图片内容
- `enhancePrompt`: 智能优化用户输入的 Prompt
- `generateImage`: 图片生成，支持多种工作流（换脸、换背景、融合、局部重绘等）
- 内置模型回退机制：gemini-3-pro-image-preview 失败时自动降级到 gemini-2.5-flash-image

**图层交互 (`hooks/useLayerInteraction.ts`)**
- 处理图层的拖拽、缩放、旋转
- 支持多选和图层组操作
- 智能对齐参考线 (snap guides)

### 工作流类型 (WorkflowType)

定义在 `types.ts` 中，包括：
- `home`: 首页
- `tutorials`: 教程页
- `face_swap`: 换脸（支持 model_swap, head_swap, face_swap 三种模式）
- `bg_swap`: 换背景
- `fission`: 图片裂变
- `fusion`: 多图融合（支持多角度参考图）
- `creative`: 创意生图
- `detail`: 细节增强
- `extraction`: 产品提取
- `planting`: 场景植入
- `layer_management`: 图层管理
- `settings`: 设置

### 页面路由

应用使用 `activeWorkflow` 状态进行内部路由：
- `App.tsx` 根据 workflow 渲染不同页面组件
- `home` → `HomePage`
- `tutorials` → `TutorialsPage`
- 其他 → 编辑器界面（Sidebar + OperationPanel + CanvasArea + DesignAgent）

## 重要类型

**CanvasLayer**: 图层核心数据结构，包含：
- 几何属性：x, y, width, height, rotation, scaleX, scaleY, zIndex
- 内容：src (图片), text (文字)
- 外观：opacity, visible, locked, borderRadius, filters, textStyle
- 分组：groupId（用于图层组）

**GenerationConfig**: AI 生成配置，包含 prompt、参考图、遮罩图、工作流类型等

## 代码规范

- 组件文件放在 `components/` 目录
- 自定义 Hook 放在 `hooks/` 目录
- 服务/API 调用放在 `services/` 目录
- 工具函数放在 `utils/` 目录
