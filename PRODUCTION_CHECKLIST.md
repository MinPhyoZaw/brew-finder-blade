# Production Deployment Checklist

## Pre-Deployment Tasks

### SEO & Meta Tags
- [x] Add comprehensive meta tags (title, description, keywords)
- [x] Add Open Graph tags for social sharing
- [x] Add Twitter Card tags
- [x] Set canonical URL (update with actual domain)
- [x] Create robots.txt file
- [x] Create sitemap.xml file
- [ ] Update canonical URL in index.html with actual domain
- [ ] Update og:url with actual domain
- [ ] Submit sitemap to Google Search Console
- [ ] Submit sitemap to Bing Webmaster Tools

### Performance Optimization
- [x] Enable code splitting
- [x] Configure lazy loading for routes
- [x] Optimize font loading (preload, display=swap)
- [x] Configure image caching
- [x] Enable Terser minification
- [x] Remove console.logs in production
- [x] Configure PWA with workbox caching
- [ ] Compress images (use WebP format where possible)
- [ ] Enable Gzip/Brotli compression on server
- [ ] Set up CDN for static assets

### Core Web Vitals
- [ ] Test LCP (Largest Contentful Paint) - Target: < 2.5s
- [ ] Test CLS (Cumulative Layout Shift) - Target: < 0.1
- [ ] Test FID/INP (First Input Delay/Interaction to Next Paint) - Target: < 100ms
- [ ] Run Lighthouse audit and fix issues
- [ ] Test on real devices (mobile & desktop)

### Security
- [ ] Update Firebase security rules
- [ ] Set up environment variables properly
- [ ] Enable CORS policies
- [ ] Add Content Security Policy headers
- [ ] Enable HTTPS only
- [ ] Review and secure API keys

### Accessibility
- [x] Add ARIA labels to interactive elements
- [x] Add role attributes (banner, main, navigation)
- [ ] Test with screen readers
- [ ] Verify keyboard navigation works
- [ ] Check color contrast ratios (WCAG AA standard)
- [ ] Add alt text to all images

### Monitoring & Analytics
- [ ] Set up Google Analytics or alternative
- [ ] Set up error tracking (Sentry, LogRocket, etc.)
- [ ] Set up performance monitoring
- [ ] Configure uptime monitoring
- [ ] Set up user session recording

## Build & Deploy

### Environment Configuration
- [ ] Set up production environment variables
- [ ] Configure Firebase for production
- [ ] Update API endpoints to production URLs
- [ ] Set proper CORS origins

### Build Process
```bash
# 1. Install dependencies
npm install

# 2. Run linter
npm run lint

# 3. Build for production
npm run build

# 4. Preview production build locally
npm run preview

# 5. Test production build thoroughly
```

### Deployment Platforms

#### Netlify (Recommended)
1. Connect GitHub repository
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Set environment variables in Netlify dashboard
5. Enable automatic deploys on push to main

#### Vercel
1. Import project from GitHub
2. Build command: `npm run build`
3. Output directory: `dist`
4. Set environment variables

#### Traditional Hosting
1. Build the project: `npm run build`
2. Upload `dist` folder contents to server
3. Configure server to serve `index.html` for all routes (SPA)
4. Set up SSL certificate

## Post-Deployment Tasks

### Testing
- [ ] Test all user flows
- [ ] Test authentication (sign up, sign in, sign out)
- [ ] Test favorites functionality
- [ ] Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test on mobile devices (iOS, Android)
- [ ] Test PWA installation
- [ ] Verify all images load correctly
- [ ] Test form submissions

### SEO & Indexing
- [ ] Verify robots.txt is accessible
- [ ] Verify sitemap.xml is accessible
- [ ] Submit site to Google Search Console
- [ ] Submit site to Bing Webmaster Tools
- [ ] Check site indexing status
- [ ] Set up Google My Business (if applicable)

### Performance Validation
- [ ] Run PageSpeed Insights (https://pagespeed.web.dev/)
- [ ] Run Lighthouse audit in Chrome DevTools
- [ ] Check Core Web Vitals in Search Console
- [ ] Monitor initial load time
- [ ] Monitor time to interactive

### Social Media
- [ ] Test Open Graph preview (Facebook Sharing Debugger)
- [ ] Test Twitter Card preview (Twitter Card Validator)
- [ ] Share on social platforms to verify previews

## Regular Maintenance

### Weekly
- [ ] Check error logs
- [ ] Review analytics for unusual patterns
- [ ] Check uptime status

### Monthly
- [ ] Review and update dependencies
- [ ] Check for security vulnerabilities (`npm audit`)
- [ ] Review performance metrics
- [ ] Update sitemap if needed
- [ ] Backup database

### Quarterly
- [ ] Full security audit
- [ ] Performance optimization review
- [ ] Accessibility audit
- [ ] SEO audit and optimization

## Optimization Commands

```bash
# Check bundle size
npm run build -- --report

# Analyze dependencies
npm ls

# Check for security issues
npm audit

# Fix security issues
npm audit fix

# Update dependencies
npm update

# Check outdated packages
npm outdated
```

## Performance Targets

### Loading Metrics
- First Contentful Paint (FCP): < 1.8s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.8s
- Total Blocking Time (TBT): < 200ms
- Cumulative Layout Shift (CLS): < 0.1

### Bundle Sizes
- Initial JS bundle: < 200KB (gzipped)
- Total JS: < 500KB (gzipped)
- CSS: < 50KB (gzipped)

### Lighthouse Scores
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 95
- SEO: > 95

## Troubleshooting

### Common Issues

**Blank page after deployment**
- Check console for errors
- Verify base path in vite.config.ts
- Ensure server is configured for SPA routing

**Fonts not loading**
- Check CORS headers
- Verify preconnect tags in index.html
- Check font URLs are correct

**Images not displaying**
- Verify image paths are correct
- Check image optimization settings
- Ensure images are in public folder

**PWA not installing**
- Check manifest.json is accessible
- Verify service worker is registered
- Check HTTPS is enabled

**Slow initial load**
- Review bundle size
- Check code splitting configuration
- Optimize images
- Review third-party scripts
