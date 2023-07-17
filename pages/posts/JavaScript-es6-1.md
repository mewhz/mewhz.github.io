---
title: JavaScript模板字符串拼接(ES6新特性)
tags:
  - JavaScript
date: 2022-03-10 19:14:51
updated: 2022-03-10 19:14:51
---

### ES6之前拼接字符串

```javascript
let url = "mewhz";
let string = '网址：' + url + '.com';
console.log(string);

/*
output:
网址：mewhz.com
*/
```

### ES6模板字符串

```javascript
let url = "mewhz";
let string = `网址是：${url}.com`;
console.log(string);
/*
output:
网址：mewhz.com
*/
```



简介

>字符串两边使用反引号 **`**
>
>除了作为普通字符串，还可以用来定义多行字符串，还可以在字符串中加入变量和表达式。
>
>另外模板字符串中的换行和空格都是会被保留的。
