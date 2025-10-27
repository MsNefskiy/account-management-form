import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import type {
    Account,
    AccountLabel,
    AccountErrors,
    CreateAccountData,
    UpdateAccountData,
    ValidationResult,
    AccountTypeOption
} from '@/types/account.type';

export const useAccountStore = defineStore('accounts', () => {
    const accounts = ref<Account[]>([]);
    const isLoading = ref(false);
    const lastError = ref<string | null>(null);

    const accountsCount = computed(() => accounts.value.length);
    const localAccounts = computed(() =>
        accounts.value.filter(account => account.type === 'LOCAL')
    );
    const ldapAccounts = computed(() =>
        accounts.value.filter(account => account.type === 'LDAP')
    );
    const hasAccounts = computed(() => accounts.value.length > 0);

    const accountTypeOptions = computed<AccountTypeOption[]>(() => [
        {
            label: 'LDAP',
            value: 'LDAP',
            description: 'Пароль не требуется'
        },
        {
            label: 'Локальная',
            value: 'LOCAL',
            description: 'Требуется пароль'
        }
    ]);

    const parseLabels = (labelString: string): AccountLabel[] => {
        if (!labelString.trim()) return [];
        return labelString
            .split(';')
            .map(label => label.trim())
            .filter(label => label.length > 0)
            .map(text => ({ text }));
    };

    const validateAccount = (accountData: Partial<Account>): ValidationResult => {
        const errors: AccountErrors = {};
        let isValid = true;

        if (accountData.label && accountData.label.length > 50) {
            errors.label = 'Метка не должна превышать 50 символов';
            isValid = false;
        }
        if (typeof accountData.login !== 'string' || accountData.login.trim() === '') {
            errors.login = 'Логин обязателен для заполнения';
            isValid = false;
        } else if (accountData.login.length > 100) {
            errors.login = 'Логин не должен превышать 100 символов';
            isValid = false;
        }
        if (accountData.type === 'LOCAL') {
            if (
                accountData.password == null ||
                typeof accountData.password !== 'string' ||
                accountData.password.trim() === ''
            ) {
                errors.password = 'Пароль обязателен для локальной учетной записи';
                isValid = false;
            } else if (accountData.password.length > 100) {
                errors.password = 'Пароль не должен превышать 100 символов';
                isValid = false;
            }
        }
        return { isValid, errors };
    };

    const createEmptyAccount = (): CreateAccountData => {
        return {
            label: '',
            type: 'LOCAL',
            login: '',
            password: '',
        };
    };

    const generateId = (): string => {
        return `acc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    };

    const loadFromStorage = (): void => {
        try {
            isLoading.value = true;
            const stored = localStorage.getItem('vue-accounts');
            if (stored) {
                const parsedData = JSON.parse(stored) as Account[];
                accounts.value = parsedData.map((account) => ({
                    ...account,
                    createdAt: new Date(account.createdAt),
                    updatedAt: new Date(account.updatedAt),
                }));
                lastError.value = null;
            }
        } catch (error) {
            console.error('Ошибка загрузки из localStorage:', error);
            lastError.value = 'Не удалось загрузить данные';
            accounts.value = [];
        } finally {
            isLoading.value = false;
        }
    };

    const saveToStorage = (): void => {
        try {
            localStorage.setItem('vue-accounts', JSON.stringify(accounts.value));
            lastError.value = null;
        } catch (error) {
            console.error('Ошибка сохранения в localStorage:', error);
            lastError.value = 'Не удалось сохранить данные';
        }
    };

    const addAccount = (): string => {
        const newAccountData = createEmptyAccount();
        const newAccount: Account = {
            ...newAccountData,
            id: generateId(),
            labels: parseLabels(newAccountData.label),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        accounts.value.push(newAccount);
        saveToStorage();
        return newAccount.id;
    };

    const updateAccount = (id: string, updates: UpdateAccountData): boolean => {
        const accountIndex = accounts.value.findIndex(acc => acc.id === id);
        if (accountIndex === -1) {
            lastError.value = 'Учетная запись не найдена';
            return false;
        }
        const accountUpdates: Partial<Account> = { ...updates, updatedAt: new Date() };
        if (updates.label !== undefined) {
            accountUpdates.labels = parseLabels(updates.label);
        }
        const prev = accounts.value[accountIndex];
        if (!prev) {
            lastError.value = 'Учетная запись не найдена';
            return false;
        }
        if (updates.type && prev.type !== updates.type) {
            if (updates.type === 'LDAP') {
                accountUpdates.password = null;
            }
        }
        accounts.value[accountIndex] = {
            id: prev.id,
            label: accountUpdates.label ?? prev.label,
            labels: accountUpdates.labels ?? prev.labels,
            type: accountUpdates.type ?? prev.type,
            login: accountUpdates.login ?? prev.login,
            password: accountUpdates.password ?? prev.password,
            createdAt: prev.createdAt,
            updatedAt: accountUpdates.updatedAt ?? prev.updatedAt,
        };
        saveToStorage();
        lastError.value = null;
        return true;
    };

    const removeAccount = (id: string): boolean => {
        const initialLength = accounts.value.length;
        accounts.value = accounts.value.filter(account => account.id !== id);
        const removed = accounts.value.length < initialLength;
        if (removed) {
            saveToStorage();
            lastError.value = null;
        } else {
            lastError.value = 'Учетная запись не найдена';
        }
        return removed;
    };

    const getAccountById = (id: string): Account | undefined => {
        return accounts.value.find(account => account.id === id);
    };

    const validateAndSaveAccount = (id: string, accountData: Partial<Account>): ValidationResult => {
        const validation = validateAccount(accountData);
        if (validation.isValid) {
            const success = updateAccount(id, accountData);
            if (!success) {
                validation.isValid = false;
            }
        }
        return validation;
    };

    const clearError = (): void => {
        lastError.value = null;
    };

    const clearAllAccounts = (): void => {
        accounts.value = [];
        saveToStorage();
    };

    loadFromStorage();
    watch(
        accounts,
        () => {
            saveToStorage();
        },
        { deep: true }
    );

    return {
        accounts: computed(() => accounts.value),
        isLoading: computed(() => isLoading.value),
        lastError: computed(() => lastError.value),
        accountsCount,
        localAccounts,
        ldapAccounts,
        hasAccounts,
        accountTypeOptions,
        addAccount,
        updateAccount,
        removeAccount,
        getAccountById,
        validateAccount,
        validateAndSaveAccount,
        clearError,
        clearAllAccounts,
        loadFromStorage,
    };
});
