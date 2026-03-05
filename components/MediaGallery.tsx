'use client';

import { Video, Mic, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { Property } from '@/lib/types';
import { Button } from '@/components/ui/button';

interface MediaGalleryProps {
  property: Property;
}

export function MediaGallery({ property }: MediaGalleryProps) {
  const { media } = property;

  const hasVideo = media.videoUrl && media.videoUrl.trim() !== '';
  const hasAudio = media.audioUrls && media.audioUrls.length > 0 && media.audioUrls[0].trim() !== '';
  const hasPhotos = media.photoUrls && media.photoUrls.length > 0 && media.photoUrls[0].trim() !== '';

  if (!hasVideo && !hasAudio && !hasPhotos) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">الوسائط المتعددة</h3>

      <div className="space-y-4">
        {/* Video */}
        {hasVideo && (
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <Video className="h-5 w-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-gray-900 mb-1">فيديو</p>
              <a
                href={media.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                مشاهدة الفيديو
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        )}

        {/* Audio */}
        {hasAudio && (
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <Mic className="h-5 w-5 text-purple-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-gray-900 mb-2">تسجيلات صوتية</p>
              <div className="space-y-2">
                {media.audioUrls.map((url, index) => (
                  url.trim() && (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      تسجيل {index + 1}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Photos */}
        {hasPhotos && (
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <ImageIcon className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-gray-900 mb-2">الصور ({media.photoUrls.length})</p>
              <div className="grid grid-cols-2 gap-2">
                {media.photoUrls.map((url, index) => (
                  url.trim() && (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      صورة {index + 1}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
