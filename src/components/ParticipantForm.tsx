import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Icon } from '@iconify/react'
import type { Participant } from '../types/participant'
import type { LLMProvider } from '../types/llm'
import { PROVIDER_MODELS, SUPPORTED_PROVIDERS } from '../types/llm'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  provider: z.enum(['openai', 'anthropic', 'grok', 'google'] as const),
  model: z.string().min(1, 'Model is required'),
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

const defaultValues: FormData = {
  name: '',
  provider: 'openai',
  model: 'gpt-4o',
  systemPrompt: '',
  settings: {
    temperature: 0.7,
    maxTokens: 1000
  }
}

export function ParticipantForm({ initialData, onSubmit, onCancel }: ParticipantFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const sortedProviders = [...SUPPORTED_PROVIDERS].sort() as LLMProvider[]

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
  const models = [...PROVIDER_MODELS[selectedProvider]].sort()

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
            {sortedProviders.map(provider => (
              <option key={provider} value={provider}>
                {provider.charAt(0).toUpperCase() + provider.slice(1)}
              </option>
            ))}
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