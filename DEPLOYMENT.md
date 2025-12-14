# 部署说明

## 🎉 部署成功！

**生产环境地址：** https://luma-pro-104-deplay-ioj076539-xiaoweis-projects-6de46f1f.vercel.app

## ⚠️ 重要：配置环境变量

网站已成功部署，但需要配置环境变量才能正常使用：

### 1. 登录 Vercel 控制台
- 访问：https://vercel.com/dashboard
- 进入项目：luma-pro-1.0.4-deplay

### 2. 设置环境变量
在项目设置中添加以下环境变量：
- **名称**: `GEMINI_API_KEY`
- **值**: 你的 Google Gemini API Key
- **环境**: Production, Preview, Development

### 3. 重新部署
设置环境变量后，点击 "Redeploy" 或使用命令：
```bash
vercel --prod
```

## 📦 部署信息

- **平台**: Vercel
- **构建时间**: 2秒
- **应用大小**: 1.2MB (gzipped: 331KB)
- **Node版本**: 自动检测
- **框架**: Vite + React

## 🚀 本地开发

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

## 📝 项目配置

### Vercel 配置 (vercel.json)
- SPA 路由支持
- 静态资源缓存优化
- 生产环境构建配置

### 环境变量示例
参考 `.env.production.example` 文件，创建你的环境配置。

## 🎨 功能特性

- ✅ 优化的婚礼配饰产品一致性提示词
- ✅ 背景替换（bg_swap）
- ✅ 人脸替换（face_swap）
- ✅ 图片融合（fusion）
- ✅ 局部重绘（inpainting）
- ✅ 多种 AI 模型支持
- ✅ 响应式设计

## 📞 支持

如有问题，请检查：
1. 环境变量是否正确配置
2. API Key 是否有效
3. Vercel 部署日志