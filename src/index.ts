"use strict";

import shellLexer from "./shell-lexer";
import * as utils from "./utils";
import * as AST from "./bash-ast";

interface Mode {
	inherits: string | null;
	init: (posixMode: any, utils: typeof import("./utils")) => any;
}
// preload all modes to have them browserified
import * as bash from "./modes/bash";
import * as posix from "./modes/posix";
import * as wordExpansion from "./modes/word-expansion";
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

interface ParseOptions {
	/**
	 * if `true`, includes lines and columns information in the source file.
	 * @default false
	 */
	insertLOC?: boolean;

	/**
	 * a callback to resolve shell alias. If specified, the parser call it
	 * whenever it need to resolve an alias. It should return the resolved code
	 * if the alias exists, otherwise `null`. If the option is not specified, the
	 * parser won't try to resolve any alias.
	 */
	resolveAlias?: (name: string) => string | null;

	/**
	 * a callback to resolve environment variables. If specified, the parser
	 * call it whenever it need to resolve an environment variable. It should
	 * return the value if the variable is defined, otherwise `null`. If the
	 * option is not specified, the parser won't try to resolve any environment
	 * variable.
	 */
	resolveEnv?: (name: string) => string | null;

	/**
	 * a callback to resolve path globbing. If specified, the parser call it
	 * whenever it need to resolve a path globbing. It should return the value
	 * if the expanded variable. If the option is not specified, the parser
	 * won't try to resolve any path globbing.
	 */
	resolvePath?: (text: string) => string;

	/**
	 * a callback to resolve users home directories. If specified, the parser
	 * call it whenever it need to resolve a tilde expansion. If the option is
	 * not specified, the parser won't try to resolve any tilde expansion. When
	 * the callback is called with a null value for username, the callback
	 * should return the current user home directory.
	 */
	resolveHomeUser?: (username: string | null) => string;

	/**
	 * a callback to resolve parameter expansion. If specified, the parser call
	 * it whenever it need to resolve a parameter expansion. It should return
	 * the result of the expansion. If the option is not specified, the parser
	 * won't try to resolve any parameter expansion.
	 */
	resolveParameter?: (
		parameterAST:
			| AST.ArithmeticExpansion
			| AST.CommandExpansion
			| AST.ParameterExpansion
	) => string;

	/**
	 * a callback to execute a `Command`. If specified, the parser call it
	 * whenever it need to resolve a command substitution. It receive as
	 * argument the AST of a `Command` node, and shall return the output of
	 * the command. If the option is not specified, the parser won't try to
	 * resolve any command substitution.
	 */
	execCommand?: (cmdAST: AST.Command) => string;

	/**
	 * a callback to execute a `Script` in a new shell process. If specified,
	 * the parser call it whenever it need to resolve a subshell statement. It
	 * receive as argument the AST of a `Script` node, and shall return the
	 * output of the command. If the option is not specified, the parser won't
	 * try to resolve any subshell statement.
	 */
	execShellScript?: (scriptAST: AST.Script) => string;

	/**
	 * a callback to execute an `ArithmeticExpansion`. If specified, the parser
	 * call it whenever it need to resolve an arithmetic substitution. It
	 * receive as argument the AST of a `ArithmeticExpansion` node, and shall
	 * return the result of the calculation. If the option is not specified, the
	 * parser won't try to resolve any arithmetic_expansion substitution. Please
	 * note that the aritmethic expression AST is built using babylon, you can
	 * find there it's AST specification.
	 */
	runArithmeticExpression?: (arithmeticAST: AST.ArithmeticExpansion) => string;

	mode?: "posix" | "bash" | "wordExpansion";
}

interface Parse {
	(sourceCode: string, options?: ParseOptions): AST.Script;
	default: Parse;
}

const parse: Parse = (
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

parse.default = parse;

export = parse;
