const ItemTypes = {
    DEVICE: 'device',
};
interface Group {
    id: number;
    name: string;
    devices: Device[];
    is_locked: boolean;
}

interface Device {
    id: number;
    kind: string;
    port: String;
    is_open: boolean;
    firmware: number;
    isLocked: boolean;
}

export { ItemTypes };
export type { Device, Group };