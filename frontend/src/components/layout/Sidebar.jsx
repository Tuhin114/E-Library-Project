import SidebarNav from "./SidebarNav";

const Sidebar = () => {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-border px-4 py-6 md:block">
      <SidebarNav />
    </aside>
  );
};

export default Sidebar;
