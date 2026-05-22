---
title: "TypeScript 最佳实践：写出更健壮的代码"
description: "分享 TypeScript 开发中的最佳实践，帮助你写出更安全、更可维护的代码。"
pubDate: 2024-01-05
tags: ["TypeScript", "JavaScript", "编程"]
category: "编程语言"
cover: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=400&fit=crop"
draft: false
---

## 为什么使用 TypeScript？

TypeScript 是 JavaScript 的超集，它添加了静态类型检查，可以帮助你在编写代码时就发现错误，而不是在运行时。

## 最佳实践

### 1. 使用严格模式

在 `tsconfig.json` 中启用严格模式：

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

### 2. 优先使用类型推断

TypeScript 的类型推断很强大，让编译器自动推断类型：

```typescript
// 不好的写法
const numbers: number[] = [1, 2, 3];

// 好的写法
const numbers = [1, 2, 3]; // TypeScript 会自动推断为 number[]
```

### 3. 使用接口定义对象形状

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string; // 可选属性
}

function createUser(user: User): User {
  return user;
}
```

### 4. 使用类型别名简化复杂类型

```typescript
type UserID = number;
type UserMap = Map<UserID, User>;

// 使用
const users: UserMap = new Map();
```

### 5. 使用联合类型

```typescript
type Status = 'loading' | 'success' | 'error';

function handleStatus(status: Status) {
  switch (status) {
    case 'loading':
      return '加载中...';
    case 'success':
      return '成功！';
    case 'error':
      return '出错了';
  }
}
```

### 6. 使用泛型提高代码复用

```typescript
function getFirst<T>(array: T[]): T | undefined {
  return array[0];
}

const firstNumber = getFirst([1, 2, 3]); // 类型为 number | undefined
const firstString = getFirst(['a', 'b', 'c']); // 类型为 string | undefined
```

### 7. 使用枚举管理常量

```typescript
enum Direction {
  Up = 'UP',
  Down = 'DOWN',
  Left = 'LEFT',
  Right = 'RIGHT',
}

function move(direction: Direction) {
  // ...
}

move(Direction.Up);
```

### 8. 使用类型守卫

```typescript
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function process(value: string | number) {
  if (isString(value)) {
    // TypeScript 知道这里 value 是 string
    console.log(value.toUpperCase());
  } else {
    // TypeScript 知道这里 value 是 number
    console.log(value.toFixed(2));
  }
}
```

### 9. 使用 Utility Types

TypeScript 提供了许多内置的工具类型：

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

// Partial - 所有属性变为可选
type PartialUser = Partial<User>;

// Required - 所有属性变为必需
type RequiredUser = Required<PartialUser>;

// Pick - 选择部分属性
type UserBasic = Pick<User, 'id' | 'name'>;

// Omit - 排除部分属性
type UserWithoutEmail = Omit<User, 'email'>;
```

### 10. 使用 satisfies 操作符（TypeScript 4.9+）

```typescript
type Colors = 'red' | 'green' | 'blue';
type RGB = [red: number, green: number, blue: number];

const palette = {
  red: [255, 0, 0],
  green: '#00ff00',
  blue: [0, 0, 255],
} satisfies Record<Colors, string | RGB>;

// palette.green 的类型是 string
// palette.red 的类型是 RGB
```

## 常见错误

1. **过度使用 any**：尽量避免使用 `any`，使用 `unknown` 代替
2. **忽略 null 检查**：始终检查可能为 null 或 undefined 的值
3. **类型断言滥用**：谨慎使用 `as`，优先使用类型守卫

## 总结

TypeScript 是一个强大的工具，通过遵循这些最佳实践，你可以写出更安全、更可维护的代码。记住，类型系统是你的朋友，它可以帮助你在开发阶段就发现潜在的问题。
