'use client'

import * as AccordionPrimitive from '@radix-ui/react-accordion'
import type { ReactNode } from 'react'

interface AccordionItem {
  trigger: string
  content: ReactNode
}

interface AccordionProps {
  items: AccordionItem[]
  className?: string
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="m5 8 5 5 5-5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Accordion({ items, className }: AccordionProps) {
  return (
    <AccordionPrimitive.Root type="single" collapsible className={cn(className)}>
      {items.map((item, index) => (
        <AccordionPrimitive.Item
          key={item.trigger}
          value={`item-${index}`}
          className="border-b border-ink-200"
        >
          <AccordionPrimitive.Header>
            <AccordionPrimitive.Trigger className="group flex w-full cursor-pointer items-center justify-between py-4 text-left font-medium text-ink-900">
              {item.trigger}
              <ChevronIcon
                className={cn(
                  'h-4 w-4 shrink-0 text-ink-500',
                  'transition-transform duration-fast',
                  'group-data-[state=open]:rotate-180',
                  'motion-reduce:transition-none motion-reduce:transform-none',
                )}
              />
            </AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>
          <AccordionPrimitive.Content className="pb-4 text-ink-700">
            {item.content}
          </AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
      ))}
    </AccordionPrimitive.Root>
  )
}