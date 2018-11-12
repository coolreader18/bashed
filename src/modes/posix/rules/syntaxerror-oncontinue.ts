"use strict";
import map from "map-iterable";

const syntaxerrorOnContinue = () => {
	return map(tk => {
		if (tk && tk.is("CONTINUE")) {
			throw new SyntaxError("Unclosed " + tk.value);
		}

		return tk;
	});
};

export default syntaxerrorOnContinue;
