"use strict";
/**
 * @apiDefine CartResponse
 *
 * @apiSuccess {JSON} message Сообщение от сервера
 * @apiSuccess {[Cart](#api-Models-ApiCart)} cart Cart model
 * @apiSuccessExample {JSON} Message:
 *  {
 *    "type": "info",
 *    "title": "ok",
 *    "body": ""
 *  }
 *
 * @apiErrorExample {JSON} BadRequest 400
 *  {
      "type": "error",
      "title": "bad request",
      "body": "dishId is required"
 *  }
 * @apiErrorExample {JSON} ServerError 500
 *  {
      "type": "error",
      "title": "server error",
      "body": {
        "invalidAttributes": {
          "...": "..."
        },
        "model": "User",
        "_e": { },
        "rawStack": "...",
        "reason": "...",
        "code": "E_VALIDATION",
        "status": 500,
        "details": "...",
        "message": "...",
        "stack": "..."
      }
 *  }
 * @apiErrorExample {JSON} NotFound 404
 *  {
      "type": "error",
      "title": "not found",
      "body": "Method not found: GET"
 *  }
 */
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
var uuid = require('uuid/v4');
exports["default"] = {
    add: function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var data, cartId, amount, modifiers, comment, dishId, cart, dish, l1, added, message, type, err_1, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(req.method === 'PUT')) return [3 /*break*/, 14];
                        data = req.body;
                        cartId = data.cartId;
                        amount = data.amount || 1;
                        modifiers = data.modifiers;
                        comment = data.comment;
                        dishId = data.dishId;
                        if (!dishId)
                            return [2 /*return*/, res.badRequest('dishId is required')];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 12, , 13]);
                        cart = void 0;
                        if (!cartId) return [3 /*break*/, 3];
                        return [4 /*yield*/, Cart.findOne(cartId).populate('dishes')];
                    case 2:
                        cart = _a.sent();
                        _a.label = 3;
                    case 3:
                        if (!!cart) return [3 /*break*/, 5];
                        return [4 /*yield*/, Cart.create({
                                id: uuid()
                            })];
                    case 4:
                        cart = _a.sent();
                        _a.label = 5;
                    case 5: return [4 /*yield*/, Dish.findOne({ id: dishId })];
                    case 6:
                        dish = _a.sent();
                        if (!dish)
                            return [2 /*return*/, res.notFound("dish with id " + dishId)];
                        _a.label = 7;
                    case 7:
                        _a.trys.push([7, 10, , 11]);
                        l1 = cart.dishes.length || 0;
                        return [4 /*yield*/, cart.addDish(dish, amount, modifiers, comment, 'user')];
                    case 8:
                        _a.sent();
                        return [4 /*yield*/, Cart.returnFullCart(cart)];
                    case 9:
                        cart = _a.sent();
                        added = l1 !== cart.dishes.length;
                        message = added ? "Блюдо успешно добавлено в корзину" : "Не удалось добавить блюдо";
                        type = added ? "info" : "error";
                        return [2 /*return*/, res.json({
                                cart: cart,
                                message: {
                                    type: type,
                                    title: dish.name,
                                    body: message
                                }
                            })];
                    case 10:
                        err_1 = _a.sent();
                        if (err_1.error === 'not found')
                            return [2 /*return*/, res.notFound("in create cart")];
                        if (err_1.code === 1) {
                            return [2 /*return*/, res.json({
                                    message: {
                                        type: 'error',
                                        title: '',
                                        body: '"' + dish.name + '" доступно для заказа: ' + dish.balance
                                    }
                                })];
                        }
                        return [2 /*return*/, res.serverError(err_1)];
                    case 11: return [3 /*break*/, 13];
                    case 12:
                        e_1 = _a.sent();
                        return [2 /*return*/, res.serverError(e_1)];
                    case 13: return [3 /*break*/, 15];
                    case 14: return [2 /*return*/, res.notFound("Method not found: " + req.method)];
                    case 15: return [2 /*return*/];
                }
            });
        });
    },
    remove: function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var data, cartId, amount, dishId, cart, cartDish, e_2, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        data = req.body;
                        cartId = data.cartId;
                        amount = data.amount || 1;
                        dishId = data.dishId;
                        if (!cartId)
                            return [2 /*return*/, res.badRequest('cartId is required')];
                        if (!dishId)
                            return [2 /*return*/, res.badRequest('dishId is required')];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 9, , 10]);
                        return [4 /*yield*/, Cart.findOne(cartId)];
                    case 2:
                        cart = _a.sent();
                        if (!cart)
                            return [2 /*return*/, res.notFound()];
                        return [4 /*yield*/, CartDish.findOne(dishId)];
                    case 3:
                        cartDish = _a.sent();
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, cart.removeDish(cartDish, amount)];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        e_2 = _a.sent();
                        if (e_2.code === 1) {
                            return [2 /*return*/, res.notFound()];
                        }
                        return [3 /*break*/, 7];
                    case 7: return [4 /*yield*/, Cart.returnFullCart(cart)];
                    case 8:
                        cart = _a.sent();
                        return [2 /*return*/, res.json({
                                cart: cart,
                                message: {
                                    type: "info",
                                    title: "ok",
                                    body: ""
                                }
                            })];
                    case 9:
                        e_3 = _a.sent();
                        return [2 /*return*/, res.serverError(e_3)];
                    case 10: return [2 /*return*/];
                }
            });
        });
    },
    get: function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var cartId, cart;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cartId = req.param('cartId');
                        if (!cartId)
                            return [2 /*return*/, res.badRequest('cartId is required')];
                        return [4 /*yield*/, Cart.findOne(cartId)];
                    case 1:
                        cart = _a.sent();
                        if (!cart)
                            return [2 /*return*/, res.notFound("cart")];
                        return [4 /*yield*/, Cart.returnFullCart(cart)];
                    case 2:
                        cart = _a.sent();
                        return [2 /*return*/, res.json({
                                cart: cart,
                                message: {
                                    type: "info",
                                    title: "ok",
                                    body: ""
                                }
                            })];
                }
            });
        });
    },
    set: function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var data, cartId, amount, dishId, cart, dish, e_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        data = req.body;
                        cartId = data.cartId;
                        amount = data.amount;
                        dishId = data.dishId;
                        if (!dishId)
                            return [2 /*return*/, res.badRequest('dishId is required')];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        return [4 /*yield*/, Cart.findOne(cartId)];
                    case 2:
                        cart = _a.sent();
                        return [4 /*yield*/, CartDish.findOne(dishId).populate('dish')];
                    case 3:
                        dish = _a.sent();
                        if (!dish)
                            return [2 /*return*/, res.notFound("dish")];
                        if (!dish.dish)
                            return [2 /*return*/, res.notFound("dish.dish")];
                        return [4 /*yield*/, cart.setCount(dish, amount)];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, Cart.returnFullCart(cart)];
                    case 5:
                        cart = _a.sent();
                        return [2 /*return*/, res.json({
                                cart: cart,
                                message: {
                                    type: "info",
                                    title: "ok",
                                    body: ""
                                }
                            })];
                    case 6:
                        e_4 = _a.sent();
                        if (e_4.code === 2)
                            return [2 /*return*/, res.notFound(e_4)];
                        return [2 /*return*/, res.serverError(e_4)];
                    case 7: return [2 /*return*/];
                }
            });
        });
    },
    setComment: function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var data, cartId, comment, dishId, cart, dish, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        data = req.body;
                        cartId = data.cartId;
                        comment = data.comment || "";
                        dishId = data.dishId;
                        if (!dishId)
                            return [2 /*return*/, res.badRequest('dishId is required')];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, Cart.findOne(cartId)];
                    case 2:
                        cart = _a.sent();
                        return [4 /*yield*/, CartDish.findOne({ id: dishId }).populate('dish')];
                    case 3:
                        dish = _a.sent();
                        if (!dish)
                            return [2 /*return*/, res.notFound("dish")];
                        return [4 /*yield*/, cart.setComment(dish, comment)];
                    case 4:
                        cart = _a.sent();
                        return [2 /*return*/, res.json({
                                cart: cart,
                                message: {
                                    type: "info",
                                    title: "ok",
                                    body: ""
                                }
                            })];
                    case 5:
                        err_2 = _a.sent();
                        if (err_2.code === 1)
                            return [2 /*return*/, res.notFound(err_2)];
                        return [2 /*return*/, res.serverError(err_2)];
                    case 6: return [2 /*return*/];
                }
            });
        });
    }
};
