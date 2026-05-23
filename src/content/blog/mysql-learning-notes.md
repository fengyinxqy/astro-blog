---
title: "MySQL 学习笔记：前端开发者必知的数据库核心知识"
description: "从分页查询到事务隔离，用前端思维理解 MySQL 的核心概念。采用苏格拉底式提问法，通过思考回答问题来建立理解。"
pubDate: 2026-04-20
tags: ["MySQL", "数据库", "SQL", "后端", "全栈"]
category: "全栈学习"
---

> 学习者背景：2 年 Vue 前端经验，MySQL 零基础
> 学习方式：苏格拉底式提问法 —— 通过思考回答问题来建立理解

---

## 一、分页查询（LIMIT 和 OFFSET）

### 问 1：如何限制查询结果数量？

**问题**：如果 user 表有 100 万行数据，而前端只需要显示"前 10 个用户"，SQL 查询应该怎么写？

**答案**：使用 `LIMIT` 关键字来限制返回行数

```sql
SELECT * FROM user LIMIT 10;
```

---

### 问 2：如何实现分页？

**问题**：如果每页显示 10 条数据，第一页是第 1-10 行，第二页是第 11-20 行，`LIMIT` 应该怎么改？

**答案**：使用 `LIMIT 数量 OFFSET 跳过行数`

```sql
-- 第一页：跳过 0 行，取 10 条
SELECT * FROM user LIMIT 10 OFFSET 0;

-- 第二页：跳过 10 行，取 10 条
SELECT * FROM user LIMIT 10 OFFSET 10;

-- 第三页：跳过 20 行，取 10 条
SELECT * FROM user LIMIT 10 OFFSET 20;

-- 通用公式：第 N 页，每页 size 条
-- OFFSET = (N - 1) * size
```

---

### 问 3：如何让分页结果稳定？

**问题**：如果只写 `SELECT * FROM user LIMIT 10`，返回哪 10 条是不确定的。如何让分页结果稳定？在 `LIMIT` 之前必须加什么子句？

**答案**：必须加 **`ORDER BY`** 子句

```sql
-- 不稳定：每次查询可能返回不同的 10 条
SELECT * FROM user LIMIT 10;

-- 稳定：永远返回 id 最小的 10 条
SELECT * FROM user ORDER BY id ASC LIMIT 10;

-- 稳定：永远返回 id 第 11-20 条
SELECT * FROM user ORDER BY id ASC LIMIT 10 OFFSET 10;
```

**类比前端**：

```js
// 不稳定：直接 slice
arr.slice(0, 10)

// 稳定：先排序再 slice
arr.sort((a, b) => a.id - b.id).slice(0, 10)
```

---

## 二、模糊查询与 LIKE

### 问 4：如何实现搜索功能？

**问题**：用户输入关键词 "zhang"，想查找 `name` 或 `email` 中包含 "zhang" 的记录，SQL 怎么写？

```sql
SELECT * FROM users
WHERE name LIKE '%zhang%' OR email LIKE '%zhang%';
```

- `LIKE '%zhang%'`：任意位置包含 "zhang"
- `LIKE 'zhang%'`：以 "zhang" 开头
- `LIKE '%zhang'`：以 "zhang" 结尾

---

## 三、索引（Index）

### 问 5：如何优化全表扫描的性能问题？

**问题**：`LIKE '%zhang%'` 会导致全表扫描。如何优化？

**答案**：使用**索引（Index）**

类比前端：
- 数组遍历查找：`arr.find(item => item.id === 123)` → O(n)
- Map 查找：`map.get(123)` → O(1)

数据库索引使用 **B+ 树** 数据结构，支持 O(log n) 查找 + 范围查询。

---

### 问 6：哪些查询能用上索引？

在 `name` 字段创建索引后：

```sql
CREATE INDEX idx_name ON users(name);
```

- `WHERE name = 'zhang'` ✅ 精确匹配，能用索引
- `WHERE name LIKE 'zhang%'` ✅ 前缀匹配，能用索引
- `WHERE name LIKE '%zhang%'` ❌ `%` 在前，无法用索引

---

### 问 7：组合索引与最左前缀匹配

对于组合查询 `WHERE age = 25 AND city = 'Beijing'`：

```sql
-- 推荐：组合索引
CREATE INDEX idx_age_city ON users(age, city);
```

**最左前缀匹配原则**：组合索引 `(age, city)` 必须从第一列开始匹配：

```sql
WHERE age = 25 AND city = 'Beijing'  -- ✅ 能用索引
WHERE city = 'Beijing' AND age = 25  -- ✅ 能用索引（优化器调整顺序）
WHERE age = 25                        -- ✅ 能用索引（只用第一列）
WHERE city = 'Beijing'                -- ❌ 不能用索引（跳过第一列）
```

---

## 四、表设计（Schema Design）

### 问 8：如何设计多表关系？

设计一个"博客系统"，需要存储用户、文章、评论：

```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50),
    email VARCHAR(100)
);

CREATE TABLE articles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200),
    content TEXT,
    author_id INT,  -- 外键，关联 users.id
    create_time DATETIME
);

CREATE TABLE comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    content TEXT,
    article_id INT,  -- 外键，关联 articles.id
    user_id INT,     -- 外键，关联 users.id
    create_time DATETIME
);
```

---

## 五、表连接（JOIN）

### 问 9：如何连接两张表查询？

查询"用户 ID 为 1 的所有文章，并显示作者名字"：

```sql
SELECT articles.id, articles.title, users.name
FROM articles
INNER JOIN users ON articles.author_id = users.id
WHERE users.id = 1;
```

---

