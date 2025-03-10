import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Icon } from '@iconify/react'
import type { Participant, LLMProvider } from '../types/participant'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  provider: z.enum(['openai', 'anthropic', 'grok'] as const),
  model: z.string().min(1, 'Model is required'),
  roleDescription: z.string().min(1, 'Role description is required'),
  systemPrompt: z.string().min(1, 'System prompt is required'),
  settings: z.object({
    temperature: z.number().min(0).max(2),
    maxTokens: z.number().positive()
  })
})

type FormData = z.infer<typeof formSchema>

interface ParticipantFormProps {
  initialData?: Partial<Participant>
  onSubmit: (data: Omit<Participant, 'id'>) => void
  onCancel: () => void
}

const providerModels: Record<LLMProvider, string[]> = {
  openai: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  anthropic: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
  grok: ['grok-1']
}

const defaultValues: FormData = {
  name: '',
  provider: 'openai',
  model: 'gpt-4',
  roleDescription: '',
  systemPrompt: '',
  settings: {
    temperature: 0.7,
    maxTokens: 1000
  }
}

export function ParticipantForm({ initialData, onSubmit, onCancel }: ParticipantFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...defaultValues,
      ...initialData
    }
  })

  const selectedProvider = watch('provider') as LLMProvider
  const models = providerModels[selectedProvider]

  function onFormSubmit(data: FormData) {
    onSubmit({
      ...data,
      type: 'llm'
    })
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Name
          </label>
          <input
            type="text"
            id="name"
            className="input input-bordered w-full mt-1"
            placeholder="e.g., Medical Expert"
            {...register('name')}
          />
          {errors.name && (
            <p className="text-error text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="provider" className="block text-sm font-medium">
            Provider
          </label>
          <select
            id="provider"
            className="select select-bordered w-full mt-1"
            {...register('provider')}
          >
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
            <option value="grok">Grok</option>
          </select>
          {errors.provider && (
            <p className="text-error text-sm mt-1">{errors.provider.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="model" className="block text-sm font-medium">
            Model
          </label>
          <select
            id="model"
            className="select select-bordered w-full mt-1"
            {...register('model')}
          >
            {models.map(model => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
          {errors.model && (
            <p className="text-error text-sm mt-1">{errors.model.message}</p>
          )}
        </div>
      </div>

      {/* Role and System Prompt */}
      <div className="space-y-4">
        <div>
          <label htmlFor="roleDescription" className="block text-sm font-medium">
            Role Description
          </label>
          <textarea
            id="roleDescription"
            className="textarea textarea-bordered w-full mt-1 h-24"
            placeholder="Describe the role and expertise of this participant..."
            {...register('roleDescription')}
          />
          {errors.roleDescription && (
            <p className="text-error text-sm mt-1">{errors.roleDescription.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="systemPrompt" className="block text-sm font-medium">
            System Prompt
          </label>
          <textarea
            id="systemPrompt"
            className="textarea textarea-bordered w-full mt-1 h-32"
            placeholder="Enter the system prompt that defines this participant's behavior..."
            {...register('systemPrompt')}
          />
          {errors.systemPrompt && (
            <p className="text-error text-sm mt-1">{errors.systemPrompt.message}</p>
          )}
        </div>
      </div>

      {/* Advanced Settings */}
      <div>
        <button
          type="button"
          className="btn btn-ghost btn-sm gap-2"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <Icon 
            icon={showAdvanced ? "solar:alt-arrow-up-linear" : "solar:alt-arrow-down-linear"} 
            className="w-4 h-4" 
          />
          Advanced Settings
        </button>

        {showAdvanced && (
          <div className="mt-4 space-y-4 p-4 bg-base-200 rounded-lg">
            <div>
              <label htmlFor="temperature" className="block text-sm font-medium">
                Temperature (0-2)
              </label>
              <input
                type="number"
                id="temperature"
                step="0.1"
                min="0"
                max="2"
                className="input input-bordered w-full mt-1"
                {...register('settings.temperature', { valueAsNumber: true })}
              />
              {errors.settings?.temperature && (
                <p className="text-error text-sm mt-1">
                  {errors.settings.temperature.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="maxTokens" className="block text-sm font-medium">
                Max Tokens
              </label>
              <input
                type="number"
                id="maxTokens"
                min="1"
                className="input input-bordered w-full mt-1"
                {...register('settings.maxTokens', { valueAsNumber: true })}
              />
              {errors.settings?.maxTokens && (
                <p className="text-error text-sm mt-1">
                  {errors.settings.maxTokens.message}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Icon icon="solar:spinner-line-duotone" className="animate-spin" />
              Saving...
            </>
          ) : (
            'Save Participant'
          )}
        </button>
      </div>
    </form>
  )
} 