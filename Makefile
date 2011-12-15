build:
	@coffee -o lib/ src/	

test: build 
	@./node_modules/vows/bin/vows ./tests/test.cheerio.coffee --spec

mate:
	@mate src/

.PHONY: test build mate