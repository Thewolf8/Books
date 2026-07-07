# Readling Library

A fully offline-first, highly customizable personal library and PDF reader app built with React Native. Supports physical book tracking, PDF reading with highlights and annotations, a global snippet vault, and extensive UI customization.

## Features

### Library Management
- **Dual book types**: Track both physical books and digital PDFs
- **Custom cover images**: Use device camera or gallery for book covers
- **Search & filter**: Search by title/author, filter by type, sort by various criteria
- **Reading progress**: Track current page and completion percentage
- **Star ratings**: Rate books from 1-5 stars

### Review & Tagging
- **Summary & Review**: Write detailed summaries and reviews for each book
- **Tag system**: Built-in tags (Liked, Disliked, No Comment) + custom tags with colors
- **Book tagging**: Assign multiple tags to any book

### PDF Reader
- **Native PDF rendering**: Fast, smooth PDF viewing via `react-native-pdf`
- **Text highlighting**: Select and highlight text with customizable colors
- **Linked notes**: Attach comments/notes to highlighted passages
- **Page memory**: Automatically saves and restores last read page
- **Highlight overlays**: Visual highlight indicators on PDF pages
- **Highlight management**: View, edit, and delete highlights per page

### Global Snippet Vault
- **All highlights in one place**: View every highlight across all books
- **Search**: Full-text search across highlight text, notes, and book titles
- **Filter by book**: Narrow down to specific books
- **Sort options**: Sort by date, book title, or page number (asc/desc)
- **Copy to clipboard**: Quick copy any highlighted text

### Customization & i18n
- **3 Languages**: English, Arabic (with full RTL support), and French
- **3 Theme modes**: Light, Dark, and System Default
- **Custom colors**: Manually set page background, text color, and highlight color
- **Typography**: Language-specific font selection (separate fonts for English, Arabic, French)
- **RTL support**: Automatic RTL layout when Arabic is selected

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native 0.75 (Bare Workflow) |
| Language | TypeScript |
| Navigation | React Navigation v6 (Native Stack + Bottom Tabs) |
| State Management | Zustand |
| Database | SQLite via `@op-engineering/op-sqlite` |
| i18n | react-i18next |
| PDF Rendering | react-native-pdf |
| Image Picker | react-native-image-picker |
| File Picker | react-native-document-picker |
| File System | react-native-fs |
| Icons | react-native-vector-icons (Ionicons) |

## Project Structure

```
readling-library-app/
├── src/
│   ├── types/                    # TypeScript type definitions
│   │   └── index.ts
│   ├── database/                 # SQLite database layer
│   │   ├── connection.ts         # DB connection & query executor
│   │   ├── schema.ts             # Table definitions & seed data
│   │   ├── init.ts               # Database initialization
│   │   └── repositories/         # CRUD operations per entity
│   │       ├── BookRepository.ts
│   │       ├── TagRepository.ts
│   │       ├── HighlightRepository.ts
│   │       └── SettingRepository.ts
│   ├── i18n/                     # Internationalization
│   │   ├── index.ts              # i18next configuration
│   │   ├── en.json               # English translations
│   │   ├── ar.json               # Arabic translations (RTL)
│   │   └── fr.json               # French translations
│   ├── theme/                    # Theming system
│   │   ├── colors.ts             # Light/Dark color definitions
│   │   ├── fonts.ts              # Font configuration per language
│   │   └── ThemeProvider.tsx     # React context for theme
│   ├── store/                    # Zustand global state
│   │   ├── appStore.ts           # Theme, language, settings
│   │   ├── libraryStore.ts       # Books, tags, filters
│   │   ├── readerStore.ts        # Reading session state
│   │   └── vaultStore.ts         # Highlights, vault filters
│   ├── navigation/               # React Navigation setup
│   │   └── AppNavigator.tsx      # Stack + Tab navigators
│   ├── screens/                  # Main screens
│   │   ├── LibraryScreen.tsx     # Book grid & filters
│   │   ├── AddBookScreen.tsx     # Add/edit book form
│   │   ├── BookDetailScreen.tsx  # Book info & actions
│   │   ├── ReaderScreen.tsx      # PDF reader + highlights
│   │   ├── VaultScreen.tsx       # All highlights view
│   │   └── SettingsScreen.tsx    # Language, theme, fonts, colors
│   ├── hooks/                    # Reusable hooks
│   │   ├── useDatabase.ts
│   │   ├── useBooks.ts
│   │   ├── useHighlights.ts
│   │   └── useSettings.ts
│   └── utils/                    # Helper functions
│       ├── rtlUtils.ts           # RTL helpers
│       ├── fileHelpers.ts        # File operations
│       └── validators.ts         # Form validation
├── android/                      # Android native files
├── ios/                          # iOS native files
├── .github/workflows/            # CI/CD pipelines
│   └── build-android.yml         # GitHub Actions APK build
├── App.tsx                       # App entry point
├── package.json
├── tsconfig.json
└── babel.config.js
```

