"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function responseWithErrorMessage(res, message) {
    return res.json({
        message: {
            type: 'error',
            title: 'Error',
            body: message
        }
    });
}
exports.default = responseWithErrorMessage;
