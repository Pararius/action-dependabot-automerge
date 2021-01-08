.DEFAULT_GOAL := all
.PHONY: install all

install:
	docker-compose run --rm yarn install

all: install
	docker-compose run --rm yarn all
