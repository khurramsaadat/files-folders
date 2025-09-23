# Files & Folders Dashboard

**A modern, responsive web application for showcasing, organizing, and managing client files and folders with professional PDF export capabilities.**

![Version](https://img.shields.io/badge/version-2.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-06B6D4.svg)

---

## 🎆 Features

### 📁 Modern Folder Viewer
- **Hierarchical Display:** Beautiful tree-like folder structure with auto-expansion
- **File Type Recognition:** Color-coded icons for 15+ file types (JS, TS, HTML, CSS, Images, Videos, etc.)
- **Professional Styling:** Warm burgundy theme with gradients and smooth animations
- **Mobile Responsive:** Optimized 3-row control layout for mobile devices

### 📊 PDF Export System
- **Client-Ready Reports:** Professional PDF generation with project information
- **Complete Structure:** Hierarchical file structure preserved in PDF output
- **Statistics Summary:** File counts, folder statistics, and file type breakdown
- **One-Click Export:** Browser-native PDF generation with print dialog

### 📱 Mobile-First Design
- **Responsive Layout:** Optimized for mobile, tablet, and desktop
- **Burger Menu:** Animated mobile navigation with smooth transitions
- **Touch-Friendly:** Proper spacing and sizing for mobile interactions
- **Consistent Fonts:** Uniform icon sizes and responsive typography

### 🔄 Batch Rename System
- **Pattern-Based Renaming:** Support for $N (filename) and # (number) variables
- **Drag & Drop:** Easy file selection with visual feedback
- **Target Directory:** Select destination folder for renamed files
- **Real-Time Preview:** See renamed files before applying changes

### 📧 Contact & Communication
- **Contact Page:** Professional contact form with EmailJS integration
- **Client Communication:** Direct email sending to project manager
- **Responsive Design:** Mobile-optimized contact interface

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/khurramsaadat/files-folders.git
   cd files-folders
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📚 Project Structure

```
files-folders/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx             # Home page with drag & drop
│   │   ├── contact/             # Contact page
│   │   ├── batch-rename/        # Batch rename functionality
│   │   └── layout.tsx           # Root layout
│   ├── components/
│   │   ├── layout/              # Header, Footer components
│   │   └── ui/                  # Reusable UI components
│   ├── contexts/               # React Context providers
│   ├── lib/                    # Utilities and helpers
│   └── types/                  # TypeScript type definitions
├── public/                     # Static assets and favicons
├── docs/                       # Documentation files
│   ├── PRD.md                  # Product Requirements Document
│   ├── PLAN.md                 # Implementation Plan
│   └── PROGRESS.md             # Progress Report
└── README.md                   # This file
```

---

## 🛠️ Technology Stack

- **Framework:** [Next.js 15](https://nextjs.org/) with App Router
- **Language:** [TypeScript 5.0](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components:** [ShadCN UI](https://ui.shadcn.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Email:** [EmailJS](https://www.emailjs.com/)
- **Testing:** MCP Playwright
- **Deployment:** Netlify Ready

---

## 🎨 Design System

### Color Palette
- **Primary:** Warm burgundy (`from-red-700 to-red-900`)
- **Secondary:** Rose and orange gradients
- **Accent:** Professional red tones
- **Background:** Clean whites with subtle gradients

### Typography
- **Headings:** Gradient text with warm tones
- **Body:** Responsive fonts (text-[10px] sm:text-xs on mobile)
- **Icons:** Consistent text-xs sizing across all file types

---

## 📱 Mobile Optimization

### Responsive Features
- **3-Row Layout:** Mobile folder viewer controls in separate rows
- **Burger Menu:** Animated navigation with smooth transitions
- **Touch-Friendly:** Proper spacing and sizing for mobile
- **Text Truncation:** Long filenames truncate with ellipsis
- **Consistent Icons:** All file type icons use same font size

---

## 🚀 Deployment

### Netlify Deployment
1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify:**
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `.next`
   - Configure environment variables for EmailJS

### Environment Variables
```bash
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
```

---

## 📋 Usage Examples

### For Video Production Companies
- **Project Organization:** Display complex video project structures
- **Client Presentations:** Generate professional PDF reports
- **File Management:** Handle large numbers of video files
- **Professional Documentation:** Create client-ready reports

### Typical Workflow
1. **Select Folder:** Use drag & drop or file dialog
2. **View Structure:** Auto-expanded hierarchical display
3. **Generate PDF:** One-click professional report
4. **Share with Client:** Email PDF or use contact form
5. **Batch Rename:** Organize files with pattern-based renaming

---

## 📊 Project Status

- **Version:** 2.0
- **Status:** Stage 3 Complete - Enhanced UI/UX & Batch Rename System
- **Progress:** 42.8% Complete (3/7 stages)
- **Last Updated:** 2025-09-23

### Completed Stages ✅
- **Stage 1:** Foundation & Basic UI Setup
- **Stage 2:** Modern Folder Viewer & PDF Export
- **Stage 3:** Enhanced UI/UX & Batch Rename System

### Upcoming Features
- Advanced Search & Filter Functionality
- Client Management System
- File Preview & Advanced Features
- Performance Optimization & Testing

---

## 👥 Contributing

This project is developed using **Cursor AI** with **Claude Sonnet** as the primary development agent.

### Development Workflow
1. All changes are tracked in `PROGRESS.md`
2. User inputs are logged in `LOG.md`
3. Implementation follows `PLAN.md`
4. Requirements are documented in `PRD.md`

---

## 📝 Documentation

- **[PRD.md](./PRD.md)** - Product Requirements Document
- **[PLAN.md](./PLAN.md)** - Implementation Plan
- **[PROGRESS.md](./PROGRESS.md)** - Progress Report
- **[LOG.md](./LOG.md)** - User Input Log
- **[EMAIL_SETUP.md](./EMAIL_SETUP.md)** - EmailJS Configuration
- **[NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md)** - Deployment Guide

---

## 📧 Contact

**Project Manager:** Khurram  
**Email:** khurram.saadat@yahoo.com  
**Agent:** Claude Sonnet (Cursor AI Agent Mode)  

---

## 📋 License

This project is developed for **Khurram** and is proprietary software.

---

**Built with ❤️ using Next.js, TypeScript, and Cursor AI**
