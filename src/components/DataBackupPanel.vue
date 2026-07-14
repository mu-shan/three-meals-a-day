<script setup lang="ts">
import { Button, Collapse, Divider, Title } from 'animal-island-vue'
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
  <section class="backup-panel" aria-labelledby="backup-panel-title">
    <Collapse data-testid="backup-collapse">
      <template #question>
        <div class="backup-panel__heading">
          <div>
            <p>留一份安心</p>
            <Title id="backup-panel-title" size="middle" color="brown">数据备份与恢复</Title>
          </div>
          <span>只保存在你的设备里</span>
        </div>
      </template>

      <div class="backup-panel__content">
        <p class="backup-panel__lead">
          导出菜单和口味记录，换手机或清理浏览器后还能再恢复。
        </p>
        <Divider type="dashed-brown" />

        <div class="backup-panel__actions">
          <Button type="primary" class="backup-panel__button" @click="exportBackup">导出备份</Button>
          <Button
            type="default"
            class="backup-panel__button backup-panel__button--secondary"
            @click="chooseBackup"
          >
            导入恢复
          </Button>
          <input
            ref="fileInput"
            data-testid="backup-file"
            class="backup-panel__file"
            type="file"
            accept="application/json,.json"
            @change="onFileChange"
          />
        </div>

        <p v-if="importError" class="backup-panel__error" role="alert">{{ importError }}</p>

        <div v-if="pendingBackup" class="backup-panel__preview" role="status">
          <span>确认恢复</span>
          <h3>{{ previewDate }} 的备份</h3>
          <p>
            菜单日期 {{ pendingBackup.menu.date }} ·
            喜欢 {{ pendingBackup.preferences.likedIds.length }} 道 ·
            不喜欢 {{ pendingBackup.preferences.dislikedIds.length }} 道
          </p>
          <div>
            <Button data-testid="confirm-import" type="primary" @click="confirmImport">
              覆盖并恢复
            </Button>
            <Button type="default" @click="pendingBackup = null">暂不恢复</Button>
          </div>
        </div>
      </div>
    </Collapse>
  </section>
</template>
