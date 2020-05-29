"use strict";
///<reference path="../../native-check/models/Street.ts"/>
///<reference path="../../native-check/models/Zone.ts"/>
///<reference path="../../core/models/Condition.ts"/>
Object.defineProperty(exports, "__esModule", { value: true });
const responseWithErrorMessage_1 = require("@webresto/api/lib/responseWithErrorMessage");
async function default_1(req, res) {
    const streetId = req.param('streetId');
    const home = req.param('home');
    if (!streetId) {
        return res.badRequest('streetId is required');
    }
    if (!home) {
        return res.badRequest('home is required');
    }
    try {
        const street = await Street.findOne(streetId);
        if (!street) {
            return responseWithErrorMessage_1.default(res, 'street not found');
        }
        const zone = await Zone.getDeliveryCoast(street.name, home);
        if (!zone) {
            const error = await SystemInfo.use("notInZone");
            return responseWithErrorMessage_1.default(res, error);
        }
        // sails.log.info(zone);
        let conditions = await Condition.find().populate('zones');
        conditions = conditions.filter(c => c.zones && c.zones.filter(z => z.id === zone.id).length);
        conditions = conditions.sort((a, b) => a.weight - b.weight);
        return res.json(conditions.map(c => c.description));
    }
    catch (e) {
        return res.serverError(e);
    }
}
exports.default = default_1;
;
