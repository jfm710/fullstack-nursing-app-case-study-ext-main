# Default shell to use for running commands
SHELL = /bin/bash

dc := docker compose

.PHONY: build run stop

build:
	$(dc) build

down:
	$(dc) down

logs:
	$(dc) logs -f

up:
	$(dc) up

run:
	$(dc) up -d

shell:
	$(dc) exec -it app-backend bash

stop:
	$(dc) down