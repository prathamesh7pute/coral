TESTS = test/*.js
LIB = lib/*.js
REPORTER = dot

test: jshint test-unit

jshint:
	jshint $(LIB) --config .jshintrc
	jshint $(TESTS) --config .jshintrc

test-unit:
	@./node_modules/.bin/mocha \
		--require should \
		--reporter $(REPORTER) \
		--growl \
		$(TESTS)

.PHONY: test jshint test-unit bench