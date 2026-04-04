import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsPasswordStrong(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isPasswordStrong',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          // Min 8 chars, at least 1 uppercase, 1 lowercase, 1 digit
          const hasUpper = /[A-Z]/.test(value);
          const hasLower = /[a-z]/.test(value);
          const hasDigit = /\d/.test(value);
          const hasMinLength = value.length >= 8;
          return hasUpper && hasLower && hasDigit && hasMinLength;
        },
        defaultMessage(args: ValidationArguments) {
          return 'Password must be at least 8 characters with at least one uppercase letter, one lowercase letter, and one number';
        },
      },
    });
  };
}
