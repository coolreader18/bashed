"use strict";

import { tokenOrEmpty, continueToken } from "../../../../utils/tokens";

const singleQuoting = (state, source, reducers) => {
	const char = source && source.shift();

	if (char === undefined) {
		return {
			nextState: state,
			nextReduction: null,
			tokensToEmit: tokenOrEmpty(state).concat(continueToken("'"))
		};
	}

	if (char === "'") {
		return {
			nextReduction: reducers.start,
			nextState: state.appendChar(char)
		};
	}

	return {
		nextReduction: reducers.singleQuoting,
		nextState: state.appendChar(char)
	};
};

export default singleQuoting;
