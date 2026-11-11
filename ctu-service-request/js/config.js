// Shared configuration. Status keys are stored in data; labels are display-only.

export const STATUSES = [
  { key: 'pending',     label: 'Submitted' },      
  { key: 'in_progress', label: 'In Progress' }, 
  { key: 'resolved',    label: 'Resolved' }      
];
export const DEFAULT_STATUS = STATUSES[0].key;
export const CONCERN_TYPES = ['Classroom Equipment', 'Laboratory', 'Facility Maintenance', 'Others'];
export const statusLabel = key => (STATUSES.find(s => s.key === key) || {}).label || key;
