import {
	orMatchers,
	extractParent,
	composeMatchers,
	identifierMatcher,
	extractProperties,
	composeTransformers,
	callExpressionMatcher,
	nodePathLocatorVisitor,
	memberExpressionMatcher,
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
} from 'global-compiler';
import {types} from 'recast';

import {visitAST} from '../index';

const {builders: {identifier}} = types;

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
const caplinInheritanceToExtendTransformer = composeTransformers(
	identifier('topiarist'),
	extractParent(),
	extractProperties('property'),
	identifier('extend')
);

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
	const caplinInheritanceNodePaths = matchedNodePaths.get('Identifier') || [];
//
//	if (caplinInheritanceExpressions.length > 0) {
//		caplinRequireTransformer(caplinRequireVarDeclaration);
//	} else if (caplinRequireVarDeclaration) {
//		caplinRequireVarDeclaration.parent.parent.prune();
//	}

	caplinInheritanceNodePaths.forEach(transformCaplinInheritanceIdentifier);
}

// Matcher that matches caplin.extend() or caplin.implement()
const caplinInheritanceMatcher = composeMatchers(
	identifierMatcher('caplin'),
	orMatchers(
		memberExpressionMatcher({property: identifierMatcher('extend')}),
		memberExpressionMatcher({property: identifierMatcher('implement')})
	),
	callExpressionMatcher()
);

// A map of the NodePath matchers that the locator needs to test NodePaths against
const matchers = new Map();

matchers.set('Identifier', caplinInheritanceMatcher);

/**
 * Given the AST of a module, replace use of caplin.extend/implement with topiarist.
 *
 * @param {RecastAST} moduleAST AST of module to update
 */
export function updateModuleClassesToUseTopiarist(moduleAST) {
	nodePathLocatorVisitor.initialize(matchedNodesReceiver, matchers);
	visitAST(moduleAST, nodePathLocatorVisitor);
}
