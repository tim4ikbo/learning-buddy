"use client"

import { Stage, Layer, Image as KonvaImage, Transformer } from 'react-konva';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useUploadThing } from '@/utils/uploadthing';
// Import removed: utapi is only available server-side
import useImage from 'use-image';
import toast from 'react-hot-toast';
import { useParams } from 'next/navigation';

type ImageWithUrl = {
  url: string;
  width: number;
  height: number;
  x: number;
  y: number;
  rotation?: number;
};

type CanvasState = {
  images: ImageWithUrl[];
  lastModified: number;
};

const PoolImage = ({ url, width, height, x, y, rotation = 0, onDragEnd, onTransform, isSelected, onSelect }: ImageWithUrl & {
  onDragEnd?: (newX: number, newY: number) => void;
  onTransform?: (newProps: Partial<ImageWithUrl>) => void;
  isSelected?: boolean;
  onSelect?: () => void;
}) => {
  const imageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  const [image] = useImage(url);

  useEffect(() => {
    if (isSelected && transformerRef.current && imageRef.current) {
      transformerRef.current.nodes([imageRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <KonvaImage
        ref={imageRef}
        image={image}
        width={width}
        height={height}
        x={x}
        y={y}
        rotation={rotation}
        draggable
        onClick={(e) => {
          e.cancelBubble = true;
          onSelect?.();
        }}
        onTap={(e) => {
          e.cancelBubble = true;
          onSelect?.();
        }}
        onDragEnd={(e) => {
          onDragEnd?.(e.target.x(), e.target.y());
        }}
        onTransformEnd={(e) => {
          const node = e.target;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          node.scaleX(1);
          node.scaleY(1);

          onTransform?.({ 
            width: node.width() * scaleX,
            height: node.height() * scaleY,
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit resize
            const maxWidth = 800;
            const maxHeight = 600;
            const minWidth = 5;
            const minHeight = 5;

            if (
              newBox.width < minWidth ||
              newBox.height < minHeight ||
              newBox.width > maxWidth ||
              newBox.height > maxHeight
            ) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

export interface PoolCanvasProps {}

type Params = {
  id: string;
};

export const PoolCanvas: React.FC<PoolCanvasProps> = () => {
  // State
  const [images, setImages] = useState<ImageWithUrl[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [lastRememberedModified, setLastRememberedModified] = useState<number | null>(null);
  // Hooks
  const params = useParams() as Params;
  const stageRef = useRef<any>(null);
  const { startUpload } = useUploadThing('imageUploader', {
    onUploadProgress: (progress: number) => {
      setUploadProgress(Math.round(progress));
    },
    onUploadBegin: () => {
      setIsUploading(true);
      setUploadProgress(0);
    },
    onClientUploadComplete: (res) => {
      if (!res?.[0]) {
        toast.error('No response from upload server');
        return;
      }
      
      // Process uploaded files immediately
      const processImages = async () => {
        const newImages = await Promise.all(
          res.map(async (file: { url: string }) => {
            return new Promise<ImageWithUrl>((resolve) => {
              const img = new Image();
              img.onload = () => {
                // Calculate dimensions while maintaining aspect ratio
                const maxWidth = stageSize.width * 0.4;
                const maxHeight = stageSize.height * 0.4;
                const scale = Math.min(
                  maxWidth / img.width,
                  maxHeight / img.height
                );

                // Calculate random position within stage bounds
                const x = Math.random() * (stageSize.width - img.width * scale);
                const y = Math.random() * (stageSize.height - img.height * scale);

                resolve({
                  url: file.url,
                  width: img.width * scale,
                  height: img.height * scale,
                  x,
                  y,
                  rotation: 0,
                });
              };
              img.src = file.url;
            });
          })
        );

        setImages(prev => [...prev, ...newImages]);
        await saveCanvasState();
      };

      processImages().catch(console.error);
      setIsUploading(false);
      setUploadProgress(0);
      toast.success(`Successfully uploaded ${res.length} image(s)!`);
    },
    onUploadError: (error: Error) => {
      console.error('Upload error:', error);
      toast.error(error.message || 'Upload failed');
      setIsUploading(false);
      setUploadProgress(0);
    }
  });

  // Update stage size on window resize
  useEffect(() => {
    const updateSize = () => {
      const container = document.getElementById('canvas-container');
      if (container) {
        setStageSize({
          width: container.offsetWidth,
          height: Math.max(600, container.offsetHeight)
        });
      }
    };

    window.addEventListener('resize', updateSize);
    updateSize(); // Initial size

    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Handle keyboard events for delete
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId !== null) {
          try {
            // Extract the file key from the URL
            const url = images[selectedId].url;
            const fileKey = url.split('/f/')[1];
            
            if (!fileKey) {
              throw new Error('Could not extract file key from URL');
            }
            
            // Call the API endpoint to delete the file
            const response = await fetch('/api/uploadthing/delete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ fileKey }),
            });
            
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Failed to delete file');
            }
            
            // Update the UI after successful deletion
            const newImages = images.filter((_, i) => i !== selectedId);
            setImages(newImages);
            setSelectedId(null);
            toast.success('Image deleted');
          } catch (error: any) {
            console.error('Failed to delete image:', error);
            toast.error(error.message || 'Failed to delete image');
          }
        }
      } else if (e.key === 'Escape') {
        setSelectedId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images, selectedId]);


  // Save canvas state
  const saveCanvasState = useCallback(async () => {
    if (!params.id) return;
    
    try {
      // Prevent saving if already in progress
      if (isSaving) return;
      
      // Prevent saving if no images
      if (images.length === 0) return;
      setIsSaving(true);
      // let lastRememberedModified = Date.now();
      const response = await fetch(`/api/pools/${params.id}/canvas`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images,
          lastModified: Date.now(),
        }),
      });

      if (!response.ok) throw new Error('Failed to save canvas');
    } catch (error) {
      console.error('Failed to save canvas state:', error);
      toast.error('Failed to save canvas state');
    } finally {
      setIsSaving(false);
    }
  }, [images, params.id]);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      const serverLastModified = await getLastUpdated(params.id);
      if (serverLastModified === lastRememberedModified) return;

      saveCanvasState();
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [lastRememberedModified]);

  useEffect(() => {
    saveCanvasState();
  }, [images]);

  const getLastUpdated = async (poolId: string) => {
    try {
      const response = await fetch(`/api/pools/${poolId}/canvas`);
      if (!response.ok) return null;
      const data = await response.json() as CanvasState;
      return data.lastModified;
    } catch (error) {
      console.error('Failed to get last updated time:', error);
      return null;
    }
  };

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!params.id) {
      toast.error('Invalid pool ID');
      return;
    }

    const files = Array.from(e.target.files || []) as File[];
    if (!files.length) return;

    // Reset file input and prevent default behavior
    e.preventDefault();
    e.target.value = '';

    // Validate file types and sizes
    const MAX_SIZE = 4 * 1024 * 1024; // 4MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    const validationErrors = files.reduce((errors, file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push(`${file.name} is not a supported image type`);
      }
      if (file.size > MAX_SIZE) {
        errors.push(`${file.name} exceeds the 4MB size limit`);
      }
      return errors;
    }, [] as string[]);

    if (validationErrors.length > 0) {
      toast.error(
        validationErrors.length === 1
          ? validationErrors[0]
          : `Multiple files have errors:\n${validationErrors.join('\n')}`
      );
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Show upload starting toast
      const uploadingToast = toast.loading(
        `Uploading ${files.length} image${files.length > 1 ? 's' : ''}...`
      );

      console.log('Starting upload for pool:', params.id);
      const startTime = Date.now();
      
      // Start upload and let onClientUploadComplete handle the response
      await startUpload(files, {
        poolId: params.id
      });
      
      const uploadTime = Date.now() - startTime;
      console.log('Upload completed in', uploadTime, 'ms');
      
      // Dismiss uploading toast
      toast.dismiss(uploadingToast);

      // File processing is now handled in onClientUploadComplete

      // Save canvas state
      await saveCanvasState();
    } catch (error: any) {
      console.error('Upload error:', error);
      let errorMessage = 'Failed to upload images.';
      
      if (error?.message?.includes('sign in')) {
        errorMessage = 'Please sign in to upload images.';
      } else if (error?.message?.includes('access to this pool')) {
        errorMessage = 'You do not have access to this pool.';
      } else if (error?.message?.includes('save file information')) {
        errorMessage = 'Failed to save file information. Please try again.';
      } else if (error?.message?.includes('LIMIT_FILE_SIZE')) {
        errorMessage = 'File too large. Maximum size is 4MB.';
      } else if (error?.message?.includes('INVALID_FILE_TYPE')) {
        errorMessage = 'Invalid file type. Please upload only images.';
      } else if (error?.message?.includes('server response')) {
        errorMessage = 'Upload failed due to server error. Please try again.';
      } else if (error.name === 'NetworkError' || !navigator.onLine) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      toast.error(errorMessage);
      console.log('Upload failed:', error);
    } finally {
      // Reset upload state after a short delay to show final progress
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  }, [startUpload, params.id, saveCanvasState]);

  // Load initial canvas state
  useEffect(() => {
    if (!params.id) return;

    const loadCanvasState = async () => {
      try {
        const response = await fetch(`/api/pools/${params.id}/canvas`);
        if (!response.ok) return;

        const data = await response.json() as CanvasState;
        setImages(data.images);
      } catch (error) {
        console.error('Failed to load canvas state:', error);
      }
    };

    loadCanvasState();
  }, [params.id]);

  

  // Early return if no pool ID
  if (!params.id) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-6xl mx-auto p-4">
      {/* Upload progress indicator */}
      {isUploading && (
        <div className="flex flex-col gap-2">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 text-center">
            Uploading... {uploadProgress}%
            {uploadProgress === 100 && ' (Processing...)'}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div 
          className={`relative rounded-lg border-2 ${isUploading ? 'border-blue-400' : 'border-dashed border-gray-300'} p-8 transition-all duration-200 ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-blue-400 hover:bg-blue-50'}`}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!isUploading) {
              e.currentTarget.classList.add('border-blue-400', 'bg-blue-50');
            }
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!isUploading) {
              e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
            }
          }}
        >
          <div className="flex flex-col items-center gap-4">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              disabled={isUploading}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="text-sm text-gray-500">
              or drag and drop your images here
            </p>
          </div>
          {isUploading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/50">
              <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-300 ease-in-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <div className="text-sm text-blue-600">
                Uploading... {Math.round(uploadProgress)}%
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <p>Tip: Click an image to select it, then:</p>
          <ul className="flex gap-4">
            <li>• Press Delete to remove</li>
            <li>• Drag corners to resize</li>
            <li>• Drag edges to rotate</li>
          </ul>
        </div>
      </div>
      <div id="canvas-container" className="w-full min-h-[600px] relative bg-gray-50 p-4 rounded-lg shadow-sm">
        <Stage 
          ref={stageRef}
          width={stageSize.width} 
          height={stageSize.height}
          style={{ 
            border: '1px solid #ddd',
            background: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
          }}
          onClick={(e: any) => {
            // Deselect when clicking on the stage background
            if (e.target === e.target.getStage()) {
              setSelectedId(null);
            }
          }}
        >
        <Layer>
          {images.map((image, i) => (
            <PoolImage 
              key={i} 
              {...image} 
              isSelected={selectedId === i}
              onSelect={() => setSelectedId(i)}
              onDragEnd={(newX, newY) => {
                const newImages = [...images];
                newImages[i] = { ...image, x: newX, y: newY };
                setImages(newImages);
              }}
              onTransform={(newProps) => {
                const newImages = [...images];
                newImages[i] = { ...image, ...newProps };
                setImages(newImages);
              }}
            />
          ))}
        </Layer>
        </Stage>
      </div>
    </div>
  );
};