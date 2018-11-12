"use strict";
import hasOwnProperty from "has-own-property";
import filter from "filter-obj";
import operators from "../modes/posix/enums/operators";

export class Token {
	constructor(fields) {
		const definedFields = filter(fields, (key, value) => value !== undefined);
		Object.assign(this, definedFields);

		if (this._ === undefined) {
			this._ = {};
		}
	}

	_;
	type;
	value;
	loc;
	expansion;
	originalText;

	is(type) {
		return this.type === type;
	}

	appendTo(chunk) {
		return new Token(Object.assign({}, this, { value: this.value + chunk }));
	}
	changeTokenType(type, value) {
		return new Token({
			type,
			value,
			loc: this.loc,
			_: this._,
			expansion: this.expansion
		});
	}
	setValue(value) {
		return new Token(Object.assign({}, this, { value }));
	}
	alterValue(value) {
		return new Token(
			Object.assign({}, this, {
				value,
				originalText: this.originalText || this.value
			})
		);
	}
	addExpansions() {
		return new Token(Object.assign({}, this, { expansion: [] }));
	}
	setExpansions(expansion) {
		return new Token(Object.assign({}, this, { expansion }));
	}
}

export function token(args) {
	return new Token(args);
}

function mkToken(type, value?, loc?, expansion?) {
	const tk = new Token({ type, value, loc });
	if (expansion && expansion.length) {
		tk.expansion = expansion;
	}

	return tk;
}

const _mkToken = mkToken;
export { _mkToken as mkToken };

export function mkFieldSplitToken(joinedTk, value, fieldIdx) {
	const tk = new Token({
		type: joinedTk.type,
		value,
		joined: joinedTk.value,
		fieldIdx,
		loc: joinedTk.loc,
		expansion: joinedTk.expansion,
		originalText: joinedTk.originalText
	});

	return tk;
}

export function appendTo(tk, chunk) {
	return tk.appendTo(chunk);
}
export function changeTokenType(tk, type, value) {
	return tk.changeTokenType(type, value);
}
export function setValue(tk, value) {
	return tk.setValue(value);
}
export function alterValue(tk, value) {
	return tk.alterValue(value);
}
export function addExpansions(tk) {
	return tk.addExpansions();
}
export function setExpansions(tk, expansion) {
	return tk.setExpansions(expansion);
}

export function tokenOrEmpty(state) {
	if (state.current !== "" && state.current !== "\n") {
		const expansion = (state.expansion || []).map(xp => {
			// console.log('aaa', {token: state.loc, xp: xp.loc});
			return Object.assign({}, xp, {
				loc: {
					start: xp.loc.start.char - state.loc.start.char,
					end: xp.loc.end.char - state.loc.start.char
				}
			});
		});
		const token = mkToken(
			"TOKEN",
			state.current,
			{
				start: Object.assign({}, state.loc.start),
				end: Object.assign({}, state.loc.previous)
			},
			expansion
		);

		/* if (state.expansion && state.expansion.length) {
			token.expansion = state.expansion;
		}*/

		return [token];
	}
	return [];
}

export function operatorTokens(state) {
	const token = mkToken(operators[state.current], state.current, {
		start: Object.assign({}, state.loc.start),
		end: Object.assign({}, state.loc.previous)
	});

	return [token];
}

export function newLine() {
	return mkToken("NEWLINE", "\n");
}

export function continueToken(expectedChar) {
	return mkToken("CONTINUE", expectedChar);
}

export function eof() {
	return mkToken("EOF", "");
}

export function isPartOfOperator(text) {
	return Object.keys(operators).some(op => op.slice(0, text.length) === text);
}

export function isOperator(text) {
	return hasOwnProperty(operators, text);
}

export function applyTokenizerVisitor(visitor) {
	return (tk, idx, iterable) => {
		if (hasOwnProperty(visitor, tk.type)) {
			const visit = visitor[tk.type];

			return visit(tk, iterable);
		}

		if (hasOwnProperty(visitor, "defaultMethod")) {
			const visit = visitor.defaultMethod;
			return visit(tk, iterable);
		}

		return tk;
	};
}
