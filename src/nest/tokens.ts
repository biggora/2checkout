import { Inject } from '@nestjs/common';

export const TWO_CHECKOUT_CLIENT = Symbol('TWO_CHECKOUT_CLIENT');
export const TWO_CHECKOUT_MODULE_OPTIONS = Symbol('TWO_CHECKOUT_MODULE_OPTIONS');

export function InjectTwoCheckoutClient(): ParameterDecorator {
  return Inject(TWO_CHECKOUT_CLIENT);
}
