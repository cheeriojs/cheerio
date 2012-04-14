test:
	@./node_modules/mocha/bin/mocha --compilers coffee:coffee-script --reporter dot

mate:
	@mate lib/ test/

.PHONY: test build mate
