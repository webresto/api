'use strict';

module.exports = function (sails) {
  return {
    initialize: require('@webresto/api/lib/initialize').default(sails)
  };
};
