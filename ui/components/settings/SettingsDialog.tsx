import {invoke} from '@tauri-apps/api/core';
import {listen} from '@tauri-apps/api/event';
import {useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {buildConfig} from '../../config/build';
import {stringifyAppConfig} from '../../lib/config';
import type {AppConfig} from '../../lib/config';
import {SettingsSection} from '../../types';
import './SettingsDialog.css';

const GITHUB_LOGIN_WINDOW_LABEL = 'github-login';

type SettingsForm = {
  gitcodeUsername: string;
  llmProvider: string;
  llmModel: string;
  llmBaseUrl: string;
  llmApiKey: string;
  huaweiCloudProjectId: string;
  huaweiCloudUsername: string;
  huaweiCloudPassword: string;
  volcengineAk: string;
  volcengineSk: string;
  volcengineVisualHost: string;
  volcengineRegion: string;
  volcengineVideoReqKey: string;
  gitcodeToken: string;
  giteeUsername: string;
  giteeToken: string;
  githubUsername: string;
  githubToken: string;
};

const emptyForm: SettingsForm = {
  gitcodeUsername: '',
  llmProvider: '',
  llmModel: '',
  llmBaseUrl: '',
  llmApiKey: '',
  huaweiCloudProjectId: '',
  huaweiCloudUsername: '',
  huaweiCloudPassword: '',
  volcengineAk: '',
  volcengineSk: '',
  volcengineVisualHost: '',
  volcengineRegion: '',
  volcengineVideoReqKey: '',
  gitcodeToken: '',
  giteeUsername: '',
  giteeToken: '',
  githubUsername: '',
  githubToken: '',
};

function valueOrEmpty(value?: string) {
  return value ?? '';
}

function getLlmConfig(config?: AppConfig | null) {
  return config?.llm;
}

function getHuaweiCloudConfig(config?: AppConfig | null) {
  return config?.huaweicloud;
}

function configToForm(config?: AppConfig | null): SettingsForm {
  const llmConfig = getLlmConfig(config);
  const huaweiCloudConfig = getHuaweiCloudConfig(config);

  return {
    gitcodeUsername: valueOrEmpty(config?.gitcode?.username),
    llmProvider: valueOrEmpty(llmConfig?.provider),
    llmModel: valueOrEmpty(llmConfig?.model),
    llmBaseUrl: valueOrEmpty(llmConfig?.base_url),
    llmApiKey: valueOrEmpty(llmConfig?.api_key),
    huaweiCloudProjectId: valueOrEmpty(huaweiCloudConfig?.project_id),
    huaweiCloudUsername: valueOrEmpty(huaweiCloudConfig?.username),
    huaweiCloudPassword: valueOrEmpty(huaweiCloudConfig?.password),
    volcengineAk: valueOrEmpty(config?.volcengine?.ak),
    volcengineSk: valueOrEmpty(config?.volcengine?.sk),
    volcengineVisualHost: valueOrEmpty(config?.volcengine?.visual_host),
    volcengineRegion: valueOrEmpty(config?.volcengine?.region),
    volcengineVideoReqKey: valueOrEmpty(config?.volcengine?.video_req_key),
    gitcodeToken: valueOrEmpty(config?.gitcode?.token),
    giteeUsername: valueOrEmpty(config?.gitee?.username),
    giteeToken: valueOrEmpty(config?.gitee?.token),
    githubUsername: valueOrEmpty(config?.github?.username),
    githubToken: valueOrEmpty(config?.github?.token),
  };
}

function getConfigFromForm(
  form: SettingsForm,
  currentConfig: AppConfig,
  visibleSections: SettingsSection[]
): AppConfig {
  const nextConfig: AppConfig = {...currentConfig};

  if (visibleSections.includes(SettingsSection.Llm)) {
    nextConfig.llm = {
      ...getLlmConfig(currentConfig),
      provider: form.llmProvider.trim(),
      model: form.llmModel.trim(),
      base_url: form.llmBaseUrl.trim(),
      api_key: form.llmApiKey.trim(),
    };
  }

  if (visibleSections.includes(SettingsSection.HuaweiCloud)) {
    nextConfig.huaweicloud = {
      ...getHuaweiCloudConfig(currentConfig),
      project_id: form.huaweiCloudProjectId.trim(),
      username: form.huaweiCloudUsername.trim(),
      password: form.huaweiCloudPassword.trim(),
    };
  }

  if (visibleSections.includes(SettingsSection.Volcengine)) {
    nextConfig.volcengine = {
      ...currentConfig.volcengine,
      ak: form.volcengineAk.trim(),
      sk: form.volcengineSk.trim(),
      visual_host: form.volcengineVisualHost.trim(),
      region: form.volcengineRegion.trim(),
      video_req_key: form.volcengineVideoReqKey.trim(),
    };
  }

  if (visibleSections.includes(SettingsSection.GitCode)) {
    nextConfig.gitcode = {
      ...currentConfig.gitcode,
      username: form.gitcodeUsername.trim(),
      token: form.gitcodeToken.trim(),
    };
  }

  if (visibleSections.includes(SettingsSection.Gitee)) {
    nextConfig.gitee = {
      ...currentConfig.gitee,
      username: form.giteeUsername.trim(),
      token: form.giteeToken.trim(),
    };
  }

  if (visibleSections.includes(SettingsSection.GitHub)) {
    nextConfig.github = {
      ...currentConfig.github,
      username: form.githubUsername.trim(),
      token: form.githubToken.trim(),
    };
  }

  return nextConfig;
}

function SecretInput({
  disabled,
  onChange,
  value,
}: {
  disabled: boolean;
  onChange: (value: string) => void;
  value: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const {t} = useTranslation();

  return (
    <div className="settings-secret-input">
      <input
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        type={isVisible ? 'text' : 'password'}
        value={value}
      />
      <button
        aria-label={isVisible ? t('settings.actions.hideValue') : t('settings.actions.showValue')}
        disabled={disabled}
        onClick={() => setIsVisible((currentValue) => !currentValue)}
        type="button"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24">
          {isVisible ? (
            <>
              <path d="m3 3 18 18" />
              <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
              <path d="M9.9 4.2A10.9 10.9 0 0 1 12 4c5 0 8.4 4.4 9.4 6a3.6 3.6 0 0 1 0 4 16 16 0 0 1-2.1 2.7" />
              <path d="M6.6 6.6A16.2 16.2 0 0 0 2.6 10a3.6 3.6 0 0 0 0 4c1 1.6 4.4 6 9.4 6 1.2 0 2.3-.2 3.3-.6" />
            </>
          ) : (
            <>
              <path d="M2.6 10a3.6 3.6 0 0 0 0 4c1 1.6 4.4 6 9.4 6s8.4-4.4 9.4-6a3.6 3.6 0 0 0 0-4c-1-1.6-4.4-6-9.4-6s-8.4 4.4-9.4 6Z" />
              <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
            </>
          )}
        </svg>
      </button>
    </div>
  );
}

export function SettingsDialog({onClose}: {onClose: () => void}) {
  const {t} = useTranslation();
  const visibleSections = buildConfig.settings.sections;
  const [config, setConfig] = useState<AppConfig>({});
  const [error, setError] = useState<string>();
  const [form, setForm] = useState<SettingsForm>(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const canSave = useMemo(() => !isLoading && !isSaving, [isLoading, isSaving]);

  useEffect(() => {
    let isActive = true;

    async function loadConfig() {
      setIsLoading(true);
      setError(undefined);

      try {
        const nextConfig = (await invoke<AppConfig | null>('config_get')) ?? {};

        if (!isActive) {
          return;
        }

        setConfig(nextConfig);
        setForm(configToForm(nextConfig));
      } catch (loadError) {
        if (!isActive) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : String(loadError));
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadConfig();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', closeOnEscape);

    return () => {
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [onClose]);

  function updateField(field: keyof SettingsForm, value: string) {
    setForm((currentForm) => ({...currentForm, [field]: value}));
  }

  async function saveConfig() {
    setIsSaving(true);
    setError(undefined);

    try {
      const nextConfig = getConfigFromForm(form, config, visibleSections);
      await invoke<string>('config_write', {content: stringifyAppConfig(nextConfig)});
      setConfig(nextConfig);
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : String(saveError));
    } finally {
      setIsSaving(false);
    }
  }

  async function openGithubLogin() {
    try {
      await invoke('open_auth_window', {
        label: GITHUB_LOGIN_WINDOW_LABEL,
        url: 'https://github.com/login',
      });
    } catch (err) {
      console.error('Failed to open login window:', err);
    }
  }

  async function captureGithubTokens() {
    try {
      await invoke('capture_tokens', {
        label: GITHUB_LOGIN_WINDOW_LABEL,
      });
    } catch (err) {
      console.error('Failed to trigger capture:', err);
    }
  }

  useEffect(() => {
    const unlisten = listen('auth-captured', (event) => {
      const payload = event.payload as any;
      console.log('Demo: Captured Auth Data', payload);
      alert(
        `Demo Capture Success!\n\nURL: ${payload.url}\nCookies Length: ${payload.cookies?.length || 0}\n\n(Not saving to config)`
      );
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  return (
    <div className="settings-backdrop" role="presentation">
      <form
        aria-label={t('settings.labels.aria')}
        className="settings-dialog"
        onSubmit={(event) => {
          event.preventDefault();
          if (canSave) {
            void saveConfig();
          }
        }}
        aria-modal="true"
        role="dialog"
      >
        <div className="settings-header">
          <div>
            <h2>{t('settings.labels.title')}</h2>
          </div>
          <button
            aria-label={t('settings.actions.closeSettings')}
            className="settings-close"
            onClick={onClose}
            type="button"
          >
            x
          </button>
        </div>

        <div className="settings-body">
          {visibleSections.includes(SettingsSection.Llm) ? (
            <section className="settings-section" aria-label="LLM">
              <h3>{t('settings.sections.llm')}</h3>
              <label>
                {t('settings.fields.provider')}
                <input
                  autoFocus
                  disabled={isLoading}
                  onChange={(event) => updateField('llmProvider', event.target.value)}
                  placeholder={t('settings.placeholders.llmProvider')}
                  value={form.llmProvider}
                />
              </label>
              <label>
                {t('settings.fields.model')}
                <input
                  disabled={isLoading}
                  onChange={(event) => updateField('llmModel', event.target.value)}
                  placeholder={t('settings.placeholders.llmModel')}
                  value={form.llmModel}
                />
              </label>
              <label>
                {t('settings.fields.baseUrl')}
                <input
                  disabled={isLoading}
                  onChange={(event) => updateField('llmBaseUrl', event.target.value)}
                  placeholder={t('settings.placeholders.llmBaseUrl')}
                  value={form.llmBaseUrl}
                />
              </label>
              <label>
                {t('settings.fields.apiKey')}
                <SecretInput
                  disabled={isLoading}
                  onChange={(value) => updateField('llmApiKey', value)}
                  value={form.llmApiKey}
                />
              </label>
            </section>
          ) : null}

          {visibleSections.includes(SettingsSection.HuaweiCloud) ? (
            <section className="settings-section" aria-label="Huawei Cloud">
              <h3>{t('settings.sections.huaweiCloud')}</h3>
              <label>
                {t('settings.fields.projectId')}
                <input
                  disabled={isLoading}
                  onChange={(event) => updateField('huaweiCloudProjectId', event.target.value)}
                  value={form.huaweiCloudProjectId}
                />
              </label>
              <label>
                {t('settings.fields.username')}
                <input
                  disabled={isLoading}
                  onChange={(event) => updateField('huaweiCloudUsername', event.target.value)}
                  value={form.huaweiCloudUsername}
                />
              </label>
              <label>
                {t('settings.fields.password')}
                <SecretInput
                  disabled={isLoading}
                  onChange={(value) => updateField('huaweiCloudPassword', value)}
                  value={form.huaweiCloudPassword}
                />
              </label>
            </section>
          ) : null}

          {visibleSections.includes(SettingsSection.Volcengine) ? (
            <section className="settings-section" aria-label="Volcengine">
              <h3>{t('settings.sections.volcengine')}</h3>
              <label>
                {t('settings.fields.accessKey')}
                <SecretInput
                  disabled={isLoading}
                  onChange={(value) => updateField('volcengineAk', value)}
                  value={form.volcengineAk}
                />
              </label>
              <label>
                {t('settings.fields.secretKey')}
                <SecretInput
                  disabled={isLoading}
                  onChange={(value) => updateField('volcengineSk', value)}
                  value={form.volcengineSk}
                />
              </label>
              <label>
                {t('settings.fields.visualHost')}
                <input
                  disabled={isLoading}
                  onChange={(event) => updateField('volcengineVisualHost', event.target.value)}
                  value={form.volcengineVisualHost}
                />
              </label>
              <label>
                {t('settings.fields.region')}
                <input
                  disabled={isLoading}
                  onChange={(event) => updateField('volcengineRegion', event.target.value)}
                  value={form.volcengineRegion}
                />
              </label>
              <label>
                {t('settings.fields.videoReqKey')}
                <input
                  disabled={isLoading}
                  onChange={(event) => updateField('volcengineVideoReqKey', event.target.value)}
                  value={form.volcengineVideoReqKey}
                />
              </label>
            </section>
          ) : null}

          {visibleSections.includes(SettingsSection.GitCode) ? (
            <section className="settings-section" aria-label="GitCode">
              <h3>{t('settings.sections.gitcode')}</h3>
              <label>
                {t('settings.fields.username')}
                <input
                  disabled={isLoading}
                  onChange={(event) => updateField('gitcodeUsername', event.target.value)}
                  value={form.gitcodeUsername}
                />
              </label>
              <label>
                {t('settings.fields.token')}
                <SecretInput
                  disabled={isLoading}
                  onChange={(value) => updateField('gitcodeToken', value)}
                  value={form.gitcodeToken}
                />
              </label>
            </section>
          ) : null}

          {visibleSections.includes(SettingsSection.GitHub) ? (
            <section className="settings-section" aria-label="GitHub">
              <h3>{t('settings.sections.github')}</h3>
              <div style={{display: 'flex', gap: '8px', marginBottom: '12px'}}>
                <button type="button" onClick={openGithubLogin} style={{fontSize: '12px', padding: '4px 8px'}}>
                  Open GitHub Login
                </button>
                <button type="button" onClick={captureGithubTokens} style={{fontSize: '12px', padding: '4px 8px'}}>
                  Capture Tokens
                </button>
              </div>
              <label>
                {t('settings.fields.username')}
                <input
                  disabled={isLoading}
                  onChange={(event) => updateField('githubUsername', event.target.value)}
                  value={form.githubUsername}
                />
              </label>
              <label>
                {t('settings.fields.token')}
                <SecretInput
                  disabled={isLoading}
                  onChange={(value) => updateField('githubToken', value)}
                  value={form.githubToken}
                />
              </label>
            </section>
          ) : null}

          {visibleSections.includes(SettingsSection.Gitee) ? (
            <section className="settings-section" aria-label="Gitee">
              <h3>{t('settings.sections.gitee')}</h3>
              <label>
                {t('settings.fields.username')}
                <input
                  disabled={isLoading}
                  onChange={(event) => updateField('giteeUsername', event.target.value)}
                  value={form.giteeUsername}
                />
              </label>
              <label>
                {t('settings.fields.token')}
                <SecretInput
                  disabled={isLoading}
                  onChange={(value) => updateField('giteeToken', value)}
                  value={form.giteeToken}
                />
              </label>
            </section>
          ) : null}
        </div>

        {error ? <p className="settings-error">{error}</p> : null}

        <div className="settings-actions">
          <button onClick={onClose} type="button">
            {t('common.cancel')}
          </button>
          <button className="primary" disabled={!canSave} type="submit">
            {isSaving ? t('common.saving') : t('common.save')}
          </button>
        </div>
      </form>
    </div>
  );
}
