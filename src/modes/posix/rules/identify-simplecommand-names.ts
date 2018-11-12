"use strict";
import lookahead from "iterable-lookahead";
import compose from "compose-function";
import map from "map-iterable";
import { isOperator } from "../enums/io-file-operators";
import isValidName from "../../../utils/is-valid-name";

function couldEndSimpleCommand(scTk) {
	return (
		scTk &&
		(scTk.is("SEPARATOR_OP") ||
			scTk.is("NEWLINE") ||
			scTk.is("NEWLINE_LIST") ||
			scTk.value === ";" ||
			scTk.is("PIPE") ||
			scTk.is("OR_IF") ||
			scTk.is("PIPE") ||
			scTk.is("AND_IF"))
	);
}

function couldBeCommandName(tk) {
	return tk && tk.is("WORD") && isValidName(tk.value);
}

const identifySimpleCommandName = (options, mode) =>
	compose(
		map((tk, idx, iterable) => {
			if (tk._.maybeStartOfSimpleCommand) {
				if (couldBeCommandName(tk)) {
					tk._.maybeSimpleCommandName = true;
				} else {
					const next = iterable.ahead(1);
					if (next && !couldEndSimpleCommand(next)) {
						next._.commandNameNotFoundYet = true;
					}
				}
			}

			if (tk._.commandNameNotFoundYet) {
				const last = iterable.behind(1);

				if (!isOperator(last) && couldBeCommandName(tk)) {
					tk._.maybeSimpleCommandName = true;
				} else {
					const next = iterable.ahead(1);
					if (next && !couldEndSimpleCommand(next)) {
						next._.commandNameNotFoundYet = true;
					}
				}
				delete tk._.commandNameNotFoundYet;
			}

			return tk;
		}),
		lookahead
	);

export default identifySimpleCommandName;
