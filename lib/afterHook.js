"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hookTools_1 = require("@webresto/core/lib/hookTools");
const controllerApi_1 = require("@webresto/api/controllers/controllerApi");
const controllerCart_1 = require("@webresto/api/controllers/controllerCart");
const controllerMenu_1 = require("@webresto/api/controllers/controllerMenu");
const controllerOrder_1 = require("@webresto/api/controllers/controllerOrder");
const controllerSystem_1 = require("@webresto/api/controllers/controllerSystem");
const controllerGetDeliveries_1 = require("@webresto/api/controllers/controllerGetDeliveries");
const controllerCheck_1 = require("@webresto/api/controllers/controllerCheck");
const getConfig_1 = require("@webresto/api/lib/getConfig");
async function default_1() {
    try {
        /**
         * POLICIES
         */
        hookTools_1.default.loadPolicies(__dirname + '/../policies');
        /**
         *  ROUTES
         */
        const baseRoute = (await getConfig_1.default('prefix')) || "/api/0.5/";
        hookTools_1.default.bindRouter(baseRoute + 'api/:method', controllerApi_1.default);
        hookTools_1.default.bindRouter(baseRoute + 'cart/add', controllerCart_1.default.add, 'PUT');
        hookTools_1.default.bindRouter(baseRoute + 'cart/remove', controllerCart_1.default.remove, 'PUT');
        hookTools_1.default.bindRouter(baseRoute + 'cart/set', controllerCart_1.default.set, 'POST');
        hookTools_1.default.bindRouter(baseRoute + 'cart/setcomment', controllerCart_1.default.setComment, 'POST');
        hookTools_1.default.bindRouter(baseRoute + 'cart', controllerCart_1.default.get, 'GET');
        hookTools_1.default.bindRouter(baseRoute + 'menu', controllerMenu_1.default);
        hookTools_1.default.bindRouter(baseRoute + 'order', controllerOrder_1.default, 'POST');
        hookTools_1.default.bindRouter(baseRoute + 'system', controllerSystem_1.default);
        hookTools_1.default.bindRouter(baseRoute + 'delivery', controllerGetDeliveries_1.default);
        hookTools_1.default.bindRouter(baseRoute + 'check', controllerCheck_1.default, 'POST');
    }
    catch (e) {
        sails.log.error('api > afterHook > error1', e);
    }
}
exports.default = default_1;
