build:
	@coffee -o lib/ src/	

test: build 
	@./node_modules/vows/bin/vows ./tests/test.cheerio.coffee --spec

.PHONY: test build