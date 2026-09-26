import { useData } from '../contexts/DataContext';

const AIEventStream = () => {
  const { aiEvents } = useData();

  if (aiEvents.length === 0) {
    return (
      <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 text-center text-slate-500">
        Waiting for AI reasoning events...
      </div>
    );
  }

  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 h-full flex flex-col">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Live AI Reasoning Stream</h3>
      <div className="flex-1 overflow-y-auto space-y-4 font-mono text-sm">
        {aiEvents.map((event, i) => {
          // Determine color based on message content
          let color = 'text-slate-300';
          if (event.message.includes('baseline') || event.message.includes('returning')) color = 'text-teal-400';
          if (event.message.includes('deviations') || event.message.includes('trend')) color = 'text-amber-400';
          if (event.message.includes('abnormality') || event.message.includes('escalating')) color = 'text-orange-500';
          if (event.message.includes('Critical') || event.message.includes('Alert')) color = 'text-rose-500';

          return (
            <div key={i} className="flex items-start animate-fade-in-up">
              <span className="text-slate-500 w-20 flex-shrink-0">
                {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <span className={`${color} flex-1 pl-4 border-l border-slate-700`}>
                {event.message}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AIEventStream;
