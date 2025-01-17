# GenSI's homepage



## Build tutorials

We use Jekyll to build this website while using Python for bibtex parsing.

> We may move to [al-folio](https://github.com/alshedivat/al-folio) theme for more functions.


- docker build

```bash
make build_all
```

- homepage update

```bash
make
```

## Homepage structure

- docker: dependency and builder files
- libs: custom and external libraries
- Makefile
- assets: exactly image folder now

- _blogs: folder for blogs files with LaTeX support
- _data: data file for control flow and settings
  - blogs.yaml: the file to regist the category of blogs (Let the categories be in the desired order.)
  - ***laboratory.yaml***: people list
- _layouts: Jekyll layout files
  - default.html: main layout for all pages
- _includes: HTML component (for header, footer, navbar, etc.)
- _modules:
  - separated page for different modules
  - ordered by alphabeta
  - visibility by `page.marker`
- _config.yml: basic config file for Jekyll

- _site: generated files

TODO:
- [ ] _module/5_projects.html: module for projects exhibition

## Create a blog

> see [template](_blogs/template.md) as an example

The front matter is a MUST for a blog.
- uid: unique id of this blog for HTML element id (expect no space here)
- title: blog title (So there is no need to write a first-level heading in Markdown.)

Note: the equation should wrapped by `$$` like `$$\alpha$$`.

## Modify personal info

> see [people list](_data/laboratory.yaml) here

For everyone, *name* and *description* are required. *Thumbnail* and *url* are optional.
```yaml
- name: Yawen Ouyang
  description: PhD at NJU
  thumbnail: /assets/lab-pics/yawen-ouyang.jpeg
  url: https://yawenouyang.github.io/about/
```

Personal hero should be added into `assets/lab-pics`.

## Publications update

Just paste new bib into [pub.bib](pub.bib).

```bibtex
@inproceedings{zhang-etal-2019-generating-fluent,
    title = "Generating Fluent Adversarial Examples for Natural Languages",
    author = ...,
    booktitle = ...,
    month = jul,
    year = "2019",
    abstract  = ...,
    eprint      = {https://www.aclweb.org/anthology/P19-1559},
    tags = {LLM}
    // or like above
    // tags = {LLM,NLP}
}
```
Format as follows:
- author: A and B and C
- optional:
  - abstract
  - *tags*: tags are used for grouping
  - eprint: url for paper
  - code
  - video
  - slides
  - poster
  - data

## External Libraries
- Framework: [Jekyll](http://jekyllrb.com/)
- CSS
  - [Skeleton](getskeleton.com)
  - Tabs: [Skeleton Tabs](https://github.com/nathancahill/skeleton-tabs)
  - Icons: [Font Awesome](http://fontawesome.io/)
- JS
  - [jQuery (3.1.1)](https://jquery.com/)
