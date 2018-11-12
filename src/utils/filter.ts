"use strict";
import filterIterator from "filter-iterator";
import reverse from "reverse-arguments";
import { to } from "curry";

const filter = to(2, reverse(filterIterator));

export default filter;
