# Tiffin Tracker Pro

Tiffin Tracker Pro is a mobile-first, serverless React application designed to help users efficiently manage and track their daily tiffin (meal) orders. It features a premium SaaS aesthetic and stores all data securely within the browser's local storage.

## Features

- **Mobile-First Design**: A highly responsive, ultra-compact UI optimized specifically for mobile devices down to 320px width, while scaling beautifully to desktop screens.
- **Premium SaaS Aesthetic**: Built with a sleek `zinc` color palette, sophisticated blur effects, and modern typography (Plus Jakarta Sans) using Tailwind CSS.
- **Excel-Like Worksheets**: Create separate sheets for different months. Each sheet allows you to track Morning, Night, and Total tiffins along with custom notes per day.
- **Automated Calculations**: Instantly computes the total payable amount based on user-defined dynamic pricing per tiffin unit.
- **Local Authentication**: Simple, lightweight password authentication that secures your data locally. Sessions persist for 15 days automatically.
- **Offline & Serverless**: Works 100% locally. No backend or database is required, maximizing speed and privacy.
- **Cross-Device Sync**: Need to move to another phone? Use the "Sync" feature to copy your entire database as an encrypted text string and paste it into any other device.
- **Comprehensive Reporting**: Generates beautiful, aggregated reports spanning all active worksheets to summarize grand totals instantly.

## Tech Stack

- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Fonts**: [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans)
- **Data Persistence**: HTML5 `localStorage`

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn

### Installation

1. Clone the repository and navigate into the `frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open the provided `localhost` URL in your browser to start tracking your tiffins!

## Usage Guide

1. **Login/Register**: Enter your name and a password on the login screen. This account is created locally on your current device.
2. **Create a Sheet**: Click the `+` icon on the dashboard to create a sheet for the current month.
3. **Log Records**: Add rows to the spreadsheet, picking the date, specifying how many tiffins arrived (Morning/Night), and adding any necessary notes. The exact day of the week is computed automatically.
4. **Calculate Price**: In the calculation section, enter the "Price per Tiffin" to see exactly how much you owe for the active month.
5. **View Report**: Tap the Bar Chart icon to open the Report Modal, which provides a bird's-eye view of all your aggregated totals.
6. **Sync Devices**: Tap the Copy icon to export your data. Paste the resulting code into the "Import data from another device" section on a different phone or PC.

## License

This project is licensed under the MIT License.
