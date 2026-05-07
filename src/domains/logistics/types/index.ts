import { BaseEntity, EntityId, OrganizationScoped } from '../../../shared/types';

export enum ShipmentStatus {
  PENDING = 'PENDING',
  READY_FOR_PICKUP = 'READY_FOR_PICKUP',
  DISPATCHED = 'DISPATCHED',
  IN_TRANSIT = 'IN_TRANSIT',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  RETURNED = 'RETURNED'
}

export interface Dimensions {
  length: number;
  width: number;
  height: number;
  unit: 'CM' | 'IN';
}

export interface Weight {
  value: number;
  unit: 'KG' | 'LB';
}

export interface PackageDetails {
  dimensions: Dimensions;
  weight: Weight;
  description: string;
}

export interface Carrier extends BaseEntity {
  name: string;
  code: string;
  contactInfo: {
    phone: string;
    email: string;
    website: string;
  };
  supportedRegions: string[];
}

export interface ShipmentInsurance {
  provider: string;
  policyNumber: string;
  coverageAmount: number;
  currency: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
}

export interface Shipment extends BaseEntity, OrganizationScoped {
  orderId: EntityId;
  trackingNumber?: string;
  carrierId?: EntityId;
  status: ShipmentStatus;
  originAddress: string;
  destinationAddress: string;
  packages: PackageDetails[];
  insurance?: ShipmentInsurance;
  estimatedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  metadata?: Record<string, any>;
}
