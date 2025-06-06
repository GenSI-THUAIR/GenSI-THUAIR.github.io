# GenSI 主页

## 项目架构

整体结构接近基于Jekyll的web component风味项目
- 没有build system
- 外部依赖较少

项目特色
- 几乎纯HTML/CSS/JS原生
- 数据和样式分离
- 整体实现模块化
- 移动端适配(480px 宽度以下认为是移动端)
- 运行时多语言支持

文件结构

- docker: Python和Jekyll镜像构建文件
- Makefile

- libs: 库文件 主要是 css/js/font 外部库和内部库都在这里 (`main.css` 全局样式 `main-480.css` 对应的480px 宽度样式)
- assets: 主要是图片
- pub.bib: bibtex 文件
- locales: 多语言文件

- _blogs: 博客文件夹 markdown格式 支持LaTeX 具体参考`template.md`
- _data: 数据文件 [后面](#数据文件格式)会展开解释
- _layouts: Jekyll 默认布局文件
  - singleton.html: 单标题页面布局文件 
  - default.html: 多标题页面布局文件
  - blog.html: 博客页面专用布局文件
- _modules: 子页面
  - 每个文件表示一个页面
  - 按照字母序排列
  - 通过 `page.marker` 控制可见性
- _includes: HTML 组件
  - main: 首页组件
  - `about_...`: about 页面组件
  - `research_...`: research 页面组件
  - header.html: 默认HTML头部
  - footer.html: 默认HTML footer
  - navbar.html: 导航栏
- index.html: 首页
- _config.yml: Jekyll 基础配置文件

- _site: 默认输出目录


## 依赖说明

- Framework: [Jekyll](http://jekyllrb.com/)
- CSS
  - [Skeleton](getskeleton.com)
  - Icons: [Font Awesome](http://fontawesome.io/)
- JS
  - [jQuery (3.1.1)](https://jquery.com/)

## 数据文件格式

不太会更新的内容
- profile.yaml: 周老师的一些信息
- gensi.yaml: 一些网站全局信息

- blocks.yaml: 首页模块配置表
- media.yaml: footer 社交媒体信息
- projects.yaml: 首页项目表

不频繁更新内容
- people.yaml: 当前团队成员信息
- alumni.yaml: 校友列表
  - 必须有`name`

可能更新频繁内容
- follows.yaml: 最近post(外链社交平台)
- news.yaml: 新闻配置表
- publications.yaml: 通过脚本更新
- locales/.json: 多语言KV表 对于同一条内容 不同语言的key相同 value不同

## 更新说明

所有内容更新都只需要修改对应的数据文件 workflow 会处理其他内容

### 多语言方案介绍

使用运行时语言加载方案
1. 根据规则选择语言并获取对应语言的json (详见 `main.js#applyLangViaBrowser`)
2. 遍历元素 根据元素属性填充(`data-i18n`)对应的语言内容

元素如下 一般key为`<page>[:<sections>]:<description>`
```html
<div class="main-page-content" data-i18n="main:intro"></div>
```

```json
// locales/en.json
"main:intro": "This is a demo for i18n"

// locales/zh.json
"main:intro": "这是一个i18n的演示"
```

### 更新首页post展示

添加最新的post到文件最前面即可

目前可用平台为 知乎,小红书,X,微信公众号 ([zhihu, xhs, twitter, wechat])

下面为一个示例 都是必填字段 其中link为原文的链接

```yaml
- platform: xhs
  date: Mar 27, 2025
  content: 请进，GenSI上新了科研机会。 如果你对AI前沿技术、生成模型或AI在科学领域的应用充满兴趣，热爱挑战，欢迎关注和联系我们！
  link: http://xhslink.com/a/g4CWL9eSIYZab
  thumbnail: /assets/news-pics/hire.png
```

### 更新news

考虑到不同位置展示形式不一样 news分为了两个部分
- all news (entries 下)
- latest news (latest 下)

对于 all news
1. key表示多语言文件中对应的key 实际为news展示的文本
2. 此外 还需要在多语言文件中添加 `{key}-date` 

对于 latest news, content字段可以是HTML

```yaml
entries:
  - key: "main:news:dapo"
    link: https://dapo-sia.github.io/
    thumb: /assets/news-pics/dapo.png
latest:
  - date: Mar 2025
    content: "We propose <b>DAPO</b> algorithm, outperforming DeepSeek GRPO!"
    link: https://dapo-sia.github.io/
    thumb: /assets/news-pics/dapo.png
```

### 添加博客

> 示例见 [template](_blogs/template.md)

文件名一般为 `yyyy-mm-dd-<id>.md`

博客的 front matter 必须有下面字段.
~~- uid: 博客作为HTML元素的唯一id (不能带空格)~~
- title: 博客标题 (Markdown 中不需要在写额外的一级标题)

博客图片需要放在 `assets/blog-pics/<id>`

注意: 等式需要用 `$$` 包裹  如 `$$\alpha$$`

还可以添加PDF blog 只需要编辑新文件的front matter

示例如下
- `href` 表示PDF资源路径 这个必填
- `abbr` 表示展示的缩写文本

```yaml
---
title: Autonomous Generalist Scientist (Part1)
abbr: AGS
href: /assets/rg-pdfs/AutonomousGeneralistScientist-Part1.pdf
category: Agent
uid: 2025-AGS-P1
time: 2025/06/06
author: 龙思宇
---
```

### 修改成员信息

> 人员列表见[此](_data/people.yaml)

成员信息格式如下 (url 是主页 为可选项)
```yaml
- name: Yawen Ouyang
  thumbnail: /assets/lab-pics/yawen-ouyang.jpeg
  // or web image for thumbnail
  thumbnail_web: http://a.b.c/d.jpg
  thumb_comic: /assets/lab-pics/comic/yawen-ouyang.png
  url: https://yawenouyang.github.io/about/
```

- 所有照片需要放在 `assets/lab-pics`
- AI生成的CG风格照片放在 `assets/lab-pics/comic`

### 更新发表文献

添加bibtex 到[pub.bib](pub.bib) 然后需要执行`python builder.py`来更新对应的数据文件

示例如下
```bibtex
@inproceedings{zhang-etal-2019-generating-fluent,
    title = "Generating Fluent Adversarial Examples for Natural Languages",
    author = ...,
    booktitle = ...,
    month = jul,
    year = "2019",
    abstract  = ...,
    author+an =	 {1=student; 3=student; 2=highlight},
    eprint      = {https://www.aclweb.org/anthology/P19-1559},
    tags = {LLM},
    // or like above
    // tags = {LLM,NLP},
    thumbnail = {/assets/pub-pics/zhang2019gf.png}
}
```
必要字段:
- author
- author+an
- year
- title
- booktitle
- eprint
可选字段:
- month
- code
- video
特殊字段:
- tags: 用于分类展示的标签
- thumbnail: 论文展示缩略图

## 本地构建

本地构建完全依赖于 docker

需要构建的内容:
1. 用于更新文章的Python镜像 (pub.bib -> 数据文件)
2. 用于生成静态文件的Jekyll镜像


1. docker build 得到 `jekyll:gensi` 和 `python:gensi` 两个镜像

```bash
make build_all
```

2. homepage update 生成静态网页

```bash
make
```

3. livereload 动态加载网页 默认端口为 `4000`
```bash
make livereload
```


