import 'reflect-metadata';

import { Buffer } from 'node:buffer';
import { createHmac } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';

import type { TwoCheckoutClient } from '../src';
import {
  InjectTwoCheckoutClient,
  TWO_CHECKOUT_CLIENT,
  TwoCheckoutIpnVerifier,
  TwoCheckoutModule,
} from '../src/nest';

@Injectable()
class DirectInjectService {
  constructor(@Inject(TWO_CHECKOUT_CLIENT) readonly client: TwoCheckoutClient) {}
}

@Injectable()
class DecoratorInjectService {
  constructor(@InjectTwoCheckoutClient() readonly client: TwoCheckoutClient) {}
}

describe('2Checkout NestJS module', () => {
  it('forRoot registers TWO_CHECKOUT_CLIENT and exposes the same instance via decorator', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TwoCheckoutModule.forRoot({
          merchantCode: 'M',
          secretKey: 's',
        }),
      ],
      providers: [DirectInjectService, DecoratorInjectService],
    }).compile();

    const direct = moduleRef.get(DirectInjectService);
    const decorated = moduleRef.get(DecoratorInjectService);

    expect(direct.client).toBeDefined();
    expect(direct.client.orders).toBeDefined();
    expect(direct.client.products).toBeDefined();
    expect(decorated.client).toBe(direct.client);
  });

  it('forRootAsync resolves options through an async factory', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TwoCheckoutModule.forRootAsync({
          useFactory: async () => ({
            merchantCode: 'ASYNC',
            secretKey: 'async-secret',
          }),
        }),
      ],
    }).compile();

    const client = moduleRef.get<TwoCheckoutClient>(TWO_CHECKOUT_CLIENT);
    expect(client).toBeDefined();
    expect(client.subscriptions).toBeDefined();
  });

  it('TwoCheckoutIpnVerifier parses payloads and verifies signatures using module secretKey', async () => {
    const secret = 'shared-secret';
    const moduleRef = await Test.createTestingModule({
      imports: [
        TwoCheckoutModule.forRoot({
          merchantCode: 'M',
          secretKey: secret,
        }),
      ],
    }).compile();

    const verifier = moduleRef.get(TwoCheckoutIpnVerifier);

    const fields = ['only-field'];
    const signed = `${Buffer.byteLength(fields[0]!, 'utf8')}${fields[0]}`;
    const hash = createHmac('sha256', secret).update(signed, 'utf8').digest('hex');
    const params = new URLSearchParams();
    params.set('ONLY', 'only-field');
    params.set('HASH', hash);

    const parsed = verifier.parse(params.toString(), 'application/x-www-form-urlencoded');
    expect(parsed.ONLY).toBe('only-field');
    expect(parsed.HASH).toBe(hash);

    const ok = verifier.verify(params.toString(), { fieldOrder: ['ONLY'] });
    expect(ok).toBe(true);

    const bad = verifier.verify(
      params.toString().replace('only-field', 'tampered'),
      { fieldOrder: ['ONLY'] },
    );
    expect(bad).toBe(false);
  });
});
