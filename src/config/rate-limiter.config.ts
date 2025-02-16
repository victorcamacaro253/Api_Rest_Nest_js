import { ThrottlerModuleOptions } from '@nestjs/throttler';

export const rateLimiterConfig: ThrottlerModuleOptions = [{
  ttl: 60,
  limit: 10,
}];
