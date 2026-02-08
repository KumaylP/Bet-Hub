export interface Market {
  id: string;
  title: string;
  category: string;
  endDate: string;
  totalVolume: string;
  yesPrice: number;
  noPrice: number;
  image?: string;
  description?: string;
  isHot?: boolean;
  participants?: number;
  change24h?: number;
  comments?: any[];
}

export enum MarketCategory {
  SPORTS = 'Sports',
  POLITICS = 'Politics',
  CRYPTO = 'Crypto',
  MEDIA = 'Media',
  ACADEMICS = 'Academics',
  SCIENCE = 'Science',
  FINANCE = 'Finance',
  SPACE = 'Space'
}

export interface PrivatePool {
  code: string;
  title: string;
  expiresIn: string;
  poolSize: number;
  participants: number;
  userBet: 'Yes' | 'No' | 'Team Alpha' | 'Girl (No)';
  wagered: number;
  return: number;
  status: 'Active' | 'Live Now' | 'Ended';
}

export interface User {
  name: string;
  email: string;
  money: number;
  trust: number;
  pvt_cards: number;
  loan: number;
  transaction_history?: any[];
  loan_interest_rate?: number;
  loan_due_date?: number;
  loan_total_interest?: number;
}