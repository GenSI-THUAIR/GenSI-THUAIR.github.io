update_all: update_bib update

update:
	docker run --rm -v ${PWD}:/srv/jekyll jekyll:gensi jekyll b


update_bib:
	if git status --porcelain | grep -q -E 'pub.bib|builder.py'; then \
		docker run --rm -v ${PWD}:/srv python:gensi python builder.py; \
	fi

livereload:
	docker run -it --rm -v $PWD:/srv/jekyll -u root -p 4000:4000 -p 35729:35729  jekyll:gensi jekyll s -IlH 0.0.0.0

build_all: build_python build_jekyll


build_jekyll:
	if ! docker image ls|grep -E "jekyll\s+gensi" >/dev/null; then \
		docker build \
			--build-arg _USER=$USER \
			-f docker/jekyll.docker -t jekyll:gensi docker; \
	fi

build_python:
	if ! docker image ls|grep -E "python\s+gensi" >/dev/null; then \
		docker build \
			--build-arg _USER=$USER \
			-f docker/python.docker -t python:gensi docker; \
	fi

sync: sync_fe sync_be

sync_fe:
	rsync -e ssh -r --delete _site/ air:~/homepage/frontend
sync_be:
	rsync -e ssh -r --delete backend/*.py air:~/homepage/backend
