/**
 * @api {GET} /api/0.5/paymentmethod Платежные системы
 * @apiName PaymentMethod
 * @apiGroup Controller
 * @apiDescription Получение списка платежных систем
 *
 * @apiSuccess {Array} PaymentMethodsArray Список платежных методов доступных для оплаты
 *
 * @apiError (500) ServerError Ошибка сервера
 */
export default function (req: ReqType, res: ResType): Promise<any>;
