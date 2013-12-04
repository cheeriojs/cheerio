REPORTER = dot

test:
	@./node_modules/.bin/jshint lib/ test/
	@./node_modules/.bin/mocha --reporter $(REPORTER)

setup:
	@npm install

subl:
	@subl lib/ test/ package.json index.js

test-cov: lib-cov
	@CHEERIO_COV=1 $(MAKE) test REPORTER=html-cov > coverage.html

lib-cov:
	@jscoverage lib lib-cov

bench:
	@./benchmark/benchmark.js

.PHONY: test build setup subl
