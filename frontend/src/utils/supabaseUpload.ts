export interface SupabaseUploadParams {
  signedUrl: string;
  path: string;
  publicUrl: string;
}

export interface SupabaseUploadResult {
  url: string;
  publicId: string;
}

export const uploadToSupabase = async (
  file: File,
  params: SupabaseUploadParams
): Promise<SupabaseUploadResult> => {
  const res = await fetch(params.signedUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  });

  if (!res.ok) {
    throw new Error('Supabase upload failed');
  }

  return { url: params.publicUrl, publicId: params.path };
};
