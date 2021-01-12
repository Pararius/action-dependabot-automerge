.DEFAULT_GOAL := all
.PHONY: install all

install:
	docker-compose run --rm yarn install

lint:
	docker-compose run --rm yarn lint

build:
	docker-compose run --rm yarn build

test:
	docker-compose run --rm yarn test

all: install lint build test
