import { MapPin } from 'lucide-react';
import { useData } from '../contexts/DataContext';

const MapView = () => {
  const { sources, activeSource, setActiveSource } = useData();

  // Mock coordinates for demo
  const mockCoords: any = {
      'source-north': { top: '30%', left: '40%' },
      'source-east': { top: '50%', left: '70%' },
      'source-south': { top: '70%', left: '45%' },
      'source-west': { top: '40%', left: '20%' },
  };

  return (
    <div className="space-y-6 h-[calc(100vh-120px)] flex flex-col">
      <div className="mb-2 flex-shrink-0">
        <h1 className="text-2xl font-bold text-slate-800">Source Map</h1>
      </div>

      <div className="bg-slate-100 flex-1 rounded-2xl border border-slate-200 shadow-inner relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
        {sources.map(source => {
            const isSelected = activeSource?.id === source.id;
            const coords = mockCoords[source.id] || { top: '50%', left: '50%' };
            const isAlert = source.safety_score < 50;
            return (
                <div 
                    key={source.id} 
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                    style={{ top: coords.top, left: coords.left }}
                    onClick={() => setActiveSource(source)}
                >
                    <div className={`relative z-10 p-2 rounded-full shadow-lg transition-transform ${isSelected ? 'scale-125 ring-4 ring-indigo-300' : 'hover:scale-110'} ${isAlert ? 'bg-rose-500 text-white animate-pulse' : 'bg-teal-500 text-white'}`}>
                        <MapPin size={24} />
                    </div>
                    {isSelected && (
                        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-white p-3 rounded-lg shadow-xl border border-slate-200 w-48 z-20 pointer-events-none">
                            <h4 className="font-bold text-sm text-slate-800 truncate">{source.name}</h4>
                            <div className="flex justify-between mt-2 text-xs">
                                <span className="text-slate-500">Safety:</span>
                                <span className={`font-bold ${isAlert ? 'text-rose-600' : 'text-teal-600'}`}>{source.safety_score.toFixed(0)}</span>
                            </div>
                            <div className="flex justify-between mt-1 text-xs">
                                <span className="text-slate-500">Trend:</span>
                                <span className="font-medium text-slate-700">{source.trend}</span>
                            </div>
                        </div>
                    )}
                </div>
            )
        })}
      </div>
    </div>
  );
};

export default MapView;
