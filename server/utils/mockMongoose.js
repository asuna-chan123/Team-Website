const mongoose = require('mongoose');
const MockModel = require('./mockModel');

function createDynamicModel(modelName, schema) {
  let mongooseModel;
  let mockModel;

  const getTarget = () => {
    // If MongoDB is connected (readyState === 1), use real mongoose model
    if (mongoose.connection.readyState === 1) {
      if (!mongooseModel) {
        try {
          mongooseModel = mongoose.model(modelName);
        } catch {
          mongooseModel = mongoose.model(modelName, schema);
        }
      }
      return mongooseModel;
    } else {
      // Otherwise use mock JSON model
      if (!mockModel) {
        mockModel = new MockModel(modelName, schema);
      }
      return mockModel;
    }
  };

  // The proxy is also a constructor, so it supports `new Model(...)`
  const handler = {
    construct(target, args) {
      const activeTarget = getTarget();
      if (typeof activeTarget === 'function') {
        // Mongoose model constructor
        return Reflect.construct(activeTarget, args);
      } else {
        // MockModel fallback
        const doc = args[0] || {};
        return activeTarget._wrapDoc(doc);
      }
    },
    get(target, prop) {
      const activeTarget = getTarget();
      // If it's the mongoose connection object or similar, return it
      if (prop === '_getTarget') {
        return getTarget;
      }
      const val = activeTarget[prop];
      if (typeof val === 'function') {
        return val.bind(activeTarget);
      }
      return val;
    }
  };

  // We return a proxy that wraps a dummy function so it can be constructable
  return new Proxy(function() {}, handler);
}

module.exports = {
  createDynamicModel
};
