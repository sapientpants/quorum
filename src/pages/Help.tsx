import * as React from 'react'
import { useState, useEffect } from 'react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { ScrollArea } from '../components/ui/scroll-area'
import { SearchIcon, PlayIcon, BookOpenIcon, LightbulbIcon, HelpCircleIcon } from 'lucide-react'

export function Help() {
  const [activeSection, setActiveSection] = useState('getting-started')
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredTopics, setFilteredTopics] = useState<HelpTopic[]>([])
  
  // Help content data structure
  const helpTopics: HelpTopic[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      category: 'basics',
      content: 'Welcome to Quorum! This application allows you to chat with multiple AI models simultaneously in a round-table format.',
      tags: ['intro', 'start', 'begin', 'welcome', 'tutorial'],
      sections: [
        {
          title: 'Quick Start Guide',
          content: 'Follow these steps to get started:',
          isList: true,
          listItems: [
            'Sign in or create an account',
            'Add your API keys in the Settings page',
            'Create a new chat or use a template',
            'Add AI participants to your conversation',
            'Start chatting with multiple models'
          ]
        },
        {
          title: 'Video Tutorial',
          content: 'Watch our quick start guide video:',
          isVideo: true,
          videoUrl: 'https://www.youtube.com/watch?v=example',
          videoThumb: 'https://via.placeholder.com/320x180.png?text=Getting+Started+Guide'
        }
      ]
    },
    {
      id: 'api-keys',
      title: 'Managing API Keys',
      category: 'configuration',
      content: 'Quorum requires API keys from language model providers to function. Here\'s how to manage your keys:',
      tags: ['api', 'keys', 'setup', 'configuration', 'security'],
      sections: [
        {
          title: 'Adding API Keys',
          content: 'To add your API keys:',
          isList: true,
          listItems: [
            'Go to the Settings page',
            'Find the API Keys section',
            'Enter your API key for each provider',
            'Choose whether to store keys in localStorage or session only',
            'Click Save to store your keys'
          ]
        },
        {
          title: 'Security Considerations',
          content: 'Your API keys are stored locally in your browser and are never sent to our servers. However, please be aware of the following:',
          isList: true,
          listItems: [
            'Keys stored in localStorage persist between sessions',
            'Session-only storage is wiped when you close your browser',
            'Anyone with access to your device could potentially access your stored keys',
            'Your API usage is governed by your provider\'s terms and billing'
          ]
        },
        {
          title: 'Key Management Tutorial',
          content: 'Watch how to securely manage your API keys:',
          isVideo: true,
          videoUrl: 'https://www.youtube.com/watch?v=example-keys',
          videoThumb: 'https://via.placeholder.com/320x180.png?text=API+Key+Management'
        }
      ]
    },
    {
      id: 'features',
      title: 'Features Overview',
      category: 'features',
      content: 'Explore the powerful features of Quorum:',
      tags: ['features', 'capabilities', 'overview', 'tools', 'functions'],
      sections: [
        {
          title: 'Multi-Model Chat',
          content: 'Chat with multiple AI models simultaneously and compare their responses side-by-side.'
        },
        {
          title: 'Expert Panels',
          content: 'Create specialized panels of AI models with different roles and expertise areas.'
        },
        {
          title: 'Templates',
          content: 'Save and reuse your favorite panel configurations for different use cases.'
        },
        {
          title: 'Customization',
          content: 'Customize the appearance and behavior of the application to suit your preferences.'
        },
        {
          title: 'Feature Demo',
          content: 'Watch a demonstration of key features:',
          isVideo: true,
          videoUrl: 'https://www.youtube.com/watch?v=example-features',
          videoThumb: 'https://via.placeholder.com/320x180.png?text=Features+Demo'
        }
      ]
    },
    {
      id: 'round-table',
      title: 'Round Table Conversations',
      category: 'features',
      content: 'Learn how to use the round table feature for orchestrating multi-model conversations:',
      tags: ['round table', 'conversation', 'multi-model', 'orchestration', 'participants'],
      sections: [
        {
          title: 'Setting Up Participants',
          content: 'Configure different AI participants with specific roles and behaviors.'
        },
        {
          title: 'Round-Robin Flow',
          content: 'Understand how the conversation flows from one participant to another in sequence.'
        },
        {
          title: 'Customizing Roles',
          content: 'Learn how to create effective system prompts for specialized AI roles.'
        },
        {
          title: 'Round Table Tutorial',
          content: 'Watch a demonstration of round table conversations:',
          isVideo: true,
          videoUrl: 'https://www.youtube.com/watch?v=example-round-table',
          videoThumb: 'https://via.placeholder.com/320x180.png?text=Round+Table+Demo'
        }
      ]
    },
    {
      id: 'templates',
      title: 'Using Templates',
      category: 'features',
      content: 'Learn how to use and create templates for different conversation scenarios:',
      tags: ['templates', 'presets', 'configurations', 'save', 'reuse'],
      sections: [
        {
          title: 'Using Built-in Templates',
          content: 'Explore the pre-configured templates for common use cases.'
        },
        {
          title: 'Creating Custom Templates',
          content: 'Create and save your own templates for future use.'
        },
        {
          title: 'Sharing Templates',
          content: 'Export and share your templates with other users.'
        }
      ]
    },
    {
      id: 'faq',
      title: 'Frequently Asked Questions',
      category: 'support',
      content: 'Find answers to common questions:',
      tags: ['faq', 'questions', 'help', 'support', 'common', 'issues'],
      sections: [
        {
          title: 'Is my data secure?',
          content: 'Your conversations and API keys are stored locally in your browser and are never sent to our servers. However, your prompts and conversations are sent to the respective AI providers according to their APIs.'
        },
        {
          title: 'How am I billed for API usage?',
          content: 'You are billed directly by the AI providers based on your API usage. Quorum does not handle any billing or payments.'
        },
        {
          title: 'Can I export my conversations?',
          content: 'Yes, you can export your conversations as JSON or text files for future reference.'
        },
        {
          title: 'Which AI models are supported?',
          content: 'Quorum supports OpenAI (GPT models), Anthropic (Claude models), and other providers. The specific models available depend on your API access.'
        }
      ]
    },
    {
      id: 'shortcuts',
      title: 'Keyboard Shortcuts',
      category: 'basics',
      content: 'Learn the keyboard shortcuts to improve your productivity:',
      tags: ['keyboard', 'shortcuts', 'hotkeys', 'productivity', 'accessibility'],
      sections: [
        {
          title: 'Global Shortcuts',
          content: 'These shortcuts work anywhere in the application:',
          isList: true,
          listItems: [
            '? - Show keyboard shortcuts',
            'Ctrl+/ - Toggle help panel',
            'Ctrl+, - Open settings',
            'Esc - Close current modal/dialog'
          ]
        },
        {
          title: 'Chat Shortcuts',
          content: 'These shortcuts work in the chat interface:',
          isList: true,
          listItems: [
            'Enter - Send message',
            'Shift+Enter - Add new line',
            'Up Arrow - Edit last message',
            'Ctrl+Up/Down - Navigate conversation history'
          ]
        },
        {
          title: 'Round Table Shortcuts',
          content: 'These shortcuts work with the round table:',
          isList: true,
          listItems: [
            'Tab - Navigate between participants',
            'Space - Select/deselect participant',
            'Ctrl+Right/Left - Cycle active participant'
          ]
        }
      ]
    }
  ]
  
  // Filter topics based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredTopics([])
      return
    }
    
    const searchLower = searchTerm.toLowerCase()
    const results = helpTopics.filter(topic => {
      // Search in title, content, tags
      if (topic.title.toLowerCase().includes(searchLower) || 
          topic.content.toLowerCase().includes(searchLower)) {
        return true
      }
      
      // Search in tags
      if (topic.tags.some(tag => tag.toLowerCase().includes(searchLower))) {
        return true
      }
      
      // Search in sections
      if (topic.sections.some(section => 
        section.title.toLowerCase().includes(searchLower) || 
        section.content.toLowerCase().includes(searchLower) ||
        (section.isList && section.listItems?.some(item => item.toLowerCase().includes(searchLower)))
      )) {
        return true
      }
      
      return false
    })
    
    setFilteredTopics(results)
  }, [searchTerm, helpTopics])
  
  // Render search results
  const renderSearchResults = () => {
    if (searchTerm.trim() === '') {
      return null
    }
    
    if (filteredTopics.length === 0) {
      return (
        <div className="text-center py-8">
          <HelpCircleIcon className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-lg font-medium">No results found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Try a different search term or browse the categories
          </p>
        </div>
      )
    }
    
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Search Results</h2>
        {filteredTopics.map(topic => (
          <Card key={topic.id} className="cursor-pointer hover:bg-accent/50 transition-colors" 
                onClick={() => {
                  setActiveSection(topic.id)
                  setSearchTerm('')
                }}>
            <CardHeader className="py-4">
              <CardTitle>{topic.title}</CardTitle>
              <CardDescription className="text-xs">
                Category: {topic.category.charAt(0).toUpperCase() + topic.category.slice(1)}
              </CardDescription>
            </CardHeader>
            <CardContent className="py-2">
              <p className="text-sm line-clamp-2">{topic.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }
  
  // Render help content for the current section
  const renderSectionContent = () => {
    const currentTopic = helpTopics.find(topic => topic.id === activeSection)
    if (!currentTopic) return null
    
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">{currentTopic.title}</h2>
        <p className="mb-4">{currentTopic.content}</p>
        
        {currentTopic.sections.map((section, index) => (
          <div key={index} className="mb-6">
            <h3 className="text-xl font-semibold mb-2">{section.title}</h3>
            <p className="mb-2">{section.content}</p>
            
            {section.isList && section.listItems && (
              <ol className="list-decimal pl-5 space-y-2 mb-4">
                {section.listItems.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ol>
            )}
            
            {section.isVideo && (
              <div className="mt-2 bg-accent/30 rounded-md p-3 flex items-center space-x-3">
                <div className="relative flex-shrink-0">
                  <img 
                    src={section.videoThumb} 
                    alt={`Thumbnail for ${section.title}`} 
                    className="w-20 h-12 object-cover rounded-md"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <PlayIcon className="h-6 w-6 text-primary bg-background/80 rounded-full p-1" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">{section.title}</p>
                  <a 
                    href={section.videoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-xs text-blue-500 hover:underline"
                  >
                    Watch video
                  </a>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Help Center</h1>
      
      <div className="mb-6">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search help topics..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      {searchTerm ? (
        renderSearchResults()
      ) : (
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/4">
            <Tabs defaultValue="basics" className="w-full">
              <TabsList className="w-full flex justify-between mb-4">
                <TabsTrigger value="basics" className="flex-1">
                  <BookOpenIcon className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Basics</span>
                </TabsTrigger>
                <TabsTrigger value="features" className="flex-1">
                  <LightbulbIcon className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Features</span>
                </TabsTrigger>
                <TabsTrigger value="support" className="flex-1">
                  <HelpCircleIcon className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Support</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="basics" className="mt-0">
                <div className="flex flex-col gap-2 sticky top-20">
                  {helpTopics
                    .filter(topic => topic.category === 'basics')
                    .map(topic => (
                      <Button 
                        key={topic.id}
                        variant={activeSection === topic.id ? 'default' : 'ghost'}
                        onClick={() => setActiveSection(topic.id)}
                        className="justify-start"
                      >
                        {topic.title}
                      </Button>
                    ))
                  }
                </div>
              </TabsContent>
              
              <TabsContent value="features" className="mt-0">
                <div className="flex flex-col gap-2 sticky top-20">
                  {helpTopics
                    .filter(topic => topic.category === 'features')
                    .map(topic => (
                      <Button 
                        key={topic.id}
                        variant={activeSection === topic.id ? 'default' : 'ghost'}
                        onClick={() => setActiveSection(topic.id)}
                        className="justify-start"
                      >
                        {topic.title}
                      </Button>
                    ))
                  }
                </div>
              </TabsContent>
              
              <TabsContent value="support" className="mt-0">
                <div className="flex flex-col gap-2 sticky top-20">
                  {helpTopics
                    .filter(topic => topic.category === 'support')
                    .map(topic => (
                      <Button 
                        key={topic.id}
                        variant={activeSection === topic.id ? 'default' : 'ghost'}
                        onClick={() => setActiveSection(topic.id)}
                        className="justify-start"
                      >
                        {topic.title}
                      </Button>
                    ))
                  }
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="w-full md:w-3/4">
            <ScrollArea className="h-[calc(100vh-200px)]">
              {renderSectionContent()}
            </ScrollArea>
          </div>
        </div>
      )}
    </div>
  )
}

// Types
interface HelpTopic {
  id: string
  title: string
  category: 'basics' | 'features' | 'configuration' | 'support'
  content: string
  tags: string[]
  sections: HelpSection[]
}

interface HelpSection {
  title: string
  content: string
  isList?: boolean
  listItems?: string[]
  isVideo?: boolean
  videoUrl?: string
  videoThumb?: string
} 