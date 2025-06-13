
# Shot Tracker Design System

## Overview

The Shot Tracker design system provides a comprehensive set of guidelines, components, and patterns to ensure consistency across the entire application. This system is built on Tailwind CSS and follows modern design principles with accessibility and usability at its core.

## Design Principles

### 1. Consistency
- All components follow the same visual language
- Consistent spacing, typography, and color usage
- Predictable interaction patterns

### 2. Accessibility
- WCAG 2.1 AA compliance
- Proper color contrast ratios
- Keyboard navigation support
- Screen reader compatibility

### 3. Responsive Design
- Mobile-first approach
- Seamless experience across all device sizes
- Touch-friendly interface elements

### 4. Performance
- Optimized for fast loading
- Efficient CSS with Tailwind utilities
- Minimal visual complexity

## Typography Scale

### Font Family
```css
font-family: 'Poppins', sans-serif;
```

### Heading Hierarchy
- **H1**: `text-3xl md:text-4xl font-semibold` - Page titles, primary headings
- **H2**: `text-2xl md:text-3xl font-medium` - Section headings  
- **H3**: `text-xl md:text-2xl font-medium` - Subsection headings
- **H4**: `text-lg font-semibold` - Card titles, component headings

### Body Text
- **Large**: `text-lg` - Important body text, descriptions
- **Base**: `text-base` - Default body text
- **Small**: `text-sm` - Secondary information, captions
- **Extra Small**: `text-xs` - Labels, badges, timestamps

### Font Weights
- **Regular**: `font-normal` (400) - Body text
- **Medium**: `font-medium` (500) - Subheadings
- **Semibold**: `font-semibold` (600) - Headings, emphasis
- **Bold**: `font-bold` (700) - Strong emphasis

## Color System

### Semantic Colors
Use semantic color tokens for consistency and theming support:

```css
/* Primary colors */
--primary: 171 75% 41% (Teal)
--primary-foreground: 210 40% 98%

/* Secondary colors */
--secondary: 210 40% 96.1%
--secondary-foreground: 222.2 47.4% 11.2%

/* Accent colors */
--accent: 171 75% 97% (Light teal)
--accent-foreground: 222.2 47.4% 11.2%

/* Status colors */
--destructive: 0 84.2% 60.2% (Red)
--muted: 210 40% 96.1% (Light gray)
--muted-foreground: 215.4 16.3% 46.9%
```

### Color Usage Guidelines

#### Primary Color (Teal)
- Use for: Primary buttons, active states, focus indicators, progress bars
- Class: `bg-primary`, `text-primary`, `border-primary`

#### Secondary Color
- Use for: Secondary buttons, subtle backgrounds, disabled states
- Class: `bg-secondary`, `text-secondary-foreground`

#### Accent Color
- Use for: Card backgrounds, hover states, highlights
- Class: `bg-accent`, `hover:bg-accent`

#### Muted Colors
- Use for: Secondary text, placeholders, borders, dividers
- Class: `text-muted-foreground`, `border-muted`

#### Destructive Color
- Use for: Error states, delete buttons, warnings
- Class: `bg-destructive`, `text-destructive`

## Spacing Scale

Follow Tailwind's spacing scale for consistent layout:

```css
/* Common spacing values */
gap-1 (4px)   - Tight spacing within components
gap-2 (8px)   - Small spacing between related elements
gap-3 (12px)  - Standard spacing within cards
gap-4 (16px)  - Medium spacing between sections
gap-6 (24px)  - Large spacing between major sections
gap-8 (32px)  - Extra large spacing between page sections

/* Padding and margins */
p-3 (12px)    - Card content padding
p-4 (16px)    - Standard component padding
p-6 (24px)    - Large container padding
p-8 (32px)    - Page container padding
```

## Component Patterns

### Card Layout Pattern
Standard pattern for content cards throughout the application:

```jsx
<Card className="border-0 shadow-lg">
  <CardHeader className="pb-4">
    <div className="flex items-center justify-between">
      <div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </div>
      <Link to={viewAllLink} className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-medium">
        View all <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  </CardHeader>
  <CardContent>
    {/* Card content */}
  </CardContent>
</Card>
```

### List Item Pattern
Standard pattern for list items within cards:

```jsx
<div className="flex items-start gap-3 p-4 rounded-lg border hover:border-primary/30 hover:bg-accent/30 transition-all duration-200">
  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
    <Icon className="h-5 w-5 text-primary" />
  </div>
  <div className="flex-1 min-w-0">
    <h4 className="font-semibold text-base leading-tight truncate mb-1">{title}</h4>
    <p className="text-sm text-muted-foreground">{subtitle}</p>
  </div>
</div>
```

