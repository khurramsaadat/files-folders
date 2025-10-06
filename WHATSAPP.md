# WhatsApp Chat Widget Implementation Guide

**Version:** 1.0  
**Last Updated:** October 5, 2025  
**Framework:** Next.js 15+ / React / TypeScript  
**Styling:** Tailwind CSS  
**License:** MIT  

## 📋 Overview

This guide provides a complete implementation for adding a WhatsApp "Click to Chat" widget to any Next.js/React application. The widget is a floating action button that allows visitors to instantly start a WhatsApp conversation with your business.

## ✨ Features

- 🎯 **Fixed positioning** - Always visible in bottom-right corner
- 📱 **Mobile responsive** - Optimized for all screen sizes  
- ♿ **Accessible** - WCAG compliant with proper ARIA labels
- 🎨 **Tailwind CSS** - Utility-first styling approach
- ⚡ **Lazy loading** - Load only when needed for performance
- 🕒 **Business hours** - Show/hide based on availability
- 🔗 **Next.js optimized** - SSR/SSG compatible
- 📊 **Analytics ready** - Easy tracking integration

## 🚀 Quick Start

### 1. Basic Implementation (Direct in Layout)

Add directly to your `MainLayout.tsx` or any layout component:

```tsx
// src/components/layout/MainLayout.tsx
'use client';

import { Header } from './Header';
import { Footer } from './Footer';
import { FileSystemProvider } from '@/contexts/FileSystemContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

function MainLayoutContent({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Page Content with Header */}
      <main className="flex-1 container mx-auto px-6 py-8">
        <Header />
        {children}
      </main>

      {/* Footer */}
      <Footer />
      
      {/* WhatsApp Widget - Fixed position, appears on all pages */}
      <div className="fixed bottom-6 right-6 z-50">
        <a
          href="https://wa.me/0000000000?text=Hello!%20I%20found%20your%20website%20and%20would%20like%20to%20know%20more%20about%20your%20services.%20Can%20you%20help%20me?"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center justify-center w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
          aria-label="Chat with us on WhatsApp"
          title="Chat with us on WhatsApp"
        >
          {/* WhatsApp Icon - Simple SVG */}
          <svg 
            viewBox="0 0 24 24" 
            className="w-8 h-8 fill-white"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.484 3.488"/>
          </svg>
          
          {/* Pulse animation - Removed for cleaner look */}
          
          {/* Tooltip */}
          <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
            Chat with us on WhatsApp
            <div className="absolute top-1/2 left-full transform -translate-y-1/2 border-4 border-transparent border-l-gray-800"></div>
          </div>
        </a>
      </div>
    </div>
  );
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <FileSystemProvider>
      <MainLayoutContent>{children}</MainLayoutContent>
    </FileSystemProvider>
  );
}
```

## 🔧 Advanced Component Implementation

### 1. Create WhatsApp Widget Component

```tsx
// src/components/ui/whatsapp-widget.tsx
'use client';

import React, { useState, useEffect, lazy, Suspense } from 'react';

// Lazy load the icon component for better performance
const WhatsAppIcon = lazy(() => import('./whatsapp-icon'));

interface WhatsAppWidgetProps {
  phoneNumber?: string;
  message?: string;
  className?: string;
  showBusinessHours?: boolean;
  businessHours?: {
    start: number; // 24-hour format (e.g., 9 for 9 AM)
    end: number;   // 24-hour format (e.g., 18 for 6 PM)
    days: number[]; // 0-6, where 0 = Sunday, 1 = Monday, etc.
  };
}

const WhatsAppWidget: React.FC<WhatsAppWidgetProps> = ({
  phoneNumber = '0000000000',
  message = 'Hello! I found your website and would like to know more about your services. Can you help me?',
  className = '',
  showBusinessHours = true,
  businessHours = {
    start: 9,
    end: 18,
    days: [1, 2, 3, 4, 5] // Monday to Friday
  }
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isBusinessTime, setIsBusinessTime] = useState(true);

  // Check business hours
  useEffect(() => {
    if (!showBusinessHours) {
      setIsBusinessTime(true);
      return;
    }

    const checkBusinessHours = () => {
      const now = new Date();
      const currentDay = now.getDay();
      const currentHour = now.getHours();

      const isBusinessDay = businessHours.days.includes(currentDay);
      const isBusinessHour = currentHour >= businessHours.start && currentHour < businessHours.end;

      setIsBusinessTime(isBusinessDay && isBusinessHour);
    };

    checkBusinessHours();
    
    // Check every minute
    const interval = setInterval(checkBusinessHours, 60000);
    
    return () => clearInterval(interval);
  }, [showBusinessHours, businessHours]);

  // Lazy load the widget when scrolling near bottom
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '200px' }
    );

    // Observe the footer or a trigger element
    const footer = document.querySelector('footer');
    if (footer) {
      observer.observe(footer);
    } else {
      // If no footer, show after 2 seconds
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }

    return () => observer.disconnect();
  }, []);

  const handleClick = () => {
    // Analytics tracking
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'whatsapp_click', {
        event_category: 'engagement',
        event_label: 'whatsapp_widget',
        value: 1
      });
    }

    // Custom analytics
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('whatsapp-widget-click', {
        detail: { phoneNumber, timestamp: new Date().toISOString() }
      }));
    }
  };

  const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className={`
          group relative flex items-center justify-center w-16 h-16 rounded-full shadow-lg hover:shadow-xl 
          transition-all duration-300 transform hover:scale-110
          ${isBusinessTime 
            ? 'bg-green-500 hover:bg-green-600' 
            : 'bg-gray-400 hover:bg-gray-500'
          }
        `}
        aria-label={`Chat with us on WhatsApp${!isBusinessTime ? ' (Outside business hours)' : ''}`}
        title={`Chat with us on WhatsApp${!isBusinessTime ? ' (Outside business hours)' : ''}`}
      >
        {/* WhatsApp Icon with Suspense for lazy loading */}
        <Suspense fallback={
          <div className="w-8 h-8 bg-white/20 rounded animate-pulse" />
        }>
          <WhatsAppIcon className="w-8 h-8 fill-white" />
        </Suspense>
        
        {/* Pulse animation - Removed for cleaner look */}
        
        {/* Business hours indicator */}
        {!isBusinessTime && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white">
            <span className="sr-only">Outside business hours</span>
          </div>
        )}
        
        {/* Tooltip */}
        <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
          {isBusinessTime 
            ? 'Chat with us on WhatsApp' 
            : 'WhatsApp (Outside business hours)'
          }
          <div className="absolute top-1/2 left-full transform -translate-y-1/2 border-4 border-transparent border-l-gray-800" />
        </div>
      </a>
    </div>
  );
};

export default WhatsAppWidget;
```

