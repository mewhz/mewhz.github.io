---
title: 网络安全学习-pikachu靶场-暴力破解
date: 2024-01-11 20:34:37
updated: 2024-01-11 20:34:37
tags:
  - 网络安全
  - 暴力破解
---

在web攻击中，一般会使用这种手段对应用系统的认证信息进行获取。 其过程就是使用大量的认证信息在认证接口进行尝试登录，直到得到正确的结果。 为了提高效率，暴力破解一般会使用带有字典的工具来进行自动化操作。

<!-- more -->

### 1. 基于表单的暴力破解

#### 漏洞复现

根据电脑对应的操作系统，下载 Yakit：https://yaklang.com/

Yakit 是一款集成化单兵安全能力平台，拥有众多安全工具，方便快捷；

后续攻略主要使用 Yakit 以及其他渗透工具；

打开 Yakit 选择 **MITM 交互式劫持**进行抓包

![image-20231118233100921](http://pic.mewhz.com/blog/image-20231118233100921.png)

配置**代理监听主机**和**代理监听端口**，主机配置**127.0.0.1**，端口配置不冲突的如**8080、9090等**，单击免配置启动，会启动一个 Chrome 浏览器，使用该浏览器访问的请求会直接在 Yakit 中显示

![image-20231118235709526](http://pic.mewhz.com/blog/image-20231118235709526.png)

访问 Pikachu 靶场中的**基于表单的暴力破解**，随意输入一些用户名密码进行测试，并查看 Yakit 劫持的请求。单击请求链接，发现请求包中包含输入的用户名密码信息，选择该请求右上角的**FUZZ**进行重复发包的模糊测试

![image-20231118235958749](http://pic.mewhz.com/blog/image-20231118235958749.png)

选中用户名后，**右键**->**插入标签/字典**->**插入模糊测试字典标签**

![image-20231119000205176](http://pic.mewhz.com/blog/image-20231119000205176.png)

选择字典**user_top10**，并单击右上角**选择该Fuzz标签**

Yakit 内部包含用户名和密码爆破使用的两种字典，不过内容较少，同时 Yakit 也支持添加自定义字典

![image-20231119000500847](http://pic.mewhz.com/blog/image-20231119000500847.png)

同理，password 也使用相同的操作并选择**pass_top25**标签

![image-20231119010717972](http://pic.mewhz.com/blog/image-20231119010717972.png)

准备就绪后，单击左上角的发送请求，会批量的向服务器发送登录请求进行密码爆破；爆破结束后查看每个请求返回的响应大小，单击响应大小旁的箭头进行**排序**，挑选出**响应大小与其他不同的响应**，通常这个请求的 payloads 就是账号密码。

在下方显示的响应结果中，选择**渲染**会把 html 源码渲染成页面的形式，最下方找到登录成功的提示

![image-20231119004307565](http://pic.mewhz.com/blog/image-20231119004307565.png)

#### 源码分析

源码位置：**pikachu\vul\burteforce\bf_form.php**

```php
//典型的问题,没有验证码,没有其他控制措施,可以暴力破解
if(isset($_POST['submit']) && $_POST['username'] && $_POST['password']){
// 判断 POST 请求提交的参数名是否符合要求
    $username = $_POST['username'];
    $password = $_POST['password'];
    $sql = "select * from users where username=? and password=md5(?)";
    $line_pre = $link->prepare($sql);
	// 对要执行的 SQL 语句预编译，防止 SQL 注入

    $line_pre->bind_param('ss',$username,$password);
    // 把参数绑定到预处理 SQL 语句的占位符上

    if($line_pre->execute()){
        // 执行 SQL 语句
        $line_pre->store_result();
        // 存储 SQL 语句的执行结果
        if($line_pre->num_rows>0){
            // 判断返回的结果是否大于 0，即是否存在该数据
            $html.= '<p> login success</p>';

        } else{
            $html.= '<p> username or password is not exists～</p>';
        }

    } else{
        $html.= '<p>执行错误:'.$line_pre->errno.'错误信息:'.$line_pre->error.'</p>';
    }

}
```

简单粗暴的判断提交的 username 和 password 与数据库中的字段做比对，相同则登录成功

### 2. 验证码绕过 (on server)

#### 漏洞复现

打开 yakit 进行抓包监听，单击验证码使其刷新，通过手动劫持发现有请求发往后端，判断验证码机制来自后端

![image-20231127215304110](http://pic.mewhz.com/blog/image-20231127215304110.png)

验证码可以用来防止恶意注册、防止暴力破解。

同时也存在绕过验证码机制的方法，最常见的就是验证码在后台不过期，导致长期可使用

尝试输入用户名、密码和验证码测试能否登录成功

![image-20231127222654024](http://pic.mewhz.com/blog/image-20231127222654024.png)

提示用户名密码错误，且验证码刷新

来到 MITM 交互式劫持找到刚刚提交的请求，单击 FUZZ 发送到 Web Fuzzer

![image-20231127222902891](http://pic.mewhz.com/blog/image-20231127222902891.png)

直接单击发送请求会发现提示验证码错误

![image-20231127222958848](http://pic.mewhz.com/blog/image-20231127222958848.png)

修改请求包中的验证码参数，把它修改为浏览器中显示的验证码，并尝试重复发包，此时不再提示验证码错误

设置密码参数的模糊测试标签，通过爆破的响应结果大小判断密码的正确性

<img src="http://pic.mewhz.com/blog/image-20231127223829495.png" alt="image-20231127223829495"  />

#### 源码分析

源码位置：**pikachu\vul\burteforce\bf_server.php**

```php
if(isset($_POST['submit'])) {
    if (empty($_POST['username'])) {
        $html .= "<p class='notice'>用户名不能为空</p>";
    } else {
        if (empty($_POST['password'])) {
            $html .= "<p class='notice'>密码不能为空</p>";
        } else {
            if (empty($_POST['vcode'])) {
                $html .= "<p class='notice'>验证码不能为空哦！</p>";
            } else {
				// 验证验证码是否正确
                if (strtolower($_POST['vcode']) != strtolower($_SESSION['vcode'])) {
                    $html .= "<p class='notice'>验证码输入错误哦！</p>";
                    // 应该在验证完成后,销毁该$_SESSION['vcode']
                }else{

                    $username = $_POST['username'];
                    $password = $_POST['password'];
                    $vcode = $_POST['vcode'];

                    $sql = "select * from users where username=? and password=md5(?)";
                    $line_pre = $link->prepare($sql);

                    $line_pre->bind_param('ss',$username,$password);

                    if($line_pre->execute()){
                        $line_pre->store_result();
                        // 虽然前面做了为空判断,但最后,却没有验证验证码!!!
                        if($line_pre->num_rows()==1){
                            $html.='<p> login success</p>';
                        }else{
                            $html.= '<p> username or password is not exists～</p>';
                        }
                    }else{
                        $html.= '<p>执行错误:'.$line_pre->errno.'错误信息:'.$line_pre->error.'</p>';
                    }
                }
            }
        }
    }
}
```

添加了验证码的应用，把请求包中的 vcode 参数与 session 中的 vcode 参数作比较，即判断验证码是否正确；但是在判断后，没有在每一次请求后销毁 session[vcode] 并重新生成，导致验证码会一直有效。

### 3. 验证码绕过 (on client)

#### 漏洞复现

打开 yakit 进行抓包监听，单击验证码使其刷新，通过手动劫持发现有请求并未发送到后端，猜测验证码功能在前端实现

![image-20240109111111506](http://pic.mewhz.com/blog/image-20240109111111506.png)

在浏览器按下 F12 ，单击左上角的鼠标图标，并拖到整个登录框，查看验证码前端源代码，并在源代码中全文搜索 onsubmit 调用的函数 validate() ，得出验证码在前端校验

![image-20240109111204963](http://pic.mewhz.com/blog/image-20240109111204963.png)

通过在源代码中删除调用的函数方法，此时不输入验证码也登录

![image-20240109111235126](http://pic.mewhz.com/blog/image-20240109111235126.png)

抓取刚刚的登录请求，右键“发送到 WebFuzzer”，设置用户名和密码参数的模糊测试标签，通过爆破的响应结果大小判断密码的正确性

![image-20240109111612365](http://pic.mewhz.com/blog/image-20240109111612365.png)

![image-20240109111739756](http://pic.mewhz.com/blog/image-20240109111739756.png)

#### 源码分析

```php
if(isset($_POST['submit'])){
    if($_POST['username'] && $_POST['password']) {
        $username = $_POST['username'];
        $password = $_POST['password'];
        $sql = "select * from users where username=? and password=md5(?)";
        $line_pre = $link->prepare($sql);


        $line_pre->bind_param('ss', $username, $password);

        if ($line_pre->execute()) {
            $line_pre->store_result();
            if ($line_pre->num_rows > 0) {
                $html .= '<p> login success</p>';

            } else {
                $html .= '<p> username or password is not exists～</p>';
            }

        } else {
            $html .= '<p>执行错误:' . $line_pre->errno . '错误信息:' . $line_pre->error . '</p>';
        }


    }else{
        $html .= '<p> please input username and password～</p>';
    }


}
```

```javascript
var code; //在全局 定义验证码
function createCode() {
    code = "";
    var codeLength = 5;//验证码的长度
    var checkCode = document.getElementById("checkCode");
    var selectChar = new Array(0, 1, 2, 3, 4, 5, 6, 7, 8, 9,'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z');//所有候选组成验证码的字符，当然也可以用中文的

    for (var i = 0; i < codeLength; i++) {
        var charIndex = Math.floor(Math.random() * 36);
        code += selectChar[charIndex];
    }
    //alert(code);
    if (checkCode) {
        checkCode.className = "code";
        checkCode.value = code;
    }
}

function validate() {
    var inputCode = document.querySelector('#bf_client .vcode').value;
    if (inputCode.length <= 0) {
        alert("请输入验证码！");
        return false;
    } else if (inputCode != code) {
        alert("验证码输入错误！");
        createCode();//刷新验证码
        return false;
    }
    else {
        return true;
    }
}


createCode();
```

后端并未出现验证码校验功能，仅判断用户名和密码是否正确；前端通过 floor 函数生成 5 个随机数字作为数组下标，并根据数组下标取对应的字符作为验证码。当禁用掉 validate() 抓包登录时，可以从前端绕过验证码实现爆破。

### 4. token 防爆破？

#### 漏洞复现

仿照上述方法抓包，添加模糊测试标签并爆破测试会发现提示：csrf token error

![image-20240109142110686](http://pic.mewhz.com/blog/image-20240109142110686.png)

这是因为每次发送登录请求时，都会携带 token 参数

Token：**服务器生成一个 Token 便将此 Token 返回给客户端，前端会存储这个 Token，放在 session 或 cookie 中，用于之后的业务请求身份验证**

![image-20240109142700905](http://pic.mewhz.com/blog/image-20240109142700905.png)

可以使用 yakit 中的热加载和 Fuzzer 序列两种方法进行爆破

##### 热加载

热加载是一种允许在不停止或重启应用程序的情况下，动态加载或更新特定组件或模块的功能。这种技术常用于开发过程中，提高开发效率和用户体验；如本例子中使用热加载的方法：beforeRequest，可以在发送请求前，再次发送一个 Get 来获取 token 值，再使用这个值进行爆破

首先拦截登录的 Post 请求，发送到 Fuzz 模块，选择上方的热加载

![image-20240109152457902](http://pic.mewhz.com/blog/image-20240109152457902.png)

```
beforeRequest = func(req) {
// 发送GET请求，获取响应
rsp, _, err = poc.HTTP(`GET /pikachu/vul/burteforce/bf_token.php HTTP/1.1
Host: 127.0.0.1
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Accept-Encoding: gzip, deflate
Accept-Language: zh-CN,zh;q=0.9,en;q=0.8,en-US;q=0.7
Cache-Control: max-age=0
Referer: http://127.0.0.1/pikachu/vul/csrf/csrfget/csrf_get_login.php
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36
X-Forwarded-For: 127.0.0.1
x-forwarded-for: 127.0.0.1
`)

if err != nil {
    return req
}
// 获取GET响应的Set-Cookie
cookie = poc.GetHTTPPacketHeader(rsp, "Set-Cookie")
node, err = xpath.LoadHTMLDocument(rsp)
if err != nil {
    return req
}
// 通过xpath语法获取token的值
tokenNode = xpath.FindOne(node, "//input[@name='token']")
if tokenNode == nil {
    return req
}
token = xpath.SelectAttr(tokenNode, "value")
// 替换token
req = req.ReplaceAll("__TOKEN__", token)
// 替换cookie
req = poc.AppendHTTPPacketHeader(req, "Cookie", cookie)
return req
}
```

这里我们一共做了以下几件事情：

1. 通过GET请求，拿到响应
2. 通过响应拿到Set-Cookie的值
3. 通过xpath语法获取token的值
4. 替换`__TOKEN__`为实际的token
5. 添加POST请求的Cookie为第二步中拿到的Set-Cookie，这样模拟了多个用户同时请求的情况

单击保存退出后，把 token 参数改成 ``__TOKEN__``，并添加密码的模糊测试标签，成功爆破出密码

![image-20240109152755763](http://pic.mewhz.com/blog/image-20240109152755763.png)

##### Fuzzer 序列

可以使用 yakit 提供的 Fuzzer 序列的办法，序列可以将多个 Fuzzer 节点串联起来，实现更复杂的逻辑与功能；如本例子中先通过 Get 请求获取 token，在携带 token 去爆破用户名和密码

首先在 MITM 交互式劫持中找到 Get 请求，将它发送到 Fuzz 模块并再次发送请求

![image-20240109144659115](http://pic.mewhz.com/blog/image-20240109144659115.png)

在响应中右键选择提取器，根据正则表达式提取响应结果中 token 的值；单击右边的三个点，可以在响应结果中直接选中要提取的值

![image-20240109144943748](http://pic.mewhz.com/blog/image-20240109144943748.png)

使用自动提取正则 Ctrl + F 搜索 token 字符串，找到 name="token" value="" 中的 token，也就是能搜索到的最后一个 token 关键字；将其选中后会自动输出对应的正则，修改 value="" 中的内容为 (.*?)，其中括号可以保证精准的找到 value 里面的值，```.*?```代表匹配任意字符串；确认后再次单击对勾，返回数据提取器界面

![image-20240109145152671](http://pic.mewhz.com/blog/image-20240109145152671.png)

修改匹配正则分组为 1，确保只匹配 token 的内容，可以单击左上角笔的图标修改该变量名，单击右上角调试执行查看是否只匹配到 token 的内容，单击应用，匹配器设置完成

![image-20240109145727291](http://pic.mewhz.com/blog/image-20240109145727291.png)

![image-20240109145859632](http://pic.mewhz.com/blog/image-20240109145859632.png)

单击左边的 Fuzzer 配置，设置变量，添加 fuzztag 类型的变量，设置为 

```
{{x(pass_top25)}}
```

在后续的步骤中使用设置的变量名 pass，作为字典模糊标签的代替；

![image-20240109150305933](http://pic.mewhz.com/blog/image-20240109150305933.png)

单击左边的 Fuzzer 序列，同样在MITM 交互式劫持 中找到，登录时提交的 post 请求，发送到 Fuzz 模块，拖动到该组中；在序列中配置步骤1 是 Get 请求，步骤 2 是 Post 请求

![image-20240109150620769](http://pic.mewhz.com/blog/image-20240109150620769.png)

配置 Post 请求中的参数，把步骤 1 中设置好的变量放在对应的位置；

**注意：删除两个请求中的 Cookie 请求头，这是因为它的 token 和 PHPSESSION 是一一对应的，而在并发的情况下，使用相同的 Cookie 请求头去获取 token，会导致后端存储的 token 被刷新，而此时先前获取的 token 会失效，就会导致 csrf token error**

![image-20240109150815466](http://pic.mewhz.com/blog/image-20240109150815466.png)

成功爆破到账号密码

![image-20240109151120934](http://pic.mewhz.com/blog/image-20240109151120934.png)

#### 源码分析

```php
if(isset($_POST['submit']) && $_POST['username'] && $_POST['password'] && $_POST['token']){

    $username = $_POST['username'];
    $password = $_POST['password'];
    $token = $_POST['token'];

    $sql = "select * from users where username=? and password=md5(?)";
    $line_pre = $link->prepare($sql);


    $line_pre->bind_param('ss',$username,$password);
    if($token == $_SESSION['token']){

        if($line_pre->execute()){
            $line_pre->store_result();
            if($line_pre->num_rows>0){
                $html.= '<p> login success</p>';

            } else{
                $html.= '<p> username or password is not exists～</p>';
            }

        }else{
            $html.= '<p>执行错误:'.$line_pre->errno.'错误信息:'.$line_pre->error.'</p>';
        }


    }else{
        $html.= '<p> csrf token error</p>';
    }
}
set_token();
```

通过比较 $_SESSION['token'] 的值，并且每次请求后都会利用 set_token() 刷新 token；



