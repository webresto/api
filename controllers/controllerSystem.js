"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
const index_1 = require("@webresto/core/adapter/index");
const conf = sails.config.restoapi;
const rmsAdapterName = sails.config.restocore.rmsAdapter;
const rmsAdapter = index_1.RMS.getAdapter(rmsAdapterName);
async function default_1(req, res) {
    const master = req.param('master');
    if (conf.development || (sails.config.environment === 'development' || (master && master === conf.masterKey))) {
        try {
            const data = await rmsAdapter.getInstance().getSystemData();
            return res.json({
                rmsConfig: sails.config.restocore[rmsAdapterName],
                data: data
            });
        }
        catch (e) {
            return res.serverError(e);
        }
    }
    else {
        return res.notFound();
    }
}
exports.default = default_1;
;
