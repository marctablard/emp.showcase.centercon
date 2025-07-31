/**
 * Represents a tracking event in the shipment journey
 */
export interface TrackingEvent {
  /**
   * Date and time when the event occurred
   */
  timestamp: string;

  /**
   * Location where the event occurred
   */
  location: string;

  /**
   * Status description of the event
   */
  status: string;

  /**
   * Additional details about the event
   */
  description?: string;
}

/**
 * Represents the carrier information for a shipment
 */
export interface Carrier {
  /**
   * Name of the shipping carrier
   */
  name: string;

  /**
   * Tracking number provided by the carrier
   */
  trackingNumber: string;

  /**
   * URL to the carrier's tracking page (optional)
   */
  trackingUrl?: string;
}

/**
 * Represents the estimated delivery information
 */
export interface EstimatedDelivery {
  /**
   * Estimated date of delivery
   */
  date: string;

  /**
   * Time window for delivery (optional)
   */
  timeWindow?: {
    from: string;
    to: string;
  };
}

/**
 * Represents the complete tracking information for an order
 */
export interface TrackingInfo {
  /**
   * Order ID associated with this tracking information
   */
  orderId: string;

  /**
   * Current status of the shipment
   */
  status: 'PENDING' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'EXCEPTION';

  /**
   * Carrier information
   */
  carrier: Carrier;

  /**
   * Estimated delivery information
   */
  estimatedDelivery?: EstimatedDelivery;

  /**
   * Chronological list of tracking events
   */
  events: TrackingEvent[];

  /**
   * Last updated timestamp
   */
  lastUpdated: string;
}
