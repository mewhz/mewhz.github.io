---
layout: post
title: Yakit 和 MuMu 模拟器实现 APP 抓包
date: 2025-05-12 00:43:24
updated: 2025-05-12 00:43:24
tags:
  - 网络安全
  - 环境配置
---

由于安卓 7 以上版本不再信任用户证书，需要安装系统证书，而有些实机又直接禁止了 Root 功能。于是使用 MuMu 模拟器和 Yakit 来对 APP 进行抓包

<!-- more -->

### 一、环境安装

`adb`​ 是 Google 提供的一个命令行工具，用于与 Android 设备进行通信和调试。

`adb`​ 下载地址：[https://developer.android.google.cn/tools/releases/platform-tools](https://developer.android.google.cn/tools/releases/platform-tools)

![image](https://pic.mewhz.com/blog/image-20250511233542-cn96j57.png)
`openssl`​ 是一个广泛使用的加密工具，提供 SSL/TLS 协议实现及加解密、证书管理、签名等功能。

`oepnssl`​ 下载地址：[https://slproweb.com/products/Win32OpenSSL.html](https://slproweb.com/products/Win32OpenSSL.html)

![image](https://pic.mewhz.com/blog/image-20250511234833-a5hc99b.png)
`MuMu 模拟器`​ 下载地址：[https://mumu.163.com](https://mumu.163.com)​

下载完成后设置 `adb`​ 和 `oepnssl`​ 的环境变量

### 二、环境配置

```bash
adb version
openssl version
```

![image](https://pic.mewhz.com/blog/image-20250511235032-bldohsn.png)

`MuMu 模拟器`​ 设置 **可写入系统盘、开启手机 Root 权限和 ADB 本地连接；** 设置完成后重启模拟器。

![image](https://pic.mewhz.com/blog/image-20250511235303-yc45fvj.png)
![image](https://pic.mewhz.com/blog/image-20250511235252-62ifd10.png)​
`Yakit`​ 设置监听主机为 `0.0.0.0`​ 和 监听端口 `8083`​；设置完成后点击 **劫持启动**。

![image](https://pic.mewhz.com/blog/image-20250511235521-a4oea9g.png)
### 三、证书配置

下载证书到本地，证书下载到本地是 `pem`​ 格式；切换到证书所在位置查看证书的哈希值

```bash
openssl x509 -inform PEM -subject_hash_old -in yakit证书.crt.pem
# 这条命令是用 openssl 工具来提取证书的老版本主题哈希（subject_hash_old），用于某些旧版本系统或工具识别证书文件名时的用途
```

把证书文件名修改为最上方的数字加 .0；如该证书修改为 `10fb1fcc.0`​

![image](https://pic.mewhz.com/blog/image-20250511235903-12q7oii.png)
### 四、导入系统证书

```bash
adb devices
# 列出当前已连接并被识别的设备列表
adb root
# 让设备上的进程以 root 权限运行；此时模拟器会有弹窗，点击允许即可
adb push C:\Users\mewhz\Desktop\10fb1fcc.0 /system/etc/security/cacerts
# 把本地的证书文件（使用完整路径）推送到系统的证书目录
adb shell "chmod 664 /system/etc/security/cacerts/af06d509.0"
# 修改证书文件的权限，使其可读
adb reboot
# 让已连接的 Android 设备立即重启，使修改的系统文件生效
```

![image](https://pic.mewhz.com/blog/image-20250512000512-rd13o79.png)
![image](https://pic.mewhz.com/blog/image-20250512001238-7pwvx2y.png)

在模拟器的设置 -> WIFI 设置修改代理设置；IP 为本机的 IP，端口是刚刚设置的监听端口

![image](https://pic.mewhz.com/blog/image-20250512001332-e9p90ex.png)

访问模拟器中的 APP，查看 `Yakit`​ 是否有请求包

![image](https://pic.mewhz.com/blog/image-20250512001532-ylhndrx.png)