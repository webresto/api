"use strict";
/**
 * @api {POST} /api/0.5/order Создание заказа
 * @apiName CreateOrder
 * @apiGroup Order
 * @apiDescription Позволяет создать заказ, который будет создан на rmsAdapter
 *
 * @apiParam {String} cartId ID корзины
 * @apiParam {String} [comment] Комментарий к заказу
 * @apiParam {Integer} [personsCount=1] Количество персон
 * @apiParam {String} [customData] Специальные данные
 * @apiParam {Boolean} selfDelivery Тип доставки
 * @apiParam {JSON} address Адресс доставки
 * @apiParam {JSON} customer Информация о заказчике
 *
 * @apiParamExample {JSON} Minimum order:
 *  {
      "cartId": "string",
      "address": {
        "streetId": "string",
        "home": "number",
      },
      "customer": {
        "phone": "string",
        "name": "string"
      }
 *  }
 *
 * @apiParamExample {JSON} Full order:
 *  {
      "cartId": "string",
      "comment": "string",
      "selfDelivery": false,
      "address": {
        "city": "string",
        "streetId": "string, required",
        "home": "number, required",
        "housing": "string",
        "index": "string",
        "entrance": "string",
        "floor": "string",
        "apartment": "string",
        "doorphone": "string"
      },
      "customer": {
        "phone": "string, required",
        "mail": "string",
        "name": "string, required"
      },
      "personsCount": "number, default 1",
      "customData": "string"
 *  }
 *
 * @apiSuccess {[Cart](#api-Models-ApiCart)} cart Новая пустая корзина
 * @apiSuccess {JSON} message Сообщение
 *
 * @apiSuccessExample {JSON} Message:
 *  {
      type: 'info',
      title: 'ok',
      body: 'success'
 *  }
 *
 * @apiErrorExample {JSON} BadRequest 400
 *  {
      message: {
        type: 'error',
        title: 'Ошибка валидации',
        body: 'Неверный формат номера!'
 *  }
 * @apiErrorExample {JSON} NotFound 400
 *  {
      message: {
        type: 'error',
        title: 'not found',
        body: 'Cart with id 0ef473a3-ef9d-746f-d5a5-1a578ad10035 not found'
      }
 *  }
 * @apiErrorExample {JSON} Gone 410
 *  {
      message: {
        type: 'error',
        title: 'already is complete',
        body: 'Cart with id 0ef473a3-ef9d-746f-d5a5-1a578ad10035 is completed'
      }
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
var getEmitter_1 = require("@webresto/core/lib/getEmitter");
var uuid = require("uuid");
var conf = sails.config.restocore;
function default_1(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var data, isSelfService, cart, success, newCart, _a, _b, _c, _d, _e, _f, e_1;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    data = req.body;
                    if (!data)
                        return [2 /*return*/, res.badRequest({
                                message: {
                                    type: 'error',
                                    title: 'body is required',
                                    body: 'Body of request is required'
                                }
                            })];
                    return [4 /*yield*/, getEmitter_1["default"]().emit('core-order-before-order', data)];
                case 1:
                    _g.sent();
                    if (!data.customer) {
                        return [2 /*return*/, res.badRequest({
                                message: {
                                    type: 'error',
                                    title: 'customer is required',
                                    body: 'Необходимо заполнить данные о заказчике'
                                }
                            })];
                    }
                    if (!data.cartId)
                        return [2 /*return*/, res.badRequest({
                                message: {
                                    type: 'error',
                                    title: 'cartId is required',
                                    body: 'cartId is required in body of request'
                                }
                            })];
                    isSelfService = data.selfDelivery;
                    _g.label = 2;
                case 2:
                    _g.trys.push([2, 10, , 12]);
                    return [4 /*yield*/, Cart.findOne({ id: data.cartId })];
                case 3:
                    cart = _g.sent();
                    if (!cart) {
                        return [2 /*return*/, res.json(404, {
                                message: {
                                    type: 'error',
                                    title: 'not found',
                                    body: 'Cart with id ' + data.cartId + ' not found'
                                }
                            })];
                    }
                    if (data.address) {
                        data.address.city = conf.city;
                    }
                    return [4 /*yield*/, cart.order(data.customer, isSelfService, data.address)];
                case 4:
                    success = _g.sent();
                    return [4 /*yield*/, Cart.create({ id: uuid() })];
                case 5:
                    newCart = _g.sent();
                    if (!(success == 0)) return [3 /*break*/, 7];
                    _b = (_a = res).json;
                    _c = {};
                    return [4 /*yield*/, Cart.returnFullCart(newCart)];
                case 6: return [2 /*return*/, _b.apply(_a, [(_c.cart = _g.sent(),
                            _c.message = {
                                type: 'info',
                                title: 'Заказ принят успешно',
                                body: ''
                            },
                            _c)])];
                case 7:
                    _e = (_d = res).json;
                    _f = {};
                    return [4 /*yield*/, Cart.returnFullCart(cart)];
                case 8: return [2 /*return*/, _e.apply(_d, [(_f.cart = _g.sent(),
                            _f.message = {
                                type: 'error',
                                title: 'ok',
                                body: conf.orderFail
                            },
                            _f)])];
                case 9: return [3 /*break*/, 12];
                case 10:
                    e_1 = _g.sent();
                    return [4 /*yield*/, getEmitter_1["default"]().emit('core-order-create-order-error', e_1)];
                case 11:
                    _g.sent();
                    return [2 /*return*/, res.serverError(e_1)];
                case 12: return [2 /*return*/];
            }
        });
    });
}
exports["default"] = default_1;
;
