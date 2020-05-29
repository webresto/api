/**
 * @api {GET} /api/0.5/system Системная информация
 * @apiName SystemInfo
 * @apiGroup Controller
 * @apiDescription Получение информации о организации и ID терминала
 *
 * @apiSuccess {String} organization Организация
 * @apiSuccess {String} deliveryTerminalId Терминал
 * @apiSuccess {Array} data Информация о организации, содержащаяся на сервере RMS
 *
 * @apiError (500) ServerError Ошибка сервера
 */
import {RMS} from "@webresto/core/adapter/index";

const conf = sails.config.restocore;
const rmsAdapter = RMS.getAdapter(conf.rmsAdapter);

export default async function (req: ReqType, res: ResType) {
  const master = <string>req.param('master');

  if (conf.development || (sails.config.environment === 'development' || (master && master === conf.masterKey))) {
    try {
      const data = await rmsAdapter.getInstance().getSystemData();
      return res.json({
        rmsConfig: conf[conf.rmsAdapter],
        data: data
      });
    } catch (e) {
      return res.serverError(e);
    }
  } else {
    return res.notFound();
  }
};
