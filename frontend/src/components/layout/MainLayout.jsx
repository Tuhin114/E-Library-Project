import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

/**
 * Root authenticated app shell: top navbar + role-aware sidebar, page
 * content via <Outlet />.
 *
 * `min-w-0` on both the flex row and `main` is load-bearing: flex items
 * default to `min-width: auto`, so any child with intrinsic content
 * width (e.g. a horizontally-scrolling row of fixed-width cards) can
 * force this row wider than the viewport and cause page-level
 * horizontal scroll. `min-w-0` lets `main` shrink to its allotted
 * space and clip/scroll its own overflow instead.
 */
const MainLayout = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="flex min-w-0">
        <Sidebar />
        <main className="min-w-0 flex-1 p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
