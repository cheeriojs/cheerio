test:
	@./node_modules/.bin/mocha

mate:
	@mate lib/ test/

.PHONY: test build mate
