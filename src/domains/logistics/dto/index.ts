import { EntityId, PaginationParams } from '../../../shared/types';
import { ShipmentStatus, PackageDetails, ShipmentInsurance } from '../types';

export interface CreateShipmentRequest {
  orderId: EntityId;
  originAddress: string;
  destinationAddress: string;
  packages: PackageDetails[];
  insurance?: {
    provider: string;
    coverageAmount: number;
    currency: string;
  };
}

export interface UpdateShipmentStatusRequest {
  status: ShipmentStatus;
  location?: string;
  reason?: string;
  timestamp: Date;
}

export interface AssignCarrierRequest {
  carrierId: EntityId;
  trackingNumber: string;
  estimatedDeliveryDate?: Date;
}

export interface ShipmentFilters extends PaginationParams {
  status?: ShipmentStatus;
  orderId?: EntityId;
  carrierId?: EntityId;
  trackingNumber?: string;
}
