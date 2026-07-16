import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function AppLayout({ children }) {
  return (
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
    </div>
  );
}

export default AppLayout;