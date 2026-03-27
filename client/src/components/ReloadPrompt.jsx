import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { AnimatePresence, motion } from 'framer-motion';

function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  return (
    <AnimatePresence>
      {(offlineReady || needRefresh) && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-6 left-6 z-[9999] bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-4 flex flex-col gap-3 max-w-sm w-[calc(100%-3rem)]"
        >
          <div className="flex items-start gap-3">
            <div className="size-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">
                {offlineReady ? 'cloud_done' : 'update'}
              </span>
            </div>
            <div className="flex-1 pt-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {offlineReady ? 'App ready to work offline' : 'New version available'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {offlineReady
                  ? 'The app is cached for offline use.'
                  : 'A new version of Produs is available. Refresh to update.'}
              </p>
            </div>
          </div>

          <div className="flex gap-2 mt-2">
            {needRefresh && (
              <button
                onClick={() => updateServiceWorker(true)}
                className="flex-1 py-2 px-4 bg-black dark:bg-white text-white dark:text-black text-xs font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
              >
                Reload
              </button>
            )}
            <button
              onClick={close}
              className="flex-1 py-2 px-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ReloadPrompt;
