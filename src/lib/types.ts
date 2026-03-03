export type ServiceStatus =
  | 'operational'
  | 'degraded'
  | 'partial_outage'
  | 'major_outage'
  | 'maintenance'
  | 'unknown';

export type ServiceCategory =
  | 'cloud'
  | 'ai'
  | 'payment'
  | 'devtools'
  | 'collaboration'
  | 'korean';

export interface StatuspageFetchConfig {
  baseUrl: string;
}

export interface HealthCheckFetchConfig {
  url: string;
  expectedStatus?: number;
}

export interface AwsFetchConfig {
  url: string;
}

export interface GcpFetchConfig {
  url: string;
}

export type FetchConfig =
  | StatuspageFetchConfig
  | HealthCheckFetchConfig
  | AwsFetchConfig
  | GcpFetchConfig;

export interface ServiceDefinition {
  id: string;
  name: string;
  nameKo: string;
  category: ServiceCategory;
  logo: string;         // fallback emoji
  iconSlug?: string;    // Simple Icons slug (cdn.simpleicons.org/{iconSlug})
  fetchType: 'statuspage' | 'aws' | 'gcp' | 'healthcheck' | 'slack';
  fetchConfig: FetchConfig;
  website: string;
  statusPage?: string;
}

export interface IncidentUpdate {
  id: string;
  status: string;
  body: string;
  createdAt: string;
}

export interface Incident {
  id: string;
  name: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  impact: 'none' | 'minor' | 'major' | 'critical';
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  updates: IncidentUpdate[];
  shortlink?: string;
}

export interface ComponentStatus {
  id: string;
  name: string;
  status: ServiceStatus;
}

export interface ServiceStatusData {
  serviceId: string;
  status: ServiceStatus;
  description?: string;
  updatedAt: string;
  incidents: Incident[];
  components?: ComponentStatus[];
}

export interface AllStatusData {
  services: ServiceStatusData[];
  lastUpdatedAt: string;
  nextUpdateAt: string;
}
