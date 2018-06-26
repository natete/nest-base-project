import { ParseIntWithOptionsPipe } from './parse-int-with-options.pipe';
import { ArgumentMetadata } from '@nestjs/common';

describe('Parse with options pipe', () => {
  const metadata: ArgumentMetadata = { type: 'query', data: 'name' };

  it('should return the provided value to transform', () => {
    const value = '4';
    const pipe = new ParseIntWithOptionsPipe();

    const result = pipe.transform(value, metadata);

    expect(result).toBe(+value);
  });

  it('should return the default value when no value to transform and default value provided', () => {

    const defaultValue = 4;

    const pipe = new ParseIntWithOptionsPipe(defaultValue);

    const result = pipe.transform(undefined, metadata);

    expect(result).toBe(defaultValue);
  });

  it('should return null when no value or default value are provided', () => {
    const pipe = new ParseIntWithOptionsPipe();

    const result = pipe.transform(undefined, metadata);

    expect(result).toBeUndefined();
  });

  it('should fail on non numeric value', () => {
    const pipe = new ParseIntWithOptionsPipe();

    expect(() => pipe.transform('foo', metadata))
      .toThrow();
  });
});