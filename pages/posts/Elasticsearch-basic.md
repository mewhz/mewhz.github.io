---
layout: post
title: Elasticsearch 的安装与简单使用
date: 2024-04-08 10:57:42
updated: 2024-04-08 10:57:42
tags:
  - Java
  - Elasticsearch
---

### 一、简介

ES 是一款分布式、RESTful 风格的搜索和数据分析引擎，它可以近乎实时的存储、检索数据。

<!-- more -->

### 二、安装 Elasticsearch

官网地址：https://www.elastic.co/cn/elasticsearch

下载链接：https://www.elastic.co/cn/downloads/elasticsearch

历史版本：https://www.elastic.co/cn/downloads/past-releases#elasticsearch

>由于 Elasticsearch 进行中文分词时需要安装 IK 分词器，建议先查看一下 IK 分词器的最新版本：
>
>https://github.com/infinilabs/analysis-ik/releases 确保两个版本一致。

下载完成后解压即可使用。

以 Windows 为例，双击 **bin/elasticsearch.bat** 启动。

>若启动时发现内存占用过大，修改 **config/jvm.options**；
>
>添加 **-Xms1g** 和 **-Xmx1g**，分别设置 JVM 占用的内存最小和最大为 1GB。

访问 http://127.0.0.1:9200/ 可看到 ES 默认的信息。

