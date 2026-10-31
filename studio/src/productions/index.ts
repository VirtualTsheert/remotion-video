import type { Production } from "../storyboard/types";
import { systemCheck } from "./system-check/storyboard";
import { lab } from "../lab/storyboard";
import { foodEstate } from "./food-estate/storyboard";
import { lebah } from "./lebah/storyboard";
import { kucingLab } from "./kucing/lab";
import { kucing } from "./kucing/storyboard";

// Daftarkan setiap produksi di sini agar muncul di Studio dan bisa dirender.
export const PRODUCTIONS: Production[] = [kucing, kucingLab, lebah, foodEstate, systemCheck, lab];
