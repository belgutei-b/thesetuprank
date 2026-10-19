import { useEffect, useRef, useState, type DragEvent } from "react";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "~/components/ui/button";

export const MAX_PHOTOS = 4;
const MAX_FILE_SIZE_MB = 10;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

type Photo = {
  id: string;
  file: File;
  previewUrl: string;
};

type Props = {
  // called with the files in display order whenever they change
  onChange: (files: File[]) => void;
};

// Pick up to 4 photos and put them in order with the arrow buttons.
// The first photo is the cover (shown first in battles)
export default function PhotoPicker({ onChange }: Props) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Free the preview URLs when leaving the page
  const photosRef = useRef(photos);
  useEffect(() => {
    photosRef.current = photos;
  });
  useEffect(
    () => () =>
      photosRef.current.forEach((p) => URL.revokeObjectURL(p.previewUrl)),
    [],
  );

  function update(next: Photo[]) {
    setPhotos(next);
    onChange(next.map((p) => p.file));
  }

  function addFiles(files: File[]) {
    const added: Photo[] = [];
    for (const file of files) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        toast.error(`${file.name}: only JPG, PNG or WebP images are allowed.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        toast.error(`${file.name} is over ${MAX_FILE_SIZE_MB}MB.`);
        continue;
      }
      if (photos.length + added.length >= MAX_PHOTOS) {
        toast.error(`You can add up to ${MAX_PHOTOS} photos.`);
        break;
      }
      added.push({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }
    if (added.length > 0) update([...photos, ...added]);
  }

  function remove(index: number) {
    URL.revokeObjectURL(photos[index].previewUrl);
    update(photos.filter((_, i) => i !== index));
  }

  function move(from: number, to: number) {
    if (from === to || to < 0 || to >= photos.length) return;
    const next = [...photos];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    update(next);
  }

  // Files dragged in from the computer
  function isFileDrag(e: DragEvent) {
    return e.dataTransfer.types.includes("Files");
  }

  function handleDragOver(e: DragEvent) {
    if (!isFileDrag(e)) return;
    e.preventDefault();
    setIsDraggingFiles(true);
  }

  function handleDragLeave(e: DragEvent) {
    // ignore moving between children of the drop area
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
    setIsDraggingFiles(false);
  }

  function handleDrop(e: DragEvent) {
    if (!isFileDrag(e)) return;
    e.preventDefault();
    setIsDraggingFiles(false);
    addFiles(Array.from(e.dataTransfer.files));
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  const isFull = photos.length >= MAX_PHOTOS;

  return (
    <div
      className="flex flex-col gap-2"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex justify-between">
        <span className="text-xs uppercase tracking-widest text-muted">
          Photos
        </span>
        <span className="text-xs text-muted">
          {photos.length}/{MAX_PHOTOS}
        </span>
      </div>

      {photos.length === 0 ? (
        <button
          type="button"
          onClick={openFilePicker}
          className={`flex h-40 cursor-pointer flex-col items-center justify-center border border-dashed transition-colors ${isDraggingFiles ? "border-accent bg-surface" : "border-line-strong"
            }`}
        >
          <span className="text-xs uppercase tracking-widest text-text">
            Drag & Drop or Click
          </span>
          <span className="mt-1 text-xs uppercase tracking-widest text-muted">
            Up to {MAX_PHOTOS} photos · JPG, PNG, WebP · Max{" "}
            {MAX_FILE_SIZE_MB}MB each
          </span>
        </button>
      ) : (
        <>
          <ol className="grid grid-cols-2 gap-3">
            {photos.map((photo, i) => (
              <li
                key={photo.id}
                className="relative aspect-square overflow-hidden rounded-xs bg-surface"
              >
                {/* Whole photo, not cropped: the server keeps its shape, and
                    the site shows it the same way (PhotoStage).
                    Not draggable, or dropping it on the picker would add it
                    again as a new file */}
                <img
                  src={photo.previewUrl}
                  alt={`Photo ${i + 1}`}
                  draggable={false}
                  className="h-full w-full object-contain"
                />

                <span className="pointer-events-none absolute left-1.5 top-1.5 bg-black/75 px-1.5 py-0.5 text-[10px] uppercase tracking-[1.5px] text-text">
                  {i === 0 ? "Cover" : i + 1}
                </span>

                <Button
                  variant="overlay"
                  size="icon-sm"
                  onClick={() => remove(i)}
                  aria-label={`Remove photo ${i + 1}`}
                  className="absolute right-1.5 top-1.5"
                >
                  <X size={16} />
                </Button>
                <Button
                  variant="overlay"
                  size="icon-sm"
                  onClick={() => move(i, i - 1)}
                  disabled={i === 0}
                  aria-label={`Move photo ${i + 1} earlier`}
                  className="absolute bottom-1.5 left-1.5"
                >
                  <ChevronLeft size={16} />
                </Button>
                <Button
                  variant="overlay"
                  size="icon-sm"
                  onClick={() => move(i, i + 1)}
                  disabled={i === photos.length - 1}
                  aria-label={`Move photo ${i + 1} later`}
                  className="absolute bottom-1.5 right-1.5"
                >
                  <ChevronRight size={16} />
                </Button>
              </li>
            ))}

            {!isFull && (
              <li>
                <button
                  type="button"
                  onClick={openFilePicker}
                  className={`flex aspect-square w-full cursor-pointer flex-col items-center justify-center gap-1.5 border border-dashed text-xs uppercase tracking-widest transition-colors ${isDraggingFiles
                      ? "border-accent bg-surface text-text"
                      : "border-line-strong text-muted hover:text-text"
                    }`}
                >
                  <Plus size={18} />
                  Add photo
                </button>
              </li>
            )}
          </ol>
          <p className="text-xs text-muted">
            Upload up to 4 images. 10MB limit on each image.
          </p>
        </>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ALLOWED_IMAGE_TYPES.join(",")}
        className="hidden"
        onChange={(e) => {
          addFiles(Array.from(e.target.files ?? []));
          // so picking the same file again (after removing it) still works
          e.target.value = "";
        }}
      />
    </div>
  );
}
