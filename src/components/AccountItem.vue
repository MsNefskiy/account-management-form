<template>
  <div
    class="account-item bg-white rounded-xl shadow-sm border-2 transition-all duration-300 hover:shadow-md"
    :class="accountItemClasses"
  >
    <div class="flex items-center justify-between p-4 border-b border-gray-100">
      <div class="flex items-center space-x-3">
        <i :class="accountIcon" class="text-xl"></i>
        <div>
          <h3 class="font-semibold text-gray-800">
            {{ account.login || 'Новая учетная запись' }}
          </h3>
          <div class="flex items-center space-x-2 text-sm text-gray-500">
            <span class="flex items-center">
              <i class="pi pi-tag mr-1"></i>
              {{ accountTypeLabel }}
            </span>
            <span class="flex items-center">
              <i class="pi pi-calendar mr-1"></i>
              {{ formatDate(account.createdAt) }}
            </span>
          </div>
        </div>
      </div>
      <div class="flex items-center space-x-2">
        <Button
          icon="pi pi-trash"
          class="p-button-text p-button-danger p-button-sm"
          @click="emit('delete')"
          v-tooltip="'Удалить учетную запись'"
        />
      </div>
    </div>
    <div class="p-6 space-y-4">
      <div class="form-field">
        <label class="form-label flex items-center justify-between">
          <span>Метка</span>
          <span class="text-xs text-gray-500 font-normal"> {{ account.label.length }}/50 </span>
        </label>
        <InputText
          v-model="localAccount.label"
          :class="['input-field', { 'input-error': errors.label }]"
          placeholder="метка1; метка2; метка3"
          @blur="handleFieldBlur"
          @input="handleFieldInput"
        />
        <div v-if="errors.label" class="error-text flex items-center">
          <i class="pi pi-exclamation-circle mr-1"></i>
          {{ errors.label }}
        </div>
        <div v-if="account.labels.length > 0" class="flex flex-wrap gap-2 mt-2">
          <span
            v-for="(label, index) in account.labels"
            :key="index"
            class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
          >
            <i class="pi pi-tag mr-1 text-xs"></i>
            {{ label.text }}
          </span>
        </div>
        <small class="text-gray-500 text-xs mt-1 block">
          Разделяйте метки через точку с запятой (;)
        </small>
      </div>
      <div class="form-field">
        <label class="form-label">Тип записи</label>
        <Dropdown
          v-model="localAccount.type"
          :options="accountTypeOptions"
          optionLabel="label"
          optionValue="value"
          class="select-field"
          @change="handleTypeChange"
        />
        <small class="text-gray-500 text-xs mt-1 block">
          {{ selectedTypeOption?.description }}
        </small>
      </div>
      <div class="form-field">
        <label class="form-label flex items-center justify-between">
          <span>Логин</span>
          <span class="text-xs text-gray-500 font-normal">
            {{ localAccount.login.length }}/100
          </span>
        </label>
        <InputText
          v-model="localAccount.login"
          class="input-field text-xs"
          :class="{ 'input-error': errors.login }"
          placeholder="Логин"
          @blur="handleFieldBlur"
          @input="handleFieldInput"
        />
        <div v-if="errors.login" class="error-text flex items-center">
          <i class="pi pi-exclamation-circle mr-1"></i>
          {{ errors.login }}
        </div>
      </div>
      <div v-if="localAccount.type === 'LOCAL'" class="form-field">
        <label class="form-label flex items-center justify-between">
          <span>Пароль</span>
          <span class="text-xs text-gray-500 font-normal">
            {{ localAccount.password?.length || 0 }}/100
          </span>
        </label>
        <Password
          v-model="localAccount.password"
          placeholder="Введите пароль"
          :feedback="false"
          toggleMask
          :class="[{ 'input-error': errors.password }]"
          @blur="handleFieldBlur"
          @input="handleFieldInput"
        />
        <div v-if="errors.password" class="error-text flex items-center">
          <i class="pi pi-exclamation-circle mr-1"></i>
          {{ errors.password }}
        </div>
      </div>
      <div v-else class="form-field">
        <label class="form-label">Пароль</label>
        <div
          class="flex items-center justify-center p-4 bg-gray-50 rounded-lg border border-gray-200"
        >
          <i class="pi pi-lock text-gray-400 mr-2"></i>
          <span class="text-gray-500 text-sm">Пароль не требуется для LDAP</span>
        </div>
      </div>
    </div>
    <div
      class="px-6 py-3 border-t border-gray-100 bg-gray-50 rounded-b-xl"
      :class="{
        'bg-green-50 border-green-200': isValid,
        'bg-red-50 border-red-200': !isValid && hasErrors,
      }"
    >
      <div class="flex items-center justify-between text-sm">
        <div class="flex items-center">
          <i :class="[validationIcon, validationIconColor, 'mr-2']"></i>
          <span :class="validationTextColor">
            {{ validationMessage }}
          </span>
        </div>
        <div class="text-xs text-gray-500">Обновлено: {{ formatDate(account.updatedAt) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Password from 'primevue/password'
import type { Account, AccountErrors, AccountTypeOption } from '@/types/account.type'

interface Props {
  account: Account
  accountTypeOptions: AccountTypeOption[]
  errors: AccountErrors
  isValid: boolean
}
const props = defineProps<Props>()
const emit = defineEmits<{
  update: [account: Partial<Account>]
  delete: []
  validate: [account: Partial<Account>]
}>()
const localAccount = ref<Account>({
  ...props.account,
  password:
    props.account.type === 'LOCAL'
      ? typeof props.account.password === 'string'
        ? props.account.password
        : ''
      : null,
})
const errors = computed(() => props.errors)
const accountTypeOptions = computed(() => props.accountTypeOptions)
const hasErrors = computed(() => Object.keys(props.errors).length > 0)
const accountItemClasses = computed(() => ({
  'border-green-200': props.isValid,
  'border-red-200': !props.isValid && hasErrors.value,
  'border-gray-200': !hasErrors.value && !props.isValid,
}))
const accountIcon = computed(() => {
  return props.account.type === 'LOCAL'
    ? 'pi pi-desktop text-blue-500'
    : 'pi pi-cloud text-green-500'
})
const accountTypeLabel = computed(() => {
  return props.account.type === 'LOCAL' ? 'Локальная учетная запись' : 'LDAP учетная запись'
})
const selectedTypeOption = computed(() => {
  return props.accountTypeOptions.find((opt) => opt.value === localAccount.value.type)
})
const validationIcon = computed(() => {
  if (props.isValid) return 'pi pi-check-circle'
  if (hasErrors.value) return 'pi pi-exclamation-circle'
  return 'pi pi-info-circle'
})
const validationIconColor = computed(() => {
  if (props.isValid) return 'text-green-500'
  if (hasErrors.value) return 'text-red-500'
  return 'text-blue-500'
})
const validationTextColor = computed(() => {
  if (props.isValid) return 'text-green-700'
  if (hasErrors.value) return 'text-red-700'
  return 'text-blue-700'
})
const validationMessage = computed(() => {
  if (props.isValid) return 'Учетная запись валидна и сохранена'
  if (hasErrors.value) return 'Исправьте ошибки перед сохранением'
  return 'Заполните обязательные поля'
})
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}
const handleTypeChange = () => {
  emit('update', {
    type: localAccount.value.type,
    password: localAccount.value.type === 'LDAP' ? null : localAccount.value.password,
  })
}
function handleFieldBlur() {
  emit('validate', localAccount.value)
}
function handleFieldInput() {
  emit('update', localAccount.value)
  emit('validate', localAccount.value)
}
watch(
  () => props.account,
  (newAccount) => {
    localAccount.value = {
      ...newAccount,
      password:
        newAccount.type === 'LOCAL'
          ? typeof newAccount.password === 'string'
            ? newAccount.password
            : ''
          : null,
    }
  },
  { deep: true },
)
nextTick(() => {
  if (localAccount.value.login || localAccount.value.label) {
    emit('validate', localAccount.value)
  }
})
</script>

<style scoped>
.account-item {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.account-item:hover {
  transform: translateY(-2px);
}
.status-indicator {
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
