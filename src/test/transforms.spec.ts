import { z } from 'zod';

import { parseSearchParams } from '../index';

const schema = z.object({
  strToBool: z
    .string()
    .transform((val) => val.length >= 5)
    .catch(false),
  numbersArray: z
    .array(z.number())
    .transform((values) => {
      return [...Array.from(new Set(values))];
    })
    .catch([]),
});

describe('Testing transform', () => {
  const data = {
    strToBool: '12345',
    numbersArray: ['1', '1'],
  };

  test('pass expected', () => {
    const params = parseSearchParams(schema, data);

    expect(params).toEqual({
      strToBool: true,
      numbersArray: [1],
    });
  });
});
