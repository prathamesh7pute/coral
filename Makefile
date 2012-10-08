TESTS = test/*.js
LIB = lib/*.js
REPORTER = dot

build: jshint test

jshint:
	jshint $(LIB) --config .jshintrc
	jshint $(TESTS) --config .jshintrc

test:
	@./node_modules/.bin/mocha \
		--require should \
		--reporter $(REPORTER) \
		--growl \
		$(TESTS)

.PHONY: build bench