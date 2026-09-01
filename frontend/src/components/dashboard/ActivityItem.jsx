import {
  Activity,
  FolderKanban,
  ListTodo,
  MessageSquare,
  UserPlus,
  Heart,
  MessageCircle,
  FileText,
  Users,
  GitBranch,
  CheckCircle2,
  Bell,
} from "lucide-react";

const iconMap = {
  project: FolderKanban,
  project_created: FolderKanban,
  project_joined: Users,

  task: ListTodo,
  task_created: ListTodo,
  task_completed: CheckCircle2,

  message: MessageSquare,
  message_sent: MessageSquare,

  connection: UserPlus,
  connection_request: UserPlus,
  connection_accepted: UserPlus,

  post: FileText,
  post_created: FileText,

  like: Heart,
  post_liked: Heart,

  comment: MessageCircle,
  post_commented: MessageCircle,

  repository: GitBranch,

  notification: Bell,
};

function getActivityType(activity) {
  return String(
    activity?.type ||
      activity?.action ||
      activity?.activityType ||
      ""
  ).toLowerCase();
}

function getActivityIcon(activity) {
  const type = getActivityType(activity);

  return iconMap[type] || Activity;
}

function getActivityTitle(activity) {
  if (activity?.title) {
    return activity.title;
  }

  if (activity?.message) {
    return activity.message;
  }

  if (activity?.description) {
    return activity.description;
  }

  const type = getActivityType(activity);

  const titles = {
    project_created: "Created a project",
    project_joined: "Joined a project",
    task_created: "Created a task",
    task_completed: "Completed a task",
    message_sent: "Sent a message",
    connection_request: "Sent a connection request",
    connection_accepted: "Accepted a connection",
    post_created: "Published a post",
    post_liked: "Liked a post",
    post_commented: "Commented on a post",
  };

  return titles[type] || "Engineering activity";
}

function formatActivityDate(activity) {
  const value =
    activity?.createdAt ||
    activity?.updatedAt ||
    activity?.timestamp ||
    activity?.date;

  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const diff = Date.now() - date.getTime();

  if (diff >= 0) {
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) {
      return "just now";
    }

    if (minutes < 60) {
      return `${minutes}m ago`;
    }

    if (hours < 24) {
      return `${hours}h ago`;
    }

    if (days < 7) {
      return `${days}d ago`;
    }
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year:
      date.getFullYear() !== new Date().getFullYear()
        ? "numeric"
        : undefined,
  });
}

function getSecondaryText(activity) {
  if (activity?.project?.title) {
    return activity.project.title;
  }

  if (activity?.projectName) {
    return activity.projectName;
  }

  if (activity?.task?.title) {
    return activity.task.title;
  }

  if (activity?.taskTitle) {
    return activity.taskTitle;
  }

  if (activity?.post?.title) {
    return activity.post.title;
  }

  if (activity?.targetName) {
    return activity.targetName;
  }

  return null;
}

function ActivityItem({
  activity = {},
  isLast = false,
}) {
  const Icon = getActivityIcon(activity);

  const title = getActivityTitle(activity);
  const secondaryText = getSecondaryText(activity);
  const timestamp = formatActivityDate(activity);

  return (
    <div className="relative flex gap-4">
      {!isLast && (
        <div className="absolute left-[18px] top-10 h-[calc(100%+1.75rem)] w-px bg-gradient-to-b from-white/[0.09] to-transparent" />
      )}

      <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/[0.06]">
        <Icon
          size={16}
          className="text-cyan-400"
        />
      </div>

      <div className="min-w-0 flex-1 pb-1">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-5">
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-6 text-slate-200">
              {title}
            </p>

            {secondaryText && (
              <p className="mt-1 truncate text-xs text-slate-600">
                {secondaryText}
              </p>
            )}
          </div>

          {timestamp && (
            <span className="shrink-0 text-[10px] font-medium text-slate-700">
              {timestamp}
            </span>
          )}
        </div>

        {activity?.description &&
          activity.description !== title && (
            <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600">
              {activity.description}
            </p>
          )}
      </div>
    </div>
  );
}

export default ActivityItem;