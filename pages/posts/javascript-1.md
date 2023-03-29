---
title: 简述浅拷贝与深拷贝
tags:
  - JavaScript
readmore: true
abbrlink: 6f87ad97
date: 2022-04-20 23:19:04
---

### 数据类型

JavaScript 中可以把数据类型简单的分为基本数据类型和引用数据类型。

1. 基本数据类型的特点：直接在栈中存储数据。
2. 引用数据类型的特点：在栈中存储该对象的引用，真实的数据存放在堆内存中。

<!-- more -->

### 浅拷贝与深拷贝

1. 浅拷贝：**浅拷贝只会复制指向对象的指针，而不复制对象本身，新旧对象还是共享同一块内存，所以修改新的对象时，原对象也会发生修改。**
2. 深拷贝：**深拷贝会另外创造一个一模一样的对象，新对象跟原对象不共享内存，修改新的对象，原对象不会发生改变。**



### 两种简单实现方式

1. 浅拷贝

   ```javascript
   // 当对象只有一层直接使用赋值运算符和浅拷贝是一样的效果
   let objs = { a: 1, b: 2 };
   let temp = objs;
   temp.a = 3;
   console.log(objs);	// Object { a: 3, b: 2 }
   console.log(temp);	// Object { a: 3, b: 2 }
   // 两个值都发生了变化
   ```

2. 深拷贝

   ```javascript
   // 当对象只有一层时，Object.assign 方法实现深拷贝
   let objs = { a: 1, b: 2 };
   let temp = Object.assign({}, objs);
   temp.a = 3;
   console.log(objs);	// Object { a: 1, b: 2 }
   console.log(temp);	// Object { a: 3, b: 2 }
   ```

### 参考

[彻底讲明白赋值与浅拷贝与深拷贝](https://wangxinyang.xyz/article/60b769fb9259d95c60df3559)
