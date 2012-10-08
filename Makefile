TESTS = test/*.js
REPORTER = dot

build: jshint test

jshint:
	jshint lib/ test/ --config .jshintrc

test:
	@./node_modules/.bin/mocha \
		--require should \
		--reporter $(REPORTER) \
		--growl \
		$(TESTS)

.PHONY: build bench