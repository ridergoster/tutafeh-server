# COLORS
GREEN := $(shell tput -Txterm setaf 2)
WHITE := $(shell tput -Txterm setaf 7)
YELLOW := $(shell tput -Txterm setaf 3)
CYAN := $(shell tput -Txterm setaf 6)
RESET := $(shell tput -Txterm sgr0)

BABEL_CACHE_PATH=./node_modules/babel/cache.json
NODE_MODULES_BIN=./node_modules/.bin
HELP_FUN = \
	%help; \
	while(<>) { \
			if(/^([a-z0-9_-]+):.*\#\#(?:@(\w+))?\s(.*)$$/) { \
					push(@{$$help{$$2}}, [$$1, $$3]); \
			} \
	}; \
	print "usage: make [target]\n\n"; \
	for (sort keys %help) { \
		print "${WHITE}$$_:${RESET}\n"; \
		for (@{$$help{$$_}}) { \
			$$sep = " " x (32 - length $$_->[0]); \
			print "  ${CYAN}$$_->[0]${RESET}$$sep${RESET}$$_->[1]\n"; \
		}; \
		print "\n"; \
	}

.PHONY: help test

help: ##@default print help
	@perl -e '$(HELP_FUN)' $(MAKEFILE_LIST)

delete: ##@pm2 Delete this application
	@$(NODE_MODULES_BIN)/pm2 delete pm2.yml

restart: ##@pm2 Retart pm2 apps
	@$(NODE_MODULES_BIN)/pm2 restart pm2.yml

stop: ##@pm2 Stop this application
	@$(NODE_MODULES_BIN)/pm2 stop pm2.yml

start: ##@pm2 Start this application
	@$(NODE_MODULES_BIN)/pm2-dev start pm2.yml

start-debug: ##@pm2 Start this application
	@DEBUG=tutafeh:* DEBUG_HIDE_DATE=true DEBUG_COLORS=true $(NODE_MODULES_BIN)/pm2-dev start pm2.yml

test: ##@test Test application
	@make test-cs

test-cs: ##@test Test javascript code style
	@echo "${YELLOW}> Testing javascript code style...${RESET}"
	@$(NODE_MODULES_BIN)/eslint ./src/** --max-warnings 5 --cache
	@echo "${GREEN}✓ Great! Your code is soo stylish${RESET}"
