import { Button } from '@heroui/react'

export function HeroUIThemeTest() {
  return (
    <div className="p-4 border rounded-md space-y-4">
      <h2 className="text-lg font-medium">HeroUI Theme Test</h2>
      
      <div className="flex flex-wrap gap-2">
        <Button variant="solid">Default Button</Button>
        <Button variant="solid" color="primary">Primary Button</Button>
        <Button variant="solid" color="secondary">Secondary Button</Button>
        <Button variant="solid" color="success">Accent Button</Button>
        <Button variant="ghost">Ghost Button</Button>
        <Button variant="flat">Link Button</Button>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 bg-background text-foreground border rounded">Background</div>
        <div className="p-2 bg-card text-card-foreground border rounded">Card</div>
        <div className="p-2 bg-primary text-primary-foreground border rounded">Primary</div>
        <div className="p-2 bg-secondary text-secondary-foreground border rounded">Secondary</div>
        <div className="p-2 bg-accent text-accent-foreground border rounded">Accent</div>
        <div className="p-2 bg-muted text-muted-foreground border rounded">Muted</div>
      </div>
    </div>
  )
} 