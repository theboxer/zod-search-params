import type { ZodObject, ZodRawShape, infer as zodInfer, ZodType } from 'zod/v4';

type HasCatch<O extends ZodType> = O['def'] extends { typeName: 'ZodCatch' }
  ? true
  : O['def'] extends { innerType: ZodType }
    ? HasCatch<O['def']['innerType']>
    : never;

type MappedSchema<T extends ZodRawShape> = {
  [K in keyof T]: T[K] extends ZodType ? (HasCatch<T[K]> extends never ? true : never) : never;
};

type AnyHasCatch<T> = T[keyof T] extends never ? true : false;

export type MaybeSafeSchema<O extends ZodRawShape> = AnyHasCatch<
  MappedSchema<ZodObject<O>['def']['shape']>
> extends true
  ? zodInfer<ZodObject<O>>
  : zodInfer<ZodObject<O>> | undefined;

export type SearchParams = Record<string, string | (string | undefined)[] | undefined>;
