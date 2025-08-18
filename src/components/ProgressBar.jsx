import React from 'react';

const ProgressBar = ({ progress }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'generating': return 'bg-blue-500';
      case 'complete': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  const getStatusText = (status, progressValue) => {
    switch (status) {
      case 'generating': return `${progressValue}%`;
      case 'complete': return '✓';
      case 'error': return '✗';
      default: return '...';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => {
          const item = progress[num] || { status: 'pending', progress: 0 };
          
          return (
            <div key={num} className="text-center">
              <div className="relative mb-2">
                <div className="w-16 h-16 mx-auto rounded-xl bg-gray-200 flex items-center justify-center relative overflow-hidden">
                  {/* Progress background */}
                  <div 
                    className={`absolute inset-0 ${getStatusColor(item.status)} transition-all duration-300 opacity-20`}
                    style={{ 
                      height: item.status === 'generating' ? `${item.progress}%` : item.status === 'complete' ? '100%' : '0%',
                      bottom: 0,
                      top: 'auto'
                    }}
                  />
                  
                  {/* Number/Status */}
                  <div className={`relative z-10 font-bold ${
                    item.status === 'complete' ? 'text-green-600' : 
                    item.status === 'error' ? 'text-red-600' :
                    item.status === 'generating' ? 'text-blue-600' :
                    'text-gray-500'
                  }`}>
                    {item.status === 'complete' || item.status === 'error' 
                      ? getStatusText(item.status) 
                      : num}
                  </div>
                  
                  {/* Loading spinner for generating */}
                  {item.status === 'generating' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-xs text-gray-600">
                {item.status === 'generating' && `${item.progress}%`}
                {item.status === 'complete' && 'Done!'}
                {item.status === 'error' && 'Error'}
                {item.status === 'pending' && 'Waiting...'}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Overall progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Overall Progress</span>
          <span>
            {Object.values(progress).filter(p => p.status === 'complete').length} / 9 Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
            style={{ 
              width: `${(Object.values(progress).filter(p => p.status === 'complete').length / 9) * 100}%` 
            }}
          />
        </div>
      </div>
      
      <div className="text-center text-sm text-gray-500">
        {Object.values(progress).every(p => p.status === 'complete') 
          ? '🎉 All images generated successfully!' 
          : 'Creating your dream bedroom variations...'
        }
      </div>
    </div>
  );
};

export default ProgressBar;
