<script setup lang="ts">
import { Button } from 'animal-island-vue'
import { computed, nextTick, ref } from 'vue'
import {
  createAppBackup,
  createBackupFilename,
  parseAppBackup,
  serializeAppBackup,
} from '../services/appBackup'
import type { AppBackupV1, DailyMenu, DishPreferences } from '../types/menu'

const props = defineProps<{
  menu: DailyMenu
  preferences: DishPreferences
}>()

const emit = defineEmits<{
  restore: [backup: AppBackupV1]
  'before-export': []
}>()

const pendingBackup = ref<AppBackupV1 | null>(null)
const importError = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

const previewDate = computed(() => {
  if (!pendingBackup.value) return ''
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(pendingBackup.value.exportedAt))
})

const exportBackup = async () => {
  importError.value = ''
  try {
    emit('before-export')
    await nextTick()
    const backup = createAppBackup(props.menu, props.preferences)
    const blob = new Blob([serializeAppBackup(backup)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = createBackupFilename(props.menu.date)
    link.hidden = true
    document.body.append(link)
    link.click()
    window.setTimeout(() => {
      link.remove()
      URL.revokeObjectURL(url)
    }, 1000)
  } catch {
    importError.value = '导出失败，请稍后重试'
  }
}

const chooseBackup = () => fileInput.value?.click()

const onFileChange = async (event: Event) => {
  importError.value = ''
  pendingBackup.value = null
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  try {
    const result = parseAppBackup(await file.text())
    if (result.ok) {
      pendingBackup.value = result.backup
    } else {
      importError.value = result.error
    }
  } catch {
    importError.value = '无法读取这个备份文件'
  } finally {
    input.value = ''
  }
}

const confirmImport = () => {
  if (!pendingBackup.value) return
  emit('restore', pendingBackup.value)
  pendingBackup.value = null
}
</script>

<template>
  <section
    class="mt-7 mb-6 rounded-[28px] border-[3px] border-ink bg-paper px-4 py-6 shadow-paper"
    aria-labelledby="backup-panel-title"
  >
    <div class="flex items-end justify-between gap-3">
      <div>
        <p class="m-0 text-xs font-bold tracking-wide text-forest-dark">留一份安心</p>
        <h2 id="backup-panel-title" class="mt-1 mb-0 font-display text-[2rem] font-normal text-ink">数据备份</h2>
      </div>
      <span class="pb-1 text-right text-[10px] font-bold text-muted">只保存在你的设备里</span>
    </div>

    <p class="my-4 text-sm leading-6 font-semibold text-muted">
      导出菜单和口味记录，换手机或清理浏览器后还能再恢复。
    </p>

    <div class="grid grid-cols-2 gap-2">
      <Button type="primary" class="min-h-12 rounded-xl! bg-forest! text-sm! font-bold!" @click="exportBackup">导出备份</Button>
      <Button
        type="default"
        class="min-h-12 rounded-xl! border-line! bg-paper-soft! text-sm! text-ink!"
        @click="chooseBackup"
      >
        导入恢复
      </Button>
      <input
        ref="fileInput"
        data-testid="backup-file"
        class="sr-only"
        type="file"
        accept="application/json,.json"
        @change="onFileChange"
      />
    </div>

    <p v-if="importError" class="mt-3 mb-0 rounded-lg bg-clay/12 px-3 py-2 text-sm font-semibold text-clay" role="alert">{{ importError }}</p>

    <div v-if="pendingBackup" class="mt-4 rounded-2xl border-2 border-dashed border-line bg-sand/25 p-3" role="status">
      <span class="text-[10px] font-bold tracking-widest text-clay">确认恢复</span>
      <h3 class="my-1 text-sm text-ink">{{ previewDate }} 的备份</h3>
      <p class="m-0 text-xs leading-5 text-muted">
        菜单日期 {{ pendingBackup.menu.date }} ·
        喜欢 {{ pendingBackup.preferences.likedIds.length }} 道 ·
        不喜欢 {{ pendingBackup.preferences.dislikedIds.length }} 道
      </p>
      <div class="mt-3 flex flex-wrap gap-2">
        <Button
          data-testid="confirm-import"
          type="primary"
          class="min-h-11 rounded-full! bg-forest! px-3! text-xs! font-bold!"
          @click="confirmImport"
        >
          覆盖并恢复
        </Button>
        <Button
          type="default"
          class="min-h-11 rounded-full! border-line! bg-transparent! px-3! text-xs! text-muted!"
          @click="pendingBackup = null"
        >
          暂不恢复
        </Button>
      </div>
    </div>
  </section>
</template>
