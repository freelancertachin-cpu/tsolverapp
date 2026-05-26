import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

const Select = ({ children, value, onValueChange }: { children: React.ReactNode, value: string, onValueChange: (val: string) => void }) => {
  return (
    <div className="relative w-full">
      {React.Children.map(children, (child: any) => {
        if (child.type === SelectTrigger) return React.cloneElement(child, { value });
        if (child.type === SelectContent) return React.cloneElement(child, { value, onValueChange });
        return child;
      })}
    </div>
  )
}

const SelectTrigger = ({ className, value, children }: { className?: string, value?: string, children: React.ReactNode }) => (
  <button className={cn("flex h-12 w-full items-center justify-between rounded-xl border border-border bg-background px-3 py-2 text-sm", className)}>
    {value || children}
    <ChevronDown className="h-4 w-4 opacity-50" />
  </button>
)

const SelectValue = ({ children }: { children?: React.ReactNode }) => <span>{children}</span>

const SelectContent = ({ children, value, onValueChange }: { children: React.ReactNode, value?: string, onValueChange?: (val: string) => void }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="relative group">
       <div className="absolute top-1 z-50 min-w-[8rem] overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-md animate-in fade-in zoom-in-95 group-focus-within:block hidden">
          <div className="p-1">
             {React.Children.map(children, (child: any) => {
                return React.cloneElement(child, { onClick: () => onValueChange?.(child.props.value) });
             })}
          </div>
       </div>
    </div>
  )
}

const SelectItem = ({ children, value, onClick }: { children: React.ReactNode, value: string, onClick?: () => void }) => (
  <div onClick={onClick} className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
    {children}
  </div>
)

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
