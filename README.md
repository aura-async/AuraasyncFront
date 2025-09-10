# Auraasync Frontend

Next.js 13 frontend application for Auraasync fashion analysis platform.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will start on `http://localhost:3000`

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── app/                  # Next.js 13 app directory
│   │   ├── (auth)/          # Authentication routes
│   │   │   ├── login/       # Login page
│   │   │   └── signup/      # Signup page
│   │   ├── analysis/        # Analysis pages
│   │   │   ├── body/        # Body type analysis
│   │   │   ├── face/        # Face shape analysis
│   │   │   ├── personality/ # Personality analysis
│   │   │   ├── skin-tone/   # Skin tone analysis
│   │   │   └── flow/        # Analysis workflow
│   │   ├── about/           # About page
│   │   ├── faq/             # FAQ page
│   │   ├── globals.css      # Global styles
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Home page
│   ├── components/           # Reusable components
│   │   ├── Navbar.tsx       # Navigation component
│   │   ├── Footer.tsx       # Footer component
│   │   ├── BodyAnalysisWidget.tsx
│   │   ├── FaceAnalysisWidget.tsx
│   │   ├── SkinToneAnalysisWidget.tsx
│   │   ├── PersonalityAnalysisWidget.tsx
│   │   └── InteractiveCards.tsx
│   └── pages/               # API routes
├── public/                   # Static assets
├── package.json             # Node.js dependencies
├── tailwind.config.js       # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
└── next.config.js           # Next.js configuration
```

## 🎨 Features

### Core Functionality
- **Multi-step Analysis Flow**: Guided analysis process
- **Real-time Analysis**: Instant results with visual feedback
- **Image Upload**: Support for file uploads and webcam capture
- **Responsive Design**: Mobile-first approach
- **Interactive Components**: Modern UI with animations

### Analysis Components
- **Body Type Analysis**: AI-powered body shape detection
- **Face Shape Analysis**: Facial structure classification
- **Skin Tone Analysis**: Automated color classification
- **Personality Analysis**: MBTI-based assessment
- **Recommendations**: Personalized fashion suggestions

### User Experience
- **Authentication**: User login and signup
- **Progress Tracking**: Save and resume analysis
- **Results History**: View previous analyses
- **Product Recommendations**: Filtered fashion suggestions

## 🛠️ Technology Stack

- **Framework**: Next.js 13 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React hooks and context
- **Image Processing**: React Webcam integration
- **Charts**: Chart.js with react-chartjs-2
- **Icons**: React Icons

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Environment Variables
Create a `.env.local` file in the frontend directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=Auraasync
```

## Gemini API setup

1. Create `AuraasyncFront/.env.local` with:

```
GOOGLE_API_KEY=YOUR_GEMINI_API_KEY
```

2. Never commit real keys. If a key was shared publicly, rotate it in Google AI Studio.

3. The server route is available at `src/app/api/gemini/route.ts`. The onboarding flow posts captured images there.

## 📱 Responsive Design

The application is designed to work seamlessly across all devices:
- **Mobile**: Optimized for mobile-first experience
- **Tablet**: Adaptive layouts for medium screens
- **Desktop**: Full-featured desktop experience

## 🎯 Key Components

### Analysis Widgets
- **BodyAnalysisWidget**: Handles body type analysis
- **FaceAnalysisWidget**: Manages face shape analysis
- **SkinToneAnalysisWidget**: Processes skin tone detection
- **PersonalityAnalysisWidget**: Conducts personality assessment

### Navigation
- **Navbar**: Main navigation with responsive menu
- **Footer**: Site information and links
- **InteractiveCards**: Feature showcase cards

## 🔌 API Integration

The frontend communicates with the FastAPI backend:
- **Base URL**: Configurable via environment variables
- **Endpoints**: RESTful API calls for all analysis features
- **File Upload**: Multipart form data for image analysis
- **Error Handling**: Comprehensive error handling and user feedback

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm run start
```

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Netlify
```bash
# Build the project
npm run build

# Deploy the out directory
```

## 🧪 Testing

### Component Testing
```bash
# Run component tests
npm test

# Run tests in watch mode
npm test -- --watch
```

### E2E Testing
```bash
# Run end-to-end tests
npm run test:e2e
```

## 🔍 Troubleshooting

### Common Issues
1. **Build errors**: Check TypeScript compilation
2. **API connection**: Verify backend is running
3. **Image upload**: Check file size and format
4. **Styling issues**: Verify Tailwind CSS configuration

### Development Tips
- Use Next.js dev tools for debugging
- Check browser console for errors
- Verify API endpoints are accessible
- Test responsive design on different screen sizes

## 📚 Documentation

- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)
- **Tailwind CSS**: [tailwindcss.com/docs](https://tailwindcss.com/docs)
- **TypeScript**: [typescriptlang.org/docs](https://typescriptlang.org/docs)

## 🤝 Contributing

1. Follow the existing code style
2. Add TypeScript types for new features
3. Ensure responsive design compatibility
4. Test on multiple devices and browsers
5. Update documentation for new features 