import React from 'react';
import * as LucideIcons from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import { CATEGORY_COLORS } from '../constants';

interface CategoryIconProps extends LucideProps {
  name?: string;
  categoryColor?: string; // Color name from CATEGORY_COLORS
}

const CategoryIcon: React.FC<CategoryIconProps> = ({ name, categoryColor, ...props }) => {
  const hexColor = categoryColor ? CATEGORY_COLORS[categoryColor] : props.color;

  if (!name) return <LucideIcons.MoreHorizontal {...props} color={hexColor} />;
  
  const Icon = (LucideIcons as unknown as Record<string, React.FC<LucideProps>>)[name];
  
  if (!Icon) return <LucideIcons.MoreHorizontal {...props} color={hexColor} />;
  
  return <Icon {...props} color={hexColor} />;
};

export default CategoryIcon;
