import type { AccountErrors, ValidationResult } from "@/types/account.type";

export const validateMaxLength = (value: string, maxLength: number): boolean => {
    return value.length <= maxLength;
};

export const validateRequired = (value: string): boolean => {
    return value.trim().length > 0;
};

export const validateLabelsFormat = (labels: string): boolean => {
    if (!labels.trim()) return true;
    const labelsArray = labels.split(';').map(label => label.trim());
    return labelsArray.every(label => label.length <= 50);
};

export const validateLogin = (login: string): string | null => {
    if (typeof login !== 'string' || login.trim() === '') {
        return 'Логин обязателен для заполнения';
    }
    if (!validateMaxLength(login, 100)) {
        return 'Логин не должен превышать 100 символов';
    }
    return null;
};

export const validatePassword = (password: string | null, accountType: 'LDAP' | 'LOCAL'): string | null => {
    if (accountType === 'LOCAL') {
        if (!password || !validateRequired(password)) {
            return 'Пароль обязателен для локальной учетной записи';
        }
        if (!validateMaxLength(password, 100)) {
            return 'Пароль не должен превышать 100 символов';
        }
    }
    return null;
};

export const validateLabel = (label: string): string | null => {
    if (label && !validateMaxLength(label, 50)) {
        return 'Метка не должна превышать 50 символов';
    }
    if (!validateLabelsFormat(label)) {
        return 'Одна или несколько меток превышают 50 символов';
    }
    return null;
};

export const validateAllFields = (
    label: string,
    login: string,
    password: string | null,
    accountType: 'LDAP' | 'LOCAL'
): ValidationResult => {
    const errors: AccountErrors = {};
    const labelError = validateLabel(label);
    if (labelError) errors.label = labelError;
    const loginError = validateLogin(login);
    if (loginError) errors.login = loginError;
    const passwordError = validatePassword(password, accountType);
    if (passwordError) errors.password = passwordError;
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};
