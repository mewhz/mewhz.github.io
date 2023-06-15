---
title: '信息安全学习-Java 反序列化漏洞'
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

### HashMap 反序列化代码审计

首先确保类实现了 Serializable 这个接口，HashMap 实现了这个接口。

![image-20230616040827521](https://pic.mewhz.com/blog/image-20230616040827521.png)

(剩下的明天再补，先睡觉~)