### 问 10：LEFT JOIN vs INNER JOIN

查询"所有用户及其文章数量"，包括没有发过文章的用户：

```sql
SELECT users.name, COUNT(articles.id) as article_count
FROM users
LEFT JOIN articles ON users.id = articles.author_id
GROUP BY users.id;
```

- `INNER JOIN`：只返回有匹配的行
- `LEFT JOIN`：返回左表所有行，右表没有匹配时填 `NULL`

---

### 问 11：LEFT JOIN 与 WHERE 的陷阱

**问题**：以下查询会把"没有发过文章的用户"过滤掉吗？

```sql
SELECT users.name, COUNT(articles.id) as article_count
FROM users
LEFT JOIN articles ON users.id = articles.author_id
WHERE articles.create_time >= '2024-01-01';
```

**答案**：**会过滤掉！** 没有发过文章的用户，`articles.create_time` 是 `NULL`，`WHERE` 条件会让它变成 `INNER JOIN` 的效果。

**正确写法**：条件移到 `ON` 子句

```sql
SELECT users.name, COUNT(articles.id) as article_count
FROM users
LEFT JOIN articles ON users.id = articles.author_id
    AND articles.create_time >= '2024-01-01'
GROUP BY users.id;
```

---

## 六、聚合函数与 GROUP BY

### 问 12：如何按组统计？

按 `user_id` 分组，计算每个用户的"订单总金额"：

```sql
SELECT user_id, SUM(amount) as total_amount
FROM orders
GROUP BY user_id;
```

---

### 问 13：GROUP BY 的陷阱

```sql
-- ❌ 错误：name 没有被聚合函数包裹
SELECT user_id, name, SUM(amount) as total_amount
FROM orders
GROUP BY user_id;

-- ✅ 正确方案 A：用聚合函数包裹
SELECT user_id, MAX(name) as name, SUM(amount) as total_amount
FROM orders
GROUP BY user_id;

-- ✅ 正确方案 B：更好的设计（name 在 users 表）
SELECT o.user_id, u.name, SUM(o.amount) as total_amount
FROM orders o
JOIN users u ON o.user_id = u.id
GROUP BY o.user_id, u.name;
```

---

### 问 14：WHERE vs HAVING

找出"订单总额超过 1000 的用户"：

| 关键字 | 执行时机 | 用途 |
|--------|----------|------|
| `WHERE` | 聚合**之前** | 过滤原始行 |
| `HAVING` | 聚合**之后** | 过滤分组结果 |

```sql
-- 正确：HAVING 在 GROUP BY 之后执行
SELECT user_id, SUM(amount) as total_amount
FROM orders
GROUP BY user_id
HAVING total_amount > 1000;
```

---

## 七、事务（Transaction）

### 问 16：如何确保多个操作要么都成功，要么都失败？

用户 A 给用户 B 转账 100 元：

```sql
START TRANSACTION;

UPDATE accounts SET balance = balance - 100 WHERE user_id = A;
UPDATE accounts SET balance = balance + 100 WHERE user_id = B;

COMMIT;   -- 提交（确认成功）
-- 或
ROLLBACK; -- 回滚（撤销所有操作）
```

**Node.js 示例**：

```js
try {
    await connection.beginTransaction();
    await connection.execute('UPDATE accounts SET balance = balance - 100 WHERE user_id = A');
    await connection.execute('UPDATE accounts SET balance = balance + 100 WHERE user_id = B');
    await connection.commit();
} catch (err) {
    await connection.rollback();
    throw err;
}
```

---

### 问 17：事务的隔离级别

MySQL 默认是 **Repeatable Read（可重复读）**。

| 隔离级别 | 脏读 | 不可重复读 | 幻读 |
|---------|------|-----------|------|
| Read Uncommitted | ❌ 可能 | ❌ 可能 | ❌ 可能 |
| Read Committed | ✅ 避免 | ❌ 可能 | ❌ 可能 |
| **Repeatable Read**（MySQL 默认） | ✅ 避免 | ✅ 避免 | ❌ 可能 |
| Serializable | ✅ 避免 | ✅ 避免 | ✅ 避免 |

---

## 八、索引深入

### 问 18：组合索引的字段顺序

`status` 只有 3 个值（低选择性），`author_id` 有 10000 个值（高选择性）：

```sql
-- 推荐：选择性高的字段放前面
CREATE INDEX idx_author_status ON articles(author_id, status);
```

---

### 问 19：全文搜索优化

`WHERE title LIKE '%MySQL%'` 无法用索引。替代方案：

```sql
-- 全文索引
ALTER TABLE articles ADD FULLTEXT INDEX ft_title (title);
SELECT * FROM articles WHERE MATCH(title) AGAINST('MySQL');
```

---

### 问 20：EXPLAIN 与索引优化

```sql
EXPLAIN SELECT * FROM articles WHERE author_id = 123 ORDER BY create_time DESC LIMIT 10;
```

输出关键字段：
- `key`：实际使用的索引
- `rows`：预计扫描行数
- `Extra`：`Using filesort` ❌（需额外排序）vs `Using index` ✅（只用索引完成）

---

## 总结

| 概念 | 关键点 | 类比前端 |
|------|--------|----------|
| 分页 | 必须加 ORDER BY | 数组先排序再 slice |
| 索引 | B+ 树，有方向性 | Map 查找 vs 数组遍历 |
| JOIN | INNER vs LEFT，注意 WHERE 陷阱 | 数组合并与过滤 |
| 聚合 | GROUP BY + HAVING | reduce 累加 |
| 事务 | 原子性操作 | try/catch + 回滚 |
