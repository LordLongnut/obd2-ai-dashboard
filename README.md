# OBD2 AI Dashboard / Fleet Blackbox Platform

A full-stack vehicle telemetry project designed to collect OBD2/CAN data, send it to a backend, analyze vehicle health patterns, and display diagnostic insights through a React dashboard.

## Current Features

- React + TypeScript dashboard
- Node/Express backend API
- Live OBD adapter testing with OBDLink EX
- Simulated scan mode for demo/testing
- AI-assisted diagnostic report generation
- Vehicle health display
- DTC display
- Early route structure for fleet telemetry ingestion

## Long-Term Goal

The project is evolving from a diagnostic dashboard into a vehicle blackbox/fleet telemetry platform.

Planned data flow:

```text

Vehicle OBD/CAN data
↓
In-vehicle logger device
↓
Backend ingest API
↓
Database
↓
Parser/anomaly engine
↓
AI report generator
↓
Fleet dashboard