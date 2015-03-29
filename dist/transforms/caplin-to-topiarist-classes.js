

/**
 * Given the AST of a module, replace use of caplin.extend/implement with topiarist.
 *
 * @param {RecastAST} moduleAST AST of module to update
 */
"use strict";

exports.updateModuleClassesToUseTopiarist = updateModuleClassesToUseTopiarist;
Object.defineProperty(exports, "__esModule", {
	value: true
});

var _globalCompiler = require("global-compiler");

var orMatchers = _globalCompiler.orMatchers;
var extractParent = _globalCompiler.extractParent;
var composeMatchers = _globalCompiler.composeMatchers;
var identifierMatcher = _globalCompiler.identifierMatcher;
var extractProperties = _globalCompiler.extractProperties;
var composeTransformers = _globalCompiler.composeTransformers;
var callExpressionMatcher = _globalCompiler.callExpressionMatcher;
var nodePathLocatorVisitor = _globalCompiler.nodePathLocatorVisitor;
var memberExpressionMatcher = _globalCompiler.memberExpressionMatcher;

var types = require("recast").types;

var visitAST = require("../index").visitAST;

var identifier = types.builders.identifier;

//const caplinRequireMatcher = composeMatchers(
//	literalMatcher('caplin'),
//	callExpressionMatcher({callee: identifierMatcher('require')}),
//	variableDeclaratorMatcher({id: identifierMatcher('caplin')})
//);
//
//matchers.set('Literal', caplinRequireMatcher);
//
//const caplinRequireTransformer = composeTransformers(
//	literal('topiarist'),
//	extractParent(),
//	extractParent(),
//	extractProperties('id'),
//	identifier('topiarist')
//);

// Transformer that converts caplin.extend/implement to topiarist.extend
var caplinInheritanceToExtendTransformer = composeTransformers(identifier("topiarist"), extractParent(), extractProperties("property"), identifier("extend"));

//const caplinInheritanceToInheritTransformer = composeTransformers(
//	identifier('topiarist'),
//	extractParent(),
//	extractProperties('property'),
//	identifier('inherit')
//);

/**
 * Converts
 * @param {NodePath} identifierNodePath [[Description]]
 * @param {number}   identifierIndex    [[Description]]
 */
function transformCaplinInheritanceIdentifier(identifierNodePath, identifierIndex) {
	if (identifierIndex === 0) {
		caplinInheritanceToExtendTransformer(identifierNodePath);
	} else {
		caplinInheritanceToInheritTransformer(identifierNodePath);
	}
}

// Will receive a Map<string, NodePath[]> of matched NodePaths when the locator is finished
function matchedNodesReceiver(matchedNodePaths) {
	//	const [caplinRequireVarDeclaration] = matchedNodePaths.get('Literal') || [];
	var caplinInheritanceNodePaths = matchedNodePaths.get("Identifier") || [];
	//
	//	if (caplinInheritanceExpressions.length > 0) {
	//		caplinRequireTransformer(caplinRequireVarDeclaration);
	//	} else if (caplinRequireVarDeclaration) {
	//		caplinRequireVarDeclaration.parent.parent.prune();
	//	}

	caplinInheritanceNodePaths.forEach(transformCaplinInheritanceIdentifier);
}

// Matcher that matches caplin.extend() or caplin.implement()
var caplinInheritanceMatcher = composeMatchers(identifierMatcher("caplin"), orMatchers(memberExpressionMatcher({ property: identifierMatcher("extend") }), memberExpressionMatcher({ property: identifierMatcher("implement") })), callExpressionMatcher());

// A map of the NodePath matchers that the locator needs to test NodePaths against
var matchers = new Map();

matchers.set("Identifier", caplinInheritanceMatcher);
function updateModuleClassesToUseTopiarist(moduleAST) {
	nodePathLocatorVisitor.initialize(matchedNodesReceiver, matchers);
	visitAST(moduleAST, nodePathLocatorVisitor);
}

//	variableDeclaratorMatcher,
//	rootNamespaceVisitor,
//	moduleIdVisitor,
//	flattenMemberExpression,
//	literalMatcher,
//	cjsRequireRemoverVisitor,
//	verifyVarIsAvailableVisitor,
//	varNamespaceAliasExpanderVisitor,
//	addRequireForGlobalIdentifierVisitor,
//	replaceLibraryIncludesWithRequiresVisitor