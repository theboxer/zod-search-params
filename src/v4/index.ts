import type { ZodRawShape, ZodObject, core } from 'zod/v4';

import { MaybeSafeSchema, SearchParams } from './types';

let schemaChanges: core.$ZodTypeDef[] = [];

const modifySchema = (zodType: core.$ZodType, key: string, object: SearchParams): void => {
  if (zodType._zod.def.type === 'boolean') {
    if (!object || object[key] === undefined) {
      return;
    }
    const value = object[key];
    object[key] = Array.isArray(value)
      ? value.map((v) => (safeJsonParse(v as string) ? 'true' : undefined))
      : safeJsonParse(object[key] as string)
        ? 'true'
        : undefined;

    // @ts-expect-error coerce
    zodType.def.coerce = true;
    schemaChanges.push(zodType._zod.def);

    return;
  }

  if (zodType._zod.def.type === 'array') {
    // @ts-expect-error element exists in array
    return modifySchema(zodType.def.element, key, object);
  }

  if (zodType._zod.def.type === 'pipe') {
    // @ts-expect-error in exists in pipe
    return modifySchema(zodType.def.in, key, object);
  }

  if ('innerType' in zodType._zod.def) {
    // @ts-expect-error innerType exists
    return modifySchema(zodType.def.innerType, key, object);
  }

  if (!object || object[key] === undefined) {
    return;
  }

  const value = object[key];
  if (value !== undefined) {
    // @ts-expect-error coerce
    zodType.def.coerce = true;
    schemaChanges.push(zodType._zod.def);
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

const expectsArray = (zodType?: core.$ZodType): boolean => {
  if (!zodType?._zod.def) return false;

  if (zodType._zod.def.type === 'array') return true;

  if (zodType._zod.def.type === 'lazy') {
    // @ts-expect-error getter exists in lazy
    return expectsArray(zodType.def.getter());
  }

  if (zodType._zod.def.type === 'pipe') {
    // @ts-expect-error in exists
    return expectsArray(zodType.def.in);
  }

  if ('options' in zodType._zod.def) {
    // @ts-expect-error options exists
    return zodType._zod.def.options.some(expectsArray);
  }

  if ('innerType' in zodType._zod.def) {
    // @ts-expect-error inner type
    return expectsArray(zodType.def.innerType);
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

  const shape = schema.def.shape;
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
