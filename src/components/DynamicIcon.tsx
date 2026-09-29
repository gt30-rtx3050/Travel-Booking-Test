import React from 'react'
import {
  Compass,
  Mountain,
  Sparkles,
  Shield,
  Sun,
  Award,
  MapPin,
  Users,
  Clock,
  Calendar,
  CheckCircle2,
  Anchor,
  Snowflake,
  Tent,
  Binoculars,
  Feather,
  Globe,
  Heart,
  Navigation,
  Star,
  Wind,
  Camera,
  type LucideProps,
} from 'lucide-react'

const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  Compass,
  Mountain,
  Sparkles,
  Shield,
  Sun,
  Award,
  MapPin,
  Users,
  Clock,
  Calendar,
  CheckCircle2,
  Anchor,
  Snowflake,
  Tent,
  Binoculars,
  Feather,
  Globe,
  Heart,
  Navigation,
  Star,
  Wind,
  Camera,
}

interface DynamicIconProps extends Omit<LucideProps, 'name'> {
  name?: string | null
}

export function DynamicIcon({ name, className = 'h-5 w-5 text-cyan', ...props }: DynamicIconProps) {
  const key = (name || 'Compass').trim()
  const IconComponent =
    iconMap[key] ||
    iconMap[key.charAt(0).toUpperCase() + key.slice(1)] ||
    Compass

  return <IconComponent className={className} {...props} />
}
