// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
  timestamp?: string;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
  company_id: number | null;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  investor_id: string;
  status: "active" | "inactive";
  avatar?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  date_of_birth?: string;
  gender?: "male" | "female" | "other";
  marital_status?: "single" | "married" | "divorced" | "widowed";
  share_quantity?: number;
  balance?: number;
}

export interface Company {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  logo?: string;
  domain?: string;
  status: "active" | "inactive";
  currency?: string;
}

export interface LoginResponseData {
  user: User;
  company: Company;
  token: string;
}

export type LoginResponse = ApiResponse<LoginResponseData>;

// Biometric Types
export interface BiometricEnableRequest {
  device_id: string;
  device_name: string;
  device_type: "ios" | "android";
}

export interface BiometricEnableResponse {
  biometric_token: string;
  device_id: string;
  expires_at: string;
}

export interface BiometricDisableRequest {
  device_id: string;
}

export interface BiometricLoginRequest {
  biometric_token: string;
  device_id: string;
  email: string;
  company_id: number | null;
}

export interface BiometricDevice {
  device_id: string;
  device_name: string;
  device_type: string;
  last_used_at: string;
  expires_at: string;
}

export interface BiometricStatusResponse {
  is_enabled: boolean;
  devices: BiometricDevice[];
}

export type BiometricEnableResponseType = ApiResponse<BiometricEnableResponse>;
export type BiometricStatusResponseType = ApiResponse<BiometricStatusResponse>;

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

// Profile Types
export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  date_of_birth?: string;
  gender?: "male" | "female" | "other";
  marital_status?: "single" | "married" | "divorced" | "widowed";
}

// Club Types
export interface ClubCategory {
  id: number;
  name: string;
  icon: string;
  color: string;
}

export interface Club {
  id: number;
  name: string;
  description: string;
  status: "active" | "inactive";
  investment_type: string;
  geographic_focus: string;
  risk_level: "conservative" | "moderate" | "aggressive" | "speculative";
  investment_horizon: string;
  investment_horizon_label: string;
  minimum_investment: number;
  maximum_investment: number;
  share_price: number;
  shares_remaining: number;
  total_shares_available: number;
  shares_sold: number;
  current_members: number;
  max_members: number;
  total_investment_pool: number;
  total_investment: number;
  expected_return: number;
  liquidity_terms: string;
  liquidity_terms_label: string;
  category: ClubCategory;
}

export type ClubsListResponse = ApiResponse<Club[]>;

export interface ClubDocument {
  id: number;
  title: string;
  description?: string;
  document_type: string;
  file_url: string;
  created_at: string;
}

export interface ClubActivity {
  description: string;
  causer_name: string;
  causer_email?: string;
  created_at: string;
  created_at_human: string;
}

export interface ClubMember {
  name: string;
  email: string;
  avatar: string | null;
  investor_id: string;
}

export interface ClubExpense {
  description: string;
  amount: number;
  note: string;
  category: string;
  created_by: string;
  created_at: string;
  expense_date: string;
}

export interface UserInvestmentInfo {
  share_qty: number;
  investment_amount: number;
  share_price: number;
  joined_at: string;
  status: string | null;
}

export interface ShareStatistics {
  total_share_qty: number;
  total_sold_ongoing_share: number;
  total_pending_share: number;
  total_available_share: number;
  remaining_percentage: number;
}

export interface ClubDetail extends Club {
  club_type: "live" | "ongoing" | "settled" | "pending";
  management_fee: number;
  performance_fee: number;
  investment_strategy: string;
  is_member: boolean;
  user_investment_info?: UserInvestmentInfo;
  user_personal_documents: ClubDocument[];
  member_documents: ClubDocument[];
  public_documents: ClubDocument[];
  activities: ClubActivity[];
  members: ClubMember[];
  expenses: ClubExpense[];
  share_statistics?: ShareStatistics;
}

export type ClubDetailResponse = ApiResponse<ClubDetail>;

// Transaction Types
export interface Transaction {
  id: number;
  transaction_number: string;
  transaction_type: "deposit" | "withdrawal" | "share_deposit" | "share_withdrawal" | "investment" | "profit";
  transaction_type_label: string;
  amount: number;
  balance_before: number;
  balance_after: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "cancelled";
  status_label: string;
  approval_status: "pending" | "approved" | "rejected";
  approval_status_label: string;
  payment_method: string;
  payment_method_label: string;
  notes: string | null;
  transaction_date: string;
  created_at: string;
}

export interface TransactionCategory {
  type: string;
  label: string;
  total_amount: number;
  count: number;
}

