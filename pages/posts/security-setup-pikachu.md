---
title: 网络安全学习-pikachu靶场搭建
date: 2023-10-31 22:27:37
updated: 2023-10-31 22:27:37
tags:
  - 网络安全
  - 环境配置
---

pikachu 是一个带有漏洞的 web 应用系统，在这里包含了常见的 web 安全漏洞。 如果你是一个 web 渗透测试学习人员且正发愁没有合适的靶场进行练习，那么 pikachu 可能正合你意。

<!-- more -->

#### phpstudy 配置

phpstudy 是一款可以快速搭建服务器环境的软件。内部集成 Apache、PHP、MySQL、Nginx 等服务器环境搭建常用软件。

[phpstudy 下载地址](https://www.xp.cn/)

根据操作系统的不同选择下载不同版本的 phpstudy，本文采用 Windows 系统演示

![image-20231031223657974](https://pic.mewhz.com/blog/image-20231031223657974.png)

单击立即下载后，根据操作系统位数，选择不同的位数下载

下载完成后跟其他软件一样正常安装即可，注意安装目录不要包含中文

安装完成后运行软件，单击右边窗口左上角的一键启动 -> WNMP；查看下方的运行状态，确定 MySQL 和 Nginx 环境启动成功

![image-20231031230847420](https://pic.mewhz.com/blog/image-20231031230847420.png)

**PS：若电脑上装有 MySQL 环境并正在运行，可能会因为冲突导致 phpstudy 中的 MySQL 启动失败**

浏览器中访问：127.0.0.1 出现该界面，代表 phpstudy 启动成功

![image-20231031225225069](https://pic.mewhz.com/blog/image-20231031225225069.png)


#### pikachu 配置

[pikachu 下载地址](https://github.com/zhuifengshaonianhanlu/pikachu)

![image-20231031225358344](https://pic.mewhz.com/blog/image-20231031225358344.png)

下载成功后，把文件夹解压并移动到 phpstudy 目录下的 WWW 文件夹中，并改名为 pikachu

![image-20231031225522078](https://pic.mewhz.com/blog/image-20231031225522078.png)

找到 phpstudy 中数据库选项，查看 phpstudy 中 MySQL 的密码

![image-20231031230044411](https://pic.mewhz.com/blog/image-20231031230044411.png)

来到 pikachu 目录下的 inc 文件夹中，编辑 config.inc.php 文件，输入数据库的密码：root

![image-20231031230227697](https://pic.mewhz.com/blog/image-20231031230227697.png)

浏览器访问：127.0.0.1/pikachu

按照提示进行初始化安装

![image-20231031230316704](https://pic.mewhz.com/blog/image-20231031230316704.png)

![image-20231031230347404](https://pic.mewhz.com/blog/image-20231031230347404.png)

![image-20231031230407196](https://pic.mewhz.com/blog/image-20231031230407196.png)

提示数据库连接成功，则 pikachu 靶场搭建成功
