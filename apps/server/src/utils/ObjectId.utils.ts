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

/**
 * Converts numeric string values in MongoDB query operators to numbers
 * Handles operators like $gte, $lte, $gt, $lt, $eq, etc.
 */
const convertNumericOperators = (obj: Record<string, any>): Record<string, any> => {
  const result = { ...obj };
  const numericOperators = ['$gte', '$lte', '$gt', '$lt', '$eq', '$ne'];

  for (const key in obj) {
    const value = obj[key];

    // If this is a MongoDB operator with a numeric string value, convert it
    if (numericOperators.includes(key) && typeof value === 'string' && !isNaN(Number(value))) {
      const numValue = Number(value);
      // Only convert if it's a valid number (not NaN)
      if (!isNaN(numValue)) {
        result[key] = numValue;
      }
    }
    // Handle nested objects - recursively process them
    else if (value && typeof value === 'object' && !(value instanceof Types.ObjectId) && !(value instanceof Date) && !Array.isArray(value)) {
      result[key] = convertNumericOperators(value);
    }
  }
  return result;
};

export const convertObjectValuesToObjectId = (obj: Record<string, any>): Record<string, any> => {
  const result = { ...obj };
  for (const key in obj) {
    const value = obj[key];

    // Handle string values that are valid ObjectIds
    if (typeof value === 'string' && Types.ObjectId.isValid(value)) {
      result[key] = convertToObjectId(value as string);
    }
    // Handle arrays - recursively process each item
    else if (Array.isArray(value)) {
      result[key] = value.map((item) => {
        if (typeof item === 'string' && Types.ObjectId.isValid(item)) {
          return convertToObjectId(item);
        } else if (item && typeof item === 'object' && !(item instanceof Types.ObjectId) && !(item instanceof Date)) {
          return convertObjectValuesToObjectId(item);
        }
        return item;
      });
    }
    // Handle nested objects - recursively process them
    else if (value && typeof value === 'object' && !(value instanceof Types.ObjectId) && !(value instanceof Date) && !Array.isArray(value)) {
      result[key] = convertObjectValuesToObjectId(value);
    }
  }

  // After converting ObjectIds, also convert numeric operators
  return convertNumericOperators(result);
};
