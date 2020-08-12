"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hookTools_1 = require("@webresto/core/lib/hookTools");
const afterHook_1 = require("@webresto/api/lib/afterHook");
function ToInitialize() {
    /**
     * List of hooks that required
     */
    const requiredHooks = [
        'webresto-core'
    ];
    return function initialize(cb) {
        /**
         * CONFIG
         */
        if (!hookTools_1.default.checkConfig('restoapi')) {
            return cb();
        }
        /**
         * AFTER OTHERS HOOKS
         */
        hookTools_1.default.waitForHooks('api', requiredHooks, afterHook_1.default);
        return cb();
    };
}
exports.default = ToInitialize;
;
