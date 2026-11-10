// ============================================================
// TIA-DAS Constants
// Tourism Impact Assessment and Data Analytics System
// CONNECT-DAET.ph — Subsystem 10
// ============================================================

export const SYSTEM_NAME = 'TIA-DAS'
export const SYSTEM_FULL_NAME = 'Tourism Impact Assessment and Data Analytics System'
export const ORGANIZATION = 'Municipal Tourism Office of Daet, Camarines Norte'

// Admin role definitions
export const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',
  TOURISM_ADMIN: 'tourism_admin',
  DATA_ANALYST: 'data_analyst',
  REPORT_VIEWER: 'report_viewer',
}

export const ROLE_LABELS = {
  super_admin: 'Super Admin',
  tourism_admin: 'Tourism Administrator',
  data_analyst: 'Data Analyst',
  report_viewer: 'Report Viewer',
}

export const ROLE_COLORS = {
  super_admin: 'bg-red-100 text-red-800',
  tourism_admin: 'bg-blue-100 text-blue-800',
  data_analyst: 'bg-purple-100 text-purple-800',
  report_viewer: 'bg-gray-100 text-gray-800',
}

// Permissions per role
export const ROLE_PERMISSIONS = {
  super_admin: [
    'view_dashboard',
    'manage_statistics',
    'manage_economic',
    'manage_sustainability',
    'view_analytics',
    'manage_integrations',
    'manage_reports',
    'manage_administrators',
    'view_audit_logs',
    'manage_settings',
  ],
  tourism_admin: [
    'view_dashboard',
    'manage_statistics',
    'manage_economic',
    'manage_sustainability',
    'view_analytics',
    'manage_reports',
  ],
  data_analyst: [
    'view_dashboard',
    'view_analytics',
    'manage_reports',
  ],
  report_viewer: [
    'view_dashboard',
  ],
}

// Visitor categories
export const VISITOR_CATEGORIES = [
  'Domestic Tourist',
  'Foreign Tourist',
  'Balikbayan',
  'Business Traveler',
  'Educational / Research',
  'Government Official',
  'Other',
]

// Destinations in Daet
export const DESTINATIONS = [
  'Bagasbas Beach',
  'Mercedes Fish Port',
  'Daet Town Proper',
  'Capalonga',
  'Vinzons',
  'Paracale',
  'Jose Panganiban',
  'Daet Surf Area',
  'Rizal Monument Area',
  'Daet Public Market',
  'Other',
]

// Data sources
export const DATA_SOURCES = [
  'Manual Entry',
  'BIR Records',
  'LGU Tourism Office',
  'Hotel / Accommodation Register',
  'BHERT Survey',
  'DOT Regional Report',
  'CSV Import',
  'System Integration',
]

// Report types
export const REPORT_TYPES = [
  { value: 'daily', label: 'Daily Tourism Report' },
  { value: 'monthly', label: 'Monthly Tourism Report' },
  { value: 'quarterly', label: 'Quarterly Tourism Report' },
  { value: 'annual', label: 'Annual Tourism Report' },
  { value: 'arrivals', label: 'Tourist Arrival Report' },
  { value: 'economic', label: 'Economic Impact Report' },
  { value: 'sustainability', label: 'Sustainability Report' },
  { value: 'performance', label: 'Tourism Performance Report' },
]

// Integration statuses
export const INTEGRATION_STATUS = {
  CONNECTED: 'connected',
  PENDING: 'pending',
  NOT_CONNECTED: 'not_connected',
  ERROR: 'error',
}

export const INTEGRATION_STATUS_LABELS = {
  connected: 'Connected',
  pending: 'Pending Integration',
  not_connected: 'Not Connected',
  error: 'Error',
}

export const INTEGRATION_STATUS_COLORS = {
  connected: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  not_connected: 'bg-gray-100 text-gray-700',
  error: 'bg-red-100 text-red-800',
}

// Other CONNECT-DAET subsystems (future integrations)
export const OTHER_SUBSYSTEMS = [
  { name: 'Tourist Information & Management', team: 'Team 1', category: 'Information' },
  { name: 'Workflow & Document Tracking', team: 'Team 2', category: 'Operations' },
  { name: 'Digital Museum', team: 'Team 3', category: 'Culture' },
  { name: 'AR/VR Experiences', team: 'Team 4', category: 'Technology' },
  { name: 'Tourism Programs & Events', team: 'Team 5', category: 'Programs' },
  { name: 'Crisis Communication', team: 'Team 6', category: 'Safety' },
  { name: 'Local Artisan E-commerce', team: 'Team 7', category: 'Commerce' },
  { name: 'Tour Operator & Booking', team: 'Team 8', category: 'Booking' },
  { name: 'Emoji-Based Sentiment Analysis', team: 'Team 9', category: 'Analytics' },
  { name: 'Tourist Rewards & Loyalty', team: 'Team 11', category: 'Engagement' },
]

// Sustainability indicator categories
export const SUSTAINABILITY_CATEGORIES = [
  'Environmental',
  'Economic',
  'Social',
  'Governance',
]

// Audit log action types
export const AUDIT_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  ARCHIVE: 'archive',
  LOGIN: 'login',
  LOGOUT: 'logout',
  GENERATE_REPORT: 'generate_report',
  IMPORT_DATA: 'import_data',
  CHANGE_PERMISSION: 'change_permission',
  VIEW: 'view',
}

export const AUDIT_ACTION_LABELS = {
  create: 'Created',
  update: 'Updated',
  delete: 'Deleted',
  archive: 'Archived',
  login: 'Logged In',
  logout: 'Logged Out',
  generate_report: 'Generated Report',
  import_data: 'Imported Data',
  change_permission: 'Changed Permission',
  view: 'Viewed',
}

// KPI thresholds
export const KPI_THRESHOLDS = {
  tourism_growth_good: 10,
  tourism_growth_warning: 0,
  sustainability_good: 70,
  sustainability_warning: 50,
  employment_good: 100,
  revenue_target_monthly: 5000000,
}

// Chart colors
export const CHART_COLORS = {
  primary: '#2563EB',
  secondary: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  purple: '#8B5CF6',
  teal: '#14B8A6',
  orange: '#F97316',
  gray: '#6B7280',
}

export const PIE_COLORS = [
  '#2563EB', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#14B8A6', '#F97316', '#6B7280',
]

// Pagination
export const DEFAULT_PAGE_SIZE = 10
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

// Date formats
export const DATE_FORMAT = 'YYYY-MM-DD'
export const DISPLAY_DATE_FORMAT = 'MMMM D, YYYY'

// Local storage keys
export const LS_KEYS = {
  SIDEBAR_COLLAPSED: 'tiadAs_sidebar_collapsed',
  THEME: 'tiadas_theme',
  LAST_ROUTE: 'tiadas_last_route',
}
