export interface GroupedTransaction {
	date: string;
	income: number;
	expense: number;
  }

  export interface Account {
	id: string;
	name: string;
	type: string;
	balance: number;
	isDefault?: boolean;
	_count: {
	  transactions: number;
	};
  }

  export interface Transaction {
	id: string;
	type: string,
	amount: number;
	description?: string;
	date: Date;
	category: string;
	receiptUrl?: string;
	isRecurring: boolean;
	recurringInterval?: string ;
	nextRecurringDate?: Date;
	lastProcessed?: Date;
	status: string;
	userId: string;
	accountId: string;
	createdAt: Date;
	updatedAt: Date;
  }
enum AccountType {
  CURRENT = "CURRENT",
  SAVINGS = "SAVINGS",
}
 export interface AccountProps {
	name: string;
	type: AccountType;
	balance: number;
	id: string;
	isDefault: boolean;
  }

  export interface InitialBudget {
	id: string;
	amount: number;
	createdAt: Date;
	updatedAt: Date;
	userId: string;
	lastAlertSent: Date | null;
  }

//   interface Account {
// 	id: string;
// 	name: string;
// 	isDefault?: boolean;
//   }
  
//   interface Transaction {
// 	id: string;
// 	accountId: string;
// 	description?: string;
// 	amount: number;
// 	date: string;
// 	type: "EXPENSE" | "INCOME";
// 	category: string;
//   }

export interface InitialData {
	type: "INCOME" | "EXPENSE";         // Assuming only two types
	amount: number;                     // Stored as number but converted to string in form
	description: string;
	accountId: string;                  // Assuming account IDs are strings
	category: string;                   // Assuming category is a string (or use Category type if available)
	date: string | Date;                // Incoming could be string (ISO) or Date object
	isRecurring: boolean;
	recurringInterval?: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY"; // Optional if isRecurring is true
  }
  
  export interface ScannedData {
	amount: number;
	date: Date; // Assuming the date is a string in the scanned data
	description?: string;
	category?: string;
}