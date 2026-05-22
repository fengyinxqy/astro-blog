---
title: "Astro 入门指南：构建快速的静态网站"
description: "Astro 是一个现代化的静态网站生成器，专注于性能和开发者体验。本文将带你了解 Astro 的核心概念和基本用法。"
pubDate: 2024-01-15
tags: ["Astro", "前端", "静态网站"]
category: "前端开发"
cover: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop"
draft: false
---

## 什么是 Astro？

Astro 是一个现代化的静态网站生成器，它专注于构建快速、内容驱动的网站。与其他框架不同，Astro 默认不发送任何 JavaScript 到客户端，这使得网站加载速度极快。

## 核心特性

### 1. 零 JavaScript 默认

Astro 的核心理念是"默认零 JavaScript"。这意味着你的网站在没有 JavaScript 的情况下也能完美运行，只有在需要交互时才会加载 JavaScript。

### 2. 组件岛屿

Astro 引入了"组件岛屿"（Component Islands）的概念。你可以使用任何前端框架（React、Vue、Svelte 等）来构建交互式组件，而 Astro 会智能地只加载必要的 JavaScript。

### 3. 内容集合

Astro 的内容集合（Content Collections）功能让你可以轻松管理 Markdown 和 MDX 内容，并提供类型安全的 frontmatter 验证。

## 快速开始

```bash
# 创建新项目
npm create astro@latest my-blog

# 进入项目目录
cd my-blog

# 启动开发服务器
npm run dev
```

## 项目结构

```
my-blog/
├── src/
│   ├── components/
│   ├── content/
│   ├── layouts/
│   └── pages/
├── public/
├── astro.config.mjs
└── package.json
```

## 创建第一个页面

在 `src/pages/` 目录下创建一个 `index.astro` 文件：

```astro
---
// 组件脚本（在服务器上运行）
const title = "欢迎来到我的博客";
---

<html>
  <head>
    <title>{title}</title>
  </head>
  <body>
    <h1>{title}</h1>
    <p>这是我的第一篇 Astro 博客文章。</p>
  </body>
</html>
```

## 使用 Markdown

Astro 原生支持 Markdown 和 MDX。你可以在 `src/content/` 目录下创建 Markdown 文件：

```markdown
---
title: "我的第一篇文章"
description: "这是一篇示例文章"
pubDate: 2024-01-15
---

## 文章内容

这里写你的文章内容...
```

## 部署

Astro 支持多种部署平台：

- **Vercel**: `npm run build` 后直接部署
- **Netlify**: 连接 Git 仓库自动部署
- **GitHub Pages**: 使用 GitHub Actions 自动部署

## 总结

Astro 是一个强大而灵活的静态网站生成器，特别适合构建博客、文档网站和营销页面。它的零 JavaScript 默认策略使得网站性能极佳，同时又不失灵活性。

如果你正在寻找一个现代化的网站构建工具，Astro 绝对值得一试！
