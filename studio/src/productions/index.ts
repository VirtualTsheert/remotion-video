import type { Production } from "../storyboard/types";
import { systemCheck } from "./system-check/storyboard";

// Daftarkan setiap produksi di sini agar muncul di Studio dan bisa dirender.
export const PRODUCTIONS: Production[] = [systemCheck];
