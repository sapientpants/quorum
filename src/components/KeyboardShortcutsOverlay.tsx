import * as React from "react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";

type Platform = "mac" | "windows" | "linux" | "all";

interface ShortcutCategory {
  id: string;
  name: string;
  shortcuts: Shortcut[];
}

interface Shortcut {
  keys: string[];
  description: string;
  platform?: Platform;
}

interface KeyboardShortcutsOverlayProps {
  readonly isOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
}

// Helper component to render a keyboard key
function KeyboardKey({ children }: { readonly children: React.ReactNode }) {
  return (
    <kbd className="px-2 py-1.5 text-xs font-semibold text-foreground bg-accent rounded border shadow-sm inline-flex items-center justify-center min-w-8">
      {children}
    </kbd>
  );
}

// Component to render a list of shortcuts filtered by platform
function ShortcutList({
  shortcuts,
  platform,
}: {
  readonly shortcuts: Shortcut[];
  readonly platform: Platform;
}) {
  return (
    <>
      {shortcuts
        .filter(
          (shortcut) =>
            shortcut.platform === platform ||
            shortcut.platform === "all" ||
            !shortcut.platform,
        )
        .map((shortcut) => (
          <div
            key={`${shortcut.description}-${shortcut.keys.join("-")}`}
            className="flex items-center justify-between py-2 border-b border-border last:border-0"
          >
            <span className="text-sm">{shortcut.description}</span>
            <div className="flex gap-1">
              {shortcut.keys.map((key, keyIndex) => (
                <React.Fragment key={keyIndex}>
                  <KeyboardKey>{key}</KeyboardKey>
                  {keyIndex < shortcut.keys.length - 1 && (
                    <span className="mx-1">+</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
    </>
  );
}

export function KeyboardShortcutsOverlay({
  isOpen: externalIsOpen,
  onOpenChange: externalOnOpenChange,
}: KeyboardShortcutsOverlayProps = {}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [platform, setPlatform] = useState<Platform>("all");
  const [activeTab, setActiveTab] = useState("general");

  // Determine if we're using internal or external state
  const isControlled = externalIsOpen !== undefined;
  const isOpen = isControlled ? externalIsOpen : internalIsOpen;
  const onOpenChange = isControlled ? externalOnOpenChange : setInternalIsOpen;

  // Detect platform on mount
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes("mac")) {
      setPlatform("mac");
    } else if (userAgent.includes("win")) {
      setPlatform("windows");
    } else if (userAgent.includes("linux")) {
      setPlatform("linux");
    } else {
      setPlatform("all");
    }
  }, []);

  // Global keyboard shortcut to open/close dialog
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Show shortcuts overlay when the user presses the '?' key
      if (
        event.key === "?" &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey
      ) {
        event.preventDefault();
        if (onOpenChange) {
          onOpenChange(!isOpen);
        } else {
          setInternalIsOpen(!internalIsOpen);
        }
      }

      // Close when ESC is pressed (in addition to the built-in dialog behavior)
      if (event.key === "Escape" && isOpen) {
        if (onOpenChange) {
          onOpenChange(false);
        } else {
          setInternalIsOpen(false);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, internalIsOpen, onOpenChange]);

  // Shortcut data definition
  const shortcutCategories: ShortcutCategory[] = [
    {
      id: "general",
      name: "General",
      shortcuts: [
        {
          keys: ["?"],
          description: "Show keyboard shortcuts",
        },
        {
          keys: ["Ctrl", ","],
          description: "Open settings",
          platform: "windows",
        },
        {
          keys: ["⌘", ","],
          description: "Open settings",
          platform: "mac",
        },
        {
          keys: ["Esc"],
          description: "Close current modal/dialog",
        },
      ],
    },
    {
      id: "navigation",
      name: "Navigation",
      shortcuts: [
        {
          keys: ["Tab"],
          description: "Navigate to next interactive element",
        },
        {
          keys: ["Shift", "Tab"],
          description: "Navigate to previous interactive element",
        },
        {
          keys: ["Home"],
          description: "Go to top of page",
        },
        {
          keys: ["End"],
          description: "Go to bottom of page",
        },
      ],
    },
    {
      id: "chat",
      name: "Chat",
      shortcuts: [
        {
          keys: ["Enter"],
          description: "Send message",
        },
        {
          keys: ["Shift", "Enter"],
          description: "Add new line",
        },
        {
          keys: ["↑"],
          description: "Edit last message",
        },
        {
          keys: ["Ctrl", "↑"],
          description: "Navigate conversation history up",
          platform: "windows",
        },
        {
          keys: ["⌘", "↑"],
          description: "Navigate conversation history up",
          platform: "mac",
        },
        {
          keys: ["Ctrl", "↓"],
          description: "Navigate conversation history down",
          platform: "windows",
        },
        {
          keys: ["⌘", "↓"],
          description: "Navigate conversation history down",
          platform: "mac",
        },
      ],
    },
    {
      id: "round-table",
      name: "Round Table",
      shortcuts: [
        {
          keys: ["Tab"],
          description: "Navigate between participants",
        },
        {
          keys: ["Space"],
          description: "Select/deselect participant",
        },
        {
          keys: ["Ctrl", "→"],
          description: "Cycle to next participant",
          platform: "windows",
        },
        {
          keys: ["⌘", "→"],
          description: "Cycle to next participant",
          platform: "mac",
        },
        {
          keys: ["Ctrl", "←"],
          description: "Cycle to previous participant",
          platform: "windows",
        },
        {
          keys: ["⌘", "←"],
          description: "Cycle to previous participant",
          platform: "mac",
        },
      ],
    },
    {
      id: "templates",
      name: "Templates",
      shortcuts: [
        {
          keys: ["Ctrl", "S"],
          description: "Save current template",
          platform: "windows",
        },
        {
          keys: ["⌘", "S"],
          description: "Save current template",
          platform: "mac",
        },
        {
          keys: ["Ctrl", "N"],
          description: "Create new template",
          platform: "windows",
        },
        {
          keys: ["⌘", "N"],
          description: "Create new template",
          platform: "mac",
        },
      ],
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange || setInternalIsOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription className="text-center">
            Press <kbd className="px-1 py-0.5 text-xs rounded border">?</kbd> at
            any time to show this dialog
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="w-full grid grid-cols-5">
            {shortcutCategories.map((category) => (
              <TabsTrigger key={category.id} value={category.id}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {shortcutCategories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="mt-4">
              <ScrollArea className="h-[340px] pr-4">
                <div className="space-y-1">
                  <ShortcutList
                    shortcuts={category.shortcuts}
                    platform={platform}
                  />
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
