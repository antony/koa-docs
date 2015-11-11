'use strict';

const t = require('koa-joi-router').Joi;

const Order = t.object().label('Order').keys({
   id: t.number(),
   petId: t.number(),
   quantity: t.number(),
   shipDate: t.date(),
   status: t.string().valid(['placed', 'approved', 'delivered']),
   complete: t.boolean()
});

const Quantity = t.number().integer().label('Quantity');

const storeInventory = {
   method: 'get',
   path: '/store/inventory',
   meta: {
      friendlyName: 'Store inventory',
      description: 'Returns pet inventories by status',
      extendedDescription: `
         **Implementation notes**
         * Returns a map of status codes to quantities
      `
   },
   validate: {
      output: {
         available: Quantity.description('Pets available for sale'),
         pending: Quantity.description('# of pets awaiting processing'),
         sold: Quantity.description('# of pets sold')
      }
   },
   *handler () {
      // This route does not have any validations
      return this.db().table('store')
         .groupBy('statusCode')
         .map('quantity')
         .run();
   }
};

const orderPet = {
   method: 'post',
   path: '/store/order',
   meta: {
      friendlyName: 'Place an order for a pet'
   },
   validate: {
      type: 'json',
      body: Order
   },
   *handler () {
      const order = this.request.body;
      yield this.db().table('orders').insert(order).run();
   }
};

module.exports = [
   storeInventory,
   orderPet
];
