import { z } from 'zod/v4';

import { parseSearchParams } from '../../v4';

const catchValues = {
  string: 'ERROR',
  stringArray: [],
};

const schema = z.object({
  string: z.string().catch(catchValues.string),
  stringArray: z.array(z.string()).catch(catchValues.stringArray),
});

describe('Testing strings', () => {
  test('pass numbers', () => {
    const params = parseSearchParams(schema, {
      string: '123',
      stringArray: ['123', '456'],
    });

    expect(params).toEqual({
      string: '123',
      stringArray: ['123', '456'],
    });
  });

  test('pass real numbers', () => {
    const params = parseSearchParams(schema, {
      // @ts-expect-error Number is not allowed by SearchParams type
      string: 123,
      // @ts-expect-error Number is not allowed by SearchParams type
      stringArray: [123, 456],
    });

    expect(params).toEqual({
      string: '123',
      stringArray: ['123', '456'],
    });
  });

  test('pass strings', () => {
    const params = parseSearchParams(schema, {
      string: 'test',
      stringArray: ['test1', 'test2'],
    });

    expect(params).toEqual({
      string: 'test',
      stringArray: ['test1', 'test2'],
    });
  });

  test('pass booleans', () => {
    const params = parseSearchParams(schema, {
      string: 'true',
      stringArray: ['true', 'false'],
    });

    expect(params).toEqual({
      string: 'true',
      stringArray: ['true', 'false'],
    });
  });

  test('pass real booleans', () => {
    const params = parseSearchParams(schema, {
      // @ts-expect-error Number is not allowed by SearchParams type
      string: true,
      // @ts-expect-error Boolean is not allowed by SearchParams type
      stringArray: [true, false],
    });

    expect(params).toEqual({
      string: 'true',
      stringArray: ['true', 'false'],
    });
  });
});
