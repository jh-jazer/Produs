/* eslint-disable */
// DEPRECATED: Connectivity store removed in favor of remote-first architecture.
export default (selector) => {
    const state = { isOnline: true, isSyncing: false, addToQueue: () => {}, offlineQueue: [] };
    return selector ? selector(state) : state;
};
