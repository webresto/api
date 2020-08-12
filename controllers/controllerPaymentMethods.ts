/**
 * @api {GET} /api/0.5/payment_methods Системная информация
 * @apiName PaymentMethods
 * @apiGroup Controller
 * @apiDescription Получение списка возможных методов оплаты
 *
 * @apiSuccess {String} organization Организация
 * @apiSuccess {String} deliveryTerminalId Терминал
 * @apiSuccess {Array} data Информация о организации, содержащаяся на сервере RMS
 *
 * @apiError (500) ServerError Ошибка сервера
 */
import {RMS} from "@webresto/core/adapter/index";

const conf = sails.config.restoapi;
const rmsAdapterName = sails.config.restocore.rmsAdapter;
const rmsAdapter = RMS.getAdapter(rmsAdapterName);

export default async function (req: ReqType, res: ResType) {
  const master = <string>req.param('master');

  if (conf.development || (sails.config.environment === 'development' || (master && master === conf.masterKey))) {
    try {
      const data = await rmsAdapter.getInstance().getSystemData();
      return res.json({
        rmsConfig: sails.config.restocore[rmsAdapterName],
        data: data
      });
    } catch (e) {
      return res.serverError(e);
    }
  } else {
    return res.notFound();
  }
};
