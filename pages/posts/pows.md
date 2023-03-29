---
title: 快速幂
tags:
  - C++
  - 算法
readmore: true
date: 2021-11-04 18:00:48
---



### 快速幂

```cpp
#include <iostream>
using namespace std;
typedef long long ll;
ll pow(ll a, ll b, ll p){
	ll ans = 1, base = a;
	while (b){
		if (b & 1)	ans = ans * base % p;
		base = base * base % p;
		b >>= 1;
	}
	return ans;
} 
int main(){
	ll a, b, p;
	cin >> a >> b >> p;
	cout << pow(a, b, p);
	return 0;
} 
```
