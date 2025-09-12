import { z } from 'zod/v3';

import { parseSearchParams } from '../../v3';

// Helpers to assert exact type equality at compile time
type Expect<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
  ? true
  : false;

{
  const schema = z.object({
    string: z.string().catch(''),
    number: z.number().catch(0),
    boolean: z.boolean().catch(true),
    stringArray: z.array(z.string()).catch([]),
    numberArray: z.array(z.number()).catch([]),
    booleanArray: z.array(z.boolean()).catch([]),
  });

  type Schema = {
    string: string;
    number: number;
    boolean: boolean;
    stringArray: string[];
    numberArray: number[];
    booleanArray: boolean[];
  };

  const parsed = parseSearchParams(schema);
  type _test = Expect<Equal<typeof parsed, Schema>>;
}

{
  const schema = z.object({
    string: z.string(),
    number: z.number().catch(0),
    boolean: z.boolean().catch(true),
    stringArray: z.array(z.string()).catch([]),
    numberArray: z.array(z.number()).catch([]),
    booleanArray: z.array(z.boolean()).catch([]),
  });

  type Schema =
    | {
        string: string;
        number: number;
        boolean: boolean;
        stringArray: string[];
        numberArray: number[];
        booleanArray: boolean[];
      }
    | undefined;

  const parsed = parseSearchParams(schema);
  type _test = Expect<Equal<typeof parsed, Schema>>;
}

{
  const schema = z.object({
    string: z.string().catch(''),
    number: z.number(),
    boolean: z.boolean().catch(true),
    stringArray: z.array(z.string()).catch([]),
    numberArray: z.array(z.number()).catch([]),
    booleanArray: z.array(z.boolean()).catch([]),
  });

  type Schema =
    | {
        string: string;
        number: number;
        boolean: boolean;
        stringArray: string[];
        numberArray: number[];
        booleanArray: boolean[];
      }
    | undefined;

  const parsed = parseSearchParams(schema);
  type _test = Expect<Equal<typeof parsed, Schema>>;
}

{
  const schema = z.object({
    string: z.string().catch(''),
    number: z.number().catch(0),
    boolean: z.boolean(),
    stringArray: z.array(z.string()).catch([]),
    numberArray: z.array(z.number()).catch([]),
    booleanArray: z.array(z.boolean()).catch([]),
  });

  type Schema =
    | {
        string: string;
        number: number;
        boolean: boolean;
        stringArray: string[];
        numberArray: number[];
        booleanArray: boolean[];
      }
    | undefined;

  const parsed = parseSearchParams(schema);
  type _test = Expect<Equal<typeof parsed, Schema>>;
}

{
  const schema = z.object({
    string: z.string().catch(''),
    number: z.number().catch(0),
    boolean: z.boolean().catch(true),
    stringArray: z.array(z.string()),
    numberArray: z.array(z.number()).catch([]),
    booleanArray: z.array(z.boolean()).catch([]),
  });

  type Schema =
    | {
        string: string;
        number: number;
        boolean: boolean;
        stringArray: string[];
        numberArray: number[];
        booleanArray: boolean[];
      }
    | undefined;

  const parsed = parseSearchParams(schema);
  type _test = Expect<Equal<typeof parsed, Schema>>;
}

{
  const schema = z.object({
    string: z.string().catch(''),
    number: z.number().catch(0),
    boolean: z.boolean().catch(true),
    stringArray: z.array(z.string()).catch([]),
    numberArray: z.array(z.number()),
    booleanArray: z.array(z.boolean()).catch([]),
  });

  type Schema =
    | {
        string: string;
        number: number;
        boolean: boolean;
        stringArray: string[];
        numberArray: number[];
        booleanArray: boolean[];
      }
    | undefined;

  const parsed = parseSearchParams(schema);
  type _test = Expect<Equal<typeof parsed, Schema>>;
}

{
  const schema = z.object({
    string: z.string().catch(''),
    number: z.number().catch(0),
    boolean: z.boolean().catch(true),
    stringArray: z.array(z.string()).catch([]),
    numberArray: z.array(z.number()).catch([]),
    booleanArray: z.array(z.boolean()),
  });

  type Schema =
    | {
        string: string;
        number: number;
        boolean: boolean;
        stringArray: string[];
        numberArray: number[];
        booleanArray: boolean[];
      }
    | undefined;

  const parsed = parseSearchParams(schema);
  type _test = Expect<Equal<typeof parsed, Schema>>;
}

{
  const schema = z.object({
    string: z.string(),
  });

  type Schema = {
    string: string;
  };

  const parsed = parseSearchParams(schema);

  // @ts-expect-error this should fail
  type _test = Expect<Equal<typeof parsed, Schema>>;
}

{
  const schema = z.object({
    string: z.string(),
  });

  parseSearchParams(schema);
  parseSearchParams(schema, undefined);
  parseSearchParams(schema, {});
  parseSearchParams(schema, new URLSearchParams());

  // @ts-expect-error null is not allowed
  parseSearchParams(schema, null);
}

{
  parseSearchParams(z.object({ string: z.string() }));

  // @ts-expect-error null is not allowed
  parseSearchParams(z.string());

  // @ts-expect-error null is not allowed
  parseSearchParams(z.array(z.string()));
}
