'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-tagline.ts';
import '@/ai/flows/generate-logo.ts';
import '@/ai/flows/generate-brand-details.ts';
import '@/ai/flows/colorize-logo.ts';
import '@/lib/storage';
