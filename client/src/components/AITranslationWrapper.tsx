import React from 'react';

interface AITranslationWrapperProps {
  children: string;
  className?: string;
}

export const AITranslationWrapper: React.FC<AITranslationWrapperProps> = ({
  children,
  className,
}) => <div className={className}>{children}</div>;