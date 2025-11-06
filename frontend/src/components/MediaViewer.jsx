import { X, ChevronLeft, ChevronRight, Download, Share2, ZoomIn, ZoomOut } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const MediaViewer = ({ media, currentIndex = 0, onClose }) => {
  const [index, setIndex] = useState(currentIndex);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const currentMedia = media[index];
  const isVideo = currentMedia?.type === 'video' || currentMedia?.asset_url?.includes('.mp4');
  const isImage = currentMedia?.type === 'image' || currentMedia?.image_url || currentMedia?.thumb_url;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [index]);

  const handlePrevious = () => {
    if (index > 0) {
      setIndex(index - 1);
      resetZoom();
    }
  };

  const handleNext = () => {
    if (index < media.length - 1) {
      setIndex(index + 1);
      resetZoom();
    }
  };

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 0.5, 0.5));
  };

  const resetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleDownload = async () => {
    try {
      const url = currentMedia.image_url || currentMedia.asset_url;
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `media-${Date.now()}.${isVideo ? 'mp4' : 'jpg'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      toast.success('Download started!');
    } catch (error) {
      toast.error('Failed to download');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Share Media',
          text: currentMedia.title || 'Check out this media!',
          url: currentMedia.image_url || currentMedia.asset_url,
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          toast.error('Failed to share');
        }
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(currentMedia.image_url || currentMedia.asset_url);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleMouseDown = (e) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 z-10">
        <div className="flex items-center justify-between text-white">
          <div>
            <h3 className="font-semibold">{currentMedia.title || 'Media'}</h3>
            <p className="text-sm opacity-70">
              {index + 1} / {media.length}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="btn btn-ghost btn-sm btn-circle text-white hover:bg-white/20"
              title="Download"
            >
              <Download className="size-5" />
            </button>
            <button
              onClick={handleShare}
              className="btn btn-ghost btn-sm btn-circle text-white hover:bg-white/20"
              title="Share"
            >
              <Share2 className="size-5" />
            </button>
            <button
              onClick={onClose}
              className="btn btn-ghost btn-sm btn-circle text-white hover:bg-white/20"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div 
        className="flex-1 flex items-center justify-center relative overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
      >
        {isImage && (
          <img
            src={currentMedia.image_url || currentMedia.thumb_url}
            alt={currentMedia.title || 'Media'}
            className="max-w-full max-h-full object-contain select-none transition-transform"
            style={{
              transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
            }}
            draggable={false}
          />
        )}

        {isVideo && (
          <video
            src={currentMedia.asset_url}
            controls
            autoPlay
            className="max-w-full max-h-full object-contain"
          />
        )}

        {/* Navigation Arrows */}
        {index > 0 && (
          <button
            onClick={handlePrevious}
            className="absolute left-4 btn btn-circle btn-lg bg-black/50 hover:bg-black/70 text-white border-none"
          >
            <ChevronLeft className="size-8" />
          </button>
        )}
        {index < media.length - 1 && (
          <button
            onClick={handleNext}
            className="absolute right-4 btn btn-circle btn-lg bg-black/50 hover:bg-black/70 text-white border-none"
          >
            <ChevronRight className="size-8" />
          </button>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 z-10">
        <div className="flex items-center justify-center gap-4 text-white">
          {isImage && (
            <>
              <button
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
                className="btn btn-ghost btn-sm btn-circle text-white hover:bg-white/20 disabled:opacity-30"
                title="Zoom Out"
              >
                <ZoomOut className="size-5" />
              </button>
              <span className="text-sm font-mono">{Math.round(zoom * 100)}%</span>
              <button
                onClick={handleZoomIn}
                disabled={zoom >= 3}
                className="btn btn-ghost btn-sm btn-circle text-white hover:bg-white/20 disabled:opacity-30"
                title="Zoom In"
              >
                <ZoomIn className="size-5" />
              </button>
              {zoom > 1 && (
                <button
                  onClick={resetZoom}
                  className="btn btn-ghost btn-sm text-white hover:bg-white/20"
                >
                  Reset
                </button>
              )}
            </>
          )}
        </div>

        {/* Thumbnail Strip */}
        {media.length > 1 && (
          <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-hide justify-center">
            {media.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setIndex(idx);
                  resetZoom();
                }}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                  idx === index ? 'border-primary' : 'border-white/30'
                }`}
              >
                {item.type === 'image' || item.image_url ? (
                  <img
                    src={item.thumb_url || item.image_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-base-300 flex items-center justify-center">
                    <span className="text-2xl">🎥</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Caption */}
      {currentMedia.text && (
        <div className="absolute bottom-24 left-0 right-0 p-4 text-center">
          <p className="bg-black/70 text-white px-4 py-2 rounded-full inline-block">
            {currentMedia.text}
          </p>
        </div>
      )}
    </div>
  );
};

export default MediaViewer;
