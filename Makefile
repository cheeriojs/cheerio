REPORTER = dot
XYZ = node_modules/.bin/xyz --message 'Release X.Y.Z' --tag X.Y.Z --repo git@github.com:cheeriojs/cheerio.git --script scripts/prepublish
UPSTREAM = git@github.com:cheeriojs/cheerio.git

lint:
	@npm run test:lint

types:
	@npm run test:types

test:
	@npm run test

setup:
	@npm install

subl:
	@subl lib/ test/ package.json index.js

test-cov:
	@./node_modules/.bin/jest --coverage

# Due to occasional unavailability of the code coverage reporting service, the
# exit status of the command in this recipe may optionally be ignored.
report-cov: test-cov
	cat coverage/lcov.info | ./node_modules/.bin/coveralls || [ "$(OPTIONAL)" = "true" ]

travis-test: OPTIONAL = true
travis-test: lint types report-cov
	@true

bench:
	@./benchmark/benchmark.js

.PHONY: release-major release-minor release-patch
release-major: LEVEL = major
release-minor: LEVEL = minor
release-patch: LEVEL = patch

release-major release-minor release-patch:
	@$(XYZ) --increment $(LEVEL)

.PHONY: test build setup subl
