---
title: Python爬取斗破苍穹
tags:
  - python
  - 爬虫
readmore: true
date: 2021-07-12 12:46:48
updated: 2021-07-12 12:46:48
---



### 前言

---

由于最近迷上了斗破苍穹，想要重温一下，但似乎找不到无错别字的版本，于是只好自己动手..

<!-- more -->

### 代码

#### requests+lxml版

```python
import requests
import time
from lxml import etree

def fun(urls):

    headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }

    response = requests.get(urls, headers=headers)

    response.encoding = 'utf-8'

    html = response.text

    selector = etree.HTML(html)

    xpath = '//*[@id="wrapper"]/div[3]/div/div[2]/h1/text()'

    title = selector.xpath(xpath)

    print(title[0])

    with open('斗破苍穹.txt', 'a', encoding='utf-8') as file:
        file.write(title[0] + '\n')

    xpath = '//*[@id="content"]/text()'

    content = selector.xpath(xpath)

    with open('斗破苍穹.txt', 'a', encoding='utf-8') as file:
        for i in content:
            file.write(i)
        file.write('\n')


if __name__ == '__main__':


    url = "https://www.xbiquge.la/7/7877/"

    index = 3595785

    suf = '.html'

    for index in range(3595785, 3597409):

        urls = url + str(index) + suf
        try:
            fun(urls)
        except IndexError:
            print(urls)
        time.sleep(2)

```

---

#### requests+bs4版

```python
import requests
from bs4 import BeautifulSoup
import time

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}


def fun(my_url):
    response = requests.get(my_url, headers=headers)

    response.encoding = "UTF-8"

    html = response.text

    soup = BeautifulSoup(html, "html.parser")

    title = (soup.find('div', class_='bookname').contents[1]).text

    text = soup.find('div', id='content').text

    text = str(text).replace(' ', ' ')

    with open('斗破苍穹.txt', 'a', encoding='utf-8') as file:
        print(title)
        file.write(str(title))
        file.write('\n')
        file.write(str(text))


if __name__ == '__main__':

    url = "https://www.xbiquge.la/7/7877/"

    index = 3595785

    suf = ".html"

    for index in range(3595785, 3597409):

        urls = url + str(index) + suf
        print(urls)
        try:
            fun(urls)
        except IndexError:
            print(urls)
        time.sleep(2)

```
