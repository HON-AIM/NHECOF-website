import type { SVGProps, JSX } from 'react'
import { cn } from '@/lib/cn'

export type IconProps = SVGProps<SVGSVGElement>

export function ReactIcon({ className, children, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={24}
      height={24}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={cn('shrink-0', className)}
      {...props}
    >
      {children}
    </svg>
  )
}

export function BasicsIcon(props: IconProps) {
  return (
    <ReactIcon {...props}>
      <path d="M11.6 20A6.8 6.8 0 0 1 9.9 6.3c5.5-1.1 7.1-1.7 9.2-4.1.8 2 1.8 4.2 1.8 7.7 0 5.4-4.5 10.1-9.3 10.1Z" />
      <path d="M2 21.5c0-3 1.7-5.3 4.9-5.9 2.3-.4 4.6-1.6 5.6-2.6" />
      <path d="M6.8 15.9c.9-2.1 2.2-4 4-5.5" />
      <path d="M10.2 14.1c.7-1.7 1.8-3.3 3.3-4.7" />
    </ReactIcon>
  )
}

export function FoodsIcon(props: IconProps) {
  return (
    <ReactIcon {...props}>
      <path d="M3.5 11.6h17c0 4.6-3.8 8.4-8.5 8.4s-8.5-3.8-8.5-8.4Z" />
      <path d="M7.3 11.6c1.1-2.5 3-3.5 4.7-3.5s3.6 1 4.7 3.5" />
      <path d="M9.6 8.2c-.7 1.1-.9 2.1-.8 3.4" />
      <path d="M12.3 7.2c-.7 1.1-.9 2.1-.8 3.4" />
      <path d="M15 8.2c-.7 1.1-.9 2.1-.8 3.4" />
    </ReactIcon>
  )
}

export function LifeStagesIcon(props: IconProps) {
  return (
    <ReactIcon {...props}>
      <circle cx="11.5" cy="4.2" r="1.9" />
      <path d="M11.5 6.1v5.9" />
      <path d="M11.5 8.1c-1.9-.6-3.4-.5-4.8.3" />
      <path d="M11.5 10.2c1.8-.6 3.3-.5 4.7.3" />
      <path d="M11.5 12v4" />
      <path d="M9.7 17.4l1.8-1.4 1.8 1.4" />
      <circle cx="15.6" cy="14.6" r="2" />
      <circle cx="17.4" cy="17" r="1.5" />
      <circle cx="19.2" cy="19.2" r="1" />
    </ReactIcon>
  )
}

export function ConditionsIcon(props: IconProps) {
  return (
    <ReactIcon {...props}>
      <path d="M19 14c1.5-1.45 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.75 0-3 .5-4.5 2-1.5-1.5-2.75-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.03 3 5.5l7 7Z" />
      <path d="M4.4 11.4h2.5l1.6-2.9 2.1 4.4 1.4-2.2h5.6" />
    </ReactIcon>
  )
}

export function HealthyLivingIcon(props: IconProps) {
  return (
    <ReactIcon {...props}>
      <circle cx="11.5" cy="4.8" r="1.9" />
      <path d="M11.4 6.7c-.1 1.5-.2 3-.3 4.4" />
      <path d="M11.1 11.1c1.2.9 2.1 2.2 2.2 4" />
      <path d="M11.1 11.1c-1.7.3-3 1.1-4.3 2.4" />
      <path d="M11.5 7.5c1.3.1 2.5.9 3.6 2.2" />
      <path d="M11.5 7.5c-1.2.3-2.3.6-3.4.4" />
      <path d="M16.8 5.3c1.6 0 2.6 1 2.6 2.5" />
    </ReactIcon>
  )
}

export function FoodSafetyIcon(props: IconProps) {
  return (
    <ReactIcon {...props}>
      <path d="M12 3.2l6.6 2.1v5.1c0 3.8-2.6 7.5-6.6 8.6-4-1.1-6.6-4.8-6.6-8.6V5.3Z" />
      <path d="M8.8 11.7l2.3 2.3 4.3-4.6" />
    </ReactIcon>
  )
}

export function MythsIcon(props: IconProps) {
  return (
    <ReactIcon {...props}>
      <path d="M13.5 3.6c3.7 0 6.7 2.4 6.7 5.4s-3 5.4-6.7 5.4c-.7 0-1.3-.1-1.8-.2l-2.2 2.5.3-2.3c-2.2-1-3.6-2.9-3.6-5.4 0-3 3-5.4 6.7-5.4Z" />
      <path d="M13.6 8.3a2 2 0 1 1 3.9 1c-1 1-2.2 1.3-2.3 2.6" />
      <path d="M15.2 13.9v.6" />
    </ReactIcon>
  )
}

export function SearchIcon(props: IconProps) {
  return (
    <ReactIcon {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M15.8 15.8 20.5 20.5" />
    </ReactIcon>
  )
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <ReactIcon {...props}>
      <path d="M6 9.2l6 6 6-6" />
    </ReactIcon>
  )
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <ReactIcon {...props}>
      <path d="M9.2 6l6 6-6 6" />
    </ReactIcon>
  )
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <ReactIcon {...props}>
      <path d="M4.5 12h14.5" />
      <path d="M13.5 6.5 20 12l-6.5 5.5" />
    </ReactIcon>
  )
}

export function CloseIcon(props: IconProps) {
  return (
    <ReactIcon {...props}>
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </ReactIcon>
  )
}

export function MenuIcon(props: IconProps) {
  return (
    <ReactIcon {...props}>
      <path d="M3.5 6.5h17" />
      <path d="M3.5 12h17" />
      <path d="M3.5 17.5h17" />
    </ReactIcon>
  )
}

