import { EntityId } from '../../../shared/types';
import { ShipmentStatus } from '../types';

export interface ShipmentCreatedEvent {
  shipmentId: EntityId;
  orderId: EntityId;
  timestamp: Date;
}

export interface ShipmentDispatchedEvent {
  shipmentId: EntityId;
  carrierId: EntityId;
  trackingNumber: string;
  timestamp: Date;
}

export interface ShipmentStatusUpdatedEvent {
  shipmentId: EntityId;
  oldStatus: ShipmentStatus;
  newStatus: ShipmentStatus;
  location?: string;
  timestamp: Date;
}

export interface ShipmentDeliveredEvent {
  shipmentId: EntityId;
  actualDeliveryDate: Date;
  timestamp: Date;
}
