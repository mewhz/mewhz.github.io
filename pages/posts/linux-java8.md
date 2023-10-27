---
layout: post
title:  Linux 安装 Java 1.8 环境
date: 2023-07-23 01:28:16
updated: 2023-07-23 01:28:16
tags:
  - 环境配置
  - Linux
---

访问网址下载 Linux 版本的 Java 1.8：https://www.oracle.com/java/technologies/downloads/#java8

![image-20230722185014385](https://pic.mewhz.com/blog/image-20230722185014385.png)

下载成功后上传到 Linux 并解压到当前目录：

```bash
tar -zxvf jdk-8u381-linux-x64.tar.gz
# 解压
mv /root/jdk1.8.0_381 /opt/
# 移动文件夹到 /opt 目录
vim .bashrc
# 编辑环境变量
	export JAVA_HOME=/opt/jdk1.8.0_381
	export CLASSPATH=.:$JAVA_HOME/lib
	export PATH=$JAVA_HOME/bin:$PATH
source ~/.bashrc
# 重新加载环境变量
update-alternatives --install /usr/bin/java java /opt/jdk1.8.0_381/bin/java 1
update-alternatives --install /usr/bin/javac javac /opt/jdk1.8.0_381/bin/javac 1
# 注册该链接并设置优先级
# update-alternatives: 可以对各种命令工具的多个版本进行管理
update-alternatives --config java
# 切换 java 版本
update-alternatives --config javac
# 切换 javac 版本
```

安装成功~

![image-20230722190017802](https://pic.mewhz.com/blog/image-20230722190017802.png)