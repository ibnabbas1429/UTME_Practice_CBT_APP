# UTME CBT Examination System

A comprehensive desktop Computer-Based Test (CBT) examination system built with Electron, React, and TypeScript for conducting UTME (Unified Tertiary Matriculation Examination) style tests.

## Features

### For Students
- ✅ Secure exam environment (fullscreen mode, kiosk mode)
- ⏱️ Real-time countdown timer
- 🔄 Auto-save progress every 30 seconds
- ⭐ Mark questions for review
- 🧭 Visual question navigator
- 📊 Instant result with detailed breakdown
- 🔒 Offline-first (no internet required)

### For Administrators
- 📝 Question bank management
- 📋 Exam creation and configuration
- 📈 Results analytics
- 👥 User management
- 📊 Subject-wise performance tracking

## Technology Stack

- **Electron** - Desktop application framework
- **React** - UI library
- **TypeScript** - Type safety
- **Vite** - Fast build tool and dev server
- **SQLite (better-sqlite3)** - Local database
- **Electron Forge** - Build and packaging

## Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup Steps

1. Clone the repository:
```bash
git clone 
cd utme-cbt-system
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run make
```

## Project Structure

```
utme-cbt-system/
├── src/
│   ├── main/              # Electron main process
│   │   ├── index.ts       # Entry point
│   │   ├── preload.ts     # Preload script for IPC
│   │   └── ipc/           # IPC handlers and channels
│   ├── renderer/          # React frontend
│   │   └── src/
│   │       ├── components/ # React components
│   │       ├── context/    # React context providers
│   │       ├── hooks/      # Custom hooks
│   │       └── styles/     # CSS styles
│   ├── shared/            # Shared types and utilities
│   │   ├── types/         # TypeScript interfaces
│   │   └── constants/     # App constants
│   ├── database/          # SQLite database layer
│   │   ├── index.ts       # DB initialization
│   │   └── migrations/    # SQL migrations
│   └── services/          # Business logic
│       ├── AuthService.ts
│       ├── ExamService.ts
│       ├── QuestionService.ts
│       └── ResultService.ts
└── resources/             # Application icons
```

## Default Credentials

### Admin Account
- Username: `admin`
- Password: `admin123`

### Test Student Account
Create a new account using the registration form

## Database Schema

The application uses SQLite with the following main tables:

- **users** - User accounts (students and admins)
- **exams** - Exam configurations
- **questions** - Question bank with options and correct answers
- **exam_sessions** - Active and completed exam sessions
- **exam_results** - Final results with scores and analytics

## Development

### Run in development mode
```bash
npm run dev
```
This starts both the Electron main process and Vite dev server with hot reload.

### Type checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
npm run lint:fix
```

### Format code
```bash
npm run format
```

## Building

### Package application
```bash
npm run package
```

### Create distributables
```bash
npm run make
```

This creates installers for:
- Windows (Squirrel)
- macOS (ZIP)
- Linux (DEB, RPM)

## Security Features

1. **Context Isolation**: Enabled for security
2. **Node Integration**: Disabled in renderer
3. **Preload Script**: Safe IPC communication
4. **Exam Mode**: 
   - Fullscreen
   - Kiosk mode
   - Always on top
   - Keyboard shortcuts disabled

## API (IPC Channels)

### Authentication
- `auth:login` - User login
- `auth:register` - New user registration
- `auth:logout` - User logout

### Exam Operations
- `exam:get-all` - Get all available exams
- `exam:start` - Start an exam session
- `exam:submit` - Submit completed exam
- `exam:save-progress` - Auto-save answers

### Questions
- `question:get-by-exam` - Get questions for an exam
- `question:add` - Add new question (admin)
- `question:update` - Update question (admin)
- `question:delete` - Delete question (admin)

### Results
- `result:get` - Get user results
- `result:get-details` - Get detailed result

### System
- `system:exam-mode` - Enable/disable exam mode
- `system:check-updates` - Check for app updates

## Customization

### Add New Subjects
Edit `src/shared/constants/exam.constants.ts`:
```typescript
export const SUBJECTS = [
  'Mathematics',
  'English',
  'Physics',
  'Chemistry',
  'Biology',
  // Add more subjects
];
```

### Change Exam Duration
Modify exam configuration in the database or admin panel.

### Customize UI Theme
Edit `src/renderer/src/styles/globals.css`

## Troubleshooting

### Database Issues
Delete the database file and restart:
```bash
# On Windows
del %APPDATA%/utme-cbt-system/utme-cbt.db

# On macOS/Linux
rm ~/Library/Application Support/utme-cbt-system/utme-cbt.db
```

### Build Errors
Clear cache and reinstall:
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Create an issue on GitHub
- Email: support@example.com

## Roadmap

- [ ] Multiple language support
- [ ] Print result functionality
- [ ] Excel export for results
- [ ] Biometric authentication
- [ ] Network-based exam mode
- [ ] Video proctoring
- [ ] AI-based question generation
- [ ] Mobile app version

## Acknowledgments

- Electron team for the amazing framework
- React team for the UI library
- All contributors and testers