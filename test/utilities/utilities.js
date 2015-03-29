import assert from 'assert';
import {Readable} from 'stream';

import {
	spy,
	stub,
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

import {
	visitAST,
	visitASTAndPushToNextStream
} from '../../src/index';

describe('utilities', () => {
	const ast = parse('var t = 10;');
	const stubFileMetadata = {
		ast: ast
	};

	after(() => winston.add(winston.transports.Console));
	before(() => winston.remove(winston.transports.Console));

	describe('visitASTAndPushToNextStream', () => {
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

	describe('visitAST', () => {
		it('should visit AST if there are no errors during visit.', () => {
			// Given.
			const stubVisitor = {};

			stubVisitor.visitIdentifier = spy();

			// When.
			visitAST(ast, stubVisitor);

			// Then.
			assert(stubVisitor.visitIdentifier.calledOnce);
		});

		it('should catch error if there is an error during visit.', () => {
			// Given.
			const stubVisitor = {};
			const visitorError = new Error('Visitor error');

			stubVisitor.visitIdentifier = stub();
			stubVisitor.visitIdentifier.throws(visitorError);

			// When.
			visitAST(ast, stubVisitor);

			// Then.
			// The exception doesn't bubble up and the visitor is executed
			assert(stubVisitor.visitIdentifier.calledOnce);
		});
	});
});
