"use strict";
/**
 * @api {POST} /api/0.5/order/:number Проверка заказа
 * @apiName GetOrder
 * @apiGroup Order
 * @apiDescription Получение информации о заказе,
 *
 * @apiParam {String} number rmsOrderNumber корзины который выдала РМС система заказу пр регстрации
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
Object.defineProperty(exports, "__esModule", { value: true });
async function default_1(req, res) {
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
        const cart = await Cart.findOne({ or: [{ id: orderNumber }, { rmsOrderNumber: orderNumber }] });
        if (!cart) {
            return res.json({
                message: {
                    type: 'error',
                    title: 'Order not found',
                    body: `Order with id ${orderNumber} not found`
                }
            });
        }
        else {
            return res.json({
                cart: await Cart.returnFullCart(cart)
            });
        }
    }
    catch (e) {
        return res.serverError(e);
    }
}
exports.default = default_1;
;
