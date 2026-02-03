import { cn } from "@/lib/utils"
import { Link } from "@tanstack/react-router"
import { ShieldIcon } from "lucide-react"

export type RenderUsernameProps = {
  userName: string,
  userId: string,
  userRole?: number,
  className?: string,
}

export default function RenderUsername({
  userName,
  userId,
  userRole,
  className
}: RenderUsernameProps) {
  return (
    <div className={cn(
      "inline-flex items-center align-center gap-1 bg-base-200 rounded-field py-1 px-2 outline-1 outline-base-300 my-px shadow-xs",
      className
    )}>
      {(userRole !== undefined && userRole >= 1) && (
        <ShieldIcon
          className={cn(
            "inline-flex size-[1em] stroke-px fill-base-300 stroke-base-400",
            userRole === 2
              ? "fill-amber-400 stroke-amber-500"
              : userRole === 1 && "fill-green-400 stroke-green-500"
          )}
        />
      )}
      <Link
        to="/user/$userId"
        params={{ userId: userId }}
        className="inline font-medium text-sm leading-none hover:text-primary-300"
      >
        {userName}
      </Link>
    </div>
  )
}
