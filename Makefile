REPORTER = dot
XYZ = node_modules/.bin/xyz --message 'Release X.Y.Z' --tag X.Y.Z --repo git@github.com:cheeriojs/cheerio.git --script scripts/prepublish
UPSTREAM = git@github.com:cheeriojs/cheerio.git

lint:
	@npm run test:lint

test:
	@npm run test

setup:
	@npm install

subl:
	@subl lib/ test/ package.json index.js

test-cov:
	@./node_modules/.bin/nyc node_modules/.bin/_mocha -- --recursive --reporter $(REPORTER)

# Due to occasional unavailability of the code coverage reporting service, the
# exit status of the command in this recipe may optionally be ignored.
report-cov: test-cov
	@./node_modules/.bin/nyc report --reporter=text-lcov | ./node_modules/.bin/coveralls || [ "$(OPTIONAL)" = "true" ]

travis-test: OPTIONAL = true
travis-test: lint report-cov
	@true

bench:
	@./benchmark/benchmark.js

.PHONY: release-major release-minor release-patch
release-major: LEVEL = major
release-minor: LEVEL = minor
release-patch: LEVEL = patch

release-major release-minor release-patch:
	@$(XYZ) --increment $(LEVEL)

docs/out:
	@./node_modules/.bin/jsdoc --configure jsdoc-config.json

publish-docs: docs/out
	@cd docs/out; \
		rm -rf .git && \
		git init && \
		git add --all . && \
		git commit -m 'Generate documentation' && \
		git remote add upstream $(UPSTREAM) && \
		git push --force upstream master:gh-pages

.PHONY: test build setup subl docs/out publish-docs
