/**
 * Status badge with color coding for shipment statuses and other states.
 */

const statusConfig = {
  pending: { label: 'Pending', className: 'badge-warning' },
  in_transit: { label: 'In Transit', className: 'badge-info' },
  delivered: { label: 'Delivered', className: 'badge-success' },
  cancelled: { label: 'Cancelled', className: 'badge-danger' },
  cold: { label: 'Cold Storage', className: 'badge-info' },
  dry: { label: 'Dry Storage', className: 'badge-neutral' },
  mixed: { label: 'Mixed', className: 'badge-warning' },
  active: { label: 'Active', className: 'badge-success' },
  alert: { label: 'Alert!', className: 'badge-danger' },
  normal: { label: 'Normal', className: 'badge-success' },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || { label: status, className: 'badge-neutral' };
  return <span className={`badge ${config.className}`}>{config.label}</span>;
}
