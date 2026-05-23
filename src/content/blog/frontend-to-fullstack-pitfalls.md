---
title: "前端转全栈踩的第一个坑：我用 Vue 的思维写 SQL，结果…"
description: "一个前端开发者在学习 MySQL 过程中踩的 3 个坑，用前端思维对比后端思维，帮你避开同样的错误。"
pubDate: 2026-05-10
tags: ["前端", "全栈", "MySQL", "踩坑", "思维转变"]
category: "全栈学习"
---

> 作者背景：2 年前端开发，正在转型全栈
>
> 本文是专栏《一个前端开发者的后端思维养成记》的第一篇

---

## 开头：我以为 SQL 不就是另一种"响应式"吗

学 MySQL 之前，我已经写了两年 Vue。

在 Vue 的世界里，数据是响应式的、有序的、可预测的。一个数组 `users`，我想分页就 `slice(0, 10)`，想过滤就 `filter()`，想排序就 `sort()`。

学 MySQL 的第一个月，我下意识地用同样的思维理解数据库。

结果：写了 3 个 bug，每一个都让我在生产环境边缘走了一圈。

今天把这 3 个坑记录下来。如果你也是前端转后端，希望你能避开。

---

## 误区一：分页不加 ORDER BY —— "数据库表不是前端数组"

### 我的前端思维

```js
// Vue 里的分页，天经地义
const currentPage = users.slice(0, 10);
const nextPage = users.slice(10, 20);
```

我第一次写 SQL 分页，是这样写的：

```sql
-- 第一页
SELECT * FROM users LIMIT 10;

-- 第二页
SELECT * FROM users LIMIT 10 OFFSET 10;
```

逻辑没问题，语法没问题，查出来的结果……每次都不一样。

### 后端现实

**数据库表中的数据本身是无序存储的。**

没有 `ORDER BY`，数据库返回哪 10 行是完全随机的。尤其是数据增删之后，"第 11-20 行"这个概念根本不存在。

我当时的反应是："这不就是前端数组没排序吗？那我加个 `ORDER BY` 不就好了。"

对，但问题是：**我一开始根本不觉得这是个问题。**

在前端的世界里，数组本来就有索引，`arr[0]` 永远是第一个元素。我把这个假设带进了数据库，理所当然地认为"表里的行也有顺序"。

**它没有。**

### 正确写法

```sql
-- 稳定分页：永远返回 id 最小的 10 条
SELECT * FROM users ORDER BY id ASC LIMIT 10;

-- 第二页：永远返回 id 第 11-20 条
SELECT * FROM users ORDER BY id ASC LIMIT 10 OFFSET 10;
```

### 这个坑的本质

**前端思维**：数据默认有序，分页是物理切片
**后端思维**：数据默认无序，分页是逻辑查询

**顿悟时刻**：数据库的"表"不是前端的"数组"。你想分页，必须先告诉数据库"按什么顺序排第几页"。

---

## 误区二：LIKE '%关键词' —— "索引不是万能字典"

### 我的前端思维

```js
// 前端搜索，天然支持任意位置匹配
const result = users.filter(u => u.name.includes('zhang'));
```

我第一次写搜索功能，是这样写的：

```sql
SELECT * FROM users WHERE name LIKE '%zhang%';
```

逻辑没问题，语法没问题，查出来的结果……也对。

直到我发现，这个查询在 100 万用户表上跑了 8 秒。

### 后端现实

**`LIKE '%关键词'` 会导致全表扫描。**

我在 `name` 字段上建了索引，天真地以为"有索引就会快"。

但索引是 B+ 树，它只能从左往右匹配。`%` 一放在前面，索引直接失效，数据库只能逐行检查 100 万条数据。

我当时的反应是："索引不就是用来加速查询的吗？为什么这个场景用不了？"

**索引不是万能字典，它是有使用条件的。**

### 正确写法

**方案 1：前缀匹配（能用索引）**

