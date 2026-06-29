# OBD2 AI Dashboard

A full-stack AI-powered OBD-II diagnostic dashboard built with React, TypeScript, Node.js, Express, SerialPort, and OpenAI.

The app can read live OBD-II data from an OBDLink EX USB adapter, decode vehicle data, display fault codes and live sensor values, and send the scan data to AI for diagnostic analysis.

## Current Features

- React + TypeScript dashboard
- Node/Express backend API
- Live OBD-II data reading through OBDLink EX
- Serial connection through `/dev/ttyUSB0`
- ELM327 command support
- Live data display:
  - RPM
  - Vehicle speed
  - Coolant temperature
  - Intake air temperature
  - Engine load
  - Throttle position
  - MAF
  - Fuel trims
  - O2 sensor voltage
  - Fuel level
  - Barometric pressure
  - Control module voltage
- Fault code reading:
  - Stored codes
  - Pending codes
  - Permanent codes
- VIN reading on supported vehicles
- AI diagnostic analysis using OpenAI
- Driver / technician notes input
- Copyable diagnostic report

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Axios

### Backend

- Node.js
- Express
- TypeScript
- SerialPort
- OpenAI API
- dotenv

## Hardware Tested

- OBDLink EX USB adapter
- Linux Mint
- Adapter detected as `/dev/ttyUSB0`

## Project Status

This is an active prototype.

The current version can read real live OBD-II data from a vehicle and send that data to AI for diagnostic interpretation.