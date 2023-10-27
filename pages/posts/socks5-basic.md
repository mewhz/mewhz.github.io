---
layout: post
title:  Socks5 隧道的简易搭建与使用
date: 2023-10-28 03:12:48
updated: 2023-10-28 03:12:48
tags:
  - 网络安全
  - 环境配置
  - Linux
---

### 简介

Socks5 ( Socket secure 5 ) 是一种网络协议，用于在客户端和代理服务器之间进行通信。它是 Socks 协议的第五个版本，Socks5 协议支持 TCP 和 UDP 协议，并提供了认证和加密的功能。

Socks5 协议广泛用于代理服务器、XX 上网、匿名访问、负载均衡等场景。它提供了一种通用的、灵活的代理解决方案，可以在各种网络环境和应用中使用。

<!-- more -->

### MobaXterm 搭建隧道

使用 MobaXterm 登录要搭建 S5 隧道的 Linux

输入命令：`ssh-keygen`

![image-20231028020648095](https://pic.mewhz.com/blog/image-20231028020648095.png)

当提示输入文件名时，可以选择保留默认文件名，也可以为密钥对指定一个自定义文件名。

当提示输入密码时，可以选择设置密码，也可以留空不设置密码。设置密码可以增加密钥的安全性，但每次使用密钥时都需要输入密码，可能会稍微影响使用效率。

当提示确认密码时，如果设置了密码，则需要再次输入密码进行确认。

ssh-keygen 会生成两个文件：**id_rsa** 是私钥文件，**id_rsa.pub** 是公钥文件。

私钥文件保存本地计算机；公钥文件保存在远程主机。

![image-20231028020712941](https://pic.mewhz.com/blog/image-20231028020712941.png)

下载 **id_rsa** 文件到本地；

紧接着在右侧工具栏中找到 MobaSSHtunnal

![image-20231028020948305](https://pic.mewhz.com/blog/image-20231028020948305.png)

创建新的 SSH tunnel

![image-20231028021054592](https://pic.mewhz.com/blog/image-20231028021054592.png)

选择 **Dynamic port forwarding (SOCKS proxy)**

并输入对应的信息：

左侧输入本地转发的端口号，选择任意未被占用的端口即可；

右侧输入 SSH 配置信息，依次是服务器的 IP，用户名，端口号；完成后保存。

![image-20231028021303895](https://pic.mewhz.com/blog/image-20231028021303895.png)

在 **MobaSSHTunnel** 会出现刚刚新添加的选项，单击小钥匙的图标，并选择刚刚保存在本地的私钥文件

![image-20231028021659465](https://pic.mewhz.com/blog/image-20231028021659465.png)

导入成功后，选择左边的 Start 按钮

![image-20231028021746107](https://pic.mewhz.com/blog/image-20231028021746107.png)

---

### 浏览器代理配置

火狐浏览器首先安装代理切换插件：[FoxyProxy Standard](https://github.com/foxyproxy/firefox-extension)

也可以使用火狐浏览器的设置中的切换代理，本文接下来的内容使用插件演示教程。

安装成功后，添加新的代理

代理类型选择 Socks 5；代理 IP 输入 127.0.0.1；代理端口输入刚刚设置的转发端口，本文采用 9090。

![image-20231028022148938](https://pic.mewhz.com/blog/image-20231028022148938.png)

保存成功配置后，右上角插件处选择启用该代理：

![image-20231028022358361](https://pic.mewhz.com/blog/image-20231028022358361.png)

访问 ip 查询网站查看本机 ip，设置成功时，查看到的 ip 和搭建隧道的服务器是一样的 ip。

![image-20231028022636150](https://pic.mewhz.com/blog/image-20231028022636150.png)

---

### Windows 命令行代理配置

```bash
set http_proxy=socks5://127.0.0.1:9090
set https_proxy=socks5://127.0.0.1:9090
# 分别设置 http 和 https 的代理
curl cip.cc
# 查询 ip，检查是否配置成功
```

![image-20231028023227150](https://pic.mewhz.com/blog/image-20231028023227150.png)

**这种方法只是临时配置，重新打开命令行还需要再次配置**

---

### Yakit 代理配置

选择 MITM 交互式劫持，修改下游代理的设置：

![image-20231028023627971](https://pic.mewhz.com/blog/image-20231028023627971.png)

单击免配置启动后，访问 cip.cc 检查是否配置成功

![image-20231028023734580](https://pic.mewhz.com/blog/image-20231028023734580.png)

将访问 cip.cc 的请求发送到 Web Fuzzer 中，选择高级配置设置代理：

![image-20231028023918067](https://pic.mewhz.com/blog/image-20231028023918067.png)

发送请求检查是否配置成功

![image-20231028023951506](https://pic.mewhz.com/blog/image-20231028023951506.png)

---

### Proxifier 代理配置

Proxifier 支持选择指定的网络应用程序实现代理上网，不需要逐一设置代理，且有许多网络应用程序不支持通过代理服务器工作，也可以使用 Proxifier 进行代理上网。

启动 Proxifier 后，选择**配置文件 -> 代理服务器**

![image-20231028024520369](https://pic.mewhz.com/blog/image-20231028024520369.png)

添加代理服务器，并输入对应的 IP，端口与协议，完成后单击确认。

![image-20231028024622468](https://pic.mewhz.com/blog/image-20231028024622468.png)

选择**否**，之后新建代理规则。

![image-20231028025123077](https://pic.mewhz.com/blog/image-20231028025123077.png)

选择**配置文件 -> 代理规则**

![image-20231028025203631](https://pic.mewhz.com/blog/image-20231028025203631.png)

应用程序选择火狐浏览器；动作选择 Socks5

![image-20231028025900090](https://pic.mewhz.com/blog/image-20231028025900090.png)

![image-20231028025911810](https://pic.mewhz.com/blog/image-20231028025911810.png)

回到云服务器，任意创建一个 html 页面，并使用 Python 启动简易的 web 服务器

```bash
python3 -m http.server 8080
# 在该目录下启动 web 服务器并运行在 8080 端口
```

使用其他浏览器访问 ip:8080

![image-20231028030809241](https://pic.mewhz.com/blog/image-20231028030809241.png)

回到火狐浏览器，右上角关闭代理插件，再次访问查看 ip，依然是云服务器 IP

**说明此时 Proxifier 配置成功**

![image-20231028030917864](https://pic.mewhz.com/blog/image-20231028030917864.png)

访问 127.0.0.1:8080 与使用 IP:8080 访问内容一样，配置成功。

**若访问失败，关闭电脑其他代理软件后再次尝试**

![image-20231028031003075](https://pic.mewhz.com/blog/image-20231028031003075.png)
