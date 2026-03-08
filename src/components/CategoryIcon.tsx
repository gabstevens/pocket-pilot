import React from 'react';
import * as LucideIcons from 'lucide-react';
import type { LucideProps } from 'lucide-react';

interface CategoryIconProps extends LucideProps {
  name?: string;
}

const CategoryIcon: React.FC<CategoryIconProps> = ({ name, ...props }) => {
  if (!name) return <LucideIcons.MoreHorizontal {...props} />;
  
  const Icon = (LucideIcons as unknown as Record<string, React.FC<LucideProps>>)[name];
  
  if (!Icon) return <LucideIcons.MoreHorizontal {...props} />;
  
  return <Icon {...props} />;
};

export default CategoryIcon;
