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
 * @apiParam {String} dishId Блюдо, которому меняется количество порций (параметр dishId - поле id из модели [CartDish](#api-Models-ApiCartdish) или если выбран режим стэк то это ID из модели [Dish](#api-Models-ApiDish) )
 * @apiParam {Boolean} stack Признак того что блюда удаляются из корзины в режиме стека
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
import Modifier from "@webresto/core/modelsHelp/Modifier";
import responseWithErrorMessage from "@webresto/api/lib/responseWithErrorMessage";
import uuid = require("uuid");
import checkExpression from "@webresto/core/lib/checkExpression";

export default {
  add: async function (req: ReqType, res: ResType) {
    if (req.method === 'PUT') {
      let data = <CartAddData>req.body;
      const cartId = data.cartId;
      const amount = data.amount || 1;
      const modifiers = data.modifiers;
      const comment = data.comment;
      const dishId = data.dishId;
      const replace = data.replace || false;
      const cartDishId = data.id || undefined;

      if (!dishId)
        return res.badRequest('dishId is required');

      try {
        let cart;
        if (cartId)
          cart = await Cart.findOne(cartId).populate('dishes');

        if (!cart || cart.paid || cart.state === 'ORDER' )
          cart = await Cart.create();

        const dish = await Dish.findOne({id: dishId});
        
        if (!dish) {
          return responseWithErrorMessage(res, `dish with id ${dishId} not found`);
        }

        try {
          const l1 = cart.dishes.length || 0;

          if (checkExpression(dish) === 'promo') {
            return responseWithErrorMessage(res, `"${dish.name}" является акционным и не может быть добавлено пользователем`)

          }

          await cart.addDish(dish, amount, modifiers, comment, 'user', replace, cartDishId);

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
          if (err.code === 1) {
            return responseWithErrorMessage(res, `"${dish.name}" доступно для заказа: ${dish.balance}`)
          }
        }
      } catch (e) {
        return res.serverError(e);
      }
    } else {
      return res.notFound("Method not found: " + req.method);
    }
  },

  change: async function (req: ReqType, res: ResType) {
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

        if (!cart || cart.paid || cart.state === 'ORDER' )
          cart = await Cart.create();
        const dish = await Dish.findOne({id: dishId});
        if (!dish) {
          return responseWithErrorMessage(res, `dish with id ${dishId} not found`);
        }
        try {
          const l1 = cart.dishes.length || 0;

          if (checkExpression(dish) === 'promo') {
            return responseWithErrorMessage(res, `"${dish.name}" является акционным и не может быть добавлено пользователем`)

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
        } catch (err) {
          if (err.code === 1) {
            return responseWithErrorMessage(res, `"${dish.name}" доступно для заказа: ${dish.balance}`)
          }
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
    const stack = data.stack || false;

    if (!cartId)
      return res.badRequest('cartId is required');

    if (!dishId)
      return res.badRequest('dishId is required');

    try {
      let cart = await Cart.findOne(cartId);
      if (cart.paid || cart.state === 'ORDER' ){
        return responseWithErrorMessage(res, `Cart with id ${cartId} was ordered`);
      }
      if (!cart) {
        return responseWithErrorMessage(res, `Cart with id ${cartId} not found`);
      }

      const cartDish = await CartDish.findOne(dishId);

      try {
        await cart.removeDish(cartDish, amount, stack);
      } catch (e) {
        if (e.code === 1) {
          return responseWithErrorMessage(res, e.body);
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
    if (!cart) {
      //@ts-ignore
      cart = await Cart.create();
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
      if (!dish) {
        return responseWithErrorMessage(res, `CartDish with id ${dishId} not found`);
      }
      if (!dish.dish) {
        return responseWithErrorMessage(res, `Dish in CartDish with id ${dishId} not found`);
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
    } catch (e) {
      if (e.code === 2) {
        return responseWithErrorMessage(res, e.body)
      }
      return res.serverError(e);
    }
  },

  setComment: async function (req: ReqType, res: ResType) {
    const data = req.body;
    const cartId = data.cartId;
    const comment = data.comment || "";
    const dishId = data.dishId;
    if (!dishId) {
      return res.badRequest('dishId is required');
    }

    try {
      let cart = await Cart.findOne(cartId);
      const dish = await CartDish.findOne({id: dishId}).populate('dish');
      if (!dish) {
        return responseWithErrorMessage(res, `Dish with id ${dishId} not found`);
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
    } catch (err) {
      if (err.code === 1) {
        return responseWithErrorMessage(res, err.body);
      }
      return res.serverError(err);
    }
  },
};

interface CartAddData {
  cartId?: string,
  amount?: number,
  modifiers?: Modifier[],
  comment?: string,
  dishId: string,
  id?
  replace?: boolean
}

interface CartRemoveData {
  cartId: string,
  amount?: number,
  dishId: string,
  stack?: boolean
}

interface CartSetData {
  cartId: string,
  amount: number,
  dishId: string
}
