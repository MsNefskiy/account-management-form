export interface AccountLabel {
    text: string;
}
export interface Account {
    id: string;
    label: string;
    labels: AccountLabel[];
    type: 'LDAP' | 'LOCAL';
    login: string;
    password: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface AccountErrors {
    label?: string;
    login?: string;
    password?: string;
}
export interface CreateAccountData {
    label: string;
    type: 'LDAP' | 'LOCAL';
    login: string;
    password: string | null;
}
export interface UpdateAccountData {
    label?: string;
    type?: 'LDAP' | 'LOCAL';
    login?: string;
    password?: string | null;
}
export interface ValidationResult {
    isValid: boolean;
    errors: AccountErrors;
}
export const ACCOUNT_TYPES = {
    LDAP: 'LDAP' as const,
    LOCAL: 'Локальная' as const,
} as const;
export const FIELD_LIMITS = {
    LABEL_MAX_LENGTH: 50,
    LOGIN_MAX_LENGTH: 100,
    PASSWORD_MAX_LENGTH: 100,
} as const;
export interface AccountTypeOption {
    label: string;
    value: 'LDAP' | 'LOCAL';
    description: string;
}
