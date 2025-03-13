import { useState, useCallback } from 'react'
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
  roleDescription: z.string().optional(),
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
  roleDescription: '',
  systemPrompt: '',
  settings: {
    temperature: 0.7,
    maxTokens: 1000
  }
}

// Sample system prompts for inspiration
const systemPromptExamples = [
  "You are an expert in medical diagnosis. Focus on providing accurate information based on symptoms and medical history.",
  "You are a creative storyteller. Create engaging narratives with vivid descriptions and interesting characters.",
  "You are a debate moderator. Maintain neutrality while ensuring both sides get fair representation."
]

export function ParticipantForm({ initialData, onSubmit, onCancel }: ParticipantFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showExamples, setShowExamples] = useState(false)
  const sortedProviders = [...SUPPORTED_PROVIDERS].sort() as LLMProvider[]

  const {
    register,
    handleSubmit,
    watch,
    setValue,
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

  const handleExamplePrompt = useCallback((example: string) => {
    setValue('systemPrompt', example)
    setShowExamples(false)
  }, [setValue, setShowExamples])

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 bg-base-100 p-5 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Participant Configuration</h2>
      
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>

      {/* Role Description */}
      <div>
        <label htmlFor="roleDescription" className="block text-sm font-medium">
          Role Description
        </label>
        <textarea
          id="roleDescription"
          className="textarea textarea-bordered w-full mt-1 h-20"
          placeholder="Describe the role this participant will play in the conversation..."
          {...register('roleDescription')}
        />
        <p className="text-xs mt-1 text-base-content/70">
          Optional: Provide context about this participant's expertise or perspective.
        </p>
      </div>

      {/* System Prompt */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label htmlFor="systemPrompt" className="block text-sm font-medium">
            System Prompt
          </label>
          <button
            type="button"
            className="text-xs btn btn-ghost btn-xs"
            onClick={() => setShowExamples(!showExamples)}
          >
            {showExamples ? 'Hide Examples' : 'Show Examples'}
          </button>
        </div>
        
        {showExamples && (
          <div className="bg-base-200 p-3 rounded-md mb-2 text-sm">
            <h4 className="font-medium mb-2">Example Prompts:</h4>
            <ul className="space-y-2">
              {systemPromptExamples.map((example, index) => (
                <li key={index} className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleExamplePrompt(example)}
                    className="btn btn-xs btn-ghost"
                  >
                    Use
                  </button>
                  <p className="line-clamp-2">{example}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <textarea
          id="systemPrompt"
          className="textarea textarea-bordered w-full h-32"
          placeholder="Enter the system prompt that defines this participant's behavior..."
          {...register('systemPrompt')}
        />
        {errors.systemPrompt && (
          <p className="text-error text-sm mt-1">{errors.systemPrompt.message}</p>
        )}
        <p className="text-xs text-base-content/70">
          This prompt instructs the AI how to behave and what role to play in the conversation.
        </p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="temperature" className="block text-sm font-medium">
                  Temperature (0-2)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    id="temperature"
                    step="0.1"
                    min="0"
                    max="2"
                    className="range range-sm"
                    {...register('settings.temperature', { valueAsNumber: true })}
                  />
                  <span className="text-sm font-mono w-10">
                    {watch('settings.temperature')}
                  </span>
                </div>
                <p className="text-xs mt-1 text-base-content/70">
                  Lower values (0-0.5) produce more consistent outputs. Higher values (0.7-2) make responses more creative.
                </p>
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
                <p className="text-xs mt-1 text-base-content/70">
                  Maximum number of tokens to generate. Higher values allow for longer responses.
                </p>
                {errors.settings?.maxTokens && (
                  <p className="text-error text-sm mt-1">
                    {errors.settings.maxTokens.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-2 pt-2">
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