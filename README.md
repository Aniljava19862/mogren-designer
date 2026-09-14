# MOGREN Custom Apparel Designer

MOGREN is a custom apparel design platform that allows users to personalize garments such as T-shirts, polos, hoodies, and other apparel using a visual design editor.

The application includes a 2D design canvas with front, back, left, and right views, along with 3D preview support for selected garment types.

---

## Features

- Custom T-shirt and apparel designer
- Front, Back, Left, and Right design views
- Drag-and-drop design elements
- Text customization
- Image upload support
- Fabric.js based 2D design canvas
- Persistent design state across garment views
- Garment color customization
- Save Design functionality
- Add custom design to cart
- 3D garment preview for supported garment types
- Fabric canvas to 3D texture synchronization
- Responsive design interface
- User authentication
- Product catalog
- Shopping cart
- Order management

---

## Current Supported Garments

The current designer supports:

- Crew Neck / Round Neck T-Shirt
- Women's T-Shirt
- Women's Polo
- Hoodie

### 3D Preview

3D preview is currently enabled for:

- Crew Neck / Round Neck T-Shirt

Additional garment models can be added later through the garment model configuration.

---

## Technology Stack

### Frontend

- React
- Vite
- JavaScript / JSX
- Redux
- Tailwind CSS
- Fabric.js
- Three.js
- React Three Fiber
- Drei
- Lucide React

### Backend

- Java
- Spring Boot
- Spring Security
- REST APIs
- JPA / Hibernate

### Database

The backend can be configured with:

- H2 for local development
- PostgreSQL / MySQL for production

---

## Project Structure

```text
MOGREN
│
├── frontend
│   ├── public
│   │   ├── mockups
│   │   └── 3Dmodels
│   │
│   └── src
│       ├── components
│       ├── config
│       ├── constants
│       ├── features
│       ├── hooks
│       ├── utils
│       └── DesignerApp.jsx
│
└── backend
    └── src
        └── main
            ├── java
            └── resources