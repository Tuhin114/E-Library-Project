import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "@/hooks/useAuth";
import { uploadUserAvatar, removeUserAvatar } from "@/store/slices/authSlice";
import { fetchSavedSearches } from "@/store/slices/librarySlice";
import { toast } from "@/hooks/useToast";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AvatarUpload from "@/components/profile/AvatarUpload";
import ProfileForm from "@/components/forms/ProfileForm";
import SavedSearchList from "@/components/profile/SavedSearchList";

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { savedSearches } = useSelector((state) => state.library);

  useEffect(() => {
    dispatch(fetchSavedSearches());
  }, [dispatch]);

  const handleAvatarUpload = async (file) => {
    try {
      await dispatch(uploadUserAvatar(file));
      toast.success("Avatar updated");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleAvatarRemove = async () => {
    try {
      await dispatch(removeUserAvatar());
      toast.success("Avatar removed");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="My Profile"
        description="Manage your account details and saved searches."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <AvatarUpload
              src={user?.avatar?.url}
              name={user?.name}
              onUpload={handleAvatarUpload}
              onRemove={handleAvatarRemove}
            />
            <ProfileForm user={user} />
            <div className="border-t border-border pt-4">
              <Link to="/change-password">
                <Button variant="outline">Change password</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Saved Searches</CardTitle>
          </CardHeader>
          <CardContent>
            <SavedSearchList searches={savedSearches} />
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};

export default Profile;
