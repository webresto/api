/**
 * @api {POST} /api/0.5/restrictions/:cartId Получить ограничения заказа
 * @apiName Restrictions
 * @apiGroup Checkout
 * @apiDescription Получение ограничений для заказа,
 *
 * @apiParam {String} cartId cartId
 *
 * @apiSuccess {JSON} workTime Время работы
 * @apiSuccess {integer} periodPossibleForOrder Преод в секундах возможный для доставки (по умолчанию 1 неделя)
 *
 *
 * @apiError (500) {JSON} ServerError Ошибка сервера
 *
 * @apiErrorExample ServerError 500
 *  {
 *    message: {
        type: 'error',
        title: 'RMS problem',
        body: data.problem
      }
    }
 */
export default function (req: ReqType, res: ResType): Promise<any>;
