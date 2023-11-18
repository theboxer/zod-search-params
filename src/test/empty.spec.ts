import { z } from 'zod';

import { parseSearchParams } from '../index';

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
});
