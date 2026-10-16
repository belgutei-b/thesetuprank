import { Bookmark, Check, Expand, Flag, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";

type Props = {
  name: string;
  isSaved: boolean;
  isSaving: boolean;
  onToggleSave: () => void;
  isReported: boolean;
  onReport: () => void;
  onOpenDetails: () => void;
  onViewFullSize: () => void;
  className?: string;
};

const menuItemClass = "h-11 cursor-pointer gap-2.5 rounded-xs px-3";

export default function SetupHeader({
  name,
  isSaved,
  isSaving,
  onToggleSave,
  isReported,
  onReport,
  onOpenDetails,
  onViewFullSize,
  className = "",
}: Props) {
  return (
    <div className={`flex min-w-0 items-center gap-2 ${className}`}>
      <h2 className="min-w-0 flex-1 truncate font-serif text-lg font-semibold leading-tight sm:text-[22px]">
        {name}
      </h2>

      {/* Phone: the description and report option live in the details sheet */}
      <Button
        variant="link"
        onClick={onOpenDetails}
        className="px-2 text-accent sm:hidden"
      >
        Details
      </Button>

      {/* Phone: just the icon */}
      <Button
        variant="outline"
        onClick={onToggleSave}
        disabled={isSaving}
        aria-pressed={isSaved}
        aria-label={isSaved ? `Remove ${name} from saves` : `Save ${name}`}
        className="w-11 px-0 sm:w-auto sm:px-3"
      >
        <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} />
        <span className="hidden sm:inline">{isSaved ? "Saved" : "Save"}</span>
      </Button>

      {/* modal={false} so opening a dialog from the menu doesn't fight over focus */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger
          render={
            <Button
              variant="outline"
              size="icon"
              aria-label={`More actions for ${name}`}
              className="hidden sm:inline-flex"
            />
          }
        >
          <MoreHorizontal size={18} />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={6}
          className="w-58 rounded-sm p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.6)] ring-line-strong"
        >
          <DropdownMenuItem onClick={onViewFullSize} className={menuItemClass}>
            <Expand size={16} />
            View full size
          </DropdownMenuItem>
          <DropdownMenuSeparator className="mx-1 my-1.5 bg-line" />
          {isReported ? (
            <DropdownMenuItem disabled className={`${menuItemClass} text-faint`}>
              <Check size={16} />
              Reported. Thanks
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              variant="destructive"
              onClick={onReport}
              className={menuItemClass}
            >
              <Flag size={16} />
              Report setup…
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
