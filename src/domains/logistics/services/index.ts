import { EntityId, ApiResponse } from '../../../shared/types';
import { Shipment, Carrier } from '../types';
import { CreateShipmentRequest, UpdateShipmentStatusRequest, AssignCarrierRequest, ShipmentFilters } from '../dto';

export interface ILogisticsService {
  createShipment(request: CreateShipmentRequest): Promise<ApiResponse<Shipment>>;
  getShipment(id: EntityId): Promise<ApiResponse<Shipment>>;
  assignCarrier(id: EntityId, request: AssignCarrierRequest): Promise<ApiResponse<void>>;
  updateStatus(id: EntityId, request: UpdateShipmentStatusRequest): Promise<ApiResponse<void>>;
  trackShipment(trackingNumber: string): Promise<ApiResponse<Shipment>>;
  listShipments(filters: ShipmentFilters): Promise<ApiResponse<{ data: Shipment[]; total: number }>>;
  getAvailableCarriers(): Promise<ApiResponse<Carrier[]>>;
}
