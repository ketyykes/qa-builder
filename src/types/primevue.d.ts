/** PrimeVue 相關型別定義 */

// Toast 服務型別
export interface PrimeToast {
  add: (message: ToastMessageOptions) => void
  removeGroup: (group: string) => void
  removeAllGroups: () => void
}

// Toast 訊息選項型別
export interface ToastMessageOptions {
  severity?: 'success' | 'info' | 'warn' | 'error' | 'secondary' | 'contrast'
  summary?: string
  detail?: string
  life?: number
  sticky?: boolean
  closable?: boolean
  group?: string
}

// 確認對話框服務型別
export interface PrimeConfirm {
  require: (options: ConfirmDialogRequireOptions) => void
  close: () => void
}

// 確認對話框選項型別
export interface ConfirmDialogRequireOptions {
  target?: EventTarget
  message?: string
  group?: string
  icon?: string
  header?: string
  acceptLabel?: string
  acceptIcon?: string
  acceptClass?: string
  accept?: () => void
  rejectLabel?: string
  rejectIcon?: string
  rejectClass?: string
  reject?: () => void
  onShow?: () => void
  onHide?: () => void
}

// Button 組件 Props 型別
export interface PrimeButtonProps {
  label?: string
  icon?: string
  iconPos?: 'left' | 'right' | 'top' | 'bottom'
  badge?: string
  badgeClass?: string
  disabled?: boolean
  loading?: boolean
  loadingIcon?: string
  link?: boolean
  severity?:
    | 'secondary'
    | 'success'
    | 'info'
    | 'warning'
    | 'help'
    | 'danger'
    | 'contrast'
  raised?: boolean
  rounded?: boolean
  text?: boolean
  outlined?: boolean
  size?: 'small' | 'large'
  plain?: boolean
}

// InputText 組件 Props 型別
export interface PrimeInputTextProps {
  modelValue?: string | number
  size?: 'small' | 'large'
  invalid?: boolean
  variant?: 'filled' | 'outlined'
}

// Textarea 組件 Props 型別
export interface PrimeTextareaProps {
  modelValue?: string
  autoResize?: boolean
  rows?: number
  cols?: number
  invalid?: boolean
  variant?: 'filled' | 'outlined'
}

// Card 組件 Props 型別
export interface PrimeCardProps {
  header?: string
  subTitle?: string
}

// Message 組件 Props 型別
export interface PrimeMessageProps {
  severity?: 'success' | 'info' | 'warn' | 'error' | 'secondary' | 'contrast'
  closable?: boolean
  sticky?: boolean
  life?: number
  icon?: string
  closeIcon?: string
}
