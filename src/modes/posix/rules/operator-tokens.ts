"use strict";
import hasOwnProperty from "has-own-property";
import map from "map-iterable";
import * as tokens from "../../../utils/tokens";

const reduceToOperatorTokenVisitor = operators => ({
	OPERATOR(tk) {
		if (hasOwnProperty(operators, tk.value)) {
			return tokens.changeTokenType(tk, operators[tk.value], tk.value);
		}
		return tk;
	}
});

export default (options, mode) =>
	map(
		tokens.applyTokenizerVisitor(
			reduceToOperatorTokenVisitor(mode.enums.operators)
		)
	);
