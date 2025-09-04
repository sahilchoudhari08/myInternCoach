# myInternCoach

Your personal coach for internship success! A modern, full-stack web application to help you manage and track your internship applications. Built with Node.js, Express, HTML, CSS (TailwindCSS), and JavaScript, this app provides a clean, responsive UI, dark/light mode, and insightful analytics to keep your job search organized and motivating.

## 🚀 Features

### Core Functionality
- **Add, edit, and delete internship applications** with comprehensive form validation
- **Track company, role, platform, location, status, date applied, and notes**
- **Color-coded status labels** (Applied, Interview, Offer, Rejected)
- **Real-time search functionality** across all application fields
- **Responsive UI** with both **dark mode** and **light mode** (toggle in settings)

### Analytics Dashboard
- **Application status distribution** (interactive doughnut chart)
- **Applications over time** (bar chart with trend analysis)
- **Monthly application summary** with improved visibility in both themes
- **Success rate by platform** with detailed breakdowns
- **Progress tracking bars** showing application pipeline status
- **Key metrics**: Total applications, interview rate, offer rate, average response time

### Data Management
- **Export data to CSV** with timestamped filenames
- **Export data to JSON** for backup and data portability
- **Import data from JSON** files for easy data restoration
- **Automatic backup reminders** (weekly notifications)
- **Clear all data** with confirmation dialog
- **Local data storage** in JSON file (no external database required)

### User Experience
- **Keyboard shortcuts** for power users:
  - `⌘K` - Focus search
  - `⌘N` - New application
  - `⌘S` - Open settings
  - `Esc` - Close modals
- **Toast notifications** for user feedback
- **Smooth animations** and transitions
- **Accessible design** with proper ARIA labels
- **Mobile-responsive** layout

### Advanced Features
- **Tabbed interface** (Dashboard, Applications, Analytics)
- **Form validation** with real-time feedback
- **Status update functionality** with inline editing
- **Theme persistence** across browser sessions
- **Data filtering** and search capabilities

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Frontend:** HTML5, CSS3 (TailwindCSS), Vanilla JavaScript (ES6+)
- **Charts:** Chart.js for data visualization
- **Data Storage:** Local JSON file (`data/internships.json`)
- **Styling:** TailwindCSS with custom CSS for advanced features
- **Icons:** Heroicons (SVG-based icon system)

## 📁 Project Structure

```
.
├── data/
│   └── internships.json         # Local data storage for applications
├── public/
│   ├── app.js                  # Main frontend logic (handles all UI and API)
│   ├── index.html              # Main dashboard and single-page app entry
│   └── styles.css              # Custom and theme styles
├── server.js                   # Express backend API and static file server
├── package.json                # Project dependencies and scripts
├── package-lock.json           # Dependency lock file
└── README.md                   # This file
```

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- npm (comes with Node.js)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd <your-repo-directory>
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Open your browser:**
   Visit [http://localhost:3000](http://localhost:3000)

### Development Mode

For development with auto-reload:
```bash
npm run dev
```

## 📖 Usage

### Adding Applications
- Use the form in the Dashboard or Applications tab to add new internship applications
- All fields are validated in real-time
- Applications are automatically saved and displayed

### Managing Applications
- View, update, or delete applications in the "Your Applications" section
- Update application status with inline controls
- Search and filter applications using the search bar

### Analytics & Insights
- Monitor your application progress with visual charts
- Track success rates and trends over time
- Use progress bars to visualize your application pipeline

### Data Management
- Export your data to CSV or JSON formats
- Import data from JSON files for backup restoration
- Clear all data when needed (with confirmation)

### Customization
- Toggle between dark and light mode in the settings modal
- Use keyboard shortcuts for faster navigation
- Access settings via the gear icon in the top right

## 🔌 API Overview

The app exposes a RESTful API at `/api/internships`:

- `GET /api/internships` — List all applications
- `POST /api/internships` — Add a new application
- `PATCH /api/internships/:id` — Update an application status or details
- `DELETE /api/internships/:id` — Delete an application
- `DELETE /api/internships` — Clear all applications

Data is stored locally in `data/internships.json` with automatic file creation.

## 🎨 Design Features

- **Modern UI/UX** with clean, professional design
- **Responsive layout** that works on all device sizes
- **Smooth animations** and micro-interactions
- **Accessibility-focused** with proper contrast and keyboard navigation
- **Theme-aware charts** that adapt to light/dark mode
- **Professional color scheme** with consistent visual hierarchy

## 🔒 Data Security & Privacy

- **Local storage only** - your data never leaves your device
- **No external dependencies** for data storage
- **Automatic backup reminders** to prevent data loss
- **Export functionality** for data portability
- **Clear data option** for complete privacy control

## 🚀 Deployment

This application can be easily deployed to various platforms:

- **Heroku** - Add a Procfile and deploy
- **Vercel** - Deploy as a static site with serverless functions
- **Netlify** - Deploy with form handling
- **AWS/GCP** - Deploy to cloud platforms
- **Docker** - Containerize the application

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Sahil Choudhari** - Full-stack developer passionate about creating useful applications

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by the need for better job application tracking
- Designed with user experience and accessibility in mind

---

**Note:** myInternCoach is a production-ready application that demonstrates modern full-stack development practices, responsive design, and user experience best practices. Perfect for portfolios and showcasing development skills!
