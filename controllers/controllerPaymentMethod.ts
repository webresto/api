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

export default async function (req: ReqType, res: ResType) {
  const master = <string>req.param('master');
  try {
    const data = await PaymentMethod.getAvailable()
    return res.json(data);
  } catch (e) {
    return res.serverError(e);
  }
};
