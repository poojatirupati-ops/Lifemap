/** A centre-cropped square JPEG of an image file, `size` pixels a side, as a data URL. */
export async function cropSquareJpeg(file: File, size: number): Promise<string> {
  const image = await createImageBitmap(file)
  const side = Math.min(image.width, image.height)
  const left = (image.width - side) / 2
  const top = (image.height - side) / 2
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  canvas.getContext('2d')!.drawImage(image, left, top, side, side, 0, 0, size, size)
  image.close()
  return canvas.toDataURL('image/jpeg', 0.85)
}
