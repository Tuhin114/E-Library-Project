import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus } from "lucide-react";
import { fetchThreads } from "@/store/slices/forumSlice";
import {
  FORUM_CATEGORY_OPTIONS,
  FORUM_SORT_OPTIONS,
} from "@/constants/forumCategories";
import { ALL_FILTER_VALUE } from "@/constants/filterSentinel";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/common/EmptyState";
import ForumThreadCard from "@/components/forum/ForumThreadCard";
import ForumThreadForm from "@/components/forum/ForumThreadForm";

const Forum = () => {
  const dispatch = useDispatch();
  const { threads, threadsStatus } = useSelector((state) => state.forum);
  const [category, setCategory] = useState(ALL_FILTER_VALUE);
  const [sort, setSort] = useState("latest");
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  useEffect(() => {
    dispatch(
      fetchThreads({
        category: category === ALL_FILTER_VALUE ? undefined : category,
        sort,
      }),
    );
  }, [dispatch, category, sort]);

  return (
    <PageContainer>
      <PageHeader
        title="Forum"
        description="Discuss anything with the community — not tied to a specific book."
        actions={
          <Button onClick={() => setIsComposerOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Thread
          </Button>
        }
      />

      <div className="mb-6 flex flex-wrap gap-3">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_FILTER_VALUE}>All Categories</SelectItem>
            {FORUM_CATEGORY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            {FORUM_SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {threadsStatus === "loading" ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : threads.length > 0 ? (
        <div className="space-y-3">
          {threads.map((thread) => (
            <div key={thread._id}>
              <ForumThreadCard key={thread._id} thread={thread} />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No threads yet"
          description="Be the first to start a conversation."
          action={
            <Button size="sm" onClick={() => setIsComposerOpen(true)}>
              Start a thread
            </Button>
          }
        />
      )}

      <ForumThreadForm open={isComposerOpen} onOpenChange={setIsComposerOpen} />
    </PageContainer>
  );
};

export default Forum;
