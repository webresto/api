/**
 * @api {POST} /api/0.5/check Проверка заказа
 * @apiName CheckOrder
 * @apiGroup Order
 * @apiDescription Проверка возможности создания заказа и получение стоимости доставки
 *
 * @apiParam {String} cartId ID корзины
 * @apiParam {String} [comment] Комментарий к заказу
 * @apiParam {Integer} [personsCount=1] Количество персон
 * @apiParam {String} [customData] Специальные данные
 * @apiParam {Boolean} selfDelivery Тип доставки
 * @apiParam {JSON} address Адресс доставки
 * @apiParam {JSON} customer Информация о заказчике
 *
 * @apiParamExample {String}
 * Смотри "Создание заказа"
 *
 * @apiSuccess {[Cart](#api-Models-ApiCart)} cart Коризна с заполненым поле delivery. Если delivery 0, то доставка бесплатная
 * @apiSuccess {JSON} message Сообщение
 *
 * @apiSuccessExample {JSON} Message:
 *  {
      type: 'info',
      title: 'ok',
      body: 'success'
 *  }
 *
 * @apiError {[Cart](#api-Models-ApiCart)} cart Прежняя запрашиваемая корзина
 * @apiError {JSON} message Сообщение об ошибке
 * @apiError (500) {JSON} ServerError Ошибка сервера
 *
 * @apiErrorExample ServerError 500
 *  {
 *    message: {
        type: 'error',
        title: 'RMS problem',
        body: data.problem
      },
      cart: {
        ...
      }
 *  }
 */

import Cart from "@webresto/core/models/Cart";
import OrderData from "@webresto/core/adapter/rms/OrderData";
import getEmitter from "@webresto/core/lib/getEmitter";

const conf = sails.config.restocore;

