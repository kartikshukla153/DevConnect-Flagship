import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { useCommandPaletteContext } from "../context/CommandPaletteContext";
import commands from "../data/commandPalette";

export default function useCommandPalette() {
  const navigate = useNavigate();

  const {
    query,
    setQuery,
    selectedIndex,
    setSelectedIndex,
    closePalette,
    registerRecentCommand,
  } = useCommandPaletteContext();

  const normalizedQuery = query.trim().toLowerCase();

  const filteredCommands = useMemo(() => {
    if (!normalizedQuery) return commands;

    return commands.filter((command) => {
      const searchableText = [
        command.title,
        command.description,
        ...(command.keywords || []),
        command.group,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [normalizedQuery]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [normalizedQuery, setSelectedIndex]);

  const executeCommand = (command) => {
    if (!command) return;

    registerRecentCommand(command);

    if (typeof command.action === "function") {
      command.action({
        navigate,
      });
    }

    closePalette();
  };

  const moveUp = () => {
    setSelectedIndex((prev) =>
      prev <= 0 ? filteredCommands.length - 1 : prev - 1
    );
  };

  const moveDown = () => {
    setSelectedIndex((prev) =>
      prev >= filteredCommands.length - 1 ? 0 : prev + 1
    );
  };

  const executeSelected = () => {
    executeCommand(filteredCommands[selectedIndex]);
  };

  const groupedCommands = useMemo(() => {
    const groups = {};

    filteredCommands.forEach((command) => {
      if (!groups[command.group]) {
        groups[command.group] = [];
      }

      groups[command.group].push(command);
    });

    return groups;
  }, [filteredCommands]);

  return {
    query,
    setQuery,

    selectedIndex,
    setSelectedIndex,

    commands,
    filteredCommands,
    groupedCommands,

    executeCommand,
    executeSelected,

    moveUp,
    moveDown,
  };
}