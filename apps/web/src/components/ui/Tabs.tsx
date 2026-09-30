'use client'

import * as TabsPrimitive from '@radix-ui/react-tabs'
import type { ReactNode } from 'react'

interface TabItem {
  label: string
  value: string
  content: ReactNode
}

interface TabsProps {
  items: TabItem[]
  defaultValue?: string
  className?: string
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function Tabs({ items, defaultValue, className }: TabsProps) {
  const initialValue = defaultValue ?? items[0]?.value

  return (
    <TabsPrimitive.Root defaultValue={initialValue} className={cn(className)}>
      <TabsPrimitive.List className="flex border-b border-ink-200">
        {items.map((item) => (
          <TabsPrimitive.Trigger
            key={item.value}
            value={item.value}
            className="border-b-2 border-transparent px-4 py-2 text-sm font-medium text-ink-500 transition-colors hover:text-ink-700 data-[state=active]:border-leaf-700 data-[state=active]:text-leaf-700"
          >
            {item.label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      {items.map((item) => (
        <TabsPrimitive.Content key={item.value} value={item.value} className="py-4">
          {item.content}
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  )
}