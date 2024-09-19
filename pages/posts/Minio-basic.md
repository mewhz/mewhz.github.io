---
layout: post
title: Minio 的安装与简单使用
date: 2024-09-19 13:28:58
updated: 2024-09-19 13:28:58
tags:
  - Java
  - Minio
---

MinIO 是一款基于 Go 语言开发的高性能、分布式的对象存储系统。兼容亚马逊 S3 云存储服务接口，非常适合存储大容量非结构化的数据，例如图片、视频、日志文件、备份数据和容器/虚拟机镜像等，而一个文件对象可以是任意大小，从几 kb 到最大 5T 不等。

<!-- more -->

**基本结构**

* Bucket：存储桶；存储桶是最顶层的结构，所有的文件都必须放在桶中，桶的名称需要保持唯一，没有对象存储数量的限制。
* Object：对象；桶中存放的数据就是对象，由对象名和对象值组成，对象名称可以很长，并可以划分 path，对象包含一些元数据，如文件类型、创建时间、用户指定的元信息，对象设置标签，标签也是键值对结构，可以修改，标签的作用是可以结合权限控制对象的访问、生命周期的管理、数据分析等，单个文件最大 5GB，超过需要使用 Multipart upload API（最大支持 5TB）。

### 一、使用 Docker 部署 Minio

#### 1. 拉取镜像

```bash
docker pull minio/minio
```

#### 2. 创建文件夹

   ``` bash
   mkdir -p /home/minio/config
   mkdir -p /home/minio/data
   # -p 需要创建的目录中有不存在的目录，也会一并创建
   ```

#### 3. 创建 Minio 容器并运行

   ``` bash
   docker run -p 9000:9000 -p 9090:9090 \
        --name minio \
        -d --restart = always \
        -e "MINIO_ACCESS_KEY = minioadmin" \
        -e "MINIO_SECRET_KEY = minioadmin" \
        -v /home/minio/data:/data \
        -v /home/minio/config:/root/.minio \
        minio/minio \
        server \
        /data --console-address ": 9090" -address ": 9000"
   # docker run 启动新容器的命令
   # -p 9000:9000 -p 9090:9090 端口映射 -p 主机端口: 容器端口
   # -d 后台启动容器
   # -e 环境变量设置访问密码和密码密钥
   # -v 设置挂载卷 主机路径: 容器路径。允许数据在容器和宿主机之间共享
   # minio/minio 指定容器名称
   # server Minio 的子命令，用于启动服务器模式
   # /data 数据目录，Minio 在这里存储数据
   # --console-address ": 9090" 设置 Web 控制台的地址
   # -address ": 9000" 设置 Minio 服务的主要监听地址
   ```

#### 4. 登录 Minio 控制台

访问 ip: 9090，输入用户名/密码：minioadmin/minioadmin。

