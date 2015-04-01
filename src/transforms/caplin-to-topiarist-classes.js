import {
	orMatchers,
	extractParent,
	literalMatcher,
	composeMatchers,
	identifierMatcher,
	extractProperties,
	composeTransformers,
	callExpressionMatcher,
	nodePathLocatorVisitor,
	memberExpressionMatcher,
	variableDeclaratorMatcher,
} from 'global-compiler';
import {types} from 'recast';

import {visitAST} from '../index';

const {builders: {identifier, literal}} = types;

// Transformer that converts `var caplin = require('caplin')` to `var topiarist = require('topiarist')`
const caplinRequireTransformer = composeTransformers(
	literal('topiarist'),
	extractParent(),
	extractParent(),
	extractProperties('id'),
	identifier('topiarist')
);

// Transformer that converts caplin.extend/implement to topiarist.extend
const caplinInheritanceToExtendTransformer = composeTransformers(
	identifier('topiarist'),
	extractParent(),
	extractProperties('property'),
	identifier('extend')
);

// Transformer that converts caplin.extend/implement to topiarist.inherit
const caplinInheritanceToInheritTransformer = composeTransformers(
	identifier('topiarist'),
	extractParent(),
	extractProperties('property'),
	identifier('inherit')
);

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
	const [caplinRequireVarDeclaration] = matchedNodePaths.get('Literal') || [];
	const caplinInheritanceNodePaths = matchedNodePaths.get('Identifier') || [];

	if (caplinRequireVarDeclaration) {
		caplinRequireTransformer(caplinRequireVarDeclaration);
	}

	caplinInheritanceNodePaths.forEach(transformCaplinInheritanceIdentifier);
}

// Matcher that matches `var caplin = require('caplin')`
const caplinRequireMatcher = composeMatchers(
	literalMatcher('caplin'),
	callExpressionMatcher({callee: identifierMatcher('require')}),
	variableDeclaratorMatcher({id: identifierMatcher('caplin')})
);

// Matcher that matches `caplin.extend()` or `caplin.implement()`
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

matchers.set('Literal', caplinRequireMatcher);
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
