import { z } from 'zod/v4';

import { parseSearchParams } from '../../v4';

const catchValues = {
  string: 'ERROR',
  number: 999,
  boolean: true,
  stringArray: [],
  numberArray: [],
  booleanArray: [],
};

const schema = z.object({
  string: z.string().catch(catchValues.string),
  number: z.number().catch(catchValues.number),
  boolean: z.boolean().catch(catchValues.boolean),
  stringArray: z.array(z.string()).catch(catchValues.stringArray),
  numberArray: z.array(z.number()).catch(catchValues.numberArray),
  booleanArray: z.array(z.boolean()).catch(catchValues.booleanArray),
});

describe('Testing empty search params', () => {
  test('return catch values for undefined search params', () => {
    const params = parseSearchParams(schema);
    expect(params).toEqual(catchValues);
  });

  test('return catch values for empty search params', () => {
    const params = parseSearchParams(schema, {});
    expect(params).toEqual(catchValues);
  });

  test('return catch values for explicit undefined values in search params', () => {
    const params = parseSearchParams(schema, {
      string: undefined,
      number: undefined,
      boolean: undefined,
      stringArray: [],
      numberArray: [],
      booleanArray: [],
    });
    expect(params).toEqual(catchValues);

    const params2 = parseSearchParams(schema, {
      string: 'ok',
      boolean: 'false',
    });
    expect(params2).toEqual({ ...catchValues, string: 'ok', boolean: false });

    const nextParams = parseSearchParams(schema, {
      string: undefined,
      boolean: undefined,
    });
    expect(nextParams).toEqual(catchValues);
  });
});
