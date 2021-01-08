.DEFAULT_GOAL := all
.PHONY: install all

install:
	docker-compose run --rm yarn install

lint:
	docker-compose run --rm yarn lint

compile:
	docker-compose run --rm yarn compile

build:
	docker-compose run --rm yarn build

test:
	docker-compose run --rm yarn test

all: install lint compile build test
