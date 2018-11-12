"use strict";

import filter from "./filter";

const nonNull = tk => {
	return tk !== null;
};

export default filter(nonNull);
filter.predicate = nonNull;
