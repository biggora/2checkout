import type { DynamicModule, FactoryProvider, ModuleMetadata, Provider } from '@nestjs/common';
import { Module } from '@nestjs/common';

import { TwoCheckoutClient } from '../client.js';
import type { TwoCheckoutClientOptions } from '../core/http-client.js';
import { TwoCheckoutIpnVerifier } from './ipn-verifier.js';
import { TWO_CHECKOUT_CLIENT, TWO_CHECKOUT_MODULE_OPTIONS } from './tokens.js';

export type TwoCheckoutModuleAsyncOptions = {
  imports?: ModuleMetadata['imports'];
  inject?: FactoryProvider<TwoCheckoutClientOptions>['inject'];
  useFactory: (...args: any[]) => Promise<TwoCheckoutClientOptions> | TwoCheckoutClientOptions;
};

function createClientProvider(): Provider {
  return {
    provide: TWO_CHECKOUT_CLIENT,
    inject: [TWO_CHECKOUT_MODULE_OPTIONS],
    useFactory: (options: TwoCheckoutClientOptions) => new TwoCheckoutClient(options),
  };
}

@Module({})
export class TwoCheckoutModule {
  static forRoot(options: TwoCheckoutClientOptions): DynamicModule {
    return {
      module: TwoCheckoutModule,
      providers: [
        {
          provide: TWO_CHECKOUT_MODULE_OPTIONS,
          useValue: options,
        },
        createClientProvider(),
        TwoCheckoutIpnVerifier,
      ],
      exports: [TWO_CHECKOUT_CLIENT, TWO_CHECKOUT_MODULE_OPTIONS, TwoCheckoutIpnVerifier],
    };
  }

  static forRootAsync(options: TwoCheckoutModuleAsyncOptions): DynamicModule {
    return {
      module: TwoCheckoutModule,
      imports: options.imports ?? [],
      providers: [
        {
          provide: TWO_CHECKOUT_MODULE_OPTIONS,
          inject: options.inject ?? [],
          useFactory: options.useFactory,
        },
        createClientProvider(),
        TwoCheckoutIpnVerifier,
      ],
      exports: [TWO_CHECKOUT_CLIENT, TWO_CHECKOUT_MODULE_OPTIONS, TwoCheckoutIpnVerifier],
    };
  }
}
