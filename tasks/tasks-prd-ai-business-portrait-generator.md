# Task List: AI Business Portrait Generator MVP

## Relevant Files

- `app/page.tsx` - Main landing page with SEO-optimized content and value proposition
- `app/upload/page.tsx` - Photo upload interface with drag-and-drop functionality
- `app/customize/page.tsx` - Customization options page (background and style selection)
- `app/preview/page.tsx` - Preview page showing watermarked AI-generated portrait
- `app/payment/page.tsx` - Payment processing page with Stripe integration
- `app/download/page.tsx` - Download success page with download link and portrait preview
- `app/api/upload/route.ts` - API route for handling photo uploads and validation
- `app/api/generate-preview/route.ts` - API route for generating watermarked preview (512x512)
- `app/api/generate-full/route.ts` - API route for generating full-resolution image after payment
- `app/api/payment/route.ts` - API route for processing Stripe payments
- `app/api/rate-limit/route.ts` - API route for IP-based rate limiting
- `components/ui/PhotoUpload.tsx` - Reusable photo upload component with drag-and-drop
- `components/ui/ProgressIndicator.tsx` - Progress indicator component for generation steps
- `components/ui/CustomizationOptions.tsx` - Background and style selection component
- `components/ui/PreviewImage.tsx` - Preview image display with watermark
- `components/ui/PaymentForm.tsx` - Stripe payment form component
- `components/ui/RateLimitMessage.tsx` - Rate limit exceeded message component
- `lib/ai-service.ts` - AI service integration (Gemini 2.5 Flash Image API calls)
- `lib/ai-utils.ts` - AI service integration utilities (prompt, image, validation, error handling)
- `lib/prompt-builder.ts` - Advanced prompt engineering for different portrait styles
- `lib/ai-response-handler.ts` - AI response processing and validation utilities
- `lib/watermark.ts` - Watermarking utilities for preview and full images
- `lib/rate-limit.ts` - Rate limiting utilities and IP tracking
- `lib/stripe.ts` - Stripe configuration and payment processing utilities
- `lib/image-utils.ts` - Image processing and validation utilities
- `lib/session.ts` - Session management utilities for browser storage
- `lib/constants.ts` - Application constants (pricing, limits, etc.)
- `types/index.ts` - TypeScript type definitions for the application
- `middleware.ts` - Next.js middleware for rate limiting and IP tracking
- `app/globals.css` - Global styles and Tailwind configuration
- `next.config.ts` - Next.js configuration for image optimization and API routes

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `PhotoUpload.tsx` and `PhotoUpload.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

- [x] 1.0 Project Setup and Infrastructure
  - [x] 1.1 Install and configure shadcn/ui components library
  - [x] 1.2 Set up additional dependencies (Stripe, AI service SDK, image processing)
  - [x] 1.3 Configure TypeScript types and interfaces
  - [x] 1.4 Set up environment variables and configuration
  - [x] 1.5 Configure Next.js for image optimization and API routes
  - [x] 1.6 Set up Vercel deployment configuration
  - [x] 1.7 Create project folder structure and organize files

- [ ] 2.0 Core UI Components and Pages
  - [x] 2.1 Create reusable UI components (Button, Input, Card, Progress, etc.)
  - [x] 2.2 Build landing page with SEO-optimized content and value proposition
  - [x] 2.3 Create photo upload page with drag-and-drop interface
  - [x] 2.4 Build customization page with background and style options
  - [x] 2.5 Create preview page with watermarked image display
  - [x] 2.6 Build payment page with Stripe integration
  - [x] 2.7 Create download success page with download link
  - [x] 2.8 Implement responsive design for mobile-first experience
  - [x] 2.9 Add loading states and progress indicators throughout

- [ ] 3.0 Photo Upload and Validation System
  - [x] 3.1 Create PhotoUpload component with drag-and-drop functionality
  - [x] 3.2 Implement client-side image validation (format, size, dimensions)
  - [ ] 3.3 Build server-side image validation API route
  - [ ] 3.4 Add image compression and optimization utilities
  - [ ] 3.5 Implement secure file upload to cloud storage (AWS S3/Cloudinary)
  - [ ] 3.6 Add upload progress feedback and error handling
  - [x] 3.7 Create image preview functionality before processing

- [ ] 4.0 AI Integration and Image Generation
  - [x] 4.1 Research and select AI service (Stable Diffusion API, Replicate, etc.)
  - [x] 4.2 Create AI service integration utilities
  - [x] 4.3 Implement preview generation API (512x512, watermarked)
  - [ ] 4.4 Implement full-resolution generation API (2048x2048)
  - [ ] 4.5 Add generation progress tracking and status updates
  - [ ] 4.6 Implement cost management and generation limits
  - [x] 4.7 Add error handling for AI service failures
  - [x] 4.8 Create watermarking functionality for previews

- [ ] 5.0 Payment Processing Integration
  - [ ] 5.1 Set up Stripe account and configure API keys
  - [x] 5.2 Install and configure Stripe SDK
  - [x] 5.3 Create payment form component with Stripe Elements
  - [x] 5.4 Implement payment processing API route
  - [ ] 5.5 Add payment confirmation and receipt generation
  - [ ] 5.6 Implement webhook handling for payment events
  - [ ] 5.7 Add payment error handling and retry logic
  - [ ] 5.8 Create payment success/failure pages

- [ ] 6.0 Rate Limiting and Abuse Prevention
  - [ ] 6.1 Implement IP-based rate limiting (3 generations per IP per day)
  - [ ] 6.2 Add CAPTCHA integration (Google reCAPTCHA)
  - [ ] 6.3 Create rate limit tracking and storage system
  - [ ] 6.4 Build rate limit exceeded UI components
  - [ ] 6.5 Implement session management for browser storage
  - [ ] 6.6 Add suspicious activity detection and blocking
  - [ ] 6.7 Create middleware for request validation and rate limiting

- [ ] 7.0 SEO Optimization and Performance
  - [ ] 7.1 Optimize metadata and structured data for all pages
  - [ ] 7.2 Implement server-side rendering for better SEO
  - [ ] 7.3 Add Open Graph and Twitter Card meta tags
  - [ ] 7.4 Optimize images and implement lazy loading
  - [ ] 7.5 Configure Core Web Vitals optimization
  - [ ] 7.6 Add sitemap and robots.txt
  - [ ] 7.7 Implement social sharing functionality for previews
  - [ ] 7.8 Add analytics integration (Google Analytics 4)

- [ ] 8.0 Error Handling and User Experience
  - [ ] 8.1 Create global error boundary components
  - [ ] 8.2 Implement user-friendly error messages
  - [ ] 8.3 Add automatic refund system for failed generations
  - [ ] 8.4 Create fallback UI for technical issues
  - [ ] 8.5 Implement retry mechanisms for failed operations
  - [ ] 8.6 Add loading states and skeleton screens
  - [ ] 8.7 Create help and support documentation

- [ ] 9.0 Testing and Quality Assurance
  - [ ] 9.1 Set up Jest and React Testing Library
  - [ ] 9.2 Write unit tests for utility functions
  - [ ] 9.3 Create component tests for UI components
  - [ ] 9.4 Write integration tests for API routes
  - [ ] 9.5 Add end-to-end tests for critical user flows
  - [ ] 9.6 Implement accessibility testing
  - [ ] 9.7 Add performance testing and monitoring
  - [ ] 9.8 Create test data and mock services

- [ ] 10.0 Deployment and Launch Preparation
  - [ ] 10.1 Set up Vercel project and connect GitHub repository
  - [ ] 10.2 Configure production environment variables
  - [ ] 10.3 Set up custom domain and SSL certificate
  - [ ] 10.4 Configure CDN and caching strategies
  - [ ] 10.5 Set up monitoring and error tracking (Sentry)
  - [ ] 10.6 Create production database and storage setup
  - [ ] 10.7 Implement backup and recovery procedures
  - [ ] 10.8 Create launch checklist and go-live procedures
  - [ ] 10.9 Set up analytics and conversion tracking
  - [ ] 10.10 Create user documentation and help center
