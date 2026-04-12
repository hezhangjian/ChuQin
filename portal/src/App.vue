<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

type AnalysisImage = {
  name: string
  path: string
  mimeType: string
  base64: string
}

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
  images?: AnalysisImage[]
  runDir?: string
  skillId?: string
  stage?: string
  isPending?: boolean
}

type SkillRecord = {
  id: string
  name: string
  path: string
  description: string
  entryScript: string | null
  exampleFiles: string[]
  keywords: string[]
}

type AppState = {
  appName: string
  rootDir: string | null
  configPath: string | null
  skillsRoot: string | null
  provider: {
    mode: 'online' | 'offline'
    model: string
    baseUrl: string
    hasApiKey: boolean
  }
  skills: SkillRecord[]
}

type SkillRunJob = {
  jobId: string
  skillId: string
  status: 'queued' | 'running' | 'completed' | 'error'
  stage: string
  progressText: string
  filePath: string
  runDir?: string | null
  summary?: string | null
  images: AnalysisImage[]
  error?: string | null
}

declare global {
  interface Window {
    pywebview?: {
      api?: {
        get_state: () => Promise<AppState>
        getState: () => Promise<AppState>
        chat: (payload: {
          message: string
          messages: ChatMessage[]
          selectedSkillIds: string[]
        }) => Promise<{ message?: ChatMessage; error?: string }>
        chatMessage: (payload: {
          message: string
          messages: ChatMessage[]
          selectedSkillIds: string[]
        }) => Promise<{ message?: ChatMessage; error?: string }>
        start_skill_run: (payload: {
          filePath?: string
          skillId: string
        }) => Promise<{ jobId?: string; error?: string }>
        startSkillRun: (payload: {
          filePath?: string
          skillId: string
        }) => Promise<{ jobId?: string; error?: string }>
        get_skill_run: (payload: { jobId: string }) => Promise<SkillRunJob & { error?: string }>
        getSkillRun: (payload: { jobId: string }) => Promise<SkillRunJob & { error?: string }>
      }
    }
  }
}

const state = ref<AppState | null>(null)
const ready = ref(false)
const loading = ref(true)
const sending = ref(false)
const errorText = ref('')
const bridgeDebug = ref('')
const draft = ref('')
const selectedSkillIds = ref<string[]>([])
const messages = ref<ChatMessage[]>([
  {
    role: 'assistant',
    content:
      '欢迎来到 ChuQin。现在如果你的对话内容命中了某个本地 skill 的关键词，或者你贴了一个本地文件路径，我会优先尝试自动匹配并执行对应 skill。',
  },
])

const providerLabel = computed(() => {
  if (!state.value) return '未连接'
  return state.value.provider.mode === 'online'
    ? `在线模型 · ${state.value.provider.model}`
    : '离线占位模式'
})

const executableSkillCount = computed(
  () => (state.value?.skills ?? []).filter((skill) => Boolean(skill.entryScript)).length,
)

function waitForPywebview(): Promise<void> {
  return new Promise((resolve, reject) => {
    const deadline = window.setTimeout(() => {
      window.clearInterval(intervalId)
      window.removeEventListener('pywebviewready', onReady)
      reject(new Error('PyWebview API 尚未就绪，请稍后再试。'))
    }, 10000)

    const finish = () => {
      ready.value = true
      window.clearTimeout(deadline)
      window.clearInterval(intervalId)
      window.removeEventListener('pywebviewready', onReady)
      resolve()
    }

    const onReady = () => {
      if (window.pywebview?.api) {
        finish()
      }
    }

    const intervalId = window.setInterval(() => {
      if (window.pywebview?.api) {
        finish()
      }
    }, 250)

    if (window.pywebview?.api) {
      finish()
      return
    }

    window.addEventListener('pywebviewready', onReady, { once: true })
  })
}

