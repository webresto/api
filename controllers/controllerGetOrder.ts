/**
 * @api {POST} /api/0.5/order/:number Проверка заказа
 * @apiName GetOrder
 * @apiGroup Order
 * @apiDescription Получение информации о заказе, 
 *
 * @apiParam {String} number rmsOrderNumber корзины который выдала РМС система заказу пр регстрации
 *
 * @apiSuccess {[Cart](#api-Models-ApiCart)} cart Коризна с заполненым поле delivery. Если deliveryTotal 0, то доставка бесплатная
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
import responseWithErrorMessage from "@webresto/api/lib/responseWithErrorMessage";
import getEmitter from "@webresto/core/lib/getEmitter";

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
  let cart: Cart;
  try {
    try {
      cart = await Cart.findOne({or: [{id: orderNumber},{rmsOrderNumber: orderNumber}, { id:{ contains: orderNumber }}]});
    } catch (error) {
      return responseWithErrorMessage(res, `Ордер не найдер`)
    }

    if (!cart){
      return responseWithErrorMessage(res, `Ордер не найдер`)
    }
    const paymentMethod = await PaymentMethod.findOne({id: cart.paymentMethod});

    let orderData = await Cart.returnFullCart(cart)
    //@ts-ignore    
    orderData.paymentMethod = paymentMethod;
    getEmitter().emit('api-v1-get-order', orderData);
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
        orderData: orderData
      });
    }
  } catch (e) {
    return res.serverError(e);
  }
};
