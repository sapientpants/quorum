import { ReactNode, ElementType } from "react";
import { useTranslation } from "react-i18next";

interface LocalizedTextProps {
  /** The key in the translation files */
  textKey: string;

  /** Optional params to pass to translation function */
  params?: Record<string, string | number>;

  /** Optional tag to render the text in (default is span) */
  as?: ElementType;

  /** Optional className for styling */
  className?: string;

  /** Optional children rendered after the localized text */
  children?: ReactNode;
}

/**
 * A component that renders localized text.
 * This is especially useful for larger blocks of text to avoid cluttering JSX with t() calls
 *
 * @example
 * // Basic usage
 * <LocalizedText textKey="welcome.message" />
 *
 * // With parameters
 * <LocalizedText textKey="greeting" params={{ name: 'John' }} />
 *
 * // With custom HTML tag
 * <LocalizedText textKey="privacy.notice" as="p" className="text-sm" />
 *
 * // With children
 * <LocalizedText textKey="form.required" as="div">
 *   <input required />
 * </LocalizedText>
 */
export function LocalizedText({
  textKey,
  params,
  as: Component = "span",
  className,
  children,
}: LocalizedTextProps) {
  const { t } = useTranslation();
  return (
    <Component className={className}>
      {t(textKey, params)}
      {children}
    </Component>
  );
}

interface LocalizedListProps {
  /** List of keys or indices to map to translation keys */
  items: (string | number)[];
  /** Prefix for translation keys, will be combined with each item */
  keyPrefix: string;
  /** Optional tag for the list (default: ul) */
  as?: ElementType;
  /** Optional tag for list items (default: li) */
  itemAs?: ElementType;
  /** Optional className for the list container */
  className?: string;
  /** Optional className for list items */
  itemClassName?: string;
}

/**
 * A component for handling lists of localized text, such as instructions or features
 */
export function LocalizedList({
  items,
  keyPrefix,
  as: Component = "ul",
  itemAs: ItemComponent = "li",
  className,
  itemClassName,
}: LocalizedListProps) {
  const { t } = useTranslation();

  return (
    <Component className={className}>
      {items.map((item, index) => {
        const fullKey = `${keyPrefix}.${typeof item === "number" ? index : item}`;
        const itemKey = typeof item === "string" ? item : `item-${index}`;

        return (
          <ItemComponent key={itemKey} className={itemClassName}>
            {t(fullKey)}
          </ItemComponent>
        );
      })}
    </Component>
  );
}