## Database Schema

### Books Table
```sql
CREATE TABLE books (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT,
  cover_image_path TEXT,
  type TEXT CHECK(type IN ('physical', 'digital')),
  file_path TEXT,
  total_pages INTEGER,
  current_page INTEGER DEFAULT 0,
  summary TEXT,
  review TEXT,
  rating INTEGER DEFAULT 0,
  created_at INTEGER,
  updated_at INTEGER,
  last_read_at INTEGER
);
```

### Tags Table
```sql
CREATE TABLE tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#6366f1',
  category TEXT DEFAULT 'custom',
  created_at INTEGER
);
```

### Book-Tags Junction
```sql
CREATE TABLE book_tags (
  book_id TEXT REFERENCES books(id) ON DELETE CASCADE,
  tag_id TEXT REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (book_id, tag_id)
);
```

### Highlights Table
```sql
CREATE TABLE highlights (
  id TEXT PRIMARY KEY,
  book_id TEXT REFERENCES books(id) ON DELETE CASCADE,
  page_number INTEGER,
  selected_text TEXT,
  comment TEXT,
  color TEXT,
  x1, y1, x2, y2 REAL,  -- Normalized coordinates (0-100%)
  created_at INTEGER,
  updated_at INTEGER
);
```

### Settings Table
```sql
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT
);
```

## Getting Started

### Prerequisites
- Node.js >= 18
- JDK 17
- Android Studio (for Android builds)
- Xcode 15+ (for iOS builds)
- CocoaPods (for iOS)

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd readling-library-app
   npm install
   ```

2. **Install iOS dependencies** (macOS only)
   ```bash
   cd ios && pod install && cd ..
   ```

3. **Run on Android**
   ```bash
   npx react-native run-android
   ```

4. **Run on iOS** (macOS only)
   ```bash
   npx react-native run-ios
   ```

### Building Release APK

```bash
cd android
./gradlew assembleRelease
```

The APK will be at `android/app/build/outputs/apk/release/app-release.apk`.

## CI/CD with GitHub Actions

The repository includes a GitHub Actions workflow (`.github/workflows/build-android.yml`) that:

1. **Runs on every push** to `main` or `develop`
2. **Type checks** the TypeScript code
3. **Lints** with ESLint
4. **Runs tests** with coverage
5. **Builds** the debug APK automatically
6. **Supports manual release builds** via `workflow_dispatch`

### Required GitHub Secrets (for release builds)

| Secret | Description |
|--------|-------------|
| `ANDROID_KEYSTORE_BASE64` | Base64-encoded keystore file |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore password |
| `ANDROID_KEY_ALIAS` | Key alias |
| `ANDROID_KEY_PASSWORD` | Key password |

## Adding Custom Fonts

1. Place `.ttf` font files in `android/app/src/main/assets/fonts/` (Android)
   and `ios/ReadlingLibrary/Fonts/` (iOS)
2. Add font name to `FONT_OPTIONS` or `ARABIC_FONTS` in `src/theme/fonts.ts`
3. Rebuild the app

## Architecture Decisions

### Why Zustand over Redux/MobX?
- Minimal boilerplate
- Excellent TypeScript support
- No provider wrapper needed
- Perfect for medium-complexity apps

### Why `@op-engineering/op-sqlite`?
- Fastest SQLite bindings for React Native
- Direct synchronous API
- Excellent for offline-first apps
- No async/await complexity for reads

### Why Bare Workflow over Expo?
- Direct access to native modules
- Required for `op-sqlite` and `react-native-pdf`
- Smaller app size
- Better for CI/CD automation

## License

MIT License - feel free to use this project for personal or commercial purposes.
