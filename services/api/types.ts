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
  company_id: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  investor_id: string;
  balance: number;
  share_quantity: number;
  share_amount: number;
  status: "active" | "inactive";
  avatar?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  date_of_birth?: string;
  gender?: "male" | "female" | "other";
  marital_status?: "single" | "married" | "divorced" | "widowed";
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
}

export interface LoginResponseData {
  user: User;
  company: Company;
  token: string;
}

export type LoginResponse = ApiResponse<LoginResponseData>;

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
export interface Club {
  id: number;
  name: string;
  description: string;
  category: {
    id: number;
    name: string;
    color: string;
  };
  total_shares_available: number;
  shares_sold: number;
  price_per_share: number;
  risk_level: "low" | "medium" | "high";
  expected_return: number;
  minimum_investment: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ClubDetail extends Club {
  location: string;
  established_date: string;
  total_investors: number;
  current_valuation: number;
  documents?: {
    id: number;
    name: string;
    url: string;
    type: string;
  }[];
}

// Transaction Types
export interface Transaction {
  id: number;
  type: "investment" | "withdrawal" | "dividend" | "refund";
  club_id?: number;
  club_name?: string;
  amount: number;
  shares?: number;
  status: "pending" | "completed" | "failed" | "cancelled";
  created_at: string;
  updated_at: string;
}

export interface TransactionDetail extends Transaction {
  payment_method: string;
  transaction_id: string;
  notes?: string;
  fees?: number;
}

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

export interface DashboardData {
  available_balance: number;
  available_share_quantity: number;
  available_share_amount: number;
  ongoing_clubs_count: number;
  money_flow_graph: MoneyFlowData[];
  balance_trend_graph: BalanceTrendData[];
  transaction_type_distribution: TransactionTypeDistribution[];
  transaction_frequency_graph: TransactionFrequencyData[];
  investment_vs_profit_graph: InvestmentVsProfitData[];
  deposit_vs_withdrawal_graph: DepositVsWithdrawalData[];
  club_investment_distribution: ClubInvestmentDistribution[];
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
