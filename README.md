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

> see _blogs/template.md as an example

The front matter is a MUST for a blog.
- uid: unique id of this blog for HTML element id (expect no space here)
- title: blog title (So there is no need to write a first-level heading in Markdown.)

Note: the equation should wrapped by `$$` like `$$\alpha$$`.



## External Libraries
- Framework: [Jekyll](http://jekyllrb.com/)
- CSS
  - [Skeleton](getskeleton.com)
  - Tabs: [Skeleton Tabs](https://github.com/nathancahill/skeleton-tabs)
  - Experience: [Timeline](https://codepen.io/NilsWe/pen/FemfK)
  - Icons: [Font Awesome](http://fontawesome.io/)
- JS
  - [Jquery (3.1.1)](https://jquery.com/)
