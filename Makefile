REPORTER = dot

test:
	@./node_modules/mocha/bin/mocha --reporter $(REPORTER)

subl:
	@subl lib/ test/ package.json index.js

test-cov: lib-cov
	@CHEERIO_COV=1 $(MAKE) test REPORTER=html-cov > coverage.html

lib-cov:
	@jscoverage lib lib-cov

.PHONY: test build subl
