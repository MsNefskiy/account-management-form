<template>
  <div class="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="transform opacity-0 -translate-y-2"
        enter-to-class="transform opacity-100 translate-y-0"
        leave-active-class="transition-all duration-300 ease-in"
        leave-from-class="transform opacity-100 translate-y-0"
        leave-to-class="transform opacity-0 -translate-y-2"
      >
        <div v-if="lastError" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm">
          <div class="flex items-center">
            <i class="pi pi-exclamation-triangle text-red-500 text-xl mr-3"></i>
            <div class="flex-1">
              <h3 class="font-semibold text-red-800">Ошибка</h3>
              <p class="text-red-700 text-sm mt-1">{{ lastError }}</p>
            </div>
            <button
              @click="clearError"
              class="text-red-500 hover:text-red-700 transition-colors p-1 rounded"
            >
              <i class="pi pi-times text-lg"></i>
            </button>
          </div>
        </div>
      </Transition>
      <div class="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-200">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 class="text-2xl font-bold text-gray-800">Учетные записи</h2>
          </div>
          <div class="flex flex-col sm:flex-row gap-3">
            <Button
              label="Добавить учетную запись"
              icon="pi pi-plus"
              class="px-6 py-3 font-medium rounded-xl transition-all duration-200 shadow-sm text-white"
              style="background: var(--primary-color)"
              @click="handleAddAccount"
              :disabled="isLoading"
            />
            <Button
              label="Очистить все"
              icon="pi pi-trash"
              class="p-button-outlined p-button-secondary shadow-sm"
              @click="confirmClearAll"
              :disabled="isLoading || !hasAccounts"
            />
          </div>
        </div>
      </div>
      <div>
        <AccountItem
          v-for="account in accounts"
          :key="account.id"
          :account="account"
          :account-type-options="accountTypeOptions"
          :errors="getAccountErrors(account.id)"
          :isValid="isAccountValid(account.id)"
          @update="handleAccountUpdate(account.id, $event)"
          @delete="handleAccountDelete(account.id)"
          @validate="handleAccountValidate(account.id, $event)"
        />
      </div>
      <Transition
        enter-active-class="transition-all duration-500 ease-out"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
      >
        <div
          v-if="!hasAccounts && !isLoading"
          class="bg-white rounded-2xl shadow-sm p-12 text-center border-2 border-dashed border-gray-300"
        >
          <div class="max-w-md mx-auto">
            <h3 class="text-2xl font-bold text-gray-700 mb-3">Нет учетных записей</h3>
          </div>
        </div>
      </Transition>
      <Transition
        enter-active-class="transition-opacity duration-300"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
      >
        <div
          v-if="isLoading"
          class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <div class="bg-white rounded-2xl p-8 shadow-xl text-center">
            <i class="pi pi-spin pi-spinner text-4xl text-primary-500 mb-4"></i>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">Загрузка...</h3>
            <p class="text-gray-600">Загружаем ваши учетные записи</p>
          </div>
        </div>
      </Transition>
      <ConfirmDialog />
      <Toast />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { useAccountStore } from '@/stores/account.store'
import AccountItem from './AccountItem.vue'
import Button from 'primevue/button'
import ConfirmDialog from 'primevue/confirmdialog'
import Toast from 'primevue/toast'
import type { Account, AccountErrors } from '@/types/account.type'
const accountStore = useAccountStore()
const confirm = useConfirm()
const toast = useToast()
const accountErrors = ref<Map<string, AccountErrors>>(new Map())
const accountValidation = ref<Map<string, boolean>>(new Map())
const accounts = computed(() => accountStore.accounts)
const hasAccounts = computed(() => accountStore.hasAccounts)
const isLoading = computed(() => accountStore.isLoading)
const lastError = computed(() => accountStore.lastError)
const accountTypeOptions = computed(() => accountStore.accountTypeOptions)
const handleAddAccount = () => {
  accountStore.addAccount()
  toast.add({
    severity: 'success',
    summary: 'Учетная запись добавлена',
    detail: 'Новая учетная запись создана успешно',
    life: 3000,
  })
}
const handleAccountDelete = (id: string) => {
  confirm.require({
    message: 'Вы уверены, что хотите удалить эту учетную запись?',
    header: 'Подтверждение удаления',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    rejectClass: 'p-button-text',
    accept: () => {
      const success = accountStore.removeAccount(id)
      if (success) {
        accountErrors.value.delete(id)
        accountValidation.value.delete(id)
        toast.add({
          severity: 'info',
          summary: 'Учетная запись удалена',
          detail: 'Учетная запись успешно удалена',
          life: 3000,
        })
      }
    },
  })
}
const handleAccountUpdate = (id: string, updates: Partial<Account>) => {
  accountStore.updateAccount(id, updates)
}
const handleAccountValidate = (id: string, accountData: Partial<Account>) => {
  const validation = accountStore.validateAccount(accountData)
  if (validation.isValid) {
    accountErrors.value.delete(id)
    accountValidation.value.set(id, true)
  } else {
    accountErrors.value.set(id, validation.errors)
    accountValidation.value.set(id, false)
  }
}
const getAccountErrors = (id: string): AccountErrors => {
  return accountErrors.value.get(id) || {}
}
const isAccountValid = (id: string): boolean => {
  return accountValidation.value.get(id) || false
}
const confirmClearAll = () => {
  confirm.require({
    message: 'Вы уверены, что хотите удалить ВСЕ учетные записи? Это действие нельзя отменить.',
    header: 'Очистка всех записей',
    icon: 'pi pi-exclamation-triangle text-red-500',
    acceptClass: 'p-button-danger',
    rejectClass: 'p-button-text',
    accept: () => {
      accountStore.clearAllAccounts()
      accountErrors.value.clear()
      accountValidation.value.clear()
      toast.add({
        severity: 'warn',
        summary: 'Все записи удалены',
        detail: 'Все учетные записи были успешно удалены',
        life: 4000,
      })
    },
  })
}
const clearError = () => {
  accountStore.clearError()
}
onMounted(() => {
  accountStore.loadFromStorage()
  accounts.value.forEach((account) => {
    const validation = accountStore.validateAccount(account)
    accountValidation.value.set(account.id, validation.isValid)
    if (!validation.isValid) {
      accountErrors.value.set(account.id, validation.errors)
    }
  })
})
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.95);
}
.list-leave-to {
  opacity: 0;
  transform: translateY(-30px) scale(0.95);
}
.list-move {
  transition: transform 0.5s ease;
}
.shadow-sm {
  box-shadow:
    0 1px 3px 0 rgba(0, 0, 0, 0.1),
    0 1px 2px 0 rgba(0, 0, 0, 0.06);
}
</style>
