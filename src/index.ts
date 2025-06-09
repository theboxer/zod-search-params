import type { ZodTypeAny, ZodRawShape, ZodObject } from 'zod';

import { MaybeSafeSchema, SearchParams } from './types';

let schemaChanges: ZodTypeAny[] = [];

const modifySchema = (zodType: ZodTypeAny, key: string, object: SearchParams): void => {
  if (zodType._def.typeName === 'ZodBoolean') {
    if (!object || object[key] === undefined) {
      return;
    }
    const value = object[key];
    object[key] = Array.isArray(value)
      ? value.map((v) => (safeJsonParse(v as string) ? 'true' : undefined))
      : safeJsonParse(object[key] as string)
        ? 'true'
        : undefined;

    zodType._def.coerce = true;
    schemaChanges.push(zodType._def);

    return;
  }

  if (zodType._def.typeName === 'ZodArray') {
    return modifySchema(zodType._def.type, key, object);
  }

  if (zodType._def.typeName === 'ZodEffects') {
    return modifySchema(zodType._def.schema, key, object);
  }

  if ('coerce' in zodType._def) {
    if (!object || object[key] === undefined) {
      return;
    }

    const value = object[key];
    if (value !== undefined) {
      zodType._def.coerce = true;
      schemaChanges.push(zodType._def);
    }

    return;
  }

  if ('innerType' in zodType._def) {
    return modifySchema(zodType._def.innerType, key, object);
  }

  return;
};

const revertSchema = (): void => {
  schemaChanges.forEach((type) => {
    if ('coerce' in type) {
      type.coerce = false;
    }
  });

  schemaChanges = [];
};

const expectsArray = (zodType?: ZodTypeAny): boolean => {
  if (!zodType?._def) return false;

  if (zodType._def.typeName === 'ZodArray') return true;

  if (zodType._def.typeName === 'ZodLazy') {
    return expectsArray(zodType._def.getter());
  }

  if (zodType._def.typeName === 'ZodEffects') {
    if (zodType._def.effect.type === 'preprocess') {
      return false;
    }

    return expectsArray(zodType._def.schema);
  }

  if ('options' in zodType._def) {
    return zodType._def.options.some(expectsArray);
  }

  if ('innerType' in zodType._def) {
    return expectsArray(zodType._def.innerType);
  }

  return false;
};

const isSearchParams = (maybeSearchParams: unknown): maybeSearchParams is URLSearchParams => {
  return !!(
    maybeSearchParams &&
    typeof maybeSearchParams === 'object' &&
    'keys' in maybeSearchParams &&
    'getAll' in maybeSearchParams &&
    maybeSearchParams.keys &&
    maybeSearchParams.getAll &&
    typeof maybeSearchParams.keys === 'function' &&
    typeof maybeSearchParams.getAll === 'function'
  );
};

const safeJsonParse = (string: string): unknown => {
  try {
    return JSON.parse(string);
  } catch {
    return string;
  }
};

const urlSearchParamsToObject = (searchParams: URLSearchParams): SearchParams => {
  return Array.from(searchParams.keys()).reduce((acc, item) => {
    const value = searchParams.getAll(item);
    acc[item] = value.length === 1 ? value[0] : value;
    return acc;
  }, {} as SearchParams);
};

export const parseSearchParams = <O extends ZodRawShape>(
  schema: ZodObject<O>,
  searchParams?: SearchParams | URLSearchParams,
): MaybeSafeSchema<O> => {
  const object = structuredClone(
    (isSearchParams(searchParams) ? urlSearchParamsToObject(searchParams) : searchParams) ?? {},
  );

  const shape = schema._def.shape();
  const allTypes = Object.entries(shape);
  allTypes.forEach(([key, type]) => modifySchema(type, key, object));

  const keys = Object.keys(object);
  const processedObject = keys.reduce(
    (acc, item) => {
      if (shape[item]) {
        acc[item] = expectsArray(shape[item])
          ? Array.isArray(object[item])
            ? object[item]
            : [object[item]]
          : object[item];
      }
      return acc;
    },
    {} as Record<string, unknown>,
  );

  try {
    const parsedQuery = schema.parse(processedObject);
    revertSchema();

    return parsedQuery;
  } catch {
    revertSchema();
    // @ts-expect-error Undefined is return only in specific case, not sure how to fix this on the types level
    return undefined;
  }
};