![image-20240916162705617](https://pic.mewhz.com/blog/image-20240916162705617.png)

#### 5. 创建 Bucket 测试

单击右侧的 **Buckets** 选择 **Create a Bucket** 创建存储桶。

![image-20240916162908317](https://pic.mewhz.com/blog/image-20240916162908317.png)

设置存储桶的访问策略为 **public**：

![image-20240916163716657](https://pic.mewhz.com/blog/image-20240916163716657.png)

名称自定义，这里叫作 **test** 。单击右侧的 **Object Browser**，选择刚刚创建的 test 存储桶；单击右侧的 **upload** 上传一张图片。

![image-20240916163357921](https://pic.mewhz.com/blog/image-20240916163357921.png)

由于刚刚设置了访问策略为 public，所以可以直接使用 **ip: 9000/存储桶名称/文件名称** 访问查看图片

![image-20240916163933733](https://pic.mewhz.com/blog/image-20240916163933733.png)

### 二、Spring Boot 集成 Minio

#### 1. 创建 Spring Boot 项目

#### 2. 引入 Minio 依赖

```xml
<dependency>
    <groupId>io.minio</groupId>
    <artifactId>minio</artifactId>
    <version>8.2.0</version>
</dependency>
```

#### 3. 编写配置文件

``` yaml
spring:
  servlet:
    multipart:
      # 限制单文件大小
      max-file-size: 20MB
      # 限制整个 HTTP 请求的大小
      max-request-size: 200MB

minio:
  # Minio 的服务地址
  endpoint: http://127.0.0.1:9000
  # 访问密钥
  accessKey: minioadmin
  # 密码密钥
  secretKey: minioadmin
  # 存储桶名称
  bucketName: test
```

#### 4. Minio 配置类

```java
package com.mewhz.minio.config;

import io.minio.MinioClient;
import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

@Data
@Component
public class MinioClientConfig {

    @Value("${minio.endpoint}")
    private String endpoint;
    @Value("${minio.accessKey}")
    private String accessKey;
    @Value("${minio.secretKey}")
    private String secretKey;

    @Bean
    public MinioClient minioClient() {

        return MinioClient.builder()
                .endpoint(endpoint)
                .credentials(accessKey, secretKey)
                .build();
    }
}
```

#### 5. Service 和 Controller

基础 Service 类

```java
package com.mewhz.minio.service;

import io.minio.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MinioService {
    private final MinioClient minioClient;

    @Value("${minio.bucketName}")
    private String bucketName;
}
```

基础 Controller 类

```java
package com.mewhz.minio.controller;

import com.mewhz.minio.service.MinioService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class MinioController {
    private final MinioService minioService;
}
```

#### 6. 文件上传

Service 类

``` java
/**
 * 文件上传
 *
 * @param multipartFile 文件
 * @return boolean 成功返回 true 否则返回 false
 */
public boolean uploadFile(MultipartFile multipartFile) {

    // 获取上传文件的原始文件名
    String fileName = multipartFile.getOriginalFilename();

    try {

        // 获取上传文件的输入流
        InputStream inputStream = multipartFile.getInputStream();

        // PutObjectArgs 构建向存储桶中上传文件的请求
        PutObjectArgs putObjectArgs = PutObjectArgs
                .builder()
                // 存储桶名称
                .bucket(bucketName)
                // 上传文件的名称
                .object(fileName)
                // 上传对象的数据流、流的长度、指定的最大字节数，-1 表示使用默认最大字节数
                .stream(inputStream, inputStream.available(), -1)
                .build();

        // 上传文件
        minioClient.putObject(putObjectArgs);
        return true;
    } catch (Exception e) {
        e.printStackTrace();
        return false;
    }
}
```

Controller 类

``` java
@PostMapping("/uploadFile")
public boolean uploadFile(@RequestParam MultipartFile multipartFile) {
	return minioService.uploadFile(multipartFile);
}
```

Apifox 测试

![image-20240916224922381](https://pic.mewhz.com/blog/image-20240916224922381.png)

#### 7. 判断存储桶是否存在

Service 类

``` java
/**
 * 判断存储桶是否存在
 *
 * @param bucketName 存储桶名称
 * @return boolean 存在返回 true 否则返回 false
 */
@SneakyThrows
public boolean isExistBucket(String bucketName) {

    // BucketExistsArgs 是一个用于检查存储桶是否存在的参数类
    return minioClient.bucketExists(BucketExistsArgs
            .builder()
            .bucket(bucketName)
            .build());
}
```

Controller 类

``` java
@GetMapping("/isExistBucket")
public boolean isExistBucket(@RequestParam String bucketName) {
    return minioService.isExistBucket(bucketName);
}
```

Apifox 测试

![image-20240916225741432](https://pic.mewhz.com/blog/image-20240916225741432.png)

![image-20240916225812003](https://pic.mewhz.com/blog/image-20240916225812003.png)



#### 8. 创建存储桶

Service 类

``` java
/**
 * 创建存储桶
 * @param bucketName 存储桶名称
 * @return boolean 成功返回 true 否则返回 false
 */
public boolean createBucket(String bucketName) {

    try {

        // MakeBucketArgs 是一个用于创建存储桶的参数类
        minioClient.makeBucket(MakeBucketArgs
                .builder()
                .bucket(bucketName)
                .build());

        return true;

    } catch (Exception e) {
        e.printStackTrace();
        return false;
    }
}
```

Controller 类

``` java
@PostMapping("/createBucket")
public boolean createBucket(@RequestParam String bucketName) {
    return minioService.createBucket(bucketName);
}
```

Apifox 测试

![image-20240916230159779](https://pic.mewhz.com/blog/image-20240916230159779.png)

#### 9. 删除存储桶

Service 类

``` java
/**
 * 删除存储桶
 * @param bucketName 存储桶名称
 * @return boolean 成功返回 true 否则返回 false
 */
public boolean removerBucket(String bucketName) {

    try {

        // RemoveBucketArgs 是一个用于删除存储桶的参数类
        minioClient.removeBucket(RemoveBucketArgs
                .builder()
                .bucket(bucketName)
                .build());

        return true;
        
    } catch (Exception e) {
        e.printStackTrace();
        return false;
    }
}
```

Controller 类

``` java
@PostMapping("/removeBucket")
public boolean removeBucket(@RequestParam String bucketName) {
    return minioService.removerBucket(bucketName);
}
```

Apifox 测试

![image-20240916230427187](https://pic.mewhz.com/blog/image-20240916230427187.png)

#### 10. 获取所有存储桶名称

Service 类

``` java
/**
 * 获取所有存储桶名称
 * @return List <String> 存储桶名称集合
 */
@SneakyThrows
public List <String> getAllBucketName() {

    // listBuckets 获取 Minio 服务器上的所有存储桶名称
    return minioClient.listBuckets()
            // 从一个集合中创建一个 Stream 对象
            .stream()
            // 把每个 Bucket 对象映射成 name 字符串
            .map(Bucket:: name)
            // 把 name 字符串收集到一个列表中
            .collect(Collectors.toList());
}
```

Controller 类

``` java
@GetMapping("/getAllBucketName")
public Object getAllBucketName() {
    return minioService.getAllBucketName();
}
```

Apifox 测试

![image-20240916233949794](https://pic.mewhz.com/blog/image-20240916233949794.png)

#### 11. 判断文件是否存在

Service 类

``` java
/**
 * 判断文件是否存在
 * @param bucketName 存储桶名称
 * @param objectName 文件名称
 * @return boolean 存在返回 true 否则返回 false
 */
@SneakyThrows
public boolean isExistObject(String bucketName, String objectName){

    try {

        // StatObjectArgs 是一个用于获取对象元数据的参数类
        minioClient.statObject(StatObjectArgs
                .builder()
                .bucket(bucketName)
                .object(objectName)
                .build());

        return true;

    } catch (Exception e){
        e.printStackTrace();
        return false;
    }
}
```

Controller 类

``` java
@GetMapping("/isExistObject")
public boolean isExistObject(@RequestParam String bucketName, @RequestParam String objectName) {
    return minioService.isExistObject(bucketName, objectName);
}
```

Apifox 测试

![image-20240916234239139](https://pic.mewhz.com/blog/image-20240916234239139.png)

![image-20240916234249946](https://pic.mewhz.com/blog/image-20240916234249946.png)

#### 12. 删除存储桶中的文件

Service 类

```java
/**
 * 删除存储桶中的文件
 * @param bucketName 存储桶名称
 * @param objectName 文件名称
 * @return boolean 成功返回 true 否则返回 false
 */
public boolean removeObject(String bucketName, String objectName) {

    try {

        // RemoveObjectArgs 是一个用于删除对象的参数类
        minioClient.removeObject(RemoveObjectArgs
                .builder()
                .bucket(bucketName)
                .object(objectName)
                .build());

        return true;

    } catch (Exception e) {
        e.printStackTrace();
        return false;
    }
}
```

Controller 类

```java
@PostMapping("/removeObject")
public boolean removeObject(@RequestParam String bucketName, @RequestParam String objectName) {
    return minioService.removeObject(bucketName, objectName);
}
```

Apifox 测试

![image-20240917220903056](https://pic.mewhz.com/blog/image-20240917220903056.png)

#### 13. 获取存储桶中的所有文件名称

Service 类

```java
/**
 * 获取存储桶中的所有文件名称
 * @param bucketName 存储桶名称
 * @return 存储桶中文件名称集合
 */
public List<String> selectAllObjectList(String bucketName) {

    // ListObjectsArgs 是一个用于列出存储桶中的对象的参数类
    ListObjectsArgs listObjectsArgs = ListObjectsArgs
            .builder()
            .bucket(bucketName)
            .build();

    Iterable<Result<Item>> iterable = minioClient.listObjects(listObjectsArgs);

    List<String> result = new ArrayList<>();

    iterable.forEach(item -> {
        try {
            result.add(item.get().objectName());
        } catch (Exception e) {
            e.printStackTrace();
        }
    });
    return result;
}
```

Controller 类

```java
@GetMapping("/selectAllObjectList")
public List<String> selectAllObjectList(@RequestParam String bucketName) {
    return minioService.selectAllObjectList(bucketName);
}
```

Apifox 测试

![image-20240917222958292](https://pic.mewhz.com/blog/image-20240917222958292.png)

#### 14. 文件下载

Service 类

```java
/**
 * 下载文件
 * @param bucketName 存储桶名称
 * @param objectName 文件名称
 * @return 返回下载链接
 */
@SneakyThrows
public String downloadObject(String bucketName, String objectName) {

    // GetPresignedObjectUrlArgs 是一个用于获取预签名对象的 URL 的参数类
    // 允许用户在没有直接访问 MinIO 服务器的凭据的情况下访问存储桶中的对象
    GetPresignedObjectUrlArgs getPresignedObjectUrlArgs = GetPresignedObjectUrlArgs
            .builder()
            .bucket(bucketName)
            .object(objectName)
            // 设置请求方法
            .method(Method.GET)
            .build();

    // 这个方法会根据提供的参数生成一个临时有效的 URL，该 URL 可以用来访问存储桶中的对象，而不需要提供访问密钥和秘密密钥
    return minioClient.getPresignedObjectUrl(getPresignedObjectUrlArgs);
}
```

Controller 类

```java
@GetMapping("/downloadObject")
public String downloadObject(@RequestParam String bucketName, @RequestParam String objectName) {
    return minioService.downloadObject(bucketName, objectName);
}
```

Apifox 测试

![image-20240917225636809](https://pic.mewhz.com/blog/image-20240917225636809.png)