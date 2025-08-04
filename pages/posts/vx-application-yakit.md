---
layout: post
title: 微信小程序抓包
date: 2023-11-14 17:11:42
updated: 2023-11-14 17:11:42
tags:
  - 网络安全
  - 环境配置
---

在 Windows端，使用 Yakit 和 Proxifier 配合对微信小程序进行抓包。使用 Proxifier 设置微信小程序请求时通过的代理端口，并使用 Yakit 监听该端口的所有请求，再通过 Yakit 把请求发送出去

<!-- more -->

#### Proxifier 配置

启动 Proxifier 后，选择**配置文件 -> 代理服务器**

![image-20231114165400192](https://pic.mewhz.com/blog/image-20231114165400192.png)

添加代理服务器，并输入对应的 IP，端口与协议，完成后单击确认。

![image-20231114165516586](https://pic.mewhz.com/blog/image-20231114165429817.png)

选择**是**，并配置代理规则

![image-20231114165429817](https://pic.mewhz.com/blog/image-20231114165516586.png)

配置代理规则，应用程序输入 WeCahtAppEx.exe

动作选择 HTTPS 后确定

![image-20231114165854218](https://pic.mewhz.com/blog/image-20231114165854218.png)

![image-20231114165911280](https://pic.mewhz.com/blog/image-20231114165911280.png)

Proxifier 配置完成


#### Yakit 配置

启动 Yakit，选择**MITM 交互式劫持**

![image-20231114170533713](https://pic.mewhz.com/blog/image-20231114170118771.png)  

配置**代理监听主机**和**代理监听端口**，单击劫持启动

![image-20231114170118771](https://pic.mewhz.com/blog/image-20231114170322300.png)

下载 Yakit 证书，保存到本地后，删除后缀名**pem**

![image-20231114170401379](https://pic.mewhz.com/blog/image-20231114170401379.png)

双击安装证书

![image-20231114170322300](https://pic.mewhz.com/blog/image-20231114170533713.png)

存储位置选择**当前用户**

![image-20231114170555181](https://pic.mewhz.com/blog/image-20231114170539354.png)

证书存储选择**将所有的证书都放入下列存储 -> 受信任的根证书颁发机构**

![image-20231114170539354](https://pic.mewhz.com/blog/image-20231114170555181.png)

一路选择保存，弹出提醒时选择**是**

启动微信小程序，可以看到 Yakit 已经抓取到了请求包

![image-20231114171110471](https://pic.mewhz.com/blog/image-20231114171110471.png)
