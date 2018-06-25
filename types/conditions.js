'use strict';

const { reduce } = require('lodash');
const { isArray, isFunction, isBoolean, isObject } = require('./detector');
const { combineDefaultOptions } = require('./utils');

const isParamsValid = params => {
  if (isArray(params) && (params.length === 1 || params.length === 3)) {
    if (params.length === 1) {
      const objArg = params[0];
      const validObj = isObject(objArg);
      if (!validObj) return false;

      return isFunction(objArg.evaluates) && objArg.onOk && objArg.onFail;
    } else {
      return isFunction(params[0]) && params[1] && params[2];
    }
  }

  return false;
};

const resolverEvaluator = (resolvers, value) => {
  if (isArray(resolvers)) {
    return reduce(
      resolvers,
      (initial, resolverFunction) => initial && resolverFunction(value),
      true
    );
  } else if (isFunction) {
    return resolvers(value);
  }
};

const evaluatesCondition = ({
  value,
  resolvers,
  positiveValue,
  negativeValue
}) => {
  const result = resolverEvaluator(resolvers, value);
  const resolvedValue = isBoolean(result)
    ? result ? positiveValue : negativeValue
    : negativeValue;
  return isFunction(resolvedValue) ? resolvedValue(value) : resolvedValue;
};

const parserMaker = (...params) => {
  if (!isParamsValid(params)) {
    throw new TypeError('Invalid setup for "conditions" type');
  }

  return (key, value) => {
    let parsedVal = null;

    if (params.length === 3) {
      const evaluator = params[0];
      const positiveValue = params[1];
      const negativeValue = params[2];
      parsedVal = evaluatesCondition({
        value,
        resolvers: evaluator,
        positiveValue,
        negativeValue
      });
    } else if (params.length === 1) {
      const objParam = params[0];
      const evaluator = objParam.evaluates;
      const positiveValue = objParam.onOk;
      const negativeValue = objParam.onFail;
      parsedVal = evaluatesCondition({
        value,
        resolvers: evaluator,
        positiveValue,
        negativeValue
      });
    }

    return [parsedVal === null, parsedVal];
  };
};

const validate = (key, value, paramsOrOptions) => {
  const errorDetails = [];
  const valid = true;
  return [errorDetails, valid];
};

const getOptions = () => combineDefaultOptions();

const getTypeOptions = () => ({ isDirectValueSet: true });

module.exports = {
  getTypeOptions,
  parserMaker,
  validate,
  getOptions
};