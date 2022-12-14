import {
  DomainEvents,
  DomainEventCtor,
  IDomainEventHandler,
} from '@beincom/domain';
import { ModuleRef } from '@nestjs/core';
import { Injectable, Type } from '@nestjs/common';

import { EVENTS_HANDLER_METADATA } from './constants';

@Injectable()
export class EventBus {
  public constructor(private readonly moduleRef: ModuleRef) {}

  public register(handlers?: Type<IDomainEventHandler>[]) {
    handlers.forEach((handler) => this.registerHandler(handler));
  }

  protected registerHandler(handler: Type<IDomainEventHandler>) {
    const instance = this.moduleRef.get(handler, { strict: false });
    if (!instance) {
      return;
    }
    const events = EventBus.reflectEvents(handler);
    events.map((event) =>
      DomainEvents.subscribe(event as unknown as DomainEventCtor<any>, instance),
    );
  }

  private static reflectEvents(handler: Type<IDomainEventHandler>): FunctionConstructor[] {
    return Reflect.getMetadata(EVENTS_HANDLER_METADATA, handler);
  }
}
