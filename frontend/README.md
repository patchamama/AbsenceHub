# AbsenceHub Frontend

React + Vite based frontend for Employee Absence Management System.

## Prerequisites

- Node.js 18+
- npm

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your API URL if needed
```

## Running the Application

### Development Server

```bash
npm run dev
```

Server will be available at `http://localhost:5173`

The Vite dev server includes a proxy to the backend API at `http://localhost:5000`.

### Build for Production

```bash
npm run build
```

Output files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Testing

### Run Tests

```bash
npm test
```

### Run Tests with UI

```bash
npm run test:ui
```

### Generate Coverage Report

```bash
npm run test:coverage
```

## Code Quality

### Check Code Style with ESLint

```bash
npm run lint
```

### Fix Code Style Issues

```bash
npm run lint:fix
```

### Format Code with Prettier

```bash
npm run format
```

## Project Structure

```
frontend/
├── src/
│   ├── components/              # React components
│   │   ├── __tests__/          # Component tests
│   │   ├── AbsenceForm.jsx     # Form for creating/editing
│   │   ├── AbsenceList.jsx     # List display
│   │   └── AbsenceFilters.jsx  # Filter controls
│   ├── shared/                  # Shared components
│   │   └── components/
│   │       └── FormField.jsx    # Reusable form field
│   ├── services/                # API integration
│   │   └── absenceApi.js       # API client
│   ├── utils/                   # Utilities
│   │   ├── validators.js       # Form validators
│   │   └── i18n.js            # Internationalization
│   ├── App.jsx                  # Main app component
│   ├── App.css                  # App styles
│   ├── main.jsx                 # React entry point
│   ├── index.css                # Global styles
│   └── setup.test.js            # Test configuration
├── public/                       # Static assets
├── index.html                    # HTML template
├── vite.config.js               # Vite configuration
├── vitest.config.js             # Vitest configuration
├── tailwind.config.js           # Tailwind CSS config
├── postcss.config.js            # PostCSS configuration
├── .eslintrc.json               # ESLint configuration
├── .prettierrc                   # Prettier configuration
├── package.json                 # Dependencies
├── .env.example                 # Environment template
└── README.md                     # This file
```

## Features

### State Management
- React `useState` for component state
- Context API ready for future global state

### API Integration
- Axios for HTTP requests
- Automatic error handling
- Type-safe request/response handling

### Validation
- Client-side form validation
- Server-side validation integration
- User-friendly error messages

### Internationalization (i18n)
- English and German translations
- Language preference saved to localStorage
- Easy to add more languages

### Styling
- Tailwind CSS for utility-first styling
- Responsive design
- Dark mode ready

### Testing
- Vitest for unit and integration tests
- React Testing Library for component tests
- Coverage reporting

### Accessibility
- Semantic HTML
- ARIA labels where needed
- Keyboard navigation support
- Color contrast compliance (WCAG AA)

## API Endpoints

The frontend communicates with the backend API at:
- **Development**: `http://localhost:5000/api`
- **Production**: Configurable via `VITE_API_URL` environment variable

### Available Endpoints

```javascript
// Absence operations
getAllAbsences(filters)     // GET /absences
getAbsenceById(id)         // GET /absences/:id
createAbsence(data)        // POST /absences
updateAbsence(id, data)    // PUT /absences/:id
deleteAbsence(id)          // DELETE /absences/:id

// Metadata
getAbsenceTypes()          // GET /absence-types
getStatistics()            // GET /statistics

// Health check
healthCheck()              // GET /api/health
```

## Development Workflow

### Create a New Component

1. Create component file: `src/components/MyComponent.jsx`
2. Create test file: `src/components/__tests__/MyComponent.test.jsx`
3. Write tests first (TDD)
4. Implement component
5. Test manually in browser

### Adding a New Translation

1. Edit `src/utils/i18n.js`
2. Add keys to both `en` and `de` translation objects
3. Use `t('key')` function in components

### Adding a New Utility

1. Create file in `src/utils/`
2. Write unit tests
3. Export from `src/utils/index.js` (if creating one)
4. Import and use in components

## Environment Variables

```
VITE_API_URL          # Backend API URL (default: http://localhost:5000/api)
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Code splitting enabled
- Lazy loading ready
- Image optimization ready
- CSS minification in production

## Accessibility Features

✅ Keyboard navigation
✅ Screen reader support
✅ Focus indicators
✅ ARIA labels
✅ Color contrast compliance
✅ Semantic HTML

## Security

- XSS prevention via React's built-in escaping
- CSRF protection via API (backend)
- Input validation before sending to API
- No sensitive data in localStorage (except language preference)
- Environment variables for API URL (not hardcoded)

## Troubleshooting

### Port Already in Use

```bash
# Kill process using port 5173
lsof -ti:5173 | xargs kill -9
```

### API Connection Issues

1. Make sure backend is running on `http://localhost:5000`
2. Check `VITE_API_URL` in `.env`
3. Check browser console for CORS errors
4. Verify backend CORS configuration

### Tests Not Running

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm test
```

### Build Errors

```bash
# Clean and rebuild
rm -rf dist node_modules package-lock.json
npm install
npm run build
```

## Docker Support

Build Docker image:

```bash
docker build -t absencehub-frontend .
```

Run in Docker:

```bash
docker run -p 3000:3000 absencehub-frontend
```

## Contributing

- Follow the code style (ESLint + Prettier)
- Write tests for new features
- Ensure accessibility standards (WCAG AA)
- Use semantic HTML
- Keep components small and focused
- Document complex logic with comments

## Performance Tips

- Use React DevTools Profiler for optimization
- Check for unnecessary re-renders
- Lazy load components when possible
- Use useCallback and useMemo wisely
- Split large components into smaller ones
- Monitor bundle size with `npm run build`

## License

MIT
