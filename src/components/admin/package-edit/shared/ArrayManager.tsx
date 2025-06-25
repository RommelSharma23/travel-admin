// components/admin/package-edit/shared/ArrayManager.tsx
'use client'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

const PlusIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

const MinusIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
  </svg>
)

interface ArrayManagerProps {
  title: string
  items: string[]
  placeholder: string
  error?: string
  onAddItem: () => void
  onRemoveItem: (index: number) => void
  onUpdateItem: (index: number, value: string) => void
  minItems?: number
  maxItems?: number
  className?: string
}

export const ArrayManager = ({
  title,
  items,
  placeholder,
  error,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
  minItems = 1,
  maxItems = 20,
  className = ''
}: ArrayManagerProps) => {
  const canAddMore = items.length < maxItems
  const canRemove = items.length > minItems

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{title}</Label>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">
            {items.length}/{maxItems}
          </span>
          <Button
            type="button"
            onClick={onAddItem}
            size="sm"
            variant="outline"
            className="h-8 px-3"
            disabled={!canAddMore}
          >
            <PlusIcon className="w-3 h-3 mr-1" />
            Add {title.slice(0, -1)}
          </Button>
        </div>
      </div>
      
      {/* Items List */}
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            <div className="flex-1">
              <Input
                value={item}
                onChange={(e) => onUpdateItem(index, e.target.value)}
                placeholder={placeholder}
                className="w-full"
              />
            </div>
            <Button
              type="button"
              onClick={() => onRemoveItem(index)}
              size="sm"
              variant="outline"
              className="h-10 px-3 text-red-600 hover:bg-red-50 border-red-200"
              disabled={!canRemove}
              title={canRemove ? `Remove ${title.slice(0, -1).toLowerCase()}` : `Minimum ${minItems} required`}
            >
              <MinusIcon className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>
      
      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600 flex items-center">
          <span className="mr-1">⚠️</span>
          {error}
        </p>
      )}

      {/* Help Text */}
      {items.length === 0 && (
        <p className="text-xs text-gray-500 italic">
          Click "Add {title.slice(0, -1)}" to get started
        </p>
      )}
      
      {!canAddMore && (
        <p className="text-xs text-amber-600">
          Maximum {maxItems} {title.toLowerCase()} reached
        </p>
      )}
    </div>
  )
}