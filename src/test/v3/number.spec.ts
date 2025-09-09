import { z } from 'zod/v3';

import { parseSearchParams } from '../../v3';

const catchValues = {
  number: 999,
  numberArray: [],
};

const schema = z.object({
  number: z.number().catch(catchValues.number),
  numberArray: z.array(z.number()).catch(catchValues.numberArray),
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

  test('pass lazy string', () => {
    const schema = z.object({
      array: z.lazy(() => {
        return z.array(z.string()).catch([]);
      }),
    });

    const params = parseSearchParams(schema, {
      array: '123',
    });

    expect(params).toEqual({
      array: ['123'],
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
