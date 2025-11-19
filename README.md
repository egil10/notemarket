# 🎓 NoteMarket

<div align="center">

**Norges største markedsplass for studiemateriale**

[🌐 Live Website](https://www.notemarket.no/) • [📚 Documentation](./docs/README.md) • [🎨 Design System](./DESIGN_SYSTEM.md)

*A modern, student-focused marketplace for buying and selling academic documents*

</div>

---

## 📖 About

NoteMarket is Norway's premier marketplace for study materials, connecting students who want to sell their academic work with those who need quality study resources. Built with a focus on trust, quality, and fair pricing, NoteMarket provides a seamless platform for the academic community.

### ✨ Key Features

- 🔍 **Advanced Search & Filtering** - Find documents by university, course code, tags, price range, page count, and year
- 📄 **Document Preview** - Preview pages before purchase with customizable preview limits
- ⭐ **Grade Verification** - Verified grade badges (A-F) with admin verification system
- 📊 **Statistics Dashboard** - Comprehensive analytics showing popular courses, universities, and documents
- 👤 **User Profiles** - Manage your documents, edit listings, and track your activity
- 💰 **Fair Pricing** - Transparent 85/15 revenue split (85% to seller, 15% to platform)
- 🌓 **Dark Mode** - Beautiful light and dark themes with smooth transitions
- 📱 **Fully Responsive** - Optimized for desktop, tablet, and mobile devices
- 🔒 **Secure Authentication** - Email/password authentication with Supabase Auth
- 📈 **View Tracking** - Real-time view counts for documents

---

## 🚀 Tech Stack

### Frontend
- **[Next.js 16](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **CSS Modules** - Scoped styling
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library
- **[next-themes](https://github.com/pacocoursey/next-themes)** - Theme switching

### Backend & Services
- **[Supabase](https://supabase.com/)** - Backend-as-a-Service
  - PostgreSQL database with Row Level Security (RLS)
  - Supabase Auth for authentication
  - Supabase Storage for PDF files
  - Real-time capabilities
- **[pdf-lib](https://pdf-lib.js.org/)** - PDF metadata extraction (page count, file size)

### Design
- **Swiss Academic Aesthetic** - Clean, minimalist design with sharp edges
- **Custom Design System** - Consistent color palette, typography, and spacing
- **Outfit & Inter Fonts** - Modern, readable typography

---

## 🏗️ Project Structure

```
notemarket/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Home page
│   │   ├── search/             # Document search & filtering
│   │   ├── sell/               # Document upload page
│   │   ├── document/[id]/      # Individual document page
│   │   ├── profile/            # User profile & document management
│   │   ├── statistikk/         # Statistics dashboard
│   │   ├── login/              # Authentication
│   │   └── api/                # API routes
│   ├── components/             # Reusable React components
│   │   ├── ui/                 # UI primitives (Button, Badge, etc.)
│   │   ├── Header.tsx          # Global header
│   │   ├── Footer.tsx          # Global footer
│   │   ├── DocumentCard.tsx    # Document preview card
│   │   └── ...
│   └── lib/                    # Utilities & helpers
│       ├── supabase.ts         # Supabase client
│       ├── universities.ts     # University data
│       └── courseCodes.ts     # Course code data
├── database/                   # SQL scripts for Supabase
│   ├── supabase_schema.sql     # Main database schema
│   ├── supabase_setup.sql      # Initial setup
│   └── storage_policies/       # Storage bucket policies
├── docs/                       # Project documentation
│   ├── product-architecture.md
│   ├── data-model.md
│   ├── design-language.md
│   └── grade-verification.md
├── public/                     # Static assets
│   └── logos/                  # Brand assets
└── DESIGN_SYSTEM.md            # Design system reference
```

---

## 🛠️ Getting Started

### Prerequisites

- **Node.js** 18+ and npm/yarn/pnpm
- **Supabase Account** - [Sign up here](https://supabase.com/)
- **Git** - For version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/egil10/notemarket.git
   cd notemarket
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Set up Supabase Database**
   
   Run the SQL scripts in the `database/` folder in order:
   ```bash
   # 1. Initial setup
   database/supabase_setup.sql
   
   # 2. Main schema
   database/supabase_schema.sql
   
   # 3. Additional features
   database/add_tags.sql
   database/add_grade_system.sql
   database/add_preview_settings.sql
   database/add_document_stats.sql
   database/add_view_triggers.sql
   
   # 4. Storage policies
   database/storage_policies/supabase_storage_fix.sql
   database/supabase_avatars.sql
   ```
   
   See [`database/README.md`](./database/README.md) for detailed instructions.

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](./docs/) folder:

- **[Product Architecture](./docs/product-architecture.md)** - System overview, tech stack, and request flows
- **[Data Model](./docs/data-model.md)** - Database schema, tables, and storage structure
- **[Design Language](./docs/design-language.md)** - Visual identity, typography, and UI conventions
- **[Grade Verification](./docs/grade-verification.md)** - Admin guide for verifying document grades
- **[Design System](./DESIGN_SYSTEM.md)** - Complete design system reference

---

## 🎨 Design Philosophy

NoteMarket uses a **Swiss Academic** design aesthetic:

- ✂️ **Sharp, clean edges** - Minimal border radius for a structured feel
- 🎯 **Bold shadows** - Hard shadows (`4px 4px 0px`) for depth and interaction feedback
- 🎨 **Academic color palette** - Deep forest green (#1a4731) and burnt orange (#d94e28)
- 📐 **Grid-based layouts** - Structured, organized content presentation
- 🔤 **High contrast typography** - Outfit for headings, Inter for body text

See [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) for complete design guidelines.

---

## 🔐 Authentication & Security

- **Email/Password Authentication** via Supabase Auth
- **Row Level Security (RLS)** - Database-level access control
- **Secure File Storage** - PDFs stored in Supabase Storage with signed URLs
- **Service Role Key** - Used only server-side for admin operations

---

## 📊 Key Features Explained

### Document Management
- Upload PDFs with automatic metadata extraction (page count, file size)
- Set preview page limits (how many pages buyers can see)
- Edit and delete your own documents
- Grade verification system with admin review

### Search & Discovery
- Filter by university, course code, tags, price, pages, and year
- Searchable filter dropdowns with autocomplete
- Sort by newest, oldest, price (low/high)
- View active filters as removable chips

### Statistics Dashboard
- Total documents, average price, unique courses
- Top 5 most popular courses (all time)
- Top 5 most popular universities (this month)
- Top 6 most viewed documents
- Historical chart showing documents per year by university/course

### User Experience
- Dark mode with smooth theme transitions
- Responsive design for all screen sizes
- Toast notifications for user feedback
- Loading states and error handling
- Accessible UI with proper ARIA labels

---

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add your environment variables
4. Deploy!

The site will automatically deploy on every push to your main branch.

### Environment Variables for Production

Make sure to set these in your Vercel project settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** following the design system and code style
4. **Commit your changes** (`git commit -m 'Add amazing feature'`)
5. **Push to the branch** (`git push origin feature/amazing-feature`)
6. **Open a Pull Request**

### Code Style

- Use TypeScript for all new code
- Follow the existing component structure
- Adhere to the design system in [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md)
- Write clear, descriptive commit messages

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 🔗 Links

- **🌐 Live Website**: [https://www.notemarket.no/](https://www.notemarket.no/)
- **📦 GitHub Repository**: [https://github.com/egil10/notemarket](https://github.com/egil10/notemarket)
- **📧 Contact**: [notemarket.no@gmail.com](mailto:notemarket.no@gmail.com)

---

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/) and [Supabase](https://supabase.com/)
- Icons by [Lucide](https://lucide.dev/)
- Fonts: [Outfit](https://fonts.google.com/specimen/Outfit) and [Inter](https://fonts.google.com/specimen/Inter)

---

<div align="center">

**Made with ❤️ for Norwegian students**

[⬆ Back to Top](#-notemarket)

</div>
