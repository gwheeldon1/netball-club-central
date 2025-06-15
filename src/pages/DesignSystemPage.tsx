
// TODO: Once workspace is set up, use: import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter, Button, Input, Badge } from "@netball/shared-ui";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ProgressCard } from "@/components/dashboard/ProgressCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { 
  Calendar, CalendarIcon, Info, AlertCircle, CheckCircle, XCircle, Settings, Users, Activity, 
  Home, Bell, Trophy, TrendingUp, Palette, Layers, Sparkles, Eye, Mouse, Zap, Star 
} from "lucide-react";

const DesignSystemPage = () => {
  // Sample data for charts
  const chartData = [
    { name: "Jan", value: 65 },
    { name: "Feb", value: 78 },
    { name: "Mar", value: 82 },
    { name: "Apr", value: 75 },
    { name: "May", value: 89 },
    { name: "Jun", value: 92 }
  ];

  const pieData = [
    { name: "Training", value: 45, color: "hsl(var(--chart-1))" },
    { name: "Matches", value: 30, color: "hsl(var(--chart-2))" },
    { name: "Social", value: 25, color: "hsl(var(--chart-3))" }
  ];

  return (
    <div className="min-h-screen gradient-secondary">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-6 animate-fade-in">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-2xl gradient-primary shadow-elevation-high flex items-center justify-center animate-scale-in">
                <Palette className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-gradient">Premium Design System</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience our sophisticated teal-based design system with glass morphism, premium animations, and cohesive visual language
            </p>
          </div>

          {/* Visual Effects Showcase */}
          <Card className="glass-card shadow-elevation-high animate-scale-in" style={{ animationDelay: '200ms' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Sparkles className="h-6 w-6 text-primary" />
                Visual Effects Showcase
              </CardTitle>
              <CardDescription>Premium visual elements that make our interface stand out</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Glass Morphism Examples */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  Glass Morphism Effects
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="glass-card p-6 text-center space-y-4 card-hover">
                    <div className="w-12 h-12 rounded-xl gradient-primary shadow-glow mx-auto flex items-center justify-center">
                      <Layers className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-semibold">Glass Card</h4>
                    <p className="text-sm text-muted-foreground">Backdrop blur with transparency</p>
                  </div>
                  
                  <div className="gradient-glass p-6 text-center space-y-4 card-hover border-gradient">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 shadow-glow mx-auto flex items-center justify-center backdrop-blur-sm">
                      <Star className="h-6 w-6 text-primary" />
                    </div>
                    <h4 className="font-semibold">Enhanced Glass</h4>
                    <p className="text-sm text-muted-foreground">Gradient borders and enhanced blur</p>
                  </div>

                  <div className="metric-card p-6 text-center space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-accent shadow-elevation-medium mx-auto flex items-center justify-center">
                      <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <h4 className="font-semibold">Metric Card</h4>
                    <p className="text-sm text-muted-foreground">Elevation with hover effects</p>
                  </div>
                </div>
              </div>

              {/* Shadow System */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Premium Shadow System</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-6 bg-card rounded-xl shadow-elevation-low text-center">
                    <p className="text-sm font-medium">Low Elevation</p>
                  </div>
                  <div className="p-6 bg-card rounded-xl shadow-elevation-medium text-center">
                    <p className="text-sm font-medium">Medium Elevation</p>
                  </div>
                  <div className="p-6 bg-card rounded-xl shadow-elevation-high text-center">
                    <p className="text-sm font-medium">High Elevation</p>
                  </div>
                  <div className="p-6 bg-card rounded-xl shadow-glow text-center">
                    <p className="text-sm font-medium">Glow Effect</p>
                  </div>
                </div>
              </div>

              {/* Gradient System */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Gradient Palette</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="h-24 gradient-primary rounded-xl flex items-center justify-center text-white font-semibold shadow-elevation-medium">
                    Primary Gradient
                  </div>
                  <div className="h-24 gradient-secondary rounded-xl flex items-center justify-center font-semibold shadow-elevation-medium">
                    Secondary Gradient
                  </div>
                  <div className="h-24 gradient-accent rounded-xl flex items-center justify-center font-semibold shadow-elevation-medium">
                    Accent Gradient
                  </div>
                  <div className="h-24 gradient-card rounded-xl flex items-center justify-center font-semibold shadow-elevation-medium">
                    Card Gradient
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Premium Metrics Cards */}
          <div className="space-y-6 animate-slide-in" style={{ animationDelay: '400ms' }}>
            <h2 className="text-3xl font-bold text-center">Premium Metric Cards</h2>
            <DashboardGrid cols={4}>
              <MetricCard
                title="Total Users"
                value="2,547"
                subtitle="Active members"
                icon={<Users className="h-8 w-8" />}
                gradient="blue"
                className="animate-scale-in"
              />
              <MetricCard
                title="Revenue"
                value="$24.5K"
                subtitle="Monthly earnings"
                icon={<Trophy className="h-8 w-8" />}
                gradient="green"
                className="animate-scale-in"
              />
              <MetricCard
                title="Events"
                value="156"
                subtitle="This month"
                icon={<Calendar className="h-8 w-8" />}
                gradient="purple"
                className="animate-scale-in"
              />
              <MetricCard
                title="Growth"
                value="89%"
                subtitle="Year over year"
                icon={<TrendingUp className="h-8 w-8" />}
                gradient="orange"
                className="animate-scale-in"
              />
            </DashboardGrid>
          </div>

          {/* Enhanced Stats and Progress Cards */}
          <div className="space-y-6 animate-slide-in" style={{ animationDelay: '600ms' }}>
            <h2 className="text-3xl font-bold text-center">Enhanced Stats & Progress</h2>
            <DashboardGrid cols={4}>
              <StatsCard
                title="Weekly Attendance"
                value="94%"
                change={8.2}
                changeLabel="vs last week"
                icon={<Users className="h-4 w-4" />}
                variant="success"
                className="glass-card"
              />
              <StatsCard
                title="Event Response Rate"
                value="87%"
                change={-2.1}
                changeLabel="vs last month"
                icon={<Activity className="h-4 w-4" />}
                variant="warning"
                className="glass-card"
              />
              <ProgressCard
                title="Season Progress"
                value={32}
                maxValue={50}
                label="weeks completed"
                description="18 weeks remaining"
                icon={<Calendar className="h-4 w-4" />}
                variant="default"
                className="glass-card"
              />
              <ProgressCard
                title="Member Engagement"
                value={245}
                maxValue={300}
                label="active users"
                description="Target: 300 active members"
                icon={<Trophy className="h-4 w-4" />}
                variant="success"
                className="glass-card"
              />
            </DashboardGrid>
          </div>

          {/* Premium Charts */}
          <div className="space-y-6 animate-slide-in" style={{ animationDelay: '800ms' }}>
            <h2 className="text-3xl font-bold text-center">Premium Chart Components</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ChartCard
                title="Performance Trends"
                description="Monthly performance analytics"
                className="glass-card"
              >
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                    <XAxis dataKey="name" className="text-muted-foreground" fontSize={12} />
                    <YAxis className="text-muted-foreground" fontSize={12} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                        boxShadow: "var(--shadow-elevation-medium)"
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--chart-1))", strokeWidth: 2, r: 5 }}
                      activeDot={{ r: 6, stroke: "hsl(var(--chart-1))", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard
                title="Event Distribution"
                description="Breakdown by event type"
                className="glass-card"
              >
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                        boxShadow: "var(--shadow-elevation-medium)"
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center flex-wrap gap-4 mt-6">
                  {pieData.map((item) => (
                    <div key={item.name} className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full shadow-sm" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-muted-foreground font-medium">
                        {item.name} ({item.value}%)
                      </span>
                    </div>
                  ))}
                </div>
              </ChartCard>
            </div>
          </div>

          {/* Enhanced Color Palette */}
          <Card className="glass-card shadow-elevation-high animate-fade-in" style={{ animationDelay: '1000ms' }}>
            <CardHeader>
              <CardTitle className="text-2xl">Cohesive Teal Color Palette</CardTitle>
              <CardDescription>Our sophisticated teal-based color system with semantic meanings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Primary Colors */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Primary Teal Variations</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <div className="h-20 bg-primary rounded-lg shadow-elevation-medium"></div>
                    <p className="text-sm font-medium">Primary</p>
                    <p className="text-xs text-muted-foreground">hsl(171, 75%, 41%)</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-20 bg-primary/80 rounded-lg shadow-elevation-medium"></div>
                    <p className="text-sm font-medium">Primary 80%</p>
                    <p className="text-xs text-muted-foreground">Actions & hover</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-20 bg-primary/20 rounded-lg shadow-elevation-medium"></div>
                    <p className="text-sm font-medium">Primary 20%</p>
                    <p className="text-xs text-muted-foreground">Subtle backgrounds</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-20 bg-primary/10 rounded-lg shadow-elevation-medium"></div>
                    <p className="text-sm font-medium">Primary 10%</p>
                    <p className="text-xs text-muted-foreground">Icon backgrounds</p>
                  </div>
                </div>
              </div>

              {/* Chart Colors */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Chart Color Harmony</h3>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <div key={num} className="space-y-2">
                      <div 
                        className="h-16 rounded-lg shadow-elevation-medium" 
                        style={{ backgroundColor: `hsl(var(--chart-${num}))` }}
                      ></div>
                      <p className="text-sm font-medium text-center">Chart {num}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Semantic Colors */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Semantic Color Applications</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <div className="h-16 bg-accent rounded-lg shadow-elevation-medium"></div>
                    <p className="text-sm font-medium">Accent</p>
                    <p className="text-xs text-muted-foreground">Card backgrounds</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-16 bg-muted rounded-lg shadow-elevation-medium"></div>
                    <p className="text-sm font-medium">Muted</p>
                    <p className="text-xs text-muted-foreground">Subtle elements</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-16 bg-destructive rounded-lg shadow-elevation-medium"></div>
                    <p className="text-sm font-medium">Destructive</p>
                    <p className="text-xs text-muted-foreground">Error states</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-16 bg-border rounded-lg shadow-elevation-medium"></div>
                    <p className="text-sm font-medium">Border</p>
                    <p className="text-xs text-muted-foreground">Dividers</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Animation Showcase */}
          <Card className="glass-card shadow-elevation-high animate-scale-in" style={{ animationDelay: '1200ms' }}>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3">
                <Mouse className="h-6 w-6 text-primary" />
                Interactive Animations
              </CardTitle>
              <CardDescription>Hover and interaction effects that bring the interface to life</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Button className="h-auto p-6 flex-col space-y-3 shadow-glow hover:shadow-elevation-high transition-all duration-300 hover:scale-105">
                  <Home className="h-8 w-8" />
                  <div className="text-center">
                    <div className="font-semibold">Hover Scale</div>
                    <div className="text-xs opacity-90">Subtle lift effect</div>
                  </div>
                </Button>

                <div className="p-6 glass-card card-hover text-center space-y-3 cursor-pointer">
                  <Trophy className="h-8 w-8 text-primary mx-auto" />
                  <div>
                    <div className="font-semibold">Card Hover</div>
                    <div className="text-xs text-muted-foreground">Enhanced shadow</div>
                  </div>
                </div>

                <div className="p-6 bg-card rounded-xl shadow-elevation-low hover:shadow-elevation-high transition-all duration-300 hover:-translate-y-1 cursor-pointer text-center space-y-3">
                  <Activity className="h-8 w-8 text-primary mx-auto" />
                  <div>
                    <div className="font-semibold">Lift Animation</div>
                    <div className="text-xs text-muted-foreground">Elevation change</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Animation Classes</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-card rounded-lg border animate-fade-in">
                    <code className="text-sm">animate-fade-in</code>
                    <p className="text-xs text-muted-foreground mt-1">Smooth fade entrance</p>
                  </div>
                  <div className="p-4 bg-card rounded-lg border animate-slide-in">
                    <code className="text-sm">animate-slide-in</code>
                    <p className="text-xs text-muted-foreground mt-1">Slide from left</p>
                  </div>
                  <div className="p-4 bg-card rounded-lg border animate-scale-in">
                    <code className="text-sm">animate-scale-in</code>
                    <p className="text-xs text-muted-foreground mt-1">Scale up entrance</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Typography Enhancement */}
          <Card className="glass-card shadow-elevation-high animate-fade-in" style={{ animationDelay: '1400ms' }}>
            <CardHeader>
              <CardTitle className="text-2xl">Enhanced Typography</CardTitle>
              <CardDescription>Poppins font family with premium styling and hierarchy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold text-gradient">Premium Heading 1</h1>
                <h2 className="text-3xl font-semibold">Sophisticated Heading 2</h2>
                <h3 className="text-2xl font-medium">Elegant Heading 3</h3>
                <h4 className="text-xl font-medium">Refined Heading 4</h4>
                <p className="text-lg leading-relaxed">Large body text for important content and descriptions that need emphasis</p>
                <p className="text-base leading-relaxed">Standard body text with optimal readability and comfortable line spacing</p>
                <p className="text-sm text-muted-foreground">Small text for secondary information, captions, and metadata</p>
                <p className="text-xs text-muted-foreground font-medium">Extra small text for labels, badges, and timestamps</p>
              </div>
            </CardContent>
          </Card>

          {/* Component Showcase */}
          <Card className="glass-card shadow-elevation-high animate-slide-in" style={{ animationDelay: '1600ms' }}>
            <CardHeader>
              <CardTitle className="text-2xl">Enhanced UI Components</CardTitle>
              <CardDescription>All components styled with the premium design system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Buttons */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Premium Buttons</h3>
                <div className="flex flex-wrap gap-4">
                  <Button className="shadow-glow">Primary Action</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline" className="border-2">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                </div>
              </div>

              {/* Form Elements */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Enhanced Form Elements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input placeholder="Premium input with focus glow" className="border-2 focus:border-primary focus:shadow-glow" />
                  <Select>
                    <SelectTrigger className="border-2 focus:border-primary">
                      <SelectValue placeholder="Select with style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="option1">Premium Option 1</SelectItem>
                      <SelectItem value="option2">Premium Option 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Badges */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Stylish Badges</h3>
                <div className="flex flex-wrap gap-3">
                  <Badge className="shadow-elevation-low">Premium</Badge>
                  <Badge variant="secondary" className="shadow-elevation-low">Secondary</Badge>
                  <Badge variant="outline" className="border-2">Outline</Badge>
                  <Badge variant="destructive" className="shadow-elevation-low">Alert</Badge>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Enhanced Progress</h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Premium Progress</span>
                      <span className="text-muted-foreground">75%</span>
                    </div>
                    <Progress value={75} className="h-3 shadow-elevation-low" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Implementation Guide */}
          <Card className="glass-card shadow-elevation-high animate-scale-in" style={{ animationDelay: '1800ms' }}>
            <CardHeader>
              <CardTitle className="text-2xl">Implementation Guidelines</CardTitle>
              <CardDescription>How to use these premium design elements in your applications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary">CSS Classes</h3>
                  <div className="space-y-2 text-sm">
                    <div><code className="bg-muted px-2 py-1 rounded">glass-card</code> - Glass morphism effect</div>
                    <div><code className="bg-muted px-2 py-1 rounded">shadow-glow</code> - Primary glow effect</div>
                    <div><code className="bg-muted px-2 py-1 rounded">gradient-primary</code> - Primary gradient</div>
                    <div><code className="bg-muted px-2 py-1 rounded">card-hover</code> - Enhanced hover effects</div>
                    <div><code className="bg-muted px-2 py-1 rounded">text-gradient</code> - Gradient text</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary">Animation Classes</h3>
                  <div className="space-y-2 text-sm">
                    <div><code className="bg-muted px-2 py-1 rounded">animate-fade-in</code> - Fade entrance</div>
                    <div><code className="bg-muted px-2 py-1 rounded">animate-slide-in</code> - Slide entrance</div>
                    <div><code className="bg-muted px-2 py-1 rounded">animate-scale-in</code> - Scale entrance</div>
                    <div><code className="bg-muted px-2 py-1 rounded">hover:scale-105</code> - Hover scale</div>
                    <div><code className="bg-muted px-2 py-1 rounded">transition-all</code> - Smooth transitions</div>
                  </div>
                </div>
              </div>

              <Alert className="border-primary/20 bg-primary/5">
                <Sparkles className="h-4 w-4 text-primary" />
                <AlertTitle className="text-primary">Pro Tip</AlertTitle>
                <AlertDescription>
                  Combine multiple effects for maximum impact: <code>glass-card shadow-glow animate-scale-in card-hover</code>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DesignSystemPage;
