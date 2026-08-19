# Sam-Recycle-Management-View
A personalized management application developed for Sam-Recycle to replace their existing management software and eliminate recurring subscription costs.

## Architecture

The application consists of two main components:

- **Frontend** — React Native / Expo mobile application
- **Backend** — Node.js REST API connected to an MSSQL database

The frontend communicates with the backend through HTTP requests.

# Tech stack
## Frontend
- React Native / Expo
- Typescript
- SQLite (WIP)

## Backend
- Node JS
- Typescript
- MSSQL

# Features
- Inventory
- Contacts (Suppliers & Buyers)
- Transactions (Purchases & Sales)
- Print transactions
- Expenses

## Get started

1. Configuration

   Create a ".env" file:
   ```
      EXPO_PUBLIC_API_URL=http://[ServerIP]:3000/api
   ```

2. Start the app

   ```bash
   npx expo start
   ```

3. Accessing the app
The app can be accessed either through these methods:
(Compiled app)
- App
(Development)
- Expo Go
- Web

Note: The default port is :8081, configurable using:
```bash
npx expo start --port <port_number>
```

## Useful links
List of builds: https://expo.dev/accounts/vek10316/projects/Sam-Recycle-Inventory-Management-View/builds


## Limitations

This application was developed specifically for internal use by Sam-Recycle.

It is not currently designed for public distribution or large-scale deployment. Supporting multiple businesses or a larger number of concurrent users would require additional development, particularly around authentication, security, scalability, and deployment.

## Project Status

**Maintenance / Internal Use**

The application is currently used internally by Sam Recycle. Further development may be required for major changes or broader deployment. 