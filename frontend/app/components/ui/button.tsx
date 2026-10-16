import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

// The site's buttons, all in one place. Change a style here and every
// button of that kind changes with it.
//
// variant:
//   default  solid light button, the main action (Send report, Next →)
//   outline  bordered (Cancel, Save, the ⋯ menu). With aria-pressed it turns
//            accent-colored, for toggles like Save
//   ghost    no border, dim until hovered (close ✕)
//   link     underlined text (Skip pairing)
//   overlay  dark see-through square on top of a photo (← → ⤢)
// size: default (44px tall), sm, lg (52px, phone bottom bar), and the square
//   icon sizes icon (44px), icon-sm (36px), icon-xs (32px)
//
// For a link that should look like a button, use the class names directly:
//   <Link className={buttonVariants({ variant: "outline" })}>
const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xs text-[11px] font-medium whitespace-nowrap uppercase tracking-[2px] transition-colors outline-none select-none focus-visible:ring-2 focus-visible:ring-ring/60 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-text font-semibold text-bg hover:bg-text/85 disabled:bg-line disabled:text-faint disabled:opacity-100",
        outline:
          "border border-line-strong text-text hover:border-[#555] aria-pressed:border-accent aria-pressed:bg-accent/10 aria-pressed:text-accent",
        ghost: "text-dim hover:text-text",
        link: "text-faint underline underline-offset-3 hover:text-text",
        overlay: "bg-black/70 text-text hover:bg-black/90",
      },
      size: {
        default: "h-11 px-4",
        sm: "h-8 px-4",
        lg: "h-13 px-4.5",
        icon: "size-11",
        "icon-sm": "size-9",
        "icon-xs": "size-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
