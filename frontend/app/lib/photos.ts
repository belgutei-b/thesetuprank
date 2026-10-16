// TODO: use the setup's own photos once multi-image upload is supported.
// Until then every setup shows its one image three times, so the photo
// browsing UI can be tried out
export function photosOf(imageUrl: string) {
  return [imageUrl, imageUrl, imageUrl];
}
