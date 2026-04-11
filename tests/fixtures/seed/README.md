# Bootstrap Seed Configuration

This directory contains fixture documents for the Raino ingestion pipeline bootstrap run.

## Purpose

These fixtures simulate official engineering documents for testing the ingestion pipeline
when live document fetching is not available (no API keys, offline development, CI).

## Structure

Each fixture document represents a truncated but realistic engineering document section
for a specific part family in the bootstrap seed.

## Families Covered

- STM32F4 (STMicroelectronics MCU)
- ESP32-S3 (Espressif WiFi/BLE MCU)
- LM7805 (TI Linear Regulator)
- USB-C Connector (Amphenol)
- PRTR5V0U2X (NXP ESD Protection)
- ABM8 Crystal (Abracon)

## Labeling

All fixture data is clearly labeled as `isEstimate: true` and `trustLevel: 'fixture'`.
These are NOT canonical manufacturer documents.
