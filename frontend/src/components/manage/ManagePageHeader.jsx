import { Plus } from "lucide-react";
import { Button } from "../ui/button";
import PageHeader from "../layout/PageHeader";

const ManagePageHeader = ({ title, description, createLabel, onCreate }) => (
  <PageHeader
    title={title}
    description={description}
    actions={
      onCreate && (
        <Button onClick={onCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {createLabel}
        </Button>
      )
    }
  />
);

export default ManagePageHeader;
