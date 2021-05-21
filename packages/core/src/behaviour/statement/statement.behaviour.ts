import { InstrumentSelector } from '../../domain';
import { Behaviour } from '../behaviour';
import { BenchmarkStatementBehaviour } from './benchmark-statement.behaviour';
import { EquityStatementBehaviour } from './equity-statement.behaviour';
import { PeriodStatementBehaviour } from './period-statement.behaviour';

export class Statement {
  static period(): Behaviour {
    return new PeriodStatementBehaviour();
  }

  static benchmark(instrument: InstrumentSelector): Behaviour {
    return new BenchmarkStatementBehaviour(instrument);
  }

  static equity(instrument: InstrumentSelector): Behaviour {
    return new EquityStatementBehaviour(instrument);
  }
}
