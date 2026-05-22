# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

这是一个基于 Astro 5 的中文个人博客，使用 MDX/Markdown 撰写内容，Tailwind CSS 4 样式，React 组件提供交互功能。

## Tech Stack

- **框架**: Astro 5 (静态站点生成)
- **内容**: Astro Content Collections + MDX + Markdown
- **样式**: Tailwind CSS 4 (`@import "tailwindcss"` 语法，非 `@tailwind` 指令) + CSS Variables 定义主题色
- **交互组件**: React 19 (仅用于 `Search.tsx` 和 `ThemeToggle.tsx`)
- **Markdown 插件**: remark-gfm, rehype-slug, rehype-autolink-headings, @shikijs/rehype (代码高亮主题: github-dark)

## Commands

```bash
npm run dev      # 启动开发服务器
npm run build    # 构建生产版本
npm run preview  # 预览生产构建
```

## 代码提交规范
应该遵循原子化的提交方式

## Architecture

### 内容系统

博客文章存放在 `src/content/blog/`，支持 `.md` 和 `.mdx` 格式。内容 schema 定义在 [src/content/config.ts](src/content/config.ts)：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | 是 | 文章标题 |
| description | string | 是 | 文章描述 |
| pubDate | date | 是 | 发布日期 |
| updatedDate | date | 否 | 更新日期 |
| tags | string[] | 否 | 标签，默认 `[]` |
| category | string | 否 | 分类 |
| cover | string | 否 | 封面图路径 |
| draft | boolean | 否 | 草稿标记，默认 `false` |

### 路由与页面

- `src/pages/index.astro` — 首页，展示精选文章(前3篇)和最新文章
- `src/pages/blog/index.astro` — 文章列表，支持分类筛选和分页
- `src/pages/blog/[...slug].astro` — 文章详情页（动态路由），通过 `getStaticPaths` 生成
- `src/pages/tags/[tag].astro` — 标签页
- `src/pages/about.astro` — 关于页
- `src/pages/rss.xml.ts` — RSS 订阅

### 布局与组件

- [BaseLayout](src/layouts/BaseLayout.astro) — 全站基础布局，包含 Header、Footer、Search、暗色模式初始化（避免 FOUC 的内联脚本）、SEO meta 标签
- [PostLayout](src/layouts/PostLayout.astro) — 文章详情布局，支持 `toc` 命名插槽用于目录

React 组件（使用 `client:load` 指令）：
- [Search.tsx](src/components/Search.tsx) — 全站搜索（Ctrl+K），目前使用硬编码数据，搜索结果需要手动同步
- [ThemeToggle.tsx](src/components/ThemeToggle.tsx) — 主题切换（light/dark/system 三态循环）

Astro 组件：
- [Header.astro](src/components/Header.astro) — 固定导航栏，含移动端菜单、搜索按钮
- [PostCard.astro](src/components/PostCard.astro) — 文章卡片
- [TableOfContents.astro](src/components/TableOfContents.astro) — 文章目录
- [ReadingProgress.astro](src/components/ReadingProgress.astro) — 阅读进度条
- [Comments.astro](src/components/Comments.astro) — 评论区

### 样式系统

主题色通过 CSS Variables 定义在 [src/styles/global.css](src/styles/global.css)，支持 light/dark 两套。关键变量：`--color-primary`、`--color-text`、`--color-bg-page` 等。深色模式通过 `.dark` class 切换。

字体：正文 Inter + LXGW WenKai（霞鹜文楷），代码 JetBrains Mono。

Tailwind 自定义宽度：`max-w-content`（内容区）、`max-w-article`（文章区）。

### 阅读时间计算

中文优化：按字符数（去除空白）÷ 400 计算分钟数，最少 1 分钟。同时存在于 `index.astro` 和 `[...slug].astro`。

## Adding a New Post

在 `src/content/blog/` 下创建 `.md` 或 `.mdx` 文件，frontmatter 示例：

```yaml
---
title: "文章标题"
description: "文章描述"
pubDate: 2026-01-01
tags: ["标签1", "标签2"]
category: "技术"
---
```

## Key Patterns

- Astro 组件中使用 `---` frontmatter 脚本块处理数据逻辑
- React 组件用于需要客户端交互的场景（搜索、主题切换），通过 `client:load` 水合
- 主题切换通过 `localStorage` 持久化，Header 中的搜索按钮通过 `CustomEvent('toggle-search')` 与 Search 组件通信
- 文章的 `draft: true` 会在构建时被过滤掉
