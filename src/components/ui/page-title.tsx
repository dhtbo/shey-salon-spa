import React from 'react'

interface PageTitleProps {
    title: string
    description?: string
    className?: string
}

function PageTitle({ title, description, className = "" }: PageTitleProps) {
    return (
        <div className={`mb-6 ${className}`}>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {title}
            </h1>
            {description && (
                <p className="text-sm text-gray-600">
                    {description}
                </p>
            )}
        </div>
    )
}

export default PageTitle
