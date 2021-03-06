'use strict';

const { combineDefaultOptions } = require('./utils');
const { isFunction, isArray, isObject } = require('./detector');

const isParamsValid = params => {
  if (isArray(params) && (params.length === 1 || params.length === 2)) {
    if (params.length === 2) {
      return isObject(params[1]);
    }
    return true;
  }
  return false;
};

const parserMaker = (...params) => {
  if (!isParamsValid(params)) {
    throw new TypeError('Invalid setup for "transform" type');
  }

  return (key, value, info) => {
    let parsedVal = null;

    parsedVal = isFunction(params[0])
      ? params[0].apply(null, [value, info])
      : params[0];

    return [parsedVal === null, parsedVal];
  };
};

const validate = paramsOrOptions => (key, value, paramsOrOptions) => [[], true];

const getOptions = () => combineDefaultOptions();

const getTypeOptions = () => ({ isDirectValueSet: true });

module.exports = {
  getTypeOptions,
  parserMaker,
  validate,
  getOptions
};
