"use strict";

const ioFileOperators = [
	"LESS",
	"DLESS",
	"DGREAT",
	"LESSAND",
	"GREATAND",
	"GREAT",
	"LESSGREAT",
	"CLOBBER"
];

export default ioFileOperators;

export function isOperator(tk) {
	for (const op of ioFileOperators) {
		if (tk.type === op) {
			return true;
		}
	}
	return false;
}
