import { cn } from "../../lib/utils";

/**
 * Shared page-width wrapper. Every page should render its content
 * inside this instead of choosing its own max-width/padding, so the
 * whole app shares one horizontal rhythm (see .page-container in
 * globals.css).
 */
const PageContainer = ({ className, children, ...props }) => (
  <div className={cn("page-container", className)} {...props}>
    {children}
  </div>
);

export default PageContainer;
