.DEFAULT_GOAL := all
.PHONY: install all

install:
	docker-compose run --rm yarn install

compile:
	docker-compose run --rm yarn compile

lint:
	docker-compose run --rm yarn lint

build:
	docker-compose run --rm yarn build

test:
	docker-compose run --rm yarn test

all: install compile lint build test