export default async function (req: ReqType, res: ResType) {
  let data = <OrderData>req.body;
  if (!data)
    return res.badRequest({
      message: {
        type: 'error',
        title: 'Ошибка',
        body: 'Тело запроса обязательно'
      }
    });

  await getEmitter().emit('core-check-before-check', data);

  if (!data.customer) {
    return res.badRequest({
      message: {
        type: 'error',
        title: 'Ошибка',
        body: 'Необходимо заполнить данные о заказчике'
      }
    });
  }

  if (!data.cartId) {
    return res.badRequest({
      message: {
        type: 'error',
        title: 'Ошибка',
        body: 'ID корзины обязательно'
      }
    });
  }

  const isSelfService = data.selfDelivery;

  try {
    const cart = await Cart.findOne(data.cartId);

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

    const success = await cart.check(data.customer, isSelfService, data.address);

    if (success) {
      return res.json({
        cart: await Cart.returnFullCart(cart),
        message: {
          type: 'info',
          title: 'ok',
          body: 'Стоимость доставки расчитана успешно.'
        }
      });
    } else {
      return res.json({
        cart: await Cart.returnFullCart(cart),
        message: {
          type: 'info',
          title: conf.zoneDontWork,
          body: ''
        }
      });
    }
  } catch (e) {
    let message = {
      type: 'error',
      title: 'Ошибка',
      body: ''
    };
    if (e.code === 1) {
      message.body = "Введите имя заказчика";
    } else if (e.code === 2) {
      message.body = "Введите телефон заказчика";
    } else if (e.code === 3) {
      message.body = "Неверный формат имени заказчика";
    } else if (e.code === 4) {
      message.body = "Неверный формат номера заказчика";
    } else if (e.code === 5) {
      message.body = "Не указана улица";
    } else if (e.code === 6) {
      message.body = "Не указан номер дома";
    } else if (e.code === 7) {
      message.body = "Не указан город";
    } else if (e.code === 8) {
      message.body = "Указанная улица не найдена";
    }

    if (message.body) {
      return res.badRequest(message);
    }

    return res.serverError(e);
  }

  /*/!*const phoneTemp = /\+7\d{10}/;
  if (!data.customer.phone.match(phoneTemp)) {
    return res.badRequest({
      message: {
        type: 'error',
        title: 'Ошибка валидации',
        body: 'Неверный формат номера!'
      }
    });
  }*!/

  const cartId = <string>data.cartId;
  if (!cartId)
    return res.badRequest({
      message: {
        type: 'error',
        title: 'cartId is required',
        body: 'cartId is required in body of request'
      }
    });

  sails.log.verbose('cCheck > first validation success');

  try {
    let cart = await <Cart>Cart.findOne({id: cartId});
    if (!cart) {
      res.status(404);
      return res.json({
        message: {
          type: 'error',
          title: 'not found',
          body: 'Cart with id ' + cartId + ' not found'
        }
      });
    }

    await Emitter.emit('core-check-after-validate', data);

    sails.log.verbose('cCheck > second validation success');

    cart = Object.assign(cart, data);

    const isSelfService = data.delivery && data.delivery.type === 'self';
    if (isSelfService) {
      sails.log.verbose('cOrder > is self service');
      await actions.reset(cartId);
      cart.selfDelivery = true;
      await cart.save();
      await Emitter.emit('core-check-self-delivery', data, cart);
      return await checkOrder(cart, true);
    }

    if (!data.address) {
      return res.badRequest({
        message: {
          type: 'error',
          title: 'address is requred',
          body: 'Необходимо указать адресс.'
        }
      });
    }

    /!*if (!data.address.streetId) {
      return res.badRequest({
        message: {
          type: 'error',
          title: 'address.streetId is requred',
          body: 'Необходимо указать улицу.'
        }
      });
    }*!/

    /!*if (!data.address.home) {
      return res.badRequest({
        message: {
          type: 'error',
          title: 'address.home is requred',
          body: 'Необходимо указать дом.'
        }
      });
    }*!/

    sails.log.verbose('cCheck > third validation success');

   /!* const street = await <Street>Street.findOne({id: data.address.streetId, isDeleted: false});
    if (!street) {
      res.status(404);
      return res.json({
        message: {
          type: 'error',
          title: 'not found',
          body: 'Street with id ' + data.address.streetId + ' not found'
        }
      });
    }
    cart.address.street = street;*!/

    await Emitter.emit('core-check-after-validate-address', data);

    cart = Object.assign(cart, data);

    if (process.env.NODE_ENV === 'production') {
      sails.log.info(req.ip);
      sails.log.info(req.headers);
    }

    return await checkOrder(cart, false);

    async function checkOrder(cart: Cart, self: boolean): Promise<void> {
      sails.log.verbose('cOrder > try to check order');

      await Emitter.emit('core-check-before-check-order', cart);

      try {
        const rms = rmsAdapter.getInstance();
        const result = await rms.checkOrder(cart, self);

        if (result.code === 0) {
          sails.log.verbose('cCheck > success order from rms or timeout, return new cart');
          if (cart.getState() === 'CART')
            await cart.next();

          cart.delivery = result.body;

          await cart.save();
        }

        if (result.code === 2) {
          await Emitter.emit('core-check-rms-problem', result);

          const checkProblem = <string>await SystemInfo.use('checkProblem');
          return res.json({
            cart: await Cart.returnFullCart(cart),
            message: {
              type: 'info',
              title: 'RMS problem',
              body: checkProblem
            }
          });
        }

        await Emitter.emit('core-check-after-check', result);
        return res.json({
          cart: await Cart.returnFullCart(cart),
          message: {
            type: 'info',
            title: 'ok',
            body: 'Стоимость доставки расчитана успешно.'
          }
        });
      } catch (e) {
        if (e.code === 3) {
          try {
            // await emailFail(cart);
            sails.log.error('FAIL');
          } catch (e) {
            sails.log.error('EMAIL PROBLEM', e);
          }

          await Emitter.emit('core-check-rms-error', e);

          let siCNW = <string>await SystemInfo.use('checkNotWork');
          return res.json({
            cart: await Cart.returnFullCart(cart),
            message: {
              type: 'info',
              title: 'RMS не работает',
              body: siCNW
            }
          });
        }
        if (e.code === 1) {
          await Emitter.emit('core-check-rms-error', e);

          return res.json({
            cart: await Cart.returnFullCart(cart),
            message: {
              type: 'error',
              title: 'RMS problem',
              body: e.error.problem || e.error.message || e.error.description || e.error
            }
          });
        }
        if (e.code === 4) {
          sails.log.error(e.error);
          cart.delivery = null;
          await cart.save();

          await Emitter.emit('core-check-rms-no-work', e);

          return res.json({
            cart: await Cart.returnFullCart(cart),
            message: {
              type: 'info',
              title: 'RMS problem',
              body: 'RMS API do not work'
            }
          });
        }
        return res.serverError(e);
      }
    }
  } catch (e) {
    await Emitter.emit('core-check-order-error', e);

    return res.serverError(e);
  }*/
};
