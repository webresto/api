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
import Group from "@webresto/core/models/Group";
import Dish from "@webresto/core/models/Dish";

export default async function (req: ReqType, res: ResType) {
  const groupId = req.param('groupId');
  const dishId = req.param('dishId');
  const slug = req.param('slug');
  const groupSlug = req.param('groupSlug');

  try {
    if (dishId) {
      const dishes = await Dish.getDishes({id: dishId});
      if (!dishes[0]) {
        res.status(404);
        return res.json('Dish not found');
      }

      return res.json(dishes[0]);
    } else if (slug) {
      const dishes = await Dish.getDishes({slug: slug});
      if (!dishes[0]) {
        res.status(404);
        return res.json('Dish not found');
      }

      return res.json(dishes[0]);
    } else if (groupSlug) {
      try {
        const menu = await Group.getGroupBySlug(groupSlug);
        return res.json(menu);
      } catch (err) {
        if (err.error === 'not found')
          return res.notFound();
        if (err === 'time') {
          const group = await Group.findOne({slug: groupSlug});
          const info = JSON.parse(group.additionalInfo).workTime[0];
          res.status(403);
          return res.json({
            message: {
              title: 'Не доступно',
              body: 'Данная группа работает с ' + info.start + ' по ' + info.stop,
              type: 'error'
            }
          });
        }
      }
    } else if (groupId) {
      try {
        const menu = await Group.getGroup(groupId);
        return res.json(menu);
      } catch (err) {
        if (err.error === 'not found')
          return res.notFound();
      }
    } else {
      const groups = await Group.find({parentGroup: null});
      const groupsRes = await Group.getGroups(groups.map(g => g.id));
      return res.json(groupsRes);
    }
  } catch (e) {
    return res.serverError(e);
  }
};
