"use strict";

import last from "array-last";
import * as AST from "../../bash-ast";

export default options => {
	const isAsyncSeparator = separator => separator.text.indexOf("&") !== -1;

	const builder = {
		caseItem: (pattern, body, locStart, locEnd) => {
			const type = "CaseItem";
			const node: AST.CaseItem = { type, pattern, body };

			if (options.insertLOC) {
				node.loc = setLocEnd(setLocStart({}, locStart), locEnd);
			}

			return node;
		},

		caseClause: (clause, cases, locStart, locEnd) => {
			const type = "Case";
			const node: AST.Case = { type, clause };

			if (cases) {
				Object.assign(node, { cases });
			}

			if (options.insertLOC) {
				node.loc = setLocEnd(setLocStart({}, locStart), locEnd);
			}

			return node;
		},

		doGroup: (group, locStart, locEnd) => {
			if (options.insertLOC) {
				setLocEnd(setLocStart(group.loc, locStart), locEnd);
			}
			return group;
		},

		braceGroup: (group, locStart, locEnd) => {
			if (options.insertLOC) {
				setLocEnd(setLocStart(group.loc, locStart), locEnd);
			}
			return group;
		},

		list: logicalExpression => {
			const node: AST.Script = {
				type: "Script",
				commands: [logicalExpression]
			};
			if (options.insertLOC) {
				node.loc = setLocEnd(
					setLocStart({}, logicalExpression.loc),
					logicalExpression.loc
				);
			}
			return node;
		},

		checkAsync: (list, separator) => {
			if (isAsyncSeparator(separator)) {
				last(list.commands).async = true;
			}
			return list;
		},

		listAppend: (list, logicalExpression, separator) => {
			if (isAsyncSeparator(separator)) {
				last(list.commands).async = true;
			}
			list.commands.push(logicalExpression);
			if (options.insertLOC) {
				setLocEnd(list.loc, logicalExpression.loc);
			}
			return list;
		},

		addRedirections: (compoundCommand, redirectList) => {
			compoundCommand.redirections = redirectList;
			if (options.insertLOC) {
				const lastRedirect = redirectList[redirectList.length - 1];
				setLocEnd(compoundCommand.loc, lastRedirect.loc);
			}
			return compoundCommand;
		},

		term: logicalExpression => {
			const node: AST.CompoundList = {
				type: "CompoundList",
				commands: [logicalExpression]
			};
			if (options.insertLOC) {
				node.loc = setLocEnd(
					setLocStart({}, logicalExpression.loc),
					logicalExpression.loc
				);
			}
			return node;
		},

		termAppend: (term, logicalExpression, separator) => {
			if (isAsyncSeparator(separator)) {
				last(term.commands).async = true;
			}
			term.commands.push(logicalExpression);
			setLocEnd(term.loc, logicalExpression.loc);
			return term;
		},

		subshell: (list, locStart, locEnd) => {
			const node: AST.Subshell = { type: "Subshell", list };
			if (options.insertLOC) {
				node.loc = setLocEnd(setLocStart({}, locStart), locEnd);
			}
			return node;
		},

		pipeSequence: command => {
			const node: AST.Pipeline = { type: "Pipeline", commands: [command] };
			if (options.insertLOC) {
				node.loc = setLocEnd(setLocStart({}, command.loc), command.loc);
			}
			return node;
		},

		pipeSequenceAppend: (pipe, command) => {
			pipe.commands.push(command);
			if (options.insertLOC) {
				setLocEnd(pipe.loc, command.loc);
			}
			return pipe;
		},

		bangPipeLine: pipe => {
			const bang = true;
			if (pipe.commands.length === 1) {
				return Object.assign(pipe.commands[0], { bang });
			}
			return Object.assign(pipe, { bang });
		},

		pipeLine: pipe => {
			if (pipe.commands.length === 1) {
				return pipe.commands[0];
			}
			return pipe;
		},

		andAndOr: (left, right) => {
			const node: AST.LogicalExpression = {
				type: "LogicalExpression",
				op: "and",
				left,
				right
			};
			if (options.insertLOC) {
				node.loc = setLocEnd(setLocStart({}, left.loc), right.loc);
			}
			return node;
		},

		orAndOr: (left, right) => {
			const node: AST.LogicalExpression = {
				type: "LogicalExpression",
				op: "or",
				left,
				right
			};
			if (options.insertLOC) {
				node.loc = setLocEnd(setLocStart({}, left.loc), right.loc);
			}
			return node;
		},

		forClause: (name, wordlist, doGroup, locStart) => {
			const node: AST.For = { type: "For", name, wordlist, do: doGroup };
			if (options.insertLOC) {
				node.loc = setLocEnd(setLocStart({}, locStart), doGroup.loc);
			}
			return node;
		},

		forClauseDefault: (name, doGroup, locStart) => {
			const node: AST.For = { type: "For", name, do: doGroup };
			if (options.insertLOC) {
				node.loc = setLocEnd(setLocStart({}, locStart), doGroup.loc);
			}
			return node;
		},

		functionDefinition: (name, body) => {
			const node: AST.Function = { type: "Function", name, body: body[0] };

			if (body[1]) {
				node.redirections = body[1];
			}

			const endLoc = body[1] || body[0];

			if (options.insertLOC) {
				node.loc = setLocEnd(setLocStart({}, name.loc), endLoc.loc);
			}
			return node;
		},

		elseClause: (compoundList, locStart) => {
			if (options.insertLOC) {
				setLocStart(compoundList.loc, locStart.loc);
			}

			return compoundList;
		},

		// eslint-disable-next-line max-params
		ifClause: (clause, then, elseBranch, locStart, locEnd) => {
			const node: AST.If = { type: "If", clause, then };

			if (elseBranch) {
				node.else = elseBranch;
			}

			if (options.insertLOC) {
				node.loc = setLocEnd(setLocStart({}, locStart), locEnd);
			}

			return node;
		},

		while: (clause, body, whileWord) => {
			const node: AST.While = { type: "While", clause, do: body };
			if (options.insertLOC) {
				node.loc = setLocEnd(setLocStart({}, whileWord.loc), body.loc);
			}
			return node;
		},

		until: (clause, body, whileWord) => {
			const node: AST.Until = { type: "Until", clause, do: body };

			if (options.insertLOC) {
				node.loc = setLocEnd(setLocStart({}, whileWord.loc), body.loc);
			}

			return node;
		},

		commandName: name => name,

		commandAssignment: function commandAssignment(prefix) {
			return builder.command(prefix);
		},

		command: function command(
			prefix?: Array<AST.Redirect | AST.AssignmentWord>,
			command?: AST.Word,
			suffix?: Array<AST.Word | AST.Redirect>
		) {
			const node: AST.Command = { type: "Command", prefix, suffix };
			if (command) {
				node.name = command;
			}

			if (options.insertLOC) {
				node.loc = {
					start: prefix ? prefix[0].loc!.start : command!.loc!.start,
					end: suffix
						? suffix[suffix.length - 1].loc!.end
						: command
						? command.loc!.end
						: prefix![prefix!.length - 1].loc!.end
				};
			}

			return node;
		},

		ioRedirect: (op, file) => {
			const node: AST.Redirect = { type: "Redirect", op: op, file: file };
			if (options.insertLOC) {
				node.loc = setLocEnd(setLocStart({}, op.loc), file.loc);
			}
			return node;
		},

		numberIoRedirect: (ioRedirect, numberIo) => {
			const node = { ...ioRedirect, numberIo };
			if (options.insertLOC) {
				setLocStart(node.loc, numberIo.loc);
			}
			return node;
		}
	};

	for (const list of ["caseList", "pattern", "prefix", "suffix"]) {
		mkListHelper(builder, list);
	}

	return builder;
};

function setLocStart(target, source) {
	if (source) {
		target.start = source.start;
	}
	return target;
}

function setLocEnd(target, source) {
	if (source) {
		target.end = source.end;
	}
	return target;
}

function mkListHelper(builder, listName) {
	builder[listName] = item => {
		return [item];
	};
	builder[`${listName}Append`] = (list, item) => {
		list.push(item);
		return list;
	};
}
