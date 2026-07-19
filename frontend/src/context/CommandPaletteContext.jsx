import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const CommandPaletteContext = createContext(null);

export function CommandPaletteProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentCommands, setRecentCommands] = useState([]);

  const openPalette = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closePalette = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setSelectedIndex(0);
  }, []);

  const togglePalette = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const registerRecentCommand = useCallback((command) => {
    if (!command) return;

    setRecentCommands((prev) => {
      const filtered = prev.filter((item) => item.id !== command.id);

      return [command, ...filtered].slice(0, 8);
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();

      if ((event.ctrlKey || event.metaKey) && key === "k") {
        event.preventDefault();
        togglePalette();
        return;
      }

      if (key === "escape") {
        closePalette();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [togglePalette, closePalette]);

  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const value = useMemo(
    () => ({
      isOpen,

      query,
      setQuery,

      selectedIndex,
      setSelectedIndex,

      recentCommands,

      openPalette,
      closePalette,
      togglePalette,

      registerRecentCommand,
    }),
    [
      isOpen,
      query,
      selectedIndex,
      recentCommands,
      openPalette,
      closePalette,
      togglePalette,
      registerRecentCommand,
    ]
  );

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
    </CommandPaletteContext.Provider>
  );
}

export function useCommandPaletteContext() {
  const context = useContext(CommandPaletteContext);

  if (!context) {
    throw new Error(
      "useCommandPaletteContext must be used inside CommandPaletteProvider."
    );
  }

  return context;
}