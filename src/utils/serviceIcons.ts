import {
  Code,
  Palette,
  TrendingUp,
  Megaphone,
  Search,
  Smartphone,
  Globe,
  ShoppingCart,
  Database,
  Cloud,
  Lock,
  Zap,
  BarChart,
  Users,
  Mail,
  Video,
  Camera,
  Pen,
  Headphones,
  Briefcase,
  Rocket,
  Target,
  Activity,
  Settings,
  Layers,
  Box,
  Package,
  Truck,
  CreditCard,
  FileText,
  MessageSquare,
  Award,
  Lightbulb,
  Brain,
  Cpu,
  Monitor,
  Laptop,
  Wifi,
  Radio,
  Share2,
  ThumbsUp,
  Heart,
  Star,
  CheckCircle,
  type LucideIcon,
} from "lucide-react";

export interface ServiceIconOption {
  name: string;
  icon: LucideIcon;
  label: string;
  category: string;
}

export const serviceIcons: ServiceIconOption[] = [
  // Development & Tech
  { name: "Code", icon: Code, label: "Code", category: "Development" },
  { name: "Laptop", icon: Laptop, label: "Laptop", category: "Development" },
  { name: "Monitor", icon: Monitor, label: "Monitor", category: "Development" },
  { name: "Database", icon: Database, label: "Database", category: "Development" },
  { name: "Cloud", icon: Cloud, label: "Cloud", category: "Development" },
  { name: "Cpu", icon: Cpu, label: "CPU", category: "Development" },
  { name: "Zap", icon: Zap, label: "Performance", category: "Development" },
  { name: "Settings", icon: Settings, label: "Settings", category: "Development" },
  { name: "Wifi", icon: Wifi, label: "Connectivity", category: "Development" },

  // Design & Creative
  { name: "Palette", icon: Palette, label: "Design", category: "Design" },
  { name: "Pen", icon: Pen, label: "Creative", category: "Design" },
  { name: "Camera", icon: Camera, label: "Photography", category: "Design" },
  { name: "Video", icon: Video, label: "Video", category: "Design" },
  { name: "Layers", icon: Layers, label: "Layers", category: "Design" },

  // Marketing & Business
  { name: "TrendingUp", icon: TrendingUp, label: "Growth", category: "Marketing" },
  { name: "Megaphone", icon: Megaphone, label: "Marketing", category: "Marketing" },
  { name: "Target", icon: Target, label: "Target", category: "Marketing" },
  { name: "BarChart", icon: BarChart, label: "Analytics", category: "Marketing" },
  { name: "Search", icon: Search, label: "SEO", category: "Marketing" },
  { name: "Mail", icon: Mail, label: "Email", category: "Marketing" },
  { name: "ThumbsUp", icon: ThumbsUp, label: "Social", category: "Marketing" },
  { name: "Share2", icon: Share2, label: "Share", category: "Marketing" },

  // E-commerce
  { name: "ShoppingCart", icon: ShoppingCart, label: "E-commerce", category: "E-commerce" },
  { name: "CreditCard", icon: CreditCard, label: "Payments", category: "E-commerce" },
  { name: "Package", icon: Package, label: "Product", category: "E-commerce" },
  { name: "Truck", icon: Truck, label: "Shipping", category: "E-commerce" },
  { name: "Box", icon: Box, label: "Inventory", category: "E-commerce" },

  // Web & Mobile
  { name: "Globe", icon: Globe, label: "Website", category: "Web" },
  { name: "Smartphone", icon: Smartphone, label: "Mobile", category: "Mobile" },
  { name: "Radio", icon: Radio, label: "Broadcasting", category: "Web" },

  // Business Services
  { name: "Briefcase", icon: Briefcase, label: "Business", category: "Business" },
  { name: "Users", icon: Users, label: "Team", category: "Business" },
  { name: "MessageSquare", icon: MessageSquare, label: "Consulting", category: "Business" },
  { name: "Headphones", icon: Headphones, label: "Support", category: "Business" },
  { name: "FileText", icon: FileText, label: "Documentation", category: "Business" },

  // Innovation & Strategy
  { name: "Rocket", icon: Rocket, label: "Launch", category: "Strategy" },
  { name: "Lightbulb", icon: Lightbulb, label: "Innovation", category: "Strategy" },
  { name: "Brain", icon: Brain, label: "Strategy", category: "Strategy" },
  { name: "Activity", icon: Activity, label: "Performance", category: "Strategy" },

  // Quality & Achievement
  { name: "Award", icon: Award, label: "Quality", category: "Quality" },
  { name: "Star", icon: Star, label: "Premium", category: "Quality" },
  { name: "CheckCircle", icon: CheckCircle, label: "Verified", category: "Quality" },
  { name: "Heart", icon: Heart, label: "Featured", category: "Quality" },

  // Security
  { name: "Lock", icon: Lock, label: "Security", category: "Security" },
];

/**
 * Get icon component by name
 */
export function getIconByName(name: string): LucideIcon {
  const iconOption = serviceIcons.find((option) => option.name === name);
  return iconOption?.icon || Layers;
}

/**
 * Smart icon suggestions based on service title
 */
export function suggestIcon(title: string): string {
  const searchText = title.toLowerCase();

  // Development keywords
  if (
    searchText.match(
      /\b(web|website|development|code|coding|programming|software|app|application|api|backend|frontend|fullstack)\b/i
    )
  ) {
    return "Code";
  }

  // Design keywords
  if (
    searchText.match(
      /\b(design|ui|ux|graphic|branding|logo|creative|visual|illustration)\b/i
    )
  ) {
    return "Palette";
  }

  // Marketing keywords
  if (
    searchText.match(
      /\b(marketing|advertising|promotion|campaign|growth|social media)\b/i
    )
  ) {
    return "Megaphone";
  }

  // SEO keywords
  if (searchText.match(/\b(seo|search|optimization|ranking|google)\b/i)) {
    return "Search";
  }

  // Analytics keywords
  if (searchText.match(/\b(analytics|metrics|data|insights|reporting)\b/i)) {
    return "BarChart";
  }

  // E-commerce keywords
  if (
    searchText.match(
      /\b(ecommerce|e-commerce|shop|store|shopping|online store)\b/i
    )
  ) {
    return "ShoppingCart";
  }

  // Mobile keywords
  if (searchText.match(/\b(mobile|ios|android|app)\b/i)) {
    return "Smartphone";
  }

  // Video/Media keywords
  if (searchText.match(/\b(video|media|production|filming)\b/i)) {
    return "Video";
  }

  // Consulting keywords
  if (searchText.match(/\b(consulting|advisory|strategy|consultation)\b/i)) {
    return "Brain";
  }

  // Support keywords
  if (searchText.match(/\b(support|maintenance|help|service)\b/i)) {
    return "Headphones";
  }

  // Cloud keywords
  if (searchText.match(/\b(cloud|hosting|server|infrastructure)\b/i)) {
    return "Cloud";
  }

  // Security keywords
  if (searchText.match(/\b(security|protection|ssl|encryption)\b/i)) {
    return "Lock";
  }

  // Default fallback
  return "Layers";
}
