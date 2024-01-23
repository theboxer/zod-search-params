# zod-search-params
> zod-search-params is a library for parsing and validating search params in the browser.

## Features
- Predictable output
- Type safety
- Easy to use

## How to use
### Install
```shell
yarn add zod-search-params
```

### Define Schema
Do **NOT** use `coerce` in the schema, coerce is applied automatically (to prevent casting `undefined` to `"undefined"` etc.) for enabled types, when it's needed.
```ts
const schema = z.object({
  search: z.string().catch(''),
  page: z.number().catch(1),
});
```

### Parse search params
```ts
import { parseSearchParams } from 'zod-search-params';
const parsedSearchParams = parseSearchParams(schema, urlSearchParams);
```

## Type safety
### Always data
If all object properties within the zod schema are defined with `.catch()`, the output will always be an object with the same properties as the schema, but with the default values.

```ts
import { parseSearchParams } from 'zod-search-params';

const schema = z.object({
  search: z.string().catch(''),
  page: z.number().catch(1),
});

const parsedSearchParams = parseSearchParams(schema);
/*
typeof parsedSearchParams
{
  search: string,
  page: number,
}
 */
```

### Optional data
If one or all object properties within the zod schema don't have `.catch()`, the output will be an object with the same properties as the schema or `undefined`. Where the `undefined` will return if parsing of the search params fail (for example passing string into a number).

```ts
import { parseSearchParams } from 'zod-search-params';

const schema = z.object({
  search: z.string().catch(''),
  page: z.number(),
});

const parsedSearchParams = parseSearchParams(schema);
/*
typeof parsedSearchParams
undefined | {
  search: string,
  page: number,
}
 */
```

### Always data with optional properties
Using `.optional()` on a property will make the property optional, can be also chained with `.default()` to provide a default value.

```ts
import { parseSearchParams } from 'zod-search-params';

const schema = z.object({
  search: z.string().catch(''),
  page: z.number().optional().catch(undefined),
  sort: z.string().optional().default('name').catch('name'),
});

const parsedSearchParams = parseSearchParams(schema);
/*
typeof parsedSearchParams
{
  search: string,
  page?: number,
  sort: string,
}
 */
```

## Examples

### Basic example
```ts
import { URLSearchParams } from 'url';

const schema = z.object({
  search: z.string().catch(''),
  page: z.number().catch(1),
});

const objectParams = {
  search: 'hello',
  page: '2',
};

const urlParams = new URLSearchParams();
urlParams.append('search', 'hello');
urlParams.append('page', '2');

console.log(parseSearchParams(schema, objectParams));
console.log(parseSearchParams(schema, urlParams));

/* 
OUTPUTS:
{
  search: 'hello',
  page: 2,
 }
 */
```

### Array support
```ts
import { URLSearchParams } from 'url';

const schema = z.object({
  tags: z.array(z.string()).catch([]),
  ids: z.array(z.number()).catch([]),
});

const objectParams = {
  tags: ['zod', 'typescript'],
  ids: '42',
};

const urlParams = new URLSearchParams();
urlParams.append('tags', 'zod');
urlParams.append('tags', 'typescript');
urlParams.append('ids', '42');

console.log(parseSearchParams(schema, objectParams));
console.log(parseSearchParams(schema, urlParams));

/* 
OUTPUTS:
{
  tags: ['zod', 'typescript'],
  ids: [42],
 }
 */
```