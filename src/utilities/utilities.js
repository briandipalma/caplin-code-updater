import {visit} from 'recast';
import {error} from 'winston';

/**
 * Utility that will visit the file AST using the provided visitor. If an error occurs it will be
 * logged and stream processing will continue.
 *
 * @param {FileMetadata}    fileMetadata    File metadata for file being visited
 * @param {RecastVisitor}   visitor         Recast AST visitor
 * @param {stream.Readable} streamTransform Stream transform instance
 * @param {Function}        callback        Used to flush data down the stream
 */
export function visitASTAndPushToNextStream(fileMetadata, visitor, streamTransform, callback) {
	try {
		visit(fileMetadata.ast, visitor);
	} catch (visitorError) {
		error(visitor);
		error(fileMetadata);
		error(visitorError);
		callback(visitorError);
	}

	streamTransform.push(fileMetadata);
	callback();
}