export interface PaginatedTransactions {
  data: Transaction[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface TransactionsListData {
  categories: TransactionCategory[];
  transactions: PaginatedTransactions;
}

export type TransactionsListResponse = ApiResponse<TransactionsListData>;

export interface CreatedBy {
  id: number;
  name: string;
  email: string;
}

export interface TransactionDetail {
  id: number;
  transaction_number: string;
  reference_number: string | null;
  transaction_type: "deposit" | "withdrawal" | "share_deposit" | "share_withdrawal" | "investment" | "profit";
  transaction_type_label: string;
  transaction_subtype: string | null;
  amount: number;
  balance_before: number;
  balance_after: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "cancelled";
  status_label: string;
  approval_status: "pending" | "approved" | "rejected";
  approval_status_label: string;
  payment_method: string;
  payment_method_label: string;
  payment_reference: string | null;
  bank_account_id: number | null;
  notes: string | null;
  metadata: any | null;
  transaction_date: string;
  approved_at: string | null;
  created_at: string;
  approved_by: CreatedBy | null;
  created_by: CreatedBy | null;
}

export type TransactionDetailResponse = ApiResponse<TransactionDetail>;

// Notification Types
export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  notification_type: "info" | "success" | "warning" | "error";
  url: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  created_at_human: string;
}

export interface NotificationsListData {
  notifications: Notification[];
  unread_count: number;
  total_count: number;
  current_page: number;
  per_page: number;
  total_pages: number;
}

export type NotificationsListResponse = ApiResponse<NotificationsListData>;

export interface UnreadCountData {
  unread_count: number;
}

export type UnreadCountResponse = ApiResponse<UnreadCountData>;

export interface MarkAsReadData {
  id: string;
  is_read: boolean;
  read_at: string;
}

export type MarkAsReadResponse = ApiResponse<MarkAsReadData>;

export interface MarkAllAsReadData {
  marked_count: number;
}

export type MarkAllAsReadResponse = ApiResponse<MarkAllAsReadData>;

// Pagination Types
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// Dashboard Types
export interface MoneyFlowData {
  month: string;
  inflow: number;
  outflow: number;
}

export interface BalanceTrendData {
  month: string;
  balance: number;
}

export interface TransactionTypeDistribution {
  type: string;
  label: string;
  total_amount: number;
  count: number;
}

export interface TransactionFrequencyData {
  month: string;
  count: number;
}

export interface InvestmentVsProfitData {
  month: string;
  investment: number;
  profit: number;
}

export interface DepositVsWithdrawalData {
  month: string;
  deposit: number;
  withdrawal: number;
}

export interface ClubInvestmentDistribution {
  category: string;
  amount: number;
}

export interface ProfitTrendData {
  month: string;
  profit: number;
}

export interface TransactionTypeSummary {
  count: number;
  amount: number;
}

export interface DashboardData {
  available_balance: number;
  available_share_quantity: number;
  available_share_amount: number;
  ongoing_clubs_count: number;
  pending_clubs_count: number;
  roi: number;
  deposit: TransactionTypeSummary;
  share_deposit: TransactionTypeSummary;
  withdrawal: TransactionTypeSummary;
  share_withdrawal: TransactionTypeSummary;
  investment: TransactionTypeSummary;
  profit: TransactionTypeSummary;
  balance_trend_graph: BalanceTrendData[];
  investment_vs_profit_graph: InvestmentVsProfitData[];
  money_flow_graph: MoneyFlowData[];
  profit_trend_graph: ProfitTrendData[];
}

export type DashboardResponse = ApiResponse<DashboardData>;

// Report Types
export interface ReportSummary {
  total_investment: number;
  total_profit: number;
  net_profit: number;
  roi_percentage: number;
  investment_count: number;
  profit_count: number;
  active_clubs_count: number;
  settled_clubs_count: number;
}

export interface ClubInvestment {
  club_id: string;
  club_name: string;
  category: string;
  investment_amount: number;
  shares_purchased: number;
  share_price: number;
  total_profit: number;
  roi_percentage: number;
  joined_at: string;
  club_status: "active" | "inactive" | "settled";
}

export interface TransactionSummaryItem {
  label: string;
  total_amount: number;
  count: number;
}

export interface TransactionSummary {
  deposit: TransactionSummaryItem;
  withdrawal: TransactionSummaryItem;
  share_deposit: TransactionSummaryItem;
  share_withdrawal: TransactionSummaryItem;
  investment: TransactionSummaryItem;
  profit: TransactionSummaryItem;
}

export interface ReportData {
  period: string;
  period_label: string;
  period_start: string | null;
  period_end: string | null;
  summary: ReportSummary;
  profit_history: any[]; // Can be typed more specifically if structure is known
  club_investments: ClubInvestment[];
  transaction_summary: TransactionSummary;
}

export type ReportResponse = ApiResponse<ReportData>;

// API Error Types
export interface ApiError {
  success: false;
  code: number;
  message: string;
  errors?: Record<string, string[]>;
}