### Button Layout Pattern
Standard pattern for action buttons:

```jsx
<Button variant="default" className="h-auto p-4 flex-col items-start gap-2" asChild>
  <Link to={link}>
    <div className="flex items-center gap-3 w-full">
      <Icon className="h-5 w-5" />
      <div className="text-left flex-1">
        <div className="font-semibold">{title}</div>
        <div className="text-xs opacity-90">{description}</div>
      </div>
    </div>
  </Link>
</Button>
```

## Icon Guidelines

### Icon Sizing
- **Small**: `h-4 w-4` - Inline with text, secondary actions
- **Medium**: `h-5 w-5` - Standard icons in lists and buttons
- **Large**: `h-6 w-6` - Primary actions, navigation
- **Extra Large**: `h-8 w-8` - Prominent actions, mobile touch targets

### Icon Colors
- Primary actions: `text-primary`
- Secondary actions: `text-muted-foreground`
- Interactive states: Inherit from parent or use semantic colors

## Layout Guidelines

### Grid Systems
```css
/* Standard grid layouts */
grid gap-4 sm:grid-cols-2           /* 2 columns on small screens+ */
grid gap-4 sm:grid-cols-2 lg:grid-cols-3  /* 2 cols small, 3 cols large */
grid gap-8 lg:grid-cols-2           /* 2 columns on large screens only */
```

### Container Widths
```css
/* Page containers */
max-w-7xl mx-auto px-4 sm:px-6 lg:px-8  /* Full-width container */
max-w-4xl mx-auto px-4 sm:px-6          /* Content container */
max-w-2xl mx-auto px-4                  /* Narrow container */
```

### Responsive Breakpoints
- **Mobile**: < 640px
- **Small**: 640px - 768px
- **Medium**: 768px - 1024px
- **Large**: 1024px - 1280px
- **Extra Large**: 1280px+

## Animation & Transitions

### Standard Transitions
```css
transition-all duration-200  /* Standard hover effects */
transition-colors duration-200  /* Color changes only */
transition-transform duration-200  /* Transform changes */
```

### Hover Effects
```css
/* Card hover effects */
hover:border-primary/30 hover:bg-accent/30

/* Button hover effects */
hover:bg-primary/90

/* Link hover effects */
hover:text-primary/80
```

## Accessibility Guidelines

### Color Contrast
- All text meets WCAG 2.1 AA standards (4.5:1 for normal text, 3:1 for large text)
- Interactive elements have sufficient contrast in all states

### Focus States
- All interactive elements have visible focus indicators
- Focus rings use the primary color: `ring-primary`

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Logical tab order throughout the interface

### Screen Readers
- Proper heading hierarchy (h1 → h2 → h3 → h4)
- Descriptive link text and button labels
- Alt text for all meaningful images

## Component Library Integration

### Shadcn/UI Components
All UI components follow the established design system patterns:

- **Button**: Multiple variants with consistent styling
- **Card**: Standard container component with shadow and border
- **Input**: Form inputs with proper focus states
- **Badge**: Status indicators with semantic colors
- **Avatar**: User profile images with fallback states

### Custom Components
When creating new components:

1. Follow the established patterns
2. Use semantic color tokens
3. Include proper TypeScript types
4. Add accessibility attributes
5. Test responsive behavior

## Best Practices

### Do's
- ✅ Use semantic color tokens (`text-primary`, `bg-accent`)
- ✅ Follow the established spacing scale
- ✅ Maintain consistent component patterns
- ✅ Test on multiple screen sizes
- ✅ Include proper accessibility attributes

### Don'ts
- ❌ Use hardcoded colors (`text-blue-500`, `bg-red-400`)
- ❌ Create custom spacing values outside the scale
- ❌ Mix different component patterns
- ❌ Ignore responsive design considerations
- ❌ Skip accessibility testing

## Implementation Checklist

When implementing new features:

- [ ] Uses semantic color tokens
- [ ] Follows typography hierarchy
- [ ] Implements proper spacing
- [ ] Responsive on all screen sizes
- [ ] Accessible via keyboard
- [ ] Proper focus indicators
- [ ] Consistent with existing patterns
- [ ] Tested in light and dark modes

## Future Considerations

### Dark Mode
The design system is prepared for dark mode implementation with semantic color tokens. All components will automatically adapt when dark mode is enabled.

### Customization
The system allows for easy customization through CSS variables and Tailwind configuration without breaking existing components.

### Scalability
Component patterns are designed to scale as the application grows, maintaining consistency across new features and pages.
