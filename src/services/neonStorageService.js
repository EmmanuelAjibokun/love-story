/**
 * Neon Object Storage Service
 * Handles uploading wedding photos and video clips to the Neon Object Storage 'assets' bucket
 * and associating them with story slides in Neon Postgres.
 */

export async function uploadToNeonStorage(file, slideId = null) {
  // Convert file to base64
  const base64Data = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  const response = await fetch('/api/storage/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fileName: file.name,
      fileType: file.type,
      dataBase64: base64Data,
      slideId: slideId ? Number(slideId) : null,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Upload failed with status ${response.status}`);
  }

  const result = await response.json();
  return result; // contains { success, key, url, bucket, slideId }
}

export async function listNeonStorageFiles() {
  const response = await fetch('/api/storage/files');
  if (!response.ok) {
    throw new Error(`Failed to list files with status ${response.status}`);
  }
  return await response.json();
}
