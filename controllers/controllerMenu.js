"use strict";
/**
 * @apiDefine MenuError
 *
 * @apiError NotFound 404
 * @apiError (500) ServerError 500
 */
Object.defineProperty(exports, "__esModule", { value: true });
const responseWithErrorMessage_1 = require("@webresto/api/lib/responseWithErrorMessage");
async function default_1(req, res) {
    const groupId = req.param('groupId');
    const dishId = req.param('dishId');
    const slug = req.param('slug');
    const groupSlug = req.param('groupSlug');
    try {
        if (dishId) {
            const dishes = await Dish.getDishes({ id: dishId });
            return dishes[0] ? res.json(dishes[0]) : responseWithErrorMessage_1.default(res, `Dish with id ${dishId} not found`);
        }
        else if (slug) {
            const dishes = await Dish.getDishes({ slug: slug });
            return dishes[0] ? res.json(dishes[0]) : responseWithErrorMessage_1.default(res, `Dish with id ${dishId} not found`);
        }
        else if (groupSlug) {
            try {
                const menu = await Group.getGroupBySlug(groupSlug);
                return menu ? res.json(menu) : responseWithErrorMessage_1.default(res, `Group with slug '${groupSlug}' not found`);
            }
            catch (err) {
                if (err === 'time') {
                    const group = await Group.findOne({ slug: groupSlug });
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
        }
        else if (groupId) {
            const menu = await Group.getGroup(groupId);
            return menu ? res.json(menu) : responseWithErrorMessage_1.default(res, `Group with id ${groupId} not found`);
        }
        else {
            const groups = await Group.find({ parentGroup: null });
            const groupsRes = await Group.getGroups(groups.map(g => g.id));
            return res.json(groupsRes);
        }
    }
    catch (e) {
        return res.serverError(e);
    }
}
exports.default = default_1;
;
