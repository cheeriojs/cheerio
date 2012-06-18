test:
	@./node_modules/mocha/bin/mocha --reporter dot

subl:
	@subl lib/ test/ package.json index.js

.PHONY: test build subl
