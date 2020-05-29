/**
 * @api {GET} /api/0.5/streets Получение улиц
 * @apiName Streets
 * @apiGroup Controller
 * @apiDescription Получение всех улиц, что обслуживает кафе
 *
 * @apiSuccess {[Street](l#api-Models-ApiStreet)[]} Array Массив улиц
 *
 * @apiError (500) ServerError Ошибка сервера
 */
import Street from "@webresto/core/models/Street";

export default async function (req: ReqType, res: ResType) {
  try {
    const streets = await Street.find({isDeleted: false});
    return res.json(streets);
  } catch (e) {
    return res.serverError(e);
  }
};
