// API endpoint to update check-in data
import type { APIRoute } from 'astro';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { date, userId, isChecked } = body;

    if (!date || !userId) {
      return new Response(JSON.stringify({ success: false, error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Read current data
    const dataPath = join(process.cwd(), 'public', 'data', 'studyRecords.json');
    const currentData = JSON.parse(readFileSync(dataPath, 'utf-8'));

    // Update data
    if (!currentData[date]) {
      currentData[date] = {};
    }

    if (isChecked) {
      currentData[date][userId.toString()] = true;
    } else {
      delete currentData[date][userId.toString()];
      // Remove date if empty
      if (Object.keys(currentData[date]).length === 0) {
        delete currentData[date];
      }
    }

    // Sort dates
    const sortedData = {};
    Object.keys(currentData).sort().forEach(key => {
      sortedData[key] = currentData[key];
    });

    // Write back to file
    writeFileSync(dataPath, JSON.stringify(sortedData, null, 2));

    // Update metadata
    const metadataPath = join(process.cwd(), 'public', 'data', 'metadata.json');
    const metadata = JSON.parse(readFileSync(metadataPath, 'utf-8'));
    metadata.lastUpdated = new Date().toISOString();
    writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating check-in:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
