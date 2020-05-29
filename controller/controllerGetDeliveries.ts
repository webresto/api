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
import Street from "@webresto/core/models/Street";
import Zone from "@webresto/core/models/Zone";
import Condition from "@webresto/core/models/Condition";

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
      return res.json(404, 'street not found');
    }

    const zone = await Zone.getDeliveryCoast(street.name, home);

    if (!zone) {
      return res.json(404, 'address not includes in enabled zones');
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
