/**
 * This transform adds requires to a module based on it finding certain identifiers in the module.
 * It is meant to allow discoverability of global references to libraries in modules and conversion to module imports.
 *
 * @param {Map<Iterable<string>, string>} libraryIdentifiersToRequire - The identifiers that should be required.
 */
export function addRequiresForLibraries(libraryIdentifiersToRequire) {
//	return through2.obj(function(fileMetadata, encoding, callback) {
	addRequireForGlobalIdentifierVisitor.initialize(libraryIdentifiersToRequire, fileMetadata.ast.program.body);
	transformASTAndPushToNextStream(fileMetadata, addRequireForGlobalIdentifierVisitor, this, callback);
//	});
}
