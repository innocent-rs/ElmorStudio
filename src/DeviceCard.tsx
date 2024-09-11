import {Device, Group, ItemTypes} from "./model.ts";
import {useDrag} from "react-dnd";

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
            className={`bg-gray-800 rounded-xl shadow-lg p-6 border hover:border-blue-500`}
        >
            <h2 className="text-2xl font-semibold mb-2 text-white">{device.kind}</h2>
            <p className="text-gray-400 mb-4">
                Port: {device.port} <br/>
                Firmware version: 0x{device.firmware}
            </p>
        </div>
    );
}

export default DeviceCard;