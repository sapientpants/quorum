import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { LanguageToggle } from "./LanguageToggle";
import { ThemeSelectorWithErrorBoundary } from "./ThemeSelectorWithErrorBoundary";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/react";

export function TopBar() {
  const { t } = useTranslation();

  return (
    <Navbar className="bg-card h-16 z-50 transition-colors duration-300 pl-6 pr-6">
      <NavbarContent>
        <NavbarBrand>
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-semibold"
          >
            <Icon
              icon="solar:chat-round-dots-bold"
              className="text-purple-500"
              width="24"
              height="24"
            />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">
              {t("app.name")}
            </span>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent justify="end">
        {/* Language toggle button */}
        <NavbarItem>
          <LanguageToggle />
        </NavbarItem>

        {/* Theme toggle button with error boundary */}
        <NavbarItem>
          <ThemeSelectorWithErrorBoundary />
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
