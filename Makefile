REPORTER = dot
XYZ = node_modules/.bin/xyz --message 'Release X.Y.Z' --tag X.Y.Z --script scripts/prepublish

test:
	@./node_modules/.bin/jshint lib/ test/
	@./node_modules/.bin/mocha --reporter $(REPORTER)

setup:
	@npm install

subl:
	@subl lib/ test/ package.json index.js

test-cov:
	@./node_modules/.bin/istanbul cover node_modules/.bin/_mocha -- --reporter $(REPORTER)


bench:
	@./benchmark/benchmark.js

.PHONY: release-major release-minor release-patch
release-major: LEVEL = major
release-minor: LEVEL = minor
release-patch: LEVEL = patch

release-major release-minor release-patch:
	@$(XYZ) --increment $(LEVEL)

.PHONY: test build setup subl
