build:
	@coffee -o lib/ src/	

test: 
	@./node_modules/vows/bin/vows ./tests/test.cheerio.coffee --spec

PHONY: build test