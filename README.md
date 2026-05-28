# 🚗 Parkez — Smart Parking Platform Prototype

A high-fidelity, real-time smart parking prototype designed for multi-tenant facilities (malls, hospitals, and commercial hubs). **Parkez** consists of two interconnected components: a **User Portal** for drivers to search, select, and view vacant spots, and a **Management Portal** for parking facility operations, analytics, and spot control.

Both applications feature premium dark/light mode themes, glassmorphism UI elements, micro-animations, dynamic canvas visualizers, and a simulated live IoT sensor telemetry network.

---

## 🌟 Key Features

### 1. 📱 User Portal (`Parkez user`)
*   **Dynamic Landing Canvas:** A custom HTML5 Canvas simulation showing vehicles entering, yielding, parking, and leaving with headlight beams and LED taillights.
*   **Location & Category Search:** Hub selection across cities (Bangalore active, others mocked) and facility categories (Shopping Malls, Hospitals).
*   **Asset Selector:** Filter and inspect specific active assets like Orion Mall, Mantri Square Mall, Manipal Hospital, or Fortis Hospital.
*   **Live Sensor Layout:** Interactive parking grid showing real-time slot status (Available, Occupied, EV Charging, Handicap).
*   **Simulated Voice Assistant:** A modern voice assistant toggle interface.

### 2. 🛡️ Management Portal (`Parkez management`)
*   **Secure Facility Sign-In:** Enter facility credentials (e.g., `orion`, `mantri`, `manipal`, `fortis`) to access custom dashboards.
*   **Real-time Sensor Grid:** Dynamic slot layouts corresponding to the selected facility.
*   **Mechanical Stacker Support:** Special layout renders for double-stacked mechanical parking bays (used in Mantri Square Mall).
*   **Live Spot Inspector:** Slide-out control panel displaying vehicle license plate, entry time, calculated parking duration, and long-stay alert warnings.
*   **Operational Controls:** Override slot states manually (🔒 *Mark as Reserved*, ⛔ *Block Spot*, ✅ *Release Spot*).
*   **Interactive Analytics:** Visualizes hourly traffic metrics (Cars In vs. Cars Out) on a dynamic bar chart, calculates live daily revenue, and lists currently parked vehicles with real-time search.
*   **Live Event Logger:** Terminal console streams live system events (e.g., entry, exit, system modifications) in real time.

---

## 🛠️ Technology Stack
*   **Frontend Core:** HTML5, CSS3 (Vanilla custom styling, CSS Custom Properties, Glassmorphism, animations).
*   **Logic Engine:** Pure JavaScript (ES6+, state controller architecture, Canvas API).
*   **Typography:** Google Fonts (*Outfit* and *Space Grotesk*).
*   **Server Host:** Lightweight Dev Server (`http-server` via npm).

---

## 📂 Project Structure

```text
Parkez/
├── Parkez user/          # User-facing platform portal
│   ├── index.html        # Main landing and application layout
│   ├── styles.css        # Premium custom styles and animations
│   ├── app.js            # User flow logic and Canvas vehicle simulation
│   └── package.json      # Configuration for dev server
│
├── Parkez management/    # Facility operator portal
│   ├── index.html        # Auth screen and manager dashboard layout
│   ├── styles.css        # Operator portal custom styling
│   └── app.js            # Operator logic, analytics chart, and state updater
│
├── .gitignore            # Git exclusion rules
└── README.md             # Project documentation
```

---

## 🚀 How to Run Locally

You can run each application independently using any static web server. 

### Method 1: Using Node/NPM (Recommended for `Parkez user`)
1. Open your terminal and navigate to the user directory:
   ```bash
   cd "Parkez user"
   ```
2. Install the dev dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:3000`.

### Method 2: Opening Directly in Browser
Since the applications are built with vanilla HTML/CSS/JS, you can open the `index.html` files directly in any modern browser:
*   **User Portal:** Double-click `Parkez user/index.html`
*   **Management Portal:** Double-click `Parkez management/index.html`

*Note: For the best experience (and to prevent CORS/security policies with modules/canvas on some browsers), running through a local server is recommended.*

---

## 🔑 Demo Credentials
To sign in to the **Management Portal** (`Parkez management`), use any of the following credentials matching the facility ID:

| Facility ID | Password | Facility Name |
| :--- | :--- | :--- |
| `orion` | `orion` | Orion Mall |
| `mantri` | `mantri` | Mantri Square Mall |
| `manipal` | `manipal` | Manipal Hospital |
| `fortis` | `fortis` | Fortis Hospital |

To sign in to the **User Portal** (`Parkez user`), use the default administrator credentials or click **Sign Up** to create a new sandbox account in `localStorage`:
*   **Username:** `ABC`
*   **Password:** `123`

---

## 📤 Pushing to GitHub

Follow these steps to initialize Git and upload this project to your GitHub account:

1. **Open your command line / terminal** (make sure Git is installed on your computer).
2. **Navigate to the root directory** of the project:
   ```bash
   cd /path/to/Parkez
   ```
3. **Initialize the Git repository**:
   ```bash
   git init
   ```
4. **Add all files** to the staging area:
   ```bash
   git add .
   ```
5. **Commit the files** with an initial message:
   ```bash
   git commit -m "initial commit: Parkez smart parking prototype"
   ```
6. **Create a new repository** on [GitHub](https://github.com/new). Do not initialize it with a README, `.gitignore`, or license.
7. **Link your local repository** to your remote GitHub repository:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
   ```
8. **Rename the default branch** to `main`:
   ```bash
   git branch -M main
   ```
9. **Push the code** to GitHub:
   ```bash
   git push -u origin main
   ```
