import actions from "@webresto/core/lib/actions";
import Cart from "@webresto/core/models/Cart";
import Address from "@webresto/core/modelsHelp/Address";
import Street from "@webresto/core/models/Street";
import Condition from "@webresto/core/models/Condition";

export default async function (req: ReqType, res: ResType) {
  const address = <Address>req.param('address');
  const cartId = <string>req.param('cartId');
  const self = <boolean>req.param('selfDelivery');

  /**
   * VALIDATION
   */
  if (!cartId) {
    return res.badRequest('cartId is required');
  }

  if (typeof cartId !== 'string') {
    return res.badRequest('cartId must be a string');
  }

  try {
    const cart1 = await Cart.findOne(cartId);

    if (!cart1) {
      return res.json(404, {
        message: {
          type: 'error',
          title: 'not found',
          body: 'Cart with id ' + cartId + ' not found'
        }
      });
    }

    let cart = await Cart.returnFullCart(cart1);

    if (!self) {
      /**
       * VALIDATION
       */
      if (!address) {
        return res.badRequest('address is required');
      }

      if (!address.streetId) {
        return res.badRequest('address.streetId is required');
      }
      if (!address.home) {
        return res.badRequest('address.home is required');
      }

      const street = await Street.findOne(address.streetId);
      if (!street) {
        return res.json(404, "street not found");
      }
      address.street = street;

      cart.address = address;

      if (!await Condition.checkConditionsExists(cart)) {
        await actions.delivery({deliveryCost: 0, cartId: cartId});
        const cart1 = await Cart.returnFullCart(cart);
        return res.json({
          cart: cart1,
          message: {
            type: 'info',
            title: 'Стоимость доставки расчитана успешно.',
            body: ''
          }
        });
      }

      await cart.setSelfDelivery(false);

      await actions.reset(cartId);

      try {
        const conds = await Condition.getConditions(street.name, address.home);

        const cond = await execute(conds, cart);

        let msg = '';
        if (!cond)
          msg = sails.config.restocore.zoneDontWork || 'Доставка не может быть расчитана';
        const cart2 = await Cart.returnFullCart(cart);
        return res.json({
          cart: cart2,
          message: {
            type: 'info',
            title: cart2.message || msg || 'Стоимость доставки расчитана успешно.',
            body: cart2.message || msg || 'Стоимость доставки расчитана успешно.'
          }
        });
      } catch (e) {
        if (e.code === 404) {
          const cart = await Cart.returnFullCart(cart1);
          return res.json(404, {
            cart: cart,
            message: {
              type: 'info',
              title: '',
              body: sails.config.restocore.zoneNotFound || 'Улица не входит в зону доставки.'
            }
          });
        }

        return res.serverError(e);
      }
    } else {
      try {
        await cart.setSelfDelivery(true);

        const cart1 = await Cart.returnFullCart(cart);
        return res.json({
          cart: cart1,
          message: {
            type: "info",
            title: "ok",
            body: ""
          }

        });
      } catch (e) {
        return res.serverError(e);
      }
    }
  } catch (e) {
    return res.serverError(e);
  }
};

async function execute(conds: Condition[], cart: Cart): Promise<Condition> {
  let cond: Condition = null;
  for (let c of conds) {
    if (await c.check(cart)) {
      cond = c;
      await c.exec(cart);
      if (c.hasReturn()) {
        break;
      }
    }
  }
  return cond;
}
