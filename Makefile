test:
	@./node_modules/.bin/mocha --compilers coffee:coffee-script --reporter dot

mate:
	@mate lib/ test/

.PHONY: test build mate
