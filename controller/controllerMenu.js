"use strict";
/**
 * @apiDefine MenuError
 *
 * @apiError NotFound 404
 * @apiError (500) ServerError 500
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
function default_1(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var groupId, dishId, slug, groupSlug, dishes, dishes, menu, err_1, group, info, menu, err_2, groups, groupsRes, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    groupId = req.param('groupId');
                    dishId = req.param('dishId');
                    slug = req.param('slug');
                    groupSlug = req.param('groupSlug');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 21, , 22]);
                    if (!dishId) return [3 /*break*/, 3];
                    return [4 /*yield*/, Dish.getDishes({ id: dishId })];
                case 2:
                    dishes = _a.sent();
                    if (!dishes[0]) {
                        res.status(404);
                        return [2 /*return*/, res.json('Dish not found')];
                    }
                    return [2 /*return*/, res.json(dishes[0])];
                case 3:
                    if (!slug) return [3 /*break*/, 5];
                    return [4 /*yield*/, Dish.getDishes({ slug: slug })];
                case 4:
                    dishes = _a.sent();
                    if (!dishes[0]) {
                        res.status(404);
                        return [2 /*return*/, res.json('Dish not found')];
                    }
                    return [2 /*return*/, res.json(dishes[0])];
                case 5:
                    if (!groupSlug) return [3 /*break*/, 12];
                    _a.label = 6;
                case 6:
                    _a.trys.push([6, 8, , 11]);
                    return [4 /*yield*/, Group.getGroupBySlug(groupSlug)];
                case 7:
                    menu = _a.sent();
                    return [2 /*return*/, res.json(menu)];
                case 8:
                    err_1 = _a.sent();
                    if (err_1.error === 'not found')
                        return [2 /*return*/, res.notFound()];
                    if (!(err_1 === 'time')) return [3 /*break*/, 10];
                    return [4 /*yield*/, Group.findOne({ slug: groupSlug })];
                case 9:
                    group = _a.sent();
                    info = JSON.parse(group.additionalInfo).workTime[0];
                    res.status(403);
                    return [2 /*return*/, res.json({
                            message: {
                                title: 'Не доступно',
                                body: 'Данная группа работает с ' + info.start + ' по ' + info.stop,
                                type: 'error'
                            }
                        })];
                case 10: return [3 /*break*/, 11];
                case 11: return [3 /*break*/, 20];
                case 12:
                    if (!groupId) return [3 /*break*/, 17];
                    _a.label = 13;
                case 13:
                    _a.trys.push([13, 15, , 16]);
                    return [4 /*yield*/, Group.getGroup(groupId)];
                case 14:
                    menu = _a.sent();
                    return [2 /*return*/, res.json(menu)];
                case 15:
                    err_2 = _a.sent();
                    if (err_2.error === 'not found')
                        return [2 /*return*/, res.notFound()];
                    return [3 /*break*/, 16];
                case 16: return [3 /*break*/, 20];
                case 17: return [4 /*yield*/, Group.find({ parentGroup: null })];
                case 18:
                    groups = _a.sent();
                    return [4 /*yield*/, Group.getGroups(groups.map(function (g) { return g.id; }))];
                case 19:
                    groupsRes = _a.sent();
                    return [2 /*return*/, res.json(groupsRes)];
                case 20: return [3 /*break*/, 22];
                case 21:
                    e_1 = _a.sent();
                    return [2 /*return*/, res.serverError(e_1)];
                case 22: return [2 /*return*/];
            }
        });
    });
}
exports["default"] = default_1;
;