![image-20240401111230797](https://pic.mewhz.com/blog/image-20240401111230797.png)

>若访问 9200 失败，提示连接被重置；修改 **confing/elasticsearch.yml** 文件；
>
>修改：**network.host: 0.0.0.0**，表示谁都可以访问该 ES；
>
>修改：**xpack.security.enabled: false**，表示不启用安全认证
>
>修改：**xpack.security.http.ssl:  enabled: false**，表示不启用 SSL 加密连接

### 三、安装 Kibana

Kibana 是 Elasticsearch 的可视化平台，需要先启动 Elasticsearch。

官网地址：https://www.elastic.co/cn/kibana

下载地址：https://www.elastic.co/cn/downloads/kibana

历史版本：https://www.elastic.co/cn/downloads/past-releases#kibana

**要和 Elasticsearch 版本相同。**

下载完成后解压即可使用。

以 Windows 为例，双击 **bin/kibana.bat** 启动，启动较慢需要等待几分钟。

>中文：修改 **config/kibana.yml** 文件；
>
>修改：**i18n.locale: "zh-CN"**，表示设置国际化语言为中文简体。

访问 http://localhost:5601/ 可以看到以下内容。

![image-20240401103017879](https://pic.mewhz.com/blog/image-20240401103017879.png)

### 四、安装 IK 分词器

IK 分词器可以对中文进行一个分词的操作。把中文划分成一个个的关键字，在搜索的时候会将关键词进行分词，会把索引库中的数据进行分词，然后进行匹配操作。若不使用 IK 分词器，会默认把中文的每个字看作是一个词。

下载地址：https://github.com/infinilabs/analysis-ik 

**要和 Elasticsearch 版本相同。**

下载完成后解压放到 Elasticsearch 的 **plugins** 目录下，重启 Elasticsearch。

### 五、DSL 测试

DSL 是一种用于构建查询的语言，以便于在 Elasticsearch 中执行搜索操作。

DSL 使用 JSON 格式来描述查询，其中包含各种参数和条件。

#### 1. 简单测试

打开 http://localhost:5601/ 中的 **左侧栏 -> Management -> 开发工具**。

>_analyze：是 Elasticsearch 提供的一个 API，它可以分析每个 text 是如何分词的；
>
>analyzer：选择分词器模式；
>
>IK 分词器包含两种模式：
>
>	1. ik_smart：最小切分；
>	1. ik_max_word：最细切分；

最小切分模式

```json
GET _analyze
{
  "analyzer": "ik_smart",
  "text": "分词器测试"
}
```

![image-20240401145244259](https://pic.mewhz.com/blog/image-20240401145244259.png)

最细切分模式

```json
GET _analyze
{
  "analyzer": "ik_max_word",
  "text": "分词器测试"
}
```

![image-20240401145519743](https://pic.mewhz.com/blog/image-20240401145519743.png)

#### 2. 扩展词词典

在 IK 分词器的 **config** 目录下，创建 **my.dic** 加入要配置的词组；

![image-20240401151418895](https://pic.mewhz.com/blog/image-20240401151418895.png)

在 **config/IKAnalyzer.cfg.xml** 中加入扩展词词典的名称：

![image-20240401151718110](https://pic.mewhz.com/blog/image-20240401151718110.png)

重启 ES 发送请求进行测试。

```json
GET _analyze
{
  "analyzer": "ik_max_word",
  "text": "微信测试"
}
```

**默认词典效果**

![image-20240401154804914](https://pic.mewhz.com/blog/image-20240401154804914.png)

**扩展词典效果**

![image-20240401154600720](https://pic.mewhz.com/blog/image-20240401154600720.png)

#### 3. 停用词词典

修改刚刚的 **my.dic**：

![image-20240401164555020](https://pic.mewhz.com/blog/image-20240401164555020.png)

在 **config/IKAnalyzer.cfg.xml** 中加入停用词词典的名称

![image-20240401164611372](https://pic.mewhz.com/blog/image-20240401164611372.png)

重启 ES 发送请求进行测试。

```json
GET _analyze
{
  "analyzer": "ik_max_word",
  "text": "微信测试"
}
```

**停用词典效果**

![image-20240401164903283](https://pic.mewhz.com/blog/image-20240401164903283.png)

### 六、ES 的简单使用

**索引：**ES 中的索引相当于关系型数据库中的**表**。在 ES 中存储数据，首先需要创建索引，然后在索引中增加、搜索和更新数据。

**文档：**ES 中的文档相当于关系型数据库在表中存储的一条条**记录**。文档保存在索引中，一个 ES 文档就相当于关系型数据表中的一行数据记录。用户对数据操作的最小对象就是文档。

**字段：**ES 中的字段相当于关系型数据库中的**字段**。一个文档由一个或多个字段值组成，每个字段可以有不同的数据类型。

**映射：**ES 中的映射相当于关系型数据库中的**表结构**。和关系型数据库创建表一样，ES 创建索引时需要定义文档的数据结构，这种结构称为映射。在映射中文档的字段在定义后就不能更改。

#### 1. 创建索引

keyword 类型是不可切分的字符串类型，需要全匹配，用于字符串是否相等的比较；

text 类型是可进行分词分隔的字符串类型，支持部分匹配、模糊匹配；

要存储数据到 ES，首先需要创建索引；

```json
put /student // student 索引名称
{
  "mappings": {	// 创建索引的映射
    "properties": {	// 映射包含的字段结构
      "name": {	// 字段名称
        "type": "text"	// 字段的数据类型，字符串类型 text 文本类型
      },
      "id": {
        "type": "keyword"	// 字符串类型 keyword 关键字类型
      },
      "age": {
        "type": "integer"	// 数值类型 integer 整型
      }
    }
  }
}
```

![image-20240404230032522](https://pic.mewhz.com/blog/image-20240404230032522.png)

#### 2. 查看索引

**查看索引映射**

```json
get /student/_mappings
```

![image-20240404230257741](https://pic.mewhz.com/blog/image-20240404230257741.png)

**查看索引**

包含索引的别名、映射和设置等；

```json
get /student
```

![image-20240404230350257](https://pic.mewhz.com/blog/image-20240404230350257.png)

#### 3. 写入文档

创建好索引后，相当于关系型数据库创建好了表。ES 中的数据称为文档，一个文档就相当于关系型数据表中的一行数据。

* ```put /<index>/_doc/<_id>```
* `put /<index>/_create/<_id>`
* `post /<index>/_doc/`
* `post /<index>/_create/<_id>`

使用 put 或 post 请求方法，可以直接指定 ID，若 ID 已存在，则会直接覆盖文档；如果没有指定 ID，则会随机生成 ID，但必须使用 post 请求。

```json
put /student/_doc/001
{
    "name": "小明",
    "id": "2024001",
    "age": "24"
}
```

![image-20240404231153255](https://pic.mewhz.com/blog/image-20240404231153255.png)

```json
post /student/_doc/
{
    "name": "小红",
    "id": "2024002",
    "age": "23"
}
```

![image-20240404231230573](https://pic.mewhz.com/blog/image-20240404231230573.png)

#### 4. 获取文档

根据文档 ID 获取文档；

* `get <index>/_doc/<_id>`
* `get <index>/_source/<_id>`
* `head <index>/_doc/<_id>`
* `head <index>/_source/<_id>`

其中 **_source** 展示的就是文档的原始数据。

```json
get /student/_doc/001
// 返回
{
  "_index": "student", // 索引名
  "_id": "001", // 文档 ID 
  "_version": 1, // 版本号，_version 属于当前文档
  "_seq_no": 0, // 版本号，用来控制并发，_seq_no 属于整个索引
  "_primary_term": 1,	// 文档所在位置，表示文档所在主分片的编号
  "found": true,	// 表示查询成功
  "_source": {
    "name": "小明",
    "id": "2024001",
    "age": "24"
  }
}
```

![image-20240405211058080](https://pic.mewhz.com/blog/image-20240405211058080.png)

```json
get /student/_source/001
// 返回
{
  "name": "小明",
  "id": "2024001",
  "age": "24"
}
```

![image-20240405211139537](https://pic.mewhz.com/blog/image-20240405211139537.png)

#### 5. 搜索文档

* `post /<index>/_search`
* `get /<index>/_search`

```json
post /student/_search
{
  "query": {	// 查询内容
    "term": {	// term 搜索，不支持模糊查询
      "age": "24"	// 搜索的字段和匹配的值，根据一般字段搜索文档
    }
  }
}
```

![image-20240405212940932](https://pic.mewhz.com/blog/image-20240405212940932.png)

```json
post /student/_search
{
  "query": {
    "match": {	// match 搜索，支持模糊查询
      "name": "小" // 根据 text 字段搜索文档
    }
  }
}
```

![image-20240405213442123](https://pic.mewhz.com/blog/image-20240405213442123.png)

使用 **get** 请求搜索文档，不提供请求数据，将返回部分文档。

```json
get /student/_search
// 返回
{
  "took": 5,
  "timed_out": false,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 2,
      "relation": "eq"
    },
    "max_score": 1,
    "hits": [
      {
        "_index": "student",
        "_id": "001",
        "_score": 1,
        "_source": {
          "name": "小明",
          "id": "2024001",
          "age": "24"
        }
      },
      {
        "_index": "student",
        "_id": "h7WqqY4BnSUOl4Xy9dam",
        "_score": 1,
        "_source": {
          "name": "小红",
          "id": "2024002",
          "age": "23"
        }
      }
    ]
  }
}
```

![image-20240405212232141](https://pic.mewhz.com/blog/image-20240405212232141.png)

#### 6. 更新文档

* `post /<index>/_update/<_id>`

```json
post /student/_update/001
{
  "doc": {	// 更新后的数据，可以同时更新多个字段，其他的保持不变
    "name": "小亮",
    "age": "25"
  }
}
```

![image-20240405213838135](https://pic.mewhz.com/blog/image-20240405213838135.png)

更新后的文档版本（_version）会 + 1。

```json
get /student/_doc/001
// 返回
{
  "_index": "student",
  "_id": "001",
  "_version": 2,
  "_seq_no": 4,
  "_primary_term": 2,
  "found": true,
  "_source": {
    "name": "小亮",
    "id": "2024001",
    "age": "25"
  }
}
```

#### 7. 删除文档

* `delete /<index>/_doc/<_id>`

```json
delete /student/_doc/001
// 返回
{
  "_index": "student",
  "_id": "001",
  "_version": 3,
  "result": "deleted",
  "_shards": {
    "total": 2,
    "successful": 1,
    "failed": 0
  },
  "_seq_no": 5,
  "_primary_term": 2
}
```

再次获取删除的文档：

```json
get /student/_doc/001
{
  "_index": "student",
  "_id": "001",
  "found": false
}
```

---

**以上的 7 种简单使用，除了使用 Kibana 中的开发工具外，还可以直接使用不同的请求方法和路径直接请求 127.0.0.1:9200**

![image-20240405214614961](https://pic.mewhz.com/blog/image-20240405214614961.png)

### SpringBoot 集成 ES

**spring-boot-starter-data-elasticsearch：**基于 Elasticsearch 官方提供的客户端库构建，简化了与 Elasticsearch 的交互。

**elasticsearch-java：**Elasticsearch 官方提供的 API 库。

Idea 中安装插件 **Elasticsearch** 可以快捷查看 ES 中的所有索引以及索引中的文档等信息。

![image-20240405230235576](https://pic.mewhz.com/blog/image-20240405230235576.png)

连接本地的 ES 保持默认配置即可。

![image-20240405230326026](https://pic.mewhz.com/blog/image-20240405230326026.png)

在右侧可以看到已连接 ES 中的全部索引以及文档等信息。

创建 Spring Boot 项目，同时导入依赖：

![image-20240406213509486](https://pic.mewhz.com/blog/image-20240406213509486.png)

application.yml 文件配置 ES：

```yaml
spring:
  elasticsearch:
    uris: http://127.0.0.1:9200
```

与索引对应的实体类：

```java
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(indexName = "user")
// 标识实体类对应的索引名
public class User {

    @Id
    // 实体类中作为文档唯一标识的字段 _id
    private Long id;

    @Field(type = FieldType.Text)
    private String username;

    @Field(name = "pass", type = FieldType.Text)
    // name 指定字段在 Elasticsearch 索引中的名称为 pass
    // type 指定字段的类型为 文本类型 text
    private String password;

    @Field(type = FieldType.Long)
    private Long age;
}
```

对索引的创建与删除操作：

```java
@Autowired
private ElasticsearchTemplate template;
// 模板类，用于执行与 ES 相关的操作   
@Test
void indexOperation() {

    IndexOperations indexOperations = template.indexOps(User.class);
    // 用于执行索引级别的操作

    boolean isIndexExist = indexOperations.exists();
    // 检查索引是否存在

    System.out.println("isIndexExist = " + isIndexExist);

    boolean createSuccess = indexOperations.createWithMapping();
    // 创建索引并指定其映射，根据实体类中的注解来定义映射

    System.out.println("createSuccess = " + createSuccess);

    boolean delete = indexOperations.delete();
    // 删除索引

}
```

对文档的 CRUD 操作：

```java
@Autowired
private ElasticsearchTemplate template;
// 模板类，用于执行与 ES 相关的操作   
@Test
void documentOperation() {

    User user = new User(4L, "admins", "123456", 22L);

    template.save(user);
    // 插入或覆盖，若 _id 存在就进行覆盖

    List<User> users = new ArrayList<>();

    for (long i = 0; i < 3; i ++) {

        user = new User(i, "admins", "123456", 22L);

        users.add(user);
    }

    template.save(users);
    // 批量新增

    user.setAge(24L);

    template.update(user);
    // 更新文档

    template.delete(user);
    // 删除文档内容

    user = template.get("1", User.class);
    // 根据 _id 查询

    Criteria criteria = new Criteria();
    // 构建查询条件

    criteria.and(new Criteria("username").is("admins"));
    // 条件为 and username 字段中找到 = admins 的内容

    Query query = new CriteriaQuery(criteria);
    // 构建查询条件

    SearchHit<User> searchHit = template.searchOne(query, User.class);
    // searchOne 用于执行查询，并返回查询结果中的第一个文档
    // SearchHit 代表搜索结果中的一个文档

    System.out.println(searchHit.getContent());
    // getContent 获取这个文档的内容

    criteria.and(new Criteria("username").contains("admin"));
    // contains 表示包含指定字符串的文档

    query = new CriteriaQuery(criteria);

    SearchHits<User> searchHits = template.search(query, User.class);
    // SearchHits 表示搜索结果中的文档集合

    System.out.println(searchHits.getTotalHits());
    // 获取查询结果中匹配到的文档总数

    for (SearchHit<User> search : searchHits) {
        System.out.println(search.getContent());
    }
}
```

