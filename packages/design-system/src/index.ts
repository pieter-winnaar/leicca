/**
 * Design System Package
 *
 * Core design system with themed components, services, and utilities
 */

// Services
export { ThemeService } from './services/ThemeService';
export { ComponentRegistryService } from './services/ComponentRegistryService';

// Theme definitions
export {
  mintblueTheme,
  mintblueThemeDark,
  mintblueLightColors,
  mintblueDarkColors,
  mintblueLightChartColors,
  mintblueDarkChartColors,
  mintblueLightSidebarColors,
  mintblueDarkSidebarColors,
} from './themes/mintblue.theme';

export {
  mintblueV2Theme,
  mintblueV2ThemeDark,
  mintblueV2LightColors,
  mintblueV2DarkColors,
  mintblueV2LightChartColors,
  mintblueV2DarkChartColors,
  mintblueV2LightSidebarColors,
  mintblueV2DarkSidebarColors,
} from './themes/mintblue-v2.theme';

export {
  amberTheme,
  amberThemeDark,
  amberLightColors,
  amberDarkColors,
} from './themes/amber.theme';

export {
  d2legaltechTheme,
  d2legaltechThemeDark,
  d2legaltechLightColors,
  d2legaltechDarkColors,
  d2legaltechLightChartColors,
  d2legaltechDarkChartColors,
  d2legaltechLightSidebarColors,
  d2legaltechDarkSidebarColors,
} from './themes/d2legaltech.theme';

// Theme types
export type {
  Theme,
  ThemeVariant,
  ColorPalette,
  ChartColors,
  SidebarColors,
  Typography,
  Spacing,
  BorderRadius,
  ImageSize,
  AssetPaths,
} from './types/theme.types';

// Component types
export type {
  ComponentMetadata,
  PropDefinition,
  CodeExample,
  ComponentCategory,
  ComponentSearchFilter,
} from './types/component.types';

// Component metadata
export {
  buttonMetadata,
  badgeMetadata,
  cardMetadata,
  inputMetadata,
  selectMetadata,
  alertMetadata,
  dialogMetadata,
  tabsMetadata,
  dropdownMenuMetadata,
  tableMetadata,
  avatarMetadata,
  progressMetadata,
  skeletonMetadata,
  separatorMetadata,
  checkboxMetadata,
  radioGroupMetadata,
  switchMetadata,
  sliderMetadata,
  textareaMetadata,
  labelMetadata,
  breadcrumbMetadata,
  paginationMetadata,
  navigationMenuMetadata,
  sidebarMetadata,
  metricCardMetadata,
  areaChartMetadata,
  tooltipMetadata,
  popoverMetadata,
  hoverCardMetadata,
  sonnerMetadata,
  sheetMetadata,
  scrollAreaMetadata,
  collapsibleMetadata,
  accordionMetadata,
  revenueCardMetadata,
  moveGoalCardMetadata,
  lineChartMetadata,
  barChartMetadata,
  calendarCardMetadata,
  subscriptionFormCardMetadata,
  createAccountCardMetadata,
  exerciseChartCardMetadata,
  paymentsTableCardMetadata,
  datePickerMetadata,
  commandMetadata,
  alertDialogMetadata,
  comboboxMetadata,
  dataTableMetadata,
  formFieldMetadata,
  emptyStateMetadata,
  fileUploadMetadata,
  timelineMetadata,
  stepperMetadata,
  flowDiagramMetadata,
} from './metadata';

