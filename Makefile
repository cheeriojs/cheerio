build:
	@coffee -o lib/ src/	

test: build 
	@./node_modules/.bin/mocha

mate:
	@mate src/ test/

.PHONY: test build mate