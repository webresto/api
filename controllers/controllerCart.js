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
Object.defineProperty(exports, "__esModule", { value: true });
const responseWithErrorMessage_1 = require("@webresto/api/lib/responseWithErrorMessage");
const uuid = require("uuid");
const checkExpression_1 = require("@webresto/core/lib/checkExpression");
exports.default = {
    add: async function (req, res) {
        if (req.method === 'PUT') {
            let data = req.body;
            const cartId = data.cartId;
            const amount = data.amount || 1;
            const modifiers = data.modifiers;
            const comment = data.comment;
            const dishId = data.dishId;
            if (!dishId)
                return res.badRequest('dishId is required');
            try {
                let cart;
                if (cartId)
                    cart = await Cart.findOne(cartId).populate('dishes');
                if (!cart)
                    cart = await Cart.create({ id: uuid() });
                const dish = await Dish.findOne({ id: dishId });
                if (!dish) {
                    return responseWithErrorMessage_1.default(res, `dish with id ${dishId} not found`);
                }
                try {
                    const l1 = cart.dishes.length || 0;
                    if (checkExpression_1.default(dish) === 'promo') {
                        return responseWithErrorMessage_1.default(res, `"${dish.name}" является акционным и не может быть добавлено пользователем`);
                    }
                    await cart.addDish(dish, amount, modifiers, comment, 'user');
                    cart = await Cart.returnFullCart(cart);
                    const added = l1 !== cart.dishes.length;
                    const message = added ? "Блюдо успешно добавлено в корзину" : "Не удалось добавить блюдо";
                    const type = added ? "info" : "error";
                    return res.json({
                        cart: cart,
                        message: {
                            type: type,
                            title: dish.name,
                            body: message
                        }
                    });
                }
                catch (err) {
                    if (err.code === 1) {
                        return responseWithErrorMessage_1.default(res, `"${dish.name}" доступно для заказа: ${dish.balance}`);
                    }
                }
            }
            catch (e) {
                return res.serverError(e);
            }
        }
        else {
            return res.notFound("Method not found: " + req.method);
        }
    },
    remove: async function (req, res) {
        let data = req.body;
        const cartId = data.cartId;
        const amount = data.amount || 1;
        const dishId = data.dishId;
        if (!cartId)
            return res.badRequest('cartId is required');
        if (!dishId)
            return res.badRequest('dishId is required');
        try {
            let cart = await Cart.findOne(cartId);
            if (!cart) {
                return responseWithErrorMessage_1.default(res, `Cart with id ${cartId} not found`);
            }
            const cartDish = await CartDish.findOne(dishId);
            try {
                await cart.removeDish(cartDish, amount);
            }
            catch (e) {
                if (e.code === 1) {
                    return responseWithErrorMessage_1.default(res, e.body);
                }
            }
            cart = await Cart.returnFullCart(cart);
            return res.json({
                cart: cart,
                message: {
                    type: "info",
                    title: "ok",
                    body: ""
                }
            });
        }
        catch (e) {
            return res.serverError(e);
        }
    },
    get: async function (req, res) {
        const cartId = req.param('cartId');
        if (!cartId)
            return res.badRequest('cartId is required');
        let cart = await Cart.findOne(cartId);
        if (!cart) {
            cart = await Cart.create({ id: uuid() });
            //return responseWithErrorMessage(res, `Cart with id ${cartId} not found`);
        }
        cart = await Cart.returnFullCart(cart);
        return res.json({
            cart: cart,
            message: {
                type: "info",
                title: "ok",
                body: ""
            }
        });
    },
    set: async function (req, res) {
        const data = req.body;
        const cartId = data.cartId;
        const amount = data.amount;
        const dishId = data.dishId;
        if (!dishId)
            return res.badRequest('dishId is required');
        try {
            let cart = await Cart.findOne(cartId);
            let dish = await CartDish.findOne(dishId).populate('dish');
            if (!dish) {
                return responseWithErrorMessage_1.default(res, `CartDish with id ${dishId} not found`);
            }
            if (!dish.dish) {
                return responseWithErrorMessage_1.default(res, `Dish in CartDish with id ${dishId} not found`);
            }
            await cart.setCount(dish, amount);
            cart = await Cart.returnFullCart(cart);
            return res.json({
                cart: cart,
                message: {
                    type: "info",
                    title: "ok",
                    body: ""
                }
            });
        }
        catch (e) {
            if (e.code === 2) {
                return responseWithErrorMessage_1.default(res, e.body);
            }
            return res.serverError(e);
        }
    },
    setComment: async function (req, res) {
        const data = req.body;
        const cartId = data.cartId;
        const comment = data.comment || "";
        const dishId = data.dishId;
        if (!dishId) {
            return res.badRequest('dishId is required');
        }
        try {
            let cart = await Cart.findOne(cartId);
            const dish = await CartDish.findOne({ id: dishId }).populate('dish');
            if (!dish) {
                return responseWithErrorMessage_1.default(res, `Dish with id ${dishId} not found`);
            }
            await cart.setComment(dish, comment);
            cart = await Cart.returnFullCart(cart);
            return res.json({
                cart: cart,
                message: {
                    type: "info",
                    title: "ok",
                    body: ""
                }
            });
        }
        catch (err) {
            if (err.code === 1) {
                return responseWithErrorMessage_1.default(res, err.body);
            }
            return res.serverError(err);
        }
    },
};
