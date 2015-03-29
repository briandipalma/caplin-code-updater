import {equal} from 'assert';

import {
	it,
	describe
} from 'mocha';
import {
	print,
	parse
} from 'recast';

import {updateModuleClassesToUseTopiarist} from '../../src/index';

//function AClass() {}
//
//caplin.extend(AClass, SuperClass);
//caplin.implement(AClass, Interface);

//var topiarist = require('topiarist');
//
//function SimpleClass() {
//}
//
//topiarist.extend(SimpleClass, SuperClass);
//topiarist.inherit(SimpleClass, Interface);

describe('caplin-to-topiarist-classes', () => {
	it('should replace usage of single caplin extend with topiarist extend', () => {
		// Given.
		const moduleAST = parse(`caplin.extend(AClass, SuperClass);`);

		// When.
		updateModuleClassesToUseTopiarist(moduleAST);

		// Then.
		equal(print(moduleAST).code, 'topiarist.extend(AClass, SuperClass);');
	});
});
