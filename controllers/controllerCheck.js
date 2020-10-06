"use strict";
/**
 * @api {POST} /api/0.5/check Проверка заказа
 * @apiName CheckOrder
 * @apiGroup Order
 * @apiDescription Проверка возможности создания заказа и получение стоимости доставки
 *
 * @apiParam {String} cartId ID корзины
 * @apiParam {String} [comment] Комментарий к заказу
 * @apiParam {String} paymentMethodId ID платежного метода полученного при запросе на /api/0.5/paymentmethod
 * @apiParam {Integer} [personsCount=1] Количество персон
 * @apiParam {String} [customData] Специальные данные
 * @apiParam {Boolean} selfService Тип доставки
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
Object.defineProperty(exports, "__esModule", { value: true });
const getEmitter_1 = require("@webresto/core/lib/getEmitter");
async function default_1(req, res) {
    let data = req.body;
    if (!data) {
        return res.badRequest({
            message: {
                type: 'error',
                title: 'Ошибка',
                body: 'Тело запроса обязательно'
            }
        });
    }
    await getEmitter_1.default().emit('core-check-before-check', data);
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
    const isSelfService = data.selfService;
    try {
        const cart = await Cart.findOne(data.cartId);
        if (cart.paid || cart.state === 'ORDER') {
            return res.badRequest({
                message: {
                    type: 'error',
                    title: 'Ошибка',
                    body: 'Корзина уже заказана'
                }
            });
        }
        if (!cart) {
            return res.json({
                message: {
                    type: 'error',
                    title: 'Cart not found',
                    body: `Cart with id ${data.cartId} not found`
                }
            });
        }
        if (data.paymentMethodId) {
            if (!PaymentMethod.checkAvailable(data.paymentMethodId)) {
                return res.json({
                    cart: await Cart.returnFullCart(cart),
                    message: {
                        type: 'error',
                        title: 'Ошибка',
                        body: "Проверка платежной системы завершилась неудачей"
                    }
                });
            }
        }
        if (data.address) {
            data.address.city = data.address.city || await SystemInfo.use('city');
        }
        cart.personsCount = (data.personsCount) ? data.personsCount : "";
        if (data.comment)
            cart.comment = data.comment;
        if (data.date)
            cart.date = data.date;
        await cart.save();
        let success;
        try {
            success = await cart.check(data.customer, isSelfService, data.address, data.paymentMethodId);
        }
        catch (e) {
            sails.log.error("API > CHECK > cart.check", e);
        }
        let message;
        if (success) {
            message = {
                type: 'info',
                title: 'ok',
                body: 'Стоимость доставки расчитана успешно.'
            };
        }
        else {
            message = {
                type: 'warning',
                title: 'Внимание',
                body: 'Не удалось проверить заказ, проверьте еще раз заполненные поля.'
            };
        }
        let result = {
            cart: await Cart.returnFullCart(cart),
            message: message
        };
        if ((await SystemInfo.use("HideCheckResultMessage")) && success) {
            delete (result.message);
        }
        return res.json(result);
    }
    catch (e) {
        let message = {
            type: 'error',
            title: 'Ошибка',
            body: ''
        };
        if (e.code === 1) {
            message.body = "Введите имя заказчика";
        }
        else if (e.code === 2) {
            message.body = "Введите телефон заказчика";
        }
        else if (e.code === 3) {
            message.body = "Неверный формат имени заказчика";
        }
        else if (e.code === 4) {
            message.body = "Неверный формат номера заказчика";
        }
        else if (e.code === 5) {
            message.body = "Не указана улица";
        }
        else if (e.code === 6) {
            message.body = "Не указан номер дома";
        }
        else if (e.code === 7) {
            message.body = "Не указан город";
        }
        else if (e.code === 8) {
            message.body = "Платежная система недоступна";
        }
        if (message.body) {
            return res.badRequest(message);
        }
        return res.serverError(e);
    }
}
exports.default = default_1;
;
