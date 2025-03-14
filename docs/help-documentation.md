# Help Center and Keyboard Shortcuts Documentation

This document describes the implementation of the Help Center and Keyboard Shortcuts Overlay components for the Quorum application.

## Help Center

The Help Center provides a searchable, categorized knowledge base for users to quickly find information about using the application.

### Features

- **Searchable Help Topics**: Users can search through all help topics, with results filtering as they type.
- **Categorized Documentation**: Help topics are organized by categories (Basics, Features, Configuration, Support).
- **Tutorial Videos**: Embedded video tutorials with thumbnail previews.
- **Related Topics**: Suggestions for related content based on the current topic.
- **Mobile-Responsive**: The interface adapts to different screen sizes.

### Implementation

The Help Center is implemented as a React component that:

1. Renders a search input at the top
2. Displays either search results or categorized content
3. Shows help topic content with sections, lists, and videos
4. Integrates with the Keyboard Shortcuts overlay

### Data Structure

Help topics are structured with the following fields:

```typescript
interface HelpTopic {
  id: string                                             // Unique identifier
  title: string                                          // Topic title
  category: 'basics' | 'features' | 'configuration' | 'support' // Category classification
  content: string                                        // Brief overview content
  tags: string[]                                         // Search tags
  sections: HelpSection[]                                // Detailed content sections
}

interface HelpSection {
  title: string                                          // Section title
  content: string                                        // Section content
  isList?: boolean                                       // Whether to render as a list
  listItems?: string[]                                   // List items (if isList is true)
  isVideo?: boolean                                      // Whether this is a video section
  videoUrl?: string                                      // Video URL (if isVideo is true)
  videoThumb?: string                                    // Video thumbnail image (if isVideo is true)
}
```

## Keyboard Shortcuts Overlay

The Keyboard Shortcuts Overlay provides a quick reference for all keyboard shortcuts available in the application.

### Features

- **Platform Detection**: Shows Mac, Windows, or Linux-specific shortcuts based on the user's platform.
- **Categorized Shortcuts**: Organizes shortcuts by functional category.
- **Global Keyboard Trigger**: Can be opened by pressing the "?" key or through UI buttons.
- **Modal Design**: Presented as a non-disruptive modal dialog.

### Implementation

The Keyboard Shortcuts Overlay is implemented as a reusable component that:

1. Detects the user's platform (Mac, Windows, Linux)
2. Renders shortcuts in a tabbed interface
3. Can be opened either through keyboard shortcut (?) or programmatically
4. Supports external state control with isOpen and onOpenChange props

### Data Structure

Keyboard shortcuts are organized in categories:

```typescript
interface ShortcutCategory {
  id: string                                             // Category identifier
  name: string                                           // Category name
  shortcuts: Shortcut[]                                  // List of shortcuts
}

interface Shortcut {
  keys: string[]                                         // Key combinations
  description: string                                    // Description of what the shortcut does
  platform?: 'mac' | 'windows' | 'linux' | 'all'         // Platform specificity
}
```

## Integration

The Help Center and Keyboard Shortcuts components are integrated in the following ways:

1. The Help Center includes a button to open the Keyboard Shortcuts overlay
2. The Keyboard Shortcuts can be triggered globally with the "?" key
3. Both components are accessible through the main navigation
4. The Help Center includes a dedicated section for keyboard shortcuts that links to the overlay

## Usage

### Help Center

```tsx
import { Help } from '../pages/Help'

// In a route configuration
<Route path="/help" element={<Help />} />
```

### Keyboard Shortcuts Overlay

```tsx
import { KeyboardShortcutsOverlay } from '../components/KeyboardShortcutsOverlay'

// Controlled usage
const [showShortcuts, setShowShortcuts] = useState(false)

<Button onClick={() => setShowShortcuts(true)}>
  Show Keyboard Shortcuts
</Button>

<KeyboardShortcutsOverlay 
  isOpen={showShortcuts}
  onOpenChange={setShowShortcuts}
/>

// Or standalone usage
<KeyboardShortcutsOverlay />
``` 