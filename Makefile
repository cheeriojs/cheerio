RENDERING_DIR = tests/rendering

build:
	@coffee -o lib/ src/

test: clean-tests
	@vows tests/test.cheerio.coffee --spec

clean-tests:
	@rm -rf $(RENDERING_DIR)/finals/
	@mkdir $(RENDERING_DIR)/finals/
	@rm -rf $(RENDERING_DIR)/diffs/
	@mkdir $(RENDERING_DIR)/diffs/

.PHONY: build clean-tests test