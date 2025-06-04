---
layout: blog
title: template <!-- title -->
category: <!-- solo category -->
uid: <!--unique id of this blog for HTML element id (no space here) -->
time: <!-- YYYY/MM/DD -->
author: <!---->
hide: true
thumb: <!-- thumbnail -->
---
Demo page for GenSI homepage.

```
(?<!\$)\$(?!\$) -> "$$"
```

Equation is
$$
\alpha_t:=1-\beta_t;\;\bar\alpha_t:=\prod^t_{s=1}\alpha_s\\
q({\rm x}_t|{\rm x}_0)=\mathcal N({\rm x}_t;\sqrt{\bar\alpha_t}{\rm x}_{t-1},(1-\bar\alpha_t)\mathbf I)
$$

$\alpha$ <-- wrong here

$$\alpha$$ <-- right here

inline equation should use `\mid` instead of `|` for $$p(y\mid x)$$


```python
import numpy as np
import matplotlib.pyplot as plt
def f(x):
    return np.sin(x)
```

![alt-content]({{site.baseurl}}/assets/lab-pics/jingjing-gong.jpeg)