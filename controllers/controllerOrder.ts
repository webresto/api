/**
 * @api {POST} /api/0.5/order Создание заказа
 * @apiName CreateOrder
 * @apiGroup Order
 * @apiDescription Позволяет оформить заказ, в зависимости от paymentmethod перейдет на оплату или оформит заказ сразу
 *
 * @apiParam {String} cartId ID корзины
 * @apiParam {String} paymentMethodId ID платежного метода полученного при запросе на /api/0.5/paymentmethod
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
import OrderData from "@webresto/core/modelsHelp/OrderData";
import getEmitter from "@webresto/core/lib/getEmitter";
import uuid = require("uuid");

export default async function (req: ReqType, res: ResType) {
  let data = <OrderData>req.body;
  if (!data) {
    return res.badRequest({
      message: {
        type: 'error',
        title: 'body is required',
        body: 'Body of request is required'
      }
    });
  }

  await getEmitter().emit('core-order-before-order', data);

  if (!data.cartId) {
    return res.badRequest({
      message: {
        type: 'error',
        title: 'cartId is required',
        body: 'cartId is required in body of request'
      }
    });
  }

  try {
    var cart = await Cart.findOne({id: data.cartId}); 
    console.log("11111",cart)
    if (!cart) {
      return res.badRequest({
        message: {
          type: 'error',
          title: 'Cart not found',
          body: `Cart with id ${data.cartId} not found`
        }
      });
    }

    
    if (cart.paymentMethod){
      if(!PaymentMethod.checkAvailable(cart.paymentMethod)){
        return res.badRequest({
          cart: await Cart.returnFullCart(cart),
          message: {
            type: 'error',
            title: 'Ошибка',
            body: "Проверка платежной системы завершилась неудачно"
          }
        });
      }
      
      if(!cart.isPaymentPromise){
        try {
          let paymentResponse = await cart.payment();
          return res.json({
            cart: await Cart.returnFullCart(cart),
            action: {
              paymentRedirect: paymentResponse.redirectLink
            }
          });
        } catch (e) {
          sails.log.verbose("API > ORDER > PAYMENT > DO REGISTER", e);
          return res.badRequest({
            cart: await Cart.returnFullCart(cart),
            message: {
              type: 'error',
              title: 'Ошибка',
              body: "Попытка регистрации платежа завершилась неудачно" 
            }
          });
        }
      } 
    }     
  
    // Если платежная система не указана, то оформляем заказ.
    const success = await cart.order();
    //@ts-ignore
    const newCart = await Cart.create();
    if (success == 0) {
      return res.json({
        cart: await Cart.returnFullCart(newCart),
        message: {
          type: 'info',
          title: 'Успешно',
          body: 'Ваш заказ принят в обработку'
        }
      });
    } else {
      return res.json({
        cart: await Cart.returnFullCart(cart),
        message: {
          type: 'error',
          title: 'Ошибка',
          body: await SystemInfo.use('orderFail') + ' | код ошибки #'+success
        }
      });
    }
  } catch (e) {
    await getEmitter().emit('core-order-create-order-error', e);
    return res.serverError(e);
  }
};
