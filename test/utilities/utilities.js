import assert from 'assert';
import {Readable} from 'stream';

import {
	spy,
	createStubInstance
} from 'sinon';
import {describe, it} from 'mocha';

import {visitASTAndPushToNextStream} from '../../src/index';

describe('utilities', () => {
	it('should visit AST, push file meta data and execute callback if there are no errors during visit.', () => {
		// Given.
		const stubVisitor = {};
		const spyCallback = spy();
		const stubFileMetadata = {};
		const stubReadable = createStubInstance(Readable);

		// When.
		visitASTAndPushToNextStream(stubFileMetadata, stubVisitor, stubReadable, spyCallback);

		// Then.
		assert(spyCallback.calledOnce);
		assert(spyCallback.calledWith());
		assert(stubReadable.push.calledOnce);
		assert(stubReadable.push.calledWith(stubFileMetadata));
	});
});
