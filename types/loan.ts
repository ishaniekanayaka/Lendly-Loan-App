export interface LoanApplication {
  id?: string;
  name: string;
  email: string;
  telephone: string;
  occupation: string;
  salary: string;
  paysheetUrl?: string;
  paysheetName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoanFormData {
  name: string;
  email: string;
  telephone: string;
  occupation: string;
  salary: string;
  paysheet?: {
    uri: string;
    name: string;
    type: string;
  };
}