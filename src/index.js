"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSearchParams = void 0;
var modifySchema = function (zodType, key, object) {
    if (zodType._def.typeName === 'ZodBoolean') {
        if (!object || object[key] === undefined) {
            return;
        }
        var value = object[key];
        object[key] = Array.isArray(value)
            ? value.map(function (v) { return (safeJsonParse(v) ? 'true' : undefined); })
            : safeJsonParse(object[key])
                ? 'true'
                : undefined;
        zodType._def.coerce = true;
        return;
    }
    if (zodType._def.typeName === 'ZodArray') {
        return modifySchema(zodType._def.type, key, object);
    }
    if ('coerce' in zodType._def) {
        if (!object || object[key] === undefined) {
            return;
        }
        zodType._def.coerce = true;
        return;
    }
    if ('innerType' in zodType._def) {
        return modifySchema(zodType._def.innerType, key, object);
    }
    return;
};
var expectsArray = function (zodType) {
    if (!(zodType === null || zodType === void 0 ? void 0 : zodType._def))
        return false;
    if (zodType._def.typeName === 'ZodArray')
        return true;
    if (zodType._def.typeName === 'ZodLazy') {
        return expectsArray(zodType._def.getter());
    }
    if ('options' in zodType._def) {
        return zodType._def.options.some(expectsArray);
    }
    if ('innerType' in zodType._def) {
        return expectsArray(zodType._def.innerType);
    }
    return false;
};
var isSearchParams = function (maybeSearchParams) {
    return !!(maybeSearchParams &&
        typeof maybeSearchParams === 'object' &&
        'keys' in maybeSearchParams &&
        'getAll' in maybeSearchParams &&
        maybeSearchParams.keys &&
        maybeSearchParams.getAll &&
        typeof maybeSearchParams.keys === 'function' &&
        typeof maybeSearchParams.getAll === 'function');
};
var safeJsonParse = function (string) {
    try {
        return JSON.parse(string);
    }
    catch (_a) {
        return string;
    }
};
var urlSearchParamsToObject = function (searchParams) {
    return Array.from(searchParams.keys()).reduce(function (acc, item) {
        var value = searchParams.getAll(item);
        acc[item] = value.length === 1 ? value[0] : value;
        return acc;
    }, {});
};
var parseSearchParams = function (schema, searchParams) {
    var _a;
    var object = (_a = (isSearchParams(searchParams) ? urlSearchParamsToObject(searchParams) : searchParams)) !== null && _a !== void 0 ? _a : {};
    var shape = schema._def.shape();
    var allTypes = Object.entries(shape);
    allTypes.forEach(function (_a) {
        var key = _a[0], type = _a[1];
        return modifySchema(type, key, object);
    });
    var keys = Object.keys(object);
    var processedObject = keys.reduce(function (acc, item) {
        if (shape[item]) {
            acc[item] = expectsArray(shape[item])
                ? Array.isArray(object[item])
                    ? object[item]
                    : [object[item]]
                : object[item];
        }
        return acc;
    }, {});
    try {
        return schema.parse(processedObject);
    }
    catch (_b) {
        // @ts-expect-error Undefined is return only in specific case, not sure how to fix this on the types level
        return undefined;
    }
};
exports.parseSearchParams = parseSearchParams;
