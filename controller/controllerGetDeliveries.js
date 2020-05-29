"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
/**
 * @api {POST} /api/0.5/delivery Нахождение зоны
 * @apiName Delivery
 * @apiGroup Order
 * @apiDescription Нахождение зоны, в которую входит адресс
 *
 * @apiParam {String} streetId Улица доставки
 * @apiParam {Integer} home Дом доставки
 *
 * @apiSuccess {String[]} Array Список описаний условий, что принадлежат этой зоне
 *
 *  @apiError (500) {JSON} ServerError Ошибка сервера
 *  @apiError {String} BadRequest Ошибка входных данныз
 *  @apiError {String} NotFound Не найдено в базе
 */
var Street_1 = require("@webresto/core/models/Street");
var Zone_1 = require("@webresto/core/models/Zone");
function default_1(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var streetId, home, street, zone_1, conditions, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    streetId = req.param('streetId');
                    home = req.param('home');
                    if (!streetId) {
                        return [2 /*return*/, res.badRequest('streetId is required')];
                    }
                    if (!home) {
                        return [2 /*return*/, res.badRequest('home is required')];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, Street_1["default"].findOne(streetId)];
                case 2:
                    street = _a.sent();
                    if (!street) {
                        return [2 /*return*/, res.json(404, 'street not found')];
                    }
                    return [4 /*yield*/, Zone_1["default"].getDeliveryCoast(street.name, home)];
                case 3:
                    zone_1 = _a.sent();
                    if (!zone_1) {
                        return [2 /*return*/, res.json(404, 'address not includes in enabled zones')];
                    }
                    return [4 /*yield*/, Condition.find().populate('zones')];
                case 4:
                    conditions = _a.sent();
                    conditions = conditions.filter(function (c) { return c.zones && c.zones.filter(function (z) { return z.id === zone_1.id; }).length; });
                    conditions = conditions.sort(function (a, b) { return a.weight - b.weight; });
                    return [2 /*return*/, res.json(conditions.map(function (c) { return c.description; }))];
                case 5:
                    e_1 = _a.sent();
                    return [2 /*return*/, res.serverError(e_1)];
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports["default"] = default_1;
;
