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

/**
 * @api {put} /api/0.5/cart/add Добавить блюдо в корзину
 * @apiName AddDish
 * @apiGroup Cart
 * @apiDescription Добавление блюда в корзину с задаными модификаторами
 *
 *
 * @apiParam {String} [cartId] ID корзины в которую добавляют блюдо. Если не задано, то создаётся новая корзина
 * @apiParam {Integer} [amount=1] Количество порций
 * @apiParam {JSON} [modifiers] JSON модификаторов для блюда
 * @apiParam {String} dishId ID блюда, которое добавляется в корзину (параметр dishId - поле id из модели [CartDish](#api-Models-ApiCartdish))
 * @apiParam {String} [comment] Комментарий к блюду
 * @apiParamExample {JSON} Modifiers example:
 *  {
      "id": "string (required)",
      "amount": "integer (required)",
      "groupId": "string (required for group modifiers)"
 *  }
 *
 * @apiUse CartResponse
 */

/**
 * @api {PUT} /api/0.5/cart/remove Удаление блюда из корзины
 * @apiName RemoveDish
 * @apiGroup Cart
 * @apiDescription Удаление блюда из заданой корзины. По сути уменьшение количества.
 *
 * @apiParam {String} cartId ID корзины из которой удаляется блюдо
 * @apiParam {Integer} [amount=1] количество удаляемых порций
 * @apiParam {String} dishId Блюдо, которому меняется количество порций (параметр dishId - поле id из модели [CartDish](#api-Models-ApiCartdish))
 *
 * @apiUse CartResponse
 */

/**
 * @api {POST} /api/0.5/cart/set Установить кол-во порций
 * @apiName SetCount
 * @apiGroup Cart
 * @apiDescription Установка количества порций для блюда в корзине. Если меньше нуля или ноль, то блюдо удаляется из корзины
 *
 * @apiParam {String} dishId ID блюда, которому меняет количество порций
 * @apiParam {String} [cartId] ID корзины в которую добавляют блюдо. Если не задано, то создаётся новая корзина
 * @apiParam {Integer} [amount=1] Установка количества порций
 *
 * @apiUse CartResponse
 */

/**
 * @api {GET} /api/0.5/cart Получение корзины
 * @apiName GetCart
 * @apiGroup Cart
 * @apiDescription Получение объкта корзины по её ID
 *
 * @apiParam {String} cartId ID корзины для получения
 *
 * @apiUse CartResponse
 */

/**
 * @api {POST} /api/0.5/cart/setcomment Поменять комментарий
 * @apiName SetComment
 * @apiGroup Cart
 * @apiDescription Установка комментария для блюда в корзине
 *
 * @apiParam {String} dishId ID блюда, которому меняет комментарий
 * @apiParam {String} [cartId] ID корзины в которую меняется блюдо. Если не задано, то создаётся новая корзина
 * @apiParam {String} [comment=''] Комментарий
 *
 * @apiUse CartResponse
 */

import Cart from "@webresto/core/models/Cart";
import CartDish from "@webresto/core/models/CartDish";
import {CartAddData, CartRemoveData, CartSetData} from "@webresto/core/helpers/CartHelper";

const uuid = require('uuid/v4');

export default {
  add: async function (req: ReqType, res: ResType) {
    if (req.method === 'PUT') {
      let data = <CartAddData>req.body;
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
          cart = await Cart.create({
            id: uuid()
          });
        const dish = await Dish.findOne({id: dishId});
        if (!dish) return res.notFound("dish with id " + dishId);
        try {
          const l1 = cart.dishes.length || 0;

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
        } catch (err) {
          if (err.error === 'not found')
            return res.notFound("in create cart");
          if (err.code === 1) {
            return res.json({
              message: {
                type: 'error',
                title: '',
                body: '"' + dish.name + '" доступно для заказа: ' + dish.balance
              }
            });
          }
          return res.serverError(err);
        }
      } catch (e) {
        return res.serverError(e);
      }
    } else {
      return res.notFound("Method not found: " + req.method);
    }
  },
  remove: async function (req: ReqType, res: ResType) {
    let data = <CartRemoveData>req.body;
    const cartId = data.cartId;
    const amount = data.amount || 1;
    const dishId = data.dishId;

    if (!cartId)
      return res.badRequest('cartId is required');

    if (!dishId)
      return res.badRequest('dishId is required');

    try {
      let cart = await Cart.findOne(cartId);
      if (!cart) return res.notFound();

      const cartDish = await CartDish.findOne(dishId);

      try {
        await cart.removeDish(cartDish, amount);
      } catch (e) {
        if (e.code === 1) {
          return res.notFound();
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
    } catch (e) {
      return res.serverError(e);
    }
  },
  get: async function (req: ReqType, res: ResType) {
    const cartId = req.param('cartId');
    if (!cartId)
      return res.badRequest('cartId is required');

    let cart = await Cart.findOne(cartId);
    if (!cart) return res.notFound("cart");

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
  set: async function (req: ReqType, res: ResType) {
    const data = <CartSetData>req.body;
    const cartId = data.cartId;
    const amount = data.amount;
    const dishId = data.dishId;
    if (!dishId)
      return res.badRequest('dishId is required');

    try {
      let cart = await Cart.findOne(cartId);
      let dish = await CartDish.findOne(dishId).populate('dish');
      if (!dish) return res.notFound("dish");
      if (!dish.dish) return res.notFound("dish.dish");

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
    } catch (e) {
      if (e.code === 2)
        return res.notFound(e);
      return res.serverError(e);
    }
  },

  setComment: async function (req: ReqType, res: ResType) {
    const data = req.body;
    const cartId = data.cartId;
    const comment = data.comment || "";
    const dishId = data.dishId;
    if (!dishId)
      return res.badRequest('dishId is required');

    try {
      let cart = await Cart.findOne(cartId);
      const dish = await CartDish.findOne({id: dishId}).populate('dish');
      if (!dish) return res.notFound("dish");

      cart = await cart.setComment(dish, comment);

      return res.json({
        cart: cart,
        message: {
          type: "info",
          title: "ok",
          body: ""
        }
      });
    } catch (err) {
      if (err.code === 1)
        return res.notFound(err);
      return res.serverError(err);
    }
  },
};
