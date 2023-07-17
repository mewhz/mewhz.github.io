---
title: 实现简单的前后端分离
tags:
  - Java
date: 2021-12-31 12:11:51
updated: 2021-12-31 12:11:51
---

### HTML 代码

* 首先创建对应的 html，并在需要的显示数据的位置设置 id；
* 导入 JQuery 和 js 文件；

```html
<!--test.html-->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <script src="js/jquery-3.6.0.min.js"></script>
    <script src="js/test.js"></script>
</head>
<body>
  <h1 id="test"></h1>
</body>
</html>
```



### javascript 代码

* 对 url 发起 ajax 请求，并将获取到的数据显示在 id 对应的位置；

```javascript
// test.js
$(document).ready(()=>{
    $.ajax({
        url:"/test",
        success:(result)=>{
            $("#test").text(result);
        }
    })
});
```



### Java 代码

* 使用 SpringBoot 响应请求，并返回数据；

```java
// TestController.java
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @RequestMapping("/test")
    public String test(){
        String result = "Hello World";
        return result;
    }
}

```
