build:
	@coffee -o lib/ src/

test:
	@./test/run $(TESTS)

.PHONY: test