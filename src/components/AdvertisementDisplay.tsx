import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface AdvertisementDisplayProps {
  advertisement: {
    _id: string;
    title: string;
    description: string;
    content: string;
    imageUrl?: string;
    videoUrl?: string;
    navigationUrl?: string;
    displayType: 'fullscreen' | 'footer' | 'mid_screen' | 'search_card';
  };
  onClose: () => void;
  onTrack: (action: 'impression' | 'click' | 'close') => void;
  userLocation?: { lat: number; lng: number };
  userDevice?: 'android' | 'ios' | 'web';
}

const AdvertisementDisplay: React.FC<AdvertisementDisplayProps> = ({
  advertisement,
  onClose,
  onTrack,
  userLocation,
  userDevice
}) => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    // Track impression when component mounts
    onTrack('impression');
    
    // Auto-hide controls for video after 3 seconds
    if (advertisement.videoUrl) {
      const timer = setTimeout(() => setShowControls(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [advertisement.videoUrl, onTrack]);

  const handleClick = () => {
    onTrack('click');
    if (advertisement.navigationUrl) {
      window.open(advertisement.navigationUrl, '_blank');
    }
  };

  const handleClose = () => {
    onTrack('close');
    onClose();
  };

  const toggleVideo = () => {
    setIsVideoPlaying(!isVideoPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const renderContent = () => {
    if (advertisement.videoUrl) {
      return (
        <div className="relative">
          <video
            className="w-full h-full object-cover"
            autoPlay={isVideoPlaying}
            muted={isMuted}
            loop
            onClick={toggleVideo}
          >
            <source src={advertisement.videoUrl} type="video/mp4" />
            Tu navegador no soporta videos.
          </video>
          
          {showControls && (
            <div className="absolute bottom-4 left-4 flex space-x-2">
              <button
                onClick={toggleVideo}
                className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75"
              >
                {isVideoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                onClick={toggleMute}
                className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>
      );
    }

    if (advertisement.imageUrl) {
      return (
        <img
          src={advertisement.imageUrl}
          alt={advertisement.title}
          className="w-full h-full object-cover"
        />
      );
    }

    return (
      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-white text-center p-8">
          <h3 className="text-2xl font-bold mb-4">{advertisement.title}</h3>
          <p className="text-lg">{advertisement.description}</p>
        </div>
      </div>
    );
  };

  const renderByType = () => {
    switch (advertisement.displayType) {
      case 'fullscreen':
        return (
          <div className="fixed inset-0 bg-black z-50">
            <div className="relative w-full h-full">
              {renderContent()}
              
              <div className="absolute top-4 right-4 flex space-x-2">
                <button
                  onClick={handleClick}
                  className="px-4 py-2 bg-[#FFC300] text-white rounded-lg hover:bg-[#E6B000] flex items-center space-x-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Ver más</span>
                </button>
                <button
                  onClick={handleClose}
                  className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="absolute bottom-4 left-4 right-4">
                <h2 className="text-white text-xl font-bold mb-2">{advertisement.title}</h2>
                <p className="text-white text-sm opacity-90">{advertisement.description}</p>
              </div>
            </div>
          </div>
        );

      case 'mid_screen':
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
              <div className="relative">
                <div className="h-64">
                  {renderContent()}
                </div>
                
                <div className="absolute top-4 right-4">
                  <button
                    onClick={handleClose}
                    className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <h2 className="text-xl font-bold mb-2">{advertisement.title}</h2>
                <p className="text-gray-600 mb-4">{advertisement.description}</p>
                <button
                  onClick={handleClick}
                  className="w-full px-4 py-2 bg-[#FFC300] text-white rounded-lg hover:bg-[#E6B000] flex items-center justify-center space-x-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Ver más</span>
                </button>
              </div>
            </div>
          </div>
        );

      case 'footer':
        return (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
            <div className="flex items-center p-4">
              <div className="flex-1">
                <h3 className="font-semibold text-sm">{advertisement.title}</h3>
                <p className="text-xs text-gray-600">{advertisement.description}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleClick}
                  className="px-3 py-1 bg-[#FFC300] text-white text-xs rounded hover:bg-[#E6B000]"
                >
                  Ver
                </button>
                <button
                  onClick={handleClose}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );

      case 'search_card':
        return (
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <div className="relative">
              <div className="h-48">
                {renderContent()}
              </div>
              
              <div className="absolute top-2 right-2">
                <button
                  onClick={handleClose}
                  className="p-1 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-sm mb-1">{advertisement.title}</h3>
              <p className="text-xs text-gray-600 mb-3">{advertisement.description}</p>
              <button
                onClick={handleClick}
                className="w-full px-3 py-2 bg-[#FFC300] text-white text-sm rounded hover:bg-[#E6B000] flex items-center justify-center space-x-1"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Ver más</span>
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return renderByType();
};

export default AdvertisementDisplay;
