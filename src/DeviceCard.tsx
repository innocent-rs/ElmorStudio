import {Device, Group, ItemTypes} from "./model.ts";
import {useDrag} from "react-dnd";
import clsx from "clsx";
import { PowerIcon} from "@heroicons/react/24/solid";

function DeviceCard({device, group}: {
    device: Device;
    group: Group;
}) {
    // Drag functionality
    const [, drag] = useDrag(() => ({
        type: ItemTypes.DEVICE,
        canDrag: () => !group.is_locked,
        item: {deviceId: device.id, sourceGroupId: group.id},
    }), [group]);

    return (
        <div
            ref={(node) => drag((node))} // Combine drag and drop refs
            className={clsx(
                'bg-gray-800 rounded-xl shadow-lg p-6 border hover:border-blue-500',
                {
                    'animate-blink': device.is_open,
                    'border-red-600': !device.is_open,
                }
            )}
        >
            <h2 className="text-2xl font-semibold mb-2 text-white">{device.kind}</h2>
            <p className="text-gray-400 mb-4">
                Port: {device.port} <br/>
                Firmware version: 0x{device.firmware}
            </p>
            <PowerIcon className={clsx(
                'w-6 bottom-4 left-4',
                {
                    'text-green-500 hover:text-gray-200': !device.is_open && group.id == 0,
                    'text-red-500  hover:text-gray-200': device.is_open && group.id == 0,
                    'text-gray-500': group.id !== 0,
                }
            )} />
        </div>
    );
}

export default DeviceCard;