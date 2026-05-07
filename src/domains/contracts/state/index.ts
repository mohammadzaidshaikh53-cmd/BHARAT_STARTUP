import { ContractStatus } from '../types';

export enum ContractLifecycleState {
  DRAFT = ContractStatus.DRAFT,
  PENDING_SIGNATURE = ContractStatus.PENDING_SIGNATURE,
  ACTIVE = ContractStatus.ACTIVE,
  AMENDED = ContractStatus.AMENDED,
  EXPIRED = ContractStatus.EXPIRED,
  TERMINATED = ContractStatus.TERMINATED,
}

export enum ContractEvent {
  PUBLISH = 'PUBLISH',
  SIGN = 'SIGN',
  AMEND = 'AMEND',
  RENEW = 'RENEW',
  TERMINATE = 'TERMINATE',
  EXPIRE = 'EXPIRE', // System event, not user triggered
}

export type ContractTransitions = Record<
  ContractLifecycleState,
  Partial<Record<ContractEvent, ContractLifecycleState>>
>;

export const CONTRACT_STATE_TRANSITIONS: ContractTransitions = {
  [ContractLifecycleState.DRAFT]: {
    [ContractEvent.PUBLISH]: ContractLifecycleState.PENDING_SIGNATURE,
    [ContractEvent.TERMINATE]: ContractLifecycleState.TERMINATED, // Can terminate a draft
  },
  [ContractLifecycleState.PENDING_SIGNATURE]: {
    [ContractEvent.SIGN]: ContractLifecycleState.ACTIVE,
    [ContractEvent.TERMINATE]: ContractLifecycleState.TERMINATED,
    [ContractEvent.EXPIRE]: ContractLifecycleState.EXPIRED, // If signing deadline passes
  },
  [ContractLifecycleState.ACTIVE]: {
    [ContractEvent.AMEND]: ContractLifecycleState.AMENDED,
    [ContractEvent.TERMINATE]: ContractLifecycleState.TERMINATED,
    [ContractEvent.EXPIRE]: ContractLifecycleState.EXPIRED,
  },
  [ContractLifecycleState.AMENDED]: {
    [ContractEvent.SIGN]: ContractLifecycleState.ACTIVE, // After amendment, if it requires re-signing
    [ContractEvent.AMEND]: ContractLifecycleState.AMENDED,
    [ContractEvent.TERMINATE]: ContractLifecycleState.TERMINATED,
    [ContractEvent.EXPIRE]: ContractLifecycleState.EXPIRED,
  },
  [ContractLifecycleState.EXPIRED]: {
    [ContractEvent.RENEW]: ContractLifecycleState.PENDING_SIGNATURE, // New contract starts pending signature
  },
  [ContractLifecycleState.TERMINATED]: {}, // Terminal state, no further transitions
};

export class ContractWorkflow {
  static canTransition(
    currentState: ContractLifecycleState,
    event: ContractEvent
  ): boolean {
    return !!CONTRACT_STATE_TRANSITIONS[currentState]?.[event];
  }

  static getNextState(
    currentState: ContractLifecycleState,
    event: ContractEvent
  ): ContractLifecycleState | undefined {
    return CONTRACT_STATE_TRANSITIONS[currentState]?.[event];
  }
}
