---
title:  局域网共享系统代理
tags:
  - 环境配置
  - Linux
readmore: true
date: 2023-06-25 13:05:13
updated: 2023-06-25 13:05:13
---

### 前言

有时会遇到需要配置代理，但是有时候局域网中有很多设备，给每个设备都配置一遍会非常的麻烦，所以采用共享的办法，让局域网中其他设备直接连接即可使用。

**注：本文仅介绍配置方法，仅用于技术教学，不涉及任何代理的贩卖等操作。**

<!-- more -->

### 本地系统代理配置

#### 浏览器等应用配置代理

设置本地代理软件为全局代理，访问 cip.cc 发现 IP 地址已经发生变化。

#### 命令行配置代理

打开命令行软件

```bash
curl cip.cc
```

发现命令行的的 IP 地址依然没有发生变化，先打开本地代理软件，确定代理运行的端口，我这里是 7890

分别输入以下两个命令，配置命令行的代理，**这种方法只是临时配置，重新打开命令行还需要再次配置**

```
set HTTP_PROXY=http://127.0.0.1:7890
set HTTPS_PROXY=http://127.0.0.1:7890
```

这时再通过命令行访问 cip.cc  发现 IP 地址已经发生变化。

### Linux 共享本地系统代理

设置本地代理软件为全局代理，并查看本机的 IP，确保 Linux 和 本机在同一个局域网下。

打开代理软件的局域网共享选项

#### 永久配置代理

此时切回 Linux 命令行

```bash
vim /etc/profile
```

在文末添加以下两个环境变量

```bash
export http_proxy=http://192.168.242.134:7890
export https_proxy=http://192.168.242.134:7890
# 192.168.242.134 是开启代理软件的 IP 地址
# 7890 是代理软件的开放端口
```

使配置文件生效

```bash
source /etc/profile
```

使用 Linux 访问 cip.cc，如果显示连接失败，检查 Linux 和 本机是否能 Ping 通

打开本机的控制面板 -> windows Defender 防火墙

![image-20230625130548866](https://pic.mewhz.com/blog/image-20230625130548866.png)

高级设置

![image-20230625130604171](https://pic.mewhz.com/blog/image-20230625130604171.png)

入站规则中找到 "文件和打印机共享(回显请求 - ICMPv4-In)" 启用该规则

![image-20230625130645932](https://pic.mewhz.com/blog/image-20230625130645932.png)

再次回到 Linux 命令行，等待大概 1 分钟，再次访问 cip.cc 发现 IP 地址已经发生变化。

#### 临时配置代理

有时不想让 Linux 每次都自动配置代理，则需要时临时修改 Linux 环境变量即可。

命令行直接输入以下命令：

```bash
export http_proxy=http://192.168.242.134:7890
export https_proxy=http://192.168.242.134:7890
# 192.168.242.134 是开启代理软件的 IP 地址
# 7890 是代理软件的开放端口
```