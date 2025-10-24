type EventHandler<T = any> = (payload: T) => void;

export class EventBus<Events extends Record<string, any>> {
    private listeners = new Map<keyof Events, Set<EventHandler>>();

    public on<K extends keyof Events>(eventName: K, callback: EventHandler<Events[K]>): void {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, new Set());
        }
        this.listeners.get(eventName)!.add(callback as EventHandler<Events[K]>);
    }

    public off<K extends keyof Events>(eventName: K, callback: EventHandler<Events[K]>): void {
        this.listeners.get(eventName)?.delete(callback);
    }

    public emit<K extends keyof Events>(eventName: K, payload: Events[K]): void;
    public emit<K extends keyof Events>(eventName: K): void;
    public emit<K extends keyof Events>(eventName: K, payload?: Events[K]): void {
        this.listeners.get(eventName)?.forEach(handler => {
            try {
                (handler as EventHandler<Events[K]>)(payload!);
            } catch(err) {
                console.error(`Error in event handler for "${String(eventName)}": `, err);
            }
        });
    }

    public addOnce<K extends keyof Events>(eventName: K, callback: EventHandler<Events[K]>): void {
        const wrapper: EventHandler<Events[K]> = (payload) => {
            callback(payload);
            this.off(eventName, wrapper);
        }
        this.on(eventName, wrapper);
    }

    public subscribe<K extends keyof Events>(eventName: K, callback: EventHandler<Events[K]>) {
        this.on(eventName, callback);
        return () => {
            this.off(eventName, callback);
        }
    }
}