import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch } from "react-redux";
import { profileSchema } from "@/lib/validationSchemas/profileSchema";
import { updateUserProfile } from "@/store/slices/authSlice";
import { toast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const ProfileForm = ({ user }) => {
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || "", bio: user?.bio || "" },
  });

  const onSubmit = async (values) => {
    try {
      await dispatch(updateUserProfile(values));
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" error={!!errors.name} {...register("name")} />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          rows={4}
          placeholder="Tell the community a little about yourself"
          error={!!errors.bio}
          {...register("bio")}
        />
        {errors.bio && (
          <p className="text-sm text-destructive">{errors.bio.message}</p>
        )}
      </div>

      <Button type="submit" isLoading={isSubmitting} disabled={!isDirty}>
        Save changes
      </Button>
    </form>
  );
};

export default ProfileForm;
