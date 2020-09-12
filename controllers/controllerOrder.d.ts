/**
 * @api {POST} /api/0.5/order Создание заказа
 * @apiName CreateOrder
 * @apiGroup Order
 * @apiDescription Позволяет оформить заказ, в зависимости от paymentmethod перейдет на оплату или оформит заказ сразу
 *
 * @apiParam {String} cartId ID корзины
 * @apiParam {String} paymentMethodId ID платежного метода полученного при запросе на /api/0.5/paymentmethod
 * @apiParam {String} [comment] Комментарий к заказу
 * @apiParam {Integer} [personsCount=1] Количество персон
 * @apiParam {String} [customData] Специальные данные
 * @apiParam {Boolean} selfDelivery Тип доставки
 * @apiParam {JSON} address Адресс доставки
 * @apiParam {JSON} customer Информация о заказчике
 *
 * @apiParamExample {JSON} Minimum order:
 *  {
      "cartId": "string",
      "address": {
        "streetId": "string",
        "home": "number",
      },
      "customer": {
        "phone": "string",
        "name": "string"
      }
 *  }
 *
 * @apiParamExample {JSON} Full order:
 *  {
      "cartId": "string",
      "comment": "string",
      "selfDelivery": false,
      "address": {
        "city": "string",
        "streetId": "string, required",
        "home": "number, required",
        "housing": "string",
        "index": "string",
        "entrance": "string",
        "floor": "string",
        "apartment": "string",
        "doorphone": "string"
      },
      "customer": {
        "phone": "string, required",
        "mail": "string",
        "name": "string, required"
      },
      "personsCount": "number, default 1",
      "customData": "string"
 *  }
 *
 * @apiSuccess {[Cart](#api-Models-ApiCart)} cart Новая пустая корзина
 * @apiSuccess {JSON} message Сообщение
 *
 * @apiSuccessExample {JSON} Message:
 *  {
      type: 'info',
      title: 'ok',
      body: 'success'
 *  }
 *
 * @apiErrorExample {JSON} BadRequest 400
 *  {
      message: {
        type: 'error',
        title: 'Ошибка валидации',
        body: 'Неверный формат номера!'
 *  }
 * @apiErrorExample {JSON} NotFound 400
 *  {
      message: {
        type: 'error',
        title: 'not found',
        body: 'Cart with id 0ef473a3-ef9d-746f-d5a5-1a578ad10035 not found'
      }
 *  }
 * @apiErrorExample {JSON} Gone 410
 *  {
      message: {
        type: 'error',
        title: 'already is complete',
        body: 'Cart with id 0ef473a3-ef9d-746f-d5a5-1a578ad10035 is completed'
      }
 *  }
 */
export default function (req: ReqType, res: ResType): any;
