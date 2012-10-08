TESTS = test/*.js
LIB = lib/*.js
REPORTER = dot

test:
    jshint $(LIB) --config .jshintrc
    jshint $(TESTS) --config .jshintrc
	@./node_modules/.bin/mocha \
		--require should \
		--reporter $(REPORTER) \
		--growl \
		$(TESTS)

.PHONY: test bench