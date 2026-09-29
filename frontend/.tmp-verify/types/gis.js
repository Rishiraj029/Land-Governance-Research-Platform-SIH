"use strict";
/**
 * GIS types for PAGE 7 — GIS Map Explorer
 *
 * These mirror the columns of the live `public.gis_features` table:
 *   id, name, state, district, category, theme, latitude, longitude,
 *   description, dataset_name, created_at
 *
 * Records are loaded at runtime from Supabase (see lib/supabaseGis.ts).
 * `category`/`theme` are plain strings because the values come from the database
 * rather than a fixed frontend union.
 */
Object.defineProperty(exports, "__esModule", { value: true });
