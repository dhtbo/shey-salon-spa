import React from 'react'
import PageTitle from './page-title'
import Loader from './loader'
import ErrorMessage from './error-message'

interface PageContainerProps {
  title: string
  description?: string
  loading?: boolean
  error?: string | null
  children: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

function PageContainer({ 
  title, 
  description, 
  loading = false, 
  error = null, 
  children, 
  actions,
  className = ""
}: PageContainerProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader />
      </div>
    )
  }

  if (error) {
    return <ErrorMessage error={error} />
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex justify-between items-start">
        <PageTitle title={title} description={description} />
        {actions && (
          <div className="flex gap-2">
            {actions}
          </div>
        )}
      </div>
      {children}
    </div>
  )
}

export default PageContainer