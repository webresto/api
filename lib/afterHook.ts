import HookTools from "@webresto/core/lib/hookTools";
import controllerApi from "@webresto/api/controllers/controllerApi";
import controllerCart from "@webresto/api/controllers/controllerCart";
import controllerMenu from "@webresto/api/controllers/controllerMenu";
import controllerPaymentMethod from "@webresto/api/controllers/controllerPaymentMethod";
import controllerOrder from "@webresto/api/controllers/controllerOrder";
import controllerGetOrder from "@webresto/api/controllers/controllerGetOrder";
import controllerSystem from "@webresto/api/controllers/controllerSystem";
import controllerGetDeliveries from "@webresto/api/controllers/controllerGetDeliveries";
import controllerCheck from "@webresto/api/controllers/controllerCheck";
import controllerRestrictions from "@webresto/api/controllers/controllerRestrictions";
import getConfig from "@webresto/api/lib/getConfig";

export default async function () {
  try {
    /**
     * POLICIES
     */
    HookTools.loadPolicies(__dirname + '/../policies');

    /**
     *  ROUTES
     */
    const baseRoute = (await getConfig('prefix')) || "/api/0.5/";

    HookTools.bindRouter(baseRoute + 'api/:method', controllerApi);
    HookTools.bindRouter(baseRoute + 'cart/add', controllerCart.add, 'PUT');
    HookTools.bindRouter(baseRoute + 'cart/remove', controllerCart.remove, 'PUT');
    HookTools.bindRouter(baseRoute + 'cart/set', controllerCart.set, 'POST');
    HookTools.bindRouter(baseRoute + 'cart/setcomment', controllerCart.setComment, 'POST');
    HookTools.bindRouter(baseRoute + 'cart', controllerCart.get, 'GET');
    HookTools.bindRouter(baseRoute + 'menu', controllerMenu);
    HookTools.bindRouter(baseRoute + 'order', controllerOrder, 'POST');
    HookTools.bindRouter(baseRoute + 'system', controllerSystem);
    HookTools.bindRouter(baseRoute + 'delivery', controllerGetDeliveries);
    HookTools.bindRouter(baseRoute + 'check', controllerCheck, 'POST');
    HookTools.bindRouter(baseRoute + 'order/:orderNumber', controllerGetOrder, 'GET');
    HookTools.bindRouter(baseRoute + 'paymentmethods', controllerPaymentMethod, 'GET');
    HookTools.bindRouter(baseRoute + 'restrictions', controllerRestrictions, 'GET');
  } catch (e) {
    sails.log.error('api > afterHook > error1', e);
  }
}
