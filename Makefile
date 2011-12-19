build:
	@coffee -o lib/ src/	

test: 
	@./node_modules/.bin/mocha

mate:
	@mate src/ test/

.PHONY: test build mate