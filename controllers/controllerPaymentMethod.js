"use strict";
/**
 * @api {GET} /api/0.5/paymentmethod Платежные системы
 * @apiName PaymentMethod
 * @apiGroup Controller
 * @apiDescription Получение списка платежных систем
 *
 * @apiSuccess {Array} Список платежных методов доступных для оплаты
 *
 * @apiError (500) ServerError Ошибка сервера
 */
Object.defineProperty(exports, "__esModule", { value: true });
async function default_1(req, res) {
    const master = req.param('master');
    try {
        const data = await PaymentMethod.getAvailable();
        return res.json(data);
    }
    catch (e) {
        return res.serverError(e);
    }
}
exports.default = default_1;
;
