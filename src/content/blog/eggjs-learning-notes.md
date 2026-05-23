---
title: "Egg.js 学习笔记：企业级 Node.js 框架核心概念"
description: "从洋葱模型到插件机制，用前端开发者视角理解 Egg.js 的核心设计思想。采用苏格拉底式提问法。"
pubDate: 2026-04-30
tags: ["Egg.js", "Node.js", "后端", "框架", "全栈"]
category: "全栈学习"
---

> 学习者背景：2 年 Vue 前端经验，Node.js/Egg 零基础
> 学习方式：苏格拉底式提问法 —— 通过思考回答问题来建立理解

---

## 一、为什么需要 Egg.js？

Node.js 原生 `http` 模块能创建 HTTP 服务，但需要手动处理：
- URL 路径解析
- 请求体解析（JSON / 表单 / 文件上传）
- 路由分发

框架（Express / Koa / Egg）把这些通用逻辑封装成**中间件**，开箱即用，避免每个项目重复造轮子。

---

## 二、Egg.js 的核心定位

**基于 Koa 构建，定位为"企业级 Node.js 框架"**

核心理念：**约定优于配置（Convention over Configuration）**

### 目录约定

| 目录 | 用途 |
|------|------|
| `app/controller/` | 处理 HTTP 请求逻辑 |
| `app/service/` | 业务逻辑 |
| `app/middleware/` | 中间件 |
| `app/router.js` | 路由定义 |
| `config/config.default.js` | 默认配置 |
| `config/config.prod.js` | 生产环境配置 |
| `config/plugin.js` | 插件配置 |

10 个人写出来的项目，目录结构基本一样，新成员上手快。

---

## 三、洋葱模型中间件

Koa/Egg 中间件模型形象地称为"洋葱模型"：

```
  中间件 A (request in)
    中间件 B (request in)
      路由处理
    中间件 B (response out)
  中间件 A (response out)
```

```js
async function middleware(ctx, next) {
  // 请求进来时执行
  console.log('request in');
  await next();  // 交给下一个中间件
  // 响应回去时执行
  console.log('response out');
}
```

- `await next()` **之前**：请求穿过洋葱 → 执行时机早
- `await next()` **之后**：响应穿回洋葱 → 执行时机晚

---

## 四、上下文 Context (`ctx`)

Egg 对 `req` 和 `res` 做了代理，统一封装到 `ctx` 上：

```js
ctx.body     // 响应体（等价于 res.end() / res.write()）
ctx.query    // Query 参数：/api/users?page=1
ctx.params   // 路径参数：/api/users/:id
ctx.request  // 原始请求对象
ctx.status   // 设置响应状态码
ctx.throw()  // 抛出 HTTP 错误
```

优势：统一入口，减少 `req.xxx` / `res.xxx` 来回切换。

---

## 五、Controller 和 Service

### 分工

| 层级 | 职责 | 举例 |
|------|------|------|
| Controller | 接收请求、参数校验、调用 Service、返回响应 | 解析请求参数、设置响应状态码 |
| Service | 业务逻辑、数据操作 | 查数据库、生成 token、验证密码 |

### 生命周期区别

| | Controller | Service |
|---|---|---|
| 生命周期 | 请求级（每次请求创建新实例） | 应用级单例（启动时创建一次，全局共享） |

**重要：Service 是单例，不能存请求相关的数据**

```js
// ❌ 错误：this.name 会被其他请求覆盖
class UserService extends Service {
  async findUser(id) {
    this.name = 'some user';  // 不要这样做！
    return this.app.mysql.get('user', { id });
  }
}

// ✅ 正确：数据作为局部变量或通过参数传递
class UserService extends Service {
  async findUser(id) {
    const user = await this.app.mysql.get('user', { id });
    return user;
  }
}
```

---

## 六、路由参数

```js
// app/router.js
module.exports = app => {
  const { router, controller } = app;
  router.get('/api/users', controller.user.list);              // 列表
  router.post('/api/users', controller.user.create);           // 创建
  router.get('/api/users/:id', controller.user.detail);        // 详情（路径参数）
};
```

| 参数类型 | URL 示例 | 获取方式 |
|---------|---------|---------|
| 路径参数 | `/api/users/123` | `ctx.params.id` |
| Query 参数 | `/api/users?page=1&size=10` | `ctx.query.page`, `ctx.query.size` |

RESTful 风格推荐用路径参数表示资源标识（`/users/:id`），Query 参数用于过滤和分页。

---

## 七、多环境配置

**加载顺序**：先 `default` → 再按环境加载对应配置 → 合并覆盖

```
1. config/config.default.js  → { port: 7001, dbHost: 'localhost' }
2. config/config.prod.js     → { dbHost: 'prod-db.example.com' }
   合并结果                    → { port: 7001, dbHost: 'prod-db.example.com' }
```

- 共用基础配置写 `default`
- 环境差异化配置写对应文件

---

## 八、自动加载

Egg 启动时自动扫描约定目录，将文件挂载到 `ctx` 或 `app` 上：

```js
// 不需要手动 require
// 直接通过 ctx.service.user 就能调用 app/service/user.js
async ctx => {
  const user = await ctx.service.user.findUser(1);
  ctx.body = user;
};
```

---

## 九、全局错误处理

**错误中间件应定义在最外层**（最先定义 → 包住所有中间件和路由）：

```js
// app/middleware/errorHandler.js
module.exports = () => {
  return async function errorHandler(ctx, next) {
    try {
      await next();
    } catch (err) {
      const status = err.status || 500;
      ctx.status = status;
      ctx.body = { message: err.message };
    }
  };
};
```

**抛出业务错误**：

```js
if (!ctx.request.body.username) {
  ctx.throw(400, '用户名不能为空');
}
```

- `err.status < 500` → 业务错误，直接返回
- `err.status >= 500` 或无 status → 系统错误，返回通用 500

---

## 十、插件机制

**插件 vs 直接 require**：

| | 插件 | 直接 require |
|---|---|---|
| 启用/关闭 | `enable: true/false` | 需要修改代码 |
| 配置管理 | 统一在 `config.js` | 分散在各处 |
| 加载顺序 | Egg 统一管理 | 手动控制 |

```js
// config/plugin.js
exports.sequelize = {
  enable: true,
  package: 'egg-sequelize',
};

// config/config.default.js
exports.sequelize = {
  datasource: {
    host: 'localhost',
    port: 3306,
    database: 'myapp',
  },
};
```

---

## 总结

| 概念 | 关键点 | 类比前端 |
|------|--------|----------|
| **约定优于配置** | 统一目录结构 | Vue CLI 脚手架 |
| **洋葱模型** | 中间件层层嵌套 | Vue 的生命周期钩子 |
| **Controller** | 请求级，处理请求/响应 | Vue 组件的 methods |
| **Service** | 单例，处理业务逻辑 | Vuex/Pinia store |
| **ctx** | 统一上下文 | Vue 的 `this` |
| **自动加载** | 约定目录自动挂载 | Vue 的自动注册组件 |
| **插件机制** | 统一管理第三方依赖 | Vue 插件（Vue.use） |
