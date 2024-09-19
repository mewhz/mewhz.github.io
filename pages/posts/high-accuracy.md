---
title: 高精度四则运算
abbrlink: '48362e32'
date: 2021-07-03 00:37:11
updated: 2021-07-03 00:37:11
tags:
       - C++
       - 算法
readmore: true
---

### 高精度加高精度(向量法)

```cpp
#include <bits/stdc++.h>
using namespace std;
vector<int> add(vector<int> &A,vector<int> &B){
	vector<int> C;
	int t = 0;
	for (int i = 0; i < A.size() || i < B.size(); i++){
		if (i < A.size())	t += A[i];
		if (i < B.size())	t += B[i];
		C.push_back(t % 10);
		t /= 10;
	}
	if (t)	C.push_back(t);
	return C;
}
int main(){
	string a,b;
	cin >> a >> b;
	vector<int> A,B;
	for (int i = a.size() - 1; i >= 0; i--)	A.push_back(a[i] - '0');
	for (int i = b.size() - 1; i >= 0; i--) B.push_back(b[i] - '0');
	vector<int> C = add(A,B);
	for (int i = C.size() - 1; i >= 0; i--)	printf("%d",C[i]);
	return 0;
} 
```

### 高精度加高精度(数组法)

```cpp
#include<bits/stdc++.h>
using namespace std;
const int N = 1e5;
int a[N+5];
int b[N+5];
int main(){
	string s1,s2;
	cin>>s1>>s2;
	a[0] = s1.length();
	b[0] = s2.length();
	int len = 0;
	for(int i=1;i<=a[0];i++)	a[i] = s1[a[0]-i] - '0';
	for(int i=1;i<=b[0];i++)	b[i] = s2[b[0]-i] - '0';
	len = a[0]>b[0]?a[0]:b[0];
	for(int i=1;i<=len;i++){
		a[i]+=b[i];
		a[i+1]+=a[i]/10;
		a[i]%=10;
	}
	len++;
	while((a[len]==0)&&len>1)	len--;
	for(int i=len;i>0;i--)	cout<<a[i];
	return 0;
}
```

### 高精度减高精度(向量法)

```cpp
#include <bits/stdc++.h> 
using namespace std;
bool cmp(vector<int> &A,vector<int> &B){
	if (A.size() != B.size())	return A.size() > B.size();
	for (int i = A.size() - 1; i >= 0; i--){
		if (A[i] != B[i])	return A[i] > B[i];
	}
	return true;
}
vector<int> sub(vector<int> &A,vector<int> &B){
	vector<int> C;
	int t = 0;
	for (int i = 0; i < A.size(); i++){
		t = A[i] - t;
		if (i < B.size())	t -= B[i];
		C.push_back((t + 10) % 10);
		if (t < 0)	t = 1;
		else	t = 0; 
	}
	while (C.size() > 1 && C.back() == 0)	C.pop_back();
	return C;
}
int main(){
	string a,b;
	vector<int> A,B;
	cin >> a >> b;
	for (int i = a.size() - 1; i >= 0; i--)	A.push_back(a[i] - '0');
	for (int i = b.size() - 1; i >= 0; i--)	B.push_back(b[i] - '0');
	if (cmp(A,B)){
		vector<int> C = sub(A,B);
		for (int i = C.size() - 1; i >=0; i--)	printf("%d",C[i]);
	}else{
		vector<int> C = sub(B,A);
		printf("-");
		for (int i = C.size() - 1; i >= 0; i--)	printf("%d",C[i]);
	}
	return 0;
}
```

### 高精度乘低精度(向量法)

```cpp
#include <bits/stdc++.h>
using namespace std;
vector<int> mul(vector<int> &A,int b){
	vector<int> C;
	int t = 0;
	for (int i = 0; i < A.size() || t; i++){
		if (i < A.size())	t += A[i] * b;
		C.push_back(t % 10);
		t /= 10;
	}
	while (C.size() > 1 && C.back() == 0)	C.pop_back();
	return C;
}
int main(){
	string a;
	int b;
	vector<int> A;
	cin >> a >> b;
	for (int i = a.size() - 1; i >= 0; i--)	A.push_back(a[i] - '0');
	vector<int> C = mul(A,b);
	for (int i = C.size() - 1; i >= 0; i--)	printf("%d",C[i]);
	return 0;
}
```

### 高精度乘高精度(数组法)

```cpp
#include<bits/stdc++.h>
using namespace std;
const int N = 1e5;
string a,b;
int ai[N+5],bi[N+5];
int c[2*N+5];
int main(){
    cin>>a>>b;
    int len = 0;
    ai[0] = a.length();
    bi[0] = b.length();
    for(int i=1;i<=ai[0];i++)   ai[i] = a[ai[0]-i]-'0';
    for(int i=1;i<=bi[0];i++)   bi[i] = b[bi[0]-i]-'0';
    for(int i=1;i<=ai[0];i++){
        for(int j=1;j<=bi[0];j++){
            c[i+j-1] += ai[i]*bi[j];
            c[i+j]+=c[i+j-1]/10;
            c[i+j-1]%=10;
        }
    }
    len = ai[0] + bi[0] + 1;
    while((c[len]==0)&&len>1)  len--;
    for(int i=len;i>0;i--)  cout<<c[i];
    return 0;
}
```

### 高精度除低精度(向量法)

```cpp
#include <bits/stdc++.h>
using namespace std;
vector<int> div(vector<int> &A,int b,int &r){
	vector<int> C;
	for (int i = 0; i < A.size(); i++){
		r = r * 10 + A[i];
		C.push_back(r / b);
		r %= b;
	}
	reverse(C.begin(),C.end());
	while (C.size() > 1 && C.back() == 0)	C.pop_back();
	reverse(C.begin(),C.end());
	return C;
}
int main(){
	string a;
	int b;
	vector<int> A;
	cin >> a >> b;
	for (int i = 0; i < a.size(); i++)	A.push_back(a[i] - '0');
	int r = 0;
	vector<int> C = div(A,b,r);
	for (int i = 0; i < C.size(); i++)	printf("%d",C[i]);
	printf("\n%d",r);
	return 0;
}
```
