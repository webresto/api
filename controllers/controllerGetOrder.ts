/**
 * @api {POST} /api/0.5/getOrder Проверка заказа
 * @apiName GetOrder
 * @apiGroup Order
 * @apiDescription Получение ордера
 *
 * @apiParam {String} cartId ID корзины
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
import getEmitter from "@webresto/core/lib/getEmitter";
import SystemInfo from "@webresto/core/models/SystemInfo";
import OrderData from "@webresto/core/modelsHelp/OrderData";

export default async function (req: ReqType, res: ResType) {
  let orderNumber = req.params.orderNumber; 

  if (!orderNumber) {
    return res.badRequest({
      message: {
        type: 'error',
        title: 'Ошибка',
        body: 'Номер заказа обязателен'
      }
    });
  }

  try {
    const cart = await Cart.findOne({rmsOrderNumber: orderNumber});
    if (!cart) {
      return res.json({
        message: {
          type: 'error',
          title: 'Order not found',
          body: `Order with id ${orderNumber} not found`
        }
      });
    } else {
      return res.json({
        cart: await Cart.returnFullCart(cart)
      });
    }
  } catch (e) {
    return res.serverError(e);
  }
};
