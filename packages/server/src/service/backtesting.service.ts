import { Session, SessionFactory, SessionOptimizer } from '@quantform/core';
import { Service } from 'typedi';
import { SessionDescriptorRegistry } from './session-descriptor-registry';

@Service()
export class BacktestingService {
  constructor(private readonly registry: SessionDescriptorRegistry) {}

  async start(name: string) {}
}