async function loadState() {
  loading.value = true
  errorText.value = ''

  try {
    await waitForPywebview()

    const pywebviewKeys = Object.keys(window.pywebview ?? {})
    const apiKeys = Object.keys(window.pywebview?.api ?? {})
    bridgeDebug.value = `pywebview keys: ${pywebviewKeys.join(', ') || '(none)'} | api keys: ${apiKeys.join(', ') || '(none)'}`

    const getStateFn = window.pywebview?.api?.get_state ?? window.pywebview?.api?.getState
    if (!getStateFn) {
      throw new Error('PyWebview API is unavailable')
    }

    state.value = await getStateFn()
  } catch (error) {
    errorText.value = error instanceof Error ? error.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

function isAutoSkillRequest(content: string): boolean {
  const text = content.toLowerCase()
  const triggerWords = ['分析', '汇总', '总结', '图表', '可视化', '处理', '运行', '执行', '生成', '文件', '数据']
  return triggerWords.some((word) => text.includes(word)) || /[/~\w.\-]+(?:\/[\w.\-]+)+\.[A-Za-z0-9]+/.test(content)
}

function pickExecutableSkill(): SkillRecord | null {
  const skills = state.value?.skills ?? []
  const selected = skills.filter((skill) => selectedSkillIds.value.includes(skill.id) && skill.entryScript)
  if (selected.length) return selected[0]
  return skills.find((skill) => Boolean(skill.entryScript)) ?? null
}

function extractLocalFilePath(content: string): string | undefined {
  const matches = content.match(/([/~\w.\-]+(?:\/[\w.\-]+)+\.[A-Za-z0-9]+)/g) ?? []
  return matches[0]
}

async function sendMessage() {
  const content = draft.value.trim()
  const chatFn = window.pywebview?.api?.chat ?? window.pywebview?.api?.chatMessage
  if (!content || sending.value || !chatFn) return

  const history = [...messages.value]
  const nextMessages = [...messages.value, { role: 'user', content } as ChatMessage]
  messages.value = nextMessages
  draft.value = ''
  sending.value = true
  errorText.value = ''

  try {
    if (isAutoSkillRequest(content)) {
      const skill = pickExecutableSkill()
      if (skill) {
        await runSkillViaJob(content, skill)
        return
      }
    }

    const response = await chatFn({
      message: content,
      messages: history,
      selectedSkillIds: selectedSkillIds.value,
    })

    if (response.error) {
      throw new Error(response.error)
    }

    if (response.message) {
      messages.value = [...nextMessages, response.message]
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    messages.value = [...nextMessages, { role: 'assistant', content: `请求失败：${message}` }]
  } finally {
    sending.value = false
  }
}

async function runSkillViaJob(content: string, skill: SkillRecord) {
  const startRunFn = window.pywebview?.api?.start_skill_run ?? window.pywebview?.api?.startSkillRun
  const getRunFn = window.pywebview?.api?.get_skill_run ?? window.pywebview?.api?.getSkillRun
  if (!startRunFn || !getRunFn) {
    throw new Error('Skill runtime API is unavailable')
  }

  const pendingIndex = messages.value.length
  const inputPath = extractLocalFilePath(content)
  messages.value = [
    ...messages.value,
    {
      role: 'assistant',
      content: `已识别到技能请求，正在启动 \`${skill.name}\`...\n\n如果消息里没有可用的本地输入文件路径，我会自动使用该 skill 的 example 文件。`,
      stage: 'queued',
      isPending: true,
      skillId: skill.id,
    },
  ]

  const started = await startRunFn({
    filePath: inputPath,
    skillId: skill.id,
  })
  if (started.error || !started.jobId) {
    throw new Error(started.error || 'Failed to start skill run')
  }

  await pollRunIntoMessage(started.jobId, pendingIndex, getRunFn)
}

async function pollRunIntoMessage(
  jobId: string,
  messageIndex: number,
  getRunFn: (payload: { jobId: string }) => Promise<SkillRunJob & { error?: string }>,
) {
  for (;;) {
    const result = await getRunFn({ jobId })
    if (result.error) {
      throw new Error(result.error)
    }

    updateMessage(messageIndex, {
      content: buildJobMessage(result),
      stage: result.stage,
      runDir: result.runDir ?? undefined,
      images: result.status === 'completed' ? result.images : [],
      isPending: result.status !== 'completed' && result.status !== 'error',
      skillId: result.skillId,
    })

    if (result.status === 'completed') {
      return
    }
    if (result.status === 'error') {
      throw new Error(result.error || 'Skill run failed')
    }

    await new Promise((resolve) => window.setTimeout(resolve, 500))
  }
}

function buildJobMessage(result: SkillRunJob): string {
  const header = [
    `已自动执行 skill: \`${result.skillId}\``,
    `当前阶段: \`${result.stage}\``,
    `输入文件: \`${result.filePath}\``,
  ]

  if (result.status === 'completed') {
    return `${header.join('\n')}\n\n${result.summary ?? ''}`
  }

  if (result.status === 'error') {
    return `${header.join('\n')}\n\n执行失败：${result.error ?? 'Unknown error'}`
  }

  return `${header.join('\n')}\n\n${result.progressText}`
}

function updateMessage(index: number, patch: Partial<ChatMessage>) {
  const next = [...messages.value]
  next[index] = { ...next[index], ...patch }
  messages.value = next
}

function toggleSkill(skillId: string, checked: boolean) {
  const next = new Set(selectedSkillIds.value)
  if (checked) {
    next.add(skillId)
  } else {
    next.delete(skillId)
  }
  selectedSkillIds.value = [...next]
}

onMounted(loadState)
</script>

<template>
  <div class="app-shell">
    <main class="layout">
      <aside class="sidebar">
        <div class="brand-card">
          <p class="eyebrow">Desktop Agent</p>
          <h1>ChuQin</h1>
          <p class="muted">
            用 PyWebview + Vue3 + OpenTiny 构筑的桌面助手。它会读取
            <code>CHUQIN_DIR/resources/skills</code> 下的 skill，并在对话中自动尝试匹配本地可执行 skill。
          </p>
        </div>

        <div class="panel">
          <div class="panel-header">
            <h2>运行状态</h2>
            <span class="badge" :data-mode="state?.provider.mode">{{ providerLabel }}</span>
          </div>
          <p class="muted"><span>PyWebview:</span> <code>{{ ready ? 'ready' : 'waiting' }}</code></p>
          <p class="muted">
            <span>Root Dir:</span>
            <code>{{ state?.rootDir ?? '未设置 CHUQIN_DIR / ChuQIN_DIR' }}</code>
          </p>
          <p class="muted">
            <span>Config:</span>
            <code>{{ state?.configPath ?? '未发现 .chuqin/config.toml' }}</code>
          </p>
          <p class="muted">
            <span>Skills Root:</span>
            <code>{{ state?.skillsRoot ?? '未设置 CHUQIN_DIR / ChuQIN_DIR 或目录不存在' }}</code>
          </p>
          <p class="muted">
            <span>Executable:</span>
            <code>{{ executableSkillCount }}</code>
          </p>
        </div>

        <div class="panel skills-panel">
          <div class="panel-header">
            <h2>Skills</h2>
            <span class="count">{{ state?.skills.length ?? 0 }}</span>
          </div>

          <div v-if="loading" class="empty-state">
            正在读取 skills...
          </div>

          <div v-else-if="errorText" class="empty-state">
            技能列表加载失败：{{ errorText }}
          </div>

          <div v-else-if="state?.skills.length" class="skills-list">
            <label v-for="skill in state.skills" :key="skill.id" class="skill-item">
              <input
                class="skill-checkbox"
                type="checkbox"
                :checked="selectedSkillIds.includes(skill.id)"
                @change="(event) => toggleSkill(skill.id, (event.target as HTMLInputElement).checked)"
              >
              <div class="skill-copy">
                <strong>{{ skill.name }}</strong>
                <p>{{ skill.description }}</p>
                <code>{{ skill.path }}</code>
                <code v-if="skill.entryScript">entry: {{ skill.entryScript }}</code>
                <code v-if="skill.keywords?.length">keywords: {{ skill.keywords.slice(0, 8).join(', ') }}</code>
              </div>
            </label>
          </div>

          <p v-else class="empty-state">
            还没有发现 skill。可以设置环境变量 <code>CHUQIN_DIR</code>，并在
            <code>resources/skills</code> 下放入目录或 <code>SKILL.md</code> 文件。
          </p>
        </div>
      </aside>

      <section class="chat-panel">
        <div class="chat-header">
          <div>
            <p class="eyebrow">Conversation</p>
            <h2>对话区</h2>
          </div>
          <button class="action-button" type="button" @click="loadState">
            {{ loading ? '加载中...' : '刷新技能' }}
          </button>
        </div>

        <div v-if="errorText" class="error-banner">
          {{ errorText }}
        </div>

        <div v-if="bridgeDebug" class="bridge-debug">
          {{ bridgeDebug }}
        </div>

        <div class="agent-hint">
          <strong>Agent 自动执行提示</strong>
          <p>直接描述你的目标，或者贴一个本地文件路径；如果命中了某个 skill 的关键词，我会自动尝试执行它，并把详细结果展示出来。</p>
        </div>

        <div class="messages">
          <article
            v-for="(message, index) in messages"
            :key="`${message.role}-${index}`"
            class="message"
            :data-role="message.role"
          >
            <span class="message-role">{{ message.role === 'user' ? '你' : 'ChuQin' }}</span>
            <p>{{ message.content }}</p>
            <p v-if="message.stage" class="artifact-meta">
              Stage: <code>{{ message.stage }}</code>
            </p>
            <p v-if="message.runDir" class="artifact-meta">
              Run Dir: <code>{{ message.runDir }}</code>
            </p>
            <p v-if="message.isPending" class="pending-note">任务仍在执行中，结果会自动刷新到这条消息。</p>
            <div v-if="message.images?.length" class="image-grid">
              <figure v-for="image in message.images" :key="image.path" class="image-card">
                <img :src="`data:${image.mimeType};base64,${image.base64}`" :alt="image.name">
                <figcaption>{{ image.name }}</figcaption>
              </figure>
            </div>
          </article>
        </div>

        <div class="composer">
          <textarea
            v-model="draft"
            class="composer-input"
            rows="4"
            placeholder="例如：帮我分析这个文件；或者直接发 /Users/akka/OneDrive/xxx.csv / xxx.json / xxx.md 让我自动调用 skill"
            @keydown.enter.exact.prevent="sendMessage"
          />
          <div class="composer-actions">
            <p class="muted">按 Enter 发送，Shift + Enter 换行</p>
            <button class="primary-button" type="button" :disabled="sending" @click="sendMessage">
              {{ sending ? '发送中...' : '发送' }}
            </button>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
}

.layout {
  display: grid;
  grid-template-columns: 360px minmax(0, 1fr);
  min-height: 100vh;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  background:
    radial-gradient(circle at top left, rgba(20, 184, 166, 0.18), transparent 40%),
    linear-gradient(180deg, rgba(7, 18, 24, 0.98), rgba(11, 31, 40, 0.94));
  border-right: 1px solid rgba(148, 163, 184, 0.16);
}

.brand-card,
.panel,
.chat-panel {
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: rgba(15, 23, 42, 0.72);
  backdrop-filter: blur(12px);
  box-shadow: 0 22px 50px rgba(15, 23, 42, 0.22);
}

.brand-card,
.panel {
  border-radius: 24px;
  padding: 18px;
}

.brand-card h1,
.chat-header h2 {
  margin: 6px 0 10px;
}

.brand-card h1,
.panel h2,
.sidebar strong,
.sidebar code,
.sidebar .muted,
.sidebar .empty-state,
.sidebar .eyebrow {
  color: #f8fafc;
}

.panel-header,
.chat-header,
.composer-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.badge,
.count,
.message-role,
.eyebrow {
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 12px;
}

.badge {
  border-radius: 999px;
  padding: 6px 10px;
  background: rgba(14, 165, 233, 0.12);
  color: #7dd3fc;
}

.badge[data-mode='offline'] {
  background: rgba(245, 158, 11, 0.12);
  color: #fbbf24;
}

.count {
  color: #93c5fd;
}

.skills-panel {
  flex: 1;
  min-height: 0;
}

.skills-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
  max-height: calc(100vh - 360px);
  overflow: auto;
  padding-right: 4px;
}

.skill-item {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;
  align-items: start;
  padding: 14px;
  border-radius: 18px;
  background: rgba(30, 41, 59, 0.6);
}

.skill-checkbox {
  margin-top: 4px;
}

.skill-copy strong {
  display: block;
  margin-bottom: 4px;
}

.skill-copy p,
.muted,
.empty-state {
  color: #cbd5e1;
}

.skill-copy p {
  margin: 0 0 6px;
}

.skill-copy code,
.panel code,
.empty-state code {
  display: block;
  overflow-wrap: anywhere;
}

.chat-panel {
  display: grid;
  grid-template-rows: auto auto auto 1fr auto;
  gap: 18px;
  padding: 24px;
  margin: 24px;
  border-radius: 32px;
  background:
    radial-gradient(circle at top right, rgba(45, 212, 191, 0.12), transparent 30%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.84), rgba(241, 245, 249, 0.94));
}

