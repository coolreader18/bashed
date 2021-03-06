"use strict";
import compose from "compose-function";
import map from "map-iterable";
import lookahead from "iterable-lookahead";
import { isOperator } from "../enums/io-file-operators";

const ioNumber = (options, mode) => {
	return compose(
		map((tk, idx, iterable) => {
			const next = iterable.ahead(1);

			if (
				tk &&
				tk.is("WORD") &&
				tk.value.match(/^[0-9]+$/) &&
				isOperator(next)
			) {
				return tk.changeTokenType("IO_NUMBER", tk.value);
			}

			return tk;
		}),
		lookahead
	);
};

export default ioNumber;
