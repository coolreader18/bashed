"use strict";

import shellLexer from "./shell-lexer";
import * as utils from "./utils";

interface Mode {
	inherits: string | null;
	init: (posixMode: any, utils: typeof import("./utils")) => any;
}
// preload all modes to have them browserified
import * as bash from "./modes/bash";
import * as posix from "./modes/posix";
import * as wordExpansion from "./modes/word-expansion";
import { ParseOptions } from "./parse-options";
const modes: {
	[k: string]: Mode;
} = {
	bash,
	posix,
	wordExpansion
};

function loadPlugin(name: keyof typeof modes) {
	const modePlugin = modes[name];

	if (modePlugin.inherits) {
		return modePlugin.init(loadPlugin(modePlugin.inherits), utils);
	}
	return modePlugin.init(null, utils);
}

export const parse = (
	sourceCode,
	{ mode: modeName = "posix", ...options }: ParseOptions = {}
) => {
	try {
		const mode = loadPlugin(modeName);
		const { Parser } = mode.grammar;
		const { astBuilder } = mode;
		const parser = new Parser();
		parser.lexer = shellLexer(mode, options);
		parser.yy = astBuilder(options);

		const ast = parser.parse(sourceCode);

		/*
		const fixtureFolder = `${__dirname}/../test/fixtures`;
		const json = require('json5');
		const {writeFileSync} = require('fs');

		const fileName = require('node-uuid').v4();
		const filePath = `${fixtureFolder}/${fileName}.js`;
		writeFileSync(filePath, 'module.exports = ' + json.stringify({
			sourceCode, result: ast
		}, null, '\t'));
*/
		return ast;
	} catch (err) {
		if (err instanceof SyntaxError) {
			throw err;
		}
		throw new Error(err.stack || err.message);
	}
};

export { ParseOptions };

export * from "./traverser";
