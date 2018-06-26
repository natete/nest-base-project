import { ArgumentMetadata, BadRequestException, PipeTransform } from '@nestjs/common';

export class ParseIntWithOptionsPipe implements PipeTransform {

  constructor(private defaultValue?: number) {}

  transform(value: string, metadata: ArgumentMetadata): number {

    if (value) {
      const isNumeric = !isNaN(parseFloat(value)) && isFinite(+value);
      if (!isNumeric) {
        throw new BadRequestException(`Validation failed. Numeric string is expected for field \'${metadata.data}\'`);
      }
      return parseInt(value, 10);
    } else {
      return this.defaultValue;
    }
  }
}