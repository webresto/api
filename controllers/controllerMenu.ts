/**
 * @apiDefine MenuError
 *
 * @apiError NotFound 404
 * @apiError (500) ServerError 500
 */

/**
 * @api {GET} /api/0.5/menu Полное меню
 * @apiName Меню
 * @apiGroup Menu
 * @apiDescription Получение иерархии меню
 *
 * @apiSuccess {[Group](#api-Models-ApiGroup)[]} GroupObjectArray Список главных групп (которые не имеют родительских групп) с полной иехрархией всех дочерних групп и блюд
 *
 * @apiUse MenuError
 */

/**
 * @api {GET} /api/0.5/menu Получение отдельного блюда
 * @apiName Menu
 * @apiGroup Menu
 * @apiDescription Получение блюда по его ID или slug. Запрос только по одному из двух полей ниже
 *
 * @apiParam {String} dishId ID блюда для получения
 * @apiParam {String} slug Slug блюда для получения
 *
 * @apiSuccess {[Dish](#api-Models-ApiDish)} DishObject Запрашиваемое блюдо
 *
 * @apiUse MenuError
 */

/**
 * @api {GET} /api/0.5/menu Получение блюд из группы
 * @apiName Меню Групп
 * @apiGroup Menu
 * @apiDescription Получение заданной группы со всеми её дочерними группами и блюдами
 *
 * @apiParam {String} groupId ID группы для получения
 * @apiParam {String} groupSlug Slug группы для получения
 *
 * @apiSuccess {[Group](#api-Models-ApiGroup)} GroupObject Запрашиваемая группа
 *
 * @apiUse MenuError
 */
//import Group from "@webresto/core/models/Group";
//import Dish from "@webresto/core/models/Dish";
import responseWithErrorMessage from "@webresto/api/lib/responseWithErrorMessage";

export default async function (req: ReqType, res: ResType) {
  const groupId = <string>req.param('groupId');
  const dishId = <String>req.param('dishId');
  const slug = <string>req.param('slug');
  const groupSlug = <string>req.param('groupSlug');

  try {
    if (dishId) {
      const dishes = await Dish.getDishes({id: dishId});
      return dishes[0] ? res.json(dishes[0]) : responseWithErrorMessage(res, `Dish with id ${dishId} not found`);
    } else if (slug) {
      const dishes = await Dish.getDishes({slug: slug});
      return dishes[0] ? res.json(dishes[0]) : responseWithErrorMessage(res, `Dish with id ${dishId} not found`);
    } else if (groupSlug) {
      try {
        const menu = await Group.getGroupBySlug(groupSlug);
        return menu ? res.json(menu) : responseWithErrorMessage(res, `Group with slug '${groupSlug}' not found`);
      } catch (err) {
        if (err === 'time') {
          const group = await Group.findOne({slug: groupSlug});
          const info = JSON.parse(group.additionalInfo).workTime[0];
          return res.json({
            message: {
              type: 'error',
              title: 'Не доступно',
              body: 'Данная группа работает с ' + info.start + ' по ' + info.stop
            }
          });
        }
      }
    } else if (groupId) {
        const menu = await Group.getGroup(groupId);
        return menu ? res.json(menu) : responseWithErrorMessage(res, `Group with id ${groupId} not found`);
    } else {
      const groups = await Group.find({parentGroup: null});
      const groupsRes = await Group.getGroups(groups.map(g => g.id));
      return res.json(groupsRes);
    }
  } catch (e) {
    return res.serverError(e);
  }
};
