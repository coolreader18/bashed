'use strict';

const test = require('ava');
const bashParser = require('../src');
const utils = require('./_utils');

/* eslint-disable camelcase */
test('parameter with use default value', t => {
	const result = bashParser('${other:-default_value}');

	// utils.logResults(result.commands[0].name)
	utils.checkResults(t, result.commands[0].name, {
		type: 'Word',
		text: '${other:-default_value}',
		expansion: [{
			type: 'ParameterExpansion',
			parameter: 'other',
			word: {
				text: 'default_value'
			},
			op: 'useDefaultValue',
			loc: {
				start: 0,
				end: 22
			}
		}]
	});
});

test('parameter with assign default value', t => {
	const result = bashParser('${other:=default_value}');
	utils.checkResults(t, result.commands[0].name, {
		type: 'Word',
		text: '${other:=default_value}',
		expansion: [{
			type: 'ParameterExpansion',
			parameter: 'other',
			word: {
				text: 'default_value'
			},
			op: 'assignDefaultValue',
			loc: {
				start: 0,
				end: 22
			}
		}]
	});
});

/* TODO: restore parsing of arguments
test.only('parameter with other parameter in word', t => {
	const result = bashParser('${other:=default$value}');
	utils.logResults(result)
	utils.checkResults(t, JSON.parse(JSON.stringify(result.commands[0].name)), {
		type: 'Word',
		text: '${other:=default$value}',
		expansion: [{
			type: 'ParameterExpansion',
			parameter: 'other',
			word: {
				text: 'default$value',
				expansion: [{
					type: 'ParameterExpansion',
					parameter: 'value',
					start: 7,
					end: 13
				}]
			},
			op: 'assignDefaultValue',
			loc: {
				start: 0,
				end: 22
			}
		}]
	});
});
*/

test('parameter with indicate error if null', t => {
	const result = bashParser('${other:?default_value}');
	utils.checkResults(t, result.commands[0].name, {
		text: '${other:?default_value}',
		type: 'Word',
		expansion: [{
			type: 'ParameterExpansion',
			parameter: 'other',
			word: {
				text: 'default_value'
			},
			op: 'indicateErrorIfNull',
			loc: {
				start: 0,
				end: 22
			}
		}]
	});
});

test('parameter with use alternative value', t => {
	const result = bashParser('${other:+default_value}');
	utils.checkResults(t, result.commands[0].name, {
		text: '${other:+default_value}',
		type: 'Word',
		expansion: [{
			type: 'ParameterExpansion',
			parameter: 'other',
			word: {
				text: 'default_value'
			},
			op: 'useAlternativeValue',
			loc: {
				start: 0,
				end: 22
			}
		}]
	});
});
