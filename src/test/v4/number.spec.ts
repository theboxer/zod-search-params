import { z } from 'zod/v4';

import { parseSearchParams } from '../../v4';

const catchValues = {
  number: 999,
  numberArray: [],
};

const schema = z.object({
  number: z.coerce.number().catch(catchValues.number),
  numberArray: z.array(z.coerce.number()).catch(catchValues.numberArray),
});

describe('Testing numbers', () => {
  test('pass numbers', () => {
    const params = parseSearchParams(schema, {
      number: '123',
      numberArray: ['123', '456'],
    });

    expect(params).toEqual({
      number: 123,
      numberArray: [123, 456],
    });
  });

  test('pass real numbers', () => {
    const params = parseSearchParams(schema, {
      // @ts-expect-error Number is not allowed by SearchParams type
      number: 123,
      // @ts-expect-error Number is not allowed by SearchParams type
      numberArray: [123, 456],
    });

    expect(params).toEqual({
      number: 123,
      numberArray: [123, 456],
    });
  });

  test('pass strings', () => {
    const params = parseSearchParams(schema, {
      number: 'test',
      numberArray: ['test1', 'test2'],
    });

    expect(params).toEqual({
      number: 999,
      numberArray: [],
    });
  });

  test('pass booleans', () => {
    const params = parseSearchParams(schema, {
      number: 'true',
      numberArray: ['true', 'false'],
    });

    expect(params).toEqual({
      number: 999,
      numberArray: [],
    });
  });

  test('pass real booleans', () => {
    const params = parseSearchParams(schema, {
      // @ts-expect-error Number is not allowed by SearchParams type
      number: true,
      // @ts-expect-error Boolean is not allowed by SearchParams type
      numberArray: [true, false],
    });

    expect(params).toEqual({
      number: 1,
      numberArray: [1, 0],
    });
  });
});
