"use strict";

import { eof } from "../../../../utils/tokens";

const end = () => {
	return {
		nextReduction: null,
		tokensToEmit: [eof()]
	};
};

export default end;
