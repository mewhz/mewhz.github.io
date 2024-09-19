---
title: mysql修改主键乱序指令
tags:
  - MySQL
readmore: true
date: 2022-01-28 18:25:20
updated: 2022-01-28 18:25:20
---

经常在测试时修改 MySQL 中数据，导致主键序号变乱，对于强迫症来说有些难受。

这个指令可以完美解决乱序问题。

<!-- more -->

```sql
SET @i=0;
UPDATE book SET `id`=(@i:=@i+1);
ALTER TABLE book AUTO_INCREMENT=0;
```
