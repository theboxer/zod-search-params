import { z } from 'zod';

import { parseSearchParams } from '../index';

describe('Testing arrays', () => {
  test('pass array', () => {
    const schema = z.object({
      array: z.array(z.string()).catch([]),
    });

    const params = parseSearchParams(schema, {
      array: ['123', '456'],
    });

    expect(params).toEqual({
      array: ['123', '456'],
    });
  });

  test('pass string', () => {
    const schema = z.object({
      array: z.array(z.string()).catch([]),
    });

    const params = parseSearchParams(schema, {
      array: '123',
    });

    expect(params).toEqual({
      array: ['123'],
    });
  });

  test('pass number', () => {
    const schema = z.object({
      array: z.array(z.number()).catch([]),
    });

    const params = parseSearchParams(schema, {
      // @ts-expect-error Number is not allowed by SearchParams type
      array: 123,
    });

    expect(params).toEqual({
      array: [123],
    });
  });

  test('transform', () => {
    const schema = z.object({
      array: z
        .string()
        .catch('')
        .transform((s) => s.split(','))
        .catch([]),
    });

    const params = parseSearchParams(schema, {
      array: '1,2,3',
    });

    expect(params).toEqual({
      array: ['1', '2', '3'],
    });
  });

  test('preprocess', () => {
    const schema = z.object({
      array: z
        .preprocess((val: unknown) => {
          if (typeof val !== 'string') {
            return val;
          }
          return val.split(',');
        }, z.array(z.string()))
        .catch([]),
    });

    const params = parseSearchParams(schema, {
      array: '1,2,3',
    });

    expect(params).toEqual({
      array: ['1', '2', '3'],
    });
  });
});
