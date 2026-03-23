<div align="center">
  <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="SED Platform" width="100%"/>
  <h1 style="margin-top: 20px;">Scholastic Edu. Depot (SED)</h1>
  <p><strong>Bridging the gap between academic learning and industry requirements with a modern, scalable EdTech platform.</strong></p>
  
  <p>
    <a href="https://sed-platform.onrender.com"><strong>View Live Demo »</strong></a>
    <br/>
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-key-features">Key Features</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-contributing">Contributing</a>
  </p>

  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)](https://nodejs.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwind-css)](https://tailwindcss.com/)
</div>

---

## 🌟 Overview

**SED (Scholastic Edu. Depot)** is a comprehensive, high-performance EdTech platform designed to transform the learning experience. It connects students, instructors, and administrators through a unified interface, offering personalized learning paths, real-time analytics, and seamless course management.

Built by **Venu Thota**, this platform prioritizes scalability, security, and user experience.

## ✨ Key Features

### 🎓 For Students
- **Personalized Dashboard:** Track course progress, upcoming assignments, and grades.
- **Interactive Learning:** Access video lectures, quizzes, and coding exercises.
- **Secure Authentication:** Easy login via Google OAuth or Email/Password.
- **Responsive Design:** Optimized for mobile, tablet, and desktop learning.

### 👨‍🏫 For Instructors
- **Course Management:** Create and update courses with rich media support.
- **Student Analytics:** Monitor enrollment stats and student performance.
- **Profile Management:** Customize instructor profiles and credentials.

### 🛡️ For Administrators
- **Platform Analytics:** Real-time insights into revenue, traffic, and user growth.
- **User Management:** Control access and permissions for all users.
- **System Settings:** Configure platform-wide variables and notifications.

## 🏗️ Tech Stack

### Frontend
- **Framework:** [React 18](https://reactjs.org/) with [Vite](https://vitejs.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) + [PostCSS](https://postcss.org/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **HTTP Client:** [Axios](https://axios-http.com/)

### Backend
- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** [Express.js](https://expressjs.com/)
- **Database:** [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Security:** Helmet, CORS, CSURF, Express Rate Limit
- **Auth:** JWT (JSON Web Tokens) & Google OAuth
- **Validation:** Express Validator

### DevOps & Deployment
- **Hosting:** [Render](https://render.com/) (Web Service)
- **Version Control:** Git & GitHub

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas URI)
- Git

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/SamppurnaTH/SED.git
    cd SED
    ```

2.  **Install Backend Dependencies**
    ```bash
    cd backend
    npm install
    ```

3.  **Install Frontend Dependencies**
    ```bash
    cd ../client
    npm install
    ```

### Configuration

1.  **Backend Environment**
    Create a `.env` file in the `backend` directory:
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret_key
    CLIENT_URL=http://localhost:5173
    # Optional: AWS, Google Auth, etc.
    ```

2.  **Frontend Environment**
    Create a `.env` file in the `client` directory:
    ```env
    VITE_API_BASE_URL=http://localhost:5000/api
    VITE_GOOGLE_CLIENT_ID=your_google_client_id
    ```

### Running the App

1.  **Start Backend**
    ```bash
    cd backend
    npm run dev
    ```

2.  **Start Frontend**
    ```bash
    cd client
    npm run dev
    ```

VISIT `http://localhost:5173` to view the application.

## 📦 Deployment

The project is configured for deployment on **Render**.

1.  **Build Command:** `cd client && npm install --include=dev && npm run build ; cd ../backend ; npm install`
2.  **Start Command:** `cd backend ; node server.js`
3.  **Environment Variables:** Ensure all secrets (`MONGO_URI`, `JWT_SECRET`, etc.) are set in the Render Dashboard.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 👤 Author

**Venu Thota**

- GitHub: [@SamppurnaTH](https://github.com/SamppurnaTH)
- Email: venuthota722@gmail.com

---

<div align="center">
  Made with ❤️ by Venu Thota for the Future of Education.
</div>
