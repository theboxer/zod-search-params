import type { ZodObject, ZodRawShape, ZodTypeAny, infer as zodInfer } from 'zod/v3';

type HasCatch<O extends ZodTypeAny> = O['_def'] extends { typeName: 'ZodCatch' }
  ? true
  : O['_def'] extends { innerType: ZodTypeAny }
    ? HasCatch<O['_def']['innerType']>
    : never;

type MappedSchema<T extends Record<string, ZodTypeAny>> = {
  [K in keyof T]: HasCatch<T[K]> extends never ? true : never;
};

type AnyHasCatch<T> = T[keyof T] extends never ? true : false;

export type MaybeSafeSchema<O extends ZodRawShape> = AnyHasCatch<
  MappedSchema<ReturnType<ZodObject<O>['_def']['shape']>>
> extends true
  ? zodInfer<ZodObject<O>>
  : zodInfer<ZodObject<O>> | undefined;

export type SearchParams = Record<string, string | (string | undefined)[] | undefined>;