### 2. Create WhatsApp Icon Component (Lazy Loaded)

```tsx
// src/components/ui/whatsapp-icon.tsx
import React from 'react';

interface WhatsAppIconProps {
  className?: string;
}

const WhatsAppIcon: React.FC<WhatsAppIconProps> = ({ className = "w-8 h-8 fill-white" }) => {
  return (
    <svg 
      viewBox="0 0 24 24" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.484 3.488"/>
    </svg>
  );
};

export default WhatsAppIcon;
```

### 3. Integration in Layout

```tsx
// src/components/layout/MainLayout.tsx
'use client';

import { Header } from './Header';
import { Footer } from './Footer';
import { FileSystemProvider } from '@/contexts/FileSystemContext';
import WhatsAppWidget from '@/components/ui/whatsapp-widget';

interface MainLayoutProps {
  children: React.ReactNode;
}

function MainLayoutContent({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Page Content with Header */}
      <main className="flex-1 container mx-auto px-6 py-8">
        <Header />
        {children}
      </main>

      {/* Footer */}
      <Footer />
      
      {/* WhatsApp Widget with Business Hours */}
      <WhatsAppWidget 
        phoneNumber="0000000000"
        message="Hello! I found your website and would like to know more about your services. Can you help me?"
        showBusinessHours={true}
        businessHours={{
          start: 9,    // 9 AM
          end: 18,     // 6 PM
          days: [1, 2, 3, 4, 5] // Monday to Friday
        }}
      />
    </div>
  );
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <FileSystemProvider>
      <MainLayoutContent>{children}</MainLayoutContent>
    </FileSystemProvider>
  );
}
```

## ⚙️ Configuration Options

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_WHATSAPP_PHONE=0000000000
NEXT_PUBLIC_WHATSAPP_MESSAGE="Hello! I found your website and would like to know more about your services. Can you help me?"
NEXT_PUBLIC_BUSINESS_HOURS_START=9
NEXT_PUBLIC_BUSINESS_HOURS_END=18
NEXT_PUBLIC_BUSINESS_DAYS="1,2,3,4,5"
```

### Using Environment Variables

```tsx
// src/components/ui/whatsapp-widget.tsx
const WhatsAppWidget: React.FC<WhatsAppWidgetProps> = ({
  phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '0000000000',
  message = process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE || 'Hello! I found your website...',
  businessHours = {
    start: parseInt(process.env.NEXT_PUBLIC_BUSINESS_HOURS_START || '9'),
    end: parseInt(process.env.NEXT_PUBLIC_BUSINESS_HOURS_END || '18'),
    days: process.env.NEXT_PUBLIC_BUSINESS_DAYS?.split(',').map(Number) || [1, 2, 3, 4, 5]
  }
}) => {
  // Component logic...
};
```

## 📊 Analytics Integration

### Google Analytics 4

```tsx
// src/lib/analytics.ts
export const trackWhatsAppClick = (phoneNumber: string) => {
  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as any).gtag('event', 'whatsapp_click', {
      event_category: 'engagement',
      event_label: 'whatsapp_widget',
      custom_parameters: {
        phone_number: phoneNumber,
        timestamp: new Date().toISOString()
      }
    });
  }
};
```

### Custom Event Tracking

```tsx
// Listen for WhatsApp widget clicks anywhere in your app
useEffect(() => {
  const handleWhatsAppClick = (event: CustomEvent) => {
    console.log('WhatsApp widget clicked:', event.detail);
    // Send to your analytics service
  };

  window.addEventListener('whatsapp-widget-click', handleWhatsAppClick as EventListener);
  
  return () => {
    window.removeEventListener('whatsapp-widget-click', handleWhatsAppClick as EventListener);
  };
}, []);
```

## 🎨 Customization

### Tailwind CSS Custom Classes

```tsx
// Custom styling with Tailwind
<WhatsAppWidget 
  className="bottom-4 right-4 md:bottom-6 md:right-6"
  phoneNumber="0000000000"
