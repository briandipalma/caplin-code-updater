"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _utilitiesUtilities = require("./utilities/utilities");

exports.visitAST = _utilitiesUtilities.visitAST;
exports.visitASTAndPushToNextStream = _utilitiesUtilities.visitASTAndPushToNextStream;
exports.updateModuleClassesToUseTopiarist = require("./transforms/caplin-to-topiarist-classes").updateModuleClassesToUseTopiarist;