```sql
-- 创建索引
CREATE INDEX idx_name ON users(name);

-- 前缀搜索：能用索引
SELECT * FROM users WHERE name LIKE 'zhang%';
```

**方案 2：全文搜索（需要全文索引）**

```sql
-- 创建全文索引
ALTER TABLE users ADD FULLTEXT INDEX ft_name (name);

-- 全文搜索
SELECT * FROM users WHERE MATCH(name) AGAINST('zhang');
```

### 这个坑的本质

**前端思维**：搜索就是包含，包含就是匹配
**后端思维**：匹配要走索引，索引有方向性

**顿悟时刻**：索引不是"有就行"，它只在特定查询模式下生效。写 SQL 之前要先想：这个查询能用上索引吗？

---

## 误区三：LEFT JOIN + WHERE 陷阱 —— "SQL 执行顺序和语法顺序不一致"

### 我的前端思维

```js
// 前端链式调用，顺序即执行顺序
users
  .leftJoin(articles)
  .filter(a => a.create_time >= '2024-01-01');
```

我第一次写关联查询，是这样写的：

```sql
SELECT users.name, COUNT(articles.id) as article_count
FROM users
LEFT JOIN articles ON users.id = articles.author_id
WHERE articles.create_time >= '2024-01-01';
```

逻辑没问题，语法没问题，查出来的结果……不对。

**没有发过文章的用户，全被过滤掉了。**

### 后端现实

**`WHERE` 条件在 `JOIN` 之后执行，但它会过滤掉 `NULL` 值。**

`LEFT JOIN` 会返回左表所有行，右表没有匹配时填 `NULL`。但 `WHERE articles.create_time >= '2024-01-01'` 这个条件，`NULL >= 日期` 的结果是 `FALSE`，所以这些行被过滤了。

我用了 `LEFT JOIN`，但实际效果是 `INNER JOIN`。

我当时的反应是："我都写 LEFT JOIN 了，为什么还是内连接的效果？"

**SQL 的语法顺序不等于执行顺序。**

### 正确写法

**方案 1：条件移到 ON 子句**

```sql
SELECT users.name, COUNT(articles.id) as article_count
FROM users
LEFT JOIN articles ON users.id = articles.author_id
    AND articles.create_time >= '2024-01-01'
GROUP BY users.id;
```

**方案 2：接受 INNER JOIN 的语义**

如果你确实只想统计"发过文章的用户"，那就直接用 `INNER JOIN`，语义更清晰：

```sql
SELECT users.name, COUNT(articles.id) as article_count
FROM users
INNER JOIN articles ON users.id = articles.author_id
WHERE articles.create_time >= '2024-01-01'
GROUP BY users.id;
```

### 这个坑的本质

**前端思维**：代码顺序即执行顺序
**后端思维**：SQL 有自己独立的执行顺序（FROM → JOIN → WHERE → GROUP BY → SELECT）

**顿悟时刻**：SQL 不是"声明式前端代码"，它有自己的一套执行模型。写查询之前要先想：这个条件在执行顺序的哪一步生效？

---

## 总结：前端转后端的 3 个思维转变

| 误区 | 前端思维 | 后端思维 |
|------|----------|----------|
| 分页不加 ORDER BY | 数据默认有序 | 数据默认无序 |
| LIKE '%关键词' | 搜索就是包含 | 索引有方向性 |
| LEFT JOIN + WHERE | 语法顺序即执行顺序 | SQL 有独立执行顺序 |

这 3 个坑，本质上都是**用前端的默认假设理解后端的行为模型**。

前端的世界是：响应式、有序、链式调用。
后端的世界是：无序存储、索引优化、执行计划。

两者都重要，但它们不是一回事。

---

## 下一篇文章

下一篇我会写 Redis：**"我以为 Redis 就是全局变量，直到我理解了单线程模型"**。

如果你也是前端转全栈，欢迎关注这个专栏。我会持续记录学习过程中的坑和顿悟时刻。
