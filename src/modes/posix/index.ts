"use strict";

import * as astBuilder from "./ast-builder";
import * as tokenizer from "./tokenizer";
import * as phaseCatalog from "./rules";
import * as grammarSource from "./grammar";
import * as enums from "./enums";

const lexerPhases = () => [
	phaseCatalog.newLineList,
	phaseCatalog.operatorTokens,
	phaseCatalog.separator,
	phaseCatalog.reservedWords,
	phaseCatalog.linebreakIn,
	phaseCatalog.ioNumber,
	phaseCatalog.identifyMaybeSimpleCommands,
	phaseCatalog.assignmentWord,
	phaseCatalog.parameterExpansion,
	phaseCatalog.arithmeticExpansion,
	phaseCatalog.commandExpansion,
	phaseCatalog.forNameVariable,
	phaseCatalog.functionName,
	phaseCatalog.identifySimpleCommandNames,
	// utils.loggerPhase('pre'),
	phaseCatalog.aliasSubstitution,
	// utils.loggerPhase('post'),
	phaseCatalog.tildeExpanding,
	phaseCatalog.parameterExpansion.resolve,
	phaseCatalog.commandExpansion.resolve,
	phaseCatalog.arithmeticExpansion.resolve,
	phaseCatalog.fieldSplitting.split,
	phaseCatalog.pathExpansion,
	phaseCatalog.quoteRemoval,
	phaseCatalog.syntaxerrorOnContinue,
	phaseCatalog.defaultNodeType
	// utils.loggerPhase('tokenizer'),
];

export default {
	inherits: null,
	init: (posixMode, utils) => {
		let grammar = null;
		try {
			grammar = require("./built-grammar");
		} catch (err) {}
		return {
			enums,
			phaseCatalog,
			lexerPhases: lexerPhases(),
			tokenizer,
			grammarSource,
			grammar,
			astBuilder
		};
	}
};