/>
```

### Theme Integration

```tsx
// src/components/ui/whatsapp-widget.tsx
import { useTheme } from 'next-themes';

const WhatsAppWidget: React.FC<WhatsAppWidgetProps> = (props) => {
  const { theme } = useTheme();
  
  const tooltipBg = theme === 'dark' ? 'bg-gray-700' : 'bg-gray-800';
  
  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Widget with theme-aware tooltip */}
      <div className={`${tooltipBg} text-white ...`}>
        {/* Tooltip content */}
      </div>
    </div>
  );
};
```

## 📱 Mobile Optimization

### Responsive Design

```tsx
// Mobile-optimized widget
<div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50">
  <a className="
    w-14 h-14 md:w-16 md:h-16 
    bg-green-500 hover:bg-green-600 
    rounded-full shadow-lg hover:shadow-xl 
    transition-all duration-300 
    transform hover:scale-110
    flex items-center justify-center
  ">
    <svg className="w-7 h-7 md:w-8 md:h-8 fill-white">
      {/* Icon */}
    </svg>
  </a>
</div>
```

### Safe Area Support

```css
/* Add to your global CSS */
.whatsapp-widget {
  bottom: max(1rem, env(safe-area-inset-bottom));
  right: max(1rem, env(safe-area-inset-right));
}
```

## 🚀 Performance Optimization

### Code Splitting

```tsx
// Lazy load the entire widget
import { lazy, Suspense } from 'react';

const WhatsAppWidget = lazy(() => import('@/components/ui/whatsapp-widget'));

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div>
      {children}
      <Suspense fallback={null}>
        <WhatsAppWidget />
      </Suspense>
    </div>
  );
}
```

### Intersection Observer for Lazy Loading

```tsx
// Only load when user scrolls near bottom
const [shouldLoad, setShouldLoad] = useState(false);

useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        setShouldLoad(true);
        observer.disconnect();
      }
    },
    { rootMargin: '200px' }
  );

  const footer = document.querySelector('footer');
  if (footer) observer.observe(footer);

  return () => observer.disconnect();
}, []);

if (!shouldLoad) return null;
```

## 🔒 Security & Validation

### Phone Number Validation

```tsx
// src/lib/whatsapp-utils.ts
export const validatePhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digits
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Validate length (7-15 digits for international numbers)
  if (cleaned.length < 7 || cleaned.length > 15) {
    throw new Error('Invalid phone number format');
  }
  
  return cleaned;
};

export const sanitizeMessage = (message: string): string => {
  return message
    .replace(/[<>]/g, '') // Remove potential HTML
    .substring(0, 500)    // Limit length
    .trim();
};
```

## 📋 Implementation Checklist

### Setup Checklist
- [ ] Install required dependencies
- [ ] Create WhatsApp widget component
- [ ] Add to main layout
- [ ] Configure phone number
- [ ] Set custom message
- [ ] Configure business hours
- [ ] Test lazy loading
- [ ] Add analytics tracking
- [ ] Test mobile responsiveness
- [ ] Verify accessibility

### Testing Checklist
- [ ] Widget appears on all pages
- [ ] Click opens WhatsApp correctly
- [ ] Business hours detection works
- [ ] Lazy loading functions properly
- [ ] Mobile layout is correct
- [ ] Analytics events fire
- [ ] Accessibility compliance
- [ ] Performance impact minimal

## 🐛 Troubleshooting

### Common Issues

**Widget not appearing:**
```bash
# Check if component is imported correctly
# Verify Tailwind classes are available
# Check browser console for errors
```

**Business hours not working:**
```tsx
// Debug business hours
console.log('Current time:', new Date());
console.log('Business hours:', businessHours);
console.log('Is business time:', isBusinessTime);
```

**Lazy loading not triggering:**
```tsx
// Check if footer exists
const footer = document.querySelector('footer');
console.log('Footer found:', !!footer);
```

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- [React Lazy Loading](https://react.dev/reference/react/lazy)

## 📄 License

MIT License - Free to use in any project.

---

**Ready to implement?** This guide provides everything you need for a production-ready WhatsApp widget in your Next.js application with lazy loading and business hours detection!
