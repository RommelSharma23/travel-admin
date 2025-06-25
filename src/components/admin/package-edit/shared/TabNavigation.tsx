// components/admin/package-edit/shared/TabNavigation.tsx
'use client'

interface Tab {
  id: string
  label: string
  icon: string
  description?: string
}

interface ValidationErrors {
  [key: string]: string
}

interface TabNavigationProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
  validationErrors: ValidationErrors
  className?: string
}

export const TabNavigation = ({
  tabs,
  activeTab,
  onTabChange,
  validationErrors,
  className = ''
}: TabNavigationProps) => {
  
  const getTabValidation = (tabId: string): boolean => {
    const tabErrors = Object.keys(validationErrors).filter(key => {
      switch (tabId) {
        case 'basic':
          return ['title', 'destination_id', 'short_description', 'long_description'].includes(key)
        case 'details':
          return ['max_group_size', 'min_age', 'highlights'].includes(key)
        case 'pricing':
          return ['price_from', 'price_to'].includes(key)
        case 'itinerary':
          return key.startsWith('itinerary_')
        case 'images':
          return key.startsWith('image_')
        case 'seo':
          return ['meta_title', 'meta_description'].includes(key)
        default:
          return false
      }
    })
    return tabErrors.length > 0
  }

  const getTabProgress = (tabId: string): 'complete' | 'partial' | 'empty' => {
    // This could be enhanced to check actual completion status
    // For now, we'll use validation errors as an indicator
    const hasErrors = getTabValidation(tabId)
    
    if (hasErrors) return 'partial'
    
    // You could add more sophisticated logic here to determine
    // if a tab is complete vs empty based on form data
    return 'complete'
  }

  const getTabIcon = (tab: Tab, progress: 'complete' | 'partial' | 'empty') => {
    switch (progress) {
      case 'complete':
        return '✅'
      case 'partial':
        return '⚠️'
      default:
        return tab.icon
    }
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Package Sections</h3>
        
        {/* Desktop Tab Navigation */}
        <div className="hidden md:flex space-x-1">
          {tabs.map((tab) => {
            const hasErrors = getTabValidation(tab.id)
            const progress = getTabProgress(tab.id)
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 relative ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-200 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-transparent'
                }`}
                title={tab.description}
              >
                <span className="text-base">
                  {getTabIcon(tab, progress)}
                </span>
                <span>{tab.label}</span>
                
                {/* Error indicator */}
                {hasErrors && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                )}
              </button>
            )
          })}
        </div>

        {/* Mobile Tab Navigation */}
        <div className="md:hidden">
          <select
            value={activeTab}
            onChange={(e) => onTabChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {tabs.map((tab) => {
              const hasErrors = getTabValidation(tab.id)
              return (
                <option key={tab.id} value={tab.id}>
                  {tab.icon} {tab.label} {hasErrors ? '⚠️' : ''}
                </option>
              )
            })}
          </select>
        </div>

        {/* Progress Indicator */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>Progress</span>
            <span>
              {tabs.filter(tab => getTabProgress(tab.id) === 'complete').length} / {tabs.length} sections
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{
                width: `${(tabs.filter(tab => getTabProgress(tab.id) === 'complete').length / tabs.length) * 100}%`
              }}
            ></div>
          </div>
        </div>

        {/* Current Tab Info */}
        <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-700">
              Current: {tabs.find(tab => tab.id === activeTab)?.label}
            </span>
            {getTabValidation(activeTab) && (
              <span className="text-red-600 flex items-center">
                <span className="mr-1">⚠️</span>
                Has errors
              </span>
            )}
          </div>
          
          {tabs.find(tab => tab.id === activeTab)?.description && (
            <p className="text-gray-500 mt-1">
              {tabs.find(tab => tab.id === activeTab)?.description}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}