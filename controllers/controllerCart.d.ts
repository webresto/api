/**
 * @apiDefine CartResponse
 *
 * @apiSuccess {JSON} message Сообщение от сервера
 * @apiSuccess {[Cart](#api-Models-ApiCart)} cart Cart model
 * @apiSuccessExample {JSON} Message:
 *  {
 *    "type": "info",
 *    "title": "ok",
 *    "body": ""
 *  }
 *
 * @apiErrorExample {JSON} BadRequest 400
 *  {
      "type": "error",
      "title": "bad request",
      "body": "dishId is required"
 *  }
 * @apiErrorExample {JSON} ServerError 500
 *  {
      "type": "error",
      "title": "server error",
      "body": {
        "invalidAttributes": {
          "...": "..."
        },
        "model": "User",
        "_e": { },
        "rawStack": "...",
        "reason": "...",
        "code": "E_VALIDATION",
        "status": 500,
        "details": "...",
        "message": "...",
        "stack": "..."
      }
 *  }
 * @apiErrorExample {JSON} NotFound 404
 *  {
      "type": "error",
      "title": "not found",
      "body": "Method not found: GET"
 *  }
 */
declare const _default: {
    add: (req: import("typed-sails").sails.Request, res: import("typed-sails").sails.Response) => Promise<any>;
    remove: (req: import("typed-sails").sails.Request, res: import("typed-sails").sails.Response) => Promise<any>;
    get: (req: import("typed-sails").sails.Request, res: import("typed-sails").sails.Response) => Promise<any>;
    set: (req: import("typed-sails").sails.Request, res: import("typed-sails").sails.Response) => Promise<any>;
    setComment: (req: import("typed-sails").sails.Request, res: import("typed-sails").sails.Response) => Promise<any>;
};
export default _default;
