import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

import CommandPalette from "../components/command/CommandPalette";
import { CommandPaletteProvider } from "../context/CommandPaletteContext";

function AppLayout({ children }) {
  return (
    <CommandPaletteProvider>
      <div className="min-h-screen bg-[#0B1220] text-white">
        <div className="flex">

          <Sidebar />

          <div className="flex flex-1 flex-col lg:ml-[270px]">

            <Topbar />

            <main className="min-h-screen p-6 lg:p-8">
              <div className="mx-auto max-w-[1700px] animate-fadeIn">
                {children}
              </div>
            </main>

          </div>

        </div>

        {/* Global Command Palette */}
        <CommandPalette />

      </div>
    </CommandPaletteProvider>
  );
}

export default AppLayout;