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
var actions_1 = require("@webresto/core/lib/actions");
var Street_1 = require("@webresto/core/models/Street");
function default_1(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var address, cartId, self, cart1, cart, street, cart1_1, conds, cond, msg, cart2, e_1, cart_1, cart1_2, e_2, e_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    address = req.param('address');
                    cartId = req.param('cartId');
                    self = req.param('selfDelivery');
                    /**
                     * VALIDATION
                     */
                    if (!cartId) {
                        return [2 /*return*/, res.badRequest('cartId is required')];
                    }
                    if (typeof cartId !== 'string') {
                        return [2 /*return*/, res.badRequest('cartId must be a string')];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 24, , 25]);
                    return [4 /*yield*/, Cart.findOne(cartId)];
                case 2:
                    cart1 = _a.sent();
                    if (!cart1) {
                        return [2 /*return*/, res.json(404, {
                                message: {
                                    type: 'error',
                                    title: 'not found',
                                    body: 'Cart with id ' + cartId + ' not found'
                                }
                            })];
                    }
                    return [4 /*yield*/, Cart.returnFullCart(cart1)];
                case 3:
                    cart = _a.sent();
                    if (!!self) return [3 /*break*/, 19];
                    /**
                     * VALIDATION
                     */
                    if (!address) {
                        return [2 /*return*/, res.badRequest('address is required')];
                    }
                    if (!address.streetId) {
                        return [2 /*return*/, res.badRequest('address.streetId is required')];
                    }
                    if (!address.home) {
                        return [2 /*return*/, res.badRequest('address.home is required')];
                    }
                    return [4 /*yield*/, Street_1["default"].findOne(address.streetId)];
                case 4:
                    street = _a.sent();
                    if (!street) {
                        return [2 /*return*/, res.json(404, "street not found")];
                    }
                    address.street = street;
                    cart.address = address;
                    return [4 /*yield*/, Condition.checkConditionsExists(cart)];
                case 5:
                    if (!!(_a.sent())) return [3 /*break*/, 8];
                    return [4 /*yield*/, actions_1["default"].delivery({ deliveryCost: 0, cartId: cartId })];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, Cart.returnFullCart(cart)];
                case 7:
                    cart1_1 = _a.sent();
                    return [2 /*return*/, res.json({
                            cart: cart1_1,
                            message: {
                                type: 'info',
                                title: 'Стоимость доставки расчитана успешно.',
                                body: ''
                            }
                        })];
                case 8: return [4 /*yield*/, cart.setSelfDelivery(false)];
                case 9:
                    _a.sent();
                    return [4 /*yield*/, actions_1["default"].reset(cartId)];
                case 10:
                    _a.sent();
                    _a.label = 11;
                case 11:
                    _a.trys.push([11, 15, , 18]);
                    return [4 /*yield*/, Condition.getConditions(street.name, address.home)];
                case 12:
                    conds = _a.sent();
                    return [4 /*yield*/, execute(conds, cart)];
                case 13:
                    cond = _a.sent();
                    msg = '';
                    if (!cond)
                        msg = sails.config.restocore.zoneDontWork || 'Доставка не может быть расчитана';
                    return [4 /*yield*/, Cart.returnFullCart(cart)];
                case 14:
                    cart2 = _a.sent();
                    return [2 /*return*/, res.json({
                            cart: cart2,
                            message: {
                                type: 'info',
                                title: cart2.message || msg || 'Стоимость доставки расчитана успешно.',
                                body: cart2.message || msg || 'Стоимость доставки расчитана успешно.'
                            }
                        })];
                case 15:
                    e_1 = _a.sent();
                    if (!(e_1.code === 404)) return [3 /*break*/, 17];
                    return [4 /*yield*/, Cart.returnFullCart(cart1)];
                case 16:
                    cart_1 = _a.sent();
                    return [2 /*return*/, res.json(404, {
                            cart: cart_1,
                            message: {
                                type: 'info',
                                title: '',
                                body: sails.config.restocore.zoneNotFound || 'Улица не входит в зону доставки.'
                            }
                        })];
                case 17: return [2 /*return*/, res.serverError(e_1)];
                case 18: return [3 /*break*/, 23];
                case 19:
                    _a.trys.push([19, 22, , 23]);
                    return [4 /*yield*/, cart.setSelfDelivery(true)];
                case 20:
                    _a.sent();
                    return [4 /*yield*/, Cart.returnFullCart(cart)];
                case 21:
                    cart1_2 = _a.sent();
                    return [2 /*return*/, res.json({
                            cart: cart1_2,
                            message: {
                                type: "info",
                                title: "ok",
                                body: ""
                            }
                        })];
                case 22:
                    e_2 = _a.sent();
                    return [2 /*return*/, res.serverError(e_2)];
                case 23: return [3 /*break*/, 25];
                case 24:
                    e_3 = _a.sent();
                    return [2 /*return*/, res.serverError(e_3)];
                case 25: return [2 /*return*/];
            }
        });
    });
}
exports["default"] = default_1;
;
function execute(conds, cart) {
    return __awaiter(this, void 0, void 0, function () {
        var cond, _i, conds_1, c;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    cond = null;
                    _i = 0, conds_1 = conds;
                    _a.label = 1;
                case 1:
                    if (!(_i < conds_1.length)) return [3 /*break*/, 5];
                    c = conds_1[_i];
                    return [4 /*yield*/, c.check(cart)];
                case 2:
                    if (!_a.sent()) return [3 /*break*/, 4];
                    cond = c;
                    return [4 /*yield*/, c.exec(cart)];
                case 3:
                    _a.sent();
                    if (c.hasReturn()) {
                        return [3 /*break*/, 5];
                    }
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 1];
                case 5: return [2 /*return*/, cond];
            }
        });
    });
}
