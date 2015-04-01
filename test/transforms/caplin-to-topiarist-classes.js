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

	it('should replace usage of single caplin implement with topiarist extend', () => {
		// Given.
		const moduleAST = parse(`caplin.implement(AClass, SuperClass);`);

		// When.
		updateModuleClassesToUseTopiarist(moduleAST);

		// Then.
		equal(print(moduleAST).code, 'topiarist.extend(AClass, SuperClass);');
	});

	it('should replace usage of multiple caplin inheritance statements with topiarist extend then inherit', () => {
		// Given.
		const givenCode = `caplin.extend(AClass, SuperClass);
							caplin.implement(AClass, Interface);`;
		const moduleAST = parse(givenCode);

		// When.
		updateModuleClassesToUseTopiarist(moduleAST);

		// Then.
		const expectedCode = `topiarist.extend(AClass, SuperClass);
							topiarist.inherit(AClass, Interface);`;

		equal(print(moduleAST).code, expectedCode);
	});

	it('should replace caplin requires with topiarist requires', () => {
		// Given.
		const givenCode = `var caplin = require('caplin');
							caplin.extend(AClass, SuperClass);`;
		const moduleAST = parse(givenCode);

		// When.
		updateModuleClassesToUseTopiarist(moduleAST);

		// Then.
		const expectedCode = `var topiarist = require("topiarist");
							topiarist.extend(AClass, SuperClass);`;

		equal(print(moduleAST).code, expectedCode);
	});
});
