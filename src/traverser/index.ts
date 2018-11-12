"use strict";

const DescendVisitor = require("./descend-visitor")(traverseNode);
import * as AST from "../bash-ast";

type Context = [AST.Node, AST.Node, Visitor];

/*
 *  Execute a visitor object method that has the same name
 *  of an AST node type.
 *
 *  The visitor method receive as arguments the AST node,
 *  and the execution context.
 */
export const visitNode = (
	node: AST.Node | null | undefined,
	context: Context,
	visitor: Visitor | Visitor[]
) => {
	if (node === null || node === undefined) {
		return null;
	}

	if (Array.isArray(visitor)) {
		return visitor.reduce((n, v) => {
			const newNode = visitNode(n, context, v);
			return newNode;
		}, node);
	}

	let out: AST.Node | AST.Node[] | void;

	if (typeof visitor[node.type] === "function") {
		out = (visitor[node.type] as VisitorFunc<AST.Node>)(node, ...context);
	} else if (typeof visitor.defaultMethod === "function") {
		out = visitor.defaultMethod(node, ...context);
	} else {
		out = node;
	}

	return out === undefined ? node : out;
};

function traverseNode(parent, ast, visitor) {
	return node =>
		visitNode(node, [parent, ast, visitor], [DescendVisitor, visitor]);
}

type VisitorFunc<T extends AST.Node> = (
	node: T,
	...context: Context
) => AST.Node | AST.Node[] | void;
type Visitor = {
	[k in AST.Node["type"]]?: VisitorFunc<Extract<AST.Node, { type: k }>>
} & {
	defaultMethod?: VisitorFunc<AST.Node>;
};

const traverse = (ast: AST.Node, visitor: Visitor | Visitor[]) =>
	traverseNode(null, ast, visitor)(ast);

export default traverse;
