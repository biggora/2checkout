import { Inject, Injectable } from '@nestjs/common';

import type { TwoCheckoutClientOptions } from '../core/http-client.js';
import {
  type ParseIpnInput,
  parseIpnEvent,
  verifyIpnSignature,
  type VerifyIpnSignatureOptions,
} from '../core/ipn.js';
import type { JsonRecord, TwoCheckoutAlgorithm, TwoCheckoutIpnEvent } from '../core/types.js';
import { TWO_CHECKOUT_MODULE_OPTIONS } from './tokens.js';

export type IpnVerifyOptions = {
  fieldOrder?: readonly string[] | undefined;
  algorithm?: TwoCheckoutAlgorithm | undefined;
  hashField?: string | undefined;
  algoField?: string | undefined;
};

@Injectable()
export class TwoCheckoutIpnVerifier {
  constructor(
    @Inject(TWO_CHECKOUT_MODULE_OPTIONS)
    private readonly options: TwoCheckoutClientOptions,
  ) {}

  parse<TPayload = JsonRecord>(
    rawBody: ParseIpnInput,
    contentType?: string,
  ): TwoCheckoutIpnEvent<TPayload> {
    return parseIpnEvent<TPayload>(rawBody, contentType !== undefined ? { contentType } : undefined);
  }

  verify(rawBody: ParseIpnInput | JsonRecord, verifyOptions: IpnVerifyOptions = {}): boolean {
    const merged: VerifyIpnSignatureOptions = {
      secret: this.options.secretKey,
      ...(verifyOptions.algorithm !== undefined
        ? { algorithm: verifyOptions.algorithm }
        : this.options.algorithm !== undefined
          ? { algorithm: this.options.algorithm }
          : {}),
      ...(verifyOptions.fieldOrder !== undefined ? { fieldOrder: verifyOptions.fieldOrder } : {}),
      ...(verifyOptions.hashField !== undefined ? { hashField: verifyOptions.hashField } : {}),
      ...(verifyOptions.algoField !== undefined ? { algoField: verifyOptions.algoField } : {}),
    };
    return verifyIpnSignature(rawBody, merged);
  }
}