// UI Components
export { Button, buttonVariants } from './components/button';
export { Badge, badgeVariants } from './components/badge';
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './components/card';
export { Input } from './components/input';
export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectLabel, SelectItem, SelectSeparator, SelectScrollUpButton, SelectScrollDownButton } from './components/select';
export { Alert, AlertTitle, AlertDescription } from './components/alert';
export { Tabs, TabsList, TabsTrigger, TabsContent } from './components/tabs';
export { Dialog, DialogPortal, DialogOverlay, DialogClose, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from './components/dialog';
export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuGroup, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuRadioGroup } from './components/dropdown-menu';
export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption } from './components/table';
export { Avatar, AvatarImage, AvatarFallback } from './components/avatar';
export { Progress } from './components/progress';
export { Skeleton } from './components/skeleton';
export { Separator } from './components/separator';
export { Checkbox } from './components/checkbox';
export { RadioGroup, RadioGroupItem } from './components/radio-group';
export { Switch } from './components/switch';
export { Slider } from './components/slider';
export { Textarea } from './components/textarea';
export { Label } from './components/label';
export { Breadcrumb } from './components/breadcrumb';
export type { BreadcrumbProps, BreadcrumbItem } from './components/breadcrumb';
export { Pagination, PaginationContent, PaginationLink, PaginationItem, PaginationPrevious, PaginationNext, PaginationEllipsis } from './components/pagination';
export { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuContent, NavigationMenuTrigger, NavigationMenuLink, NavigationMenuIndicator, NavigationMenuViewport, navigationMenuTriggerStyle } from './components/navigation-menu';
export { Sidebar, defaultNavItems } from './components/Sidebar';
export type { SidebarProps, SidebarNavItem } from './components/Sidebar';
export { MetricCard, metricCardVariants } from './components/MetricCard';
export type { MetricCardProps } from './components/MetricCard';
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './components/tooltip';
export { Popover, PopoverContent, PopoverTrigger, PopoverAnchor } from './components/popover';
export { HoverCard, HoverCardContent, HoverCardTrigger } from './components/hover-card';
export { Toaster } from './components/sonner';
export { Sheet, SheetPortal, SheetOverlay, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription } from './components/sheet';
export { ScrollArea } from './components/scroll-area';
export { Collapsible, CollapsibleTrigger, CollapsibleContent } from './components/collapsible';
export { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './components/accordion';
export { DatePicker, DateRangePicker } from './components/date-picker';
export type { DatePickerProps, DateRangePickerProps } from './components/date-picker';
export { Command, CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator, CommandShortcut } from './components/command';
export { AlertDialog, AlertDialogPortal, AlertDialogOverlay, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from './components/alert-dialog';
export { Combobox } from './components/combobox';
export type { ComboboxProps, ComboboxOption } from './components/combobox';
export { DataTable, DataTablePagination } from './components/data-table';
export type { DataTableProps, DataTablePaginationProps } from './components/data-table';
export { FormField } from './components/form-field';
export type { FormFieldProps } from './components/form-field';
export { EmptyState } from './components/empty-state';
export type { EmptyStateProps } from './components/empty-state';
export { FileUpload } from './components/file-upload';
export type { FileUploadProps } from './components/file-upload';
export { Timeline } from './components/timeline';
export type { TimelineProps, TimelineEvent, TimelineEventStatus } from './components/timeline';
export { Stepper } from './components/stepper';
export type { StepperProps, Step, StepStatus } from './components/stepper';
export { FlowDiagram } from './components/flow-diagram';
export type { FlowDiagramProps, FlowNode, FlowEdge } from './components/flow-diagram';

// Charts
export { AreaChart } from './components/AreaChart';
export type { AreaChartProps, AreaChartDataPoint, AreaChartConfig } from './components/AreaChart';
export { LineChart } from './components/LineChart';
export type { LineChartProps, LineChartDataPoint, LineChartConfig } from './components/LineChart';
export { BarChart } from './components/BarChart';
export type { BarChartProps, BarChartDataPoint, BarChartConfig } from './components/BarChart';

// Dashboard Cards
export { RevenueCard } from './components/RevenueCard';
export type { RevenueCardProps } from './components/RevenueCard';
export { MoveGoalCard } from './components/MoveGoalCard';
export type { MoveGoalCardProps } from './components/MoveGoalCard';
export { CalendarCard } from './components/CalendarCard';
export type { CalendarCardProps } from './components/CalendarCard';
export { SubscriptionFormCard } from './components/SubscriptionFormCard';
export type { SubscriptionFormCardProps, SubscriptionPlan, SubscriptionFormData } from './components/SubscriptionFormCard';
export { CreateAccountCard } from './components/CreateAccountCard';
export type { CreateAccountCardProps, CreateAccountFormData } from './components/CreateAccountCard';
export { ExerciseChartCard } from './components/ExerciseChartCard';
export type { ExerciseChartCardProps } from './components/ExerciseChartCard';
export { PaymentsTableCard } from './components/PaymentsTableCard';
export type { PaymentsTableCardProps, PaymentData } from './components/PaymentsTableCard';

// Showcase Components
export { ComponentCard } from './components/ComponentCard';
export type { ComponentCardProps } from './components/ComponentCard';
export { ComponentSidebar } from './components/ComponentSidebar';
export type { ComponentSidebarProps, Category } from './components/ComponentSidebar';

// Utilities
export { cn } from './lib/utils';

// Theme Provider
export { ThemeProvider, useTheme } from './components/ThemeProvider';
export type { ThemeConfig } from './components/ThemeProvider';
export { ThemeSwitcher } from './components/ThemeSwitcher';
