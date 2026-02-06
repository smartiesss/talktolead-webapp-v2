import * as React from "react"
import Image from "next/image"
import { cn, getInitials } from "@/lib/utils"

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  name: string
  size?: "sm" | "md" | "lg"
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
}

const sizePx = {
  sm: 32,
  md: 40,
  lg: 48,
}

export function Avatar({ src, name, size = "md", className, ...props }: AvatarProps) {
  const initials = getInitials(name)
  
  if (src) {
    return (
      <div
        className={cn(
          "relative rounded-full overflow-hidden bg-gray-200",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        <Image
          src={src}
          alt={name}
          width={sizePx[size]}
          height={sizePx[size]}
          className="h-full w-full object-cover"
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-primary/10 text-primary font-medium",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {initials}
    </div>
  )
}