export function CalendarIcon(props: IconProps) {
  return (
    <ReactIcon {...props}>
      <rect x="3.5" y="4.8" width="17" height="15.7" rx="2" />
      <path d="M3.5 9.6h17" />
      <path d="M8.3 2.6v4.3" />
      <path d="M15.7 2.6v4.3" />
    </ReactIcon>
  )
}

export function LocationIcon(props: IconProps) {
  return (
    <ReactIcon {...props}>
      <path d="M12 21.2c-3.9-3.2-6.3-6-6.3-9.3C5.7 7.5 8.5 4.8 12 4.8s6.3 2.7 6.3 7.1c0 3.3-2.4 6.1-6.3 9.3Z" />
      <circle cx="12" cy="11.2" r="2.2" />
    </ReactIcon>
  )
}

export function ShareIcon(props: IconProps) {
  return (
    <ReactIcon {...props}>
      <circle cx="5.5" cy="12" r="2.3" />
      <circle cx="18.5" cy="5.7" r="2.3" />
      <circle cx="18.5" cy="18.3" r="2.3" />
      <path d="M7.6 10.8l8.4-3.9" />
      <path d="M7.6 13.2l8.4 3.9" />
    </ReactIcon>
  )
}

export function NutritionIcon(props: IconProps & { topic?: string }) {
  const { topic, ...rest } = props
  const topicIcons: Record<string, JSX.Element> = {
    basics: <><path d="M11.6 20A6.8 6.8 0 0 1 9.9 6.3c5.5-1.1 7.1-1.7 9.2-4.1.8 2 1.8 4.2 1.8 7.7 0 5.4-4.5 10.1-9.3 10.1Z" /><path d="M2 21.5c0-3 1.7-5.3 4.9-5.9 2.3-.4 4.6-1.6 5.6-2.6" /></>,
    foods: <><path d="M3.5 11.6h17c0 4.6-3.8 8.4-8.5 8.4s-8.5-3.8-8.5-8.4Z" /><path d="M7.3 11.6c1.1-2.5 3-3.5 4.7-3.5s3.6 1 4.7 3.5" /></>,
    'life-stages': <><circle cx="11.5" cy="4.2" r="1.9" /><path d="M11.5 6.1v5.9" /><path d="M9.7 17.4l1.8-1.4 1.8 1.4" /></>,
    conditions: <><path d="M19 14c1.5-1.45 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.75 0-3 .5-4.5 2-1.5-1.5-2.75-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.03 3 5.5l7 7Z" /></>,
    'healthy-living': <><circle cx="11.5" cy="4.8" r="1.9" /><path d="M11.4 6.7c-.1 1.5-.2 3-.3 4.4" /><path d="M11.1 11.1c1.2.9 2.1 2.2 2.2 4" /></>,
    'food-safety': <><path d="M12 3.2l6.6 2.1v5.1c0 3.8-2.6 7.5-6.6 8.6-4-1.1-6.6-4.8-6.6-8.6V5.3Z" /><path d="M8.8 11.7l2.3 2.3 4.3-4.6" /></>,
    myths: <><path d="M13.5 3.6c3.7 0 6.7 2.4 6.7 5.4s-3 5.4-6.7 5.4c-.7 0-1.3-.1-1.8-.2l-2.2 2.5.3-2.3c-2.2-1-3.6-2.9-3.6-5.4 0-3 3-5.4 6.7-5.4Z" /><path d="M13.6 8.3a2 2 0 1 1 3.9 1c-1 1-2.2 1.3-2.3 2.6" /></>,
  }

  if (topic && topicIcons[topic]) {
    return <ReactIcon {...rest}>{topicIcons[topic]}</ReactIcon>
  }

  return (
    <ReactIcon {...rest}>
      <path d="M12 2.1c-2.8 0-5.5 1.2-7.3 3.3A8.4 8.4 0 0 0 3 9.5c0 4.7 4 8.5 9 8.5s9-3.8 9-8.5a8.4 8.4 0 0 0-1.7-4.1C17.5 3.3 14.8 2.1 12 2.1Z" />
      <path d="M8 13c.8-2 2.5-3.5 4-3.5s3.2 1.5 4 3.5" />
      <path d="M9.5 9.5c.5-.8 1.2-1.2 2.5-1.2s2 .4 2.5 1.2" />
    </ReactIcon>
  )
}

export function ArticleIcon(props: IconProps) {
  return (
    <ReactIcon {...props}>
      <path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H12l6.5 6.5V19.5A1.5 1.5 0 0 1 17 21H5.5A1.5 1.5 0 0 1 4 19.5Z" />
      <path d="M12 3v6h6" />
      <path d="M7 13h10" />
      <path d="M7 17h6" />
    </ReactIcon>
  )
}

export function FoodIcon(props: IconProps) {
  return (
    <ReactIcon {...props}>
      <path d="M3.5 11.6h17c0 4.6-3.8 8.4-8.5 8.4s-8.5-3.8-8.5-8.4Z" />
      <path d="M7.3 11.6c1.1-2.5 3-3.5 4.7-3.5s3.6 1 4.7 3.5" />
      <path d="M9.6 8.2c-.7 1.1-.9 2.1-.8 3.4" />
      <path d="M12.3 7.2c-.7 1.1-.9 2.1-.8 3.4" />
      <path d="M15 8.2c-.7 1.1-.9 2.1-.8 3.4" />
    </ReactIcon>
  )
}

export function ExternalLinkIcon(props: IconProps) {
  return (
    <ReactIcon {...props}>
      <path d="M15 3.5h5.5V9" />
      <path d="M10 14 20.5 3.5" />
      <path d="M18.5 13.5V19a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19V7A1.5 1.5 0 0 1 5 5.5h5.5" />
    </ReactIcon>
  )
}