.messages {
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow: auto;
  min-height: 0;
  padding-right: 6px;
}

.message {
  max-width: min(86%, 920px);
  padding: 16px 18px;
  border-radius: 22px;
  background: #ffffff;
  box-shadow: 0 18px 40px rgba(148, 163, 184, 0.18);
}

.message[data-role='user'] {
  align-self: flex-end;
  background: linear-gradient(135deg, #0f766e, #115e59);
  color: #ecfeff;
}

.message p {
  white-space: pre-wrap;
  margin: 8px 0 0;
  line-height: 1.7;
}

.message-role {
  color: #64748b;
  font-weight: 700;
}

.message[data-role='user'] .message-role {
  color: rgba(236, 254, 255, 0.78);
}

.composer {
  display: grid;
  gap: 12px;
}

.composer-input {
  width: 100%;
  min-height: 120px;
  border: 1px solid #cbd5e1;
  border-radius: 18px;
  padding: 14px 16px;
  resize: vertical;
  background: rgba(255, 255, 255, 0.96);
  color: #0f172a;
}

.action-button,
.primary-button {
  border: 0;
  border-radius: 999px;
  padding: 10px 16px;
  font-weight: 600;
  cursor: pointer;
}

.action-button {
  background: #e2e8f0;
  color: #0f172a;
}

.primary-button {
  background: linear-gradient(135deg, #0f766e, #14b8a6);
  color: #f8fafc;
}

.primary-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-banner {
  border-radius: 16px;
  padding: 12px 14px;
  background: rgba(239, 68, 68, 0.12);
  color: #991b1b;
}

.bridge-debug,
.agent-hint {
  border-radius: 16px;
  padding: 12px 14px;
  background: rgba(15, 23, 42, 0.06);
  color: #334155;
}

.bridge-debug {
  font-family: "SFMono-Regular", "JetBrains Mono", monospace;
  font-size: 12px;
  overflow-wrap: anywhere;
}

.agent-hint p {
  margin: 6px 0 0;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-top: 14px;
}

.image-card {
  margin: 0;
  border-radius: 18px;
  overflow: hidden;
  background: rgba(248, 250, 252, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.image-card img {
  display: block;
  width: 100%;
  height: auto;
}

.image-card figcaption {
  padding: 10px 12px;
  font-size: 13px;
  color: #334155;
}

.artifact-meta,
.pending-note {
  margin-top: 12px;
  color: #475569;
}

@media (max-width: 980px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .chat-panel {
    margin: 0;
    border-radius: 0;
    min-height: 60vh;
  }
}
</style>
