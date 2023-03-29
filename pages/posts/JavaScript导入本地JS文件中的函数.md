---
title: JavaScript导入本地JS文件中的函数
tags:
  - JavaScript
abbrlink: 8319c694
date: 2022-01-02 00:30:39
---

### HTML代码

* 首先创建对应的 html，并设置一些标签；
* 导入 JQuery 文件和自定义 JavaScript 文件；
* 在导入的 JavaScript 文件时，设置 type = ”module“；

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <h1 id="hello">Hello</h1>
    <button id="button">点我</button>
    <script src="https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js"></script>
    <script src="js/test.js" type="module"></script>
</body>
</html>
```



### JavaScript 文件

* 导入的 JavaScript 文件；

* 导入 JavaScript 并调用；

```javascript
// test.js
import { myClick, myJS } from "./utils.js";
myJS();
$("document").ready(()=>{
    alert("加载中！");
    $("#button").click(()=>{
        myClick();
    })
})
```

* 需要导入的本地文件；
* 将每个函数用 export 修饰；

```javascript
// utils.js
export function myJS(){
    $("#hello").append(" World");
}
export function myClick(){
    alert("Hello World");
}
```
