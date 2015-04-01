"use strict";

var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) { _arr.push(_step.value); if (i && _arr.length === i) break; } return _arr; } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } };

/**
 * Given the AST of a module, replace use of caplin.extend/implement with topiarist.
 *
 * @param {RecastAST} moduleAST AST of module to update
 */
exports.updateModuleClassesToUseTopiarist = updateModuleClassesToUseTopiarist;
Object.defineProperty(exports, "__esModule", {
	value: true
});

var _globalCompiler = require("global-compiler");

var orMatchers = _globalCompiler.orMatchers;
var extractParent = _globalCompiler.extractParent;
var literalMatcher = _globalCompiler.literalMatcher;
var composeMatchers = _globalCompiler.composeMatchers;
var identifierMatcher = _globalCompiler.identifierMatcher;
var extractProperties = _globalCompiler.extractProperties;
var composeTransformers = _globalCompiler.composeTransformers;
var callExpressionMatcher = _globalCompiler.callExpressionMatcher;
var nodePathLocatorVisitor = _globalCompiler.nodePathLocatorVisitor;
var memberExpressionMatcher = _globalCompiler.memberExpressionMatcher;
var variableDeclaratorMatcher = _globalCompiler.variableDeclaratorMatcher;

var types = require("recast").types;

var visitAST = require("../index").visitAST;

var _types$builders = types.builders;
var identifier = _types$builders.identifier;
var literal = _types$builders.literal;

// Transformer that converts `var caplin = require('caplin')` to `var topiarist = require('topiarist')`
var caplinRequireTransformer = composeTransformers(literal("topiarist"), extractParent(), extractParent(), extractProperties("id"), identifier("topiarist"));

// Transformer that converts caplin.extend/implement to topiarist.extend
var caplinInheritanceToExtendTransformer = composeTransformers(identifier("topiarist"), extractParent(), extractProperties("property"), identifier("extend"));

// Transformer that converts caplin.extend/implement to topiarist.inherit
var caplinInheritanceToInheritTransformer = composeTransformers(identifier("topiarist"), extractParent(), extractProperties("property"), identifier("inherit"));

/**
 * Converts caplin inheritance statements to topiarist ones.
 *
 * @param {NodePath} identifierNodePath Caplin inheritance NodePath
 * @param {number}   identifierCounter  How many inheritance statements have been found before this one
 */
function transformCaplinInheritanceIdentifier(identifierNodePath, identifierCounter) {
	// If there have been no inheritance statements before this one then transform this expression to
	// use topiarist.extend, else use topiarist.inherit. This preserves the current runtime behaviour
	// of the caplin inheritance code.
	if (identifierCounter === 0) {
		caplinInheritanceToExtendTransformer(identifierNodePath);
	} else {
		caplinInheritanceToInheritTransformer(identifierNodePath);
	}
}

// Will receive a Map<string, NodePath[]> of matched NodePaths when the locator is finished
function matchedNodesReceiver(matchedNodePaths) {
	var _ref = matchedNodePaths.get("Literal") || [];

	var _ref2 = _slicedToArray(_ref, 1);

	var caplinRequireVarDeclaration = _ref2[0];

	var caplinInheritanceNodePaths = matchedNodePaths.get("Identifier") || [];

	if (caplinRequireVarDeclaration) {
		caplinRequireTransformer(caplinRequireVarDeclaration);
	}

	caplinInheritanceNodePaths.forEach(transformCaplinInheritanceIdentifier);
}

// Matcher that matches `var caplin = require('caplin')`
var caplinRequireMatcher = composeMatchers(literalMatcher("caplin"), callExpressionMatcher({ callee: identifierMatcher("require") }), variableDeclaratorMatcher({ id: identifierMatcher("caplin") }));

// Matcher that matches `caplin.extend()` or `caplin.implement()`
var caplinInheritanceMatcher = composeMatchers(identifierMatcher("caplin"), orMatchers(memberExpressionMatcher({ property: identifierMatcher("extend") }), memberExpressionMatcher({ property: identifierMatcher("implement") })), callExpressionMatcher());

// A map of the NodePath matchers that the locator needs to test NodePaths against
var matchers = new Map();

matchers.set("Literal", caplinRequireMatcher);
matchers.set("Identifier", caplinInheritanceMatcher);
function updateModuleClassesToUseTopiarist(moduleAST) {
	nodePathLocatorVisitor.initialize(matchedNodesReceiver, matchers);
	visitAST(moduleAST, nodePathLocatorVisitor);
}