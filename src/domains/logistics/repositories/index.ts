import { EntityId } from '../../../shared/types';
import { Shipment, Carrier } from '../types';
import { ShipmentFilters } from '../dto';

export interface ILogisticsRepository {
  findById(id: EntityId): Promise<Shipment | null>;
  findByTrackingNumber(trackingNumber: string): Promise<Shipment | null>;
  findByOrderId(orderId: EntityId): Promise<Shipment[]>;
  findMany(filters: ShipmentFilters): Promise<{ data: Shipment[]; total: number }>;
  save(shipment: Shipment): Promise<Shipment>;
  
  findCarrierById(id: EntityId): Promise<Carrier | null>;
  listCarriers(): Promise<Carrier[]>;
}
