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

import Cart from "@webresto/core/models/Cart";
import OrderData from "@webresto/core/adapter/rms/OrderData";
import getEmitter from "@webresto/core/lib/getEmitter";
import uuid = require("uuid");

const conf = sails.config.restocore;

export default async function (req: ReqType, res: ResType) {
  let data = <OrderData>req.body;
  if (!data)
    return res.badRequest({
      message: {
        type: 'error',
        title: 'body is required',
        body: 'Body of request is required'
      }
    });

  await getEmitter().emit('core-order-before-order', data);

  if (!data.customer) {
    return res.badRequest({
      message: {
        type: 'error',
        title: 'customer is required',
        body: 'Необходимо заполнить данные о заказчике'
      }
    });
  }

  if (!data.cartId)
    return res.badRequest({
      message: {
        type: 'error',
        title: 'cartId is required',
        body: 'cartId is required in body of request'
      }
    });

  const isSelfService = data.selfDelivery;

  try {
    let cart = await Cart.findOne({id: data.cartId});
    if (!cart) {
      return res.json(404, {
        message: {
          type: 'error',
          title: 'not found',
          body: 'Cart with id ' + data.cartId + ' not found'
        }
      });
    }

    if (data.address) {
      data.address.city = conf.city;
    }

    const success = await cart.order(data.customer, isSelfService, data.address);

    const newCart = await Cart.create({id: uuid()});

    if (success == 0) {
      return res.json({
        cart: await Cart.returnFullCart(newCart),
        message: {
          type: 'info',
          title: 'Заказ принят успешно',
          body: ''
        }
      });
    } else {
      return res.json({
        cart: await Cart.returnFullCart(cart),
        message: {
          type: 'error',
          title: 'ok',
          body: conf.orderFail
        }
      });
    }

    // if (cart.getState() === 'CART') {
    //   res.status(400);
    //   return res.json({
    //     message: {
    //       type: 'error',
    //       title: 'Ошибка проверки корзины',
    //       body: 'Сначала необходимо выполнить запрос check'
    //     }
    //   });
    // }
    //
    // if (cart.getState() === 'COMPLETE') {
    //   res.status(410);
    //   return res.json({
    //     message: {
    //       type: 'error',
    //       title: 'already is complete',
    //       body: 'Cart with id ' + cartId + ' is completed'
    //     }
    //   });
    // }
    //
    // await getEmitter().emit('core-order-after-validate', data);
    //
    // sails.log.verbose('cOrder > second validation success');
    //
    // cart = Object.assign(cart, data);
    // await cart.save();
    //
    //   const isSelfService = data.delivery && data.delivery.type === 'self';
    //   if (isSelfService) {
    //     sails.log.verbose('cOrder > is self service');
    //     await actions.reset(cartId);
    //     cart.selfDelivery = true;
    //     await cart.save();
    //     await getEmitter().emit('core-order-self-delivery', data, cart);
    //     return await createOrder(cart, true);
    //   }
    //
    //   if (!data.address) {
    //     return res.badRequest({
    //       message: {
    //         type: 'error',
    //         title: 'address is requred',
    //         body: 'Необходимо указать адресс.'
    //       }
    //     });
    //   }
    //
    //   if (!data.address.streetId) {
    //     return res.badRequest({
    //       message: {
    //         type: 'error',
    //         title: 'address.streetId is requred',
    //         body: 'Необходимо указать улицу.'
    //       }
    //     });
    //   }
    //
    //   if (!data.address.home) {
    //     return res.badRequest({
    //       message: {
    //         type: 'error',
    //         title: 'address.home is requred',
    //         body: 'Необходимо указать дом.'
    //       }
    //     });
    //   }
    //
    //   sails.log.verbose('cOrder > third validation success');
    //
    //   const street = await Street.findOne({id: data.address.streetId, isDeleted: false});
    //   if (!street) {
    //     res.status(404);
    //     return res.json({
    //       message: {
    //         type: 'error',
    //         title: 'not found',
    //         body: 'Street with id ' + street.streetId + ' not found'
    //       }
    //     });
    //   }
    //   cart.address.street = street;
    //
    //   await getEmitter().emit('core-order-after-validate-address', data);
    //
    //   if (cart.deliveryItem) {
    //     sails.log.verbose('cOrder > add delivery item');
    //     const item = <Dish>await Dish.findOne({or: {id: cart.deliveryItem, rmsId: cart.deliveryItem}});
    //
    //     await cart.addDish(item, 1, [], '', 'delivery');
    //   }
    //
    //   sails.log.info('cart', cart);
    //   await cart.save();
    //
    //   if (process.env.NODE_ENV === 'production') {
    //     sails.log.info(req.ip);
    //     sails.log.info(req.headers);
    //   }
    //
    //   return await createOrder(cart, false);
    //
    //   async function createOrder(cart: Cart, self: boolean) {
    //     sails.log.verbose('cOrder > try to create order');
    //
    //     await getEmitter().emit('core-order-before-create-order', cart);
    //
    //     try {
    //       const rms = rmsAdapter.getInstance();
    //       const result = await rms.createOrder(cart, self);
    //
    //       if ([0, 2].includes(result.code)) {
    //         sails.log.verbose('cOrder > success order from rms or timeout, return new cart');
    //       }
    //
    //       cart.sendToIiko = true;
    //       let a = "W";
    //       for (let i = 0; i < 6; i++)
    //         a += Math.floor(Math.random() * 10);
    //       sails.log.info(result.body.number, typeof result.body.number, result.body);
    //       cart.rmsId = result.body.number || a;
    //
    //       await cart.save();
    //
    //       await cart.next();
    //
    //       await getEmitter().emit('core-order-after-create-order', result);
    //
    //       const newCart = await Cart.create({id: guid()});
    //       return res.json({
    //         cart: newCart,
    //         message: {
    //           type: 'info',
    //           title: 'ok',
    //           body: 'success'
    //         }
    //       });
    //     } catch (e) {
    //       sails.log.verbose('cOrder > rms error, return serverError');
    //
    //       await getEmitter().emit('core-order-create-order-error', e);
    //
    //       if (e.code) {
    //         if ([1, 3].includes(e.code)) {
    //           return res.serverError(e.error.problem || e.error.message || e.error.description || e.error);
    //         }
    //       }
    //       return res.serverError(e);
    //     }
    //   }
  } catch (e) {
    await getEmitter().emit('core-order-create-order-error', e);

    return res.serverError(e);
  }
};
