
import Sidebar from "@/component/ui/SideBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#fcfcfc]">
      <Sidebar />

      <main className="flex-1 flex flex-col">
        <div className="p-8 h-full">
          {children}
        </div>
      </main>
    </div>
  );
}