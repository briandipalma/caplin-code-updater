import assert from 'assert';
import {Readable} from 'stream';

import {
	spy,
	createStubInstance
} from 'sinon';
import {parse} from 'recast';
import winston from 'winston';
import {
	it,
	after,
	before,
	describe
} from 'mocha';

import {visitASTAndPushToNextStream} from '../../src/index';

describe('utilities', () => {
	const stubFileMetadata = {
		ast: parse('var t = 10;')
	};

	after(() => winston.add(winston.transports.Console));
	before(() => winston.remove(winston.transports.Console));

	it('should visit AST, push file meta data and execute callback if there are no errors during visit.', () => {
		// Given.
		const stubVisitor = {};
		const spyCallback = spy();
		const stubReadable = createStubInstance(Readable);

		// When.
		visitASTAndPushToNextStream(stubFileMetadata, stubVisitor, stubReadable, spyCallback);

		// Then.
		assert(spyCallback.calledOnce);
		assert(spyCallback.calledWith());
		assert(stubReadable.push.calledOnce);
		assert(stubReadable.push.calledWith(stubFileMetadata));
	});

	it('should provide callback with error if there is error during visit.', () => {
		// Given.
		const stubVisitor = {
			visitIdentifier() {
				throw visitorError;
			}
		};
		const spyCallback = spy();
		const visitorError = new Error('Visitor error');
		const stubReadable = createStubInstance(Readable);

		// When.
		visitASTAndPushToNextStream(stubFileMetadata, stubVisitor, stubReadable, spyCallback);

		// Then.
		assert(spyCallback.calledTwice);
		assert(spyCallback.calledWith(visitorError));
		assert(stubReadable.push.calledOnce);
		assert(stubReadable.push.calledWith(stubFileMetadata));
	});
});
