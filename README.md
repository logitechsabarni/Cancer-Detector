# OncoAI — Breast Cancer Detection & AI Doctor Assistant

OncoAI is a production-ready medical dashboard for AI-assisted mammogram screening and clinical guidance.

## Features
- 📊 **Intelligent Dashboard**: Patient management and screening overview.
- 🔬 **AI Screening**: Deep-learning powered mammogram analysis for classification (Benign/Malignant).
- 🔥 **Explainability**: AI intensity mapping (Grad-CAM) to visualize focus regions.
- 🧾 **Clinical Reports**: Automated BI-RADS scoring and detailed clinical guidance.
- 📊 **Visual Analytics**: Interactive data visualization of risk scores and patient distribution.
- 🧠 **AI Doctor Chat**: Specialized assistant for clinical Q&A and explanation of findings.

## Tech Stack
- **Frontend**: React, Tailwind CSS, Chart.js, Motion.
- **Backend**: Express (Node.js), Gemini 1.5 Pro (Vision & Chat).
- **AI Engine**: Google Gemini Multimodal APIs.

## Setup Instructions
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file and add your Gemini API Key:
   ```env
   GEMINI_API_KEY=your_key_here
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## Medical Disclaimer
This tool is for educational and screening assistance ONLY. It does not provide a definitive medical diagnosis. Always consult with a board-certified oncologist for professional medical advice.

The app of the link is:- https://ai.studio/apps/ef2642ed-a710-41bf-92bd-2acbf3e1cbca
