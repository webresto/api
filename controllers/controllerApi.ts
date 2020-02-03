/// <reference path="../../core/lib/globalTypes.ts"/>
/// <reference path="../../core/models/SystemInfo.ts"/>

/**
 * @api {get} /api/0.5/api/:method Request directly to IIKO api
 * @apiName IIKO API
 * @apiGroup Controller
 * @apiDescription Request work only in development mode or
 * if in config exists master key and front send this key with parameters
 *
 * @apiParam {String} method Method to send IIKO
 * @apiParam {Any} params Params for this request required in IIKO
 * @apiParam {String} master Master key. Required in not development mode
 *
 * @apiSuccess {JSON} Object Required data from IIKO
 *
 * @apiError ServerError Error from IIKO
 * @apiError NotFound If it is not development mode and master is wrong
 */

import {RMS} from "@webresto/core/adapter/index";

const conf = sails.config.restoapi;
let rmsAdapter= RMS.getAdapter(sails.config.restocore.rmsAdapter);

export default async function (req: ReqType, res: ResType) {
  const method = <string>req.param('method');
  if (!method)
    return res.badRequest({error: 'method is required'});
  delete req.params.method;

  const master = <string>req.param('master');

  if (conf.development || sails.config.environment === 'development' || (master && master === conf.masterKey)) {
    try {
      const value = await rmsAdapter.getInstance().api(method, req.allParams());
      return res.ok(value);
    } catch (e) {
      return res.serverError(e);
    }
  } else {
    return res.notFound();
  }
};
