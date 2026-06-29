import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

type ScanSource = "simulated" | "live" | null;

type SavedScanRecord = {
  id: string;
  createdAt: string;
  scanSource: ScanSource;
  symptoms: string;
  scan: unknown;
  diagnosis: unknown;
};

type CreateScanRecordInput = {
  scanSource: ScanSource;
  symptoms?: string;
  scan: unknown;
  diagnosis: unknown;
};

const storageDir = path.resolve(process.cwd(), "storage");
const storageFile = path.join(storageDir, "scan-history.json");

async function ensureStorageFile() {
  await fs.mkdir(storageDir, { recursive: true });

  try {
    await fs.access(storageFile);
  } catch {
    await fs.writeFile(storageFile, "[]", "utf8");
  }
}

async function readRecords(): Promise<SavedScanRecord[]> {
  await ensureStorageFile();

  const raw = await fs.readFile(storageFile, "utf8");
  return JSON.parse(raw) as SavedScanRecord[];
}

async function writeRecords(records: SavedScanRecord[]) {
  await ensureStorageFile();
  await fs.writeFile(storageFile, JSON.stringify(records, null, 2), "utf8");
}

export async function createScanRecord(
  input: CreateScanRecordInput
): Promise<SavedScanRecord> {
  const records = await readRecords();

  const record: SavedScanRecord = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    scanSource: input.scanSource,
    symptoms: input.symptoms?.trim() || "",
    scan: input.scan,
    diagnosis: input.diagnosis
  };

  records.unshift(record);

  await writeRecords(records);

  return record;
}

export async function getScanRecords(): Promise<SavedScanRecord[]> {
  return readRecords();
}

export async function getScanRecordById(
  id: string
): Promise<SavedScanRecord | null> {
  const records = await readRecords();
  return records.find((record) => record.id === id) || null;
}
