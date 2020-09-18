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



export default async function (req: ReqType, res: ResType) {
  let params = req.allParams()


  // Планируется получать от фронта это чтобы потом можно было ввести расчет ограничений по местам приготовлений или както еще
  if (!params.cartId) {
    return res.badRequest({
      message: {
        type: 'error',
        title: 'Ошибка',
        body: 'cartId обязателен'
      }
    });
  }

  try {
    let restrictions :any = {};
    restrictions.workTime = await SystemInfo.use('workTime');
    restrictions.periodPossibleForOrder = await SystemInfo.use('PeriodPossibleForOrder'); 
    restrictions.timezone = await SystemInfo.use('timezone');
    return res.json(restrictions);
  } catch (e) {
    return res.serverError(e);
  }
};

async function getOrderDateLimit(): Promise<string>  {
  let periodPossibleForOrder = await SystemInfo.use('PeriodPossibleForOrder')
  if (periodPossibleForOrder === 0 || periodPossibleForOrder === undefined  || periodPossibleForOrder === null ){
    periodPossibleForOrder = "20160";
  }  
  return moment().add(periodPossibleForOrder, 'minutes').format("YYYY-MM-DD HH:mm:ss");
}