test:
	@./node_modules/mocha/bin/mocha --compilers coffee:coffee-script --reporter dot

subl:
	@subl lib/ test/ package.json index.js

.PHONY: test build subl
