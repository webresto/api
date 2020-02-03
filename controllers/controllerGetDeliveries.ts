///<reference path="../../native-check/models/Street.ts"/>
///<reference path="../../native-check/models/Zone.ts"/>
///<reference path="../../core/models/Condition.ts"/>

/**
 * @api {POST} /api/0.5/delivery Нахождение зоны
 * @apiName Delivery
 * @apiGroup Order
 * @apiDescription Нахождение зоны, в которую входит адресс
 *
 * @apiParam {String} streetId Улица доставки
 * @apiParam {Integer} home Дом доставки
 *
 * @apiSuccess {String[]} Array Список описаний условий, что принадлежат этой зоне
 *
 *  @apiError (500) {JSON} ServerError Ошибка сервера
 *  @apiError {String} BadRequest Ошибка входных данныз
 *  @apiError {String} NotFound Не найдено в базе
 */
import SystemInfo from "@webresto/core/models/SystemInfo";
import responseWithErrorMessage from "@webresto/api/lib/responseWithErrorMessage";

export default async function (req: ReqType, res: ResType) {
  const streetId = <string>req.param('streetId');
  const home = <number>req.param('home');

  if (!streetId) {
    return res.badRequest('streetId is required');
  }
  if (!home) {
    return res.badRequest('home is required');
  }

  try {
    const street = await Street.findOne(streetId);

    if (!street) {
      return responseWithErrorMessage(res, 'street not found');
    }

    const zone = await Zone.getDeliveryCoast(street.name, home);

    if (!zone) {
      const error = await SystemInfo.use("notInZone");
      return responseWithErrorMessage(res, error);
    }

    // sails.log.info(zone);

    let conditions = await Condition.find().populate('zones');
    conditions = conditions.filter(c => c.zones && c.zones.filter(z => z.id === zone.id).length);
    conditions = conditions.sort((a, b) => a.weight - b.weight);

    return res.json(conditions.map(c => c.description));
  } catch (e) {
    return res.serverError(e);
  }
};
