import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

export const convertToObjectId = (id: string | Types.ObjectId) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new BadRequestException('Invalid ID');
  }
  if (id instanceof Types.ObjectId) {
    return id;
  }
  return new Types.ObjectId(id);
};

export const convertObjectValuesToObjectId = (obj: Record<string, any>): Record<string, any> => {
  const result = { ...obj };
  for (const key in obj) {
    const value = obj[key];
    if (typeof value == 'string' && Types.ObjectId.isValid(value)) {
      result[key] = convertToObjectId(value as string);
    }
  }
  return result;
};
